#!/usr/bin/env python3
import json
import os
from collections import defaultdict

# Load product data
with open('src/lib/data/products.json', 'r') as f:
    products = json.load(f)

stats = {
    'total': len(products),
    'with_real_images': 0,
    'with_emoji_images': 0,
    'with_prices': 0,
    'amazon_affiliate_links': 0,
    'direct_links': 0,
    'missing_vendor_urls': 0,
    'categories': defaultdict(int),
    'emoji_products': [],
    'no_price_products': [],
    'no_affiliate_products': [],
}

# Iterate through products and collect metrics
for p in products:
    slug = p.get('slug', 'unknown')
    cat = p.get('tags', {}).get('category', 'Unknown')
    stats['categories'][cat] += 1
    
    # Image check
    images = p.get('images', [])
    has_real_image = False
    has_emoji = False
    if images:
        if any(img.startswith('http') for img in images):
            stats['with_real_images'] += 1
            has_real_image = True
        elif any(ord(c) > 127 for s in images for c in s):  # Emoji detection
            stats['with_emoji_images'] += 1
            has_emoji = True
            stats['emoji_products'].append(slug)
    
    # Vendor check
    vendors = p.get('vendors', [])
    has_price = False
    has_aff = False
    for v in vendors:
        price = v.get('price')
        url = v.get('url', '')
        if price and price > 0:
            has_price = True
        if 'amazon.com' in url and 'tag=' in url:
            has_aff = True
            stats['amazon_affiliate_links'] += 1
        elif url and url != '#':
            stats['direct_links'] += 1
        if url == '#' or not url:
            stats['missing_vendor_urls'] += 1
    
    if has_price:
        stats['with_prices'] += 1
    else:
        stats['no_price_products'].append(slug)
    
    if not has_aff:
        stats['no_affiliate_products'].append(slug)

# Print report
print("=" * 70)
print("  REVENUE READINESS AUDIT - NewGiftsAndGadgets")
print("=" * 70)
print(f"\nTOTAL PRODUCTS: {stats['total']}")
print(f"\nIMAGE STATUS:")
print(f"  ✅ Real external images:  {stats['with_real_images']:<3} ({100*stats['with_real_images']/stats['total']:.1f}%)")
print(f"  ❌ Emoji placeholders:    {stats['with_emoji_images']:<3} ({100*stats['with_emoji_images']/stats['total']:.1f}%)")
print(f"\nPRICING:")
print(f"  ✅ Products with prices:  {stats['with_prices']:<3} ({100*stats['with_prices']/stats['total']:.1f}%)")
print(f"  ❌ Missing prices:        {stats['total']-stats['with_prices']:<3}")
print(f"\nAFFILIATE LINKS:")
print(f"  ✅ Amazon affiliate URLs: {stats['amazon_affiliate_links']:<3} ({100*stats['amazon_affiliate_links']/stats['total']:.1f}%)")
print(f"  ⚠️  Direct/branded links:  {stats['direct_links']:<3}")
print(f"  ❌ Missing URLs (#):      {stats['missing_vendor_urls']:<3}")
print(f"\nCATEGORY BREAKDOWN:")
for cat in sorted(stats['categories'].keys()):
    count = stats['categories'][cat]
    print(f"  {cat:<20} {count:>3}")

# Identify blockers
print("\n" + "=" * 70)
print("  CRITICAL REVENUE BLOCKERS")
print("=" * 70)

if stats['with_emoji_images'] > 0:
    print(f"\n🚫 {stats['with_emoji_images']} products with emoji images (not real photos)")
    print("   Impact: Low conversion, poor credibility, breaks shopping UX")
    print("   Examples (first 5):", ', '.join(stats['emoji_products'][:5]))

missing_prices = stats['total'] - stats['with_prices']
if missing_prices > 0:
    print(f"\n🚫 {missing_prices} products missing prices")
    print("   Impact: Blocks price comparison and purchase intent")
    print("   Examples (first 5):", ', '.join(stats['no_price_products'][:5]))

no_affiliate = stats['total'] - stats['amazon_affiliate_links']
if no_affiliate > 0:
    print(f"\n🚫 {no_affiliate} products lack Amazon affiliate links")
    print("   Impact: Lost referral revenue (estimated $0 from ~{} non-affiliate sales)".format(no_affiliate))
    print("   Examples (first 5):", ', '.join(stats['no_affiliate_products'][:5]))

print("\n" + "=" * 70)
print("  REVENUE GENERATION ROADMAP")
print("=" * 70)
potential_impact = stats['with_emoji_images'] + missing_prices + (stats['total'] - stats['amazon_affiliate_links'])
print(f"\nCombined blockers affect: {potential_impact} product-issues")
print(f"Estimated revenue impact: High (credibility + referral loss)\n")
print("Priority order:")
print("  1. Replace emoji images with real product photos (highest UX/conversion impact)")
print("  2. Ensure all products have valid prices from vendors")
print("  3. Affiliate link coverage on remaining non-tagged vendors")

print("\n" + "=" * 70)
