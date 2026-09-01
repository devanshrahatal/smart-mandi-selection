"""
Pydantic schemas for Warehouses, Cold Storages, Escrow Transactions, Digital Receipts, and Grievances.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# -------------------------------------------------------------
# WAREHOUSE SCHEMAS
# -------------------------------------------------------------

class WarehouseBase(BaseModel):
    name: str = Field(..., example="Sheetal Cold Storage & Logistics")
    facility_type: str = Field(default="Cold Storage", example="Cold Storage")
    is_wdra_registered: bool = True
    registration_no: Optional[str] = "WDRA/RAJ/2024/092"
    capacity_mt: float = Field(..., example=5000.0)
    available_capacity_mt: float = Field(..., example=1200.0)
    storage_rate_per_quintal_per_month: float = Field(..., example=35.0)
    state: str = Field(..., example="Rajasthan")
    district: str = Field(..., example="Jaipur")
    address: str = Field(..., example="NH-52, Chomu Industrial Area, Jaipur 303702")
    latitude: float = Field(..., example=26.9800)
    longitude: float = Field(..., example=75.7200)
    contact_person: str = Field(..., example="Mukesh Choudhary")
    contact_phone: str = Field(..., example="+919829567890")
    temperature_range: Optional[str] = "2°C - 8°C"
    suitable_crops: str = Field(default="Tomato, Potato, Onion", example="Tomato, Potato, Onion")


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseOut(WarehouseBase):
    id: int
    distance_km: Optional[float] = None
    shelf_life_extension_days: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# TRANSACTION & ESCROW SCHEMAS
# -------------------------------------------------------------

class TransactionCreate(BaseModel):
    lot_id: Optional[int] = None
    buyer_id: Optional[int] = None
    farmer_name: str
    farmer_phone: str
    buyer_name: str
    crop_name: str
    quantity_quintals: float
    agreed_price_per_q: float
    pickup_address: str
    notes: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    transaction_id: str
    lot_id: Optional[int] = None
    buyer_id: Optional[int] = None
    farmer_name: str
    farmer_phone: str
    buyer_name: str
    crop_name: str
    quantity_quintals: float
    agreed_price_per_q: float
    gross_amount: float
    freight_deduction: float
    platform_fee: float
    net_payable_to_farmer: float
    escrow_status: str
    payment_method: str
    pickup_address: str
    qr_receipt_code: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EscrowUpdate(BaseModel):
    new_status: str = Field(..., example="QC_PASSED", description="'ESCROW_LOCKED', 'QC_PASSED', 'DISPATCHED', 'SETTLED'")


# -------------------------------------------------------------
# DISPUTE & GRIEVANCE SCHEMAS
# -------------------------------------------------------------

class DisputeCreate(BaseModel):
    complainant_name: str = Field(..., example="Ram Lal Meena")
    complainant_phone: str = Field(..., example="+919829123456")
    target_entity_name: str = Field(..., example="Azadpur Mandi / BigBasket Hub")
    dispute_category: str = Field(..., example="Weight Discrepancy")
    severity: str = Field(default="HIGH", example="HIGH")
    description: str = Field(..., example="Dispatched 30q loaded in truck, but APMC weigher reported 27.5q without tare weight check.")
    disputed_amount: Optional[str] = "₹6,500"


class DisputeOut(BaseModel):
    id: int
    ticket_id: str
    complainant_name: str
    complainant_phone: str
    target_entity_name: str
    dispute_category: str
    severity: str
    description: str
    disputed_amount: Optional[str] = None
    status: str
    resolution_summary: Optional[str] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DisputeResolveRequest(BaseModel):
    resolution_summary: str = Field(..., example="APMC weighbridge re-calibrated. Compensated ₹6,500 via direct DBT transfer.")
