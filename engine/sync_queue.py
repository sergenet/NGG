import os
import re
import json
from pathlib import Path

# Paths
BASE_DIR = Path('c:/newgiftsandgadgets.com')
DRAFTS_DIR = BASE_DIR / "content" / "drafts"
QUEUE_FILE = BASE_DIR / "engine" / "article_queue.json"
NEXT_QUEUE_FILE = BASE_DIR / "src" / "lib" / "data" / "articles.json"

def ensure_dir(path):
    path.mkdir(parents=True, exist_ok=True)

def parse_markdown(filepath):
    content = filepath.read_text(encoding='utf-8')
    
    # Parse frontmatter
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not frontmatter_match:
        print(f"Skipping {filepath.name}: No frontmatter found.")
        return None
        
    frontmatter = frontmatter_match.group(1)
    body_md = frontmatter_match.group(2).strip()
    
    data = {}
    for line in frontmatter.split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key == 'asins':
                # Convert string "[B01, B02]" to list
                val = val.strip('[]').replace('"', '').replace("'", "")
                data[key] = [v.strip() for v in val.split(',') if v.strip()]
            else:
                data[key] = val
                
    # Convert body markdown to HTML (basic implementation)
    body_html = ""
    for paragraph in body_md.split('\n\n'):
        p = paragraph.strip()
        if not p:
            continue
        p = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', p)
        p = re.sub(r'\*(.*?)\*', r'<em>\1</em>', p)
        # Lists
        if p.startswith('- '):
            list_items = [f"<li>{item[2:].strip()}</li>" for item in p.split('\n') if item.startswith('- ')]
            body_html += "<ul>" + "".join(list_items) + "</ul>"
        else:
            body_html += f"<p>{p}</p>"

    data['body_intro'] = body_html
    return data

def sync_queue():
    print("Syncing Drafts to Queue...")
    ensure_dir(DRAFTS_DIR)
    
    if not QUEUE_FILE.exists():
        queue_data = {"queue": []}
    else:
        with open(QUEUE_FILE, 'r', encoding='utf-8') as f:
            queue_data = json.load(f)
            
    existing_titles = {item["title"]: idx for idx, item in enumerate(queue_data["queue"])}
    updated_count = 0
    added_count = 0
    
    for md_file in DRAFTS_DIR.glob('*.md'):
        data = parse_markdown(md_file)
        if not data:
            continue
            
        required_keys = ['title', 'category', 'asins']
        if not all(k in data for k in required_keys):
            print(f"Skipping {md_file.name}: Missing required frontmatter fields.")
            continue
            
        article_entry = {
            "title": data["title"],
            "category_slug": data["category"],
            "product_asins": data["asins"],
            "body_intro": data["body_intro"],
            "status": "published" # By default, moving to queue publishes it
        }
        
        if data["title"] in existing_titles:
            idx = existing_titles[data["title"]]
            queue_data["queue"][idx] = article_entry
            updated_count += 1
            print(f"Updated: {data['title']}")
        else:
            queue_data["queue"].append(article_entry)
            added_count += 1
            print(f"Added: {data['title']}")
            
    with open(QUEUE_FILE, 'w', encoding='utf-8') as f:
        json.dump(queue_data, f, indent=2)
        
    # Also sync to Next.js data directory
    next_data_dir = NEXT_QUEUE_FILE.parent
    ensure_dir(next_data_dir)
    with open(NEXT_QUEUE_FILE, 'w', encoding='utf-8') as f:
        json.dump(queue_data, f, indent=2)
        
    print(f"Sync Complete: {added_count} added, {updated_count} updated. Synced to Next.js: {NEXT_QUEUE_FILE}")

if __name__ == "__main__":
    sync_queue()
