from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from image_gen import (
    STATIC_DIR,
    generate_missing_images,
    generate_product_image,
)


# Mongo
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# App
app = FastAPI(title="Torciblox API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")
JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 12  # 12h

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("torciblox")


# ===== Helpers =====
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


# ===== Models =====
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    description: str = ""
    price_cents: int
    category: str
    category_label: str
    image_url: Optional[str] = None
    active: bool = True
    sort: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductIn(BaseModel):
    name: str
    description: str = ""
    price_cents: int
    category: str
    category_label: str
    image_url: Optional[str] = None
    active: bool = True
    sort: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    category: Optional[str] = None
    category_label: Optional[str] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None
    sort: Optional[int] = None


class OrderItemIn(BaseModel):
    product_id: str
    quantity: int = 1


class OrderIn(BaseModel):
    customer_name: str
    customer_contact: str  # WhatsApp or Discord
    notes: Optional[str] = ""
    items: List[OrderItemIn]


class OrderItem(BaseModel):
    product_id: str
    name: str
    price_cents: int
    quantity: int


class Order(BaseModel):
    id: str
    code: str
    customer_name: str
    customer_contact: str
    notes: str = ""
    items: List[OrderItem]
    subtotal_cents: int
    status: str = "pending"
    created_at: str


# ===== Routes =====
@api.get("/")
async def root():
    return {"ok": True, "app": "Torciblox"}


@api.get("/config")
async def public_config():
    return {
        "whatsapp": os.environ.get("WHATSAPP_NUMBER", ""),
        "discord": os.environ.get("DISCORD_URL", ""),
        "pix_key": os.environ.get("PIX_KEY", ""),
        "pix_key_type": os.environ.get("PIX_KEY_TYPE", ""),
        "pix_receiver": os.environ.get("PIX_RECEIVER_NAME", ""),
    }


# --- Auth ---
@api.post("/auth/login")
async def login(data: LoginIn):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
        },
    }


@api.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_admin)):
    return current


# --- Products ---
@api.get("/products")
async def list_products(category: Optional[str] = None, active_only: bool = True):
    q = {}
    if category:
        q["category"] = category
    if active_only:
        q["active"] = True
    docs = await db.products.find(q, {"_id": 0}).sort([("sort", 1), ("created_at", 1)]).to_list(1000)
    return docs


@api.post("/products", response_model=Product)
async def create_product(data: ProductIn, _=Depends(get_current_admin)):
    slug = data.name.lower().replace(" ", "-")[:60] + "-" + uuid.uuid4().hex[:6]
    prod = Product(slug=slug, **data.model_dump())
    doc = prod.model_dump()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return prod


