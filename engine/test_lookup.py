from products_data import PRODUCTS_POOL

def test_lookup(asin):
    found = False
    for cat in PRODUCTS_POOL:
        for p in PRODUCTS_POOL[cat]:
            if p['asin'] == asin:
                print(f"FOUND {asin} in {cat}: {p['name']}")
                found = True
                break
    if not found:
        print(f"NOT FOUND: {asin}")

asins_to_check = ["B000X99XW8", "B07H8A1K6P", "B089BBRN5S", "B0CSZ7WBYW"]
for a in asins_to_check:
    test_lookup(a)
