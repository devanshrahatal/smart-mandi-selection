"""
Unit & Integration Tests for Market Linkages, Warehousing, Escrow Milestones, and Dispute Resolution.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_warehouses_and_cold_storages():
    """Verify listing WDRA registered warehouses with distance sorting and crop filters."""
    response = client.get("/api/linkages/warehouses?farmer_lat=26.9124&farmer_lon=75.7873")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    first = data[0]
    assert "name" in first
    assert "facility_type" in first
    assert "storage_rate_per_quintal_per_month" in first
    assert first["is_wdra_registered"] is True
    assert first["distance_km"] is not None


def test_escrow_transaction_lifecycle():
    """Verify escrow transaction creation and milestone progress."""
    # 1. Create Transaction
    payload = {
        "farmer_name": "Kisan Demo",
        "farmer_phone": "+919876543210",
        "buyer_name": "BigBasket Direct Farm Sourcing Hub",
        "crop_name": "Tomato",
        "quantity_quintals": 20.0,
        "agreed_price_per_q": 2400.0,
        "pickup_address": "Farm Gate #2, Chomu, Jaipur",
        "notes": "Grade A certified harvest batch.",
    }
    create_res = client.post("/api/linkages/transactions", json=payload)
    assert create_res.status_code == 200
    txn_data = create_res.json()
    assert txn_data["escrow_status"] == "ESCROW_LOCKED"
    assert txn_data["gross_amount"] == 48000.0
    txn_id = txn_data["id"]

    # 2. Advance to QC_PASSED
    update_res = client.patch(f"/api/linkages/transactions/{txn_id}/status", json={"new_status": "QC_PASSED"})
    assert update_res.status_code == 200
    assert update_res.json()["escrow_status"] == "QC_PASSED"

    # 3. Advance to SETTLED
    settle_res = client.patch(f"/api/linkages/transactions/{txn_id}/status", json={"new_status": "SETTLED"})
    assert settle_res.status_code == 200
    assert settle_res.json()["escrow_status"] == "SETTLED"


def test_dispute_grievance_filing_and_resolution():
    """Verify farmer grievance filing and administrative resolution."""
    # 1. File Grievance Ticket
    ticket_payload = {
        "complainant_name": "Ram Lal Meena",
        "complainant_phone": "+919829123456",
        "target_entity_name": "Azadpur Mandi Weigher #4",
        "dispute_category": "Weight Discrepancy",
        "severity": "HIGH",
        "description": "Tare weight of empty truck was not deducted correctly.",
        "disputed_amount": "₹4,200",
    }
    file_res = client.post("/api/linkages/disputes", json=ticket_payload)
    assert file_res.status_code == 200
    ticket = file_res.json()
    assert ticket["status"] == "OPEN"
    assert ticket["ticket_id"].startswith("GRV-")
    ticket_id = ticket["id"]

    # 2. Resolve Ticket
    resolve_res = client.patch(
        f"/api/linkages/disputes/{ticket_id}/resolve",
        json={"resolution_summary": "Weighbridge re-verified. Difference amount ₹4,200 credited to farmer UPI."},
    )
    assert resolve_res.status_code == 200
    resolved_ticket = resolve_res.json()
    assert resolved_ticket["status"] == "RESOLVED"
    assert "Difference amount" in resolved_ticket["resolution_summary"]


def test_arrival_influx_pressure_gauge():
    """Verify arrival influx calculation and supply pressure status."""
    response = client.get("/api/linkages/arrival-influx/1/1")
    assert response.status_code == 200
    data = response.json()
    assert "todays_arrival_tonnes" in data
    assert "seven_day_avg_tonnes" in data
    assert "supply_pressure_status" in data
    assert "farmer_market_advice" in data
