"""
Agmarknet (data.gov.in) price ingestion service.
Fetches daily wholesale agricultural commodity prices from Agmarknet API.
Includes Redis caching and automatic fallback to DB / historical estimates on API outage.
"""

import logging
from datetime import date, datetime
from typing import Optional, List, Dict, Any
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.services.cache_service import cache_service
from app.models.mandi_price import MandiPrice
from app.models.mandi import Mandi
from app.models.crop import Crop

logger = logging.getLogger(__name__)

# Standard data.gov.in Agmarknet Resource ID for Daily Mandi Prices
AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"


class AgmarknetService:
    """Service to fetch, parse, cache, and fallback mandi price data."""

    def __init__(self):
        self.api_key = settings.AGMARKNET_API_KEY
        self.base_url = settings.AGMARKNET_BASE_URL.rstrip("/")

    async def fetch_live_price(
        self,
        crop_name: str,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market_name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Query the Agmarknet API for real-time commodity prices.
        Returns parsed price info or None if unavailable/failed.
        """
        if not self.api_key:
            logger.info("Agmarknet API key not configured. Using database / cached data.")
            return None

        # Build query parameters according to data.gov.in standard
        url = f"{self.base_url}/{AGMARKNET_RESOURCE_ID}"
        params: Dict[str, Any] = {
            "api-key": self.api_key,
            "format": "json",
            "limit": 10,
            "filters[commodity]": crop_name,
        }
        if state:
            params["filters[state]"] = state
        if district:
            params["filters[district]"] = district
        if market_name:
            params["filters[market]"] = market_name

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.warning(
                        "Agmarknet API returned status %d for crop '%s': %s",
                        response.status_code,
                        crop_name,
                        response.text[:200],
                    )
                    return None

                data = response.json()
                records = data.get("records", [])
                if not records:
                    logger.info("No live records found on Agmarknet for crop '%s'", crop_name)
                    return None

                # Return the most relevant/recent record
                rec = records[0]
                return {
                    "state": rec.get("state"),
                    "district": rec.get("district"),
                    "market": rec.get("market"),
                    "commodity": rec.get("commodity"),
                    "min_price": float(rec.get("min_price", 0.0)),
                    "max_price": float(rec.get("max_price", 0.0)),
                    "modal_price": float(rec.get("modal_price", 0.0)),
                    "arrival_date": rec.get("arrival_date"),
                    "source": "agmarknet_live",
                }

        except Exception as e:
            logger.error("Error communicating with Agmarknet API: %s", e)
            return None

    def get_mandi_price(self, db: Session, mandi_id: int, crop_id: int, crop_name: Optional[str] = None) -> Dict[str, Any]:
        """Convenience alias for get_latest_price_with_fallback."""
        return self.get_latest_price_with_fallback(db, mandi_id, crop_id)

    def get_latest_price_with_fallback(
        self,
        db: Session,
        mandi_id: int,
        crop_id: int,
    ) -> Dict[str, Any]:
        """
        Returns the latest price for (mandi, crop):
        1. Checks Redis cache
        2. Queries database `mandi_prices` for the latest record
        3. Returns formatted price dictionary with source tracking
        """
        # 1. Check Cache
        cached = cache_service.get_mandi_price_cache(mandi_id, crop_id)
        if cached:
            return cached

        # 2. Query DB for the latest price
        latest_record = (
            db.query(MandiPrice)
            .filter(MandiPrice.mandi_id == mandi_id, MandiPrice.crop_id == crop_id)
            .order_by(MandiPrice.date.desc())
            .first()
        )

        if latest_record:
            price_dict = {
                "mandi_id": latest_record.mandi_id,
                "crop_id": latest_record.crop_id,
                "min_price": float(latest_record.min_price),
                "max_price": float(latest_record.max_price),
                "modal_price": float(latest_record.modal_price),
                "date": str(latest_record.date),
                "source": latest_record.source,
            }
            # Cache for future reads
            cache_service.set_mandi_price_cache(mandi_id, crop_id, price_dict)
            return price_dict

        # 3. If not found in DB, construct a sensible base estimate from Crop definition
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        base_estimate = 2000.0
        fallback_dict = {
            "mandi_id": mandi_id,
            "crop_id": crop_id,
            "min_price": base_estimate * 0.9,
            "max_price": base_estimate * 1.1,
            "modal_price": base_estimate,
            "date": str(date.today()),
            "source": "estimated_fallback",
        }
        cache_service.set_mandi_price_cache(mandi_id, crop_id, fallback_dict, ttl_seconds=600)
        return fallback_dict


agmarknet_service = AgmarknetService()
