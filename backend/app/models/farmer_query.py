"""
FarmerQuery model — logs every recommendation request from a farmer.
Used for analytics on the admin dashboard (query volume, popular crops, etc.).
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func

from app.database import Base


class FarmerQuery(Base):
    __tablename__ = "farmer_queries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone_number = Column(String(20), nullable=False, index=True)  # e.g. "+919876543210"
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
    crop_name = Column(String(150), nullable=True)  # raw text from farmer, in case crop isn't in DB
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    quantity_quintals = Column(Float, nullable=True)
    recommended_mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="SET NULL"), nullable=True)
    query_text = Column(Text, nullable=True)      # original WhatsApp message
    response_text = Column(Text, nullable=True)    # what we sent back
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self):
        return f"<FarmerQuery(id={self.id}, phone='{self.phone_number}', crop='{self.crop_name}')>"
