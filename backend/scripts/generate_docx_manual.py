import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

def create_manual():
    doc = docx.Document()

    # Set standard margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # Color Palette
    COLOR_PRIMARY = RGBColor(16, 185, 129)   # Emerald
    COLOR_DARK = RGBColor(15, 23, 42)        # Slate 900
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500
    COLOR_TEXT = RGBColor(30, 41, 59)        # Slate 800

    # Title Header
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("🌾 SMART MANDI SELECTION PLATFORM")
    title_run.font.name = 'Calibri'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Official End-to-End Operating Guide: Problem, Solution & User Manual\n")
    sub_run.font.name = 'Calibri'
    sub_run.font.size = Pt(13)
    sub_run.font.italic = True
    sub_run.font.color.rgb = COLOR_MUTED

    # Meta Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Creator & Lead Architect:", "Devansh Rahatal"),
        ("Live Web Application URL:", "https://smart-mandi-selection.vercel.app/"),
        ("API Documentation (Swagger):", "https://smart-mandi-selection.onrender.com/docs"),
        ("Core Technology Stack:", "React 18 (Vite) + FastAPI + Leaflet GIS + Twilio WhatsApp Bot"),
        ("Documentation Version:", "Version 1.0 (Production Release)"),
    ]
    for i, (label, val) in enumerate(meta_data):
        row = meta_table.rows[i]
        c1, c2 = row.cells[0], row.cells[1]
        c1.width = Inches(2.3)
        c2.width = Inches(4.5)
        set_cell_background(c1, "F1F5F9")
        set_cell_background(c2, "F8FAFC")
        set_cell_margins(c1, 80, 80, 120, 120)
        set_cell_margins(c2, 80, 80, 120, 120)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(label)
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_DARK

        p2 = c2.paragraphs[0]
        r2 = p2.add_run(val)
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_TEXT

    doc.add_paragraph()

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = COLOR_DARK
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.bold = True
            r_pre.font.size = Pt(10)
            r_pre.font.color.rgb = COLOR_DARK
        r = p.add_run(text)
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_TEXT
        return p

    # --- 1. THE PROBLEM ---
    add_heading_1("1. The Problem: 'The Price Illusion' in Indian Agriculture")
    add_p("Over 86% of Indian farmers are smallholders who operate on slim profit margins. When choosing where to sell their crops, farmers rely on traditional government portals or word-of-mouth price sheets that display only the Gross Modal Price (the advertised auction price at a mandi).")
    
    add_heading_2("1.1 The Anatomy of the Price Trap")
    add_p("1. Advertised Price Deception: A price of ₹2,900/quintal in a distant metro mandi appears far better than ₹2,450/quintal in a local mandi. In reality, travelling further drains the farmer's wallet.")
    add_p("2. Unaccounted Transport Freight: Commercial vehicle freight (Tata Ace / Eicher) costs ₹12–₹18/km, which quickly consumes gross revenue over long distances.")
    add_p("3. Hidden Mandi Commissions & Taxes: APMC market fees and middleman (arhtiya) commissions range from 1.5% to 8% depending on the state.")
    add_p("4. Handling & Labor Charges: Unregulated loading, unloading, weighing, and bag-stitching levies per quintal.")
    add_p("5. Perishable Produce Spoilage: Crops like tomatoes, onions, and bananas suffer transit degradation under heat and rough roads, causing direct weight loss and distress price cuts upon arrival.")

    add_heading_2("1.2 Real Case Study: Jaipur Tomato Farmer (20 Quintals)")
    add_p("• Kota Krishi Mandi (Nearby): Advertised ₹2,450/q -> Deductions -₹713/q -> Real Take-Home: ₹1,737.16/q (🥇 BEST PROFIT: +₹3,382 total profit)")
    add_p("• Azadpur, Delhi (Distant Metro): Advertised ₹2,901/q -> Deductions -₹1,334/q -> Real Take-Home: ₹1,568.06/q (🥈 Trap: ₹169/q LOWER profit despite higher price)")
    add_p("• Vashi, Mumbai (Far Metro): Advertised ₹2,820/q -> Deductions -₹3,054/q -> Real Take-Home: ₹0.00/q (❌ Severe Net Financial Loss)")

    # --- 2. THE SOLUTION ---
    add_heading_1("2. The Solution Engineered by Devansh Rahatal")
    add_p("To eliminate this market asymmetry, Devansh Rahatal engineered the Smart Mandi Selection & Logistics Optimization Platform — an end-to-end intelligent decision engine that calculates real take-home net profit and optimizes freight aggregation.")

    add_heading_2("2.1 Core Architectural Pillars")
    add_p("1. 5-Factor Net Profit Mathematical Formulation:")
    add_p("   Net Profit = Modal Price - (Transport Cost + Handling + Mandi Commission + Transit Spoilage)")
    add_p("   Where Transit Spoilage = Modal Price × Perishability Index × (Transit Hours / 24) × 0.15 (Tomato: 0.85, Banana: 0.70, Onion: 0.25, Potato: 0.20, Wheat: 0.05).")
    add_p("2. Interactive Leaflet GIS Route Mapping: Color-coded visual route lines (Green = #1 Optimal Net Profit, Teal = Moderate, Amber = Suboptimal) allowing farmers to immediately see why proximity and net profit trump raw prices.")
    add_p("3. Kisan Pool Shared Freight Optimizer: Solves small-batch transport penalties by algorithmically pooling neighboring farmers' harvest into larger freight vehicles (Tata Ace → Eicher 14ft → 19ft Heavy Truck → 16-Ton Taurus), reducing individual transport costs by 35% to 55%.")
    add_p("4. Zero-App WhatsApp Voice & Text AI Assistant: Multi-lingual conversational bot supporting regional voice notes in Hindi, Marathi, Gujarati, and English with instant synthesized voice note audio replies and GPS location pin support.")
    add_p("5. Live Admin Analytics & Dynamic Cost Parameter Controls: Real-time query stream, price trend curves, and live fee configuration for APMC administrators.")

    # --- 3. STEP-BY-STEP USER GUIDE ---
    add_heading_1("3. Comprehensive Step-by-Step User Manual")

    add_heading_2("3.1 Web Application Walkthrough (https://smart-mandi-selection.vercel.app/)")
    add_p("• Public Landing Page: View the live comparison scenario, switch languages (English, Hindi, Marathi, Gujarati), connect to WhatsApp, or launch the In-Browser Voice Simulator.")
    add_p("• Interactive Profit Map (/map): Select your Origin Hub (Vadodara, Surat, Rajkot, Jaipur, Pune, Nashik, etc.), pick your Crop, and set harvest quantity. Read color-coded route lines and click mandi pins for net profit breakdowns.")
    add_p("• Kisan Pool Shared Logistics (/pooling): Adjust solo vs pooled quantity and distance. Discover matched commercial trucks and instant savings per quintal.")
    add_p("• Admin Intelligence Dashboard (/admin/dashboard): Sign in with admin / admin123. Monitor mandis tracked, top crops volume, live WhatsApp incoming queries, and export reports as CSV.")
    add_p("• Price Trends & Cost Configuration (/admin/mandis, /admin/costs): View 30-day historical modal price curves and adjust mandi commission %, loading/unloading rates, and transport coefficients in real time.")

    add_heading_2("3.2 WhatsApp Voice & Text AI Assistant (Step-by-Step)")
    add_p("1. Save & Open Gateway: Message the Twilio WhatsApp Gateway at +1 (415) 523-8886.")
    add_p("2. Activate Session: Send the one-time code join unusual-sea (Direct Link: https://wa.me/14155238886?text=join%20unusual-sea).")
    add_p("3. Natural Text Queries: Type 'Tomato 20q from Jaipur', 'कांदा 15 क्विंटल नाशिक', or 'Potato 30q from Agra'.")
    add_p("4. Voice Notes (Speech-to-Speech): Hold the mic button and speak in Hindi, Marathi, or Gujarati. The bot replies with a text summary and a synthesized regional Voice Note MP3!")
    add_p("5. GPS Location Pin: Send your current WhatsApp location pin 📍 for automated distance and profit calculation.")

    # --- 4. TECHNICAL SETUP ---
    add_heading_1("4. Technical Setup & Developer Execution")
    add_p("• Backend: Open terminal in backend/ -> Run: .\\.venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --port 8000 (API Docs: http://localhost:8000/docs)")
    add_p("• Frontend: Open terminal in frontend/ -> Run: npm run dev (Web App: http://localhost:5173)")

    # Save
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Smart_Mandi_Platform_User_Manual.docx"))
    doc.save(output_path)
    print(f"Successfully generated updated User Manual at: {output_path}")

if __name__ == "__main__":
    create_manual()
