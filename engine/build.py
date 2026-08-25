raise SystemExit("DISABLED: legacy Python site builder retired during Stage 0 on 2026-08-25; use npm run build.")

import shutil
import datetime
import math
import re
import subprocess
from pathlib import Path

from utils import (
    BASE_DIR,
    PUBLIC_DIR,
    ASSETS_DIR,
    REDESIGN_DIR,
    ensure_dir,
    wipe_directory,
    slugify,
    read_file,
    write_file,
    read_json
)
from homepage_builder import build_homepage
from category_builder import build_category_page
from generate_article import generate_article
from inject_affiliates import process_public_html
from sitemap_generator import generate_sitemap
from rss_generator import generate_rss
from generate_pinterest_feed import generate_feed
from products_data import PRODUCTS_POOL
from minify import minify_css_content, minify_html_content

QUEUE_FILE = BASE_DIR / "engine" / "article_queue.json"

# ---------------------------------------------------------
# PRODUCT CORE RENDERING
# ---------------------------------------------------------

def get_products_by_filter(category=None, tag=None, count=10):
    """
    Returns products from the pool matching category and/or tag.
    """
    results = []
    for cat_key, items in PRODUCTS_POOL.items():
        if category and cat_key != category:
            continue
        for p in items:
            if tag:
                if p.get(tag) is True:
                    results.append(p)
            else:
                results.append(p)
    
    return results[:count]

def render_product_card(asin, is_top_pick=False):
    """
    Generates a standardized product card with badges, price, and affiliate links.
    """
    product = None
    for cat in PRODUCTS_POOL:
        for p in PRODUCTS_POOL[cat]:
            if p['asin'] == asin:
                product = p
                break
    
    if not product:
        # Fail loudly in production - don't generate broken guides
        raise ValueError(f"CRITICAL ERROR: Product ASIN {asin} not found in PRODUCTS_POOL. Please check products_data.py.")

    badges_html = ""
    if is_top_pick:
        badges_html += '<div class="badge-editors-pick"><i class="fas fa-award"></i> Editor\'s Choice</div>'
    elif product.get('is_trending'):
        badges_html += '<span class="badge-trending">Viral Item</span>'
    
    if product.get('is_new'):
        badges_html += '<span class="badge-new">2026 Choice</span>'
    
    last_updated = product.get('last_updated', datetime.datetime.now().strftime("%Y-%m-%d"))
    
    # Pros/Cons logic
    pc_html = ""
    pros = product.get('pros', [])
    cons = product.get('cons', [])
    if pros or cons:
        pc_html += '<div class="pros-cons-grid">'
        if pros:
            pc_html += '<div class="pros-list"><h5>PROS</h5>' + "".join([f'<div class="pc-item"><i class="fas fa-plus-circle" style="color: #22c55e;"></i> {p}</div>' for p in pros]) + '</div>'
        if cons:
            pc_html += '<div class="cons-list"><h5>CONS</h5>' + "".join([f'<div class="pc-item"><i class="fas fa-minus-circle" style="color: #ef4444;"></i> {c}</div>' for c in cons]) + '</div>'
        pc_html += '</div>'

    # Verdict Box
    verdict_html = ""
    if product.get('verdict'):
        verdict_html = f'<div class="verdict-box"><span class="verdict-title">Expert Verdict</span><p style="font-size: 0.9rem; color: #166534; margin: 0;">{product["verdict"]}</p></div>'

    html = f"""
    <div class="product-item" id="product-{asin}" style="margin-bottom: 3rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div class="product-header" style="margin-bottom: 1.5rem;">
            {badges_html}
            <h3 style="margin-top: 0.5rem; color: #1a1a2e; font-size: 1.5rem; font-weight: 700;">{product['name']}</h3>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 0.5rem;">
                <span class="best-for-label" style="font-weight: 600; background: #f0fdf4; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">{product['best_for']}</span>
                <span class="price-val" style="font-weight: 700; color: #1e293b; font-size: 1.1rem;">{product['price']}</span>
            </div>
            <div class="last-updated-snippet" style="font-size: 0.75em; color: #9ca3af; margin-bottom: 1rem;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i> Current Stock Verified: {last_updated}
            </div>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;">
            <div style="font-size: 5rem; background: #f8fafc; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; border-radius: 12px;" loading="lazy">{product.get('image', '🎁')}</div>
            <div style="flex: 1; min-width: 250px;">
                <p style="font-style: italic; color: #475569; font-size: 1rem; line-height: 1.6;">{product['desc']}</p>
                {pc_html}
            </div>
        </div>
        
        {verdict_html}
        
        <div class="dual-cta" style="margin-top: 2rem;">
            <a href="https://www.amazon.com/dp/{asin}?tag=sergenet05-20" class="btn-buy" rel="sponsored" target="_blank">
                <i class="fab fa-amazon"></i> Check Today's Price →
            </a>
            <a href="#top" class="btn-details" style="background: #f1f5f9; color: #475569;">
                <i class="fas fa-info-circle"></i> Why This Pick?
            </a>
        </div>
    </div>
    """
    return html

