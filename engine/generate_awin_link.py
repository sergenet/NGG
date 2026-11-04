#!/usr/bin/env python3
"""
Awin Link Generator Utility for NewGiftsAndGadgets.com
Generates monetized deep-links using Serge's affiliate ID (2913559).
Can automatically match known merchants or scan products_data.py to update URLs.
"""
import sys
import os
import re
import argparse
import urllib.parse
from pathlib import Path

DEFAULT_AFFILIATE_ID = "2913559"

# Map of known merchant domains to Awin merchant IDs (awinmid)
MERCHANT_MAP = {
    "inspireuplift.com": "16561",
    "inspireupl.com": "16561",
    "theshadowgps.com": "122922",
    "traverseon.com": "124816",
    "nexbie.com": "125856",
    "postermasterstudio.com": "121870"
}

def clean_url(url):
    """Clean and strip whitespaces and query parameters if needed."""
    return url.strip()

def get_merchant_id_from_url(url):
    """Extract known merchant ID based on URL domain."""
    parsed = urllib.parse.urlparse(url)
    netloc = parsed.netloc.lower()
    
    # Strip www. if present
    domain = netloc.replace("www.", "")
    
    for key, mid in MERCHANT_MAP.items():
        if key in domain:
            return mid
    return None

def generate_awin_url(destination_url, merchant_id=None, affiliate_id=DEFAULT_AFFILIATE_ID):
    """
    Wraps a destination URL in Awin tracking format.
    https://www.awin1.com/cread.php?awinmid={mid}&awinaffid={affid}&clickref=&ued={encoded_url}
    """
    destination_url = clean_url(destination_url)
    
    if not merchant_id:
        merchant_id = get_merchant_id_from_url(destination_url)
        if not merchant_id:
            raise ValueError(
                f"Could not auto-detect merchant ID for domain. "
                f"Please specify --mid explicitly."
            )
            
    encoded_ued = urllib.parse.quote(destination_url, safe='')
    awin_url = f"https://www.awin1.com/cread.php?awinmid={merchant_id}&awinaffid={affiliate_id}&clickref=&ued={encoded_ued}"
    return awin_url

def scan_and_update_database():
    """
    Scans products_data.py for direct links from known Awin merchants and automatically wraps them.
    """
    data_file = Path(r"c:\newgiftsandgadgets.com\engine\products_data.py")
    if not data_file.exists():
        print(f"Error: Database file not found at {data_file}")
        return
        
    print(f"Scanning {data_file} for unmonetized direct links to known Awin merchants...")
    content = data_file.read_text(encoding='utf-8')
    
    # Simple regex to find "url": "http..."
    url_pattern = r'("url":\s*")((https?://[^"]+))(")'
    
    def replacer(match):
        full_line = match.group(0)
        prefix = match.group(1) # "url": "
        url = match.group(2)    # http...
        suffix = match.group(4) # "
        
        # Skip if already an Awin link
        if "awin1.com" in url:
            return full_line
            
        try:
            # Try to get merchant ID
            mid = get_merchant_id_from_url(url)
            if mid:
                awin_url = generate_awin_url(url, merchant_id=mid)
                print(f"  [AUTO-WRAP] Wrapping link: {url} -> {awin_url}")
                return f'{prefix}{awin_url}{suffix}'
        except Exception as e:
            pass
            
        return full_line

    updated_content = re.sub(url_pattern, replacer, content)
    
    if updated_content != content:
        data_file.write_text(updated_content, encoding='utf-8')
        print("Successfully updated unmonetized links in products_data.py.")
    else:
        print("No unmonetized direct links for known merchants were found.")

def main():
    parser = argparse.ArgumentParser(description="Awin Link Generator Utility for NewGiftsAndGadgets")
    parser.add_argument("url", nargs="?", help="The destination product URL to monetize.")
    parser.add_argument("--mid", help="Specify the Awin Merchant ID manually (e.g. 16561 for Inspire Uplift).")
    parser.add_argument("--affid", default=DEFAULT_AFFILIATE_ID, help="Specify Awin Publisher/Affiliate ID (default: 2913559).")
    parser.add_argument("--scan", action="store_true", help="Scan and wrap unmonetized direct links in products_data.py.")
    
    args = parser.parse_args()
    
    if args.scan:
        scan_and_update_database()
        return

    if not args.url:
        parser.print_help()
        sys.exit(1)
        
    try:
        monetized_url = generate_awin_url(args.url, merchant_id=args.mid, affiliate_id=args.affid)
        print("\n--- MONETIZED AWIN URL ---")
        print(monetized_url)
        print("--------------------------\n")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
