"""
Auto-seeding utility for Smart Mandi database.
Provides 10 Mandis, 5 Crops, 1,500 Price Records, Cost Configs, and Sample Queries.
"""

import random
import logging
from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models import Mandi, Crop, MandiPrice, CostConfig, FarmerQuery, AdminUser
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

MANDIS = [
    {
        "name": "Azadpur Mandi",
        "state": "Delhi",
        "district": "North Delhi",
        "latitude": 28.7041,
        "longitude": 77.1725,
        "address": "Azadpur, New Delhi, Delhi 110033",
        "cost": {"commission": 8.0, "loading": 45, "unloading": 35, "transport_rate": 3.0},
    },
    {
        "name": "Vashi APMC",
        "state": "Maharashtra",
        "district": "Thane",
        "latitude": 19.0760,
        "longitude": 72.9987,
        "address": "APMC Market, Vashi, Navi Mumbai 400703",
        "cost": {"commission": 7.0, "loading": 50, "unloading": 40, "transport_rate": 3.5},
    },
    {
        "name": "Kota Krishi Mandi",
        "state": "Rajasthan",
        "district": "Kota",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "address": "Krishi Upaj Mandi, Kota, Rajasthan 324001",
        "cost": {"commission": 4.5, "loading": 25, "unloading": 15, "transport_rate": 2.0},
    },
    {
        "name": "Jalandhar Sabzi Mandi",
        "state": "Punjab",
        "district": "Jalandhar",
        "latitude": 31.3260,
        "longitude": 75.5762,
        "address": "Sabzi Mandi, Jalandhar, Punjab 144001",
        "cost": {"commission": 5.0, "loading": 30, "unloading": 20, "transport_rate": 2.2},
    },
    {
        "name": "Hubli-Dharwad APMC",
        "state": "Karnataka",
        "district": "Dharwad",
        "latitude": 15.3647,
        "longitude": 75.1240,
        "address": "APMC Market Yard, Hubli, Karnataka 580028",
        "cost": {"commission": 5.5, "loading": 28, "unloading": 18, "transport_rate": 2.3},
    },
    {
        "name": "Indore Mandi",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "address": "Krishi Upaj Mandi, Indore, MP 452001",
        "cost": {"commission": 5.0, "loading": 30, "unloading": 20, "transport_rate": 2.0},
    },
    {
        "name": "Patna Mandi",
        "state": "Bihar",
        "district": "Patna",
        "latitude": 25.6093,
        "longitude": 85.1376,
        "address": "Kankarbagh Mandi, Patna, Bihar 800020",
        "cost": {"commission": 3.5, "loading": 20, "unloading": 15, "transport_rate": 1.8},
    },
    {
        "name": "Lucknow Mandi",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "address": "Kaiserbagh Mandi, Lucknow, UP 226001",
        "cost": {"commission": 6.0, "loading": 35, "unloading": 25, "transport_rate": 2.5},
    },
    {
        "name": "Ahmedabad APMC",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "address": "APMC Market, Jamalpur, Ahmedabad 380022",
        "cost": {"commission": 5.5, "loading": 32, "unloading": 22, "transport_rate": 2.4},
    },
    {
        "name": "Bowenpally Market",
        "state": "Telangana",
        "district": "Hyderabad",
        "latitude": 17.4700,
        "longitude": 78.4800,
        "address": "Bowenpally Market Yard, Hyderabad 500011",
        "cost": {"commission": 6.0, "loading": 35, "unloading": 28, "transport_rate": 2.6},
    },
]

CROPS = [
    {"name": "Tomato", "category": "Vegetable", "perishability_index": 0.85},
    {"name": "Onion", "category": "Vegetable", "perishability_index": 0.25},
    {"name": "Potato", "category": "Vegetable", "perishability_index": 0.15},
    {"name": "Wheat", "category": "Grain", "perishability_index": 0.05},
    {"name": "Banana", "category": "Fruit", "perishability_index": 0.80},
]

BASE_PRICES = {
    "Tomato": 2200,
    "Onion": 1800,
    "Potato": 1200,
    "Wheat": 2400,
    "Banana": 2600,
}

MANDI_PRICE_MULTIPLIERS = {
    "Azadpur Mandi": 1.15,
    "Vashi APMC": 1.20,
    "Kota Krishi Mandi": 0.95,
    "Jalandhar Sabzi Mandi": 1.00,
    "Hubli-Dharwad APMC": 0.98,
    "Indore Mandi": 1.02,
    "Patna Mandi": 0.90,
    "Lucknow Mandi": 1.05,
    "Ahmedabad APMC": 1.08,
    "Bowenpally Market": 1.06,
}


def generate_price_series(base_price: float, multiplier: float, days: int = 30) -> list:
    random.seed(42)
    trend = random.uniform(-0.003, 0.003)
    prices = []
    current = base_price * multiplier

    for day in range(days):
        noise = random.gauss(0, base_price * 0.02)
        current = current * (1 + trend) + noise
        current = max(current, base_price * 0.7)
        current = min(current, base_price * 1.5)

        spread = current * random.uniform(0.05, 0.12)
        min_p = round(current - spread * 0.4, 2)
        max_p = round(current + spread * 0.6, 2)
        modal_p = round(current, 2)
        prices.append((min_p, modal_p, max_p))

    return prices


