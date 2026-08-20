"""
Redis client singleton and connection manager.
Provides graceful fallback if Redis is not available or connection fails.
Includes SSL certificate support (certifi) for cloud providers like Upstash.
"""

import logging
import json
from typing import Optional, Any
import redis
import certifi

from app.config import settings

logger = logging.getLogger(__name__)


class InMemoryFallbackCache:
    """Simple in-memory dictionary fallback when Redis is offline."""

    def __init__(self):
        self._store: dict[str, Any] = {}

    def get(self, key: str) -> Optional[str]:
        return self._store.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self._store[key] = value
        return True

    def delete(self, key: str) -> int:
        if key in self._store:
            del self._store[key]
            return 1
        return 0

    def ping(self) -> bool:
        return True


class RedisClient:
    """Singleton wrapper around redis.Redis with graceful fallback."""

    _instance: Optional["RedisClient"] = None
    _redis: Optional[redis.Redis] = None
    _is_connected: bool = False
    _fallback = InMemoryFallbackCache()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance._init_connection()
        return cls._instance

    def _init_connection(self):
        try:
            kwargs: dict[str, Any] = {
                "decode_responses": True,
                "socket_timeout": 5.0,
                "socket_connect_timeout": 5.0,
            }
            # For cloud Redis (rediss://), use certifi root certificates
            if settings.REDIS_URL.startswith("rediss://"):
                kwargs["ssl_ca_certs"] = certifi.where()

            self._redis = redis.from_url(settings.REDIS_URL, **kwargs)
            # Test connection
            self._redis.ping()
            self._is_connected = True
            logger.info("Connected to Redis at %s", settings.REDIS_URL.split("@")[-1])
        except Exception as e:
            self._is_connected = False
            self._redis = None
            logger.warning(
                "Redis connection failed (%s). Using in-memory fallback cache.", e
            )

    @property
    def is_connected(self) -> bool:
        return self._is_connected

    def get(self, key: str) -> Optional[str]:
        if self._is_connected and self._redis:
            try:
                return self._redis.get(key)
            except Exception as e:
                logger.warning("Redis GET error on key '%s': %s", key, e)
        return self._fallback.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        if self._is_connected and self._redis:
            try:
                return bool(self._redis.set(key, value, ex=ex))
            except Exception as e:
                logger.warning("Redis SET error on key '%s': %s", key, e)
        return self._fallback.set(key, value, ex=ex)

    def delete(self, key: str) -> int:
        if self._is_connected and self._redis:
            try:
                return int(self._redis.delete(key))
            except Exception as e:
                logger.warning("Redis DELETE error on key '%s': %s", key, e)
        return self._fallback.delete(key)

    def ping(self) -> bool:
        if self._is_connected and self._redis:
            try:
                return bool(self._redis.ping())
            except Exception:
                return False
        return True


# Global client instance
redis_client = RedisClient()
