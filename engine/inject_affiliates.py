import re
from pathlib import Path
from utils import PUBLIC_DIR, read_file, write_file

AMAZON_TAG = "sergenet05-20"
CLICKBANK_TID = "sergenet1"

# ---------------------------------------------------------
# AFFILIATE LINK HANDLING (Dependency-Free)
# ---------------------------------------------------------

def inject_affiliate_ids_into_html(html: str) -> str:
    """
    Finds all links and appends affiliate tags using regex to avoid BeautifulSoup dependency.
    """
    
    def replace_href(match):
        prefix = match.group(1)   # e.g. <a class="btn"
        href = match.group(3)     # e.g. http://amazon.com/dp/123
        suffix = match.group(4)   # e.g. >
        
        # Check if it's an external link
        is_external = href.startswith("http") and "newgiftsandgadgets.com" not in href
        is_affiliate = "amazon." in href or ".hop.clickbank.net" in href

        # 1. Handle affiliate Amazon product links
        if "amazon." in href and "/dp/" in href:
            # Remove existing tag if present
            href = re.sub(r"[?&]tag=[^&]+", "", href)
            # Append affiliate tag
            sep = "&" if "?" in href else "?"
            href += f"{sep}tag={AMAZON_TAG}"

        # 2. Handle ClickBank hoplinks
        elif ".hop.clickbank.net" in href:
            # Remove existing tid if present
            href = re.sub(r"[?&]tid=[^&]+", "", href)
            # Append affiliate tid
            sep = "&" if "?" in href else "?"
            href += f"{sep}tid={CLICKBANK_TID}"

        # 3. Add target="_blank" and rel attributes for external/affiliate links
        if is_external:
            # Add target="_blank" if not present
            if 'target=' not in prefix and 'target=' not in suffix:
                suffix = f' target="_blank"{suffix}'
            
            # Add/Standardize rel attribute
            rel_attr = 'rel="nofollow noopener sponsored"' if is_affiliate else 'rel="noopener"'
            if 'rel=' in prefix or 'rel=' in suffix:
                # Remove existing rel
                prefix = re.sub(r'\s+rel=(["\']).*?\1', "", prefix)
                suffix = re.sub(r'\s+rel=(["\']).*?\1', "", suffix)
            
            suffix = f' {rel_attr}{suffix}'

        return f'{prefix} href="{href}"{suffix}'

    # Regex to find all <a href="..."> tags
    # Supports both double and single quotes
    pattern = r'(<a[^>]*?)\s+href=(["\'])(.*?)\2([^>]*?>)'
    updated_html = re.sub(pattern, replace_href, html, flags=re.IGNORECASE | re.DOTALL)
    
    return updated_html


def process_public_html():
    """
    Walks through /public/ and injects affiliate IDs into every .html file.
    """
    print("Injecting affiliate links ...")
    for path in PUBLIC_DIR.rglob("*.html"):
        html = read_file(path)
        updated = inject_affiliate_ids_into_html(html)
        write_file(path, updated)


if __name__ == "__main__":
    process_public_html()
