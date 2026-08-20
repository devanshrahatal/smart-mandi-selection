"""
Pydantic schemas for Crop entities and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CropBase(BaseModel):
    name: str = Field(..., example="Tomato")
    category: str = Field(..., example="Vegetable")
    perishability_index: float = Field(0.5, ge=0.0, le=1.0, description="0.0 (non-perishable) to 1.0 (highly perishable)")
    unit: str = Field("quintal", example="quintal")


class CropCreate(CropBase):
    pass


class CropOut(CropBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
