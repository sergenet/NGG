import html
import json
import re
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime

from utils import BASE_DIR, PUBLIC_DIR, read_file, slugify, write_file


def clean_description(raw_html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw_html or "")
    text = re.sub(r"#+\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()[:500]


def article_items(out_dir):
    articles = json.loads((BASE_DIR / "src/lib/data/articles.json").read_text(encoding="utf-8"))
    products = json.loads((BASE_DIR / "src/lib/data/products.json").read_text(encoding="utf-8"))
    products_by_asin = {product["id"].removeprefix("P-"): product for product in products}
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
        items.append({
            "title": article["title"],
            "link": f"https://newgiftsandgadgets.com/{category}/{article_slug}/",
            "description": clean_description(article.get("body_intro", "")),
            "image": image,
        })
    return items


def active_product_items(out_dir):
    products = json.loads((BASE_DIR / "src/lib/data/products.json").read_text(encoding="utf-8"))
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
        })
    return items


def generate_rss():
    out_dir = BASE_DIR / "out"
    scan_dir = out_dir if out_dir.exists() else PUBLIC_DIR
    items = active_product_items(scan_dir) + article_items(scan_dir)
    now_utc = datetime.now(timezone.utc)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">',
        "  <channel>",
        "    <title>NewGiftsAndGadgets Gift Guides</title>",
        "    <link>https://newgiftsandgadgets.com/</link>",
        "    <description>Research-based gift ideas and practical gadget buying guides.</description>",
        "    <language>en-us</language>",
        f"    <lastBuildDate>{format_datetime(now_utc)}</lastBuildDate>",
    ]
    for idx, item in enumerate(items):
        img_url = html.escape(item["image"], quote=True)
        item_pub_date = format_datetime(now_utc - timedelta(minutes=idx * 5))
        lines.extend([
            "    <item>",
            f"      <title>{html.escape(item['title'])}</title>",
            f"      <link>{html.escape(item['link'])}</link>",
            f"      <guid isPermaLink=\"true\">{html.escape(item['link'])}</guid>",
            f"      <pubDate>{item_pub_date}</pubDate>",
            f"      <description>{html.escape(item['description'])}</description>",
            f"      <media:content url=\"{img_url}\" medium=\"image\" />",
            "    </item>",
        ])
    lines.extend(["  </channel>", "</rss>", ""])
    rss = "\n".join(lines)
    for filename in ("rss.xml", "sitemap.rss", "pinterest-rss.xml"):
        write_file(scan_dir / filename, rss)
        if scan_dir == out_dir:
            write_file(PUBLIC_DIR / filename, rss)
    print(f"Editorial RSS generated with {len(items)} active Awin items.")


if __name__ == "__main__":
    generate_rss()
