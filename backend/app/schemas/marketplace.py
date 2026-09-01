"""
Pydantic schemas for Marketplace, Verified Buyers, Farmer Lots, and Digital Offers.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# -------------------------------------------------------------
# BUYER SCHEMAS
# -------------------------------------------------------------

class BuyerBase(BaseModel):
    business_name: str = Field(..., example="ITC Choupal Sourcing Hub")
    buyer_type: str = Field(..., example="Food Processor")
    gst_number: str = Field(..., example="08AABCI1234F1Z5")
    is_verified: bool = True
    rating: float = Field(default=4.8, example=4.8)
    state: str = Field(..., example="Rajasthan")
    district: str = Field(..., example="Jaipur")
    mandi_id: Optional[int] = None
    preferred_crops: str = Field(..., example="Tomato, Potato, Wheat")
    min_volume_quintals: float = Field(default=10.0, example=15.0)
    payment_terms: str = Field(default="Instant UPI / 24-hr NEFT", example="Instant UPI / 24-hr NEFT")
    contact_person: str = Field(..., example="Vikram Sharma")
    contact_phone: str = Field(..., example="+919829012345")


class BuyerCreate(BuyerBase):
    pass


class BuyerOut(BuyerBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# OFFER SCHEMAS
# -------------------------------------------------------------

class OfferCreate(BaseModel):
    buyer_id: int
    offered_price_per_q: float = Field(..., gt=0.0, example=2450.0)
    pickup_option: str = Field(default="Farmgate Pickup", example="Farmgate Pickup")


class OfferOut(BaseModel):
    id: int
    offer_id: str
    lot_id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_type: Optional[str] = None
    buyer_phone: Optional[str] = None
    offered_price_per_q: float
    pickup_option: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OfferActionRequest(BaseModel):
    action: str = Field(..., example="accept", description="'accept' or 'reject'")


# -------------------------------------------------------------
# LOT SCHEMAS
# -------------------------------------------------------------

class LotCreate(BaseModel):
    farmer_name: str = Field(..., example="Rameshwar Patel")
    phone_number: str = Field(..., example="+919876543210")
    crop_name: str = Field(..., example="Tomato")
    quantity_quintals: float = Field(..., gt=0.0, example=25.0)
    quality_grade: str = Field(default="A", example="A")
    expected_price_per_q: float = Field(..., gt=0.0, example=2400.0)
    origin_location: str = Field(..., example="Chomu, Jaipur, Rajasthan")
    harvest_date: str = Field(..., example="2026-08-28")


class LotOut(BaseModel):
    id: int
    lot_id: str
    farmer_name: str
    phone_number: str
    crop_name: str
    quantity_quintals: float
    quality_grade: str
    expected_price_per_q: float
    origin_location: str
    harvest_date: str
    status: str
    created_at: Optional[datetime] = None
    offers: List[OfferOut] = []

    class Config:
        from_attributes = True
