"""
Unit tests for the 7-day and 14-day Mandi Price Trend and Volatility Engine.
"""

import pytest
from app.services.trend_engine import trend_engine


def test_trend_engine_seeded_data(db_session):
    """Verify trend engine returns 7d/14d percentages and direction from database."""
    # Mandi 1 (Azadpur) + Crop 1 (Tomato)
    res = trend_engine.calculate_price_trend(db=db_session, mandi_id=1, crop_id=1, days=14)

    assert "direction" in res
    assert res["direction"] in ["UP", "DOWN", "STABLE"]
    assert "change_7d_percent" in res
    assert "change_14d_percent" in res
    assert "average_price_7d" in res
    assert res["average_price_7d"] > 0
    assert "history" in res
    assert len(res["history"]) > 0


def test_trend_engine_non_existent(db_session):
    """Verify graceful handling for a non-existent mandi or crop."""
    res = trend_engine.calculate_price_trend(db=db_session, mandi_id=99999, crop_id=99999, days=14)
    assert res["direction"] == "STABLE"
    assert res["change_7d_percent"] == 0.0
    assert res["average_price_7d"] == 0.0
    assert res["history"] == []
