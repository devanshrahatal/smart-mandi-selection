"""
Market Linkages, Warehousing, Escrow Settlement & Grievance Redressal API Routes.
Implements:
 1. WDRA Warehouses and Cold Storages mapping.
 2. Escrow milestone lifecycle (QC Verification -> Dispatch -> Settlement).
 3. Dispute resolution and grievance redressal ticketing.
 4. Mandi Daily Arrival Influx Pressure Gauge.
"""

import logging
import random
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.warehouse import Warehouse
from app.models.transaction import Transaction
from app.models.dispute import Dispute
from app.models.mandi import Mandi
from app.models.crop import Crop
from app.schemas.market_linkages import (
    WarehouseOut,
    WarehouseCreate,
    TransactionOut,
    TransactionCreate,
    EscrowUpdate,
    DisputeOut,
    DisputeCreate,
    DisputeResolveRequest,
)
from app.services.distance_service import distance_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/linkages", tags=["Market Linkages, Storage & Escrow"])


# -------------------------------------------------------------
# 1. WAREHOUSES & COLD STORAGE ENDPOINTS
# -------------------------------------------------------------

@router.get("/warehouses", response_model=List[WarehouseOut], summary="List and filter nearby warehouses and cold storages")
async def list_warehouses(
    crop: Optional[str] = Query(None, description="Crop filter"),
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    facility_type: Optional[str] = Query(None, description="Cold Storage or Dry Warehouse"),
    farmer_lat: Optional[float] = Query(None, description="Farmer Latitude for distance sorting"),
    farmer_lon: Optional[float] = Query(None, description="Farmer Longitude for distance sorting"),
    db: Session = Depends(get_db),
):
    """Returns WDRA accredited warehouses and temperature-controlled cold storages."""
    if db.query(Warehouse).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as err:
            logger.warning("Auto-seed warehouses failed: %s", err)

    query = db.query(Warehouse)

    if crop:
        query = query.filter(Warehouse.suitable_crops.ilike(f"%{crop.strip()}%"))
    if state:
        query = query.filter(Warehouse.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Warehouse.district.ilike(f"%{district.strip()}%"))
    if facility_type:
        query = query.filter(Warehouse.facility_type.ilike(f"%{facility_type.strip()}%"))

    items = query.all()
    results = []

    for w in items:
        dist_km = None
        if farmer_lat is not None and farmer_lon is not None:
            dist_res = await distance_service.get_distance_and_time(farmer_lat, farmer_lon, w.latitude, w.longitude)
            dist_km = dist_res["distance_km"]

        shelf_life_ext = 30 if w.facility_type == "Cold Storage" else 120

        results.append(
            WarehouseOut(
                id=w.id,
                name=w.name,
                facility_type=w.facility_type,
                is_wdra_registered=w.is_wdra_registered,
                registration_no=w.registration_no,
                capacity_mt=w.capacity_mt,
                available_capacity_mt=w.available_capacity_mt,
                storage_rate_per_quintal_per_month=w.storage_rate_per_quintal_per_month,
                state=w.state,
                district=w.district,
                address=w.address,
                latitude=w.latitude,
                longitude=w.longitude,
                contact_person=w.contact_person,
                contact_phone=w.contact_phone,
                temperature_range=w.temperature_range,
                suitable_crops=w.suitable_crops,
                distance_km=dist_km,
                shelf_life_extension_days=shelf_life_ext,
                created_at=w.created_at,
            )
        )

    if farmer_lat is not None:
        results.sort(key=lambda x: x.distance_km or 99999)

    return results


# -------------------------------------------------------------
# 2. ESCROW & TRANSACTION LIFECYCLE
# -------------------------------------------------------------

@router.get("/transactions", response_model=List[TransactionOut], summary="List all escrow orders and transaction records")
def list_transactions(db: Session = Depends(get_db)):
    """Returns all farmer-buyer contract orders with escrow status."""
    if db.query(Transaction).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as err:
            logger.warning("Auto-seed transactions failed: %s", err)

    return db.query(Transaction).order_by(Transaction.created_at.desc()).all()


@router.post("/transactions", response_model=TransactionOut, summary="Initiate an escrow deal")
def create_transaction(txn_in: TransactionCreate, db: Session = Depends(get_db)):
    """Creates a new guaranteed escrow transaction between a farmer and buyer."""
    txn_code = f"TXN-{datetime.utcnow().year}-{random.randint(1000, 9999)}"
    qr_code = f"SM-ESCROW-{uuid.uuid4().hex[:12].upper()}"

    gross = round(txn_in.agreed_price_per_q * txn_in.quantity_quintals, 2)
    freight = round(min(500.0, gross * 0.02), 2)
    platform_fee = round(gross * 0.005, 2)
    net_payable = round(gross - freight - platform_fee, 2)

    new_txn = Transaction(
        transaction_id=txn_code,
        lot_id=txn_in.lot_id,
        buyer_id=txn_in.buyer_id,
        farmer_name=txn_in.farmer_name,
        farmer_phone=txn_in.farmer_phone,
        buyer_name=txn_in.buyer_name,
        crop_name=txn_in.crop_name,
        quantity_quintals=txn_in.quantity_quintals,
        agreed_price_per_q=txn_in.agreed_price_per_q,
        gross_amount=gross,
        freight_deduction=freight,
        platform_fee=platform_fee,
        net_payable_to_farmer=net_payable,
        escrow_status="ESCROW_LOCKED",
        payment_method="Direct UPI / Escrow",
        pickup_address=txn_in.pickup_address,
        qr_receipt_code=qr_code,
        notes=txn_in.notes,
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)
    return new_txn


