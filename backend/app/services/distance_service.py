"""
Distance and Transport Cost Service.
Computes real-time road distance and travel time using Google Maps Distance Matrix API,
with automatic Redis caching and Haversine formula fallback.
Calculates transport cost per quintal and total load transport cost.
"""

import logging
from typing import Dict, Any, Optional, Tuple
import httpx

from app.config import settings
from app.services.cache_service import cache_service
from app.utils.helpers import haversine_distance_km, estimate_road_distance_and_time

logger = logging.getLogger(__name__)

GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


class DistanceService:
    """Computes distance, driving duration, and transport cost between farmer and mandis."""

    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY

    async def get_distance_and_time(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> Dict[str, Any]:
        """
        Compute distance (km) and driving duration (hours) between coordinates.
        1. Checks Redis cache
        2. Queries Google Maps Distance Matrix API if key is present
        3. Falls back to Haversine formula + Indian road detour factor
        """
        # Round coords to 3 decimals (~100m precision) for cache hits
        cache_key = (
            f"distance:{round(origin_lat, 3)},{round(origin_lon, 3)}:"
            f"{round(dest_lat, 3)},{round(dest_lon, 3)}"
        )

        cached = cache_service.get_json(cache_key)
        if cached:
            return cached

        # Try Google Maps Distance Matrix API
        if self.api_key:
            try:
                result = await self._fetch_google_distance(
                    origin_lat, origin_lon, dest_lat, dest_lon
                )
                if result:
                    # Cache for 24 hours
                    cache_service.set_json(cache_key, result, ttl_seconds=86400)
                    return result
            except Exception as e:
                logger.warning("Google Maps Distance API call failed: %s. Using Haversine fallback.", e)

        # Fallback: Haversine calculation + road detour factor
        straight_km = haversine_distance_km(origin_lat, origin_lon, dest_lat, dest_lon)
        road_km, duration_hours = estimate_road_distance_and_time(
            straight_line_km=straight_km,
            road_detour_factor=1.28,
            avg_speed_kmh=40.0,
        )

        fallback_result = {
            "distance_km": round(road_km, 1),
            "travel_time_hours": round(duration_hours, 2),
            "source": "haversine_estimate",
        }

        # Cache fallback result for 6 hours
        cache_service.set_json(cache_key, fallback_result, ttl_seconds=21600)
        return fallback_result

    async def _fetch_google_distance(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
    ) -> Optional[Dict[str, Any]]:
        """Call Google Maps Distance Matrix API."""
        params = {
            "origins": f"{origin_lat},{origin_lon}",
            "destinations": f"{dest_lat},{dest_lon}",
            "mode": "driving",
            "key": self.api_key,
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(GOOGLE_DISTANCE_MATRIX_URL, params=params)
            if response.status_code != 200:
                logger.warning("Google Maps API returned %d: %s", response.status_code, response.text[:200])
                return None

            data = response.json()
            if data.get("status") != "OK":
                logger.warning("Google Maps API status: %s", data.get("status"))
                return None

            rows = data.get("rows", [])
            if not rows or not rows[0].get("elements"):
                return None

            element = rows[0]["elements"][0]
            if element.get("status") != "OK":
                return None

            distance_meters = element["distance"]["value"]
            duration_seconds = element["duration"]["value"]

            return {
                "distance_km": round(distance_meters / 1000.0, 1),
                "travel_time_hours": round(duration_seconds / 3600.0, 2),
                "source": "google_maps",
            }

    @staticmethod
    def calculate_transport_cost(
        distance_km: float,
        quantity_quintals: float,
        rate_per_km_per_quintal: float = 2.5,
        min_base_fare: float = 200.0,
    ) -> Dict[str, float]:
        """
        Estimate transport cost for a farmer's crop load.

        Formula:
          cost_per_quintal = max(distance_km * rate_per_km_per_quintal, min_base_fare / max(quantity, 1))
          total_cost = cost_per_quintal * quantity_quintals

        Returns:
          {
            "cost_per_quintal": float,
            "total_transport_cost": float,
            "rate_per_km_per_quintal": float,
            "distance_km": float,
          }
        """
        qty = max(quantity_quintals, 0.1)
        raw_cost_per_quintal = distance_km * rate_per_km_per_quintal
        min_per_quintal = min_base_fare / qty

        cost_per_quintal = round(max(raw_cost_per_quintal, min_per_quintal), 2)
        total_cost = round(cost_per_quintal * qty, 2)

        return {
            "cost_per_quintal": cost_per_quintal,
            "total_transport_cost": total_cost,
            "rate_per_km_per_quintal": rate_per_km_per_quintal,
            "distance_km": distance_km,
        }


distance_service = DistanceService()
