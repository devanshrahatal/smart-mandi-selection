import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

logger = logging.getLogger(__name__)

# --- Base class for all ORM models ---
Base = declarative_base()


def get_engine():
    """Create database engine with automatic cloud SQLite fallback if MySQL is unreachable."""
    db_url = settings.DATABASE_URL or "sqlite:///./smart_mandi.db"

    # If running in cloud environment (Render/Railway) and DATABASE_URL points to localhost, fallback to SQLite
    is_cloud = os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("VERCEL")
    if is_cloud and ("localhost" in db_url or "127.0.0.1" in db_url):
        logger.warning("Cloud environment detected with localhost DATABASE_URL. Falling back to SQLite.")
        db_url = "sqlite:///./smart_mandi.db"

    try:
        if db_url.startswith("sqlite"):
            eng = create_engine(
                db_url,
                connect_args={"check_same_thread": False},
                echo=settings.DEBUG,
            )
        elif db_url.startswith("postgres://"):
            eng = create_engine(
                db_url.replace("postgres://", "postgresql://", 1),
                pool_pre_ping=True,
                echo=settings.DEBUG,
            )
        else:
            eng = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DEBUG,
            )

        # Quick connectivity test
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return eng
    except Exception as err:
        logger.warning("Database connection to %s failed (%s). Falling back to SQLite.", db_url, err)
        return create_engine(
            "sqlite:///./smart_mandi.db",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )


engine = get_engine()

# --- Session factory ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI dependency that yields a database session.
    Ensures the session is closed after each request.

    Usage:
        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
