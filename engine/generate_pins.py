import json
import os
import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

# Configuration
PRODUCTS_JSON = 'src/lib/data/products.json'
OUTPUT_DIR = 'public/assets/pins'
CANVAS_SIZE = (1000, 1500)
BG_COLOR = (255, 255, 255)
ACCENT_COLOR = (37, 99, 235) # Blue-600
TEXT_COLOR = (15, 23, 42)    # Slate-900

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_pin(product):
    try:
        slug = product['slug']
        title = product['title']
        price = f"${product['vendors'][0]['price']:.2f}"
        img_url = product['images'][0]
        
        print(f"Generating pin for: {title}...")

        # 1. Create Canvas
        canvas = Image.new('RGB', CANVAS_SIZE, BG_COLOR)
        draw = ImageDraw.Draw(canvas)

        # 2. Load Fonts (Windows Path)
        try:
            font_title = ImageFont.truetype("arialbd.ttf", 60)
            font_price = ImageFont.truetype("arialbd.ttf", 80)
            font_brand = ImageFont.truetype("arial.ttf", 40)
        except:
            font_title = ImageFont.load_default()
            font_price = ImageFont.load_default()
            font_brand = ImageFont.load_default()

        # 3. Download & Paste Product Image
        if img_url.startswith('http'):
            response = requests.get(img_url)
            product_img = Image.open(BytesIO(response.content))
        else:
            # Fallback for emoji or local (though we handle emojis differently in UI)
            print(f"Skipping {title} - image is not a URL.")
            return

        # Resize product image to fit (maintain aspect ratio)
        product_img.thumbnail((800, 800))
        img_w, img_h = product_img.size
        canvas.paste(product_img, ((CANVAS_SIZE[0] - img_w) // 2, 400))

        # 4. Add Text Overlays
        # Brand Name
        draw.text((CANVAS_SIZE[0]//2, 100), "NEW GIFTS & GADGETS", fill=ACCENT_COLOR, font=font_brand, anchor="mm")
        
        # Product Title
        # Wrap text if too long
        lines = []
        words = title.split()
        current_line = ""
        for word in words:
            if len(current_line + " " + word) < 25:
                current_line += " " + word
            else:
                lines.append(current_line.strip())
                current_line = word
        lines.append(current_line.strip())
        
        y_offset = 1200
        for line in lines[:2]: # Max 2 lines
            draw.text((CANVAS_SIZE[0]//2, y_offset), line.upper(), fill=TEXT_COLOR, font=font_title, anchor="mm")
            y_offset += 70

        # Price Badge
        badge_w, badge_h = 300, 120
        badge_x = (CANVAS_SIZE[0] - badge_w) // 2
        badge_y = 250
        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=20, fill=ACCENT_COLOR)
        draw.text((CANVAS_SIZE[0]//2, badge_y + badge_h//2), price, fill=(255,255,255), font=font_price, anchor="mm")

        # 5. Save
        output_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
        canvas.save(output_path, "PNG")
        print(f"Successfully saved to {output_path}")

    except Exception as e:
        print(f"Failed to generate pin for {product.get('title', 'Unknown')}: {e}")

def main():
    if not os.path.exists(PRODUCTS_JSON):
        print(f"Error: {PRODUCTS_JSON} not found.")
        return

    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # For testing, just do the first 5
    for product in products[:5]:
        generate_pin(product)

if __name__ == "__main__":
    main()
