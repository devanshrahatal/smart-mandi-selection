# Smart Mandi Selection — System Architecture & Technical Specifications

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement**: Intelligent agricultural marketplace recommendation system calculating true net farmer profit.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Clients["User Channels"]
        WA["📱 WhatsApp Farmer (Twilio)"]
        WEB["💻 Admin Dashboard (React + Recharts)"]
    end

    subgraph Gateway["API Layer (FastAPI)"]
        REC["/api/recommendations"]
        WABOT["/api/whatsapp/webhook"]
        ADMIN["/api/admin/*"]
        AUTH["JWT Security & Auth"]
    end

    subgraph Engines["Core Intelligence Engines"]
        NPE["Net Profit Calculation Engine"]
        DIST["Google Maps Distance Matrix"]
        TREND["7d / 14d Price Trend Engine"]
        SPOIL["Perishability Spoilage Model"]
    end

    subgraph Caching["Caching & State (Redis)"]
        R_PRICE["Price Cache (6h TTL)"]
        R_DIST["Distance Cache (24h TTL)"]
        R_SESS["WhatsApp Sessions (2h TTL)"]
    end

    subgraph Persistence["Database (MySQL 8.0)"]
        DB_MANDI["Mandis & Coordinates"]
        DB_PRICE["30-Day Historical Prices"]
        DB_CONFIG["Per-Mandi Cost Configs"]
        DB_QUERIES["Farmer Query Audit Logs"]
        DB_ADMIN["Admin Users (bcrypt)"]
    end

    WA -->|Webhook / Simulate| WABOT
    WEB -->|REST / JWT| Gateway
    WABOT --> NPE
    REC --> NPE
    NPE --> DIST
    NPE --> SPOIL
    NPE --> TREND
    DIST <--> R_DIST
    NPE <--> R_PRICE
    WABOT <--> R_SESS
    NPE <--> Persistence
    ADMIN --> Persistence
```

---

## 2. Net Profit Optimization Formula

A fundamental flaw in existing agricultural portals (like e-NAM and Agmarknet) is that they only display **Gross Modal Price**. Farmers travel long distances chasing a higher price, only to discover that transport fees, mandi commissions, and spoilage losses resulted in a lower net return.

$$\text{Net Profit} = \text{Modal Price} - \Big(\text{Transport Cost} + \text{Loading/Unloading} + \text{Mandi Commission} + \text{Spoilage Risk}\Big)$$

### Mathematical Parameter Definitions

| Variable | Description | Formula / Standard Baseline |
|----------|-------------|-----------------------------|
| $P_{\text{modal}}$ | Modal market price of crop | ₹ / quintal |
| $C_{\text{transport}}$ | Road transit haulage fee | $\text{Distance (km)} \times \text{Rate (₹/km/q)}$ |
| $C_{\text{handling}}$ | Mandi loading + unloading charge | ₹ / quintal (configured per mandi) |
| $C_{\text{commission}}$ | APMC Mandi fee percentage | $P_{\text{modal}} \times \frac{\text{Commission \%}}{100}$ |
| $C_{\text{spoilage}}$ | Transit value loss due to decay | $P_{\text{modal}} \times I_{\text{perish}} \times \left(\frac{T_{\text{transit}}}{24}\right) \times 0.15$ |

Where:
- $I_{\text{perish}}$: Crop perishability index ($0.05$ for durable grains like Wheat, up to $0.85$ for perishables like Tomato).
- $T_{\text{transit}}$: Travel duration in hours ($T_{\text{transit}} = \frac{\text{Road Distance}}{40\text{ km/h}}$).
- $0.15$: Standard maximum single-day degradation ceiling without active refrigeration.

---

## 3. Multi-Tier Data Ingestion & Fallback Cascade

To ensure 100% uptime even when external government APIs undergo maintenance:

```mermaid
graph LR
    REQ["Fetch Price Request"] --> C{In Redis Cache?}
    C -- Yes --> RET["Return Cached Price (Fastest < 5ms)"]
    C -- No --> API{Agmarknet API Available?}
    API -- Yes --> SAVE["Save to DB & Cache (6h TTL)"]
    API -- No --> DB{MySQL DB Price Exists?}
    DB -- Yes --> DBP["Return Latest DB Price & Cache"]
    DB -- No --> EST["Return Crop Baseline Estimate"]
```

---

## 4. Geospatial Distance & Highway Modeling

- **Tier 1 — Google Maps Distance Matrix API**: Fetches real-time driving distances and traffic-adjusted travel durations.
- **Tier 2 — Redis Geospatial Cache (24h TTL)**: Caches `(lat1, lon1) -> (lat2, lon2)` pairs to minimize API billing.
- **Tier 3 — Haversine Formula with Indian Road Detour Factor**:
  $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
  $$\text{Road Distance} = d \times 1.28 \quad (\text{Indian National Highway Detour Multiplier})$$
  $$\text{Travel Time} = \frac{\text{Road Distance}}{40\text{ km/h}} \quad (\text{Medium Commercial Vehicle Speed})$$

---

## 5. Conversational WhatsApp State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE: First message / "Hi"
    IDLE --> AWAITING_QUANTITY: User selects crop (e.g. "Tomato")
    AWAITING_QUANTITY --> AWAITING_LOCATION: User inputs quantity (e.g. "20 quintals")
    AWAITING_LOCATION --> RECOMMENDATION_ACTIVE: User shares GPS pin or City name
    RECOMMENDATION_ACTIVE --> RECOMMENDATION_ACTIVE: "why" / "details" (Shows cost breakdown)
    RECOMMENDATION_ACTIVE --> IDLE: "new" / "reset"
```

- **Natural Language Parsing**: Supports Hindi aliases (*pyaaz*, *aloo*, *tamatar*, *gehu*, *kanda*, *batata*) and various units (*kg*, *quintals*, *tonnes*).
- **Session Persistence**: Farmers' conversational context is maintained in Redis with 2-hour TTL.
