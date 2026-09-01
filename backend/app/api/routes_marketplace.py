"""
Marketplace & Transaction Enablement API Routes.
Enables Verified Buyer Discovery, Farmer Lot Aggregation, and Digital Bidding / Offers.
"""

import logging
import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.buyer import Buyer
from app.models.lot import Lot
from app.models.offer import Offer
from app.schemas.marketplace import (
    BuyerOut,
    BuyerCreate,
    LotCreate,
    LotOut,
    OfferCreate,
    OfferOut,
    OfferActionRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["Marketplace & Buyer Linkages"])


# -------------------------------------------------------------
# BUYERS ENDPOINTS
# -------------------------------------------------------------

@router.get("/buyers", response_model=List[BuyerOut], summary="List and filter verified buyers")
def list_buyers(
    crop: Optional[str] = Query(None, description="Filter by crop name (e.g. Tomato)"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Rajasthan)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    buyer_type: Optional[str] = Query(None, description="Filter by buyer type (e.g. Food Processor)"),
    db: Session = Depends(get_db),
):
    """Returns verified institutional buyers, food processors, retail chains, and exporters."""
    # Ensure seed data exists if table empty
    if db.query(Buyer).count() == 0:
        try:
            from app.utils.seed_data import seed_database
            seed_database(db)
        except Exception as e:
            logger.warning("Auto-seed buyers failed: %s", e)

    query = db.query(Buyer).filter(Buyer.is_verified == True)

    if crop:
        query = query.filter(Buyer.preferred_crops.ilike(f"%{crop.strip()}%"))
    if state:
        query = query.filter(Buyer.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Buyer.district.ilike(f"%{district.strip()}%"))
    if buyer_type:
        query = query.filter(Buyer.buyer_type.ilike(f"%{buyer_type.strip()}%"))

    return query.order_by(Buyer.rating.desc(), Buyer.business_name.asc()).all()


@router.post("/buyers", response_model=BuyerOut, summary="Register a verified buyer")
def register_buyer(buyer_in: BuyerCreate, db: Session = Depends(get_db)):
    """Registers a new institutional buyer / processor."""
    existing = db.query(Buyer).filter(Buyer.gst_number == buyer_in.gst_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Buyer with this GST number already registered.")

    new_buyer = Buyer(**buyer_in.dict())
    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)
    return new_buyer


# -------------------------------------------------------------
# LOTS & DIGITAL OFFERS ENDPOINTS
# -------------------------------------------------------------

@router.get("/lots", response_model=List[LotOut], summary="List active farmer harvest lots with digital offers")
def list_lots(
    crop: Optional[str] = Query(None, description="Filter lots by crop"),
    status: Optional[str] = Query(None, description="Filter by status ('Active', 'Offer Received', 'Sold')"),
    db: Session = Depends(get_db),
):
    """Returns farmer harvest lots with all incoming digital offers and buyer details."""
    query = db.query(Lot).options(joinedload(Lot.offers).joinedload(Offer.buyer))

    if crop:
        query = query.filter(Lot.crop_name.ilike(f"%{crop.strip()}%"))
    if status:
        query = query.filter(Lot.status == status)

    lots = query.order_by(Lot.created_at.desc()).all()

    # Format nested offers with buyer metadata
    result = []
    for lot in lots:
        formatted_offers = []
        for off in lot.offers:
            formatted_offers.append(
                OfferOut(
                    id=off.id,
                    offer_id=off.offer_id,
                    lot_id=off.lot_id,
                    buyer_id=off.buyer_id,
                    buyer_name=off.buyer.business_name if off.buyer else "Verified Buyer",
                    buyer_type=off.buyer.buyer_type if off.buyer else "Institutional",
                    buyer_phone=off.buyer.contact_phone if off.buyer else "",
                    offered_price_per_q=off.offered_price_per_q,
                    pickup_option=off.pickup_option,
                    status=off.status,
                    created_at=off.created_at,
                )
            )
        result.append(
            LotOut(
                id=lot.id,
                lot_id=lot.lot_id,
                farmer_name=lot.farmer_name,
                phone_number=lot.phone_number,
                crop_name=lot.crop_name,
                quantity_quintals=lot.quantity_quintals,
                quality_grade=lot.quality_grade,
                expected_price_per_q=lot.expected_price_per_q,
                origin_location=lot.origin_location,
                harvest_date=lot.harvest_date,
                status=lot.status,
                created_at=lot.created_at,
                offers=formatted_offers,
            )
        )
    return result


