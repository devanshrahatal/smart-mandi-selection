"""
Price Trend Analysis Engine.
Calculates 7-day and 14-day price trends (direction, percentage change, volatility),
and generates historical time-series datasets for Recharts visualizations.
"""

import logging
from typing import Dict, Any, List
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.mandi_price import MandiPrice
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)


class TrendEngine:
    """Computes price trend trajectories and summary statistics."""

    @staticmethod
    def calculate_price_trend(
        db: Session,
        mandi_id: int,
        crop_id: int,
        days: int = 14,
    ) -> Dict[str, Any]:
        """
        Analyze price movements over the last 7 to 14 days.

        Returns:
            {
                "direction": "UP" | "DOWN" | "STABLE",
                "change_7d_percent": float,
                "change_14d_percent": float,
                "average_price_7d": float,
                "min_price_7d": float,
                "max_price_7d": float,
                "history": List[{"date": str, "modal_price": float, "min_price": float, "max_price": float}]
            }
        """
        # Fetch up to `days` historical price records
        records = (
            db.query(MandiPrice)
            .filter(MandiPrice.mandi_id == mandi_id, MandiPrice.crop_id == crop_id)
            .order_by(MandiPrice.date.desc())
            .limit(days)
            .all()
        )

        if not records:
            return {
                "direction": "STABLE",
                "change_7d_percent": 0.0,
                "change_14d_percent": 0.0,
                "average_price_7d": 0.0,
                "min_price_7d": 0.0,
                "max_price_7d": 0.0,
                "history": [],
            }

        # Records are in reverse chronological order (newest first)
        history_asc = list(reversed(records))
        history_points = [
            {
                "date": str(r.date),
                "modal_price": float(r.modal_price),
                "min_price": float(r.min_price),
                "max_price": float(r.max_price),
            }
            for r in history_asc
        ]

        latest_price = float(records[0].modal_price)

        # 7-day stats
        records_7d = records[: min(7, len(records))]
        prices_7d = [float(r.modal_price) for r in records_7d]
        avg_7d = round(sum(prices_7d) / len(prices_7d), 2)
        min_7d = round(min(prices_7d), 2)
        max_7d = round(max(prices_7d), 2)

        # Calculate 7-day change
        if len(records_7d) >= 2:
            oldest_7d_price = float(records_7d[-1].modal_price)
            if oldest_7d_price > 0:
                change_7d = round(((latest_price - oldest_7d_price) / oldest_7d_price) * 100.0, 2)
            else:
                change_7d = 0.0
        else:
            change_7d = 0.0

        # Calculate 14-day change
        if len(records) >= 2:
            oldest_14d_price = float(records[-1].modal_price)
            if oldest_14d_price > 0:
                change_14d = round(((latest_price - oldest_14d_price) / oldest_14d_price) * 100.0, 2)
            else:
                change_14d = 0.0
        else:
            change_14d = 0.0

        # Determine direction
        if change_7d >= 2.0:
            direction = "UP"
        elif change_7d <= -2.0:
            direction = "DOWN"
        else:
            direction = "STABLE"

        return {
            "direction": direction,
            "change_7d_percent": change_7d,
            "change_14d_percent": change_14d,
            "average_price_7d": avg_7d,
            "min_price_7d": min_7d,
            "max_price_7d": max_7d,
            "history": history_points,
        }


trend_engine = TrendEngine()
