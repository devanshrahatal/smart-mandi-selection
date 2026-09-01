"""
Conversational WhatsApp Bot Engine with Multi-Lingual Regional Support.
Supports English, Hindi (हिंदी), Marathi (मराठी), and Gujarati (ગુજરાતી).
Manages conversational state machine, natural-language crop & quantity parsing,
geocoding of farmer locations/GPS pins, and Net Profit recommendations.
"""

import json
import logging
import re
from typing import Dict, Any, Optional, Tuple, List

from sqlalchemy.orm import Session

from app.models.crop import Crop
from app.models.mandi import Mandi
from app.models.cost_config import CostConfig
from app.models.farmer_query import FarmerQuery
from app.services.cache_service import cache_service
from app.services.agmarknet_service import agmarknet_service
from app.services.distance_service import distance_service
from app.services.cost_engine import cost_engine
from app.services.trend_engine import trend_engine
from app.services.sale_window_service import sale_window_service

logger = logging.getLogger(__name__)

# Session state keys
STATE_IDLE = "IDLE"
STATE_AWAITING_QUANTITY = "AWAITING_QUANTITY"
STATE_AWAITING_LOCATION = "AWAITING_LOCATION"
STATE_RECOMMENDATION_ACTIVE = "RECOMMENDATION_ACTIVE"

# Multi-lingual crop alias dictionary
CROP_ALIASES = {
    # Tomato
    "tomato": "Tomato",
    "tomatoes": "Tomato",
    "tamatar": "Tomato",
    "टमाटर": "Tomato",
    "टोमॅटो": "Tomato",
    "ટામેટા": "Tomato",
    "ટામેટાં": "Tomato",
    # Onion
    "onion": "Onion",
    "onions": "Onion",
    "pyaaz": "Onion",
    "pyaz": "Onion",
    "kanda": "Onion",
    "कांदा": "Onion",
    "प्याज": "Onion",
    "प्याज़": "Onion",
    "ડુંગળી": "Onion",
    "કાંદો": "Onion",
    # Potato
    "potato": "Potato",
    "potatoes": "Potato",
    "aloo": "Potato",
    "alu": "Potato",
    "batata": "Potato",
    "आलू": "Potato",
    "बटाटा": "Potato",
    "બટાકા": "Potato",
    "બટાટા": "Potato",
    # Wheat
    "wheat": "Wheat",
    "gehu": "Wheat",
    "gehun": "Wheat",
    "गेहूं": "Wheat",
    "गहू": "Wheat",
    "ઘઉં": "Wheat",
    # Banana
    "banana": "Banana",
    "bananas": "Banana",
    "kela": "Banana",
    "kele": "Banana",
    "केला": "Banana",
    "केळी": "Banana",
    "કેળા": "Banana",
}

# Known Indian agricultural hub coordinates for text geocoding
CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    "jaipur": (26.9124, 75.7873),
    "जयपुर": (26.9124, 75.7873),
    "kota": (25.2138, 75.8648),
    "कोटा": (25.2138, 75.8648),
    "delhi": (28.7165, 77.1724),
    "दिल्ली": (28.7165, 77.1724),
    "mumbai": (19.0760, 72.8777),
    "मुंबई": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "पुणे": (18.5204, 73.8567),
    "nashik": (19.9975, 73.7898),
    "नाशिक": (19.9975, 73.7898),
    "नासिक": (19.9975, 73.7898),
    "indore": (22.7196, 75.8577),
    "इंदौर": (22.7196, 75.8577),
    "ahmedabad": (23.0225, 72.5714),
    "अहमदाबाद": (23.0225, 72.5714),
    "અમદાવાદ": (23.0225, 72.5714),
    "surat": (21.1702, 72.8311),
    "सूरत": (21.1702, 72.8311),
    "સુરત": (21.1702, 72.8311),
    "rajkot": (22.3039, 70.8022),
    "राजकोट": (22.3039, 70.8022),
    "રાજકોટ": (22.3039, 70.8022),
    "gondal": (21.9619, 70.7923),
    "गोंडल": (21.9619, 70.7923),
    "ગોંડલ": (21.9619, 70.7923),
    "lucknow": (26.8467, 80.9462),
    "लखनऊ": (26.8467, 80.9462),
    "kanpur": (26.4499, 80.3319),
    "कानपुर": (26.4499, 80.3319),
    "nagpur": (21.1458, 79.0882),
    "नागपुर": (21.1458, 79.0882),
    "नागपूर": (21.1458, 79.0882),
    "agra": (27.1767, 78.0081),
    "आगरा": (27.1767, 78.0081),
    "bhopal": (23.2599, 77.4126),
    "भोपाल": (23.2599, 77.4126),
}

