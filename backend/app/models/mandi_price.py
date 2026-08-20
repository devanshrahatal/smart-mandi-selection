"""
MandiPrice model — daily price records for a crop at a specific mandi.
Stores min, max, and modal (most common) price per quintal.
This is the primary data source for recommendations and trend analysis.
"""

from sqlalchemy import Column, Integer, Float, Date, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    min_price = Column(Float, nullable=False)        # ₹ per quintal — lowest transaction
    max_price = Column(Float, nullable=False)        # ₹ per quintal — highest transaction
    modal_price = Column(Float, nullable=False)      # ₹ per quintal — most common transaction
    date = Column(Date, nullable=False, index=True)  # the trading day this price applies to
    source = Column(String(50), nullable=False, default="seed_data")  # "agmarknet" | "seed_data" | "manual"
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Prevent duplicate prices for the same mandi + crop + date
    __table_args__ = (
        UniqueConstraint("mandi_id", "crop_id", "date", name="uq_mandi_crop_date"),
    )

    # Relationships
    mandi = relationship("Mandi", back_populates="prices")
    crop = relationship("Crop", back_populates="prices")

    def __repr__(self):
        return f"<MandiPrice(mandi_id={self.mandi_id}, crop_id={self.crop_id}, modal=₹{self.modal_price}, date={self.date})>"
