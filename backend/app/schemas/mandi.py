"""
Pydantic schemas for Mandi and CostConfig entities.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CostConfigBase(BaseModel):
    commission_percentage: float = Field(6.0, ge=0.0, le=30.0, description="Commission percentage (%)")
    loading_cost_per_quintal: float = Field(30.0, ge=0.0, description="Loading cost per quintal (₹)")
    unloading_cost_per_quintal: float = Field(20.0, ge=0.0, description="Unloading cost per quintal (₹)")
    transport_rate_per_km_per_quintal: float = Field(2.5, ge=0.0, description="Base transport rate (₹/km/q)")


class CostConfigOut(CostConfigBase):
    id: int
    mandi_id: int
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


class MandiBase(BaseModel):
    name: str = Field(..., example="Azadpur Mandi")
    state: str = Field(..., example="Delhi")
    district: str = Field(..., example="North Delhi")
    address: Optional[str] = None
    latitude: float = Field(..., example=28.7041)
    longitude: float = Field(..., example=77.1725)
    is_active: bool = True


class MandiCreate(MandiBase):
    pass


class MandiOut(MandiBase):
    id: int
    created_at: Optional[datetime] = None
    cost_config: Optional[CostConfigOut] = None

    class Config:
        from_attributes = True
