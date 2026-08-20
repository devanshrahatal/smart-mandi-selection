"""
Test script for WhatsApp Bot end-to-end conversation flow.
"""

import sys
import os

# Ensure stdout handles UTF-8 on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
phone = "+919998887770"

print("========================================")
print("Step 1: Greeting ('Hi')")
print("========================================")
r1 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "Hi"})
print(r1.json()["reply"])

print("\n========================================")
print("Step 2: Crop Selection ('Tomato')")
print("========================================")
r2 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "Tomato"})
print(r2.json()["reply"])

print("\n========================================")
print("Step 3: Quantity Input ('20 quintals')")
print("========================================")
r3 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "20 quintals"})
print(r3.json()["reply"])

print("\n========================================")
print("Step 4: Location ('Jaipur' / GPS Pin)")
print("========================================")
r4 = client.post(
    "/api/whatsapp/simulate",
    json={"phone_number": phone, "message": "Jaipur", "latitude": 26.9124, "longitude": 75.7873},
)
print(r4.json()["reply"])

print("\n========================================")
print("Step 5: Follow-up ('details')")
print("========================================")
r5 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "details"})
print(r5.json()["reply"])

print("\n========================================")
print("Step 6: Twilio Webhook TwiML Verification")
print("========================================")
tw = client.post(
    "/api/whatsapp/webhook",
    data={"From": f"whatsapp:{phone}", "Body": "Hi"},
)
print("HTTP Status:", tw.status_code)
print("Content-Type:", tw.headers.get("content-type"))
print("XML Output preview:\n", tw.text[:200])
