import html
import json
import re

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
    for article in articles.get("queue", []):
        if article.get("status") != "published":
            continue
        category = article.get("category_slug", "")
        article_slug = slugify(article.get("title", ""))
        if not (out_dir / category / article_slug / "index.html").exists():
            continue
        product = next((products_by_asin.get(asin) for asin in article.get("product_asins", []) if products_by_asin.get(asin)), None)
        image = product.get("images", [""])[0] if product else ""
        items.append({
            "title": article["title"],
            "link": f"https://newgiftsandgadgets.com/{category}/{article_slug}/",
            "description": clean_description(article.get("body_intro", "")),
            "image": image if image.startswith("http") else "https://newgiftsandgadgets.com/default-thumbnail.png",
        })
    return items


def audience_items(out_dir):
    items = []
    gifts_dir = out_dir / "gifts"
    if not gifts_dir.exists():
        return items
    for route in sorted(gifts_dir.glob("*/index.html")):
        page_html = read_file(route)
        title = page_html.split("<title>", 1)[1].split("</title>", 1)[0] if "<title>" in page_html else route.parent.name
        description_match = re.search(r'<meta name="description" content="([^"]+)"', page_html)
        image_match = re.search(r'<img[^>]+src="([^"]+)"', page_html)
        items.append({
            "title": title.replace(" | NewGiftsAndGadgets", "").replace(" — NewGiftsAndGadgets", ""),
            "link": f"https://newgiftsandgadgets.com/gifts/{route.parent.name}/",
            "description": html.unescape(description_match.group(1)) if description_match else "Practical gift ideas organized around the recipient.",
            "image": html.unescape(image_match.group(1)) if image_match and image_match.group(1).startswith("http") else "https://newgiftsandgadgets.com/default-thumbnail.png",
        })
    return items


def generate_rss():
    out_dir = BASE_DIR / "out"
    scan_dir = out_dir if out_dir.exists() else PUBLIC_DIR
    items = audience_items(scan_dir) + article_items(scan_dir)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">',
        "  <channel>",
        "    <title>NewGiftsAndGadgets Gift Guides</title>",
        "    <link>https://newgiftsandgadgets.com/</link>",
        "    <description>Research-based gift ideas and practical gadget buying guides.</description>",
        "    <language>en-us</language>",
    ]
    for item in items:
        lines.extend([
            "    <item>",
            f"      <title>{html.escape(item['title'])}</title>",
            f"      <link>{html.escape(item['link'])}</link>",
            f"      <guid isPermaLink=\"true\">{html.escape(item['link'])}</guid>",
            f"      <description>{html.escape(item['description'])}</description>",
            f"      <media:content url=\"{html.escape(item['image'], quote=True)}\" medium=\"image\" />",
            "    </item>",
        ])
    lines.extend(["  </channel>", "</rss>", ""])
    rss = "\n".join(lines)
    write_file(scan_dir / "rss.xml", rss)
    write_file(scan_dir / "sitemap.rss", rss)
    if scan_dir == out_dir:
        write_file(PUBLIC_DIR / "rss.xml", rss)
        write_file(PUBLIC_DIR / "sitemap.rss", rss)
    print(f"Editorial RSS generated with {len(items)} gift and guide items.")


if __name__ == "__main__":
    generate_rss()
