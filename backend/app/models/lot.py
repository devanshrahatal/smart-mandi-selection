"""
Lot Model — Farmer Harvest Lots for Direct Buyer Sourcing and Digital Offers.
Enables lot aggregation, quality grading, expected price matching, and transaction lifecycle.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lot_id = Column(String(30), unique=True, nullable=False, index=True)  # e.g., "LOT-2026-081"
    farmer_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False, index=True)
    crop_name = Column(String(50), nullable=False, index=True)
    quantity_quintals = Column(Float, nullable=False)
    quality_grade = Column(String(10), default="B", nullable=False)  # "A", "B", "C"
    expected_price_per_q = Column(Float, nullable=False)
    origin_location = Column(String(120), nullable=False)  # e.g. "Chomu, Jaipur, Rajasthan"
    harvest_date = Column(String(30), nullable=False)  # e.g. "2026-08-28"
    status = Column(String(30), default="Active", nullable=False)  # "Active", "Offer Received", "Sold"
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    offers = relationship("Offer", back_populates="lot", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Lot(lot_id='{self.lot_id}', crop='{self.crop_name}', qty={self.quantity_quintals}q, status='{self.status}')>"
