"""
FastAPI application entry point.
Initializes the app, configures CORS, mounts routers, and manages background scheduler lifespan.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_recommendations import router as recommendations_router
from app.api.routes_whatsapp import router as whatsapp_router
from app.api.routes_admin import router as admin_router
from app.api.routes_pooling import router as pooling_router
from app.jobs.price_refresh_job import (
    start_price_refresh_scheduler,
    stop_price_refresh_scheduler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for background jobs and client connections."""
    # Startup
    start_price_refresh_scheduler()
    yield
    # Shutdown
    stop_price_refresh_scheduler()


def create_app() -> FastAPI:
    """Factory function that creates and configures the FastAPI application."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Helps farmers pick the most profitable mandi by comparing "
            "net profit (price minus transport, loading, commission, and "
            "spoilage costs) across nearby mandis."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # --- CORS ---
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Static Files (TTS Audio & Exports) ---
    static_dir = Path(__file__).resolve().parent.parent / "static"
    static_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    # --- Routers ---
    app.include_router(health_router, prefix="/api")
    app.include_router(recommendations_router, prefix="/api")
    app.include_router(whatsapp_router, prefix="/api/whatsapp")
    app.include_router(admin_router, prefix="/api/admin")
    app.include_router(pooling_router)

    return app


# Uvicorn will import this `app` object
app = create_app()
