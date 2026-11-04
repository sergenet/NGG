import re
import json
import urllib.request
from pathlib import Path

# Configuration
HOST = "newgiftsandgadgets.com"
KEY = "4e07dedaa2c94c30ab2fa47f97a13c3d"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
INDEXNOW_API_URL = "https://api.indexnow.org/IndexNow"

BASE_DIR = Path(__file__).resolve().parent.parent
SITEMAP_PATH = BASE_DIR / "public" / "sitemap.xml"

def submit_urls():
    if not SITEMAP_PATH.exists():
        print(f"[INDEXNOW] Error: sitemap.xml not found at {SITEMAP_PATH}. Build the site first.")
        return False

    print(f"[INDEXNOW] Reading sitemap from {SITEMAP_PATH}...")
    sitemap_content = SITEMAP_PATH.read_text(encoding="utf-8")
    
    # Extract URLs from <loc> tags
    urls = re.findall(r"<loc>(.*?)</loc>", sitemap_content)
    
    if not urls:
        print("[INDEXNOW] Warning: No URLs found in sitemap.xml.")
        return False

    print(f"[INDEXNOW] Found {len(urls)} URLs to submit.")

    # Prepare payload
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls
    }

    data = json.dumps(payload, indent=2).encode("utf-8")
    
    print(f"[INDEXNOW] Submitting to {INDEXNOW_API_URL}...")
    
    try:
        request = urllib.request.Request(
            INDEXNOW_API_URL,
            data=data,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            method="POST"
        )
        
        with urllib.request.urlopen(request, timeout=15) as response:
            status = response.status
            response_body = response.read().decode("utf-8")
            
            if status in (200, 202):
                print(f"[INDEXNOW] SUCCESS: {len(urls)} URLs submitted successfully (status {status}).")
                return True
            else:
                print(f"[INDEXNOW] FAILED: Server returned status {status}. Response: {response_body}")
                return False
                
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e else ""
        print(f"[INDEXNOW] HTTP ERROR {e.code}: {e.reason}. Detail: {error_body}")
        return False
    except Exception as e:
        print(f"[INDEXNOW] ERROR: {e}")
        return False

if __name__ == "__main__":
    submit_urls()