# ---------------------------------------------------------
# ASSET HELPERS
# ---------------------------------------------------------

def copy_assets():
    dest = PUBLIC_DIR / "assets"
    ensure_dir(dest)
    if ASSETS_DIR.exists():
        shutil.copytree(ASSETS_DIR, dest, dirs_exist_ok=True)
    ds_src = BASE_DIR / "design-system" / "design-tokens.css"
    if ds_src.exists():
        css_dest = dest / "css"
        ensure_dir(css_dest)
        shutil.copy2(ds_src, css_dest / "design-tokens.css")

def copy_backend():
    for folder in ["api", "data"]:
        src = BASE_DIR / folder
        dest = PUBLIC_DIR / folder
        if src.exists():
            shutil.copytree(src, dest, dirs_exist_ok=True)

def generate_htaccess():
    content = """# === UTF-8 Encoding ===
AddDefaultCharset UTF-8

# === HTTPS & WWW Redirect ===
RewriteEngine On

# Route IndexNow verification key requests to logging PHP script (avoids 301 redirects)
RewriteRule ^4e07dedaa2c94c30ab2fa47f97a13c3d\\.txt$ log_key_access.php [L]

RewriteCond %{HTTP_HOST} ^www\\.newgiftsandgadgets\\.com [NC]
RewriteRule ^(.*)$ https://newgiftsandgadgets.com/$1 [L,R=301]

# === Security Headers ===
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# === GZIP Compression ===
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript
    AddOutputFilterByType DEFLATE application/javascript application/json
    AddOutputFilterByType DEFLATE application/xml text/xml image/svg+xml
    AddOutputFilterByType DEFLATE application/rss+xml
</IfModule>

# === Browser Caching ===
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType text/javascript "access plus 1 week"
    ExpiresByType font/woff2 "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/xml "access plus 1 hour"
    ExpiresByType application/rss+xml "access plus 1 hour"
</IfModule>

# === Custom Error Pages ===
ErrorDocument 404 /404.html

# === Prevent Directory Listing ===
Options -Indexes

# === Block Access to Sensitive Files ===
<FilesMatch "\\.(py|json|log|md|bat|ps1)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# === 301 Redirects for Legacy URLs ===
Redirect 301 /home-office/best-monitor-arms/ /home-office/best-monitor-arms-for-dual-setups-2026/
Redirect 301 /%F0%9F%A5%A4 /
Redirect 301 /🥤 /

# Redirect legacy product URLs to the new shop catalog
Redirect 301 /product/rose-gold-pink-burgundy-red-party-decorations-garland-52ft-heart-paper-streamers-banner-valentines-mothers-day-bachelorette-bridal-shower-engagement-wedding-hanging-decoration-lasting-surprise/ /shop/all/
Redirect 301 /product/qipecedm-4-pcs-ribbed-coupe-glasses-10-oz-vintage-cocktail-coupe-glasses-set-unique-martini-glass-classic-cocktail-galssware-bar-drinking-glasses-set-pefect-for-cocktail-wine-champagne-gif/ /shop/all/
Redirect 301 /product/little-planet-by-carters-baby-sleep-and-play-made-with-organic-cotton-hearts-3m/ /shop/all/
Redirect 301 /product/i-love-you-little-pookie/ /shop/all/
Redirect 301 /product/houlengs-womens-cute-heart-print-long-cardigan-sweater-v-neck-open-front-knitted-sweater-coats-with-pockets/ /shop/all/
Redirect 301 /product/pangda-4-pieces-metal-heart-wall-art-decor-heart-wall-decor-love-heart-wall-decoration-metal-heart-wall-sign-metal-wall-ornaments-for-bedroom-living-room-decoration-black/ /shop/all/
Redirect 301 /product/lc-dolida-sleep-headphones-headband-bluetooth-5-4-headband-earphones-wireless-with-usb-c-charge-port-sleep-mask-for-sleeping-sports-gifts-workout-jogging-yoga-insomnia-air-travel-meditation/ /shop/all/
Redirect 301 /product/hallmark-assorted-valentines-day-cards-for-kids-12-cards-with-envelopes-unicorns-bears-llamas/ /shop/all/
Redirect 301 /product/hallmark-minecraft-valentines-day-cards-and-mailbox-for-kids-school-classroom-exchange-1-box-32-valentine-cards-35-stickers-1-teacher-card/ /shop/all/
Redirect 301 /product/ddsol-toddler-boys-girls-valentines-day-t-shirt-unisex-raglan-long-sleeve-tees-loads-of-love-heart-kids-boys-tops-2-8-years/ /shop/all/
Redirect 301 /product/valentines-day-gifts-for-him-telescoping-magnetic-pickup-tool-valentines-day-gifts-magnetic-flashlight-gifts-for-menwomen-cool-gadgets-for-men-black/feed/ /shop/all/
Redirect 301 /product/electric-heating-pad-for-back-shoulder-neck-knee-leg-pain-relief-6-fast-heating-settings-auto-off-machine-washable-moist-dry-heat-options-extra-large-12x24gray/ /shop/all/
Redirect 301 /product/retsugo-toddler-baby-girls-sweatshirts-casual-pullover-crewneck-winter-long-sleeve-tops-shirts-clothes-3t-8t/ /shop/all/
Redirect 301 /product/digital-calendar-kaclendar-15-6-inch-electronic-calendarchore-chart-smart-weekly-and-monthly-plannerto-do-list-notepad-1920-1080p-ips-touchscreen-wall-and-desk-calendar-for-family-schedules/ /shop/all/
Redirect 301 /product/valentines-boxes-for-kids-valentines-day-cards-for-kids-vending-machine-valentine-boxes-with-25-valentine-cards-for-girls-boys-toddlers-valentines-gifts-for-school-class-classroom-party-favors/ /shop/all/

# Redirect legacy WordPress uploads and themes to root
RedirectMatch 301 ^/wp-content/.*$ /
"""
    write_file(PUBLIC_DIR / ".htaccess", content)

