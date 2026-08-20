"""
Pydantic schemas for Admin Authentication, Dashboard Analytics, and Cost Configuration updates.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


class LoginRequest(BaseModel):
    username: str = Field("admin", example="admin")
    password: str = Field("admin123", example="admin123")


class AdminUserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: AdminUserOut


class CostConfigUpdate(BaseModel):
    commission_percentage: float = Field(..., ge=0.0, le=30.0, example=5.5)
    loading_cost_per_quintal: float = Field(..., ge=0.0, example=35.0)
    unloading_cost_per_quintal: float = Field(..., ge=0.0, example=25.0)
    transport_rate_per_km_per_quintal: float = Field(..., ge=0.0, example=2.2)


class DashboardMetric(BaseModel):
    label: str
    value: str
    change: Optional[str] = None


class TopCropStat(BaseModel):
    crop_name: str
    query_count: int
    percentage: float


class TopMandiStat(BaseModel):
    mandi_name: str
    state: str
    recommendation_count: int
    avg_modal_price: float


class DashboardOverviewData(BaseModel):
    metrics: List[DashboardMetric]
    top_crops: List[TopCropStat]
    top_mandis: List[TopMandiStat]
    recent_queries: List[Dict[str, Any]]
    total_queries: int
