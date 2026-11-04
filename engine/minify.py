# minify.py
# Pure-Python, no external libraries. Safe for Python 3.13.

import re

def _collapse_whitespace(text: str) -> str:
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def minify_html_content(html: str) -> str:
    """
    Very simple HTML minifier:
    - removes extra whitespace
    - keeps content safe
    """
    if not html:
        return html
    return _collapse_whitespace(html)


def minify_css_content(css: str) -> str:
    """
    Very simple CSS minifier:
    - strips comments
    - collapses whitespace
    """
    if not css:
        return css
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    css = _collapse_whitespace(css)
    return css


def minify_js_content(js: str) -> str:
    """
    Very simple JS minifier:
    - strips // line comments
    - strips /* */ block comments
    - collapses whitespace
    """
    if not js:
        return js
    js = re.sub(r"//.*?$", "", js, flags=re.MULTILINE)
    js = re.sub(r"/\*.*?\*/", "", js, flags=re.DOTALL)
    js = _collapse_whitespace(js)
    return js
