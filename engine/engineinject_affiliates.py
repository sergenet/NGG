import re
from pathlib import Path
from bs4 import BeautifulSoup

from utils import PUBLIC_DIR, read_file, write_file

AMAZON_TAG = "sergenet05-20"
CLICKBANK_TID = "sergenet1"


# ---------------------------------------------------------
# AMAZON AFFILIATE LINK HANDLING
# ---------------------------------------------------------

def fix_amazon_links(html: str) -> str:
    """
    Finds all Amazon product URLs and appends ?tag=sergenet05-20
    without duplicating the tag.
    """
    soup = BeautifulSoup(html, "html.parser")

    for a in soup.find_all("a", href=True):
        href = a["href"]

        # Only modify Amazon product links
        if "amazon." in href and "/dp/" in href:
            # Remove existing tag if present
            href = re.sub(r"[?&]tag=[^&]+", "", href)

            # Append affiliate tag
            if "?" in href:
                href += f"&tag={AMAZON_TAG}"
            else:
                href += f"?tag={AMAZON_TAG}"

            a["href"] = href

    return str(soup)


# ---------------------------------------------------------
# CLICKBANK AFFILIATE LINK HANDLING
# ---------------------------------------------------------

def fix_clickbank_links(html: str) -> str:
    """
    Finds ClickBank vendor links and appends ?tid=sergenet1
    without duplicating the tid.
    """
    soup = BeautifulSoup(html, "html.parser")

    for a in soup.find_all("a", href=True):
        href = a["href"]

        # Detect ClickBank hoplinks
        if ".hop.clickbank.net" in href:
            # Remove existing tid if present
            href = re.sub(r"[?&]tid=[^&]+", "", href)

            # Append affiliate tid
            if "?" in href:
                href += f"&tid={CLICKBANK_TID}"
            else:
                href += f"?tid={CLICKBANK_TID}"

            a["href"] = href

    return str(soup)


# ---------------------------------------------------------
# MASTER FUNCTION
# ---------------------------------------------------------

def inject_affiliate_ids_into_html(html: str) -> str:
    """Run all affiliate injection rules."""
    html = fix_amazon_links(html)
    html = fix_clickbank_links(html)
    return html


# ---------------------------------------------------------
# PROCESS ALL HTML FILES IN /public/
# ---------------------------------------------------------

def process_public_html():
    """
    Walks through /public/ and injects affiliate IDs into
    every .html file.
    """
    for path in PUBLIC_DIR.rglob("*.html"):
        html = read_file(path)
        updated = inject_affiliate_ids_into_html(html)
        write_file(path, updated)


if __name__ == "__main__":
    process_public_html()
