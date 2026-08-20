# 🌾 Smart Mandi Selection Platform — Official User Manual & Operating Guide

> **Author & Lead Architect:** **Devansh Rahatal**  
> **Classification:** Agricultural Price Discovery, GIS Profit Mapping & Shared Freight Optimization  
> **Tech Stack:** React 18 (Vite) • FastAPI • Leaflet GIS • SQLAlchemy • Twilio WhatsApp • Voice AI  
> **Document Version:** 1.0 (Production Release)

---

## 1. 🌟 Executive Summary & The Core Problem

Most agricultural market applications display only the **Gross Modal Price** (advertised mandi price). As a result, farmers frequently travel long distances chasing high prices, only to suffer severe financial losses due to transport fees, APMC mandi commissions, handling charges, and transit spoilage.

**Smart Mandi solves this "Price Illusion"** by computing the exact **Net Take-Home Profit** for every candidate mandi within a 300 km radius.

$$\text{Net Profit} = \text{Modal Price} - \Big(\text{Transport} + \text{Handling} + \text{Mandi Commission} + \text{Transit Spoilage}\Big)$$

* **Transit Spoilage Formula:**
  $$\text{Spoilage} = \text{Modal Price} \times I_{\text{perish}} \times \left(\frac{T_{\text{transit}}}{24}\right) \times 0.15$$
  * *Perishability Indices:* Tomato ($0.85$), Onion ($0.25$), Potato ($0.20$), Wheat ($0.05$), Banana ($0.70$).

---

## 2. 💻 Web Application Step-by-Step User Guide

### 2.1 Public Landing Page (`/`)
1. **Explore the Net Profit Scenario:** See the live comparison table demonstrating why a Jaipur tomato farmer makes ₹169/q **more** net profit in Kota than in Azadpur (Delhi), despite Azadpur having a higher gross price.
2. **Multi-Lingual Switcher:** Switch between **English, Hindi (हिंदी), Marathi (मराठी), and Gujarati (ગુજરાતી)** using the top language selector.
3. **1-Click WhatsApp Assistant:** Connect instantly to the WhatsApp bot with pre-filled activation code.
4. **In-Browser Voice AI Simulator:** Test speech queries directly in your browser without switching to a phone.

---

### 2.2 Interactive Profit Map (`/map`)
1. Click **"Profit Map"** in the top navigation bar.
2. Select your **Origin Hub** (e.g., Vadodara, Surat, Rajkot, Jaipur, Pune, Nashik, etc.).
3. Choose your **Crop** (Tomato, Onion, Potato, Wheat, Banana) and set your **Harvest Quantity** via the slider.
4. **Read the Color-Coded GIS Route Lines:**
   * 🟢 **Green Line (#1):** Maximum Net Profit destination (Optimal market).
   * 🔵 **Teal Line (#2):** Moderate profit alternative.
   * 🟡 **Amber Line (#3):** Lower profit / high-distance market.
5. **Click Any Pin:** View a complete pop-up breakdown of Net Take-Home, Gross Modal Price, Total Deductions, and Travel Distance in km.

---

### 2.3 Kisan Pool Shared Freight Optimizer (`/pooling`)
1. Click **"Kisan Pool"** in the navigation bar.
2. **Use the Interactive Savings Calculator:**
   * Adjust **Solo Quantity** (e.g., 12 quintals).
   * Adjust **Total Pooled Quantity** (e.g., 36 quintals).
   * Adjust **Distance** (e.g., 248 km).
3. The platform dynamically matches the best commercial vehicle (Tata Ace → Eicher 14ft → 19ft Heavy Truck → 16-Ton Taurus) and calculates instant savings per quintal (typically 35%–55% freight cost reduction).
4. **Active Pooling Batches:** View live clusters and connect with cluster FPOs in one click.

---

### 2.4 Admin Intelligence Dashboard (`/admin/dashboard`)
1. Click **"Admin Dashboard"** or go to `/admin/login`.
2. **Sign In:** Username: `admin` | Password: `admin123`.
3. **Platform KPIs:** Mandis Tracked, Active Farmers, Average Savings per Quintal, Total Queries.
4. **Top Crops & Mandis:** Visual breakdown of most-queried crops and highest-profit mandis.
5. **Live Farmer Query Stream:** Real-time stream of incoming WhatsApp farmer queries and automated responses.
6. **Export Data:** Download complete platform intelligence as a CSV spreadsheet.

---

### 2.5 Price Trends & Cost Parameters (`/admin/mandis`, `/admin/costs`)
1. **Price Trends:** 30-day historical modal price curves across crops and markets.
2. **Cost Parameters:** Edit mandi-specific commission % (e.g., 5% to 8%), loading charges, unloading charges, and base transport rates. Changes take effect immediately across all calculations.

---

## 3. 📱 WhatsApp Voice & Text AI Assistant (Step-by-Step)

The WhatsApp Bot provides zero-app access for farmers directly on their existing smartphones.

### 3.1 Connecting to the Bot Gateway
1. Open or save the Twilio Gateway number on WhatsApp: **`+1 (415) 523-8886`**.
2. Send the activation code: **`join unusual-sea`**.
3. Direct 1-Click Link: [https://wa.me/14155238886?text=join%20unusual-sea](https://wa.me/14155238886?text=join%20unusual-sea)
4. You will receive a confirmation message from Twilio that your session is active.

### 3.2 Sending Natural Text Queries
Type any natural crop and quantity query:
* `Tomato 20q from Jaipur`
* `कांदा 15 क्विंटल नाशिक`
* `Potato 30q from Agra`
* `Wheat 50 quintal from Rajkot`

### 3.3 Sending Regional Voice Notes (Speech-to-Speech)
Hold the microphone icon in WhatsApp and speak in your native dialect:
* 🎙️ **Hindi:** *"भैया 20 क्विंटल टमाटर बेचना है जयपुर से"*
* 🎙️ **Marathi:** *"नमस्कार, 15 क्विंटल कांदा नाशिकमधून विकायचा आहे"*
* 🎙️ **Gujarati:** *"નમસ્તે, 20 ક્વિન્ટલ ડુંગળી રાજકોટથી વેચવી છે"*

The bot analyzes your voice note and responds with a text summary **plus a synthesized voice audio note** in your native language explaining the most profitable mandi.

### 3.4 Sharing GPS Location Pins 📍
Tap the attachment icon in WhatsApp → Select **Location** → Send your **Current Location**. The bot automatically calculates road distances to all nearby APMC mandis without manual typing.

---

## 4. 🛠️ Local Developer Run Instructions

### Backend
```powershell
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend
```powershell
cd frontend
npm run dev
```
* **Web Portal:** [http://localhost:5173](http://localhost:5173)

---

## 👨‍💻 Project Lead & Developer
* **Created & Architected by:** **Devansh Rahatal**
* **Repository:** `smart-mandi-selection`
