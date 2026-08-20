"""
Mandi model — represents an agricultural market (APMC / wholesale mandi).
Each mandi has a physical location, state/district, and GPS coordinates.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    prices = relationship("MandiPrice", back_populates="mandi", cascade="all, delete-orphan")
    cost_config = relationship("CostConfig", back_populates="mandi", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Mandi(id={self.id}, name='{self.name}', district='{self.district}', state='{self.state}')>"
