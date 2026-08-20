"""
Application configuration loaded from environment variables.
Uses Pydantic BaseSettings for validation and type coercion.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    All configuration values are loaded from environment variables.
    See backend/.env.example for the full list with descriptions.
    """

    # --- App ---
    APP_NAME: str = "Smart Mandi Selection API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # --- Database (MySQL) ---
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/smart_mandi"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- JWT Auth (admin dashboard) ---
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- External APIs ---
    AGMARKNET_API_KEY: Optional[str] = None
    AGMARKNET_BASE_URL: str = "https://api.data.gov.in/resource"
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    # --- Twilio WhatsApp ---
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"  # Sandbox default

    # --- Scheduler ---
    PRICE_REFRESH_INTERVAL_HOURS: int = 6

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton instance used throughout the app
settings = Settings()
