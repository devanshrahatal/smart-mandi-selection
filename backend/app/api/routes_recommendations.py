"""
Mandi Recommendation, Quality Grading, Sale-Window and Net Profit API Routes.
Evaluates candidate mandis, calculates itemized costs, ranks by net profit,
and generates comparative intelligence and harvest timing recommendations for farmers.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.mandi import Mandi
from app.models.crop import Crop
from app.models.cost_config import CostConfig
from app.models.farmer_query import FarmerQuery
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    CostBreakdown,
    PriceTrendInfo,
    SaleWindowInfo,
)
from app.schemas.crop import CropOut
from app.schemas.mandi import MandiOut
from app.services.distance_service import distance_service
from app.services.agmarknet_service import agmarknet_service
from app.services.cost_engine import cost_engine
from app.services.trend_engine import trend_engine
from app.services.sale_window_service import sale_window_service
from app.services.ml_price_forecaster import ml_forecaster

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Recommendations"])


@router.get("/crops", response_model=List[CropOut], summary="List all supported crops")
def list_crops(db: Session = Depends(get_db)):
    """Returns all crops available in the system with their perishability index."""
    if db.query(Crop).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as err:
            logger.warning("Auto-seed in list_crops failed: %s", err)
    return db.query(Crop).order_by(Crop.name.asc()).all()


@router.get("/mandis", response_model=List[MandiOut], summary="List all tracked mandis")
def list_mandis(db: Session = Depends(get_db)):
    """Returns all active mandis with their location coordinates and default cost configurations."""
    if db.query(Mandi).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as err:
            logger.warning("Auto-seed in list_mandis failed: %s", err)
    return db.query(Mandi).filter(Mandi.is_active == True).order_by(Mandi.name.asc()).all()


@router.get("/recommendations/sale-window", response_model=SaleWindowInfo, summary="Get optimal sale-window timing advice")
def get_sale_window_timing(
    mandi_id: int = Query(..., description="Target Mandi ID"),
    crop_id: int = Query(..., description="Crop ID"),
    quality_grade: str = Query("B", description="Quality Grade ('A', 'B', 'C')"),
    db: Session = Depends(get_db),
):
    """
    Computes optimal harvest sale window advice based on price momentum,
    crop perishability decay, and market arrival trend.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    mandi = db.query(Mandi).filter(Mandi.id == mandi_id).first()
    if not mandi:
        raise HTTPException(status_code=404, detail="Mandi not found")

    price_info = agmarknet_service.get_latest_price_with_fallback(db, mandi_id=mandi.id, crop_id=crop.id)
    modal_price = price_info["modal_price"]

    result = sale_window_service.calculate_sale_window(
        db=db,
        mandi_id=mandi.id,
        crop_id=crop.id,
        crop=crop,
        modal_price=modal_price,
        quality_grade=quality_grade,
    )
    return SaleWindowInfo(**result)


