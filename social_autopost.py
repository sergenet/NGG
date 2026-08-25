"""
social_autopost.py  –  NGG Social Media Auto-Poster
====================================================
Selects a product from PRODUCTS_POOL and posts it to Twitter/X and/or Pinterest.

Dependencies:
    pip install tweepy requests

Usage:
    python social_autopost.py                  # post to Pinterest (live, default)
    python social_autopost.py --dry-run        # preview without posting
    python social_autopost.py --platform twitter
    python social_autopost.py --platform pinterest
    python social_autopost.py --platform all   # post to X + Pinterest
    python social_autopost.py --asin B08T5S6JLN  # force a specific product
"""

raise SystemExit("DISABLED: obsolete product affiliate autoposter retired during Stage 0 on 2026-08-25.")

import json
import logging
import os
import random
import sys
import argparse
from datetime import datetime, timezone
from pathlib import Path

# ── Project path setup ────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
ENGINE_PATH = BASE_DIR / "engine"
if str(ENGINE_PATH) not in sys.path:
    sys.path.append(str(ENGINE_PATH))

try:
    from products_data import PRODUCTS_POOL
except ImportError as e:
    print(f"[ERROR] Could not import products_data.py from {ENGINE_PATH}: {e}")
    PRODUCTS_POOL = {}

# ── Constants ─────────────────────────────────────────────────────────────────
CONFIG_FILE  = BASE_DIR / "social_config.json"
HISTORY_FILE = BASE_DIR / "post_history.json"
LOG_FILE     = BASE_DIR / "social_autopost.log"
QUEUE_FILE   = ENGINE_PATH / "article_queue.json"
AFFILIATE_TAG = "sergenet05-20"
SITE_BASE_URL = "https://newgiftsandgadgets.com"

# ── Logging ───────────────────────────────────────────────────────────────────
# Force UTF-8 on stdout so emojis don't crash on Windows (cp1252)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

_stdout_handler = logging.StreamHandler(sys.stdout)
_stdout_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        _stdout_handler,
    ],
)
log = logging.getLogger("ngg_autopost")

# ── Config & History helpers ──────────────────────────────────────────────────

def slugify(text: str) -> str:
    import re
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")

