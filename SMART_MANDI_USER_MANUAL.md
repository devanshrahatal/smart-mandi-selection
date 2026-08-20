# 🌾 Smart Mandi Selection Platform — Official User Manual & Operating Guide

> **Author & Lead Architect:** **Devansh Rahatal**  
> **Live Web Application:** [https://smart-mandi-selection.vercel.app/](https://smart-mandi-selection.vercel.app/)  
> **API Documentation (Swagger):** [https://smart-mandi-selection.onrender.com/docs](https://smart-mandi-selection.onrender.com/docs)  
> **Classification:** Agricultural Price Intelligence, GIS Profit Routing & Shared Freight Optimization  
> **Tech Stack:** React 18 (Vite) • FastAPI • Leaflet GIS • SQLAlchemy • Twilio WhatsApp • Voice AI (gTTS)  
> **Document Version:** 1.0 (Production Release)

---

## 1. 🔍 The Problem: "The Price Illusion" in Indian Agriculture

In Indian agriculture, over **86% of farmers are small and marginal producers**. When deciding where to sell their harvest, farmers rely on traditional government portals or word-of-mouth price lists that display only the **Gross Modal Price** (the raw advertised auction price at a mandi).

### The Critical Flaws of the Traditional System:
1. **The Price Illusion Trap:** An advertised price of ₹2,900/quintal in a distant major metro mandi looks vastly superior to ₹2,450/quintal in a nearby district mandi. Chasing this illusion, farmers hire dedicated transport and travel hundreds of kilometers.
2. **Unaccounted Logistics & Hidden APMC Deductions:**
   * **Transport Freight:** Commercial vehicle hire costs ₹12–₹18/km, rapidly multiplying with distance.
   * **Mandi Commissions & Taxes:** APMC market cess and middleman commission fees vary widely between states (ranging from 1.5% to 8%).
   * **Handling Levies:** Unregulated loading, unloading, weighing, and bag-stitching charges per quintal.
3. **Perishable Crop Spoilage in Transit:** Highly perishable commodities (like tomatoes, bananas, onions) degrade with every hour spent in transit under heat and bumpy road conditions, causing direct weight loss and quality downgrades.

### Real-World Proof: Jaipur Tomato Farmer (20 Quintals)
| Candidate APMC Market | Advertised Raw Price | Transport Cost | Mandi Commission | Spoilage Decay | Real Take-Home Net Profit | Financial Verdict |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kota Krishi Mandi (Nearby)** | ₹2,450 / q | -₹484 / q | -₹110 / q | -₹79 / q | **₹1,737.16 / q** | 🥇 **OPTIMAL (+₹3,382 Higher Profit)** |
| **Azadpur, Delhi (Distant Hub)** | ₹2,901 / q | -₹927 / q | -₹218 / q | -₹119 / q | **₹1,568.06 / q** | 🥈 Misleading Gross Price Trap |
| **Vashi, Mumbai (Metro Hub)** | ₹2,820 / q | -₹2,347 / q | -₹197 / q | -₹420 / q | **₹0.00 / q** | ❌ Massive Net Financial Loss |

---

## 2. 💡 The Solution Engineered by Devansh Rahatal

To completely eliminate this price illusion, **Devansh Rahatal** designed and architected the **Smart Mandi Selection & Logistics Platform** — a full-stack, data-driven decision engine that calculates real take-home net profit and optimizes agricultural freight.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 RAW ADVERTISED PRICE                    │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
              ┌─────────────────────────────────────────────────────────────┐
              │                   DEDUCTION SUBTRACTIONS                    │
              │  [-] Road Transport Freight (Distance Matrix × Highway Rate)│
              │  [-] APMC Mandi Commissions & Market Taxes                  │
              │  [-] Loading & Unloading Handling Charges                   │
              │  [-] Perishability Degradation Index (Hours × Crop Decay)   │
              └───────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                TRUE NET TAKE-HOME PROFIT                │
                  │        (Ranked & Visualized for the Farmer)             │
                  └─────────────────────────────────────────────────────────┘
```

### Core Technological Innovations Introduced:
1. **5-Factor Net Profit Formulation:**
   $$\text{Net Profit} = \text{Modal Price} - \Big(\text{Transport} + \text{Handling} + \text{Commission} + \text{Transit Spoilage}\Big)$$
   * *Dynamic Spoilage Calculation:*
     $$\text{Spoilage} = \text{Modal Price} \times I_{\text{perish}} \times \left(\frac{T_{\text{transit}}}{24}\right) \times 0.15$$
     *(Where $I_{\text{perish}}$ is the scientific decay index: Tomato = 0.85, Banana = 0.70, Onion = 0.25, Potato = 0.20, Wheat = 0.05).*
2. **Leaflet GIS Spatial Route Mapping:** Color-coded visual route lines (Green = Maximum Profit, Teal = Moderate, Amber = Suboptimal) allowing farmers to see why distance matters.
3. **Kisan Pool Shared Freight Optimizer:** Solves small-batch transport penalties by algorithmically pooling neighboring farmers' harvest into larger freight vehicles (Tata Ace → Eicher 14ft → 19ft Heavy Truck → 16-Ton Taurus), reducing individual transport costs by **35% to 55%**.
4. **Zero-App WhatsApp Voice & Text AI Assistant:** Multi-lingual conversational bot supporting voice notes in **Hindi, Marathi, Gujarati, and English** with instant synthesized voice note audio replies and GPS location pin support.
5. **Real-time Admin Analytics & Dynamic Cost Parameter Controls:** Live query streaming, price trend curves, and live fee configuration for APMC administrators.

---

## 3. 📖 Step-by-Step User Walkthrough

### 3.1 Web Application Walkthrough

#### A. Public Landing Page (`https://smart-mandi-selection.vercel.app/`)
1. **View the Value Proposition:** Explore the live comparison scenario illustrating real profit differences.
2. **Switch Languages:** Click the language selector in the top bar to toggle between **English, Hindi (हिंदी), Marathi (मराठी), and Gujarati (ગુજરાતી)**.
3. **Connect to WhatsApp:** Use the 1-click WhatsApp button to launch the assistant with pre-filled sandbox codes.
4. **In-Browser Voice AI:** Click *"Try In-Browser Simulator"* to test native speech queries directly on your laptop/phone without WhatsApp.

#### B. Interactive Profit Map (`/map`)
1. Click **"Profit Map"** in the top navigation bar.
2. Select your **Origin Hub** (e.g., Vadodara, Surat, Rajkot, Jaipur, Pune, Nashik, etc.).
3. Select your **Crop** (Tomato, Onion, Potato, Wheat, Banana) and set your **Harvest Quantity** via the slider.
4. **Read the Map Routes:**
   * 🟢 **Green Line (#1):** Maximum Net Profit destination (Optimal market).
   * 🔵 **Teal Line (#2):** Moderate profit alternative.
   * 🟡 **Amber Line (#3):** Lower profit / high-distance market.
5. **Click Any Mandi Pin:** View a complete pop-up breakdown of Net Take-Home, Gross Modal Price, Total Deductions, and Travel Distance in km.

#### C. Kisan Pool Shared Freight Optimizer (`/pooling`)
1. Click **"Kisan Pool"** in the navigation bar.
2. **Interactive Savings Calculator:**
   * Adjust **Solo Quantity** (e.g., 12 quintals).
   * Adjust **Total Pooled Quantity** (e.g., 36 quintals).
   * Adjust **Distance** (e.g., 248 km).
3. The platform dynamically matches the best commercial vehicle and calculates instant savings per quintal.
4. **Active Pooling Batches:** View live clusters and connect with cluster FPOs in one click.

#### D. Admin Intelligence Dashboard (`/admin/dashboard`)
1. Click **"Admin Dashboard"** or go to `/admin/login`.
2. **Sign In:** Username: `admin` | Password: `admin123`.
3. **Platform KPIs:** View Mandis Tracked, Active Farmers, Average Savings per Quintal, and Total Queries.
4. **Top Crops & Mandis:** Visual breakdown of most-queried crops and highest-profit mandis.
5. **Live Farmer Query Stream:** Real-time stream of incoming WhatsApp farmer queries and automated responses.
6. **Export Data:** Download complete platform intelligence as a CSV spreadsheet.

#### E. Price Trends & Cost Parameters (`/admin/mandis`, `/admin/costs`)
1. **Price Trends:** 30-day historical modal price curves across crops and markets.
2. **Cost Parameters:** Edit mandi-specific commission % (e.g., 5% to 8%), loading charges, unloading charges, and base transport rates. Changes take effect immediately across all calculations.

---

### 3.2 WhatsApp Voice & Text AI Assistant Walkthrough

The WhatsApp Bot provides zero-app access for farmers directly on their existing smartphones.

```
          [ Farmer Phone ]
                 │
                 │ 1. Send "join unusual-sea"
                 ▼
     [ Twilio WhatsApp Gateway ] ─── (+1 415 523 8886)
                 │
                 │ 2. Text, Voice Note (Hindi/Marathi/Gujarati), or Location Pin
                 ▼
        [ FastAPI Backend ]
                 │
                 ├─► Speech Recognition & NLP Parser
                 ├─► Net Profit Engine (Agmarknet + Google Distance)
                 └─► Regional Voice Synthesis (gTTS)
                 │
                 ▼
     [ WhatsApp Response ] ─── Ranked Profit Table + Native Audio Voice Note
```

#### Step 1: Connecting to the Bot Gateway
1. Open WhatsApp on your phone and start a chat with: **`+1 (415) 523-8886`**.
2. Send the activation code: **`join unusual-sea`**.
3. **Direct 1-Click Link:** [https://wa.me/14155238886?text=join%20unusual-sea](https://wa.me/14155238886?text=join%20unusual-sea)
4. You will receive an immediate confirmation that the session is active.

#### Step 2: Sending Natural Text Queries
Type any natural crop and quantity query:
* `Tomato 20q from Jaipur`
* `कांदा 15 क्विंटल नाशिक`
* `Potato 30q from Agra`
* `Wheat 50 quintal from Rajkot`

#### Step 3: Sending Regional Voice Notes (Speech-to-Speech)
Hold the microphone icon in WhatsApp and speak in your native dialect:
* 🎙️ **Hindi:** *"भैया 20 क्विंटल टमाटर बेचना है जयपुर से"*
* 🎙️ **Marathi:** *"नमस्कार, 15 क्विंटल कांदा नाशिकमधून विकायचा आहे"*
* 🎙️ **Gujarati:** *"નમસ્તે, 20 ક્વિન્ટલ ડુંગળી રાજકોટથી વેચવી છે"*

The bot analyzes your voice note and responds with a text summary **plus a synthesized voice audio note** in your native language explaining the most profitable mandi.

#### Step 4: Sharing GPS Location Pins 📍
Tap the attachment icon in WhatsApp → Select **Location** → Send your **Current Location**. The bot automatically calculates road distances to all nearby APMC mandis without manual typing.

---

## 4. 🛠️ Technical Setup & Local Run Guide

### Prerequisites
* Python 3.11+
* Node.js 18+ / 20+

### 1. Run Backend Locally
```powershell
cd backend
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run Frontend Locally
```powershell
cd frontend
npm install
npm run dev
```
* **Web Portal:** [http://localhost:5173](http://localhost:5173)

---

## 👨‍💻 Project Lead & Developer
* **Created & Architected by:** **Devansh Rahatal**
* **Live Web App:** [https://smart-mandi-selection.vercel.app/](https://smart-mandi-selection.vercel.app/)
* **Repository:** `smart-mandi-selection`
