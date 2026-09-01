"""
Warehouse & Cold Storage Model — WDRA Registered Warehouses & Private Cold Storages.
Enables farmers to map nearby storage facilities, prevent distress sales, and extend shelf life.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False, index=True)
    facility_type = Column(String(50), nullable=False)  # "Cold Storage" | "Dry Warehouse" | "Silo" | "Packhouse"
    is_wdra_registered = Column(Boolean, default=True, nullable=False)
    registration_no = Column(String(50), nullable=True)  # e.g. "WDRA/RAJ/2024/092"
    capacity_mt = Column(Float, nullable=False)  # Metric Tonnes
    available_capacity_mt = Column(Float, nullable=False)
    storage_rate_per_quintal_per_month = Column(Float, nullable=False)  # ₹/q/month
    state = Column(String(50), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_person = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    temperature_range = Column(String(40), default="2°C - 8°C", nullable=True)
    suitable_crops = Column(String(255), default="Tomato, Potato, Onion, Apple, Grapes", nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<Warehouse(id={self.id}, name='{self.name}', type='{self.facility_type}', cap={self.capacity_mt}MT)>"