def load_config() -> dict:
    """Load social_config.json. Returns {} if missing."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    log.warning("social_config.json not found – copy social_config.json.example and fill in your keys.")
    return {}


def validate_config(cfg: dict, platform: str) -> bool:
    """Return True only if all required keys for the platform are non-empty."""
    required = {
        "twitter": ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"],
        "pinterest": ["PINTEREST_ACCESS_TOKEN", "PINTEREST_BOARD_ID"],
    }
    all_required = required.get(platform, [])
    missing = []
    for key in all_required:
        value = str(cfg.get(key, "")).strip()
        if not value or value.upper().startswith("YOUR"):
            missing.append(key)

    if missing:
        log.error(f"[{platform.upper()}] Missing / placeholder keys in social_config.json: {missing}")
        return False
    return True


def load_history() -> dict:
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Ensure both keys exist for backward compatibility
            data.setdefault("posted_asins", [])
            data.setdefault("posted_article_slugs", [])
            return data
    return {"posted_asins": [], "posted_article_slugs": [], "last_run": None}


def save_history(history: dict) -> None:
    history["last_run"] = datetime.now(timezone.utc).isoformat()
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=4)

# ── Product selection ─────────────────────────────────────────────────────────

def select_product(history: dict, force_asin: str | None = None) -> dict | None:
    """Pick the next product to promote, with optional forced ASIN override."""
    all_products = []
    for category, products in PRODUCTS_POOL.items():
        for p in products:
            p.setdefault("category", category)
            all_products.append(p)

    if not all_products:
        log.error("PRODUCTS_POOL is empty. Check engine/products_data.py.")
        return None

    # Force a specific ASIN if requested
    if force_asin:
        match = next((p for p in all_products if p.get("asin") == force_asin), None)
        if not match:
            log.error(f"Forced ASIN {force_asin} not found in PRODUCTS_POOL.")
            return None
        return match

    # Filter out recently posted products
    available = [p for p in all_products if p.get("asin") not in history["posted_asins"]]
    if not available:
        log.info("All products posted – resetting history.")
        history["posted_asins"] = []
        available = all_products

    # Prioritise trending / new items
    trending = [p for p in available if p.get("is_trending") or p.get("is_new")]
    return random.choice(trending if trending else available)

# ── Article selection ─────────────────────────────────────────────────────────

def select_article(history: dict) -> dict | None:
    """Pick the next article to promote from engine/article_queue.json."""
    if not QUEUE_FILE.exists():
        log.error(f"Article queue not found at {QUEUE_FILE}")
        return None
        
    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            all_articles = data.get("queue", [])
    except Exception as e:
        log.error(f"Failed to read article queue: {e}")
        return None
        
    if not all_articles:
        log.error("Article queue is empty.")
        return None

    # Only promote published articles
    published = [a for a in all_articles if a.get("status") == "published"]
    if not published:
        log.warning("No articles with 'published' status found.")
        return None

    # Filter out recently posted articles
    for a in published:
        a["slug"] = slugify(a["title"])
        
    available = [a for a in published if a["slug"] not in history.get("posted_article_slugs", [])]
    
    if not available:
        log.info("All articles posted – resetting article history.")
        history["posted_article_slugs"] = []
        available = published

    return random.choice(available)

# ── Post formatters ───────────────────────────────────────────────────────────

def build_amazon_url(asin: str) -> str:
    return f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"


def build_product_url(item: dict) -> str:
    slug = item.get("slug") or slugify(item.get("name", "product"))
    return f"{SITE_BASE_URL}/product/{slug}"


def build_site_image_url(item: dict) -> str:
    # Try to find a vertical pin first (named by slug)
    asin = item.get("asin")
    slug = item.get("slug") or slugify(item.get("name", "product"))
    
    # Check if a vertical pin exists in public/assets/pins/
    # (Checking local filesystem as proxy for live site presence)
    pin_file = BASE_DIR / "public" / "assets" / "pins" / f"{slug}.png"
    if pin_file.exists():
        return f"{SITE_BASE_URL}/assets/pins/{slug}.png"
        
    # Read from products.json to fetch the live verified Amazon image URL
    try:
        products_json = BASE_DIR / "src" / "lib" / "data" / "products.json"
        if products_json.exists():
            with open(products_json, "r", encoding="utf-8") as f:
                p_data = json.load(f)
                for p in p_data:
                    if p.get("id") == f"P-{asin}" and p.get("images") and len(p["images"]) > 0:
                        img_url = p["images"][0]
                        if img_url.startswith("http"):
                            return img_url
    except Exception as e:
        log.warning(f"Failed to load products.json in image builder: {e}")
        
    return f"{SITE_BASE_URL}/assets/images/products/{asin}.jpg"

def build_article_url(article: dict) -> str:
    cat = article.get("category_slug", "reviews")
    slug = article.get("slug") or slugify(article["title"])
    return f"{SITE_BASE_URL}/{cat}/{slug}/"


def get_category_customizations(category: str):
    cat_lower = category.lower()
    if "office" in cat_lower or "desk" in cat_lower:
        return {
            "question": "Ready to upgrade your workspace?",
            "hashtags_tweet": "#HomeOffice #DeskGoals #Productivity",
            "hashtags_pin": "#WorkFromHome #DeskGoals #Workspace"
        }
    elif "smart-home" in cat_lower or "home" in cat_lower:
        return {
            "question": "Ready for a smart home upgrade?",
            "hashtags_tweet": "#SmartHome #HomeAutomation #IoT",
            "hashtags_pin": "#SmartHome #TechDeals #HomeAutomation"
        }
    elif "kitchen" in cat_lower or "cooking" in cat_lower:
        return {
            "question": "Ready to level up your cooking game?",
            "hashtags_tweet": "#KitchenGadgets #CookingHacks #Foodie",
            "hashtags_pin": "#KitchenDeals #CookingHacks #Foodie"
        }
    elif "outdoor" in cat_lower or "adventure" in cat_lower:
        return {
            "question": "Ready for your next outdoor adventure?",
            "hashtags_tweet": "#OutdoorGear #Overlanding #Fishing",
            "hashtags_pin": "#OutdoorGear #Camping #AdventureDeals"
        }
    elif "pet" in cat_lower:
        return {
            "question": "Looking for the ultimate smart pet gear?",
            "hashtags_tweet": "#PetTech #DogCamera #SmartPet",
            "hashtags_pin": "#PetTech #DogLovers #PetDeals"
        }
    elif "travel" in cat_lower or "nomad" in cat_lower:
        return {
            "question": "Ready to gear up for your next trip?",
            "hashtags_tweet": "#TravelTech #DigitalNomad #TravelGear",
            "hashtags_pin": "#TravelGear #DigitalNomad #TravelEssentials"
        }
    else:
        return {
            "question": "Ready for a smart tech upgrade?",
            "hashtags_tweet": "#ViralTech #SmartGadgets #GiftIdeas",
            "hashtags_pin": "#ViralTech #TechDeals #GiftIdeas"
        }


def format_tweet(item: dict, item_type: str = "product") -> str:
    if item_type == "product":
        cat = item.get("category", "")
        customs = get_category_customizations(cat)
        category_tag = f"#{cat.replace('-', '').title()}"
        hashtags = f"{customs['hashtags_tweet']} {category_tag}"
        desc_snippet = (item.get("desc") or "")[:110]
        best_for = item.get("best_for", "Practical & Stylish")

        tweet = (
            f"🔥 2026 MUST-HAVE: {item['name']} 🚀\n\n"
            f"{desc_snippet}...\n\n"
            f"💎 Best for: {best_for}\n"
            f"🔗 {build_product_url(item)}\n\n"
            f"{hashtags}"
        )
    else: # article
        cat = item.get("category_slug", "")
        customs = get_category_customizations(cat)
        category_tag = f"#{cat.replace('-', '').title()}"
        hashtags = f"#GadgetReviews #TechGuide {customs['hashtags_tweet']} {category_tag}"
        intro = item.get("body_intro", "").replace("<p>", "").replace("</p>", "")
        if len(intro) > 100: intro = intro[:97] + "..."
        
        tweet = (
            f"📖 NEW GUIDE: {item['title']} 🚀\n\n"
            f"\"{intro}\"\n\n"
            f"Check out our top recommendations for 2026:\n"
            f"🔗 {build_article_url(item)}\n\n"
            f"{hashtags}"
        )
        
    # Twitter/X hard limit: 280 chars
    if len(tweet) > 280:
        tweet = tweet[:277] + "..."
    return tweet


def format_pin(item: dict, item_type: str = "product") -> dict:
    if item_type == "product":
        cat = item.get("category", "")
        customs = get_category_customizations(cat)
        category_title = cat.replace("-", " ").title()
        return {
            "board_id": None,  # filled in at post time from config
            "title": f"Best {category_title} Gadgets 2026 – {item['name']}",
            "description": (
                f"{customs['question']} The {item['name']} is trending for 2026. "
                f"{item.get('desc', '')} "
                f"#Viral #TechDeals {customs['hashtags_pin']} #{category_title.replace(' ', '')}"
            ),
            "link": build_product_url(item),
            "media_source": {
                "source_type": "image_url",
                "url": build_site_image_url(item),
            },
        }
    else: # article
        category_title = item["category_slug"].replace("-", " ").title()
        # Use first product image if available, else a fallback
        image_asin = item["product_asins"][0] if item.get("product_asins") else "default"
        
        return {
            "board_id": None,
            "title": f"{item['title']} (2026 Expert Guide)",
            "description": (
                f"Looking for the best {category_title} equipment? We tested the top models for 2026. "
                f"Read our full comparison and editor's picks. "
                f"#GadgetReviews #TechGuide #HomeOffice #{category_title.replace(' ', '')}"
            ),
            "link": build_article_url(item),
            "media_source": {
                "source_type": "image_url",
                "url": build_site_image_url({"asin": image_asin}),
            },
        }

# ── Platform posters ──────────────────────────────────────────────────────────

def post_to_twitter(tweet_text: str, cfg: dict, dry_run: bool) -> bool:
    """Post a tweet via Twitter/X API v2 using Tweepy."""
    if dry_run:
        log.info("[DRY-RUN] Twitter post would be:\n%s", tweet_text)
        return True

    try:
        import tweepy  # type: ignore
    except ImportError:
        log.error("tweepy is not installed. Run: pip install tweepy")
        return False

    try:
        client = tweepy.Client(
            consumer_key=cfg["X_API_KEY"],
            consumer_secret=cfg["X_API_SECRET"],
            access_token=cfg["X_ACCESS_TOKEN"],
            access_token_secret=cfg["X_ACCESS_TOKEN_SECRET"],
        )
        response = client.create_tweet(text=tweet_text)
        tweet_id = response.data["id"]
        log.info(f"[TWITTER] ✅ Posted! Tweet ID: {tweet_id}  →  https://x.com/i/web/status/{tweet_id}")
        return True
    except tweepy.TweepyException as e:
        log.error(f"[TWITTER] ❌ API error: {e}")
        return False
    except Exception as e:
        log.error(f"[TWITTER] ❌ Unexpected error: {e}")
        return False


def post_to_pinterest(pin_data: dict, cfg: dict, dry_run: bool) -> bool:
    """Create a Pinterest pin via the Pinterest API v5."""
    pin_data = dict(pin_data)  # shallow copy
    pin_data["board_id"] = cfg.get("PINTEREST_BOARD_ID", "DRY_RUN_BOARD")

    if dry_run:
        log.info("[DRY-RUN] Pinterest pin would be:\n%s", json.dumps(pin_data, indent=2))
        return True

    try:
        import requests  # type: ignore
    except ImportError:
        log.error("requests is not installed. Run: pip install requests")
        return False

    # Use Sandbox if in trial/sandbox mode, otherwise production
    use_sandbox = cfg.get('PINTEREST_USE_SANDBOX', True)
    base_url = "https://api-sandbox.pinterest.com/v5" if use_sandbox else "https://api.pinterest.com/v5"
    url = f"{base_url}/pins"
    
    headers = {
        "Authorization": f"Bearer {cfg['PINTEREST_ACCESS_TOKEN']}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(url, headers=headers, json=pin_data, timeout=15)
        if resp.status_code in (200, 201):
            pin_id = resp.json().get("id", "unknown")
            log.info(f"[PINTEREST] ✅ Pin created! ID: {pin_id}  →  https://www.pinterest.com/pin/{pin_id}/")
            return True
        else:
            log.error(f"[PINTEREST] ❌ HTTP {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        log.error(f"[PINTEREST] ❌ Request failed: {e}")
        return False

# ── Main entry point ──────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="NGG Social Media Auto-Poster – posts products/articles to Twitter/X and Pinterest."
    )
    parser.add_argument("--dry-run",   action="store_true",
                        help="Preview posts without sending to any API.")
    parser.add_argument("--platform",  choices=["twitter", "pinterest", "all"], default="pinterest",
                        help="Which platform(s) to post to (default: pinterest).")
    parser.add_argument("--type",      choices=["product", "article", "all"], default="all",
                        help="What type of content to promote (default: all).")
    parser.add_argument("--asin",      type=str, default=None,
                        help="Force a specific product ASIN instead of auto-selecting.")
    args = parser.parse_args()

    log.info("=" * 60)
    log.info("NGG Auto-Poster starting  [platform=%s | type=%s | dry_run=%s]", args.platform, args.type, args.dry_run)

    cfg     = load_config()
    history = load_history()
    
    # Determine what to post
    post_type = args.type
    if post_type == "all":
        post_type = random.choice(["product", "article"])
        
    item = None
    if post_type == "product":
        item = select_product(history, force_asin=args.asin)
    else: # article
        item = select_article(history)
        
    if not item:
        log.error(f"No {post_type} selected. Aborting.")
        sys.exit(1)

    log.info(f"Selected {post_type}: {item.get('name') or item.get('title')}")

    tweet_text = format_tweet(item, post_type)
    pin_data   = format_pin(item, post_type)
    
    # Fill in board_id before logging
    if args.platform in ("pinterest", "all"):
        pin_data["board_id"] = cfg.get("PINTEREST_BOARD_ID")

    results = {}

    # ── Twitter/X ──────────────────────────────────────────────────────────
    if args.platform in ("twitter", "all"):
        log.info("\n--- TWITTER/X ---\n%s", tweet_text)
        if args.dry_run or validate_config(cfg, "twitter"):
            results["twitter"] = post_to_twitter(tweet_text, cfg, args.dry_run)
        else:
            results["twitter"] = False

    # ── Pinterest ───────────────────────────────────────────────────────────
    if args.platform in ("pinterest", "all"):
        log.info("\n--- PINTEREST ---\n%s", json.dumps(pin_data, indent=2))
        if args.dry_run or validate_config(cfg, "pinterest"):
            results["pinterest"] = post_to_pinterest(pin_data, cfg, args.dry_run)
        else:
            results["pinterest"] = False

    # ── Update history (only on live success) ───────────────────────────────
    any_success = any(results.values())
    if any_success and not args.dry_run:
        if post_type == "product":
            if item["asin"] not in history["posted_asins"]:
                history["posted_asins"].append(item["asin"])
                save_history(history)
                log.info("Product post history updated.")
        else: # article
            if item["slug"] not in history["posted_article_slugs"]:
                history["posted_article_slugs"].append(item["slug"])
                save_history(history)
                log.info("Article post history updated.")

    # ── Summary ─────────────────────────────────────────────────────────────
    log.info("\n── Run summary ─────────────────────────────────────────")
    for platform, ok in results.items():
        status = "✅ OK" if ok else "❌ FAILED"
        log.info("  %-12s %s", platform.capitalize(), status)
    log.info("=" * 60)

    if not all(results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