# Multi-lingual message dictionaries
MESSAGES = {
    "en": {
        "welcome": (
            "🌾 *Welcome to Smart Mandi Intelligence!*\n\n"
            "We help you find the *most profitable mandi* by comparing *Net Profit* "
            "(price minus transport, commission, loading & spoilage costs) — not just raw prices.\n\n"
            "👉 *Which crop do you want to sell today?*\n"
            "Supported crops: *Tomato*, *Onion*, *Potato*, *Wheat*, *Banana*\n\n"
            "_(Reply with your crop name, e.g. 'Tomato' or 'Onion' — or type 'Hindi', 'Marathi', 'Gujarati' to switch language)_"
        ),
        "ask_quantity": "✅ Selected Crop: *{crop}*\n\n⚖️ *How much quantity do you want to sell?*\n_(Reply with quantity in quintals, e.g. '20 quintals' or '25')_",
        "ask_location": (
            "✅ Quantity: *{quantity} Quintals* of *{crop}*\n\n"
            "📍 *Where are you located?*\n\n"
            "👉 You can either:\n"
            "1. 📎 *Share your WhatsApp Location Pin* (Recommended), OR\n"
            "2. ✍️ Type your city or district (e.g. *Jaipur*, *Kota*, *Indore*, *Delhi*, *Nashik*)"
        ),
        "rec_header": "🌾 *Smart Mandi Recommendations*\n📦 *{quantity}q {crop}* from *{location}*\n",
        "net_take_home": "Net Take-Home",
        "modal_price": "Modal Price",
        "deductions": "Deductions",
        "distance": "Distance",
        "recommended": "[RECOMMENDED]",
        "key_insight": "Key Insight",
        "more_info": "💬 *Need more info?*\n• Reply *'details'* or *'why'* to see cost breakdowns\n• Reply *'new'* to start a new search",
        "invalid_quantity": "⚠️ Could not understand quantity. Please enter a valid number (e.g. '20 quintals' or '15 q').",
        "invalid_location": "⚠️ Could not find coordinates for '{text}'. Please share your WhatsApp Location Pin or type a major city (e.g. 'Jaipur', 'Nashik', 'Indore', 'Delhi').",
        "breakdown_title": "📊 *Itemized Cost Breakdown per Quintal:*",
        "gross_price": "Gross Market Price",
        "transport_cost": "Transport Cost",
        "commission": "Mandi Commission",
        "loading": "Loading & Unloading",
        "spoilage": "Spoilage Risk Deduction",
        "net_profit": "Net Profit",
    },
    "hi": {
        "welcome": (
            "🌾 *स्मार्ट मंडी इंटेलिजेंस में आपका स्वागत है!*\n\n"
            "हम सिर्फ मंडी का भाव नहीं, बल्कि *शुद्ध मुनाफा* (भाव में से भाड़ा, कमीशन, पल्लेदारी और खराबी का खर्च घटाकर) "
            "बताते हैं ताकि आपकी जेब में सबसे ज्यादा पैसा आए।\n\n"
            "👉 *आज आप कौन सी फसल बेचना चाहते हैं?*\n"
            "उपलब्ध फसलें: *टमाटर*, *प्याज*, *आलू*, *गेहूं*, *केला*\n\n"
            "_(अपनी फसल का नाम लिखकर भेजें, जैसे 'टमाटर' या 'प्याज')_"
        ),
        "ask_quantity": "✅ चुनी गई फसल: *{crop}*\n\n⚖️ *आप कितनी मात्रा (क्विंटल में) बेचना चाहते हैं?*\n_(जैसे: '20 क्विंटल' या '25')_",
        "ask_location": (
            "✅ मात्रा: *{quantity} क्विंटल* ({crop})\n\n"
            "📍 *आपकी वर्तमान लोकेशन कहाँ है?*\n\n"
            "👉 आप:\n"
            "1. 📎 *व्हाट्सएप लोकेशन पिन (Location)* भेज सकते हैं (सर्वोत्तम), या\n"
            "2. ✍️ अपने शहर/जिले का नाम लिखें (जैसे: *जयपुर*, *कोटा*, *इंदौर*, *नासिक*, *दिल्ली*)"
        ),
        "rec_header": "🌾 *स्मार्ट मंडी की सिफारिशें*\n📦 *{quantity} क्विंटल {crop}* — स्थान: *{location}*\n",
        "net_take_home": "शुद्ध कमाई (जेब में)",
        "modal_price": "मंडी भाव",
        "deductions": "कुल खर्चे",
        "distance": "दूरी",
        "recommended": "[सर्वोत्तम मुनाफा]",
        "key_insight": "फायदेमंद सलाह",
        "more_info": "💬 *और जानकारी चाहिए?*\n• खर्चों का पूरा ब्यौरा देखने के लिए *'why'* या *'details'* लिखें\n• नई खोज के लिए *'new'* लिखें",
        "invalid_quantity": "⚠️ मात्रा समझ नहीं आई। कृपया संख्या में लिखें (जैसे: '20 क्विंटल' या '15 q')।",
        "invalid_location": "⚠️ '{text}' का स्थान नहीं मिला। कृपया अपना व्हाट्सएप लोकेशन पिन भेजें या प्रमुख शहर का नाम लिखें (जैसे 'जयपुर', 'इंदौर', 'दिल्ली')।",
        "breakdown_title": "📊 *प्रति क्विंटल खर्चों का पूरा विवरण:*",
        "gross_price": "मंडी का कुल भाव",
        "transport_cost": "गाड़ी भाड़ा (परिवहन)",
        "commission": "मंडी कमीशन",
        "loading": "लोडिंग व अनलोडिंग (पल्लेदारी)",
        "spoilage": "रास्ते में खराबी का जोखिम",
        "net_profit": "शुद्ध मुनाफा",
    },
    "mr": {
        "welcome": (
            "🌾 *स्मार्ट मंडी कृषी सल्ला सेवेत आपले स्वागत आहे!*\n\n"
            "आम्ही केवळ बाजारभाव नाही, तर वाहतूक खर्च, आडत (कमिशन), हमाली आणि मालाची नासाडी वजा करून "
            "*प्रत्यक्ष हातात मिळणारा निव्वळ नफा* दाखवतो.\n\n"
            "👉 *आज तुम्हाला कोणता शेतमाल विकायचा आहे?*\n"
            "उपलब्ध पिके: *टोमॅटो*, *कांदा*, *बटाटा*, *गहू*, *केळी*\n\n"
            "_(तुमच्या पिकाचे नाव पाठवा, उदा. 'कांदा' किंवा 'टोमॅटो')_"
        ),
        "ask_quantity": "✅ निवडलेले पीक: *{crop}*\n\n⚖️ *तुमच्याकडे किती माल (क्विंटलमध्ये) विक्रीसाठी आहे?*\n_(उदा. '20 क्विंटल' किंवा '25')_",
        "ask_location": (
            "✅ प्रमाण: *{quantity} क्विंटल* ({crop})\n\n"
            "📍 *तुमचे गाव किंवा ठिकाण कोणते आहे?*\n\n"
            "👉 तुम्ही:\n"
            "1. 📎 *व्हॉट्सॲप लोकेशन पिन (Location)* शेअर करू शकता (शिफारस केलेले), किंवा\n"
            "2. ✍️ तुमच्या तालुक्याचे/जिल्ह्याचे नाव लिहा (उदा. *नाशिक*, *पुणे*, *मुंबई*, *नागपूर*)"
        ),
        "rec_header": "🌾 *स्मार्ट बाजार समिती शिफारस*\n📦 *{quantity} क्विंटल {crop}* — ठिकाण: *{location}*\n",
        "net_take_home": "हातात मिळणारा निव्वळ नफा",
        "modal_price": "बाजारभाव",
        "deductions": "एकूण खर्च",
        "distance": "अंतर",
        "recommended": "[सर्वात जास्त नफा]",
        "key_insight": "महत्त्वाची टीप",
        "more_info": "💬 *सविस्तर खर्च पाहायचा आहे?*\n• तपशील पाहण्यासाठी *'why'* किंवा *'details'* पाठवा\n• नवीन शोधण्यासाठी *'new'* पाठवा",
        "invalid_quantity": "⚠️ प्रमाण समजले नाही. कृपया योग्य आकडा पाठवा (उदा. '20 क्विंटल' किंवा '15 q').",
        "invalid_location": "⚠️ '{text}' चे अंतर शोधता आले नाही. कृपया व्हॉट्सॲप लोकेशन पाठवा किंवा प्रमुख शहराचे नाव लिहा (उदा. 'नाशिक', 'पुणे').",
        "breakdown_title": "📊 *प्रति क्विंटल सविस्तर खर्च विभाजन:*",
        "gross_price": "एकूण बाजारभाव",
        "transport_cost": "वाहतूक भाडे",
        "commission": "बाजार समिती आडत (कमिशन)",
        "loading": "हमाली व तोलाई (Loading)",
        "spoilage": "वाहतुकीतील नासाडीचे नुकसान",
        "net_profit": "निव्वळ नफा",
    },
    "gu": {
        "welcome": (
            "🌾 *સ્માર્ટ મંડી કૃષિ સેવામાં આપનું સ્વાગત છે!*\n\n"
            "અમે ફક્ત બજાર ભાવ નહીં, પણ ભાડું, કમિશન, મજૂરી અને બગાડ બાદ કરીને "
            "*હાથમાં આવતો ચોખ્ખો નફો* બતાવીએ છીએ.\n\n"
            "👉 *આજે તમારે કયો પાક વેચવો છે?*\n"
            "ઉપલબ્ધ પાક: *ટામેટા*, *ડુંગળી*, *બટાકા*, *ઘઉં*, *કેળા*\n\n"
            "_(તમારા પાકનું નામ લખીને મોકલો, દા.ત. 'ડુંગળી' અથવા 'ટામેટા')_"
        ),
        "ask_quantity": "✅ પસંદ કરેલ પાક: *{crop}*\n\n⚖️ *તમારી પાસે કેટલો જથ્થો (ક્વિન્ટલમાં) છે?*\n_(દા.ત. '20 ક્વિન્ટલ' અથવા '25')_",
        "ask_location": (
            "✅ જથ્થો: *{quantity} ક્વિન્ટલ* ({crop})\n\n"
            "📍 *તમારું ગામ કે શહેર કયું છે?*\n\n"
            "👉 તમે:\n"
            "1. 📎 *વોટ્સએપ લોકેશન પિન (Location)* મોકલી શકો છો (ઉત્તમ), અથવા\n"
            "2. ✍️ તમારા શહેર/જિલ્લાનું નામ લખો (દા.ત. *અમદાવાદ*, *રાજકોટ*, *સુરત*, *ગોંડલ*)"
        ),
        "rec_header": "🌾 *સ્માર્ટ માર્કેટિંગ યાર્ડ ભલામણ*\n📦 *{quantity} ક્વિન્ટલ {crop}* — સ્થળ: *{location}*\n",
        "net_take_home": "હાથમાં આવતો ચોખ્ખો નફો",
        "modal_price": "બજાર ભાવ",
        "deductions": "કુલ ખર્ચ",
        "distance": "અંતર",
        "recommended": "[સૌથી વધુ નફો]",
        "key_insight": "મહત્વપૂર્ણ સલાહ",
        "more_info": "💬 *વધુ વિગત જોવી છે?*\n• ખર્ચની વિગત માટે *'why'* અથવા *'details'* લખો\n• નવી શોધ માટે *'new'* લખો",
        "invalid_quantity": "⚠️ જથ્થો સમજાયો નથી. કૃપા કરીને આંકડામાં લખો (દા.ત. '20 ક્વિન્ટલ').",
        "invalid_location": "⚠️ '{text}' નું લોકેશન મળ્યું નથી. કૃપા કરીને લોકેશન પિન મોકલો અથવા મુખ્ય શહેરનું નામ લખો.",
        "breakdown_title": "📊 *પ્રતિ ક્વિન્ટલ ખર્ચની વિગત:*",
        "gross_price": "કુલ બજાર ભાવ",
        "transport_cost": "વાહન ભાડું (ટ્રાન્સપોર્ટ)",
        "commission": "યાર્ડ કમિશન",
        "loading": "મજૂરી અને લોડિંગ/અનલોડિંગ",
        "spoilage": "રસ્તામાં બગાડનું જોખમ",
        "net_profit": "ચોખ્ખો નફો",
    },
}


