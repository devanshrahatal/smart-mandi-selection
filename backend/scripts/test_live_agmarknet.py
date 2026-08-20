"""
Quick verification script for Agmarknet API (data.gov.in).
"""

import httpx

URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"

params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": 5,
}

print("🌾 Connecting to data.gov.in Agmarknet API...")
with httpx.Client(timeout=30.0, follow_redirects=True) as client:
    res = client.get(URL, params=params)
    print("✅ HTTP Status:", res.status_code)
    data = res.json()
    print("📊 API Title:", data.get("title"))
    print("📈 Total Available National Records:", data.get("total"))
    records = data.get("records", [])
    print(f"\n📦 Showing {len(records)} Live Mandi Records:\n")
    for i, r in enumerate(records, 1):
        state = r.get("state")
        dist = r.get("district")
        market = r.get("market")
        comm = r.get("commodity")
        variety = r.get("variety")
        min_p = r.get("min_price")
        max_p = r.get("max_price")
        modal = r.get("modal_price")
        arr = r.get("arrival_date")
        print(f"#{i} [{state} · {dist} · {market}]")
        print(f"   Crop: {comm} ({variety})")
        print(f"   Modal Price: Rs {modal}/quintal (Range: Rs {min_p} - Rs {max_p})")
        print(f"   Arrival Date: {arr}\n")
