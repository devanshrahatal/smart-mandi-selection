"""
Scheduled price refresh background job using APScheduler.
Periodically fetches updated mandi prices from Agmarknet API (or generates
day-to-day dynamic updates) and syncs them into `mandi_prices` table and Redis cache.
"""

import logging
from datetime import date
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.mandi import Mandi
from app.models.crop import Crop
from app.models.mandi_price import MandiPrice
from app.services.agmarknet_service import agmarknet_service
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

# Singleton scheduler instance
scheduler = AsyncIOScheduler()


async def sync_mandi_prices_task():
    """
    Background job execution:
    Iterates through all active mandis and crops, fetches latest price,
    and updates database & cache.
    """
    logger.info("Starting scheduled mandi price refresh job...")
    db: Session = SessionLocal()
    try:
        mandis = db.query(Mandi).filter(Mandi.is_active == True).all()
        crops = db.query(Crop).all()
        today = date.today()
        updated_count = 0

        for mandi in mandis:
            for crop in crops:
                # 1. Attempt live fetch from Agmarknet
                live_data = await agmarknet_service.fetch_live_price(
                    crop_name=crop.name,
                    state=mandi.state,
                    district=mandi.district,
                    market_name=mandi.name,
                )

                if live_data:
                    min_p = live_data["min_price"]
                    max_p = live_data["max_price"]
                    modal_p = live_data["modal_price"]
                    source = live_data["source"]
                else:
                    # If live API is not configured/available, fetch latest DB price to keep cache warm
                    existing = (
                        db.query(MandiPrice)
                        .filter(MandiPrice.mandi_id == mandi.id, MandiPrice.crop_id == crop.id)
                        .order_by(MandiPrice.date.desc())
                        .first()
                    )
                    if existing:
                        min_p = float(existing.min_price)
                        max_p = float(existing.max_price)
                        modal_p = float(existing.modal_price)
                        source = existing.source
                    else:
                        continue

                # 2. Check if a price record for today already exists (upsert)
                today_record = (
                    db.query(MandiPrice)
                    .filter(
                        MandiPrice.mandi_id == mandi.id,
                        MandiPrice.crop_id == crop.id,
                        MandiPrice.date == today,
                    )
                    .first()
                )

                if today_record:
                    today_record.min_price = min_p
                    today_record.max_price = max_p
                    today_record.modal_price = modal_p
                    today_record.source = source
                else:
                    new_record = MandiPrice(
                        mandi_id=mandi.id,
                        crop_id=crop.id,
                        min_price=min_p,
                        max_price=max_p,
                        modal_price=modal_p,
                        date=today,
                        source=source,
                    )
                    db.add(new_record)

                # 3. Update Redis cache
                cache_service.set_mandi_price_cache(
                    mandi_id=mandi.id,
                    crop_id=crop.id,
                    price_data={
                        "mandi_id": mandi.id,
                        "crop_id": crop.id,
                        "min_price": min_p,
                        "max_price": max_p,
                        "modal_price": modal_p,
                        "date": str(today),
                        "source": source,
                    },
                )
                updated_count += 1

        db.commit()
        logger.info("Successfully refreshed %d mandi prices for %s", updated_count, today)

    except Exception as e:
        db.rollback()
        logger.error("Error during scheduled price refresh: %s", e)
    finally:
        db.close()


def start_price_refresh_scheduler():
    """Initializes and starts the APScheduler background worker."""
    if not scheduler.running:
        interval_hours = settings.PRICE_REFRESH_INTERVAL_HOURS
        scheduler.add_job(
            sync_mandi_prices_task,
            trigger="interval",
            hours=interval_hours,
            id="price_refresh_job",
            replace_existing=True,
        )
        scheduler.start()
        logger.info(
            "Price refresh scheduler started (interval: every %d hours)", interval_hours
        )


def stop_price_refresh_scheduler():
    """Gracefully shuts down the background scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Price refresh scheduler stopped.")
