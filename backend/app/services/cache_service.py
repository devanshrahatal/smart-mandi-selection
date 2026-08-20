"""
Caching service layer.
Provides JSON serialization, key namespacing, and TTL management
for mandi prices, API responses, and conversation state.
"""

import json
import logging
from typing import Optional, Any
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

# Default Cache Expiry Times (in seconds)
DEFAULT_PRICE_CACHE_TTL = 3600 * 6     # 6 hours
DEFAULT_DISTANCE_CACHE_TTL = 3600 * 24  # 24 hours (distances don't change often)
DEFAULT_SESSION_TTL = 3600 * 2         # 2 hours for WhatsApp conversation state


class CacheService:
    """Provides high-level caching utilities with namespaces and JSON encoding."""

    @staticmethod
    def get_json(key: str) -> Optional[Any]:
        """Fetch and deserialize JSON object from cache."""
        raw_val = redis_client.get(key)
        if raw_val is None:
            return None
        try:
            return json.loads(raw_val)
        except (json.JSONDecodeError, TypeError) as e:
            logger.error("Failed to decode cached JSON for key '%s': %s", key, e)
            return None

    @staticmethod
    def set_json(key: str, value: Any, ttl_seconds: int = DEFAULT_PRICE_CACHE_TTL) -> bool:
        """Serialize and store a JSON-compatible object in cache with TTL."""
        try:
            serialized = json.dumps(value, default=str)
            return redis_client.set(key, serialized, ex=ttl_seconds)
        except Exception as e:
            logger.error("Failed to set cached JSON for key '%s': %s", key, e)
            return False

    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        """Generic alias for get_json."""
        return cls.get_json(key)

    @classmethod
    def set(cls, key: str, value: Any, ttl_seconds: int = DEFAULT_PRICE_CACHE_TTL) -> bool:
        """Generic alias for set_json."""
        return cls.set_json(key, value, ttl_seconds=ttl_seconds)

    @staticmethod
    def delete(key: str) -> bool:
        """Remove a key from cache."""
        return bool(redis_client.delete(key))

    # --- Domain-Specific Cache Helpers ---

    @classmethod
    def get_mandi_price_cache(cls, mandi_id: int, crop_id: int) -> Optional[dict]:
        """Retrieve cached latest price record for a given mandi and crop."""
        key = f"mandi_price:{mandi_id}:{crop_id}"
        return cls.get_json(key)

    @classmethod
    def set_mandi_price_cache(
        cls, mandi_id: int, crop_id: int, price_data: dict, ttl_seconds: int = DEFAULT_PRICE_CACHE_TTL
    ) -> bool:
        """Cache the latest price for a given mandi and crop."""
        key = f"mandi_price:{mandi_id}:{crop_id}"
        return cls.set_json(key, price_data, ttl_seconds=ttl_seconds)

    @classmethod
    def get_session(cls, phone_number: str) -> Optional[dict]:
        """Retrieve WhatsApp user conversation state."""
        key = f"session:{phone_number}"
        return cls.get_json(key)

    @classmethod
    def set_session(cls, phone_number: str, state_data: dict, ttl_seconds: int = DEFAULT_SESSION_TTL) -> bool:
        """Save WhatsApp user conversation state."""
        key = f"session:{phone_number}"
        return cls.set_json(key, state_data, ttl_seconds=ttl_seconds)

    @classmethod
    def clear_session(cls, phone_number: str) -> bool:
        """Clear WhatsApp conversation state on completion or reset."""
        key = f"session:{phone_number}"
        return cls.delete(key)


cache_service = CacheService()
