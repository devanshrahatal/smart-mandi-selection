"""
CostConfig model — per-mandi cost parameters used by the net profit engine.
Admins can edit these via the dashboard (Phase 7).
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class CostConfig(Base):
    __tablename__ = "cost_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Commission charged by the mandi / arthiya (agent), as a percentage of sale price
    commission_percentage = Column(Float, nullable=False, default=6.0)  # e.g. 6.0 = 6%

    # Fixed cost per quintal for loading at origin and unloading at mandi
    loading_cost_per_quintal = Column(Float, nullable=False, default=30.0)    # ₹
    unloading_cost_per_quintal = Column(Float, nullable=False, default=20.0)  # ₹

    # Transport rate — used when Google Maps API is unavailable or for cost estimation
    transport_rate_per_km_per_quintal = Column(Float, nullable=False, default=2.5)  # ₹

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(100), nullable=True)  # admin username who last edited

    # Relationships
    mandi = relationship("Mandi", back_populates="cost_config")

    def __repr__(self):
        return f"<CostConfig(mandi_id={self.mandi_id}, commission={self.commission_percentage}%)>"
