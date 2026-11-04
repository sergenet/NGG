"""Audit NewGiftsAndGadgets for pages that promise things the catalog no longer has.

Three checks against the built site in out/:

  1. links     - every internal href resolves to a real file in the build
  2. promises  - page copy naming a product type or brand that is not in the
                 catalog (the Amazon purge left copy behind, the way the guides
                 kept advertising air fryers)
  3. counts    - pages that state a product count or "picks" number that does not
                 match what they actually render

Usage:
    python scripts/audit_catalog_mismatch.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "out"
PRODUCTS = BASE / "src" / "lib" / "data" / "products.json"

# Product types the catalog no longer carries. Each one used to be a real
# recommendation before the Amazon store closed.
DEAD_TERMS = [
    "air fryer", "webcam", "robot vacuum", "roomba", "roborock", "smart bulb",
    "coffee maker", "espresso machine", "blender", "vitamix", "ninja",
    "desk lamp", "monitor light", "power delivery hub", "usb hub", "docking station",
    "mouse", "keyboard", "elgato", "stream deck", "ember", "kindle",
    "noise-canceling headphones", "headphones", "ssd", "portable monitor",
    "smart speaker", "echo dot", "dyson", "anker", "logitech", "keychron",
    "ups battery", "surge protector", "laptop stand", "monitor arm for",
]


def load_products():
    return json.loads(PRODUCTS.read_text(encoding="utf-8"))


def visible_text(html: str) -> str:
    body = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    main = re.search(r"<main.*?</main>", body, re.S)
    seg = main.group(0) if main else body
    text = re.sub(r"<[^>]+>", " ", seg)
    return re.sub(r"\s+", " ", text)


def page_path(rel: Path) -> str:
    parent = rel.parent.as_posix()
    return "/" if parent == "." else f"/{parent}/"


def exists(path: str) -> bool:
    clean = path.split("#")[0].split("?")[0]
    if not clean.startswith("/"):
        return True
    target = OUT / clean.lstrip("/")
    if clean.endswith("/"):
        return (target / "index.html").exists()
    if target.exists():
        return True
    return (OUT / (clean.lstrip("/") + ".html")).exists()


def main() -> int:
    products = load_products()
    slugs = {p["slug"] for p in products}
    titles = {p["title"].lower() for p in products}

    pages = sorted(OUT.rglob("*.html"))
    print(f"built pages: {len(pages)}")

    broken = defaultdict(list)
    dead_promises = defaultdict(set)
    count_claims = []

    for page in pages:
        html = page.read_text(encoding="utf-8", errors="replace")
        path = page_path(page.relative_to(OUT))

        # 1. internal links
        for href in re.findall(r'href="(/[^"#?]*)"', html):
            if href.endswith((".css", ".js", ".png", ".jpg", ".webp", ".svg", ".xml", ".txt", ".ico", ".webmanifest")):
                continue
            if not exists(href):
                broken[path].append(href)

        # 2. copy naming things the catalog does not have
        text = visible_text(html).lower()
        if "/admin" in path:
            continue
        for term in DEAD_TERMS:
            if term in text:
                dead_promises[path].add(term)

        # 3. stated counts
        for m in re.finditer(r"(\d+)\s+(?:picks|products|finds)\b", text):
            claimed = int(m.group(1))
            shown = len({s for s in re.findall(r'href="/product/([a-z0-9-]+)/"', html)})
            if claimed != shown:
                count_claims.append((path, claimed, shown))

    print(f"\n=== broken internal links: {sum(len(v) for v in broken.values())} on {len(broken)} pages ===")
    for page, hrefs in sorted(broken.items()):
        print(f"  {page}")
        for h in sorted(set(hrefs))[:6]:
            print(f"      {h}")

    print(f"\n=== pages naming products the catalog does not carry: {len(dead_promises)} ===")
    freq = Counter()
    for page, terms in dead_promises.items():
        for t in terms:
            freq[t] += 1
    for term, n in freq.most_common(40):
        print(f"  {n:3d}  {term}")

    print(f"\n=== stated count != rendered count: {len(count_claims)} ===")
    for path, claimed, shown in count_claims:
        print(f"  {path:<52} says {claimed}, renders {shown}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
