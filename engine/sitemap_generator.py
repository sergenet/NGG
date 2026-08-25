from pathlib import Path
from utils import PUBLIC_DIR, write_file

# ---------------------------------------------------------
# GENERATE SITEMAP.XML
# ---------------------------------------------------------

def generate_sitemap():
    """
    Recursively scans /out/ or /public/ for all index.html files and builds a
    comprehensive sitemap.xml with lastmod, changefreq, and priority.
    """
    from datetime import date

    DOMAIN = "https://newgiftsandgadgets.com"
    EXCLUDE_DIRS = {"assets", "api", "data", "_next", "_not-found", "404"}
    today = date.today().isoformat()

    # Determine scan directory: prefer 'out' if it exists, otherwise 'public'
    out_dir = PUBLIC_DIR.parent / "out"
    scan_dir = out_dir if out_dir.exists() else PUBLIC_DIR
    print(f"Sitemap: Scanning {scan_dir} for index.html files...")

    entries = []

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
            url = f"{DOMAIN}/"
            priority = "1.0"
            changefreq = "daily"
        else:
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

        entries.append((url, today, changefreq, priority))

    # Build XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for url, lastmod, changefreq, priority in entries:
        xml += "  <url>\n"
        xml += f"    <loc>{url}</loc>\n"
        xml += f"    <lastmod>{lastmod}</lastmod>\n"
        xml += f"    <changefreq>{changefreq}</changefreq>\n"
        xml += f"    <priority>{priority}</priority>\n"
        xml += "  </url>\n"

    xml += "</urlset>"

    # Save to scan_dir
    write_file(scan_dir / "sitemap.xml", xml)
    print(f"Sitemap generated at {scan_dir / 'sitemap.xml'} with {len(entries)} URLs.")

    # Keep public in sync if we scanned out
    if scan_dir == out_dir:
        write_file(PUBLIC_DIR / "sitemap.xml", xml)
        print("Sitemap synced to public/sitemap.xml.")


if __name__ == "__main__":
    generate_sitemap()
