import re
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


# ---------------------------------------------------------
# LOAD CATEGORY TEMPLATE
# ---------------------------------------------------------

def load_category_template(category_slug: str) -> str:
    """
    Loads the category template from categories/<slug>.html
    """
    template_path = REDESIGN_DIR / "categories" / f"{category_slug}.html"
    return read_file(template_path)


# ---------------------------------------------------------
# INJECT ARTICLE LIST INTO CATEGORY PAGE
# ---------------------------------------------------------

def inject_articles_into_category(html: str, articles: list) -> str:
    """
    Inserts article list into <div id="category-articles"></div> using string manipulation.
    """
    articles_html = ""
    for article in articles:
        articles_html += f"""
        <div class="category-article">
            <h3>{article["title"]}</h3>
            <a href="{article["url"]}">Read more</a>
        </div>"""

    # Replace the placeholder div
    # Support both <div id="category-articles"></div> and <div id="category-articles"> ... </div>
    new_html = re.sub(
        r'(<div id="category-articles"[^>]*>)(.*?)(</div>)',
        fr'\g<1>{articles_html}\g<3>',
        html,
        flags=re.DOTALL
    )
    return new_html


from content_helpers import generate_breadcrumb_html, get_breadcrumb_schema, get_faq_schema

# ---------------------------------------------------------
# BUILD CATEGORY PAGE
# ---------------------------------------------------------

def generate_category_product_html(p):
    """
    Generates HTML for a product card on a category page.
    Matches the redesign-v1 / categories/*.html style.
    """
    import random
    badges = ["badge--pick", "badge--value", "badge--premium"]
    badge_type = random.choice(badges)
    badge_labels = {
        "badge--pick": "Editor's Pick",
        "badge--value": "Best Value",
        "badge--premium": "Premium Selection"
    }
    badge_label = badge_labels[badge_type]

    # Alt text is product name
    alt_text = f"{p['name']} review and best price"

    return f"""
        <div class="card product-card">
          <span class="product-badge {badge_type}">{badge_label}</span>
          <div class="product-card__image" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 3rem;" title="{alt_text}">{p['image']}</div>
          <div class="product-card__body">
            <div class="product-card__rating"><span class="stars">★★★★★</span><span>{p['rating']}</span></div>
            <h4 class="product-card__title">{p['name']}</h4>
            <div class="product-card__desc" style="font-size: 0.8em; color: #6b7280; margin-bottom: 0.8rem;">{p['desc']}</div>
            <div class="product-card__price">{p['price']}</div>
            <div class="dual-cta">
              <a href="/reviews/" class="btn-details">Full Review</a>
              <a href="https://www.amazon.com/dp/{p['asin']}?tag=sergenet05-20" class="btn-buy" rel="nofollow noopener sponsored" target="_blank">Check Price →</a>
            </div>
          </div>
        </div>"""


def build_category_page(category_name: str, articles: list, products: list = None):
    """
    Builds a category page using its template.
    """
    category_slug = slugify(category_name)
    html = load_category_template(category_slug)

    # 0. Inject Sticky Category Filter (Mobile)
    categories = [
        ("Home Office", "/home-office/"),
        ("Smart Home", "/smart-home/"),
        ("Kitchen", "/kitchen/"),
        ("Gift Guides", "/gift-guides/")
    ]
    filter_html = '<div class="sticky-category-filter">'
    for name, url in categories:
        active_class = "active" if name == category_name else ""
        filter_html += f'<a href="{url}" class="{active_class}">{name}</a>'
    filter_html += '</div>'
    
    # Inject after <nav> or at the start of body
    html = html.replace('<body id="top">', f'<body id="top">{filter_html}')

    # 1. Breadcrumbs
    breadcrumb_items = [("Home", "/"), (category_name, f"/{category_slug}/")]
    breadcrumb_html = generate_breadcrumb_html(breadcrumb_items)
    breadcrumb_schema = get_breadcrumb_schema(breadcrumb_items)
    
    # Inject breadcrumbs into any <div class="container">...</div> that precedes the <h1>
    # Or just replace a placeholder if it exists.
    # We'll use a regex to look for the first <h1> and prepending the breadcrumbs to its parent or container.
    # In our templates, it's usually inside <div class="container"> above <h1>
    breadcrumb_pattern = r'(<div class="container">)(\s*)(<span class="tag tag--office".*?</span>\s*|)(<h1>)'
    html = re.sub(breadcrumb_pattern, rf'\1\2{breadcrumb_html}\2\3\4', html, flags=re.DOTALL)

    # 2. Inject article list
    html = inject_articles_into_category(html, articles)

    # 3. Inject Dynamic Products (Rotation)
    if products:
        products_html = "".join([generate_category_product_html(p) for p in products])
        grid_pattern = r'(<!-- ROTATED_PRODUCTS_START -->).*?(<!-- ROTATED_PRODUCTS_END -->)'
        html = re.sub(grid_pattern, rf'\1{products_html}\2', html, flags=re.DOTALL)

    # 4. JSON-LD Schema (FAQ + Breadcrumb)
    faq_schema = get_faq_schema(category_slug)
    combined_schema = [breadcrumb_schema]
    if faq_schema: combined_schema.append(faq_schema)

    # 5. SEO
    url = f"https://newgiftsandgadgets.com/{category_slug}/"
    final_html = apply_seo(
        html,
        title=f"{category_name} — NewGiftsAndGadgets",
        description=f"Explore the best articles and gadgets in the {category_name} category.",
        url=url,
        schema_data={"@context": "https://schema.org", "@graph": combined_schema}
    )

    # Minify
    final_html = minify_html_content(final_html)

    # Save output
    output_path = PUBLIC_DIR / category_slug / "index.html"
    write_file(output_path, final_html)


if __name__ == "__main__":
    # Example usage
    sample_articles = [
        {"title": "Best Smart Lights 2026", "url": "/smart-home/best-smart-lights-2026/"},
        {"title": "Top Smart Plugs for Home Automation", "url": "/smart-home/smart-plugs-automation/"},
    ]

    build_category_page("Smart Home", sample_articles)
