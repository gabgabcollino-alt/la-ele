"""
Product image generator using Gemini Nano Banana (gemini-2.5-flash-image-preview).
Generates street/grunge style product images for Torciblox.
"""
import asyncio
import base64
import logging
import os
import re
import uuid
from pathlib import Path
from typing import Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger("torciblox.images")

STATIC_DIR = Path(__file__).parent / "static" / "products"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

BASE_STYLE = (
    "Dark grungy street graffiti product illustration, cinematic high-contrast "
    "black and white with subtle cool blue and white lightning bolts in the corners, "
    "cracked concrete stadium wall background, light spray paint splatter, "
    "urban Brazilian supporter-group (torcida organizada) vibe. "
    "Centered hero object, dramatic rim light, heavy grit, cohesive black/white/gray palette. "
    "Square 1:1 composition, no text, no watermarks, no logos."
)

# Per-product subject prompts (by exact product name)
PRODUCT_SUBJECTS = {
    # Serviços
    "Criar torcida personalizada": "A grungy street-art banner of an organized-supporter crest with crossed bats, street-style emblem on a concrete wall",
    "Assumir torcida existente": "A raised fist holding a torn supporter scarf, graffiti background, symbol of taking over leadership",
    "Criar qualquer polícia": "A stylized tactical police helmet and riot shield rendered in street-art black and white, gritty",
    "Criar servidor Discord": "A matte black gaming headset glowing with soft purple light over a concrete wall with graffiti tags",
    "1 objeto organizada/polícia": "A single metallic street object (spray can or crowbar) displayed on cracked asphalt, moody lighting",
    # Torcoins
    "10 Torcoins": "A small stack of chunky metal coins stamped with a lightning bolt, sitting on scratched concrete, dramatic light",
    "50 Torcoins": "A medium pile of heavy silver coins with lightning bolt stamps, spilled on a dark concrete surface",
    "100 Torcoins": "A massive pile of gleaming silver coins stamped with lightning bolts, spilling across cracked asphalt, cinematic",
    # Sistema
    "Fast Allowlist": "A glowing white keycard with a lightning bolt on a dark concrete surface, speed motion-blur streaks",
    "Remover Blacklist": "A broken chain link snapping apart on a concrete floor, sparks flying, dramatic chiaroscuro",
    # Fardamentos
    "Inserir 1 Fardamento": "One blank white supporter jersey hanging on a concrete wall, grunge style, graffiti background",
    "Inserir 3 Fardamentos": "Three identical blank white supporter jerseys arranged in a row on a concrete wall, gritty",
    "Inserir 5 Fardamentos": "Five folded blank white supporter jerseys stacked on a wooden crate, street-art wall behind, cinematic",
    "Inserir 10 Fardamentos": "Ten blank white supporter jerseys neatly stacked on a rugged crate in a graffiti-tagged warehouse",
    "Atualizar 10 Fardamentos": "A pile of white supporter jerseys with one being swapped mid-air, motion lines, dramatic light",
    # Itens Mensais
    "Enxada (30 dias)": "A single heavy iron hoe leaning against a concrete wall, worn wood handle, gritty shadows, calendar-30 motif subtle in corner",
    "Madeira com Prego (30 dias)": "A rugged wooden plank with rusty nails sticking out, leaning on a concrete wall, hyper-detailed",
    # Itens 30 Dias
    "Soco Inglês (30 dias)": "Brass knuckles on cracked asphalt, dramatic side light, heavy grit",
    "Vergalhão (30 dias)": "A short length of rebar steel rod resting on concrete, menacing shadow",
    "Taco de Beisebol (30 dias)": "A scuffed wooden baseball bat leaning against a graffiti concrete wall",
    "Cano de Ferro (30 dias)": "A rusted iron pipe lying on cracked concrete, deep shadows",
    # Itens Wipe
    "Soco Inglês Wipe": "Brass knuckles shattering with a white lightning bolt through them, high-impact street art style",
    "Vergalhão Wipe": "A rebar rod cracking mid-strike with explosive sparks, black and white street style",
    "10x Soco Inglês Wipe": "Ten brass knuckles arranged in a menacing display on cracked asphalt, dramatic light",
    "10x Vergalhão Wipe": "Ten rebar rods stacked like a weapons cache on cracked concrete, dramatic lighting",
    # Acesso
    "Torcify 30 dias": "A glowing white VIP wristband with a lightning bolt, resting on a dark concrete surface, cinematic",
}


def _slug(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:40] or uuid.uuid4().hex[:8]


async def generate_product_image(product: dict) -> Optional[str]:
    """Generate an image for a product. Returns URL path (served under /api/static/...)."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.warning("EMERGENT_LLM_KEY not set; skipping image generation")
        return None

    subject = PRODUCT_SUBJECTS.get(product["name"]) or (
        f"A single iconic object representing {product['name']} in the "
        f"{product.get('category_label', '')} category"
    )
    prompt = f"{subject}. {BASE_STYLE}"

    session_id = f"tbx-img-{product['id']}"
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You generate product illustration images for an e-commerce store.",
        )
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
            modalities=["image", "text"]
        )
        text, images = await chat.send_message_multimodal_response(
            UserMessage(text=prompt)
        )
        if not images:
            logger.warning("No image returned for %s", product["name"])
            return None
        img = images[0]
        data = base64.b64decode(img["data"])
        filename = f"{product['id']}.png"
        out_path = STATIC_DIR / filename
        out_path.write_bytes(data)
        url_path = f"/api/static/products/{filename}"
        logger.info("Generated image for %s -> %s", product["name"], url_path)
        return url_path
    except Exception as exc:
        logger.exception("Image generation failed for %s: %s", product["name"], exc)
        return None


async def generate_missing_images(db) -> dict:
    """Iterate products without image_url and generate sequentially (avoids rate limits)."""
    cursor = db.products.find(
        {"$or": [{"image_url": None}, {"image_url": ""}]}, {"_id": 0}
    )
    products = await cursor.to_list(500)
    generated = 0
    failed = 0
    for p in products:
        # retry on rate limit
        url = None
        for attempt in range(3):
            try:
                url = await generate_product_image(p)
                if url:
                    break
            except Exception as e:
                logger.warning("Attempt %d failed for %s: %s", attempt + 1, p["name"], e)
            await asyncio.sleep(4 + attempt * 3)
        if url:
            await db.products.update_one({"id": p["id"]}, {"$set": {"image_url": url}})
            generated += 1
        else:
            failed += 1
        # throttle between successful calls
        await asyncio.sleep(2.5)
    return {"generated": generated, "failed": failed, "total": len(products)}