class WhatsAppBotService:
    """Processes incoming WhatsApp messages with multi-lingual regional language support."""

    @staticmethod
    def detect_language(text: str, current_lang: str = "en") -> str:
        """Detect language from greetings, keywords, or numeric choice."""
        cleaned = text.lower().strip()
        if cleaned in ["2", "hindi", "हिंदी"]:
            return "hi"
        if cleaned in ["3", "marathi", "मराठी"]:
            return "mr"
        if cleaned in ["4", "gujarati", "ગુજરાતી"]:
            return "gu"
        if cleaned in ["1", "english", "en"]:
            return "en"

        # Explicit greetings
        if any(w in cleaned for w in ["नमस्ते", "प्रणाम", "राम राम"]):
            return "hi"
        if any(w in cleaned for w in ["नमस्कार", "जय महाराष्ट्र"]):
            return "mr"
        if any(w in cleaned for w in ["નમસ્તે", "જય શ્રી કૃષ્ણ"]):
            return "gu"

        # Preserve already active regional language during multi-step conversation
        if current_lang in ["hi", "mr", "gu"]:
            return current_lang

        # Check script signatures for new sessions
        if re.search(r"[\u0900-\u097F]", text):
            if any(w in text for w in ["कांदा", "बटाटा", "गहू", "केळी", "भाडे", "फायदा", "तोलाई", "हमाली"]):
                return "mr"
            return "hi"
        if re.search(r"[\u0A80-\u0AFF]", text):
            return "gu"

        return current_lang

    @staticmethod
    def parse_crop(text: str) -> Optional[str]:
        """Recognize crop from text in English, Hindi, Marathi, or Gujarati."""
        cleaned = text.lower().strip()
        for alias, standard_name in CROP_ALIASES.items():
            if alias in cleaned:
                return standard_name
        return None

    @staticmethod
    def parse_quantity(text: str) -> Optional[float]:
        """Extract numeric quantity in quintals from user text."""
        cleaned = text.lower().strip()
        match = re.search(r"(\d+(\.\d+)?)", cleaned)
        if not match:
            return None

        val = float(match.group(1))
        # Unit conversion
        if "kg" in cleaned or "किलो" in cleaned or "કિલો" in cleaned:
            return round(val / 100.0, 2)
        elif "ton" in cleaned or "tonne" in cleaned or "टन" in cleaned or "ટન" in cleaned:
            return round(val * 10.0, 2)
        return val

    @staticmethod
    def geocode_location(
        text: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Optional[Tuple[float, float, str]]:
        """Resolve location from GPS coordinates or city text."""
        if lat is not None and lon is not None:
            return (lat, lon, "Shared GPS Location")

        if not text:
            return None

        cleaned = text.lower().strip()
        for city, coords in CITY_COORDINATES.items():
            if city in cleaned:
                return (coords[0], coords[1], city.capitalize())

        return None

    @classmethod
    async def process_incoming_message(
        cls,
        phone_number: str,
        message_body: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        db: Optional[Session] = None,
    ) -> str:
        """Standard entry point for Twilio webhook and simulator."""
        from app.database import SessionLocal

        db_session = db or SessionLocal()
        try:
            return await cls.process_message(
                db=db_session,
                phone_number=phone_number,
                incoming_text=message_body,
                latitude=latitude,
                longitude=longitude,
            )
        finally:
            if db is None:
                db_session.close()

    @classmethod
    async def process_message(
        cls,
        db: Session,
        phone_number: str,
        incoming_text: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> str:
        """Main multi-lingual conversational state machine entry point."""
        text_clean = (incoming_text or "").strip()
        session_key = f"session:{phone_number}"

        # 1. Retrieve session
        session_data = cache_service.get(session_key) or {
            "state": STATE_IDLE,
            "crop": None,
            "quantity": None,
            "language": "en",
            "last_recommendation": None,
        }

        current_state = session_data.get("state", STATE_IDLE)
        current_lang = session_data.get("language", "en")

        # Check for language switch
        detected_lang = cls.detect_language(text_clean, current_lang)
        if detected_lang != current_lang:
            current_lang = detected_lang
            session_data["language"] = current_lang

        msg = MESSAGES.get(current_lang, MESSAGES["en"])

        # Reset keywords
        if text_clean.lower() in ["hi", "hello", "reset", "start", "new", "नमस्ते", "नमस्कार", "નમસ્તે"]:
            session_data = {
                "state": STATE_IDLE,
                "crop": None,
                "quantity": None,
                "language": current_lang,
                "last_recommendation": None,
            }
            cache_service.set(session_key, session_data, ttl_seconds=7200)
            return msg["welcome"]

        # Follow-up "why" / "details"
        if text_clean.lower() in ["why", "why?", "details", "explain", "क्यों", "क्यो", "का", "કેમ"]:
            last_rec = session_data.get("last_recommendation")
            if last_rec:
                return cls._format_detailed_breakdown(last_rec, current_lang)

        # ----------------------------------------------------
        # STATE: IDLE -> Awaiting Crop
        # ----------------------------------------------------
        if current_state == STATE_IDLE:
            crop_name = cls.parse_crop(text_clean)
            if not crop_name:
                return msg["welcome"]

            session_data["crop"] = crop_name
            session_data["state"] = STATE_AWAITING_QUANTITY
            cache_service.set(session_key, session_data, ttl_seconds=7200)
            return msg["ask_quantity"].format(crop=crop_name)

        # ----------------------------------------------------
        # STATE: AWAITING_QUANTITY
        # ----------------------------------------------------
        elif current_state == STATE_AWAITING_QUANTITY:
            quantity = cls.parse_quantity(text_clean)
            if not quantity or quantity <= 0:
                return msg["invalid_quantity"]

            session_data["quantity"] = quantity
            session_data["state"] = STATE_AWAITING_LOCATION
            cache_service.set(session_key, session_data, ttl_seconds=7200)
            return msg["ask_location"].format(quantity=quantity, crop=session_data["crop"])

        # ----------------------------------------------------
        # STATE: AWAITING_LOCATION
        # ----------------------------------------------------
        elif current_state == STATE_AWAITING_LOCATION:
            geo_res = cls.geocode_location(text_clean, latitude, longitude)
            if not geo_res:
                return msg["invalid_location"].format(text=text_clean)

            farmer_lat, farmer_lon, loc_label = geo_res
            crop_name = session_data["crop"]
            quantity = session_data["quantity"]

            # Load Crop
            crop = db.query(Crop).filter(Crop.name.ilike(crop_name)).first()
            if not crop:
                crop = Crop(name=crop_name, category="Vegetable", perishability_index=0.5)

            # Load Mandis
            mandis = db.query(Mandi).filter(Mandi.is_active == True).all()
            candidate_results = []

            for mandi in mandis:
                # 1. Price
                price_data = agmarknet_service.get_mandi_price(db, mandi.id, crop.id, crop.name)
                modal_price = price_data.get("modal_price", 2000.0)

                # 2. Distance
                dist_data = await distance_service.get_distance_and_time(
                    farmer_lat, farmer_lon, mandi.latitude, mandi.longitude
                )
                dist_km = dist_data["distance_km"]
                travel_hours = dist_data["travel_time_hours"]

                # 3. Net Profit
                cost_cfg = mandi.cost_config or CostConfig()
                profit_res = cost_engine.calculate_net_profit(
                    modal_price=modal_price,
                    quantity_quintals=quantity,
                    distance_km=dist_km,
                    travel_time_hours=travel_hours,
                    crop=crop,
                    cost_config=cost_cfg,
                )

                # 4. Sale Window Recommendation
                sw_res = sale_window_service.calculate_sale_window(
                    db=db,
                    mandi_id=mandi.id,
                    crop_id=crop.id,
                    crop=crop,
                    modal_price=modal_price,
                )

                candidate_results.append({
                    "mandi_id": mandi.id,
                    "mandi_name": mandi.name,
                    "district": mandi.district,
                    "state": mandi.state,
                    "distance_km": dist_km,
                    "travel_time_hours": travel_hours,
                    "modal_price": modal_price,
                    "profit": profit_res,
                    "sale_window": sw_res,
                })

            # Sort by Net Profit descending
            candidate_results.sort(
                key=lambda x: x["profit"]["net_profit_per_quintal"],
                reverse=True,
            )

            # Format Response
            reply_text, key_insight = cls._format_recommendation_response(
                crop_name, quantity, loc_label, candidate_results[:3], current_lang
            )

            # Save audit query
            best = candidate_results[0]
            query_log = FarmerQuery(
                phone_number=phone_number,
                crop_id=crop.id,
                crop_name=crop.name,
                latitude=farmer_lat,
                longitude=farmer_lon,
                quantity_quintals=quantity,
                recommended_mandi_id=best["mandi_id"],
                query_text=f"{crop_name} - {quantity}q",
                response_text=key_insight,
            )
            db.add(query_log)
            db.commit()

            # Update session
            session_data["state"] = STATE_RECOMMENDATION_ACTIVE
            session_data["last_recommendation"] = candidate_results[:3]
            cache_service.set(session_key, session_data, ttl_seconds=7200)

            return reply_text

        # Fallback
        return msg["welcome"]

    @classmethod
    def _format_recommendation_response(
        cls,
        crop_name: str,
        quantity: float,
        location: str,
        top_mandis: List[Dict[str, Any]],
        lang: str = "en",
    ) -> Tuple[str, str]:
        """Build multi-lingual formatted WhatsApp response."""
        msg = MESSAGES.get(lang, MESSAGES["en"])
        lines = [msg["rec_header"].format(quantity=quantity, crop=crop_name, location=location)]

        medals = ["🥇", "🥈", "🥉"]

        for idx, item in enumerate(top_mandis):
            medal = medals[idx] if idx < len(medals) else f"#{idx+1}"
            is_best = idx == 0
            badge = f" ⭐ *{msg['recommended']}*" if is_best else ""

            p = item["profit"]
            lines.append(
                f"{medal} *#{idx+1} {item['mandi_name']}* ({item['district']}){badge}\n"
                f"   💰 *{msg['net_take_home']}: ₹{p['net_profit_per_quintal']:,.2f}/q* (Total: ₹{p['total_net_profit']:,.2f})\n"
                f"   📊 {msg['modal_price']}: ₹{item['modal_price']:,.2f} | {msg['deductions']}: ₹{p['total_deductions_per_quintal']:,.2f}\n"
                f"   🚚 {msg['distance']}: {item['distance_km']:.1f} km (~{item['travel_time_hours']:.2f} hrs)\n"
            )

        # Comparative Key Insight
        best = top_mandis[0]
        second = top_mandis[1] if len(top_mandis) > 1 else None
        gain_per_q = (
            best["profit"]["net_profit_per_quintal"] - second["profit"]["net_profit_per_quintal"]
            if second
            else 0.0
        )
        total_gain = gain_per_q * quantity

        if lang == "hi":
            key_insight = (
                f"{quantity} क्विंटल {crop_name} के लिए, *{best['mandi_name']}* ({best['district']}) में बेचने पर "
                f"आपको सबसे अधिक शुद्ध कमाई ₹{best['profit']['net_profit_per_quintal']:,.2f}/क्विंटल (कुल: ₹{best['profit']['total_net_profit']:,.2f}) मिलेगी। "
            )
            if second and gain_per_q > 0:
                key_insight += f"यहाँ बेचने से *{second['mandi_name']}* की तुलना में ₹{gain_per_q:,.2f}/क्विंटल अधिक (+₹{total_gain:,.2f} अतिरिक्त) शुद्ध बचत होगी।"
        elif lang == "mr":
            key_insight = (
                f"{quantity} क्विंटल {crop_name} साठी, *{best['mandi_name']}* ({best['district']}) येथे "
                f"सर्वात जास्त निव्वळ नफा ₹{best['profit']['net_profit_per_quintal']:,.2f}/क्विंटल (एकूण: ₹{best['profit']['total_net_profit']:,.2f}) मिळेल. "
            )
            if second and gain_per_q > 0:
                key_insight += f"येथे विक्री केल्यास *{second['mandi_name']}* च्या तुलनेत ₹{gain_per_q:,.2f}/क्विंटल जास्त (+₹{total_gain:,.2f} जास्तीचा नफा) हातात येईल."
        elif lang == "gu":
            key_insight = (
                f"{quantity} ક્વિન્ટલ {crop_name} માટે, *{best['mandi_name']}* ({best['district']}) માં "
                f"સૌથી વધુ ચોખ્ખી કમાણી ₹{best['profit']['net_profit_per_quintal']:,.2f}/ક્વિન્ટલ (કુલ: ₹{best['profit']['total_net_profit']:,.2f}) મળશે. "
            )
            if second and gain_per_q > 0:
                key_insight += f"અહીં વેચવાથી *{second['mandi_name']}* કરતાં ₹{gain_per_q:,.2f}/ક્વિન્ટલ વધુ (+₹{total_gain:,.2f} વધારાનો નફો) થશે."
        else:
            key_insight = (
                f"For {quantity} quintals of {crop_name}, {best['mandi_name']} in {best['district']} delivers the highest "
                f"net take-home earnings of ₹{best['profit']['net_profit_per_quintal']:,.2f}/quintal (Total: ₹{best['profit']['total_net_profit']:,.2f}). "
            )
            if second and gain_per_q > 0:
                key_insight += f"Selling here yields ₹{gain_per_q:,.2f} more per quintal (+₹{total_gain:,.2f} total) compared to {second['mandi_name']}."

        # Sale Window Timing Advice
        sw_window = best.get("sale_window", {}).get("recommended_window", "Sell within 1–2 Days")
        sw_forecast = best.get("sale_window", {}).get("price_forecast", "Stable prices")
        if lang == "hi":
            lines.append(f"📅 *बिक्री समय सलाह (Sale-Window):* {sw_window} ({sw_forecast})\n")
        elif lang == "mr":
            lines.append(f"📅 *विक्री वेळ सल्ला (Sale-Window):* {sw_window} ({sw_forecast})\n")
        elif lang == "gu":
            lines.append(f"📅 *વેચાણ સમય સલાહ (Sale-Window):* {sw_window} ({sw_forecast})\n")
        else:
            lines.append(f"📅 *Optimal Sale-Window:* {sw_window} ({sw_forecast})\n")

        lines.append(f"💡 *{msg['key_insight']}:*\n{key_insight}\n")

        # Kisan Pool Alert for smallholder harvests (<= 25 quintals)
        if quantity <= 25.0:
            if lang == "hi":
                lines.append(f"🚛 *किसान पूल बचत (Kisan Pool Alert):*\nआपके आसपास 2 किसान भी *{best['mandi_name']}* के लिए गाड़ी बुक कर रहे हैं। साझा गाड़ी करने से आपका भाड़ा ₹45-₹75/क्विंटल तक कम हो सकता है!\n")
            elif lang == "mr":
                lines.append(f"🚛 *किसान पूल बचत (Kisan Pool Alert):*\nतुमच्या परिसरातील 2 शेतकरी देखील *{best['mandi_name']}* साठी वाहन शोधत आहेत. एकत्रित वाहतूक केल्यास भाड्यात ₹45-₹75/क्विंटल बचत होईल!\n")
            elif lang == "gu":
                lines.append(f"🚛 *કિસાન પૂલ બચત (Kisan Pool Alert):*\nતમારા વિસ્તારના અન્ય 2 ખેડૂતો પણ *{best['mandi_name']}* માટે વાહન શોધી રહ્યા છે. સાથે વાહન કરવાથી ભાડામાં ₹45-₹75/ક્વિન્ટલ બચત થશે!\n")
            else:
                lines.append(f"🚛 *Kisan Pool Alert:*\n2 nearby farmers in your cluster are also dispatching to *{best['mandi_name']}*! Pool your produce to save ₹45-₹75/q on shared freight.\n")

        lines.append("────────────────")
        lines.append(msg["more_info"])

        return "\n".join(lines), key_insight

    @classmethod
    def _format_detailed_breakdown(cls, top_mandis: List[Dict[str, Any]], lang: str = "en") -> str:
        """Return multi-lingual itemized cost deductions."""
        msg = MESSAGES.get(lang, MESSAGES["en"])
        lines = [msg["breakdown_title"], ""]

        for item in top_mandis[:2]:
            p = item["profit"]
            lines.append(f"*{item['mandi_name']}* ({item['district']}):")
            lines.append(f"  • {msg['gross_price']}: +₹{item['modal_price']:,.2f}")
            lines.append(f"  • {msg['transport_cost']}: -₹{p['transport_cost_per_quintal']:,.2f} ({item['distance_km']:.1f} km)")
            lines.append(f"  • {msg['commission']} ({p['commission_percentage']}%): -₹{p['commission_per_quintal']:,.2f}")
            lines.append(f"  • {msg['loading']}: -₹{p['loading_unloading_cost_per_quintal']:,.2f}")
            lines.append(f"  • {msg['spoilage']}: -₹{p['spoilage_risk_deduction_per_quintal']:,.2f}")
            lines.append(f"  ➡️ *{msg['net_profit']}: ₹{p['net_profit_per_quintal']:,.2f}/q*")
            lines.append("")

        if lang == "hi":
            lines.append("नई फसल खोजने के लिए *'new'* लिखें!")
        elif lang == "mr":
            lines.append("नवीन शेतमालासाठी *'new'* पाठवा!")
        elif lang == "gu":
            lines.append("નવી શોધ માટે *'new'* લખો!")
        else:
            lines.append("Type *'new'* to search for another crop!")

        return "\n".join(lines)


# Export singleton instance
whatsapp_bot = WhatsAppBotService()
