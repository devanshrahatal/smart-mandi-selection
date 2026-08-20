"""
Integration tests for Multi-Lingual WhatsApp bot support in Hindi, Marathi, Gujarati, and English.
"""

import pytest


def test_whatsapp_bot_hindi_conversation(client):
    """Test full Hindi conversational loop on WhatsApp simulator."""
    phone = "+919811001100"

    # Step 1: Hindi Greeting
    r1 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "नमस्ते"})
    assert r1.status_code == 200
    reply1 = r1.json()["reply"]
    assert "स्मार्ट मंडी" in reply1
    assert "टमाटर" in reply1

    # Step 2: Hindi Crop Selection ("टमाटर")
    r2 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "टमाटर"})
    assert r2.status_code == 200
    reply2 = r2.json()["reply"]
    assert "क्विंटल" in reply2

    # Step 3: Quantity in Hindi/digits ("20 क्विंटल")
    r3 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "20 क्विंटल"})
    assert r3.status_code == 200
    reply3 = r3.json()["reply"]
    assert "लोकेशन" in reply3

    # Step 4: Location ("जयपुर")
    r4 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "जयपुर"})
    assert r4.status_code == 200
    reply4 = r4.json()["reply"]
    assert "शुद्ध कमाई" in reply4 or "कोटा" in reply4 or "Kota" in reply4


def test_whatsapp_bot_marathi_conversation(client):
    """Test full Marathi conversational loop on WhatsApp simulator."""
    phone = "+919822002200"

    # Step 1: Marathi Greeting
    r1 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "नमस्कार"})
    assert r1.status_code == 200
    reply1 = r1.json()["reply"]
    assert "शेतमाल" in reply1 or "कांदा" in reply1

    # Step 2: Marathi Crop Selection ("कांदा")
    r2 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "कांदा"})
    assert r2.status_code == 200
    reply2 = r2.json()["reply"]
    assert "क्विंटल" in reply2

    # Step 3: Quantity ("15 क्विंटल")
    r3 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "15 क्विंटल"})
    assert r3.status_code == 200
    reply3 = r3.json()["reply"]
    assert "ठिकाण" in reply3 or "गाव" in reply3

    # Step 4: Location ("नाशिक")
    r4 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "नाशिक"})
    assert r4.status_code == 200
    reply4 = r4.json()["reply"]
    assert "निव्वळ नफा" in reply4 or "बाजार समिती" in reply4 or "नफा" in reply4 or "Nashik" in reply4 or "Kota" in reply4


def test_whatsapp_bot_gujarati_conversation(client):
    """Test Gujarati greeting and crop selection on WhatsApp simulator."""
    phone = "+919833003300"

    # Step 1: Gujarati Greeting
    r1 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "નમસ્તે"})
    assert r1.status_code == 200
    reply1 = r1.json()["reply"]
    assert "સ્માર્ટ મંડી" in reply1 or "પાક" in reply1

    # Step 2: Gujarati Crop Selection ("ડુંગળી")
    r2 = client.post("/api/whatsapp/simulate", json={"phone_number": phone, "message": "ડુંગળી"})
    assert r2.status_code == 200
    reply2 = r2.json()["reply"]
    assert "જથ્થો" in reply2 or "ક્વિન્ટલ" in reply2