# ---------------------------------------------------------
# BUILD ALL ARTICLES
# ---------------------------------------------------------

def build_all_articles():
    """
    Builds all articles dynamically based on a manifest.
    """
    
    # Pre-build: Sync markdown drafts into the JSON queue
    try:
        from sync_queue import sync_queue
        sync_queue()
    except Exception as e:
        print(f"Warning: Failed to sync markdown drafts: {e}")
        
    all_article_metadata = []
    
    data = read_json(QUEUE_FILE)
    manifest = data.get("queue", [])

    for item in manifest:
        slug = slugify(item["title"])
        cat = item["category_slug"]
        all_article_metadata.append({
            "title": item["title"],
            "url": f"/{cat}/{slug}/",
            "category_slug": cat
        })

    articles = []
    for item in manifest:
        title = item["title"]
        print(f"Building article: {title}")
        body = item.get("body_intro", "")
        asins = item.get("product_asins", [])
        
        for idx, asin in enumerate(asins):
            # The first item in the list is the Editorial Choice
            is_top = (idx == 0)
            card_html = render_product_card(asin, is_top_pick=is_top)
            if "not found in pool" in card_html:
                print(f"  FAILED: Product {asin} not found in pool!")
            else:
                print(f"  SUCCESS: Product {asin} rendered.")
            
            body += card_html

            # Inject Stripe CTA after the first product
            if is_top and len(asins) > 1:
                # fetch the actual product to get the name
                top_p = None
                from products_data import PRODUCTS_POOL
                for cat in PRODUCTS_POOL:
                    for p in PRODUCTS_POOL[cat]:
                        if p['asin'] == asin:
                            top_p = p
                            break
                            
                if top_p:
                    cta = f"""
                    <div class="cta-stripe">
                        <h3>Don't Miss Out!</h3>
                        <p>The <strong>{top_p['name']}</strong> is currently our #1 recommendation for most users.</p>
                        <a href="https://www.amazon.com/dp/{top_p['asin']}?tag=sergenet05-20" class="btn-cta" rel="sponsored nofollow" target="_blank">Check Today's Price on Amazon →</a>
                    </div>
                    """
                    body += cta
        
        article = generate_article(
            title=title,
            body_html=body,
            category_slug=item["category_slug"],
            all_articles=all_article_metadata,
            product_asins=item.get("product_asins", [])
        )
        articles.append(article)

    return articles

