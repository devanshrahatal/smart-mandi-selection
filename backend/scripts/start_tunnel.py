"""
Helper script to start a secure HTTPS tunnel pointing to port 8000.
Handles SSL certificate verification and provides auto-fallback to localtunnel.
"""

import os
import sys
import time
import ssl
import subprocess

# Bypass Windows python urllib SSL certificate verification for ngrok binary download
ssl._create_default_https_context = ssl._create_unverified_context


def start_ngrok():
    from pyngrok import ngrok, conf

    print("=" * 60)
    print("  Starting Secure HTTPS Tunnel for Twilio WhatsApp Webhook  ")
    print("=" * 60)

    try:
        # Open an HTTP tunnel on port 8000
        tunnel = ngrok.connect(8000, "http")
        public_url = tunnel.public_url

        if public_url.startswith("http://"):
            public_url = public_url.replace("http://", "https://")

        webhook_url = f"{public_url}/api/whatsapp/webhook"

        print(f"\n[OK] Tunnel successfully created via Ngrok!")
        print(f"     Public URL:  {public_url}")
        print(f"\n👉 Paste this EXACT Webhook URL in Twilio Console:")
        print(f"     {webhook_url}\n")
        print("Keep this terminal window open while testing in WhatsApp.")
        print("Press Ctrl+C to stop the tunnel.\n")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping tunnel...")
        ngrok.kill()
    except Exception as e:
        print(f"\n[INFO] Ngrok not ready ({e}). Switching to Localtunnel...\n")
        start_localtunnel()


def start_localtunnel():
    print("=" * 60)
    print("  Starting Localtunnel on Port 8000...                      ")
    print("=" * 60)
    cmd = "npx localtunnel --port 8000"
    try:
        proc = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        for line in iter(proc.stdout.readline, ""):
            if "your url is:" in line.lower():
                url = line.strip().split("your url is:")[-1].strip()
                if url.startswith("http://"):
                    url = url.replace("http://", "https://")
                print(f"\n[OK] Localtunnel successfully created!")
                print(f"     Public URL:  {url}")
                print(f"\n👉 Paste this EXACT Webhook URL in Twilio Console:")
                print(f"     {url}/api/whatsapp/webhook\n")
                print("Keep this terminal window open while testing in WhatsApp.")
                print("Press Ctrl+C to stop the tunnel.\n")
            elif line.strip():
                print(line.strip())

        proc.wait()
    except KeyboardInterrupt:
        print("\nStopping Localtunnel...")
    except Exception as err:
        print(f"[ERROR] Failed to start tunnel: {err}")


if __name__ == "__main__":
    start_ngrok()
