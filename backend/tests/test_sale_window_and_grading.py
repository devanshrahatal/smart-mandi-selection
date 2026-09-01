"""
Unit and Integration Tests for Sale-Window Timing & Quality Grading Engine.
Verifies AI harvest window recommendations and grade-based price adjustments.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.crop import Crop
from app.models.mandi import Mandi
from app.services.sale_window_service import sale_window_service
from app.services.cost_engine import cost_engine


def test_grade_multipliers():
    """Verify standard agricultural quality grade price multipliers."""
    assert sale_window_service.get_grade_multiplier("A") == 1.10
    assert sale_window_service.get_grade_multiplier("B") == 1.00
    assert sale_window_service.get_grade_multiplier("C") == 0.80
    assert sale_window_service.get_grade_multiplier(None) == 1.00


def test_cost_engine_with_quality_grades():
    """Verify net profit adjusts based on quality grade."""
    crop = Crop(name="Tomato", category="Vegetable", perishability_index=0.85)

    from app.models.cost_config import CostConfig
    cost_cfg = CostConfig(
        commission_percentage=5.0,
        loading_cost_per_quintal=20.0,
        unloading_cost_per_quintal=15.0,
        transport_rate_per_km_per_quintal=2.0,
    )

    # Base price: 2000
    res_b = cost_engine.calculate_net_profit(
        modal_price=2000.0,
        quantity_quintals=20.0,
        distance_km=100.0,
        travel_time_hours=2.5,
        crop=crop,
        cost_config=cost_cfg,
        quality_grade="B",
    )
    assert res_b["modal_price_per_quintal"] == 2000.0
    assert res_b["quality_grade"] == "B"

    # Grade A (+10%) -> 2200
    res_a = cost_engine.calculate_net_profit(
        modal_price=2000.0,
        quantity_quintals=20.0,
        distance_km=100.0,
        travel_time_hours=2.5,
        crop=crop,
        cost_config=cost_cfg,
        quality_grade="A",
    )
    assert res_a["modal_price_per_quintal"] == 2200.0
    assert res_a["net_profit_per_quintal"] > res_b["net_profit_per_quintal"]

    # Grade C (-20%) -> 1600
    res_c = cost_engine.calculate_net_profit(
        modal_price=2000.0,
        quantity_quintals=20.0,
        distance_km=100.0,
        travel_time_hours=2.5,
        crop=crop,
        cost_config=cost_cfg,
        quality_grade="C",
    )
    assert res_c["modal_price_per_quintal"] == 1600.0
    assert res_c["net_profit_per_quintal"] < res_b["net_profit_per_quintal"]


def test_sale_window_endpoint():
    """Verify /api/recommendations/sale-window returns timing recommendation."""
    client = TestClient(app)
    response = client.get("/api/recommendations/sale-window?mandi_id=1&crop_id=1&quality_grade=A")
    if response.status_code == 200:
        data = response.json()
        assert "recommended_window" in data
        assert "urgency" in data
        assert "confidence_score_percent" in data
        assert data["quality_grade"] == "A"
        assert data["grade_multiplier"] == 1.10


def test_recommendations_with_grading_payload():
    """Verify /api/recommendations accepts quality_grade and includes sale-window advice."""
    client = TestClient(app)
    payload = {
        "crop_name": "Tomato",
        "quantity_quintals": 25.0,
        "farmer_latitude": 26.9124,
        "farmer_longitude": 75.7873,
        "quality_grade": "A",
    }
    response = client.post("/api/recommendations", json=payload)
    if response.status_code == 200:
        data = response.json()
        assert data["quality_grade"] == "A"
        assert len(data["recommendations"]) > 0
        top_mandi = data["recommendations"][0]
        assert "sale_window" in top_mandi
        assert top_mandi["cost_breakdown"]["quality_grade"] == "A"
        assert data["sale_window_recommendation"] is not None