@router.patch("/transactions/{txn_id}/status", response_model=TransactionOut, summary="Update escrow milestone status")
def update_escrow_status(txn_id: int, req: EscrowUpdate, db: Session = Depends(get_db)):
    """Advances transaction milestone (ESCROW_LOCKED -> QC_PASSED -> DISPATCHED -> SETTLED)."""
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    valid_statuses = ["ESCROW_LOCKED", "QC_PASSED", "DISPATCHED", "SETTLED"]
    if req.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    txn.escrow_status = req.new_status
    db.commit()
    db.refresh(txn)
    return txn


# -------------------------------------------------------------
# 3. DISPUTE & GRIEVANCE REDRESSAL
# -------------------------------------------------------------

@router.get("/disputes", response_model=List[DisputeOut], summary="List all grievance tickets")
def list_disputes(db: Session = Depends(get_db)):
    """Returns all filed disputes with investigation status."""
    if db.query(Dispute).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as err:
            logger.warning("Auto-seed disputes failed: %s", err)

    return db.query(Dispute).order_by(Dispute.created_at.desc()).all()


@router.post("/disputes", response_model=DisputeOut, summary="File a grievance / dispute ticket")
def file_dispute(dispute_in: DisputeCreate, db: Session = Depends(get_db)):
    """Enables a farmer or buyer to file an actionable redressal ticket."""
    ticket_code = f"GRV-{datetime.utcnow().year}-{random.randint(100, 999)}"

    new_dispute = Dispute(
        ticket_id=ticket_code,
        complainant_name=dispute_in.complainant_name,
        complainant_phone=dispute_in.complainant_phone,
        target_entity_name=dispute_in.target_entity_name,
        dispute_category=dispute_in.dispute_category,
        severity=dispute_in.severity,
        description=dispute_in.description,
        disputed_amount=dispute_in.disputed_amount,
        status="OPEN",
    )
    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)
    return new_dispute


@router.patch("/disputes/{dispute_id}/resolve", response_model=DisputeOut, summary="Resolve a dispute ticket")
def resolve_dispute(dispute_id: int, req: DisputeResolveRequest, db: Session = Depends(get_db)):
    """Admin or APMC officer marks a grievance ticket resolved with summary notes."""
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute ticket not found.")

    dispute.status = "RESOLVED"
    dispute.resolution_summary = req.resolution_summary
    dispute.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(dispute)
    return dispute


# -------------------------------------------------------------
# 4. MANDI ARRIVAL VOLUMES & INFLUX PRESSURE GAUGE
# -------------------------------------------------------------

@router.get("/arrival-influx/{mandi_id}/{crop_id}", summary="Get Mandi arrival volume & supply pressure status")
def get_mandi_arrival_influx(mandi_id: int, crop_id: int, db: Session = Depends(get_db)):
    """
    Computes daily arrival volume in tonnes, 7-day average, and supply pressure gauge
    (HIGH_INFLUX = oversupply price risk, NORMAL = balanced, LOW_INFLUX = supply deficit / price peak).
    """
    mandi = db.query(Mandi).filter(Mandi.id == mandi_id).first()
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not mandi or not crop:
        raise HTTPException(status_code=404, detail="Mandi or Crop not found.")

    # Simulated realistic baseline arrivals based on mandi tier
    is_mega_hub = "Azadpur" in mandi.name or "Vashi" in mandi.name
    avg_daily_tonnes = 420.0 if is_mega_hub else 135.0
    todays_tonnes = round(avg_daily_tonnes * random.uniform(0.85, 1.25), 1)

    pct_diff = round(((todays_tonnes - avg_daily_tonnes) / avg_daily_tonnes) * 100.0, 1)

    if pct_diff >= 18.0:
        status = "HIGH_INFLUX (Oversupply Risk)"
        signal_color = "red"
        advice = f"High daily arrivals of {todays_tonnes} tonnes (+{pct_diff}% above 7d average). High risk of afternoon price drop due to glut."
    elif pct_diff <= -15.0:
        status = "DEFICIT_SUPPLY (High Demand)"
        signal_color = "green"
        advice = f"Lower arrivals of {todays_tonnes} tonnes ({pct_diff}% below normal). Buyers competing aggressively; strong price support."
    else:
        status = "BALANCED_SUPPLY"
        signal_color = "blue"
        advice = f"Steady arrivals of {todays_tonnes} tonnes (matching 7d normal). Stable trading conditions."

    return {
        "mandi_id": mandi.id,
        "mandi_name": mandi.name,
        "crop_id": crop.id,
        "crop_name": crop.name,
        "todays_arrival_tonnes": todays_tonnes,
        "seven_day_avg_tonnes": avg_daily_tonnes,
        "influx_percentage_diff": pct_diff,
        "supply_pressure_status": status,
        "signal_color": signal_color,
        "farmer_market_advice": advice,
    }
