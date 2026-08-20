"""
Pytest configuration and test fixtures for Smart Mandi test suite.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal, Base, engine
from app.models.crop import Crop
from app.models.mandi import Mandi
from app.models.cost_config import CostConfig
from app.models.admin_user import AdminUser
from app.core.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def db_session():
    """Yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def admin_auth_headers(db_session):
    """Generates valid JWT Bearer token headers for admin testing."""
    admin = db_session.query(AdminUser).filter(AdminUser.username == "admin").first()
    if not admin:
        admin = AdminUser(
            username="admin",
            email="admin@smartmandi.in",
            hashed_password=get_password_hash("admin123"),
            role="admin",
        )
        db_session.add(admin)
        db_session.commit()
        db_session.refresh(admin)

    token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {"Authorization": f"Bearer {token}"}
