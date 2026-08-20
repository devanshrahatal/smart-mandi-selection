"""
API endpoints for Kisan Pool — Shared Logistics and Truckload Optimization.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.pooling_engine import pooling_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pooling", tags=["Kisan Pooling"])


class PoolCalculationRequest(BaseModel):
    solo_quantity_quintals: float = Field(..., gt=0, example=12.0, description="Farmer individual harvest quantity")
    total_pooled_quantity_quintals: float = Field(..., gt=0, example=36.0, description="Combined pooled harvest quantity")
    distance_km: float = Field(..., gt=0, example=248.0, description="Road distance to terminal mandi")
    target_mandi_name: str = Field("Kota Mandi", example="Kota Mandi", description="Destination APMC market name")


@router.get("/active-pools", summary="List active village pooling batches")
def get_active_pools(
    latitude: Optional[float] = 26.9124,
    longitude: Optional[float] = 75.7873,
    db: Session = Depends(get_db),
):
    """
    Returns active village transport pools with current capacity fill,
    scheduled departure times, and calculated freight savings.
    """
    pools = pooling_engine.find_active_pools(db=db, target_lat=latitude, target_lon=longitude)
    return {
        "count": len(pools),
        "pools": pools,
    }


@router.post("/calculate", summary="Calculate shared freight savings for custom quantities")
def calculate_custom_pool(
    req: PoolCalculationRequest,
):
    """
    Interactive calculator for comparing solo transport vs pooled vehicle freight.
    """
    res = pooling_engine.calculate_pool_savings(
        solo_quantity_quintals=req.solo_quantity_quintals,
        total_pooled_quantity_quintals=req.total_pooled_quantity_quintals,
        distance_km=req.distance_km,
        target_mandi_name=req.target_mandi_name,
    )
    return res
