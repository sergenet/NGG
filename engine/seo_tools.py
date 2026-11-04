# seo_tools.py
# Pure-Python SEO helpers, no external libraries.

from typing import Optional

def _ensure_head(html: str) -> str:
    """Make sure there is a <head>...</head> block."""
    lower = html.lower()
    if "<head" in lower and "</head>" in lower:
        return html

    # If there's an <html>, inject head after it
    idx_html = lower.find("<html")
    if idx_html != -1:
        idx_html_end = lower.find(">", idx_html)
        if idx_html_end != -1:
            return html[:idx_html_end+1] + "\n<head></head>" + html[idx_html_end+1:]

    # Otherwise, wrap whole doc
    return "<html><head></head><body>" + html + "</body></html>"


def _inject_into_head(html: str, snippet: str) -> str:
    """Insert snippet before </head>."""
    lower = html.lower()
    idx = lower.rfind("</head>")
    if idx == -1:
        # No head? Ensure then retry
        html = _ensure_head(html)
        lower = html.lower()
        idx = lower.rfind("</head>")
        if idx == -1:
            # Still no head, just prepend
            return snippet + html
    return html[:idx] + snippet + html[idx:]


def apply_meta_tags(html: str, title: str, description: str, url: Optional[str] = None) -> str:
    html = _ensure_head(html)

    tags = []
    if title:
        tags.append(f"<title>{title}</title>")
        tags.append(f'<meta name="title" content="{title}">')
    if description:
        tags.append(f'<meta name="description" content="{description}">')
    if url:
        tags.append(f'<link rel="canonical" href="{url}">')

    snippet = "\n" + "\n".join(tags) + "\n"
    return _inject_into_head(html, snippet)


def apply_open_graph_tags(html: str, title: str, description: str, url: Optional[str] = None) -> str:
    tags = []
    if title:
        tags.append(f'<meta property="og:title" content="{title}">')
    if description:
        tags.append(f'<meta property="og:description" content="{description}">')
    if url:
        tags.append(f'<meta property="og:url" content="{url}">')
    tags.append('<meta property="og:type" content="article">')

    snippet = "\n" + "\n".join(tags) + "\n"
    return _inject_into_head(html, snippet)


def apply_twitter_tags(html: str, title: str, description: str, url: Optional[str] = None) -> str:
    tags = [
        '<meta name="twitter:card" content="summary_large_image">'
    ]
    if title:
        tags.append(f'<meta name="twitter:title" content="{title}">')
    if description:
        tags.append(f'<meta name="twitter:description" content="{description}">')
    if url:
        tags.append(f'<meta name="twitter:url" content="{url}">')

    snippet = "\n" + "\n".join(tags) + "\n"
    return _inject_into_head(html, snippet)


def apply_json_ld(html: str, schema_data: dict) -> str:
    """
    Serializes a dict to JSON and injects as a <script type="application/ld+json"> into <head>.
    """
    import json
    json_str = json.dumps(schema_data, indent=2, ensure_ascii=False)
    snippet = f'\n<script type="application/ld+json">\n{json_str}\n</script>\n'
    return _inject_into_head(html, snippet)


def apply_seo(html: str, title: str, description: str, url: Optional[str] = None, schema_data: Optional[dict] = None) -> str:
    """
    High-level SEO application:
    - basic meta
    - Open Graph
    - Twitter
    - JSON-LD Schema (optional)
    """
    html = apply_meta_tags(html, title, description, url)
    html = apply_open_graph_tags(html, title, description, url)
    html = apply_twitter_tags(html, title, description, url)
    
    if schema_data:
        html = apply_json_ld(html, schema_data)
        
    return html
