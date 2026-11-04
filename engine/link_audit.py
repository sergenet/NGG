import json
import requests
import re
import os

# Configuration
PRODUCTS_JSON = 'src/lib/data/products.json'
AFFILIATE_TAG = 'sergenet05-20'
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def check_link(url):
    if url == "#":
        return True, "Placeholder"
    
    try:
        response = requests.head(url, headers={"User-Agent": USER_AGENT}, allow_redirects=True, timeout=5)
        if response.status_code < 400:
            return True, f"OK ({response.status_code})"
        else:
            # Try a GET if HEAD fails (some servers block HEAD)
            response = requests.get(url, headers={"User-Agent": USER_AGENT}, allow_redirects=True, timeout=5)
            if response.status_code < 400:
                return True, f"OK (GET {response.status_code})"
            return False, f"Error {response.status_code}"
    except Exception as e:
        return False, f"Exception: {str(e)}"

def audit_links():
    if not os.path.exists(PRODUCTS_JSON):
        print(f"Error: {PRODUCTS_JSON} not found.")
        return

    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    results = []
    broken_count = 0
    missing_tag_count = 0

    print(f"Auditing links for {len(products)} products...")

    for product in products:
        title = product.get('title', 'Unknown')
        for vendor in product.get('vendors', []):
            url = vendor.get('url', '')
            name = vendor.get('name', 'Unknown Vendor')

            # 1. Check for Amazon Affiliate Tag
            is_amazon = 'amazon.com' in url.lower()
            has_tag = AFFILIATE_TAG in url if is_amazon else True
            
            if is_amazon and not has_tag:
                print(f"[MISSING TAG] {title} - {name}")
                missing_tag_count += 1

            # 2. Check Link Health
            is_valid, status = check_link(url)
            if not is_valid:
                print(f"[BROKEN] {title} - {name} ({status})")
                broken_count += 1
            
            results.append({
                "product": title,
                "vendor": name,
                "url": url,
                "status": status,
                "is_valid": is_valid,
                "has_tag": has_tag
            })

    print("\n--- AUDIT SUMMARY ---")
    print(f"Total Links Checked: {len(results)}")
    print(f"Broken Links: {broken_count}")
    print(f"Amazon Links Missing Tag: {missing_tag_count}")
    
    # Save results to a report
    with open('engine/link_audit_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print("Full report saved to engine/link_audit_report.json")

if __name__ == "__main__":
    audit_links()