# ---------------------------------------------------------
# BUILD CATEGORIES
# ---------------------------------------------------------

def build_all_categories(articles):
    category_names = ["Home Office", "Smart Home", "Kitchen", "Gift Guides", "Comparisons"]
    categories = []
    for name in category_names:
        slug = slugify(name)
        cat_articles = [a for a in articles if a.get("url", "").startswith(f"/{slug}/")]
        categories.append({"name": name, "articles": cat_articles})

    for cat in categories:
        cat_key = slugify(cat["name"])
        products = get_products_by_filter(category=cat_key, count=3)
        build_category_page(cat["name"], cat["articles"], products=products)
    return categories

# ---------------------------------------------------------
# BUILD STATIC PAGES
# ---------------------------------------------------------

def build_static_pages(articles=None):
    if articles is None: articles = []
    reviews_content = '<p class="mb-4">Explore our comprehensive, research-backed reviews...</p><div class="articles-grid">'
    for a in articles:
        reviews_content += f'<a href="{a["url"]}" class="article-card"><h3>{a["title"]}</h3><p>Read Review \u2192</p></a>'
    reviews_content += '</div>'

    pages = [
        {"title": "About Us", "slug": "about", "content": "<h3>Who We Are</h3><p>We are a small team of tech enthusiasts...</p>"},
        {"title": "Privacy Policy", "slug": "privacy", "content": "<h3>Privacy Policy</h3><p>At NewGiftsAndGadgets, we prioritize your privacy...</p>"},
        {"title": "Affiliate Disclosure", "slug": "affiliate-disclosure", "content": "<p>NewGiftsAndGadgets.com is a participant in the Amazon Services LLC Associates Program...</p>"},
        {"title": "Reviews", "slug": "reviews", "content": reviews_content}
    ]

    template_path = REDESIGN_DIR / "templates" / "general.html"
    if not template_path.exists(): return
    template = read_file(template_path)

    for p in pages:
        html = template.replace('<h1 id="page-title">Page Title</h1>', f'<h1>{p["title"]}</h1>')
        html = html.replace('<title id="page-title-seo">Page Title \u2014 NewGiftsAndGadgets</title>', f'<title>{p["title"]} \u2014 NewGiftsAndGadgets</title>')
        body_pattern = r'(<div id="page-body" class="page-content">).*?(</div>)'
        html = re.sub(body_pattern, rf'\1{p["content"]}\2', html, flags=re.DOTALL)
        output_dir = PUBLIC_DIR / p["slug"]
        ensure_dir(output_dir)
        write_file(output_dir / "index.html", html)

