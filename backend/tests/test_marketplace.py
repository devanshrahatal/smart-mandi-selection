"""
Unit and Integration Tests for Marketplace & Verified Buyer Linkages.
Verifies buyer search/filter, lot creation, digital offer submission, and deal acceptance.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.buyer import Buyer
from app.models.lot import Lot
from app.models.offer import Offer

client = TestClient(app)


def test_list_verified_buyers():
    """Verify listing and filtering verified institutional buyers."""
    response = client.get("/api/marketplace/buyers")
    assert response.status_code == 200
    buyers = response.json()
    assert len(buyers) > 0
    first = buyers[0]
    assert "business_name" in first
    assert "gst_number" in first
    assert first["is_verified"] is True

    # Filter by crop
    res_crop = client.get("/api/marketplace/buyers?crop=Tomato")
    assert res_crop.status_code == 200
    for b in res_crop.json():
        assert "tomato" in b["preferred_crops"].lower()


def test_create_lot_and_digital_offer_lifecycle():
    """Verify lot creation, buyer bidding, and farmer accepting offer."""
    # 1. Create a lot
    lot_payload = {
        "farmer_name": "Kisan Demo User",
        "phone_number": "+919876543210",
        "crop_name": "Tomato",
        "quantity_quintals": 30.0,
        "quality_grade": "A",
        "expected_price_per_q": 2500.0,
        "origin_location": "Chomu, Jaipur",
        "harvest_date": "2026-09-05",
    }
    create_res = client.post("/api/marketplace/lots", json=lot_payload)
    assert create_res.status_code == 200
    lot_data = create_res.json()
    assert lot_data["status"] == "Active"
    assert lot_data["lot_id"].startswith("LOT-")
    lot_db_id = lot_data["id"]

    # 2. Buyer places a digital offer/bid
    offer_payload = {
        "buyer_id": 1,
        "offered_price_per_q": 2550.0,
        "pickup_option": "Farmgate Pickup",
    }
    offer_res = client.post(f"/api/marketplace/lots/{lot_db_id}/offers", json=offer_payload)
    assert offer_res.status_code == 200
    offer_data = offer_res.json()
    assert offer_data["status"] == "Pending"
    assert offer_data["offered_price_per_q"] == 2550.0
    offer_db_id = offer_data["id"]

    # 3. Farmer accepts offer
    action_res = client.patch(f"/api/marketplace/offers/{offer_db_id}/action", json={"action": "accept"})
    assert action_res.status_code == 200
    action_data = action_res.json()
    assert action_data["status"] == "Accepted"
    assert action_data["deal_amount"] == 30.0 * 2550.0

    # 4. Verify lot status updated to Sold
    lots_res = client.get("/api/marketplace/lots?crop=Tomato")
    assert lots_res.status_code == 200
    matching_lots = [l for l in lots_res.json() if l["id"] == lot_db_id]
    assert len(matching_lots) == 1
    assert matching_lots[0]["status"] == "Sold"
