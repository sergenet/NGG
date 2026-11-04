#!/usr/bin/env python3
"""
fix-vendor-links.py — point every NGG vendor link at the product it describes.

Context
-------
23 of the 52 vendor links in src/lib/data/products.json resolved to a merchant
homepage or a /collections/ index rather than a product page, so a reader who
clicked "Check price" landed on a category grid and had to go hunting. That is
both a worse experience and a worse conversion path than no link at all.

Two kinds of problem turned up, and they need different fixes:

  SET    The merchant really does sell this item — we just never deep-linked it.
         Fix: resolve the product URL on the merchant's own store and swap it
         into the Awin `ued` parameter, keeping awinmid/awinaffid intact so
         attribution still works.

  REMOVE The merchant does not stock the item at all. These links cannot be
         fixed, because no URL on that store shows the product. Examples:
           - "Herman Miller Aeron Chair" pointed at sunaofe.com, whose entire
             catalogue (15 products) is Sunaofe-branded desks, chairs and arms.
           - "Nomatic Travel Pack" pointed at moosehill.com, which is now a
             single-page "Moose Hill Bitworks" contact page, not a shop.
           - "Amazon Echo Show 8" pointed at everblog.com (calendar maker).
         Fix: blank the URL. The product template already treats an inactive
         retailer URL as "links being updated" and hides the buy button, so the
         page degrades cleanly instead of sending readers to a dead end.

Every URL below was verified against the merchant's live catalogue (Shopify
products.json / search suggest / product sitemap) on 2026-11-04.

Usage:
  python tools/fix-vendor-links.py --dry-run
  python tools/fix-vendor-links.py
"""
import json
import re
import sys
import shutil
from datetime import date
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "src" / "lib" / "data" / "products.json"

# product slug -> (vendor name prefix, new destination or None to remove, why)
FIXES = [
    ("sunaofe-lunar-dual-motor-standing-desk", "Sunaofe Official", "https://www.sunaofe.com/products/standing-desk-lunar", "was /collections/all; Lunar desk is Sunaofe's own deep-linked product page"),
    ("kingbull-hunter-2s-all-terrain-fat-tire-ebike", "Kingbull Official", "https://www.kingbullbike.com/products/kingbull-hunter-2-0s-mountain-fat-tire-electric-bike", "was the shop homepage; exact model page exists"),
    ("brkox-millennium-falcon-custom-led-lighting-kit", "BRKOX Official", "https://brkox.com/products/lego%C2%AE-star-wars%E2%84%A2-ultimate-millennium-falcon-75192-led-light-kit", "was the shop homepage; the Falcon 75192 kit is in the catalogue"),
    ("neakasa-p1-pro-pet-grooming-vacuum", "Neakasa (Direct)", "https://neakasa.com/products/neakasa-p1-pro-pet-grooming-vacuum", "was the shop homepage; P1 Pro product page exists"),
    ("everblog-homecal-smart-family-calendar",        "Everblog Official", "https://everblog.com/products/21-5-inch-everblog-calendar", "was the shop homepage; the 21.5in HomeCal is Everblog's own product page"),
    ("desktop-jellyfish-mood-lamp", "Giftlab Official", "https://www.giftlab.com/products/art-resin-lamp-night-light-humpback-whale-and-jellyfish-home-decor-gift-unique-birthday-gift-ideas", "was /collections/all; the jellyfish art-resin lamp is the matching item"),
    ("loveisarose-24k-gold-dipped-preserved-rose", "LoveIsARose Official", "https://www.loveisarose.com/24k-gold-roses.html", "was the shop homepage; LoveIsARose publishes 24k gold roses as a page, not per-SKU"),
    ("vari-electric-standing-desk-48x30", "Sunaofe Official", None, "Sunaofe sells only its own desks; Vari desk is not stocked"),
    ("vivo-dual-monitor-desk-mount", "Sunaofe Accessories Official", None, "VIVO brand; Sunaofe only stocks Sunaofe CTS arms"),
    ("ergotron-lx-single-monitor-arm", "Sunaofe Ergonomics", None, "Ergotron brand; not in Sunaofe's catalogue"),
    ("amazon-basics-premium-monitor-stand", "Sunaofe Ergonomics", None, "Amazon Basics brand; not in Sunaofe's catalogue"),
    ("huanuo-dual-monitor-mount", "Sunaofe Accessories Official", None, "HUANUO brand; not in Sunaofe's catalogue"),
    ("ergear-single-monitor-arm", "Sunaofe Ergonomics", None, "ErGear brand; not in Sunaofe's catalogue"),
    ("herman-miller-aeron-chair", "Sunaofe Ergonomic Seating", None, "Herman Miller brand; Sunaofe stocks only its own chairs"),
    ("neakasa-p1-pro-pet-grooming-vacuum", "Inspire Uplift", None, "generic homepage, and the site returns 403 to everything"),
    ("nexbie-custom-3d-pet-portrait", "Nexbie", None, "Nexbie's 67-product catalogue has no pet portrait item"),
    ("amazon-echo-show-8-3rd-gen", "Everblog", None, "Everblog is a calendar maker; they do not sell Amazon devices"),
    ("fullstar-vegetable-chopper-mandoline-slicer-9-in-1", "DealGenius", None, "DealGenius stocks a 16-in-1 chopper, not the Fullstar 9-in-1"),
    ("aerolatte-handheld-milk-frother", "DealGenius", None, "no Aerolatte frother in the DealGenius catalogue"),
    ("magsafe-compatible-phone-stand", "FNTCase", None, "FNTCase sells phone cases only; UGREEN stand is not stocked"),
    ("nomatic-travel-pack-30l", "Moosehill", None, "moosehill.com is a parked contact page, not a store"),
    ("levitating-globe-lamp", "Giftlab", None, "Giftlab has no levitating globe among its 11,551 products"),
    ("dima-eyewear-blue-light-blocking-computer-glasses", "Dima Eyewear", None, "Dima sells named frames (Aria, Aggie, ...); no generic blue-light SKU"),
]


