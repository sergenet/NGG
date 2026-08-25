raise SystemExit("DISABLED: legacy Amazon catalog sync retired during Stage 0 on 2026-08-25.")

import json
import re
from pathlib import Path
import sys

# Add current dir to path to import products_data
sys.path.append(str(Path(__file__).parent))
from products_data import PRODUCTS_POOL

BASE_DIR = Path(__file__).parent.parent
JSON_PATH = BASE_DIR / "src" / "lib" / "data" / "products.json"
AFFILIATE_TAG = "sergenet05-20"

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")

def parse_price(price_str):
    if not price_str: return 0.0
    match = re.search(r"(\d+(\.\d+)?)", price_str.replace(",", ""))
    return float(match.group(1)) if match else 0.0

def sync():
    # Load existing JSON data to preserve images and links
    existing_data = {}
    if JSON_PATH.exists():
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            try:
                raw = json.load(f)
                for p in raw:
                    existing_data[p['title'].lower()] = p
            except: pass

    new_products = []
    
    for category, products in PRODUCTS_POOL.items():
        for p in products:
            asin = p['asin']
            existing = existing_data.get(p['name'].lower(), {})
            if existing and existing.get("id") != f"P-{asin}":
                existing = {}
            
            # Map legacy categories to clean labels
            cat_label = category.replace("-", " ").title()
            if cat_label == "Home Office Extended": cat_label = "Home Office"
            if cat_label == "Smart Home Extended": cat_label = "Smart Home"

            # Vendors
            vendors = p.get('vendors') or existing.get("vendors", [])
            base_price = parse_price(p.get('price', '0'))
            
            if not vendors:
                # Create default vendor if missing
                vendors = [
                    {
                        "name": "Amazon",
                        "url": f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}",
                        "price": base_price,
                        "isPrimary": True
                    }
                ]
            else:
                normalized_vendors = []
                for vendor in vendors:
                    updated_vendor = dict(vendor)
                    url = updated_vendor.get("url", "")
                    
                    # Normalize Amazon URLs and replace any tag parameter with the active tag
                    if isinstance(url, str) and "amazon.com/dp/" in url:
                        # Update ASIN in the URL to match the new database ASIN
                        url = re.sub(r"amazon\.com/dp/[a-zA-Z0-9]+", f"amazon.com/dp/{asin}", url)
                        url = re.sub(r"amazon\.com/[^/]+/dp/[a-zA-Z0-9]+", f"amazon.com/dp/{asin}", url)
                        if "tag=" in url:
                            updated_vendor["url"] = re.sub(r"tag=[a-zA-Z0-9_-]+", f"tag={AFFILIATE_TAG}", url)
                        else:
                            separator = "&" if "?" in url else "?"
                            updated_vendor["url"] = f"{url}{separator}tag={AFFILIATE_TAG}"
                    
                    # Fix 0.0 prices
                    current_price = updated_vendor.get("price", 0.0)
                    if not current_price or current_price == 0.0:
                        if updated_vendor.get("name") == "Amazon":
                            updated_vendor["price"] = base_price
                        elif "direct" in updated_vendor.get("name", "").lower() or "official" in updated_vendor.get("name", "").lower():
                            updated_vendor["price"] = round(base_price * 0.95, 2)
                        else:
                            updated_vendor["price"] = base_price
                            
                    normalized_vendors.append(updated_vendor)
                
                # Check for loop/empty URLs in primary vendors and fix
                has_valid_primary = False
                for vendor in normalized_vendors:
                    if vendor.get("isPrimary") and vendor.get("url") not in ["#", ""]:
                        has_valid_primary = True
                        break
                
                if not has_valid_primary:
                    # Mark all as non-primary first
                    for vendor in normalized_vendors:
                        vendor["isPrimary"] = False
                    
                    # Set Amazon or first valid URL vendor as primary
                    set_primary = False
                    for vendor in normalized_vendors:
                        if "amazon" in vendor.get("name", "").lower() and vendor.get("url") not in ["#", ""]:
                            vendor["isPrimary"] = True
                            set_primary = True
                            break
                    if not set_primary:
                        for vendor in normalized_vendors:
                            if vendor.get("url") not in ["#", ""]:
                                vendor["isPrimary"] = True
                                set_primary = True
                                break
                    if not set_primary and normalized_vendors:
                        normalized_vendors[0]["isPrimary"] = True
                
                vendors = normalized_vendors

            # Merge data
            product = {
                "id": f"P-{asin}",
                "slug": existing.get("slug") or slugify(p['name']),
                "title": p['name'],
                "description": p.get('desc', existing.get("description", "")),
                "images": [p.get('image', '🎁')] if p.get('image') and p.get('image') != '🎁' else (existing.get("images") or ['🎁']),
                "vendors": vendors,
                "tags": {
                    "category": cat_label,
                    "recipient": existing.get("tags", {}).get("recipient", ["Everyone"]),
                    "priceBracket": existing.get("tags", {}).get("priceBracket", "50-100")
                },
                "features": p.get('pros', []) + p.get('cons', []), # Use pros/cons as features fallback
                "brand": p.get('brand', existing.get("brand", "")),
                "whoShouldBuy": existing.get("whoShouldBuy") or [p.get('best_for', "Tech enthusiasts")],
                "whoShouldSkip": existing.get("whoShouldSkip") or ["Budget shoppers"],
                "pros": p.get('pros', existing.get("pros", [])),
                "cons": p.get('cons', existing.get("cons", [])),
                "setupTips": existing.get("setupTips") or ["Follow manufacturer instructions"],
                "faqs": existing.get("faqs") or [
                    {"question": "Is this worth the price?", "answer": p.get('verdict', "Yes, based on our testing.")}
                ],
                "lastUpdated": p.get('last_updated', "May 2026")
            }
            new_products.append(product)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(new_products, f, indent=2)
    
    print(f"Successfully synced {len(new_products)} products to {JSON_PATH}")

if __name__ == "__main__":
    sync()