@router.get("/ml/forecast/{mandi_id}/{crop_id}", summary="Trained Machine Learning 7-Day Price Forecast & Metrics")
def get_ml_price_forecast(
    mandi_id: int,
    crop_id: int,
    days: int = Query(7, ge=1, le=14, description="Forecast horizon in days"),
    db: Session = Depends(get_db),
):
    """
    Trains a Scikit-Learn Ridge Regressor on historical mandi modal prices and generates
    7-day forward predictions with R² accuracy score, RMSE, and 95% confidence intervals.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    mandi = db.query(Mandi).filter(Mandi.id == mandi_id).first()
    if not mandi:
        raise HTTPException(status_code=404, detail="Mandi not found")

    forecast = ml_forecaster.train_and_forecast(
        db=db,
        mandi_id=mandi_id,
        crop_id=crop_id,
        forecast_days=days,
    )
    return {
        "mandi": {"id": mandi.id, "name": mandi.name, "district": mandi.district, "state": mandi.state},
        "crop": {"id": crop.id, "name": crop.name, "category": crop.category},
        **forecast,
    }



@router.post("/recommendations", response_model=RecommendationResponse, summary="Get ranked mandi recommendations")
async def get_mandi_recommendations(
    req: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """
    Main recommendation engine endpoint.
    Given crop, quantity, quality grade, and farmer GPS coordinates, returns all nearby candidate mandis
    ranked by NET PROFIT with full cost breakdown, price trends, and optimal sale-window timing.
    """
    # 1. Resolve Crop
    crop = (
        db.query(Crop)
        .filter(Crop.name.ilike(req.crop_name.strip()))
        .first()
    )
    if not crop:
        crop = db.query(Crop).filter(Crop.name.ilike(f"%{req.crop_name.strip()}%")).first()

    if not crop:
        available_names = [c.name for c in db.query(Crop).all()]
        raise HTTPException(
            status_code=404,
            detail=f"Crop '{req.crop_name}' not found. Supported crops: {', '.join(available_names)}",
        )

    # 2. Fetch all active mandis with their cost configs
    mandis = db.query(Mandi).filter(Mandi.is_active == True).all()
    if not mandis:
        raise HTTPException(status_code=500, detail="No active mandis configured in the database.")

    candidate_evaluations: List[dict] = []
    grade = (req.quality_grade or "B").strip().upper()

    for mandi in mandis:
        cost_cfg = mandi.cost_config
        if not cost_cfg:
            cost_cfg = CostConfig(
                mandi_id=mandi.id,
                commission_percentage=6.0,
                loading_cost_per_quintal=30.0,
                unloading_cost_per_quintal=20.0,
                transport_rate_per_km_per_quintal=2.5,
            )

        # Compute distance and driving duration
        dist_info = await distance_service.get_distance_and_time(
            origin_lat=req.farmer_latitude,
            origin_lon=req.farmer_longitude,
            dest_lat=mandi.latitude,
            dest_lon=mandi.longitude,
        )

        distance_km = dist_info["distance_km"]
        travel_hours = dist_info["travel_time_hours"]

        # Filter by radius if provided
        if req.max_radius_km and distance_km > req.max_radius_km:
            continue

        # Fetch latest price
        price_info = agmarknet_service.get_latest_price_with_fallback(
            db=db,
            mandi_id=mandi.id,
            crop_id=crop.id,
        )
        modal_price = price_info["modal_price"]

        # Calculate Net Profit with Quality Grade
        cost_data = cost_engine.calculate_net_profit(
            modal_price=modal_price,
            quantity_quintals=req.quantity_quintals,
            distance_km=distance_km,
            travel_time_hours=travel_hours,
            crop=crop,
            cost_config=cost_cfg,
            quality_grade=grade,
        )

        # Calculate 7-day and 14-day trend
        trend_data = trend_engine.calculate_price_trend(
            db=db,
            mandi_id=mandi.id,
            crop_id=crop.id,
            days=14,
        )

        # Calculate sale-window advice for this mandi
        sale_window_data = sale_window_service.calculate_sale_window(
            db=db,
            mandi_id=mandi.id,
            crop_id=crop.id,
            crop=crop,
            modal_price=modal_price,
            quality_grade=grade,
        )

        candidate_evaluations.append({
            "mandi": mandi,
            "distance_km": distance_km,
            "travel_time_hours": travel_hours,
            "cost_data": cost_data,
            "trend_data": trend_data,
            "sale_window_data": sale_window_data,
        })

    if not candidate_evaluations:
        raise HTTPException(
            status_code=404,
            detail=f"No mandis found within {req.max_radius_km} km radius.",
        )

    # 3. Sort by Net Profit per Quintal (Descending)
    candidate_evaluations.sort(
        key=lambda x: x["cost_data"]["net_profit_per_quintal"],
        reverse=True,
    )

    min_distance = min(c["distance_km"] for c in candidate_evaluations)
    max_raw_price = max(c["cost_data"]["modal_price_per_quintal"] for c in candidate_evaluations)

    ranked_items: List[RecommendationItem] = []

    for rank_idx, item in enumerate(candidate_evaluations, start=1):
        mandi = item["mandi"]
        c_data = item["cost_data"]
        t_data = item["trend_data"]
        sw_data = item["sale_window_data"]
        dist_km = item["distance_km"]
        travel_h = item["travel_time_hours"]

        badges: List[str] = []
        reasons: List[str] = []

        if rank_idx == 1:
            badges.append("BEST PROFIT")
            badges.append("RECOMMENDED")
            reasons.append(f"Highest net take-home earnings of ₹{c_data['net_profit_per_quintal']:,.2f}/q.")

        if dist_km == min_distance:
            badges.append("NEAREST")
            reasons.append(f"Closest mandi ({dist_km} km, ~{travel_h}h).")

        if c_data["modal_price_per_quintal"] == max_raw_price:
            badges.append("HIGHEST RAW PRICE")
            if rank_idx > 1:
                reasons.append(
                    f"Offers highest gross price (₹{c_data['modal_price_per_quintal']:,.2f}), but higher transport/commission deductions reduce your take-home."
                )

        if t_data["direction"] == "UP":
            badges.append("TRENDING UP")
            reasons.append(f"Price trending upward (+{t_data['change_7d_percent']}% in 7 days).")

        if sw_data.get("action_badge"):
            badges.append(sw_data["action_badge"])

        if not reasons:
            reasons.append(
                f"Balanced option with {dist_km} km travel distance and {c_data['commission_percentage']}% commission."
            )

        recommendation_reason = " ".join(reasons)

        breakdown = CostBreakdown(
            raw_modal_price=c_data.get("raw_modal_price"),
            quality_grade=c_data.get("quality_grade", "B"),
            grade_multiplier=c_data.get("grade_multiplier", 1.00),
            modal_price_per_quintal=c_data["modal_price_per_quintal"],
            transport_cost_per_quintal=c_data["transport_cost_per_quintal"],
            loading_unloading_cost_per_quintal=c_data["loading_unloading_cost_per_quintal"],
            commission_per_quintal=c_data["commission_per_quintal"],
            commission_percentage=c_data["commission_percentage"],
            spoilage_risk_deduction_per_quintal=c_data["spoilage_risk_deduction_per_quintal"],
            total_deductions_per_quintal=c_data["total_deductions_per_quintal"],
            net_profit_per_quintal=c_data["net_profit_per_quintal"],
            total_net_profit=c_data["total_net_profit"],
        )

        trend_info = PriceTrendInfo(
            direction=t_data["direction"],
            change_7d_percent=t_data["change_7d_percent"],
            change_14d_percent=t_data["change_14d_percent"],
            average_price_7d=t_data["average_price_7d"],
            min_price_7d=t_data["min_price_7d"],
            max_price_7d=t_data["max_price_7d"],
        )

        sale_window_info = SaleWindowInfo(**sw_data)

        ranked_items.append(
            RecommendationItem(
                rank=rank_idx,
                mandi_id=mandi.id,
                mandi_name=mandi.name,
                state=mandi.state,
                district=mandi.district,
                latitude=mandi.latitude,
                longitude=mandi.longitude,
                distance_km=dist_km,
                travel_time_hours=travel_h,
                badges=badges,
                cost_breakdown=breakdown,
                trend=trend_info,
                sale_window=sale_window_info,
                recommendation_reason=recommendation_reason,
            )
        )

    # Top recommendation and comparison summary
    top_item = ranked_items[0]
    total_batch_profit = top_item.cost_breakdown.total_net_profit

    # Build comparative summary
    summary_parts = [
        f"For {req.quantity_quintals} quintals of {crop.name} (Grade {grade}), {top_item.mandi_name} in {top_item.district} delivers the highest net take-home earnings of ₹{top_item.cost_breakdown.net_profit_per_quintal:,.2f}/quintal (Total: ₹{total_batch_profit:,.2f}).",
        f"Timing Advice: {top_item.sale_window.recommended_window} ({top_item.sale_window.price_forecast})."
    ]
    if len(ranked_items) >= 2:
        runner_up = ranked_items[1]
        diff_per_q = top_item.cost_breakdown.net_profit_per_quintal - runner_up.cost_breakdown.net_profit_per_quintal
        total_diff = diff_per_q * req.quantity_quintals
        summary_parts.append(
            f"Selling here yields ₹{diff_per_q:,.2f} more per quintal (+₹{total_diff:,.2f} total) compared to {runner_up.mandi_name}."
        )

    comparison_summary = " ".join(summary_parts)

    # 4. Optional: Log query to farmer_queries for analytics
    try:
        query_log = FarmerQuery(
            phone_number=req.phone_number or "web_user",
            crop_id=crop.id,
            crop_name=crop.name,
            latitude=req.farmer_latitude,
            longitude=req.farmer_longitude,
            quantity_quintals=req.quantity_quintals,
            recommended_mandi_id=top_item.mandi_id,
            query_text=f"{crop.name} ({grade}) - {req.quantity_quintals}q",
            response_text=comparison_summary,
        )
        db.add(query_log)
        db.commit()
    except Exception as e:
        logger.warning("Failed to log farmer query: %s", e)

    return RecommendationResponse(
        crop_name=crop.name,
        quantity_quintals=req.quantity_quintals,
        quality_grade=grade,
        farmer_location={
            "latitude": req.farmer_latitude,
            "longitude": req.farmer_longitude,
        },
        total_mandis_evaluated=len(ranked_items),
        recommendations=ranked_items,
        top_recommendation=top_item,
        sale_window_recommendation=top_item.sale_window,
        comparison_summary=comparison_summary,
    )
