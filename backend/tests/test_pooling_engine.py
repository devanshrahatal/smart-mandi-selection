"""
Unit & Integration tests for Kisan Pool Shared Logistics Optimization Engine.
Tests vehicle fleet allocation, capacity fill percentages, and shared freight savings.
"""

import pytest
from app.services.pooling_engine import pooling_engine


def test_kisan_pool_savings_calculation():
    """Verify shared logistics math delivers 40-60% savings vs. solo vehicle hiring."""
    solo_qty = 10.0   # Farmer has 10 quintals
    total_qty = 40.0  # Village group has 40 quintals pooled
    distance = 250.0  # 250 km to terminal APMC

    res = pooling_engine.calculate_pool_savings(
        solo_quantity_quintals=solo_qty,
        total_pooled_quantity_quintals=total_qty,
        distance_km=distance,
        target_mandi_name="Kota Mandi",
    )

    # Solo: Tata Ace base ₹16/km * 250 = ₹4000 / 10q = ₹400/q
    # Pooled: Tata 407 base ₹30/km * 250 = ₹7500 / 40q = ₹187.5/q
    # Savings: ₹212.5/q (53.1% reduction!)
    assert res["solo_cost_per_quintal"] > res["pooled_cost_per_quintal"]
    assert res["savings_per_quintal"] > 100.0
    assert res["savings_percentage"] > 40.0
    assert res["total_farmer_savings"] == res["savings_per_quintal"] * solo_qty
    assert res["matched_vehicle"] == "Tata 407 Light Truck"


def test_kisan_pool_active_batches_endpoint(client):
    """Verify GET /api/pooling/active-pools returns active village pooling batches."""
    response = client.get("/api/pooling/active-pools")
    assert response.status_code == 200
    data = response.json()
    assert "pools" in data
    assert len(data["pools"]) >= 3
    first_pool = data["pools"][0]
    assert "pool_id" in first_pool
    assert "capacity_filled_percent" in first_pool
    assert "savings_per_quintal" in first_pool


def test_kisan_pool_calculate_endpoint(client):
    """Verify POST /api/pooling/calculate returns accurate shared freight breakdown."""
    payload = {
        "solo_quantity_quintals": 15.0,
        "total_pooled_quantity_quintals": 45.0,
        "distance_km": 200.0,
        "target_mandi_name": "Vashi APMC",
    }
    response = client.post("/api/pooling/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["savings_per_quintal"] > 0
    assert data["total_farmer_savings"] > 0
    assert data["target_mandi"] == "Vashi APMC"
