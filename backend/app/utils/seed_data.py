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
from app.models.buyer import Buyer
from app.models.lot import Lot
from app.models.offer import Offer
from app.models.warehouse import Warehouse
from app.models.transaction import Transaction
from app.models.dispute import Dispute
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

        # 6. Seed Verified Institutional Buyers
        if db.query(Buyer).count() == 0:
            verified_buyers = [
                Buyer(
                    business_name="KisanVikas Agro Procurements Pvt Ltd",
                    buyer_type="Institutional Buyer",
                    gst_number="08AABCK1234F1Z5",
                    is_verified=True,
                    rating=4.9,
                    state="Rajasthan",
                    district="Kota",
                    preferred_crops="Wheat, Soybean, Mustard",
                    min_volume_quintals=20.0,
                    payment_terms="Instant Bank NEFT (24 Hrs)",
                    contact_person="Vikram Sharma",
                    contact_phone="+919829012345",
                ),
                Buyer(
                    business_name="FreshCart Direct Farm Sourcing Hub",
                    buyer_type="Retail Chain",
                    gst_number="24AABCF5678K1Z2",
                    is_verified=True,
                    rating=4.8,
                    state="Gujarat",
                    district="Vadodara",
                    preferred_crops="Tomato, Onion, Potato, Banana",
                    min_volume_quintals=10.0,
                    payment_terms="Direct UPI / 24-hr RTGS",
                    contact_person="Pooja Mehta",
                    contact_phone="+919825167890",
                ),
                Buyer(
                    business_name="National Agro-Dairy & Produce Federation",
                    buyer_type="Institutional Buyer",
                    gst_number="07AABCN9012N1Z9",
                    is_verified=True,
                    rating=4.9,
                    state="Delhi",
                    district="North Delhi",
                    preferred_crops="Tomato, Potato, Onion",
                    min_volume_quintals=15.0,
                    payment_terms="Government Escrow Bank Transfer",
                    contact_person="Rajesh Aggarwal",
                    contact_phone="+919810045678",
                ),
                Buyer(
                    business_name="Bharat Agro Foods & Snack Processors",
                    buyer_type="Food Processor",
                    gst_number="27AABCB3456P1Z3",
                    is_verified=True,
                    rating=4.8,
                    state="Maharashtra",
                    district="Nagpur",
                    preferred_crops="Potato, Onion, Spices",
                    min_volume_quintals=25.0,
                    payment_terms="Instant UPI + Weighing Advance",
                    contact_person="Sanjay Jaiswal",
                    contact_phone="+919823078901",
                ),
                Buyer(
                    business_name="Sahyadri Agro-Export Cluster Pvt Ltd",
                    buyer_type="Exporter",
                    gst_number="27AABCS7890Q1Z4",
                    is_verified=True,
                    rating=4.9,
                    state="Maharashtra",
                    district="Nashik",
                    preferred_crops="Tomato, Onion, Banana",
                    min_volume_quintals=20.0,
                    payment_terms="Cold-Chain Pickup + 48-hr Settlement",
                    contact_person="Nitin Patil",
                    contact_phone="+919822034567",
                ),
                Buyer(
                    business_name="MahaAgro Fresh Supermarkets Hub",
                    buyer_type="Retail Chain",
                    gst_number="24AABCM1122D1Z8",
                    is_verified=True,
                    rating=4.7,
                    state="Gujarat",
                    district="Ahmedabad",
                    preferred_crops="Tomato, Potato, Onion, Banana",
                    min_volume_quintals=10.0,
                    payment_terms="Instant UPI at Farmgate Weighing",
                    contact_person="Kiran Patel",
                    contact_phone="+919879511223",
                ),
                Buyer(
                    business_name="QuickHarvest Direct Farm Sourcing Network",
                    buyer_type="Retail Chain",
                    gst_number="06AABCQ3344E1Z1",
                    is_verified=True,
                    rating=4.8,
                    state="Rajasthan",
                    district="Jaipur",
                    preferred_crops="Tomato, Onion, Potato",
                    min_volume_quintals=5.0,
                    payment_terms="Daily Instant UPI Settlement",
                    contact_person="Sunil Bishnoi",
                    contact_phone="+919829199887",
                ),
                Buyer(
                    business_name="AyurVeda Agro Processing Terminal",
                    buyer_type="Food Processor",
                    gst_number="05AABCA5566R1Z6",
                    is_verified=True,
                    rating=4.7,
                    state="Madhya Pradesh",
                    district="Indore",
                    preferred_crops="Wheat, Soybean, Mustard",
                    min_volume_quintals=30.0,
                    payment_terms="Direct DBT Bank Credit",
                    contact_person="Amit Verma",
                    contact_phone="+919826055443",
                ),
                Buyer(
                    business_name="Western Agro Beverage & Crop Processors",
                    buyer_type="Food Processor",
                    gst_number="03AABCW9900T1Z5",
                    is_verified=True,
                    rating=4.9,
                    state="Gujarat",
                    district="Surat",
                    preferred_crops="Potato, Tomato",
                    min_volume_quintals=35.0,
                    payment_terms="Contract Farming Premium (Instant NEFT)",
                    contact_person="Dhaval Shah",
                    contact_phone="+919825088776",
                ),
            ]
            for b in verified_buyers:
                db.add(b)
            db.commit()

        # 7. Seed Sample Active Lots & Digital Offers
        if db.query(Lot).count() == 0:
            itc_buyer = db.query(Buyer).filter(Buyer.business_name.ilike("%ITC%")).first()
            bb_buyer = db.query(Buyer).filter(Buyer.business_name.ilike("%BigBasket%")).first()
            md_buyer = db.query(Buyer).filter(Buyer.business_name.ilike("%Mother Dairy%")).first()

            lot1 = Lot(
                lot_id="LOT-2026-1042",
                farmer_name="Rameshwar Prasad Jat",
                phone_number="+919829045612",
                crop_name="Tomato",
                quantity_quintals=25.0,
                quality_grade="A",
                expected_price_per_q=2400.0,
                origin_location="Chomu, Jaipur, Rajasthan",
                harvest_date=(date.today() + timedelta(days=1)).strftime("%Y-%m-%d"),
                status="Offer Received",
            )
            lot2 = Lot(
                lot_id="LOT-2026-1088",
                farmer_name="Bhagwan Das Patel",
                phone_number="+919825133445",
                crop_name="Onion",
                quantity_quintals=40.0,
                quality_grade="B",
                expected_price_per_q=1850.0,
                origin_location="Padra, Vadodara, Gujarat",
                harvest_date=date.today().strftime("%Y-%m-%d"),
                status="Offer Received",
            )
            lot3 = Lot(
                lot_id="LOT-2026-1120",
                farmer_name="Santosh Shinde",
                phone_number="+919822077889",
                crop_name="Banana",
                quantity_quintals=50.0,
                quality_grade="A",
                expected_price_per_q=1600.0,
                origin_location="Baramati, Pune, Maharashtra",
                harvest_date=(date.today() + timedelta(days=2)).strftime("%Y-%m-%d"),
                status="Active",
            )
            db.add_all([lot1, lot2, lot3])
            db.commit()

            if bb_buyer:
                db.add(Offer(
                    offer_id="BID-78401",
                    lot_id=lot1.id,
                    buyer_id=bb_buyer.id,
                    offered_price_per_q=2450.0,
                    pickup_option="Farmgate Pickup",
                    status="Pending",
                ))
            if md_buyer:
                db.add(Offer(
                    offer_id="BID-78402",
                    lot_id=lot1.id,
                    buyer_id=md_buyer.id,
                    offered_price_per_q=2420.0,
                    pickup_option="Mandi Delivery",
                    status="Pending",
                ))
            if itc_buyer:
                db.add(Offer(
                    offer_id="BID-92015",
                    lot_id=lot2.id,
                    buyer_id=itc_buyer.id,
                    offered_price_per_q=1880.0,
                    pickup_option="Farmgate Pickup",
                    status="Pending",
                ))

        # 8. Seed WDRA Accredited Warehouses & Cold Storages
        if db.query(Warehouse).count() == 0:
            warehouses_data = [
                Warehouse(
                    name="Sheetal Cold Storage & Agro Logistics",
                    facility_type="Cold Storage",
                    is_wdra_registered=True,
                    registration_no="WDRA/RAJ/2024/092",
                    capacity_mt=5000.0,
                    available_capacity_mt=1800.0,
                    storage_rate_per_quintal_per_month=35.0,
                    state="Rajasthan",
                    district="Jaipur",
                    address="NH-52, Chomu Industrial Area, Jaipur 303702",
                    latitude=26.9800,
                    longitude=75.7200,
                    contact_person="Mukesh Choudhary",
                    contact_phone="+919829567890",
                    temperature_range="2°C - 6°C",
                    suitable_crops="Tomato, Potato, Onion",
                ),
                Warehouse(
                    name="Indira Krishi Cold Storage Hub",
                    facility_type="Cold Storage",
                    is_wdra_registered=True,
                    registration_no="WDRA/RAJ/2023/114",
                    capacity_mt=8000.0,
                    available_capacity_mt=2400.0,
                    storage_rate_per_quintal_per_month=30.0,
                    state="Rajasthan",
                    district="Kota",
                    address="Borkheda Agro Park, Kota, Rajasthan 324001",
                    latitude=25.1950,
                    longitude=75.8400,
                    contact_person="Kishore Meena",
                    contact_phone="+919829123499",
                    temperature_range="0°C - 4°C",
                    suitable_crops="Soybean, Wheat, Potato",
                ),
                Warehouse(
                    name="Mahavir Cold Storage & Warehousing",
                    facility_type="Cold Storage",
                    is_wdra_registered=True,
                    registration_no="WDRA/GUJ/2024/048",
                    capacity_mt=6500.0,
                    available_capacity_mt=2100.0,
                    storage_rate_per_quintal_per_month=32.0,
                    state="Gujarat",
                    district="Vadodara",
                    address="Sayajipura Bypass Road, Vadodara 390019",
                    latitude=22.3120,
                    longitude=73.2210,
                    contact_person="Haresh Patel",
                    contact_phone="+919825144556",
                    temperature_range="2°C - 8°C",
                    suitable_crops="Tomato, Potato, Banana, Onion",
                ),
                Warehouse(
                    name="Sahyadri Cold Chain Logistics Terminal",
                    facility_type="Cold Storage",
                    is_wdra_registered=True,
                    registration_no="WDRA/MAH/2023/201",
                    capacity_mt=12000.0,
                    available_capacity_mt=4500.0,
                    storage_rate_per_quintal_per_month=38.0,
                    state="Maharashtra",
                    district="Nashik",
                    address="Dindori Agro Export Zone, Nashik 422206",
                    latitude=20.0150,
                    longitude=73.7810,
                    contact_person="Anand Shinde",
                    contact_phone="+919822334455",
                    temperature_range="-2°C - 4°C",
                    suitable_crops="Tomato, Onion, Grapes, Banana",
                ),
                Warehouse(
                    name="Azadpur Central Perishable Cold Terminal",
                    facility_type="Cold Storage",
                    is_wdra_registered=True,
                    registration_no="WDRA/DEL/2022/015",
                    capacity_mt=15000.0,
                    available_capacity_mt=3200.0,
                    storage_rate_per_quintal_per_month=42.0,
                    state="Delhi",
                    district="North Delhi",
                    address="GT Karnal Road, Azadpur Mandi Gate #4, Delhi 110033",
                    latitude=28.7120,
                    longitude=77.1680,
                    contact_person="Ravi Kant Gupta",
                    contact_phone="+919810123987",
                    temperature_range="1°C - 5°C",
                    suitable_crops="Tomato, Potato, Onion, Green Peas",
                ),
                Warehouse(
                    name="Central Warehousing Corporation (CWC) Dry Silo",
                    facility_type="Dry Warehouse",
                    is_wdra_registered=True,
                    registration_no="WDRA/MP/2021/008",
                    capacity_mt=25000.0,
                    available_capacity_mt=8500.0,
                    storage_rate_per_quintal_per_month=15.0,
                    state="Madhya Pradesh",
                    district="Indore",
                    address="Sanwer Road Industrial Area, Indore 452015",
                    latitude=22.7500,
                    longitude=75.8300,
                    contact_person="Deepak Malviya",
                    contact_phone="+919826011223",
                    temperature_range="Ambient (Fumigated)",
                    suitable_crops="Wheat, Soybean, Gram",
                ),
            ]
            for w in warehouses_data:
                db.add(w)
            db.commit()

        # 9. Seed Demo Escrow Transactions
        if db.query(Transaction).count() == 0:
            lot1 = db.query(Lot).first()
            buyer1 = db.query(Buyer).first()
            tx1 = Transaction(
                transaction_id="TXN-2026-8041",
                lot_id=lot1.id if lot1 else None,
                buyer_id=buyer1.id if buyer1 else None,
                farmer_name="Rameshwar Prasad Jat",
                farmer_phone="+919829045612",
                buyer_name="FreshCart Direct Farm Sourcing Hub",
                crop_name="Tomato",
                quantity_quintals=25.0,
                agreed_price_per_q=2450.0,
                gross_amount=61250.0,
                freight_deduction=1225.0,
                platform_fee=306.25,
                net_payable_to_farmer=59718.75,
                escrow_status="ESCROW_LOCKED",
                payment_method="Direct UPI / Escrow",
                pickup_address="Farm Gate #3, Chomu, Jaipur, Rajasthan",
                qr_receipt_code="SM-ESCROW-8041-A9F2",
                notes="Grade A inspection scheduled. 100% funds locked in ICICI nodal escrow.",
            )
            tx2 = Transaction(
                transaction_id="TXN-2026-7910",
                lot_id=None,
                buyer_id=None,
                farmer_name="Bhagwan Das Patel",
                farmer_phone="+919825133445",
                buyer_name="KisanVikas Agro Procurements Pvt Ltd",
                crop_name="Onion",
                quantity_quintals=40.0,
                agreed_price_per_q=1880.0,
                gross_amount=75200.0,
                freight_deduction=1504.0,
                platform_fee=376.0,
                net_payable_to_farmer=73320.0,
                escrow_status="SETTLED",
                payment_method="Instant Bank NEFT",
                pickup_address="Padra Agro Cluster, Vadodara, Gujarat",
                qr_receipt_code="SM-ESCROW-7910-B4X1",
                notes="Weighing complete (40.0q). Payout of ₹73,320 credited to SBI A/c ending in 4102.",
            )
            db.add_all([tx1, tx2])
            db.commit()

        # 10. Seed Demo Grievance Tickets
        if db.query(Dispute).count() == 0:
            disp1 = Dispute(
                ticket_id="GRV-2026-104",
                complainant_name="Ram Lal Meena",
                complainant_phone="+919829123456",
                target_entity_name="Azadpur Mandi Weigher #12",
                dispute_category="Weight Discrepancy",
                severity="HIGH",
                description="Dispatched 30q loaded in truck, but APMC weigher reported 27.2q without conducting empty vehicle tare weight check.",
                disputed_amount="₹6,720",
                status="INVESTIGATING",
                resolution_summary=None,
            )
            disp2 = Dispute(
                ticket_id="GRV-2026-098",
                complainant_name="Suresh Shinde",
                complainant_phone="+919822119988",
                target_entity_name="Vashi APMC Commission Agent #44",
                dispute_category="Excessive Commission",
                severity="MEDIUM",
                description="Charged 8.5% commission on tomato sales instead of the legally mandated APMC cap of 6.0%.",
                disputed_amount="₹2,850",
                status="RESOLVED",
                resolution_summary="APMC Grievance Officer issued notice. Excess ₹2,850 refunded via UPI to farmer on Aug 26.",
            )
            db.add_all([disp1, disp2])
            db.commit()

        db.commit()
        logger.info("Successfully seeded Smart Mandi dataset (%d mandis, 5 crops)", len(MANDIS))
    except Exception as e:
        db.rollback()
        logger.error("Seeding error: %s", e)
    finally:
        if close_db:
            db.close()


