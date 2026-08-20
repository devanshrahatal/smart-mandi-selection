"""
Unit tests for the Net Profit Cost Engine and Spoilage Risk Deductions.
"""

import pytest
from app.models.crop import Crop
from app.models.cost_config import CostConfig
from app.services.cost_engine import cost_engine


def test_net_profit_calculation_integrity():
    """Verify that net profit and itemized deductions add up exactly."""
    crop = Crop(name="Tomato", category="Vegetable", perishability_index=0.85)
    config = CostConfig(
        commission_percentage=5.0,
        loading_cost_per_quintal=30.0,
        unloading_cost_per_quintal=20.0,
        transport_rate_per_km_per_quintal=2.0,
    )

    modal_price = 2400.0
    quantity = 20.0
    distance_km = 200.0
    travel_hours = 5.0

    res = cost_engine.calculate_net_profit(
        modal_price=modal_price,
        quantity_quintals=quantity,
        distance_km=distance_km,
        travel_time_hours=travel_hours,
        crop=crop,
        cost_config=config,
    )

    # 1. Check Commission
    expected_commission = round(2400.0 * 0.05, 2)  # 120.0
    assert res["commission_per_quintal"] == expected_commission

    # 2. Check Loading/Unloading
    assert res["loading_unloading_cost_per_quintal"] == 50.0

    # 3. Check Transport (200 km * Rs 2.0 = 400.0)
    assert res["transport_cost_per_quintal"] == 400.0

    # 4. Check Spoilage: 0.85 * (5/24) * 0.15 = ~2.656% -> 2400 * 0.02656 = ~63.75
    assert res["spoilage_risk_deduction_per_quintal"] > 0

    # 5. Check Deductions Sum
    expected_total_deductions = round(
        res["transport_cost_per_quintal"]
        + res["loading_unloading_cost_per_quintal"]
        + res["commission_per_quintal"]
        + res["spoilage_risk_deduction_per_quintal"],
        2,
    )
    assert res["total_deductions_per_quintal"] == expected_total_deductions

    # 6. Check Net Profit Formula
    expected_net = round(modal_price - expected_total_deductions, 2)
    assert res["net_profit_per_quintal"] == expected_net
    assert res["total_net_profit"] == round(expected_net * quantity, 2)


def test_spoilage_perishability_scaling():
    """Verify that perishable crops incur higher spoilage losses on long transit than grains."""
    perishable_crop = Crop(name="Tomato", category="Vegetable", perishability_index=0.85)
    grain_crop = Crop(name="Wheat", category="Grain", perishability_index=0.05)

    config = CostConfig(
        commission_percentage=5.0,
        loading_cost_per_quintal=30.0,
        unloading_cost_per_quintal=20.0,
        transport_rate_per_km_per_quintal=2.0,
    )

    modal_price = 2500.0
    long_travel_hours = 28.0

    tomato_res = cost_engine.calculate_net_profit(
        modal_price=modal_price,
        quantity_quintals=20.0,
        distance_km=1000.0,
        travel_time_hours=long_travel_hours,
        crop=perishable_crop,
        cost_config=config,
    )

    wheat_res = cost_engine.calculate_net_profit(
        modal_price=modal_price,
        quantity_quintals=20.0,
        distance_km=1000.0,
        travel_time_hours=long_travel_hours,
        crop=grain_crop,
        cost_config=config,
    )

    # Tomato spoilage should be significantly higher than wheat for same distance
    assert tomato_res["spoilage_risk_deduction_per_quintal"] > wheat_res["spoilage_risk_deduction_per_quintal"] * 10
    assert wheat_res["spoilage_risk_deduction_per_quintal"] < 30.0


def test_edge_case_minimal_quantity():
    """Ensure minimal or fractional quantities calculate safely without division by zero."""
    crop = Crop(name="Onion", category="Vegetable", perishability_index=0.25)
    config = CostConfig()

    res = cost_engine.calculate_net_profit(
        modal_price=1800.0,
        quantity_quintals=0.5,
        distance_km=50.0,
        travel_time_hours=1.2,
        crop=crop,
        cost_config=config,
    )

    assert res["net_profit_per_quintal"] > 0
    assert res["total_net_profit"] > 0
