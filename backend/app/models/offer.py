"""
Offer Model — Digital Bids and Purchase Offers from Verified Buyers on Farmer Lots.
Supports price bidding, farmgate pickup vs mandi delivery options, and acceptance workflow.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    offer_id = Column(String(30), unique=True, nullable=False, index=True)  # e.g., "OFFER-1042"
    lot_id = Column(Integer, ForeignKey("lots.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False, index=True)
    offered_price_per_q = Column(Float, nullable=False)
    pickup_option = Column(String(40), default="Farmgate Pickup", nullable=False)  # "Farmgate Pickup" | "Mandi Delivery"
    status = Column(String(30), default="Pending", nullable=False)  # "Pending", "Accepted", "Rejected"
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    lot = relationship("Lot", back_populates="offers")
    buyer = relationship("Buyer", back_populates="offers")

    def __repr__(self):
        return f"<Offer(offer_id='{self.offer_id}', lot_id={self.lot_id}, price=₹{self.offered_price_per_q}, status='{self.status}')>"
