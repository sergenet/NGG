import re
import random
import datetime
from pathlib import Path

from utils import (
    REDESIGN_DIR,
    PUBLIC_DIR,
    read_file,
    write_file,
    ensure_dir,
    slugify
)
from seo_tools import apply_seo
from minify import minify_html_content
from content_helpers import generate_breadcrumb_html, get_breadcrumb_schema, get_article_schema, get_product_schema
from products_data import PRODUCTS_POOL

# ---------------------------------------------------------
# LOAD ARTICLE TEMPLATE
# ---------------------------------------------------------

def load_article_template() -> str:
    template_path = REDESIGN_DIR / "templates" / "article.html"
    return read_file(template_path)

# ---------------------------------------------------------
# CONVERSION COMPONENTS (WEEK 3)
# ---------------------------------------------------------

def generate_summary_box_html(product_asins: list) -> str:
    if not product_asins or len(product_asins) < 1: return ""
    
    prods = []
    # Identify Top, Budget, and Premium picks
    for cat in PRODUCTS_POOL:
        for p in PRODUCTS_POOL[cat]:
            if p['asin'] in product_asins:
                prods.append(p)
    
    if not prods: return ""
    
    # Simple logic for picks
    top_pick = prods[0]
    budget_pick = sorted(prods, key=lambda x: len(x.get('price_range', '$')))[0]
    premium_pick = sorted(prods, key=lambda x: len(x.get('price_range', '$')), reverse=True)[0]
    
    # Avoid duplicates in the UI if only one product
    picks = [("Top Overall Pick", top_pick)]
    if len(prods) > 1 and budget_pick['asin'] != top_pick['asin']:
        picks.append(("Best Value", budget_pick))
    if len(prods) > 2 and premium_pick['asin'] != top_pick['asin'] and premium_pick['asin'] != budget_pick['asin']:
        picks.append(("Premium Choice", premium_pick))

    html = '<div class="summary-box"><h3 class="summary-title"><i class="fas fa-bolt"></i> Quick Answer: Our Top Picks</h3><div class="summary-grid">'
    for label, p in picks:
        html += f"""
        <div class="summary-item">
            <span class="summary-label">{label}</span>
            <span class="summary-name">{p['name']}</span>
            <a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" class="table-check-btn" rel="sponsored nofollow">Check Price</a>
        </div>
        """
    html += '</div></div>'
    return html

def generate_comparison_table_html(product_asins: list) -> str:
    if not product_asins or len(product_asins) < 2: return ""
    
    prods = []
    for asin in product_asins[:5]: # Up to 5
        for cat in PRODUCTS_POOL:
            for p in PRODUCTS_POOL[cat]:
                if p['asin'] == asin:
                    prods.append(p)
                    break
    
    if len(prods) < 2: return ""

    html = '<div class="comparison-table-wrapper"><table class="comparison-table"><thead><tr>'
    html += '<th>Product</th><th>Best For</th><th>Price</th><th>Rating</th><th>Action</th>'
    html += '</tr></thead><tbody>'
    
    for i, p in enumerate(prods):
        is_top = (i == 0)
        row_class = ' class="premium-highlight"' if is_top else ""
        badge = '<span class="table-badge">Editor\'s Choice</span><br>' if is_top else ""
        
        # Determine price indicator ($ to $$$$)
        price_range = p.get('price_range', '$$')
        
        html += f"""
        <tr{row_class}>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="table-product-img" style="font-size: 1.5rem;">{p.get('image', '🎁')}</span>
                    <div>{badge}<span class="table-product-name" style="font-weight: 700; font-size: 0.85rem;">{p['name']}</span></div>
                </div>
            </td>
            <td><span style="font-size: 0.8rem; color: #475569;">{p.get('best_for', 'General Use')}</span></td>
            <td><span class="price-indicator">{price_range}</span></td>
            <td><span style="color: #fbbf24; font-weight: 700;">★ {p['rating']}</span></td>
            <td><a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" class="table-check-btn" rel="sponsored nofollow" style="font-size: 0.75rem;">View Deal</a></td>
        </tr>
        """
    html += '</tbody></table></div>'
    return html

# ---------------------------------------------------------
# BUILD ARTICLE HTML
# ---------------------------------------------------------

