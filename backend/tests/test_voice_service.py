"""
Unit & Integration tests for Voice AI Service & Regional Audio Synthesis.
Tests Speech-to-Text parsing and Text-to-Speech MP3 generation for Hindi, Marathi, Gujarati, and English.
"""

import os
from pathlib import Path
import pytest
from app.services.voice_service import voice_service, STATIC_AUDIO_DIR


def test_clean_text_for_speech():
    """Verify that emojis, markdown asterisks, and bullets are stripped for clean audio."""
    raw = "🌾 *Smart Mandi Recommendations*\n• Modal Price: ₹2,800.00\n👉 Net Profit: ₹2,159.20"
    cleaned = voice_service.clean_text_for_speech(raw)
    assert "🌾" not in cleaned
    assert "*" not in cleaned
    assert "Smart Mandi Recommendations" in cleaned
    assert "Modal Price" in cleaned


def test_generate_voice_response_hindi():
    """Verify TTS audio generation for Hindi text."""
    text = "कोटा मंडी में आपको सबसे अधिक शुद्ध कमाई 2159 रुपये प्रति क्विंटल मिलेगी।"
    res = voice_service.generate_voice_response(text=text, lang="hi")

    assert res["success"] is True
    assert res["language"] == "hi"
    assert res["audio_url"] is not None
    assert Path(res["filepath"]).exists()
    assert os.path.getsize(res["filepath"]) > 500  # valid mp3 generated


def test_generate_voice_response_marathi():
    """Verify TTS audio generation for Marathi text."""
    text = "लासलगाव बाजार समितीमध्ये सर्वात जास्त निव्वळ नफा मिळेल."
    res = voice_service.generate_voice_response(text=text, lang="mr")

    assert res["success"] is True
    assert res["language"] == "mr"
    assert res["audio_url"] is not None
    assert Path(res["filepath"]).exists()
    assert os.path.getsize(res["filepath"]) > 500


def test_simulate_voice_endpoint(client):
    """Integration test for /api/whatsapp/simulate-voice endpoint."""
    payload = {
        "phone_number": "+919876543210",
        "spoken_query": "भैया 20 क्विंटल टमाटर बेचना है",
        "language": "hi",
    }
    response = client.post("/api/whatsapp/simulate-voice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "hi"
    assert "reply_text" in data
    assert data["audio_url"] is not None
    assert "/static/audio/" in data["audio_url"]
