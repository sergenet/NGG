# homepage_builder.py
# Pure-Python homepage builder for Python 3.13

from utils import read_file, write_file, HOMEPAGE_DIR, PUBLIC_DIR
from minify import minify_html_content

def generate_product_html(p, force_badge=None):
    """
    Generates HTML for a single product card
    """
    import random
    
    if force_badge:
        badge_type = "badge-trending" if force_badge == "Trending" else "badge-new"
        badge_label = force_badge
    else:
        badges = ["badge-pick", "badge-value", "badge-premium", "badge-new"]
        badge_type = random.choice(badges)
        badge_labels = {
            "badge-pick": "Editor's Pick",
            "badge-value": "Best Value",
            "badge-premium": "Premium Choice",
            "badge-new": "New Innovation"
        }
        badge_label = badge_labels[badge_type]

    return f"""
    <div class="product-card">
        <span class="product-badge {badge_type}">{badge_label}</span>
        <div class="product-image">{p['image']}</div>
        <div class="product-body">
            <div class="product-stars">★★★★★ <span class="rating-text">{p['rating']}</span></div>
            <div class="product-name">{p['name']}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <span class="best-for-label" style="font-size: 0.7em; padding: 2px 8px; margin-bottom: 0;">{p['best_for']}</span>
                <span class="price-range" style="font-size: 0.85em; font-weight: 700; color: var(--brand-secondary); margin-bottom: 0;">{p['price_range']} 💵</span>
            </div>
            <div class="product-desc" style="font-size: 0.8em; color: #6b7280; margin-bottom: 0.8rem;">{p['desc']}</div>
            <div class="product-price" style="display: none;">{p['price']}</div>
            <div class="dual-cta">
                <a href="/reviews/" class="btn-details">Full Review</a>
                <a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" rel="nofollow noopener sponsored" target="_blank" class="btn-buy">Check Price →</a>
            </div>
        </div>
    </div>"""

def generate_innovation_html(p):
    """
    Generates HTML for a spotlight item
    """
    return f"""
        <div class="spotlight-item">
          <div class="spotlight-icon">{p['image']}</div>
          <div class="spotlight-name">{p['name']}</div>
          <div class="spotlight-desc">{p['desc']}</div>
          <a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" class="btn-spotlight" target="_blank" rel="nofollow noopener sponsored">Discovery Innovation →</a>
        </div>"""

def build_homepage(articles=None, products=None, innovations=None, trending=None):
    template_path = HOMEPAGE_DIR / "index.html"

    if not template_path.exists():
        raise FileNotFoundError(f"Missing template: {template_path}")

    template = read_file(template_path)

    # 1. Inject Dynamic Products (Rotation)
    if products:
        products_html = "".join([generate_product_html(p) for p in products])
        # Replace the content between our stable comment markers
        import re
        grid_pattern = r'(<!-- ROTATED_PRODUCTS_START -->).*?(<!-- ROTATED_PRODUCTS_END -->)'
        template = re.sub(grid_pattern, rf'\1{products_html}\2', template, flags=re.DOTALL)

    # 2. Inject Innovation Spotlight
    if innovations:
        innovation_html = "".join([generate_innovation_html(p) for p in innovations])
        import re
        spotlight_pattern = r'(<div class="spotlight-grid" id="innovation-spotlight">).*?(</div>)'
        template = re.sub(spotlight_pattern, rf'\1{innovation_html}\2', template, flags=re.DOTALL)

    # 3. Inject Trending Products
    if trending:
        trending_html = "".join([generate_product_html(p, force_badge="Trending") for p in trending])
        import re
        trending_pattern = r'(<!-- TRENDING_PRODUCTS_START -->).*?(<!-- TRENDING_PRODUCTS_END -->)'
        template = re.sub(trending_pattern, rf'\1{trending_html}\2', template, flags=re.DOTALL)

    html = template

    # Minify
    html = minify_html_content(html)

    # Output path
    output_path = PUBLIC_DIR / "index.html"
    write_file(output_path, html)

    return html