@router.post("/lots", response_model=LotOut, summary="Create a new harvest lot for direct buyer bidding")
def create_lot(lot_in: LotCreate, db: Session = Depends(get_db)):
    """Enables a farmer or FPO to list their harvest lot on the marketplace."""
    # Generate unique Lot ID e.g. LOT-2026-3841
    random_suffix = random.randint(1000, 9999)
    lot_code = f"LOT-{datetime.utcnow().year}-{random_suffix}"

    new_lot = Lot(
        lot_id=lot_code,
        farmer_name=lot_in.farmer_name,
        phone_number=lot_in.phone_number,
        crop_name=lot_in.crop_name,
        quantity_quintals=lot_in.quantity_quintals,
        quality_grade=(lot_in.quality_grade or "B").upper(),
        expected_price_per_q=lot_in.expected_price_per_q,
        origin_location=lot_in.origin_location,
        harvest_date=lot_in.harvest_date,
        status="Active",
    )
    db.add(new_lot)
    db.commit()
    db.refresh(new_lot)

    return LotOut(
        id=new_lot.id,
        lot_id=new_lot.lot_id,
        farmer_name=new_lot.farmer_name,
        phone_number=new_lot.phone_number,
        crop_name=new_lot.crop_name,
        quantity_quintals=new_lot.quantity_quintals,
        quality_grade=new_lot.quality_grade,
        expected_price_per_q=new_lot.expected_price_per_q,
        origin_location=new_lot.origin_location,
        harvest_date=new_lot.harvest_date,
        status=new_lot.status,
        created_at=new_lot.created_at,
        offers=[],
    )


@router.post("/lots/{lot_id}/offers", response_model=OfferOut, summary="Submit a digital purchase offer/bid on a lot")
def place_offer(lot_id: int, offer_in: OfferCreate, db: Session = Depends(get_db)):
    """Enables a verified buyer to submit a digital bid on a farmer's listed lot."""
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Harvest Lot not found.")

    if lot.status == "Sold":
        raise HTTPException(status_code=400, detail="This lot is already sold.")

    buyer = db.query(Buyer).filter(Buyer.id == offer_in.buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found.")

    offer_code = f"BID-{random.randint(10000, 99999)}"

    new_offer = Offer(
        offer_id=offer_code,
        lot_id=lot.id,
        buyer_id=buyer.id,
        offered_price_per_q=offer_in.offered_price_per_q,
        pickup_option=offer_in.pickup_option,
        status="Pending",
    )
    db.add(new_offer)

    # Update lot status
    lot.status = "Offer Received"
    db.commit()
    db.refresh(new_offer)

    return OfferOut(
        id=new_offer.id,
        offer_id=new_offer.offer_id,
        lot_id=new_offer.lot_id,
        buyer_id=buyer.id,
        buyer_name=buyer.business_name,
        buyer_type=buyer.buyer_type,
        buyer_phone=buyer.contact_phone,
        offered_price_per_q=new_offer.offered_price_per_q,
        pickup_option=new_offer.pickup_option,
        status=new_offer.status,
        created_at=new_offer.created_at,
    )


@router.patch("/offers/{offer_id}/action", summary="Farmer accepts or rejects a digital buyer offer")
def handle_offer_action(offer_id: int, req: OfferActionRequest, db: Session = Depends(get_db)):
    """Allows a farmer to accept a buyer's offer (locks deal as Sold) or decline it."""
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")

    lot = db.query(Lot).filter(Lot.id == offer.lot_id).first()
    action = req.action.strip().lower()

    if action == "accept":
        offer.status = "Accepted"
        if lot:
            lot.status = "Sold"
            # Mark all other pending offers on this lot as Rejected
            other_offers = db.query(Offer).filter(Offer.lot_id == lot.id, Offer.id != offer.id, Offer.status == "Pending").all()
            for other in other_offers:
                other.status = "Rejected"
        db.commit()
        return {
            "message": f"Offer {offer.offer_id} accepted successfully! Lot {lot.lot_id if lot else ''} is now SOLD.",
            "status": "Accepted",
            "deal_amount": round(offer.offered_price_per_q * (lot.quantity_quintals if lot else 1), 2),
        }
    elif action == "reject":
        offer.status = "Rejected"
        # Check if there are other offers remaining on this lot
        remaining = db.query(Offer).filter(Offer.lot_id == offer.lot_id, Offer.status == "Pending", Offer.id != offer.id).count()
        if lot and remaining == 0:
            lot.status = "Active"
        db.commit()
        return {
            "message": f"Offer {offer.offer_id} rejected.",
            "status": "Rejected",
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Allowed: 'accept' or 'reject'.")
