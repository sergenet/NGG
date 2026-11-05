import html
import json
import re
from datetime import date, datetime, timezone
from email.utils import format_datetime

from sitemap_generator import clean_date
from utils import BASE_DIR, PUBLIC_DIR, read_file, slugify, write_file


def clean_description(raw_html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw_html or "")
    text = re.sub(r"#+\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()[:500]


def to_rfc822(iso_date):
    """
    Turn an ISO content date into the RFC 822 stamp RSS wants, at 00:00 UTC.

    The date is the day the content actually changed, so it stays put between
    builds. Returns None when there is no real date, and the caller omits the
    element rather than stamping the build clock.
    """
    if not iso_date:
        return None
    parsed = datetime.fromisoformat(iso_date)
    return format_datetime(parsed.replace(tzinfo=timezone.utc))


def article_items(out_dir):
    articles = json.loads((BASE_DIR / "src/lib/data/articles.json").read_text(encoding="utf-8"))
    products = json.loads((BASE_DIR / "src/lib/data/products.json").read_text(encoding="utf-8"))
    products_by_asin = {product["id"].removeprefix("P-"): product for product in products}
    today = date.today()
    # A guide carries no date of its own, so it takes the newest date among the
    # products it features. Same rule the sitemap applies to guide URLs, and it
    # only moves when one of those products really changes.
    dates_by_asin = {}
    for product in products:
        stamp = clean_date(product.get("lastUpdated"), today)
        raw_id = str(product.get("id", ""))
        asin = raw_id[2:] if raw_id.startswith("P-") else raw_id
        if asin and stamp:
            dates_by_asin[asin] = stamp
    items = []
    # Reverse so newest comparison guides (GRABO, ShadowGPS) appear first
    for article in reversed(articles.get("queue", [])):
        if article.get("status") != "published":
            continue
        category = article.get("category_slug", "")
        article_slug = slugify(article.get("title", ""))
        if not (out_dir / category / article_slug / "index.html").exists():
            continue
        product = next((products_by_asin.get(asin) for asin in article.get("product_asins", []) if products_by_asin.get(asin)), None)
        image = product.get("images", [""])[0] if product else ""
        # Only include articles that have an active external high-res product image (not old dead Amazon default-thumbnail)
        if not image.startswith("http"):
            continue
        stamps = [dates_by_asin[asin] for asin in article.get("product_asins", []) if asin in dates_by_asin]
        items.append({
            "title": article["title"],
            "link": f"https://newgiftsandgadgets.com/{category}/{article_slug}/",
            "description": clean_description(article.get("body_intro", "")),
            "image": image,
            "date": max(stamps) if stamps else None,
        })
    return items


def active_product_items(out_dir):
    products = json.loads((BASE_DIR / "src/lib/data/products.json").read_text(encoding="utf-8"))
    today = date.today()
    items = []
    for product in reversed(products):
        vendors = product.get("vendors", [])
        has_active_vendor = any(
            v.get("isPrimary") and v.get("url") and "amazon." not in v.get("url", "")
            for v in vendors
        )
        if not has_active_vendor:
            continue
        slug = product.get("slug", "")
        if not (out_dir / "product" / slug / "index.html").exists():
            continue
        image = (product.get("images") or [""])[0]
        items.append({
            "title": f"{product['title']} — Buying Guide & Review",
            "link": f"https://newgiftsandgadgets.com/product/{slug}/",
            "description": clean_description(product.get("description", "")),
            "image": image if image.startswith("http") else f"https://newgiftsandgadgets.com{image}",
            "date": clean_date(product.get("lastUpdated"), today),
        })
    return items


def generate_rss():
    out_dir = BASE_DIR / "out"
    scan_dir = out_dir if out_dir.exists() else PUBLIC_DIR
    items = active_product_items(scan_dir) + article_items(scan_dir)

    # Newest content first, so the feed's order matches its dates. Items with no
    # real date keep their relative order at the end and simply omit <pubDate>.
    dated = sorted((item for item in items if item.get("date")), key=lambda item: item["date"], reverse=True)
    undated = [item for item in items if not item.get("date")]
    items = dated + undated
    channel_date = to_rfc822(dated[0]["date"]) if dated else None

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">',
        "  <channel>",
        "    <title>NewGiftsAndGadgets Gift Guides</title>",
        "    <link>https://newgiftsandgadgets.com/</link>",
        "    <description>Research-based gift ideas and practical gadget buying guides.</description>",
        "    <language>en-us</language>",
    ]
    if channel_date:
        lines.append(f"    <lastBuildDate>{channel_date}</lastBuildDate>")
    for item in items:
        img_url = html.escape(item["image"], quote=True)
        item_pub_date = to_rfc822(item.get("date"))
        entry = [
            "    <item>",
            f"      <title>{html.escape(item['title'])}</title>",
            f"      <link>{html.escape(item['link'])}</link>",
            f"      <guid isPermaLink=\"true\">{html.escape(item['link'])}</guid>",
        ]
        if item_pub_date:
            entry.append(f"      <pubDate>{item_pub_date}</pubDate>")
        entry.extend([
            f"      <description>{html.escape(item['description'])}</description>",
            f"      <media:content url=\"{img_url}\" medium=\"image\" />",
            "    </item>",
        ])
        lines.extend(entry)
    lines.extend(["  </channel>", "</rss>", ""])
    rss = "\n".join(lines)
    for filename in ("rss.xml", "sitemap.rss", "pinterest-rss.xml"):
        write_file(scan_dir / filename, rss)
        if scan_dir == out_dir:
            write_file(PUBLIC_DIR / filename, rss)
    print(f"Editorial RSS generated with {len(items)} active Awin items.")


if __name__ == "__main__":
    generate_rss()
