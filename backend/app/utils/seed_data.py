"""
Auto-seeding utility for Smart Mandi database.
Provides comprehensive APMC Mandis (including Tier-1 and Tier-2 hubs like Vadodara, Surat, Rajkot, Pune, Nashik),
5 Crops, 30-day Price Records, Cost Configs, and Sample Queries.
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
    # Gujarat Markets
    {
        "name": "Vadodara APMC",
        "state": "Gujarat",
        "district": "Vadodara",
        "latitude": 22.3168,
        "longitude": 73.2386,
        "address": "Sayajipura APMC Market Yard, NH-8, Vadodara, Gujarat 390019",
        "cost": {"commission": 5.0, "loading": 28, "unloading": 20, "transport_rate": 2.2},
    },
    {
        "name": "Ahmedabad APMC",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "address": "APMC Market, Jamalpur, Ahmedabad, Gujarat 380022",
        "cost": {"commission": 5.5, "loading": 32, "unloading": 22, "transport_rate": 2.4},
    },
    {
        "name": "Surat APMC",
        "state": "Gujarat",
        "district": "Surat",
        "latitude": 21.1925,
        "longitude": 72.8423,
        "address": "Sardar Market APMC, Sahara Darwaja, Surat, Gujarat 395002",
        "cost": {"commission": 5.2, "loading": 30, "unloading": 22, "transport_rate": 2.3},
    },
    {
        "name": "Rajkot APMC",
        "state": "Gujarat",
        "district": "Rajkot",
        "latitude": 22.3216,
        "longitude": 70.8123,
        "address": "Bedi Mandi Yard, Rajkot, Gujarat 360003",
        "cost": {"commission": 4.8, "loading": 26, "unloading": 18, "transport_rate": 2.1},
    },

    # Maharashtra Markets
    {
        "name": "Vashi APMC",
        "state": "Maharashtra",
        "district": "Thane",
        "latitude": 19.0760,
        "longitude": 72.9987,
        "address": "APMC Market, Sector 19, Vashi, Navi Mumbai 400703",
        "cost": {"commission": 7.0, "loading": 50, "unloading": 40, "transport_rate": 3.5},
    },
    {
        "name": "Pune APMC",
        "state": "Maharashtra",
        "district": "Pune",
        "latitude": 18.4967,
        "longitude": 73.8643,
        "address": "Gultekdi Market Yard, Pune, Maharashtra 411037",
        "cost": {"commission": 6.0, "loading": 38, "unloading": 28, "transport_rate": 2.7},
    },
    {
        "name": "Nashik APMC",
        "state": "Maharashtra",
        "district": "Nashik",
        "latitude": 20.0063,
        "longitude": 73.7903,
        "address": "Dindori Road Market Yard, Nashik, Maharashtra 422004",
        "cost": {"commission": 5.0, "loading": 30, "unloading": 20, "transport_rate": 2.2},
    },
    {
        "name": "Nagpur APMC",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.1738,
        "longitude": 79.1354,
        "address": "Kalamna Market Yard, Nagpur, Maharashtra 440008",
        "cost": {"commission": 5.5, "loading": 32, "unloading": 24, "transport_rate": 2.4},
    },

    # Delhi & North India
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
        "name": "Kota Krishi Mandi",
        "state": "Rajasthan",
        "district": "Kota",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "address": "Bhamashah Krishi Upaj Mandi, Kota, Rajasthan 324005",
        "cost": {"commission": 4.5, "loading": 25, "unloading": 15, "transport_rate": 2.0},
    },
    {
        "name": "Jaipur Muhana Mandi",
        "state": "Rajasthan",
        "district": "Jaipur",
        "latitude": 26.8124,
        "longitude": 75.7483,
        "address": "Muhana Mandi Yard, Sanganer, Jaipur, Rajasthan 302029",
        "cost": {"commission": 4.8, "loading": 28, "unloading": 18, "transport_rate": 2.1},
    },
    {
        "name": "Indore Mandi",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "address": "Choithram Mandi, Indore, MP 452014",
        "cost": {"commission": 5.0, "loading": 30, "unloading": 20, "transport_rate": 2.0},
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
        "name": "Lucknow Mandi",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "address": "Dubagga Mandi, Lucknow, UP 226003",
        "cost": {"commission": 6.0, "loading": 35, "unloading": 25, "transport_rate": 2.5},
    },
    {
        "name": "Patna Mandi",
        "state": "Bihar",
        "district": "Patna",
        "latitude": 25.6093,
        "longitude": 85.1376,
        "address": "Mithapur Mandi, Patna, Bihar 800001",
        "cost": {"commission": 3.5, "loading": 20, "unloading": 15, "transport_rate": 1.8},
    },
    {
        "name": "Hubli-Dharwad APMC",
        "state": "Karnataka",
        "district": "Dharwad",
        "latitude": 15.3647,
        "longitude": 75.1240,
        "address": "APMC Market Yard, Amargol, Hubli, Karnataka 580025",
        "cost": {"commission": 5.5, "loading": 28, "unloading": 18, "transport_rate": 2.3},
    },
    {
        "name": "Bowenpally Market",
        "state": "Telangana",
        "district": "Hyderabad",
        "latitude": 17.4700,
        "longitude": 78.4800,
        "address": "Bowenpally Market Yard, Secunderabad, Telangana 500011",
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
    "Onion": 1850,
    "Potato": 1350,
    "Wheat": 2275,
    "Banana": 1650,
}

# Regional price variation multipliers
MANDI_PRICE_MULTIPLIERS = {
    "Vadodara APMC": 1.04,
    "Ahmedabad APMC": 1.07,
    "Surat APMC": 1.09,
    "Rajkot APMC": 0.98,
    "Azadpur Mandi": 1.15,
    "Vashi APMC": 1.18,
    "Pune APMC": 1.10,
    "Nashik APMC": 0.95,
    "Nagpur APMC": 1.02,
    "Kota Krishi Mandi": 0.96,
    "Jaipur Muhana Mandi": 1.03,
    "Indore Mandi": 0.97,
    "Jalandhar Sabzi Mandi": 1.02,
    "Lucknow Mandi": 1.04,
    "Patna Mandi": 0.94,
    "Hubli-Dharwad APMC": 1.03,
    "Bowenpally Market": 1.06,
}


def generate_price_series(base_price: float, multiplier: float, days: int = 30):
    """Generate 30-day simulated price trajectory with realistic market volatility."""
    adj_base = base_price * multiplier
    prices = []
    current = adj_base
    for _ in range(days):
        pct_change = random.gauss(0.001, 0.018)
        current = max(adj_base * 0.75, min(adj_base * 1.35, current * (1 + pct_change)))
        spread = current * random.uniform(0.04, 0.08)
        min_p = round(current - spread, 1)
        modal_p = round(current, 1)
        max_p = round(current + spread, 1)
        prices.append((min_p, modal_p, max_p))
    return prices


def seed_database(db: Optional[Session] = None):
    """Populate database with mandis, crops, prices, cost configs, and admin user."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # 1. Seed or Upsert Mandis & CostConfigs
        mandi_objects = {}
        for m_data in MANDIS:
            mandi = db.query(Mandi).filter(Mandi.name == m_data["name"]).first()
            if not mandi:
                mandi = Mandi(
                    name=m_data["name"],
                    state=m_data["state"],
                    district=m_data["district"],
                    latitude=m_data["latitude"],
                    longitude=m_data["longitude"],
                    address=m_data["address"],
                    is_active=True,
                )
                db.add(mandi)
                db.flush()

                cfg = m_data["cost"]
                cost_config = CostConfig(
                    mandi_id=mandi.id,
                    commission_percentage=cfg["commission"],
                    loading_cost_per_quintal=cfg["loading"],
                    unloading_cost_per_quintal=cfg["unloading"],
                    transport_rate_per_km_per_quintal=cfg["transport_rate"],
                )
                db.add(cost_config)
            mandi_objects[m_data["name"]] = mandi

        # 2. Seed Crops
        crop_objects = {}
        for c in CROPS:
            crop = db.query(Crop).filter(Crop.name == c["name"]).first()
            if not crop:
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
            multiplier = MANDI_PRICE_MULTIPLIERS.get(mandi_name, 1.0)
            for crop_name, crop_obj in crop_objects.items():
                existing_prices = (
                    db.query(MandiPrice)
                    .filter(MandiPrice.mandi_id == mandi_obj.id, MandiPrice.crop_id == crop_obj.id)
                    .count()
                )
                if existing_prices == 0:
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
        if db.query(FarmerQuery).count() == 0:
            now = datetime.utcnow()
            kota_mandi = mandi_objects.get("Kota Krishi Mandi")
            azadpur_mandi = mandi_objects.get("Azadpur Mandi")
            vashi_mandi = mandi_objects.get("Vashi APMC")
            vadodara_mandi = mandi_objects.get("Vadodara APMC")
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
                    phone_number="+919823456789",
                    crop_id=tomato_crop.id if tomato_crop else None,
                    crop_name="Tomato",
                    quantity_quintals=30.0,
                    latitude=22.3072,
                    longitude=73.1812,
                    recommended_mandi_id=vadodara_mandi.id if vadodara_mandi else None,
                    query_text="30 quintals tomato from Vadodara",
                    response_text="Best Mandi: Vadodara APMC | Net Profit: Rs 61,200",
                    created_at=now - timedelta(hours=3),
                ),
            ]
            for q in demo_queries:
                db.add(q)

        db.commit()
        logger.info("Successfully seeded Smart Mandi dataset (%d mandis, 5 crops)", len(MANDIS))
    except Exception as e:
        db.rollback()
        logger.error("Seeding error: %s", e)
    finally:
        if close_db:
            db.close()
