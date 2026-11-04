#!/usr/bin/env python3
"""Generate per-section social cards for newgiftsandgadgets.com.

Every non-product page used to advertise the same `default-thumbnail.png`, so
every Facebook/Twitter/iMessage share of a gift guide, a category page and the
homepage looked identical. These cards reuse that brand artwork and add a
section banner, so a share now says which part of the site it came from.

Output: public/social/*.png at 1200x630 (the og:image standard).
Run from the site root:  python tools/make-social-cards.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent.parent
SOURCE = BASE / "public" / "default-thumbnail.png"
OUT = BASE / "public" / "social"

W, H = 1200, 630
BANNER_H = 104
NAVY = (24, 35, 29)
CREAM = (254, 247, 238)
ACCENT = (247, 198, 185)

FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_REG = "C:/Windows/Fonts/arial.ttf"

CARDS = {
    "home": ("Useful gifts. Clever gadgets.", "newgiftsandgadgets.com"),
    "shop": ("Shop by category", "newgiftsandgadgets.com/shop"),
    "gift-guides": ("Gift guides", "newgiftsandgadgets.com/gift-guides"),
    "gifts": ("Gifts by recipient", "newgiftsandgadgets.com/gifts"),
    "about": ("About NewGiftsAndGadgets", "newgiftsandgadgets.com/about"),
}


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def build(art: Image.Image, title: str, subtitle: str) -> Image.Image:
    card = art.copy()

    draw = ImageDraw.Draw(card)
    draw.rectangle([0, H - BANNER_H, W, H], fill=NAVY)

    # accent rule above the banner
    draw.rectangle([0, H - BANNER_H - 4, 180, H - BANNER_H], fill=ACCENT)

    title_font = load_font(FONT_BOLD, 30)
    sub_font = load_font(FONT_REG, 21)

    draw.text((48, H - BANNER_H + 24), title, font=title_font, fill=CREAM)
    sub_w = draw.textlength(subtitle, font=sub_font)
    draw.text((W - 48 - sub_w, H - BANNER_H + 32), subtitle, font=sub_font, fill=(196, 205, 199))

    return card


def main():
    if not SOURCE.is_file():
        raise SystemExit(f"brand card not found: {SOURCE}")

    art = Image.open(SOURCE).convert("RGB")
    # Cover-fit to 1200x630 without distorting the artwork.
    ratio = max(W / art.width, H / art.height)
    art = art.resize((round(art.width * ratio), round(art.height * ratio)), Image.LANCZOS)
    left = (art.width - W) // 2
    top = (art.height - H) // 2
    art = art.crop((left, top, left + W, top + H))

    OUT.mkdir(parents=True, exist_ok=True)
    for name, (title, subtitle) in CARDS.items():
        path = OUT / f"{name}.png"
        build(art, title, subtitle).save(path, optimize=True)
        print(f"  {path.relative_to(BASE)}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
