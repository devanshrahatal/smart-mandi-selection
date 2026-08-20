"""
SQLAlchemy database engine, session factory, and declarative Base.
All models inherit from `Base`. All route handlers use `get_db()` for sessions.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# --- Engine ---
db_url = settings.DATABASE_URL or "sqlite:///./smart_mandi.db"
if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
elif db_url.startswith("postgres://"):
    # Handle older postgres:// URLs from hosting providers
    db_url = db_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=settings.DEBUG,
    )

# --- Session factory ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Base class for all ORM models ---
Base = declarative_base()


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
