"""
Unit tests for Geospatial Distance calculations, Road Detour estimation, and Transport Costs.
"""

import pytest
from app.utils.helpers import haversine_distance_km, estimate_road_distance_and_time
from app.services.distance_service import distance_service


def test_haversine_math():
    """Verify Haversine formula calculation between Jaipur and Kota."""
    # Jaipur (26.9124, 75.7873) to Kota (25.2138, 75.8648)
    # Straight-line distance is ~189 km
    dist = haversine_distance_km(26.9124, 75.7873, 25.2138, 75.8648)
    assert 180.0 < dist < 200.0


def test_road_detour_estimation():
    """Verify Indian highway detour factor and travel time estimation."""
    straight_km = 100.0
    road_km, duration_hours = estimate_road_distance_and_time(
        straight_line_km=straight_km,
        road_detour_factor=1.28,
        avg_speed_kmh=40.0,
    )

    assert road_km == 128.0
    assert duration_hours == 3.2  # 128 / 40 = 3.2 hours


def test_transport_cost_calculation():
    """Verify transport cost formula and minimum base fare protection."""
    # Scenario 1: Standard trip
    res = distance_service.calculate_transport_cost(
        distance_km=200.0,
        quantity_quintals=20.0,
        rate_per_km_per_quintal=2.5,
    )
    assert res["cost_per_quintal"] == 500.0  # 200 * 2.5
    assert res["total_transport_cost"] == 10000.0  # 500 * 20

    # Scenario 2: Very short distance protected by minimum trip base fare (Rs 200)
    res_short = distance_service.calculate_transport_cost(
        distance_km=2.0,
        quantity_quintals=5.0,
        rate_per_km_per_quintal=2.0,
        min_base_fare=200.0,
    )
    # Raw cost is 4.0/q (total Rs 20), but min fare is 200 / 5 = 40.0/q
    assert res_short["cost_per_quintal"] == 40.0
    assert res_short["total_transport_cost"] == 200.0


@pytest.mark.asyncio
async def test_distance_service_fallback():
    """Verify distance_service returns valid road km and travel hours."""
    res = await distance_service.get_distance_and_time(26.9124, 75.7873, 25.2138, 75.8648)
    assert res["distance_km"] > 180.0
    assert res["travel_time_hours"] > 0
    assert "source" in res