def dest_of(url: str) -> str:
    """Pull the merchant destination out of an Awin deep link."""
    m = re.search(r"[?&]ued=([^&]+)", url)
    return __import__("urllib.parse", fromlist=["unquote"]).unquote(m.group(1)) if m else url


def rewrap(old_url: str, new_dest: str) -> str:
    """Keep the Awin wrapper, replace only the tracked destination."""
    if "ued=" in old_url:
        return re.sub(r"([?&]ued=)[^&]*", lambda m: m.group(1) + __import__("urllib.parse", fromlist=["quote"]).quote(new_dest, safe=""), old_url)
    return new_dest


def main():
    dry = "--dry-run" in sys.argv
    products = json.loads(DATA.read_text(encoding="utf-8"))
    by_slug = {p.get("slug"): p for p in products}
    touched = 0
    report = []

    for fix_slug, name_prefix, new_dest, why in FIXES:
        product = by_slug.get(fix_slug)
        if product is None:
            print(f"SKIP  no product with slug {fix_slug}")
            continue
        hit = False
        for v in product.get("vendors", []):
            if not str(v.get("name", "")).startswith(name_prefix):
                continue
            old = v.get("url", "")
            if not old:
                continue
            hit = True
            if new_dest is None:
                v["url"] = ""
                v["isPrimary"] = False
                action = "REMOVE"
            else:
                v["url"] = rewrap(old, new_dest)
                action = "SET"
            touched += 1
            report.append((fix_slug, v["name"], action, dest_of(old), dest_of(v["url"]), why))
        if not hit:
            print(f"SKIP  {fix_slug}: no vendor starting with {name_prefix!r}")

    for slug, name, action, old, new, why in report:
        print(f"{action:6} {slug[:46]:48} [{name[:18]}]")
        print(f"       from: {old[:96]}")
        print(f"       to  : {new[:96] if new else '(no retailer link)'}")
        print(f"       why : {why}")

    print(f"\n{touched} vendor links changed, {len(products)} products in catalogue")
    if dry:
        print("DRY RUN — nothing written")
        return 0

    backup = BASE / "backups" / f"products-{date.today()}-before-vendor-links.json"
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DATA, backup)
    DATA.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"backup: {backup.relative_to(BASE)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
