"""Re-point the NewGiftsAndGadgets guides whose products left with Amazon.

Sixteen of the twenty-one guides referenced ASINs that no longer exist in the
catalog. The template silently back-filled three unrelated products from the
same category, so "Best Air Fryers of 2026" was publishing a milk frother, a
vegetable chopper and kitchen wall art.

Two outcomes per guide:

  re-pointed  real catalog products that match the headline, and body copy that
              describes those products rather than the ones that vanished
  retired     nothing in the catalog fits the headline, so the page is removed
              and 301s to the closest useful destination (see .htaccess)

Usage:
    python scripts/repoint_guides.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ARTICLES = BASE / "src" / "lib" / "data" / "articles.json"
PRODUCTS = BASE / "src" / "lib" / "data" / "products.json"

# title -> (product_asins, body_intro)
REPOINT = {
    "Best Kitchen Gadgets 2026 UPDATED": (
        [
            "B0CHBPXHC6",               # Fullstar Vegetable Chopper & Mandoline
            "B0002KZUNA",               # Aerolatte Handheld Milk Frother
            "AW-DG-FOOD-SCALE",         # DealGenius Digital Food Scale
            "AW-DG-5IN1-OPENER",        # DealGenius 5-in-1 Jar & Bottle Opener
            "AW-DG-ROLLING-GRILL-BASKET",  # DealGenius Rolling Grill Baskets
        ],
        "<p>This shortlist covers kitchen tools that do different jobs: chopping and slicing, "
        "frothing milk, weighing ingredients, opening stubborn jars, and grilling small items "
        "without losing them through the grate.</p>"
        "<p>Each pick was assessed on counter and drawer footprint, how many parts need washing, "
        "whether the working parts are exposed to heat or hard to clean, and how often the tool "
        "would realistically be used. A gadget that saves two minutes and takes four to clean is "
        "not an upgrade.</p>"
        "<p>Before buying, measure the space it occupies in use as well as stored, and check "
        "whether the recipient already owns a version of the same tool.</p>",
    ),
    "Top Smart Home Tech 2026": (
        [
            "B0BLS3Y632",             # Echo Show 8
            "AW-EVERBLOG-HOMECAL",    # HomeCal smart family calendar
            "AW-DG-750LED-LIGHTS",    # 750 LED star string lights
            "AW-DG-SOLAR-EYEBALLS",   # Solar pathway stake lights
            "AW-ANTHBOT-M9-PRO",      # Boundary-free robotic lawn mower
        ],
        "<p>This guide compares connected devices by what they actually take off someone's plate: "
        "a shared family calendar, seasonal outdoor lighting, a kitchen display hub, and lawn care "
        "that runs without a boundary wire.</p>"
        "<p>Published features matter less than setup reality. For each pick, check what app or hub "
        "it needs, whether it depends on a subscription, how it behaves when the connection drops, "
        "what data leaves the household, and what maintenance the hardware needs over a season.</p>"
        "<p>Start with the routine that costs the household the most time, then confirm the device "
        "fits the platform already in use rather than adding a fourth app to the phone.</p>",
    ),
    "Essential Desk Upgrades": (
        [
            "B009S750LA",                      # VIVO dual monitor desk mount
            "B0DSJN4XSX",                      # Ergotron LX single arm
            "B074P7Y9ZG",                      # Amazon Basics monitor stand
            "B0D2QXRW9K",                      # UGREEN MagSafe phone stand
            "AW-DIMA-EYEWEAR-BLUELIGHT",       # Dima blue-light computer glasses
        ],
        "<p>The best desk upgrade fixes something the person notices every day. This shortlist "
        "targets reclaiming desk surface, raising a screen to eye level, keeping a phone visible "
        "without occupying a hand, and cutting late-evening glare from a screen.</p>"
        "<p>Monitor arms are judged on supported weight, VESA compatibility and the desk depth the "
        "clamp needs. A mount that cannot hold the panel at the height someone actually works at is "
        "worse than the stand it replaced, so the specifications matter more than the mechanism.</p>"
        "<p>Before buying, measure the desk thickness for the clamp, confirm the monitor's VESA "
        "pattern and weight, and decide whether the recipient would rather have a riser than an arm.</p>",
    ),
    "Must-Have Travel Gadgets for Digital Nomads": (
        [
            "B07782GG5T",                    # Nomatic Travel Pack 30L
            "AW-DG-PORTABLE-WASHER",         # Foldable portable washer
            "AW-TRAVERSEON-CAR-HEATER",      # 12V car heater and defroster
            "AW-SHADOWTRACK",                # Portable GPS asset tracker
            "AW-TRAVERSEON-SHAWL",           # Cordless heated shawl
        ],
        "<p>Travel gear earns its place by surviving repetition: packing the same bag for months, "
        "washing clothes in a sink or a small apartment, and staying warm in a cold car or a cold "
        "room.</p>"
        "<p>These picks were compared on packed weight and dimensions, power requirements and plug "
        "standards, maintenance, and what happens when an outlet or a connection is unavailable. A "
        "tracker is only useful if its coverage and running cost suit the countries on the itinerary.</p>"
        "<p>Check airline carry-on limits, vehicle voltage and destination plug types before buying, "
        "and confirm the recipient is not already travelling with a working version.</p>",
    ),
}

# title -> redirect target
RETIRE = {
    "Best Smart Speakers": "/smart-home/top-smart-home-tech-2026/",
    "Best Air Fryers of 2026": "/kitchen/best-kitchen-gadgets-2026-updated/",
    "Best Smart Home Upgrades 2026": "/smart-home/top-smart-home-tech-2026/",
    "Best Desk Lamps for Home Office 2026": "/shop/home-office/",
    "Best Webcam for Zoom Meetings 2026": "/gifts/video-call-gifts/",
    "Roomba vs Roborock: Which Robot Vacuum Wins?": "/shop/smart-home/",
    "Best Smart Light Bulbs for Every Room": "/smart-home/top-smart-home-tech-2026/",
    "Ninja vs Vitamix: The Professional Blender Showdown": "/shop/kitchen/",
    "Top 5 Smart Coffee Makers for 2026": "/shop/kitchen/",
    "MX Master 3S Review: The Best Office Mouse?": "/home-office/essential-desk-upgrades/",
    "Best Power Delivery Hubs for MacBook Pro": "/home-office/essential-desk-upgrades/",
    "Smart Home on a Budget: Build Your Setup Under $200": "/smart-home/top-smart-home-tech-2026/",
}


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    data = json.loads(ARTICLES.read_text(encoding="utf-8"))
    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    valid = {p["id"][2:] if p["id"].startswith("P-") else p["id"] for p in products}

    missing_titles = []
    kept = []
    retired_urls = []
    repointed = []

    for article in data["queue"]:
        title = article["title"]

        if title in RETIRE:
            retired_urls.append(
                (f"/{article['category_slug']}/{slugify(title)}/", RETIRE[title])
            )
            continue

        if title in REPOINT:
            asins, intro = REPOINT[title]
            unknown = [a for a in asins if a not in valid]
            if unknown:
                raise SystemExit(f"{title}: unknown product ids {unknown}")
            article["product_asins"] = asins
            article["body_intro"] = intro
            repointed.append(title)

        article["_valid"] = [a for a in article.get("product_asins") or [] if a in valid]
        kept.append(article)

    data["queue"] = []
    for article in kept:
        article.pop("_valid", None)
        data["queue"].append(article)

    # Nothing should survive without at least one real product.
    dead = [a["title"] for a in data["queue"] if not [x for x in a.get("product_asins") or [] if x in valid]]

    print(f"re-pointed: {len(repointed)}")
    for t in repointed:
        print("   ", t)
    print(f"retired:    {len(RETIRE)}")
    for t, target in RETIRE.items():
        print(f"    {t[:52]:<54} -> {target}")
    print(f"guides remaining: {len(data['queue'])}")
    if dead:
        print("STILL DEAD (must be fixed):", dead)
        return 1
    if missing_titles:
        print("titles not found:", missing_titles)

    if not args.dry_run:
        ARTICLES.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {ARTICLES.name}")

    print("\n301 rules to add to public/.htaccess:")
    for old, new in retired_urls:
        print(f"Redirect 301 {old} {new}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
