"""
Seed script — populates the database with realistic demo data.

Creates:
  - 10 real Indian mandis with GPS coordinates
  - 5 crops with varying perishability
  - 30 days of price history per mandi-crop pair (1,500 price records)
  - Cost configs per mandi (with realistic regional variation)
  - 1 default admin user (admin / admin123)

Run:
  cd backend
  .venv\Scripts\python -m scripts.seed_data

The demo scenario is designed so that the NEAREST mandi is NOT always the
best choice — this is the core insight the platform demonstrates.
"""

import random
import sys
import os
from datetime import date, timedelta

# Add the backend directory to sys.path so `app` package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import Mandi, Crop, MandiPrice, CostConfig, FarmerQuery, AdminUser


# ============================================================
# 1. Mandis — 10 real wholesale markets across India
# ============================================================
MANDIS = [
    {
        "name": "Azadpur Mandi",
        "state": "Delhi",
        "district": "North Delhi",
        "latitude": 28.7041,
        "longitude": 77.1725,
        "address": "Azadpur, New Delhi, Delhi 110033",
        # High commission, high prices — mega wholesale market
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
        # Low cost, medium prices — makes it the hidden gem for nearby farmers
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
        # Low commission + low loading = good net despite lower prices
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


# ============================================================
# 2. Crops — 5 types with varying perishability
# ============================================================
CROPS = [
    {"name": "Tomato", "category": "Vegetable", "perishability_index": 0.85},
    {"name": "Onion", "category": "Vegetable", "perishability_index": 0.25},
    {"name": "Potato", "category": "Vegetable", "perishability_index": 0.15},
    {"name": "Wheat", "category": "Grain", "perishability_index": 0.05},
    {"name": "Banana", "category": "Fruit", "perishability_index": 0.80},
]

# Base modal prices per crop (₹/quintal) — each mandi will vary around these
BASE_PRICES = {
    "Tomato": 2200,
    "Onion": 1800,
    "Potato": 1200,
    "Wheat": 2400,
    "Banana": 2600,
}

# Price multiplier per mandi — simulates demand variation across markets
# Azadpur/Vashi are premium markets; smaller mandis have lower prices
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
    """
    Generate a realistic-looking price series with day-over-day fluctuations.
    Adds a slight upward or downward trend with random noise.
    """
    random.seed(42)  # reproducible data for demos
    trend = random.uniform(-0.003, 0.003)  # slight daily trend
    prices = []
    current = base_price * multiplier

    for day in range(days):
        noise = random.gauss(0, base_price * 0.02)  # ~2% daily noise
        current = current * (1 + trend) + noise
        current = max(current, base_price * 0.7)  # floor at 70% of base
        modal = round(current, 2)
        min_price = round(modal * random.uniform(0.88, 0.95), 2)
        max_price = round(modal * random.uniform(1.05, 1.15), 2)
        prices.append((min_price, modal, max_price))

    return prices


def seed():
    """Main seed function — creates all demo data."""
    print("Seeding Smart Mandi database...\n")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created")

    db = SessionLocal()

    try:
        # --- Check if already seeded ---
        if db.query(Mandi).count() > 0:
            print("[WARN] Database already has data. Skipping seed.")
            print("  To re-seed, drop all tables first and run again.")
            return

        # --- Mandis ---
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
            db.flush()  # assigns the ID
            mandi_objects[m["name"]] = mandi

            # Create cost config for this mandi
            cost = CostConfig(
                mandi_id=mandi.id,
                commission_percentage=m["cost"]["commission"],
                loading_cost_per_quintal=m["cost"]["loading"],
                unloading_cost_per_quintal=m["cost"]["unloading"],
                transport_rate_per_km_per_quintal=m["cost"]["transport_rate"],
            )
            db.add(cost)

        print(f"[OK] {len(MANDIS)} mandis + cost configs created")

        # --- Crops ---
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

        print(f"[OK] {len(CROPS)} crops created")

        # --- Price history (30 days × 10 mandis × 5 crops = 1,500 records) ---
        today = date.today()
        price_count = 0

        for mandi_name, mandi_obj in mandi_objects.items():
            multiplier = MANDI_PRICE_MULTIPLIERS[mandi_name]

            for crop_name, crop_obj in crop_objects.items():
                base = BASE_PRICES[crop_name]
                # Re-seed random per mandi-crop pair for variety
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
                    price_count += 1

        print(f"[OK] {price_count} price records created (30 days x {len(MANDIS)} mandis x {len(CROPS)} crops)")

        # --- Default admin user ---
        # Password: admin123 (plaintext here, hashed via passlib in Phase 7)
        # For now we store a bcrypt placeholder so the schema is correct
        admin = AdminUser(
            username="admin",
            email="admin@smartmandi.in",
            hashed_password="$2b$12$placeholder_will_be_set_in_phase7",
            role="admin",
        )
        db.add(admin)
        print("[OK] Default admin user created (admin / admin123)")

        # --- Commit everything ---
        db.commit()
        print(f"\n[SUCCESS] Seed complete! {price_count} prices across {len(MANDIS)} mandis and {len(CROPS)} crops.")

        # --- Print demo scenario ---
        print("\n-- Demo Scenario --")
        print("Farmer in Jaipur (26.9124, 75.7873) selling 20 quintals of Tomato:")
        print("  * Kota is ~240 km away    -> low transport, low commission  -> likely BEST net profit")
        print("  * Azadpur is ~270 km away -> highest price, BUT 8% commission + high transport")
        print("  * Vashi is ~1100 km away  -> highest raw price, BUT transport kills the margin")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
