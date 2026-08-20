"""
WhatsApp Webhook and Simulator API Endpoints.
Receives incoming messages from Twilio WhatsApp Sandbox,
supports Voice Note queries (Speech-to-Speech),
and provides direct simulator endpoints for testing via Swagger UI.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Form, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from xml.sax.saxutils import escape

from app.database import get_db
from app.services.whatsapp_bot import whatsapp_bot
from app.services.cache_service import cache_service
from app.services.voice_service import voice_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WhatsApp Bot"])


class WhatsAppSimulateRequest(BaseModel):
    phone_number: str = Field("+919876543210", example="+919876543210", description="Farmer phone number")
    message: str = Field("Tomato", example="Tomato", description="Message text (crop name, quantity, city name, 'why', etc.)")
    latitude: Optional[float] = Field(None, example=26.9124, description="Optional GPS latitude (simulates location pin)")
    longitude: Optional[float] = Field(None, example=75.7873, description="Optional GPS longitude (simulates location pin)")
    enable_voice_reply: bool = Field(False, example=True, description="Generate regional Voice Note MP3 response")


class WhatsAppSimulateResponse(BaseModel):
    phone_number: str
    reply: str
    current_session_state: Optional[str] = None
    audio_url: Optional[str] = None
    language: Optional[str] = None


class WhatsAppVoiceSimulateRequest(BaseModel):
    phone_number: str = Field("+919876543210", example="+919876543210", description="Farmer phone number")
    spoken_query: str = Field("भैया 20 क्विंटल टमाटर बेचना है जयपुर से", example="भैया 20 क्विंटल टमाटर बेचना है जयपुर से", description="Spoken voice transcript in native language")
    language: str = Field("hi", example="hi", description="Language code: 'hi', 'mr', 'gu', 'en'")


@router.post("/webhook", summary="Twilio WhatsApp Webhook Endpoint")
async def twilio_whatsapp_webhook(
    request: Request,
    From: str = Form(..., description="Twilio sender identifier, e.g. whatsapp:+919876543210"),
    Body: Optional[str] = Form(None, description="Incoming message text"),
    Latitude: Optional[float] = Form(None, description="GPS latitude if location attached"),
    Longitude: Optional[float] = Form(None, description="GPS longitude if location attached"),
    MediaUrl0: Optional[str] = Form(None, description="Voice note audio URL if voice note attached"),
    db: Session = Depends(get_db),
):
    """
    Standard Twilio WhatsApp Webhook.
    Configured in Twilio Console Sandbox:
    'WHEN A MESSAGE COMES IN' -> POST to https://<your-domain>/api/whatsapp/webhook
    """
    # Clean phone number (strip 'whatsapp:' prefix)
    phone_clean = From.replace("whatsapp:", "").strip()
    message_text = Body or ""

    reply_text = await whatsapp_bot.process_incoming_message(
        phone_number=phone_clean,
        message_body=message_text,
        latitude=Latitude,
        longitude=Longitude,
        db=db,
    )

    # Check if farmer sent voice or if voice playback is requested
    session = cache_service.get(f"session:{phone_clean}")
    lang = session.get("language", "hi") if session else "hi"

    media_tag = ""
    if MediaUrl0 or (message_text and any(k in message_text.lower() for k in ["voice", "audio", "bolkar", "awaaz", "आवाज", "बोलकर"])):
        try:
            voice_res = voice_service.generate_voice_response(text=reply_text, lang=lang)
            if voice_res.get("success") and voice_res.get("audio_url"):
                # Use public tunnel host or request base URL
                base_url = str(request.base_url).rstrip("/")
                # Convert http to https if behind tunnel proxy
                if "loca.lt" in base_url or "ngrok" in base_url:
                    base_url = base_url.replace("http://", "https://")
                full_audio_url = f"{base_url}{voice_res['audio_url']}"
                media_tag = f"<Media>{full_audio_url}</Media>"
        except Exception as e:
            logger.warning("Failed to generate WhatsApp voice media attachment: %s", e)

    # Return standard TwiML XML response with optional audio media note
    xml_content = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>{escape(reply_text)}</Body>{media_tag}</Message></Response>'
    return Response(content=xml_content, media_type="application/xml")


@router.post("/simulate", response_model=WhatsAppSimulateResponse, summary="Simulate WhatsApp conversation without Twilio")
async def simulate_whatsapp_message(
    req: WhatsAppSimulateRequest,
    db: Session = Depends(get_db),
):
    """
    Direct simulator for testing the WhatsApp Bot conversational flow
    without requiring a live Twilio webhook or ngrok.
    """
    phone_clean = req.phone_number.replace("whatsapp:", "").strip()

    reply_text = await whatsapp_bot.process_incoming_message(
        phone_number=phone_clean,
        message_body=req.message,
        latitude=req.latitude,
        longitude=req.longitude,
        db=db,
    )

    session = cache_service.get(f"session:{phone_clean}")
    state = session.get("state") if session else "IDLE"
    lang = session.get("language", "en") if session else "en"

    audio_url = None
    if req.enable_voice_reply:
        voice_res = voice_service.generate_voice_response(text=reply_text, lang=lang)
        audio_url = voice_res.get("audio_url")

    return WhatsAppSimulateResponse(
        phone_number=phone_clean,
        reply=reply_text,
        current_session_state=state,
        audio_url=audio_url,
        language=lang,
    )


@router.post("/simulate-voice", summary="Simulate direct voice note input & audio reply")
async def simulate_voice_note(
    req: WhatsAppVoiceSimulateRequest,
    db: Session = Depends(get_db),
):
    """
    Simulates a farmer sending a complete Voice Note in their native language
    (Hindi, Marathi, Gujarati, or English), performs recommendation extraction,
    and returns both text and an MP3 voice response.
    """
    phone_clean = req.phone_number.replace("whatsapp:", "").strip()

    # Process spoken query through bot pipeline
    reply_text = await whatsapp_bot.process_incoming_message(
        phone_number=phone_clean,
        message_body=req.spoken_query,
        db=db,
    )

    # Generate regional voice audio
    voice_res = voice_service.generate_voice_response(text=reply_text, lang=req.language)

    return {
        "phone_number": phone_clean,
        "input_transcript": req.spoken_query,
        "language": req.language,
        "reply_text": reply_text,
        "audio_url": voice_res.get("audio_url"),
        "spoken_summary": voice_res.get("spoken_text"),
    }


@router.post("/reset-session", summary="Reset WhatsApp conversation session")
def reset_whatsapp_session(
    phone_number: str = "+919876543210",
):
    """Clear conversation state from Redis for the given phone number."""
    phone_clean = phone_number.replace("whatsapp:", "").strip()
    cleared = cache_service.delete(f"session:{phone_clean}")
    return {
        "phone_number": phone_clean,
        "session_cleared": cleared,
        "message": "Session reset to IDLE",
    }
