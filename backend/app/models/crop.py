"""
Crop model — represents a crop type that farmers sell.
The perishability_index drives spoilage risk calculations in the cost engine.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    category = Column(String(50), nullable=False)  # e.g. "Vegetable", "Fruit", "Grain", "Spice"
    perishability_index = Column(Float, nullable=False, default=0.5)
    # ^ 0.0 = non-perishable (wheat, rice), 1.0 = extremely perishable (strawberry, leafy greens)
    unit = Column(String(30), nullable=False, default="quintal")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    prices = relationship("MandiPrice", back_populates="crop", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Crop(id={self.id}, name='{self.name}', perishability={self.perishability_index})>"
