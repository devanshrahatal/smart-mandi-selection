"""
Net Profit Calculation Engine.
Implements the core economic intelligence formula:
  net_profit_per_quintal = modal_price - transport - loading/unloading - commission - spoilage_risk
Incorporates crop perishability indices and transit travel times.
"""

import logging
from typing import Dict, Any
from app.models.crop import Crop
from app.models.cost_config import CostConfig
from app.services.distance_service import distance_service

logger = logging.getLogger(__name__)


class CostEngine:
    """Calculates comprehensive net profit and cost itemization for candidate mandis."""

    @staticmethod
    def calculate_net_profit(
        modal_price: float,
        quantity_quintals: float,
        distance_km: float,
        travel_time_hours: float,
        crop: Crop,
        cost_config: CostConfig,
        quality_grade: str = "B",
    ) -> Dict[str, Any]:
        """
        Calculates itemized cost deductions and final take-home net profit.

        Parameters:
            modal_price: Raw mandi price (₹/quintal)
            quantity_quintals: Total quantity being sold (quintals)
            distance_km: Road distance to candidate mandi (km)
            travel_time_hours: Road driving time (hours)
            crop: Crop model instance (contains perishability_index)
            cost_config: CostConfig model instance (mandi commission %, loading, transport rate)
            quality_grade: Agricultural quality tier ("A" Premium = 1.10x, "B" FAQ = 1.00x, "C" Processing = 0.80x)

        Returns:
            Dictionary containing itemized costs and net profit.
        """
        qty = max(quantity_quintals, 0.1)

        # 0. Quality Grade Multiplier
        clean_grade = (quality_grade or "B").strip().upper()
        grade_multipliers = {"A": 1.10, "B": 1.00, "C": 0.80}
        grade_multiplier = grade_multipliers.get(clean_grade, 1.00)
        adjusted_modal_price = round(modal_price * grade_multiplier, 2)

        # 1. Transport Cost
        rate_per_km = cost_config.transport_rate_per_km_per_quintal or 2.5
        transport_res = distance_service.calculate_transport_cost(
            distance_km=distance_km,
            quantity_quintals=qty,
            rate_per_km_per_quintal=rate_per_km,
        )
        transport_per_quintal = transport_res["cost_per_quintal"]

        # 2. Loading & Unloading Cost
        loading_per_quintal = (
            (cost_config.loading_cost_per_quintal or 30.0)
            + (cost_config.unloading_cost_per_quintal or 20.0)
        )

        # 3. Mandi Commission (computed on adjusted price)
        comm_pct = cost_config.commission_percentage or 6.0
        commission_per_quintal = round(adjusted_modal_price * (comm_pct / 100.0), 2)

        # 4. Spoilage Risk Deduction (perishability_index * travel_time_hours factor)
        perishability = max(min(crop.perishability_index or 0.5, 1.0), 0.0)
        spoilage_rate = min(perishability * (travel_time_hours / 24.0) * 0.15, 0.35)
        spoilage_per_quintal = round(adjusted_modal_price * spoilage_rate, 2)

        # 5. Totals
        total_deductions = round(
            transport_per_quintal
            + loading_per_quintal
            + commission_per_quintal
            + spoilage_per_quintal,
            2,
        )

        net_profit_per_quintal = round(adjusted_modal_price - total_deductions, 2)
        total_net_profit = round(net_profit_per_quintal * qty, 2)

        return {
            "raw_modal_price": round(modal_price, 2),
            "quality_grade": clean_grade,
            "grade_multiplier": grade_multiplier,
            "modal_price_per_quintal": adjusted_modal_price,
            "transport_cost_per_quintal": transport_per_quintal,
            "loading_unloading_cost_per_quintal": loading_per_quintal,
            "commission_per_quintal": commission_per_quintal,
            "commission_percentage": comm_pct,
            "spoilage_risk_deduction_per_quintal": spoilage_per_quintal,
            "total_deductions_per_quintal": total_deductions,
            "net_profit_per_quintal": net_profit_per_quintal,
            "total_net_profit": total_net_profit,
        }


cost_engine = CostEngine()