def build_article_html(title: str, body_html: str, category_slug: str = None, all_articles: list = None, product_asins: list = None) -> str:
    template = load_article_template()
    html = template
    
    # 0a. Quick Summary Box
    if product_asins:
        summary_html = generate_summary_box_html(product_asins)
        html = html.replace(
            "<!-- QUICK_SUMMARY_START --><!-- QUICK_SUMMARY_END -->",
            f"<!-- QUICK_SUMMARY_START -->{summary_html}<!-- QUICK_SUMMARY_END -->"
        )

    # 0b. Comparison Table Injection
    if product_asins:
        comp_html = generate_comparison_table_html(product_asins)
        html = html.replace(
            "<!-- COMPARISON_TABLE_START --><!-- COMPARISON_TABLE_END -->",
            f"<!-- COMPARISON_TABLE_START -->{comp_html}<!-- COMPARISON_TABLE_END -->"
        )

    # 1. Breadcrumbs
    if category_slug:
        cat_name = category_slug.replace('-', ' ').title()
        breadcrumb_items = [("Home", "/"), (cat_name, f"/{category_slug}/"), (title, "#")]
        breadcrumb_html = generate_breadcrumb_html(breadcrumb_items)
        html = html.replace(
            "<!-- BREADCRUMBS_START --><!-- BREADCRUMBS_END -->",
            f"<!-- BREADCRUMBS_START -->{breadcrumb_html}<!-- BREADCRUMBS_END -->"
        )

    # 2. Title
    html = re.sub(
        r'(<h1 id="article-title"[^>]*>)(.*?)(</h1>)',
        fr'\g<1>{title}\g<3>',
        html,
        flags=re.DOTALL
    )

    # 3. Body
    html = html.replace(
        "<!-- ARTICLE_BODY_START --><!-- ARTICLE_BODY_END -->",
        f"<!-- ARTICLE_BODY_START -->{body_html}<!-- ARTICLE_BODY_END -->"
    )


    # 4. Last Updated timestamp token
    current_date = datetime.datetime.now().strftime("%B %Y")
    html = html.replace("{{LAST_UPDATED}}", current_date)

    # 5. Related Articles cross-linking
    if all_articles and category_slug:
        related_pages = [a for a in all_articles if category_slug in a.get('url', '') and a['title'] != title][:2]
        if related_pages:
            related_html = '<div class="related-articles-section" style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid #f3f4f6;">'
            related_html += f'<h3 style="color: var(--brand-primary); margin-bottom: 1.5rem;">Read more in-depth {category_slug.replace("-", " ").title()} reviews:</h3><ul>'
            for r in related_pages:
                related_html += f'<li style="margin-bottom: 0.5rem;"><a href="{r["url"]}" style="color: #185a9d; font-weight: 600;">{r["title"]} →</a></li>'
            related_html += '</ul></div>'
            html = html.replace(
                "<!-- RELATED_START --><!-- RELATED_END -->",
                f"<!-- RELATED_START -->{related_html}<!-- RELATED_END -->"
            )

    # 6. Related Products (Dynamic Cross-Linking) 
    if category_slug in PRODUCTS_POOL:
        pool = PRODUCTS_POOL[category_slug]
        # Keep it random for each build
        related_prods = random.sample(pool, min(len(pool), 3))
        if related_prods:
            cross_link_html = '<div class="more-finds" style="margin-top: 3rem; background: #f9fafb; padding: 2rem; border-radius: 12px;">'
            cross_link_html += f'<h3 style="margin-top: 0;">More Top Rated {category_slug.replace("-", " ").title()} Finds:</h3><div class="row">'
            for p in related_prods:
                cross_link_html += f"""
                <div class="col-md-4" style="margin-bottom: 1rem;">
                    <div class="mini-card" style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); height: 100%;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">{p.get('image', '🎁')}</div>
                        <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">{p['name']}</h4>
                        <a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" class="btn-affiliate" style="padding: 6px 12px; font-size: 0.8em;">🛒 View Deal</a>
                    </div>
                </div>
                """
            cross_link_html += '</div></div>'
            html = html.replace("<!-- RELATED_START -->", f"<!-- RELATED_START -->{cross_link_html}")

    # 7. SEO title
    html = re.sub(
        r'(<title id="article-title-seo"[^>]*>)(.*?)(</title>)',
        fr'\g<1>{title} — NewGiftsAndGadgets\g<3>',
        html,
        flags=re.DOTALL
    )

    # 8. Canonical URL
    if category_slug:
        canonical_url = f"https://newgiftsandgadgets.com/{category_slug}/{slugify(title)}/"
    else:
        canonical_url = f"https://newgiftsandgadgets.com/{slugify(title)}/"
    html = html.replace(
        'href="https://newgiftsandgadgets.com/" id="canonical-url"',
        f'href="{canonical_url}" id="canonical-url"'
    )

    # 9. Open Graph tags
    seo_desc = f"Learn about {title} — expert picks, reviews, and recommendations."
    html = html.replace(
        'content="Article — NewGiftsAndGadgets" id="og-title"',
        f'content="{title} — NewGiftsAndGadgets" id="og-title"'
    )
    # Update og:title attribute order variant
    html = html.replace(
        'id="og-title" content="Article — NewGiftsAndGadgets"',
        f'id="og-title" content="{title} — NewGiftsAndGadgets"'
    )
    html = html.replace(
        'id="og-description" content="Research-based buying guides and curated gift ideas."',
        f'id="og-description" content="{seo_desc}"'
    )
    html = html.replace(
        'id="og-url" content="https://newgiftsandgadgets.com/"',
        f'id="og-url" content="{canonical_url}"'
    )

    return html

