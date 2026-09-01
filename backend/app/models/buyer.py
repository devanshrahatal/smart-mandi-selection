"""
Buyer Model — Verified Institutional Buyers, Processors, Retailers, and Exporters.
Stores business credentials, GST verification status, demand criteria, and payment terms.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_name = Column(String(120), nullable=False, index=True)
    buyer_type = Column(String(50), nullable=False)  # "Food Processor" | "Retail Chain" | "Institutional Buyer" | "Exporter" | "Bulk Trader"
    gst_number = Column(String(30), nullable=False, unique=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    rating = Column(Float, default=4.8, nullable=False)  # Out of 5.0
    state = Column(String(50), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="SET NULL"), nullable=True)
    preferred_crops = Column(String(255), nullable=False)  # Comma-separated: "Tomato, Onion, Potato"
    min_volume_quintals = Column(Float, default=10.0, nullable=False)
    payment_terms = Column(String(80), default="Instant UPI / 24-hr NEFT", nullable=False)
    contact_person = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    mandi = relationship("Mandi", foreign_keys=[mandi_id])
    offers = relationship("Offer", back_populates="buyer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Buyer(id={self.id}, name='{self.business_name}', type='{self.buyer_type}', verified={self.is_verified})>"
