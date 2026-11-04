from pathlib import Path
from datetime import date
from xml.sax.saxutils import escape
import json
import re

from utils import BASE_DIR, PUBLIC_DIR, write_file

# ---------------------------------------------------------
# GENERATE SITEMAP.XML
# ---------------------------------------------------------

DOMAIN = "https://newgiftsandgadgets.com"
DATA_DIR = BASE_DIR / "src" / "lib" / "data"

EXCLUDE_DIRS = {"assets", "api", "data", "_next", "_not-found", "404", "admin"}

# Pages whose entire content is drawn from the product catalog. Their lastmod is
# the newest date in the catalog, so it only moves when a product really changes.
CATALOG_SCOPED = {
    "/",
    "/shop/all/",
    "/shop/new-arrivals/",
    "/brands/",
    "/gift-guides/fathers-day-gadget-gifts/",
}

ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def category_slug(name):
    """Mirror of categorySlug() in src/lib/utils.ts."""
    slug = str(name or "").lower().replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def guide_slug(title):
    """Mirror of slugify() in src/app/(guides)/[category]/[slug]/page.tsx."""
    slug = re.sub(r"[^a-z0-9]+", "-", str(title or "").lower())
    return slug.strip("-")


def clean_date(value, today):
    """
    Return a valid ISO date string, or None.

    This never invents a date. Anything malformed is dropped rather than
    guessed, and a future date is clamped to today because a page cannot have
    been modified after the build ran.
    """
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not ISO_DATE.match(text):
        return None
    try:
        parsed = date.fromisoformat(text)
    except ValueError:
        return None
    return min(parsed, today).isoformat()


def load_json(name, default):
    path = DATA_DIR / name
    if not path.exists():
        print(f"Sitemap: {path.name} not found; lastmod values will be omitted.")
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"Sitemap: could not parse {path.name} ({exc}); lastmod values will be omitted.")
        return default


def build_lastmod_index(today):
    """
    Map each known URL path to the date its content last actually changed.

    The dates come from the same JSON the pages render from:
      product page -> that product's lastUpdated
      category page -> newest lastUpdated among products in that category
      guide page -> newest lastUpdated among the products it features
      audience page -> newest lastUpdated among products tagged for it

    Anything that cannot be derived is left out, so the sitemap simply omits
    lastmod for that URL instead of claiming the page changed today.
    """
    products = load_json("products.json", [])
    guide_queue = load_json("articles.json", {}).get("queue", [])

    dated = []
    for product in products:
        if not isinstance(product, dict):
            continue
        stamp = clean_date(product.get("lastUpdated"), today)
        if stamp:
            dated.append((product, stamp))

    catalog_max = max((stamp for _, stamp in dated), default=None)
    index = {}

    by_category = {}
    by_recipient = {}
    by_asin = {}

    for product, stamp in dated:
        slug = product.get("slug")
        if slug:
            index[f"/product/{slug}/"] = stamp

        tags = product.get("tags") or {}
        cat = category_slug(tags.get("category"))
        if cat:
            by_category.setdefault(cat, []).append(stamp)

        # /gifts/<audience>/ pages select products by their recipient tag, so the
        # tag slugged down is the same key the route uses.
        for recipient in tags.get("recipient") or []:
            key = re.sub(r"[^a-z0-9]+", "-", str(recipient).lower()).strip("-")
            if key:
                by_recipient.setdefault(key, []).append(stamp)

        raw_id = str(product.get("id", ""))
        asin = raw_id[2:] if raw_id.startswith("P-") else raw_id
        if asin:
            by_asin[asin] = stamp

    for cat, stamps in by_category.items():
        index[f"/shop/{cat}/"] = max(stamps)

    for recipient, stamps in by_recipient.items():
        index[f"/gifts/{recipient}/"] = max(stamps)

    for guide in guide_queue:
        if not isinstance(guide, dict):
            continue
        stamps = [by_asin[a] for a in guide.get("product_asins") or [] if a in by_asin]
        cat = guide.get("category_slug")
        slug = guide_slug(guide.get("title"))
        if stamps and cat and slug:
            index[f"/{cat}/{slug}/"] = max(stamps)

    return index, catalog_max


def generate_sitemap():
    """
    Recursively scans /out/ (or /public/) for index.html files and builds a
    sitemap.xml with a real per-URL lastmod plus changefreq and priority.
    """
    today = date.today()
    lastmod_index, catalog_max = build_lastmod_index(today)

    # Determine scan directory: prefer 'out' if it exists, otherwise 'public'
    out_dir = PUBLIC_DIR.parent / "out"
    scan_dir = out_dir if out_dir.exists() else PUBLIC_DIR
    print(f"Sitemap: Scanning {scan_dir} for index.html files...")

    entries = []
    dated_count = 0
    undated = []

    # Walk the directory tree
    for index_file in sorted(scan_dir.rglob("index.html")):
        rel = index_file.parent.relative_to(scan_dir)
        slug = str(rel).replace("\\", "/")

        # Skip excluded directories
        first_segment = slug.split("/")[0]
        if first_segment in EXCLUDE_DIRS or slug == "_not-found" or slug.startswith("api/"):
            continue

        # Build the URL
        if slug == ".":
            path = "/"
            url = f"{DOMAIN}/"
            priority = "1.0"
            changefreq = "daily"
        else:
            path = f"/{slug}/"
            url = f"{DOMAIN}/{slug}/"
            depth = len(slug.split("/"))
            if depth == 1:
                # Category / top-level pages
                priority = "0.8"
                changefreq = "weekly"
            else:
                # Articles and products
                priority = "0.6"
                changefreq = "monthly"

        lastmod = lastmod_index.get(path)
        if lastmod is None and catalog_max and (path in CATALOG_SCOPED or path.startswith("/gifts/")):
            # Gift collections and catalog-wide pages are drawn from the whole
            # catalog, so they move whenever any product does.
            lastmod = catalog_max

        if lastmod:
            dated_count += 1
        else:
            undated.append(path)

        entries.append((url, lastmod, changefreq, priority))

    # Build XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for url, lastmod, changefreq, priority in entries:
        # Escape every value: a directory name containing "&" (e.g. a category
        # slug like shop/health-&-wellness) otherwise emits invalid XML and the
        # whole sitemap becomes unreadable to crawlers.
        xml += "  <url>\n"
        xml += f"    <loc>{escape(url)}</loc>\n"
        if lastmod:
            xml += f"    <lastmod>{escape(lastmod)}</lastmod>\n"
        xml += f"    <changefreq>{escape(changefreq)}</changefreq>\n"
        xml += f"    <priority>{escape(priority)}</priority>\n"
        xml += "  </url>\n"

    xml += "</urlset>"

    # Save to scan_dir
    write_file(scan_dir / "sitemap.xml", xml)
    print(f"Sitemap generated at {scan_dir / 'sitemap.xml'} with {len(entries)} URLs.")
    print(f"Sitemap: {dated_count} URLs carry a real lastmod; {len(undated)} omit it.")
    if undated:
        print("Sitemap: no content date available for: " + ", ".join(undated))

    # Keep public in sync if we scanned out
    if scan_dir == out_dir:
        write_file(PUBLIC_DIR / "sitemap.xml", xml)
        print("Sitemap synced to public/sitemap.xml.")


if __name__ == "__main__":
    generate_sitemap()