# ---------------------------------------------------------
# MASTER BUILD
# ---------------------------------------------------------

def build_site():
    print("Preparing /public/...")
    wipe_directory(PUBLIC_DIR)
    ensure_dir(PUBLIC_DIR)
    copy_assets()
    copy_backend()

    print("Building homepage...")
    featured = []
    innovations = []
    for cat_key in ["home-office", "smart-home", "kitchen"]:
        featured.extend(get_products_by_filter(category=cat_key, count=2))
        pool = PRODUCTS_POOL.get(cat_key, [])
        new_items = [p for p in pool if p.get("is_new")]
        if new_items: innovations.append(new_items[0])
    
    trending = [p for cat in PRODUCTS_POOL.values() for p in cat if p.get("is_trending")]
    build_homepage(products=featured, innovations=innovations, trending=trending)

    print("Building articles...")
    articles = build_all_articles()

    print("Building categories...")
    build_all_categories(articles)

    print("Building static pages...")
    build_static_pages(articles)

    print("Injecting affiliate logic...")
    process_public_html()
    generate_sitemap()
    generate_rss()
    generate_htaccess()
    generate_feed()
    
    # Generate IndexNow verification key file
    write_file(PUBLIC_DIR / "4e07dedaa2c94c30ab2fa47f97a13c3d.txt", "4e07dedaa2c94c30ab2fa47f97a13c3d")
    print("  OK: IndexNow verification key generated.")
    
    # Generate log_key_access.php
    php_logger_content = """<?php
$log_file = 'key_access.log';
$log_entry = date('Y-m-d H:i:s') . " | IP: " . $_SERVER['REMOTE_ADDR'] . " | UA: " . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'NONE') . "\\n";
foreach (getallheaders() as $name => $value) {
    $log_entry .= "  $name: $value\\n";
}
$log_entry .= "\\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

header('Content-Type: text/plain; charset=utf-8');
echo '4e07dedaa2c94c30ab2fa47f97a13c3d';
?>"""
    write_file(PUBLIC_DIR / "log_key_access.php", php_logger_content)
    print("  OK: log_key_access.php generated.")
    
    # ---------------------------------------------------------
    # PERFORMANCE OPTIMIZATION (Week 2)
    # ---------------------------------------------------------
    print("Optimization: Minifying CSS...")
    css_src = ASSETS_DIR / "css" / "main.css"
    if css_src.exists():
        raw_css = read_file(css_src)
        min_css = minify_css_content(raw_css)
        write_file(PUBLIC_DIR / "assets" / "css" / "main.min.css", min_css)
        print("  OK: main.min.css generated.")

    print("Optimization: Improving LCP & Lazy Loading...")
    for html_file in PUBLIC_DIR.rglob("*.html"):
        content = read_file(html_file)
        
        # 1. Add fetchpriority="high" to the first emoji icon in the hero banner (LCP)
        if "hero-banner" in content:
            content = content.replace('class="hero-banner"', 'class="hero-banner" fetchpriority="high"', 1)
        
        # 2. Add loading="lazy" to all product emojis not already marked
        content = content.replace('<div class="product-image">', '<div class="product-image" loading="lazy">')
        
        # 3. Simple HTML Minification
        content = minify_html_content(content)
        
        write_file(html_file, content)
    print("  OK: Frontend optimized.")

    print("Running Post-Processors...")
    # NOTE: Disabling legacy post-processors as sticky CTA is now integrated into article.html template
    # try:
    #     subprocess.run(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", "optimize_seo.ps1"], check=False)
    #     subprocess.run(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", "inject_sticky_cta.ps1"], check=False)
    # except: pass
    
    print("Build complete!")

if __name__ == "__main__":
    build_site()
