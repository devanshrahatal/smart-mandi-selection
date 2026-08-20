"""
Geo-spatial calculations and formatting helper utilities.
Includes Haversine formula distance calculation, road-factor estimation,
and currency/unit formatting functions.
"""

import math
from typing import Tuple, Optional


def haversine_distance_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate the great-circle distance between two points on the Earth
    using the Haversine formula (in kilometers).
    """
    # Earth radius in kilometers
    R = 6371.0

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def estimate_road_distance_and_time(
    straight_line_km: float,
    road_detour_factor: float = 1.28,
    avg_speed_kmh: float = 40.0,
) -> Tuple[float, float]:
    """
    Estimate realistic road distance and driving duration in hours.
    - road_detour_factor: Typical detour factor for Indian highways/rural roads (~1.25 - 1.30)
    - avg_speed_kmh: Average speed for goods carrier (mini truck/tractor ~35-45 km/h)
    
    Returns:
        (estimated_road_km, estimated_duration_hours)
    """
    road_km = round(straight_line_km * road_detour_factor, 1)
    duration_hours = round(road_km / max(avg_speed_kmh, 10.0), 2)
    return road_km, duration_hours


def format_inr(amount: float) -> str:
    """Format numeric value as Indian Rupee string (e.g. ₹ 2,450.00)."""
    return f"₹{amount:,.2f}"


def format_duration(hours: float) -> str:
    """Format duration in hours to human-readable format (e.g. '3h 15m' or '45m')."""
    total_minutes = int(round(hours * 60))
    h = total_minutes // 60
    m = total_minutes % 60
    if h > 0 and m > 0:
        return f"{h}h {m}m"
    elif h > 0:
        return f"{h}h"
    else:
        return f"{m}m"
