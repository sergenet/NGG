raise SystemExit("DISABLED: obsolete Amazon link repair retired during Stage 0 on 2026-08-25.")

import re
import urllib.request
import urllib.parse
import os
import json
import datetime
import subprocess
from pathlib import Path

# --- Configuration ---
SOURCE_FILES = [
    'engine/build.py',
    'engine/products_data.py'
]

BASE_DIR = Path('c:/newgiftsandgadgets.com')
LOG_FILE = BASE_DIR / 'link_repair.log'
AFFILIATE_TAG = 'sergenet05-20'

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'

def log(message):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f'[{timestamp}] {message}\n'
    print(entry.strip())
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(entry)

def check_asin_health(asin):
    """
    Checks if an ASIN returns a 404 or the 'Dog' page.
    """
    url = f'https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for common Amazon 'broken' indicators
            if 'Page Not Found' in html or 'find that page' in html or ('dog' in html.lower() and 'a-image-ext a-icon-ext' in html):
                return False, "404/Dog Page"
            # Look for "Currently unavailable"
            if 'currently unavailable' in html.lower() and 'alert-box' not in html.lower(): # Basic check
                 return False, "Currently Unavailable"
            return True, "OK"
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False, "404 Error"
        return True, f"HTTP {e.code}" # 503, etc. are usually temporary
    except Exception as e:
        return False, f"Error: {str(e)}"

def search_amazon_for_replacement(product_name):
    """
    Searches Amazon for a product name and picks the first valid ASIN.
    """
    query = urllib.parse.quote(product_name)
    url = f'https://www.amazon.com/s?k={query}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract ASINs from search results
            # Matches like data-asin="B0..."
            asin_matches = re.findall(r'data-asin="([A-Z0-9]{10})"', html)
            
            # Simple validation: try the first 3
            for potential_asin in asin_matches[:3]:
                is_healthy, _ = check_asin_health(potential_asin)
                if is_healthy:
                    return potential_asin
            return None
    except Exception as e:
        log(f"Search failed for '{product_name}': {e}")
        return None

def extract_product_name(content, asin, file_type='py'):
    """
    Attempts to find the product name associated with an ASIN.
    """
    if file_type == 'products_data.py' or '"name":' in content:
        # Strategy: Look for "name": "..." before the ASIN in a JSON/Dict like structure
        # Find the block containing the ASIN
        block_match = re.search(r'\{[^{}]*?"asin":\s*"' + asin + r'"[^{}]*?\}', content, re.DOTALL)
        if block_match:
            block = block_match.group(0)
            name_match = re.search(r'"name":\s*"([^"]+)"', block)
            if name_match:
                return name_match.group(1)
    
    # Strategy: Look for <h3> or <h4> before the link in build.py (HTML articles)
    # Find the link referencing this ASIN
    link_pos = content.find(asin)
    if link_pos != -1:
        prefix = content[max(0, link_pos-1000):link_pos]
        # Look for the last header tag
        headers = re.findall(r'<(h[1-4])[^>]*>(.*?)</\1>', prefix, re.DOTALL | re.IGNORECASE)
        if headers:
            # Clean up the name (remove emojis/numbers)
            name = headers[-1][1]
            name = re.sub(r'^[0-9.]+\s*', '', name) # Remove "1. "
            name = re.sub(r'[^\w\s-]', '', name).strip() # Remove emojis
            
            # Skip generic headers
            if name.lower() in ['pros', 'cons', 'verdict', 'features']:
                if len(headers) > 1:
                    name = headers[-2][1]
                    name = re.sub(r'^[0-9.]+\s*', '', name)
                    name = re.sub(r'[^\w\s-]', '', name).strip()
                else:
                    return None
            return name
            
    return None

def run_auto_repair():
    log("--- Starting Auto-Repair Cycle ---")
    any_repaired = False
    
    for relative_path in SOURCE_FILES:
        file_path = BASE_DIR / relative_path
        if not file_path.exists():
            log(f"Skipping missing file: {relative_path}")
            continue
            
        log(f"Scanning {relative_path}...")
        try:
            content = file_path.read_text(encoding='utf-8')
            # Find all ASINs
            asins = list(set(re.findall(r'amazon\.com/dp/([A-Z0-9]{10})', content)))
            asins += list(set(re.findall(r'"asin":\s*"([A-Z0-9]{10})"', content)))
            asins = list(set(asins))
            
            for asin in asins:
                # 1. Check health
                is_ok, reason = check_asin_health(asin)
                if not is_ok:
                    log(f"BROKEN: ASIN {asin} in {relative_path} (Reason: {reason})")
                    
                    # 2. Get product name
                    name = extract_product_name(content, asin, relative_path)
                    if not name:
                        log(f"ALERT: Could not extract name for {asin}. Skipping.")
                        continue
                        
                    log(f"Researching replacement for '{name}'...")
                    
                    # 3. Find replacement
                    new_asin = search_amazon_for_replacement(name)
                    if new_asin and new_asin != asin:
                        log(f"SUCCESS: Found replacement ASIN {new_asin} for {asin}")
                        # 4. Atomic Replacement
                        content = content.replace(asin, new_asin)
                        any_repaired = True
                    else:
                        log(f"FAILED: No suitable replacement found for '{name}'")
            
            if any_repaired:
                file_path.write_text(content, encoding='utf-8')
                log(f"Updated {relative_path} successfully.")
                
        except Exception as e:
            log(f"Error processing {relative_path}: {e}")

    if any_repaired:
        log("Changes detected in source files.")
    else:
        log("No repairs needed this cycle.")
    
    log("--- Repair Cycle Complete ---")
    return any_repaired

if __name__ == "__main__":
    run_auto_repair()
