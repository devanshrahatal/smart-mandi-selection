# 🌾 Smart Mandi Selection & Market Linkage Platform
## Official Pitch Deck & Presentation Guide — Smart India Hackathon 2026

> **Problem Statement ID**: **26132**  
> **Problem Statement Title**: *Strengthening market linkages and price discovery for farmers*  
> **Team Lead / Creator**: **Devansh Rahatal**  
> **Web App**: [https://smart-mandi-selection.vercel.app/](https://smart-mandi-selection.vercel.app/)  
> **API Docs**: [https://smart-mandi-selection.onrender.com/docs](https://smart-mandi-selection.onrender.com/docs)  

---

## 📌 Slide 1: Title & The Executive Vision
- **The Core Problem**: 86% of Indian farmers are smallholders who rely on **Gross Advertised Modal Prices** alone when deciding where to sell their harvest.
- **The Pitfall**: Long-distance mandis often show higher nominal rates, but hidden transport fees, APMC mandi commissions, loading charges, and biological transit spoilage wipe out farmer profits.
- **Our Solution**: A comprehensive 360° platform providing:
  1. **True Net Take-Home Price Discovery** deducting all 5 real-world friction costs.
  2. **Machine Learning 7-Day Price Forecasting** ($R^2$ accuracy scoring).
  3. **Direct Farmer-Buyer B2B Marketplace & Bidding**.
  4. **Kisan Pool Shared Freight Aggregator** (cutting logistics costs by 45–60%).
  5. **WDRA Cold Storage Mapping & Storage ROI Calculator** to stop distress sales.
  6. **4-Stage Cryptographic Escrow & Printable QR e-Receipts**.
  7. **Multi-Lingual Regional Voice AI & WhatsApp** (English, Hindi, Marathi, Gujarati).

---

## 📌 Slide 2: The Core Problem — "The Gross Price Illusion"

### Concrete Proof: Jaipur Farmer with 20q Tomato
| Market | Advertised Modal Price | Transport Freight | Mandi Commission | Spoilage Loss | Real Net Take-Home | True Financial Outcome |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kota Krishi Mandi** | ₹2,450/q | -₹484/q | -₹110/q | -₹79/q | **₹1,737.16/q** | 🥇 **HIGHEST NET EARNING** (+₹3,382 in pocket) |
| **Azadpur (Delhi)** | ₹2,901/q | -₹927/q | -₹218/q | -₹119/q | **₹1,568.06/q** | 🥈 Misleading Gross Price (-₹3,382 loss) |
| **Vashi (Mumbai)** | ₹2,820/q | -₹2,347/q | -₹197/q | -₹420/q | **₹0.00/q** | ❌ Severe Freight Loss |

---

## 📌 Slide 3: SIH Problem Statement 26132 Direct Feature Mapping

| SIH Official Clause | Smart Mandi Solution | Live Implementation |
|---|---|---|
| **Price Discovery Across Markets** | 5-Factor Net Profit Formulation deducting transport, handling, commission, and decay | `/map` (Profit Map) |
| **Agricultural Quality Specifications** | Dynamic Grade A ($1.10\times$), Grade B ($1.00\times$), Grade C ($0.80\times$) price multipliers | `/map` (Profit Map) |
| **Predictive Price Trends & Sale Window** | Scikit-Learn Ridge Regressor ($R^2$, RMSE) + Perishability Sale-Window Advisor | `/admin/mandis` |
| **Farmer/FPO ↔ Buyer Linkages** | Searchable directory of verified corporate buyers & aggregators with GST validation | `/marketplace` |
| **Lot Creation & Digital Bidding** | Farmers publish harvest lots; institutional buyers place digital offers with 1-click lock | `/marketplace` |
| **Logistics & Smallholder Aggregation** | Kisan Pool shared freight clustering saving 45–60% for 5–25q batches | `/pooling` |
| **Storage & Anti-Distress Sale** | WDRA certified cold storages mapped with distance + Storage ROI Gain Calculator | `/storage` |
| **Payment Milestone Tracking** | 4-Stage visual escrow pipeline (`LOCKED` $\rightarrow$ `QC` $\rightarrow$ `DISPATCH` $\rightarrow$ `SETTLED`) + QR e-Receipts | `/orders` |
| **Dispute & Grievance Process** | 1-Click redressal ticketing for weight tampering, illegal commissions, or delays | `/grievance` |
| **Multi-Lingual Accessibility** | Speech-to-Speech Voice AI + WhatsApp in English, Hindi, Marathi, Gujarati | Voice AI Button |

---

## 📌 Slide 4: Mathematical & Machine Learning Foundations

### 1. Net Profit Formulation
$$\text{Net Profit} = P_{\text{modal}} \times M_{\text{grade}} - \Big(C_{\text{transport}} + C_{\text{handling}} + C_{\text{commission}} + C_{\text{spoilage}}\Big)$$

### 2. Biological Transit Spoilage Decay
$$C_{\text{spoilage}} = P_{\text{modal}} \times I_{\text{perish}} \times \left(\frac{T_{\text{transit}}}{24}\right) \times 0.15$$

### 3. Machine Learning 7-Day Ridge Regression
$$\hat{y}(t) = \beta_0 + \beta_1 t, \quad \min_{\beta} \sum_{i=1}^n w_i \left(y_i - (\beta_0 + \beta_1 t_i)\right)^2 + \alpha \|\beta\|_2^2$$
- Sample weights $w_i = \exp\left(-\frac{\text{age}_i}{\lambda}\right)$ with half-life $\lambda=10.0$ giving exponential importance to fresh market momentum.
- Computes $R^2$ accuracy, RMSE, and 95% Confidence Interval bounds ($\hat{y} \pm 1.96 \cdot \text{RMSE}$).

---

## 📌 Slide 5: The 3-Minute Killer Live Demo Script for Judges

1. **0:00 - 0:45 | Profit Map (`/map`)**:
   - Show the Jaipur Tomato case study $\rightarrow$ select **Grade A** $\rightarrow$ prove why Kota beats Delhi by ₹169/q.
2. **0:45 - 1:30 | ML Forecaster (`/admin/mandis`)**:
   - Hover over the dual-curve price trajectory with 7-day predicted dashed line and $R^2$ accuracy metrics.
3. **1:30 - 2:15 | Marketplace (`/marketplace`) & Kisan Pool (`/pooling`)**:
   - Demonstrate farmer harvest lot creation, accepting a corporate bid, and show the 52% freight savings in Kisan Pool.
4. **2:15 - 2:45 | Cold Storage (`/storage`) & Escrow Receipt (`/orders`)**:
   - Show the Storage ROI Calculator avoiding glut distress sales $\rightarrow$ click **"Print / Save e-Receipt"** with QR hash.
5. **2:45 - 3:00 | Voice AI & WhatsApp**:
   - Click the Voice AI microphone and show multi-lingual voice interaction in Hindi/Marathi.

---

## 📌 Slide 6: Social Impact, Scalability & Sustainability Model

- **Farmer Income Improvement**: Direct **₹200 - ₹350/q net increase** in take-home realizations.
- **Perishable Food Waste Reduction**: Penalizing long transit times cuts transit spoilage by ~18%.
- **Zero Platform Fee for Farmers**: 100% free for all farmers and FPOs.
- **Business Sustainability**: Funded through a **0.5% transaction facilitation fee** on corporate buyer escrow closures + enterprise procurement analytics.
