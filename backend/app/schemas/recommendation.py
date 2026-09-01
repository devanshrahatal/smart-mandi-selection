"""
Pydantic schemas for Mandi Recommendations, Quality Grading, Sale-Window Timing, and Net Profit breakdowns.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class RecommendationRequest(BaseModel):
    crop_name: str = Field(..., example="Tomato", description="Name of the agricultural crop")
    quantity_quintals: float = Field(..., gt=0.0, example=20.0, description="Quantity to sell in quintals")
    farmer_latitude: float = Field(..., example=26.9124, description="Farmer latitude coordinate")
    farmer_longitude: float = Field(..., example=75.7873, description="Farmer longitude coordinate")
    quality_grade: Optional[str] = Field("B", example="A", description="Quality Grade: 'A' (Premium +10%), 'B' (Standard/FAQ 100%), 'C' (Processing -20%)")
    max_radius_km: Optional[float] = Field(1500.0, description="Maximum search radius in km")
    phone_number: Optional[str] = Field(None, example="+919876543210", description="Farmer phone number for analytics/audit")


class CostBreakdown(BaseModel):
    raw_modal_price: Optional[float] = Field(None, description="Raw market price before quality grading (₹/q)")
    quality_grade: Optional[str] = Field("B", description="Quality grade applied ('A', 'B', or 'C')")
    grade_multiplier: Optional[float] = Field(1.00, description="Price multiplier based on quality grade")
    modal_price_per_quintal: float = Field(..., description="Quality-adjusted modal price (₹/q)")
    transport_cost_per_quintal: float = Field(..., description="Transport cost (₹/q)")
    loading_unloading_cost_per_quintal: float = Field(..., description="Loading + unloading cost (₹/q)")
    commission_per_quintal: float = Field(..., description="Mandi commission deduction (₹/q)")
    commission_percentage: float = Field(..., description="Mandi commission percentage (%)")
    spoilage_risk_deduction_per_quintal: float = Field(..., description="Estimated spoilage loss in transit (₹/q)")
    total_deductions_per_quintal: float = Field(..., description="Sum of all costs and deductions (₹/q)")
    net_profit_per_quintal: float = Field(..., description="Actual take-home earnings (₹/q)")
    total_net_profit: float = Field(..., description="Total take-home for the entire batch (₹)")


class PriceTrendInfo(BaseModel):
    direction: str = Field(..., example="UP", description="'UP', 'DOWN', or 'STABLE'")
    change_7d_percent: float = Field(..., description="Percentage price change over 7 days")
    change_14d_percent: float = Field(..., description="Percentage price change over 14 days")
    average_price_7d: float = Field(..., description="7-day average modal price (₹)")
    min_price_7d: float = Field(..., description="Lowest modal price in last 7 days (₹)")
    max_price_7d: float = Field(..., description="Highest modal price in last 7 days (₹)")


class SaleWindowInfo(BaseModel):
    recommended_window: str = Field(..., example="Sell within 24–36 Hours", description="Recommended timeline for selling")
    urgency: str = Field(..., example="HIGH", description="'CRITICAL', 'HIGH', 'MEDIUM', or 'LOW'")
    action_badge: str = Field(..., example="SELL SOON", description="Short visual action tag")
    confidence_score_percent: int = Field(..., example=92, description="Confidence score (0-100)")
    price_forecast: str = Field(..., example="+₹75/q peak expected", description="Price movement projection")
    trend_direction: str = Field(..., example="UP", description="Recent price trajectory")
    change_7d_percent: float = Field(..., example=4.5, description="7-day price percentage change")
    rationale: str = Field(..., description="Human-friendly explanation based on price trend and perishability")
    quality_grade: str = Field(default="B", example="A")
    grade_multiplier: float = Field(default=1.00, example=1.10)


class RecommendationItem(BaseModel):
    rank: int = Field(..., example=1, description="Rank ordered by net profit per quintal")
    mandi_id: int
    mandi_name: str
    state: str
    district: str
    latitude: Optional[float] = Field(None, example=25.2138)
    longitude: Optional[float] = Field(None, example=75.8648)
    distance_km: float
    travel_time_hours: float
    badges: List[str] = Field(default_factory=list, example=["BEST PROFIT", "RECOMMENDED"])
    cost_breakdown: CostBreakdown
    trend: PriceTrendInfo
    sale_window: Optional[SaleWindowInfo] = None
    recommendation_reason: str = Field(..., description="Clear explanation of why this mandi is ranked here")


class RecommendationResponse(BaseModel):
    crop_name: str
    quantity_quintals: float
    quality_grade: Optional[str] = "B"
    farmer_location: Dict[str, float]
    total_mandis_evaluated: int
    recommendations: List[RecommendationItem]
    top_recommendation: Optional[RecommendationItem] = None
    sale_window_recommendation: Optional[SaleWindowInfo] = None
    comparison_summary: str
