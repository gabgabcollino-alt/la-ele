"""Torciblox backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://torciblox-shop.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@torciblox.gg"
ADMIN_PASSWORD = "torciblox2025"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ----- Root/config -----
def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_config(api):
    r = api.get(f"{BASE_URL}/api/config")
    assert r.status_code == 200
    data = r.json()
    for k in ("whatsapp", "discord", "pix_key", "pix_key_type", "pix_receiver"):
        assert k in data, f"missing key {k}"
        assert isinstance(data[k], str) and len(data[k]) > 0, f"empty {k}"
    assert data["whatsapp"] == "5511949850080"
    assert "discord.gg" in data["discord"]


# ----- Products -----
def test_products_list_and_categories(api):
    r = api.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    products = r.json()
    # Active-only default
    assert all(p.get("active") for p in products)
    # Should have at least 26 seeded active
    assert len(products) >= 26, f"expected >=26 got {len(products)}"
    cats = {p["category"] for p in products}
    expected = {"servicos", "torcoins", "sistema", "fardamentos", "itens_mensais", "itens_30", "itens_wipe", "acesso"}
    assert expected.issubset(cats), f"missing categories: {expected - cats}"
    assert "brasas" not in cats, "old 'brasas' category still exists"


def test_torcoins_products(api):
    r = api.get(f"{BASE_URL}/api/products", params={"category": "torcoins"})
    assert r.status_code == 200
    products = r.json()
    assert len(products) == 3, f"expected 3 torcoins got {len(products)}"
    names = {p["name"] for p in products}
    assert names == {"10 Torcoins", "50 Torcoins", "100 Torcoins"}, f"got {names}"


# ----- Auth -----
def test_login_success(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 10
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == ADMIN_EMAIL


def test_login_invalid(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_me_with_token(api, auth_headers):
    r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_me_without_token(api):
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# ----- Product CRUD (admin) -----
def test_product_crud(api, auth_headers):
    payload = {
        "name": "TEST_Produto QA",
        "description": "teste",
        "price_cents": 1234,
        "category": "torcoins",
        "category_label": "Torcoins",
        "active": True,
        "sort": 999,
    }
    r = api.post(f"{BASE_URL}/api/products", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    created = r.json()
    pid = created["id"]
    assert created["name"] == payload["name"]
    assert created["price_cents"] == 1234

    # Verify via GET list
    r = api.get(f"{BASE_URL}/api/products", params={"category": "torcoins"})
    assert any(p["id"] == pid for p in r.json())

    # Update
    r = api.put(f"{BASE_URL}/api/products/{pid}", json={"price_cents": 5678}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["price_cents"] == 5678

    # Delete
    r = api.delete(f"{BASE_URL}/api/products/{pid}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json().get("ok") is True

    # Verify gone
    r = api.delete(f"{BASE_URL}/api/products/{pid}", headers=auth_headers)
    assert r.status_code == 404


def test_product_create_requires_auth(api):
    r = requests.post(f"{BASE_URL}/api/products", json={
        "name": "nope", "price_cents": 100, "category": "x", "category_label": "X"
    })
    assert r.status_code in (401, 403)


# ----- Orders -----
@pytest.fixture(scope="session")
def sample_product_id(api):
    r = api.get(f"{BASE_URL}/api/products", params={"category": "torcoins"})
    assert r.status_code == 200 and r.json()
    return r.json()[0]["id"], r.json()[0]["price_cents"]


def test_create_order_success(api, sample_product_id):
    pid, price = sample_product_id
    payload = {
        "customer_name": "QA Tester",
        "customer_contact": "5511999999999",
        "notes": "auto-test",
        "items": [{"product_id": pid, "quantity": 2}],
    }
    r = api.post(f"{BASE_URL}/api/orders", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["code"].startswith("TBX-")
    assert len(data["code"]) == 10  # TBX- + 6 hex chars
    assert data["subtotal_cents"] == price * 2
    assert data["status"] == "pending"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2


def test_create_order_invalid_product(api):
    r = api.post(f"{BASE_URL}/api/orders", json={
        "customer_name": "x",
        "customer_contact": "y",
        "items": [{"product_id": "does-not-exist", "quantity": 1}],
    })
    assert r.status_code == 400


def test_create_order_empty_items(api):
    r = api.post(f"{BASE_URL}/api/orders", json={
        "customer_name": "x", "customer_contact": "y", "items": []
    })
    assert r.status_code == 400


def test_list_orders_requires_auth(api):
    r = requests.get(f"{BASE_URL}/api/orders")
    assert r.status_code == 401


def test_list_orders_and_update_status(api, auth_headers, sample_product_id):
    pid, _ = sample_product_id
    # Create an order
    r = api.post(f"{BASE_URL}/api/orders", json={
        "customer_name": "TEST_Status",
        "customer_contact": "5511988887777",
        "items": [{"product_id": pid, "quantity": 1}],
    })
    assert r.status_code == 200
    oid = r.json()["id"]

    # List
    r = api.get(f"{BASE_URL}/api/orders", headers=auth_headers)
    assert r.status_code == 200
    orders = r.json()
    assert any(o["id"] == oid for o in orders)
    our = next(o for o in orders if o["id"] == oid)
    assert our["status"] == "pending"

    # Update status
    r = api.patch(f"{BASE_URL}/api/orders/{oid}/status", json={"status": "paid"}, headers=auth_headers)
    assert r.status_code == 200

    # Verify persisted
    r = api.get(f"{BASE_URL}/api/orders", headers=auth_headers)
    our = next(o for o in r.json() if o["id"] == oid)
    assert our["status"] == "paid"

    # Invalid status rejected
    r = api.patch(f"{BASE_URL}/api/orders/{oid}/status", json={"status": "foo"}, headers=auth_headers)
    assert r.status_code == 400

    # Unknown order id -> 404
    r = api.patch(f"{BASE_URL}/api/orders/nope/status", json={"status": "paid"}, headers=auth_headers)
    assert r.status_code == 404
