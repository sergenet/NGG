raise SystemExit("DISABLED: obsolete Amazon affiliate updater retired during Stage 0 on 2026-08-25.")

import re
import urllib.request
import urllib.parse
import urllib.error
import time
import subprocess
import datetime
import ftplib
import os
import random
from pathlib import Path

# --- CORE PATHS ---
ENGINE_DIR = Path(r"c:\newgiftsandgadgets.com\engine")
DATA_PATH = ENGINE_DIR / "products_data.py"
BUILD_SCRIPT = ENGINE_DIR / "build.py"
LOG_PATH = ENGINE_DIR / "asin_updater.log"

# --- CONFIGURATION ---
AFFILIATE_TAG = "sergenet05-20"
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

# --- FTP DEPLOYMENT CONFIGURATION ---
FTP_HOST = "newgiftsandgadgets.com"
FTP_USER = os.environ["NGG_FTP_USER"]
FTP_PASS = os.environ["NGG_FTP_PASSWORD"]
FTP_REMOTE_DIR = "."  
ENABLE_AUTO_FTP = True 

def log(msg):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def check_asin_health(asin):
    """
    Returns (is_healthy, reason)
    """
    url = f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"
    headers = {'User-Agent': random.choice(USER_AGENTS)}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # 1. Detection of "Page Not Found" / Dog Pages
            dog_indicators = [
                "Page Not Found",
                "Sorry! We couldn't find that page",
                'class="a-image-ext a-icon-ext dog"',
                'id="d"', # Amazon 404 container
                "/images/G/01/error/"
            ]
            
            for indicator in dog_indicators:
                if indicator in html:
                    return False, "404/Dog Page"
            
            # 2. Availability Check
            if 'currently unavailable' in html.lower() and 'alert-box' not in html.lower():
                return False, "Currently Unavailable"
                
            return True, "OK"
            
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False, "404 Error"
        if e.code == 503:
            return True, "Rate Limited (Skipping)"
        return True, f"HTTP {e.code}"
    except Exception as e:
        return True, f"Network Error: {str(e)}"

def search_amazon_for_replacement(product_name):
    """
    Finds a modern replacement ASIN using search results.
    """
    # Use DuckDuckGo as a proxy to find the latest Amazon links
    query = urllib.parse.quote(f"site:amazon.com/dp/ {product_name}")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    headers = {'User-Agent': random.choice(USER_AGENTS)}
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            
            # Extract ASINs from result links
            asins = list(set(re.findall(r'amazon\.com/dp/([A-Z0-9]{10})', html)))
            
            # Simple validation: return the first one that is healthy
            for candidate in asins[:3]:
                is_ok, _ = check_asin_health(candidate)
                if is_ok:
                    return candidate
            return None
    except Exception as e:
        log(f"Search failed for '{product_name}': {e}")
        return None

def upload_to_ftp(local_folder):
    log("Connecting to Namecheap FTP server...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        
        if FTP_REMOTE_DIR and FTP_REMOTE_DIR != ".":
            try:
                ftp.cwd(FTP_REMOTE_DIR)
            except ftplib.error_perm:
                ftp.mkd(FTP_REMOTE_DIR)
                ftp.cwd(FTP_REMOTE_DIR)
        
        base_remote_dir = ftp.pwd()
        log(f"Connected! Syncing files to {base_remote_dir} ...")
        
        for root, dirs, files in os.walk(local_folder):
            for file_name in files:
                local_file_path = os.path.join(root, file_name)
                relative_path = os.path.relpath(local_file_path, local_folder).replace(chr(92), '/')
                remote_dir = os.path.dirname(relative_path)
                
                ftp.cwd(base_remote_dir)
                if remote_dir:
                    for folder in remote_dir.split('/'):
                        try:
                            ftp.cwd(folder)
                        except ftplib.error_perm:
                            try:
                                ftp.mkd(folder)
                                ftp.cwd(folder)
                            except ftplib.error_perm:
                                pass
                
                with open(local_file_path, 'rb') as file_data:
                    ftp.storbinary(f'STOR {os.path.basename(relative_path)}', file_data)
                    
        ftp.quit()
        log("FTP Deployment 100% Complete!")
    except Exception as e:
        log(f"FTP Upload Failed! Error: {e}")

def main():
    log("--- Starting Autonomous Link Repair vs 2.1 ---")
    
    if not DATA_PATH.exists():
        log("Error: products_data.py not found.")
        return

    content = DATA_PATH.read_text('utf-8')
    # Find product blocks
    product_blocks = re.findall(r'(\{\s*"name":\s*"([^"]+)",\s*"asin":\s*"([A-Z0-9]{10})")', content)
    
    log(f"Verifying {len(product_blocks)} products...")
    replacements = 0
    
    for full_match, name, asin in product_blocks:
        # Delay to avoid Amazon bot detection
        time.sleep(random.uniform(1.5, 3.5))
        
        is_ok, reason = check_asin_health(asin)
        if not is_ok:
            log(f"BROKEN DETECTED: {name} ({asin}) - Reason: {reason}")
            new_asin = search_amazon_for_replacement(name)
            
            if new_asin and new_asin != asin:
                log(f"REPLACEMENT FOUND: {new_asin}. Updating database...")
                new_match = full_match.replace(asin, new_asin)
                content = content.replace(full_match, new_match, 1)
                replacements += 1
            else:
                log(f"REPLACEMENT FAILED: Still searching for '{name}'.")
    
    if replacements > 0:
        DATA_PATH.write_text(content, 'utf-8')
        log(f"Updated {replacements} ASINs. Triggering rebuild...")
        try:
            subprocess.run(["python", str(BUILD_SCRIPT)], check=True, cwd=str(ENGINE_DIR.parent))
            log("Site successfully updated locally.")
        except Exception as e:
            log(f"System Rebuild Failed: {e}")
    else:
        log("Link integrity verified. All 2026 products are active.")

    if ENABLE_AUTO_FTP:
        upload_to_ftp(str(ENGINE_DIR.parent / "public"))
        log("Site successfully deployed live.")

        
    log("Routine maintenance finished.\n")

if __name__ == "__main__":
    main()
