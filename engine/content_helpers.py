# content_helpers.py
import datetime
from seo_config import GLOBAL_SEO, CATEGORY_FAQS

def generate_breadcrumb_html(items: list) -> str:
    """
    Generates HTML for breadcrumbs.
    items: list of (label, url) tuples
    """
    if not items: return ""
    
    html = '<div class="breadcrumbs">'
    for i, (label, url) in enumerate(items):
        if i > 0:
            html += ' <span>›</span> '
        if i == len(items) - 1:
            html += f'<strong>{label}</strong>'
        else:
            html += f'<a href="{url}">{label}</a>'
    html += '</div>'
    return html

def get_breadcrumb_schema(items: list) -> dict:
    """
    Generates JSON-LD BreadcrumbList schema.
    """
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": []
    }
    
    for i, (label, url) in enumerate(items):
        full_url = f"https://newgiftsandgadgets.com{url}" if url.startswith("/") else url
        schema["itemListElement"].append({
            "@type": "ListItem",
            "position": i + 1,
            "name": label,
            "item": full_url
        })
    
    return schema

def get_faq_schema(category_slug: str) -> dict:
    """
    Returns FAQPage schema for a category.
    """
    faqs = CATEGORY_FAQS.get(category_slug, [])
    if not faqs: return None
    
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    }
    
    for item in faqs:
        schema["mainEntity"].append({
            "@type": "Question",
            "name": item["question"],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item["answer"]
            }
        })
    
    return schema

def get_article_schema(title: str, description: str, url: str, date_iso: str = None) -> dict:
    """
    Returns Article schema.
    """
    if not date_iso:
        date_iso = datetime.datetime.now().strftime("%Y-%m-%d")
        
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "author": {
            "@type": "Person",
            "name": GLOBAL_SEO["author_name"]
        },
        "publisher": {
            "@type": "Organization",
            "name": GLOBAL_SEO["site_name"],
            "logo": {
                "@type": "ImageObject",
                "url": GLOBAL_SEO["logo_url"]
            }
        },
        "datePublished": date_iso,
        "dateModified": date_iso,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    }
def get_product_schema(product: dict) -> dict:
    """
    Returns Schema.org Product markup.
    """
    # Clean price string (remove $ and ,)
    price_val = product.get("price", "0").replace("$", "").replace(",", "")
    
    return {
        "@type": "Product",
        "name": product["name"],
        "description": product.get("desc", ""),
        "sku": product["asin"],
        "mpn": product["asin"],
        "brand": {
            "@type": "Brand",
            "name": product.get("best_for", "Top Pick")
        },
        "offers": {
            "@type": "Offer",
            "url": f"https://www.amazon.com/dp/{product['asin']}?tag=sergenet05-20",
            "priceCurrency": "USD",
            "price": price_val,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        # Note: aggregateRating omitted per Google guidelines —
        # only include when backed by real user review data.
        # To re-enable, integrate Amazon Product Advertising API
        # for actual review counts.
    }
