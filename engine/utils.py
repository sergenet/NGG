import os
import re
import json
from pathlib import Path

# ---------------------------------------------------------
# PATH HELPERS
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
REDESIGN_DIR = BASE_DIR
PUBLIC_DIR = BASE_DIR / "public"
ASSETS_DIR = BASE_DIR / "assets"
TEMPLATES_DIR = BASE_DIR / "templates"
HOMEPAGE_DIR = BASE_DIR / "homepage"


def ensure_dir(path: Path):
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)


def wipe_directory(path: Path):
    """Delete all files and folders inside a directory."""
    if not path.exists():
        return
    for item in path.iterdir():
        if item.is_file():
            item.unlink()
        else:
            wipe_directory(item)
            item.rmdir()


# ---------------------------------------------------------
# FILE HELPERS
# ---------------------------------------------------------

def read_file(path: Path) -> str:
    """Read a text file safely."""
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="ignore")


def write_file(path: Path, content: str):
    """Write text to a file, creating directories if needed."""
    ensure_dir(path.parent)
    path.write_text(content, encoding="utf-8")


def copy_file(src: Path, dest: Path):
    """Copy a file from src to dest."""
    ensure_dir(dest.parent)
    dest.write_bytes(src.read_bytes())


# ---------------------------------------------------------
# JSON HELPERS
# ---------------------------------------------------------

def read_json(path: Path):
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data):
    ensure_dir(path.parent)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


# ---------------------------------------------------------
# STRING HELPERS
# ---------------------------------------------------------

def slugify(text: str) -> str:
    """Convert a title into a URL-friendly slug."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def extract_between(text: str, start: str, end: str) -> str:
    """Extract substring between two markers."""
    try:
        return text.split(start)[1].split(end)[0]
    except:
        return ""


# ---------------------------------------------------------
# HTML HELPERS
# ---------------------------------------------------------

def load_html_template(path: Path) -> str:
    """Load an HTML file from redesign folder."""
    return read_file(path)


def save_html_output(relative_path: str, content: str):
    """Save HTML into /public/ at the correct location."""
    output_path = PUBLIC_DIR / relative_path
    write_file(output_path, content)
