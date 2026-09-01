"""
Transaction & Escrow Milestone Model.
Tracks farmgate weighing, quality inspection, escrow funding, dispatch, and final DBT release.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String(40), unique=True, nullable=False, index=True)  # e.g. "TXN-2026-9041"
    lot_id = Column(Integer, ForeignKey("lots.id", ondelete="SET NULL"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id", ondelete="SET NULL"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    buyer_name = Column(String(120), nullable=False)
    crop_name = Column(String(50), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    agreed_price_per_q = Column(Float, nullable=False)
    gross_amount = Column(Float, nullable=False)
    freight_deduction = Column(Float, default=0.0, nullable=False)
    platform_fee = Column(Float, default=0.0, nullable=False)
    net_payable_to_farmer = Column(Float, nullable=False)
    escrow_status = Column(String(40), default="ESCROW_LOCKED", nullable=False)  # "ESCROW_LOCKED" | "QC_PASSED" | "DISPATCHED" | "SETTLED"
    payment_method = Column(String(40), default="Direct UPI / Escrow", nullable=False)
    pickup_address = Column(String(255), nullable=False)
    qr_receipt_code = Column(String(100), unique=True, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    lot = relationship("Lot", foreign_keys=[lot_id])
    buyer = relationship("Buyer", foreign_keys=[buyer_id])

    def __repr__(self):
        return f"<Transaction(id='{self.transaction_id}', farmer='{self.farmer_name}', net=₹{self.net_payable_to_farmer}, status='{self.escrow_status}')>"