def seed_database(db: Optional[Session] = None):
    """Seed mandis, crops, prices, and sample queries if not already present."""
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        if db.query(Mandi).count() > 0:
            return

        # 1. Mandis & Cost Configs
        mandi_objects = {}
        for m in MANDIS:
            mandi = Mandi(
                name=m["name"],
                state=m["state"],
                district=m["district"],
                address=m["address"],
                latitude=m["latitude"],
                longitude=m["longitude"],
            )
            db.add(mandi)
            db.flush()
            mandi_objects[m["name"]] = mandi

            cost = CostConfig(
                mandi_id=mandi.id,
                commission_percentage=m["cost"]["commission"],
                loading_cost_per_quintal=m["cost"]["loading"],
                unloading_cost_per_quintal=m["cost"]["unloading"],
                transport_rate_per_km_per_quintal=m["cost"]["transport_rate"],
            )
            db.add(cost)

        # 2. Crops
        crop_objects = {}
        for c in CROPS:
            crop = Crop(
                name=c["name"],
                category=c["category"],
                perishability_index=c["perishability_index"],
            )
            db.add(crop)
            db.flush()
            crop_objects[c["name"]] = crop

        # 3. 30-Day Price History
        today = date.today()
        for mandi_name, mandi_obj in mandi_objects.items():
            multiplier = MANDI_PRICE_MULTIPLIERS[mandi_name]
            for crop_name, crop_obj in crop_objects.items():
                base = BASE_PRICES[crop_name]
                random.seed(hash(f"{mandi_name}_{crop_name}"))
                series = generate_price_series(base, multiplier, days=30)

                for day_offset, (min_p, modal_p, max_p) in enumerate(series):
                    price_date = today - timedelta(days=29 - day_offset)
                    price = MandiPrice(
                        mandi_id=mandi_obj.id,
                        crop_id=crop_obj.id,
                        min_price=min_p,
                        modal_price=modal_p,
                        max_price=max_p,
                        date=price_date,
                        source="seed_data",
                    )
                    db.add(price)

        # 4. Default Admin User
        admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin:
            admin = AdminUser(
                username="admin",
                email="admin@smartmandi.in",
                hashed_password=get_password_hash("admin123"),
                role="admin",
            )
            db.add(admin)

        # 5. Demo Farmer Queries
        now = datetime.utcnow()
        kota_mandi = mandi_objects.get("Kota Krishi Mandi")
        azadpur_mandi = mandi_objects.get("Azadpur Mandi")
        vashi_mandi = mandi_objects.get("Vashi APMC")
        tomato_crop = crop_objects.get("Tomato")
        onion_crop = crop_objects.get("Onion")
        potato_crop = crop_objects.get("Potato")
        wheat_crop = crop_objects.get("Wheat")

        demo_queries = [
            FarmerQuery(
                phone_number="+919876543210",
                crop_id=tomato_crop.id if tomato_crop else None,
                crop_name="Tomato",
                quantity_quintals=20.0,
                latitude=26.9124,
                longitude=75.7873,
                recommended_mandi_id=kota_mandi.id if kota_mandi else None,
                query_text="Tomato 20q from Jaipur",
                response_text="Best Mandi: Kota Krishi Mandi | Net Profit: Rs 38,400",
                created_at=now - timedelta(minutes=25),
            ),
            FarmerQuery(
                phone_number="+919812345678",
                crop_id=onion_crop.id if onion_crop else None,
                crop_name="Onion",
                quantity_quintals=50.0,
                latitude=19.9975,
                longitude=73.7898,
                recommended_mandi_id=vashi_mandi.id if vashi_mandi else None,
                query_text="50 quintals onion from Nashik",
                response_text="Best Mandi: Vashi APMC | Net Profit: Rs 78,500",
                created_at=now - timedelta(hours=2),
            ),
            FarmerQuery(
                phone_number="+919765432109",
                crop_id=potato_crop.id if potato_crop else None,
                crop_name="Potato",
                quantity_quintals=35.0,
                latitude=27.1767,
                longitude=78.0081,
                recommended_mandi_id=azadpur_mandi.id if azadpur_mandi else None,
                query_text="Potato 35q from Agra",
                response_text="Best Mandi: Azadpur Mandi | Net Profit: Rs 34,200",
                created_at=now - timedelta(hours=4),
            ),
            FarmerQuery(
                phone_number="+919654321098",
                crop_id=wheat_crop.id if wheat_crop else None,
                crop_name="Wheat",
                quantity_quintals=100.0,
                latitude=29.6857,
                longitude=76.9905,
                recommended_mandi_id=azadpur_mandi.id if azadpur_mandi else None,
                query_text="Wheat 100q from Karnal",
                response_text="Best Mandi: Azadpur Mandi | Net Profit: Rs 2,15,000",
                created_at=now - timedelta(hours=6),
            ),
        ]
        for q in demo_queries:
            db.add(q)

        db.commit()
        logger.info("Successfully seeded Smart Mandi dataset (10 mandis, 5 crops, 1,500 prices, 5 queries)")
    except Exception as e:
        db.rollback()
        logger.error("Seeding error: %s", e)
    finally:
        if close_db:
            db.close()
