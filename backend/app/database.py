"""
SQLAlchemy database engine, session factory, and declarative Base.
All models inherit from `Base`. All route handlers use `get_db()` for sessions.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# --- Engine ---
# MySQL via PyMySQL — pool_pre_ping keeps connections alive
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,  # log SQL queries when DEBUG=true
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
