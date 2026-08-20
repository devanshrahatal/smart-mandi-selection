"""
Integration tests for FastAPI REST API endpoints:
Health check, Crops, Mandis, Recommendations ranking, WhatsApp Simulator, and Admin Dashboard.
"""

import pytest


def test_health_check(client):
    """Verify GET /api/health returns status healthy."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_get_crops(client):
    """Verify GET /api/crops returns all supported crops."""
    response = client.get("/api/crops")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) >= 5
    crop_names = [c["name"] for c in crops]
    assert "Tomato" in crop_names
    assert "Wheat" in crop_names


def test_get_mandis(client):
    """Verify GET /api/mandis returns active mandis."""
    response = client.get("/api/mandis")
    assert response.status_code == 200
    mandis = response.json()
    assert len(mandis) >= 10
    mandi_names = [m["name"] for m in mandis]
    assert any("Kota" in name for name in mandi_names)
    assert any("Azadpur" in name for name in mandi_names)


def test_post_recommendations_ranking(client):
    """Verify POST /api/recommendations calculates Net Profit and ranks mandis correctly."""
    payload = {
        "crop_name": "Tomato",
        "quantity_quintals": 20.0,
        "farmer_latitude": 26.9124,
        "farmer_longitude": 75.7873,
        "max_radius_km": 1500.0,
    }

    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["crop_name"] == "Tomato"
    assert data["quantity_quintals"] == 20.0
    assert len(data["recommendations"]) > 0

    # Ensure recommendations are strictly sorted by net_profit descending
    ranks = data["recommendations"]
    assert ranks[0]["rank"] == 1
    for i in range(len(ranks) - 1):
        assert ranks[i]["cost_breakdown"]["net_profit_per_quintal"] >= ranks[i + 1]["cost_breakdown"]["net_profit_per_quintal"]


def test_recommendations_invalid_crop(client):
    """Verify 404 response for unknown crop."""
    payload = {
        "crop_name": "NonExistentDragonFruit123",
        "quantity_quintals": 10.0,
        "farmer_latitude": 26.9124,
        "farmer_longitude": 75.7873,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 404


def test_whatsapp_simulator_flow(client):
    """Verify multi-step WhatsApp simulator conversation endpoint."""
    phone = "+919111222333"

    # Step 1: Greeting
    r1 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "Hi"})
    assert r1.status_code == 200
    assert "Tomato" in r1.json()["reply"]

    # Step 2: Crop
    r2 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "Tomato"})
    assert r2.status_code == 200
    assert "quantity" in r2.json()["reply"].lower()

    # Step 3: Quantity
    r3 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "20 quintals"})
    assert r3.status_code == 200
    assert "located" in r3.json()["reply"].lower()

    # Step 4: Location
    r4 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "Jaipur"})
    assert r4.status_code == 200
    assert "Kota" in r4.json()["reply"] or "Azadpur" in r4.json()["reply"]


def test_admin_auth_and_overview(client, admin_auth_headers):
    """Verify admin login and authenticated dashboard overview endpoint."""
    # 1. Login with bad password
    bad_login = client.post("/api/admin/login", json={"username": "admin", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 2. Login with correct password
    good_login = client.post("/api/admin/login", json={"username": "admin", "password": "admin123"})
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()

    # 3. Access protected overview endpoint
    overview = client.get("/api/admin/overview", headers=admin_auth_headers)
    assert overview.status_code == 200
    assert "metrics" in overview.json()
    assert "top_crops" in overview.json()