# ---------------------------------------------------------
# GENERATE ARTICLE
# ---------------------------------------------------------

def generate_article(title: str, body_html: str, category_slug: str = None, all_articles: list = None, product_asins: list = None):
    slug = slugify(title)
    
    if category_slug:
        url_path = f"/{category_slug}/{slug}/"
        output_dir = PUBLIC_DIR / category_slug / slug
    else:
        url_path = f"/{slug}/"
        output_dir = PUBLIC_DIR / slug

    url = f"https://newgiftsandgadgets.com{url_path}"
    html = build_article_html(title, body_html, category_slug, all_articles, product_asins)
    
    # Update Sticky CTA if products exist
    if product_asins:
        top_asin = product_asins[0]
        top_prod = None
        for cat in PRODUCTS_POOL:
            for p in PRODUCTS_POOL[cat]:
                if p['asin'] == top_asin:
                    top_prod = p
                    break
        if top_prod:
            html = html.replace('Top Choice: Ready to Buy?', f'Top Choice: {top_prod["name"]}')
            html = html.replace(
                'href="#" class="table-check-btn" id="sticky-cta-link">Check Best Price',
                f'href="https://www.amazon.com/dp/{top_asin}?tag=sergenet05-20" class="table-check-btn" id="sticky-cta-link" rel="nofollow noopener sponsored" target="_blank">Check Best Price'
            )

    # 1. Base Article Schema
    article_schema = get_article_schema(title, f"Expert guide and review of {title}.", url)
    
    # 2. Combined Graph
    graph_data = [article_schema]
    
    # 3. Add Component Product Schemas
    if product_asins:
        for asin in product_asins:
            # Reconstruct product from pool
            found_prod = None
            for cat in PRODUCTS_POOL:
                for p in PRODUCTS_POOL[cat]:
                    if p['asin'] == asin:
                        found_prod = p
                        break
            if found_prod:
                graph_data.append(get_product_schema(found_prod))

    # 4. Breadcrumb Schema
    if category_slug:
        cat_name = category_slug.replace('-', ' ').title()
        graph_data.append(get_breadcrumb_schema([("Home", "/"), (cat_name, f"/{category_slug}/"), (title, url_path)]))

    # Apply SEO
    final_html = apply_seo(
        html,
        title=title,
        description=f"Learn about {title} — expert picks, reviews, and recommendations.",
        url=url,
        schema_data={"@context": "https://schema.org", "@graph": graph_data}
    )

    final_html = minify_html_content(final_html)
    ensure_dir(output_dir)
    write_file(output_dir / "index.html", final_html)

    return {
        "title": title,
        "slug": slug,
        "url": url_path
    }


if __name__ == "__main__":
    # Example usage
    sample_body = """
    <p>Smart home gadgets are evolving fast. Here are the top picks for 2026.</p>
    <ul>
        <li>Smart Lights</li>
        <li>AI Coffee Makers</li>
        <li>Voice-Controlled Plugs</li>
    </ul>
    """

    generate_article("10 Best Smart Home Gadgets", sample_body)
