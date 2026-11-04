import json
import sys
from pathlib import Path

# Add engine to path to import products_data
sys.path.append(str(Path("c:/newgiftsandgadgets.com/engine")))
from products_data import PRODUCTS_POOL

def get_all_valid_asins():
    asins = set()
    for cat in PRODUCTS_POOL:
        for p in PRODUCTS_POOL[cat]:
            asins.add(p['asin'])
    return asins

def check_queue():
    queue_path = Path("c:/newgiftsandgadgets.com/engine/article_queue.json")
    with open(queue_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    valid_asins = get_all_valid_asins()
    missing = set()
    
    for item in data['queue']:
        for asin in item.get('product_asins', []):
            if asin not in valid_asins:
                missing.add(asin)
    
    return missing

if __name__ == "__main__":
    missing = check_queue()
    print("Missing ASINs:")
    for m in missing:
        print(m)
