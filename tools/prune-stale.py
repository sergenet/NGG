#!/usr/bin/env python3
"""
prune-stale.py — delete server files that the current build no longer produces.

Why
---
deploy-zip.py uploads out/ and extracts it over the web root. Extraction only
adds and overwrites; it never deletes. So every page that ever shipped stays
online forever, even after it is removed from the build.

By November 2026 that left ~86 orphaned HTML files and 15 orphaned guide
directories on newgiftsandgadgets.com:

  * flat /<section>/<slug>.html pages from the pre-/product/ export layout,
    duplicates of the pages that now live at /<section>/<slug>/
  * retired guide directories (/kitchen/best-blenders/, /smart-home/
    best-robot-vacuums/, /gift-guides/best-gifts-for-dad-father-s-day-2026/, ...)

Search Console reflects exactly this: 57 of the 99 "Crawled - currently not
indexed" URLs were paths the build does not contain, and every one that still
served 200 was one of these leftovers. Google was crawling duplicate and dead
copies of pages it already had, which is why its crawl budget went here instead
of to the real pages it declined.

The server answers LIST with one recursive listing and writes nested paths with
backslashes, and it omits index.html from that listing, so walking it invents
paths that do not exist. This tool therefore lists each section directory
explicitly and diffs the directory names against out/, which is what actually
matters: a directory that the build no longer has cannot be canonical.

Everything that looks like an application rather than content (control-room,
api, cgi-bin, .well-known, serge) is never touched.

Usage:
  python tools/prune-stale.py            # dry run, prints what would go
  python tools/prune-stale.py --apply    # actually delete
"""
import base64
import ftplib
import os
import sys

HOST = "newgiftsandgadgets.com"
USER = "serge@newgiftsandgadgets.com"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PW = next(
    (ln.split("=", 1)[1].strip() for ln in open(os.path.join(BASE, ".env"), encoding="utf-8").read().splitlines()
     if ln.startswith("NGG_FTP_PASS=")),
    "",
)
if not PW:
    sys.exit("set NGG_FTP_PASS in .env - the password is never stored in this file")
OUT = os.path.join(BASE, "out")

# Content sections whose contents should mirror out/ exactly.
SECTIONS = ["product", "shop", "home-office", "kitchen", "smart-home",
            "gift-guides", "gifts", "comparisons"]

# Never prune these: they hold deployed applications, not build output.
PROTECTED = {"control-room", "api", "cgi-bin", ".well-known", "wp-content",
             "wp-includes", "_next", "assets", "images", "icons", "data",
             "social", "downloads", "audio", "serge", "admin"}


def connect():
    ftp = ftplib.FTP_TLS(HOST, USER, PW, timeout=60)
    try:
        ftp.prot_p()
    except Exception:
        pass
    return ftp


def listing(ftp, path):
    """[(is_dir, name)] for one directory, using the raw LIST names."""
    ftp.cwd(path)
    lines = []
    ftp.retrlines("LIST", lines.append)
    out = []
    for line in lines:
        parts = line.split(None, 8)
        if len(parts) < 9:
            continue
        name = parts[8].replace("\\", "/").rstrip("/")
        if name in (".", ".."):
            continue
        out.append((line.startswith("d"), name))
    return out


def delete_tree(ftp, path):
    """Delete every file under path, then the directory itself. Deepest first."""
    deleted = failed = 0
    for is_dir, name in listing(ftp, path):
        child = f"{path}/{name}"
        if is_dir:
            d, f = delete_tree(ftp, child)
            deleted += d
            failed += f
        else:
            try:
                ftp.cwd(path)
                ftp.delete(name)
                deleted += 1
            except Exception as e:
                failed += 1
                print(f"   FAILED {child}: {e}")
    try:
        parent, base = path.rsplit("/", 1)
        ftp.cwd(parent or "/")
        ftp.rmd(base)
    except Exception as e:
        failed += 1
        print(f"   FAILED rmdir {path}: {e}")
    return deleted, failed


def main():
    apply = "--apply" in sys.argv
    ftp = connect()

    stale_dirs, stale_files = [], []
    for section in SECTIONS:
        remote_root = "/" + section
        try:
            entries = listing(ftp, remote_root)
        except Exception as e:
            print(f"! cannot list {remote_root}: {e}")
            continue
        local_dir = os.path.join(OUT, section)
        local = set(os.listdir(local_dir)) if os.path.isdir(local_dir) else set()
        for is_dir, name in entries:
            slug = name.split("/")[0]
            if is_dir:
                if slug not in local:
                    stale_dirs.append(f"{remote_root}/{slug}")
            elif name.endswith(".html"):
                # Every real page in these sections is a directory with its own
                # index.html, so any other .html file here is a leftover from
                # the old flat export layout -- including one that duplicates a
                # page the build still ships at the directory URL.
                if name not in local:
                    stale_files.append(f"{remote_root}/{name}")

    print(f"stale directories: {len(stale_dirs)}   stale flat files: {len(stale_files)}")
    for p in stale_dirs:
        print("   dir ", p)
    for p in stale_files:
        print("   file", p)

    if not apply:
        print("\nDRY RUN — re-run with --apply to delete.")
        return 0

    deleted = failed = 0
    for p in stale_files:
        directory, name = p.rsplit("/", 1)
        try:
            ftp.cwd(directory)
            ftp.delete(name)
            deleted += 1
        except Exception as e:
            failed += 1
            print(f"   FAILED {p}: {e}")

    for p in stale_dirs:
        d, f = delete_tree(ftp, p)
        deleted += d
        failed += f

    try:
        ftp.quit()
    except Exception:
        pass
    print(f"\ndeleted {deleted} files, {failed} failures, removed {len(stale_dirs)} directories")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