@api.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, data: ProductUpdate, _=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.products.update_one({"id": product_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    return doc


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, _=Depends(get_current_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --- Orders ---
def gen_order_code() -> str:
    return "TBX-" + uuid.uuid4().hex[:6].upper()


@api.post("/orders")
async def create_order(data: OrderIn):
    if not data.items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")
    ids = [i.product_id for i in data.items]
    products = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
    pmap = {p["id"]: p for p in products}
    items_out = []
    subtotal = 0
    for it in data.items:
        p = pmap.get(it.product_id)
        if not p:
            raise HTTPException(status_code=400, detail=f"Produto inválido: {it.product_id}")
        qty = max(1, int(it.quantity))
        line = p["price_cents"] * qty
        subtotal += line
        items_out.append({
            "product_id": p["id"],
            "name": p["name"],
            "price_cents": p["price_cents"],
            "quantity": qty,
        })
    order = {
        "id": str(uuid.uuid4()),
        "code": gen_order_code(),
        "customer_name": data.customer_name.strip(),
        "customer_contact": data.customer_contact.strip(),
        "notes": (data.notes or "").strip(),
        "items": items_out,
        "subtotal_cents": subtotal,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(dict(order))
    order.pop("_id", None)
    return order


@api.get("/orders")
async def list_orders(_=Depends(get_current_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: dict, _=Depends(get_current_admin)):
    status = payload.get("status")
    if status not in {"pending", "paid", "cancelled", "delivered"}:
        raise HTTPException(status_code=400, detail="Status inválido")
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --- Image generation (admin) ---
@api.post("/admin/generate-images")
async def admin_generate_images(background: BackgroundTasks, _=Depends(get_current_admin)):
    background.add_task(generate_missing_images, db)
    return {"ok": True, "message": "Geração iniciada em segundo plano"}


@api.post("/admin/products/{product_id}/regenerate-image")
async def admin_regenerate_image(product_id: str, _=Depends(get_current_admin)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    url = await generate_product_image(product)
    if not url:
        raise HTTPException(status_code=500, detail="Falha ao gerar imagem")
    await db.products.update_one({"id": product_id}, {"$set": {"image_url": url}})
    return {"ok": True, "image_url": url}


app.include_router(api)

# Serve generated product images
app.mount("/api/static/products", StaticFiles(directory=str(STATIC_DIR)), name="product-images")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Startup seeding =====
SEED_PRODUCTS = [
    # SERVIÇOS
    ("servicos", "Serviços", "Criar torcida personalizada", 4000, 10),
    ("servicos", "Serviços", "Assumir torcida existente", 500, 20),
    ("servicos", "Serviços", "Criar qualquer polícia", 3500, 30),
    ("servicos", "Serviços", "Criar servidor Discord", 700, 40),
    ("servicos", "Serviços", "1 objeto organizada/polícia", 600, 50),
    # TORCOINS (antiga Brasas)
    ("torcoins", "Torcoins", "10 Torcoins", 1000, 10),
    ("torcoins", "Torcoins", "50 Torcoins", 4500, 20),
    ("torcoins", "Torcoins", "100 Torcoins", 8000, 30),
    # SISTEMA
    ("sistema", "Sistema", "Fast Allowlist", 2000, 10),
    ("sistema", "Sistema", "Remover Blacklist", 5000, 20),
    # FARDAMENTOS
    ("fardamentos", "Fardamentos", "Inserir 1 Fardamento", 300, 10),
    ("fardamentos", "Fardamentos", "Inserir 3 Fardamentos", 800, 20),
    ("fardamentos", "Fardamentos", "Inserir 5 Fardamentos", 1200, 30),
    ("fardamentos", "Fardamentos", "Inserir 10 Fardamentos", 2000, 40),
    ("fardamentos", "Fardamentos", "Atualizar 10 Fardamentos", 1000, 50),
    # ITENS MENSAIS
    ("itens_mensais", "Itens Mensais", "Enxada (30 dias)", 1500, 10),
    ("itens_mensais", "Itens Mensais", "Madeira com Prego (30 dias)", 1500, 20),
    # ITENS 30 DIAS
    ("itens_30", "Itens 30 Dias", "Soco Inglês (30 dias)", 1500, 10),
    ("itens_30", "Itens 30 Dias", "Vergalhão (30 dias)", 1200, 20),
    ("itens_30", "Itens 30 Dias", "Taco de Beisebol (30 dias)", 1200, 30),
    ("itens_30", "Itens 30 Dias", "Cano de Ferro (30 dias)", 1200, 40),
    # ITENS WIPE
    ("itens_wipe", "Itens Wipe", "Soco Inglês Wipe", 900, 10),
    ("itens_wipe", "Itens Wipe", "Vergalhão Wipe", 800, 20),
    ("itens_wipe", "Itens Wipe", "10x Soco Inglês Wipe", 9000, 30),
    ("itens_wipe", "Itens Wipe", "10x Vergalhão Wipe", 8000, 40),
    # ACESSO
    ("acesso", "Acesso", "Torcify 30 dias", 2000, 10),
]


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("code", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@torciblox.gg").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "torciblox2025")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin TBX",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded: %s", admin_email)
    else:
        # Keep password in sync with env (useful for dev)
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )
            logger.info("Admin password refreshed from env")

    # Migration: rename Brasas -> Torcoins
    await db.products.update_many(
        {"category": "brasas"},
        {"$set": {"category": "torcoins", "category_label": "Torcoins"}},
    )
    for old, new in [
        ("10 Brasas", "10 Torcoins"),
        ("50 Brasas", "50 Torcoins"),
        ("100 Brasas", "100 Torcoins"),
    ]:
        await db.products.update_many({"name": old}, {"$set": {"name": new}})

    # Seed products (only if empty)
    count = await db.products.count_documents({})
    if count == 0:
        docs = []
        for category, label, name, price, sort in SEED_PRODUCTS:
            docs.append({
                "id": str(uuid.uuid4()),
                "slug": name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("ç", "c").replace("ã", "a").replace("õ", "o").replace("ê", "e").replace("é", "e").replace("á", "a").replace("í", "i").replace("ó", "o") + "-" + uuid.uuid4().hex[:4],
                "name": name,
                "description": "",
                "price_cents": price,
                "category": category,
                "category_label": label,
                "image_url": None,
                "active": True,
                "sort": sort,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))

    # Kick off image generation in background for any product missing an image.
    async def _bg_generate():
        try:
            res = await generate_missing_images(db)
            logger.info("Background image generation finished: %s", res)
        except Exception as e:
            logger.exception("Background image generation crashed: %s", e)

    asyncio.create_task(_bg_generate())


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
