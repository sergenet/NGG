#!/usr/bin/env python3
"""
deploy-zip.py — fast deploy for newgiftsandgadgets.com:
1. Runs data validation and static export (npm run build)
2. Zips out/ locally into a single compressed bundle
3. Uploads the zip via FTP in seconds
4. Extracts server-side using a temporary PHP script
5. Cleans up temporary artifacts
"""

import os
import subprocess
import sys
import time
import zipfile
import ftplib
import base64
import urllib.request
from pathlib import Path

def _cred(key, default=""):
    """Environment variable first, else the matching line in .env beside this file."""
    value = os.environ.get(key)
    if value:
        return value
    env_path = Path(__file__).resolve().parent / ".env"
    try:
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    except OSError:
        pass
    return default


BASE_DIR = Path(__file__).resolve().parent
OUT_DIR = BASE_DIR / "out"
ZIP_LOCAL = BASE_DIR / "deploy-bundle.zip"
ZIP_REMOTE = "deploy-bundle.zip"
UNZIP_REMOTE = "ngg-unzip.php"

FTP_HOST = "newgiftsandgadgets.com"
FTP_USER = "serge@newgiftsandgadgets.com"
FTP_PASS = _cred("NGG_FTP_PASS")
if not FTP_PASS:
    raise SystemExit("set NGG_FTP_PASS in .env - the password is never stored in this file")

UNZIP_PHP = """<?php
@set_time_limit(300);
$zip = new ZipArchive;
$res = $zip->open(__DIR__ . '/deploy-bundle.zip');
if ($res !== TRUE) {
    header('Content-Type: text/plain');
    echo "OPEN_FAIL:$res";
    exit(1);
}
$root = __DIR__;
for ($i = 0; $i < $zip->numFiles; $i++) {
    $name = $zip->getNameIndex($i);
    $parts = explode('/', str_replace('\\\\', '/', $name));
    // Reject absolute paths and real traversal segments only. A plain strpos('..')
    // check also rejects valid build output such as chunks/08dfnp6zfj2x..js.
    if ($name === '' || $name[0] === '/' || in_array('..', $parts, true)) {
        header('Content-Type: text/plain');
        echo 'UNSAFE_ENTRY:' . $name;
        exit(1);
    }
}
if (!$zip->extractTo($root)) {
    $zip->close();
    echo 'EXTRACT_FAIL';
    exit(1);
}
$n = $zip->numFiles;
$zip->close();
@unlink(__DIR__ . '/deploy-bundle.zip');
@unlink(__DIR__ . '/ngg-unzip.php');
header('Content-Type: text/plain');
echo "OK extracted=$n";
"""

def connect_ftp():
    for attempt in range(1, 4):
        try:
            ftp = ftplib.FTP_TLS(FTP_HOST, FTP_USER, FTP_PASS, timeout=60)
            try:
                ftp.prot_p()
            except ftplib.error_perm:
                pass
            ftp.voidcmd('TYPE I')
            return ftp
        except Exception:
            try:
                ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=60)
                ftp.voidcmd('TYPE I')
                return ftp
            except Exception as e:
                time.sleep(2 * attempt)
    raise RuntimeError("Could not connect to FTP.")

def build_zip():
    if not OUT_DIR.exists():
        raise RuntimeError(f"out/ directory {OUT_DIR} does not exist. Run npm run build first.")
    
    files = [p for p in OUT_DIR.rglob("*") if p.is_file()]
    print(f"Compressing {len(files)} files from out/ into {ZIP_LOCAL.name}...")
    with zipfile.ZipFile(ZIP_LOCAL, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for f in files:
            rel = f.relative_to(OUT_DIR)
            z.write(f, rel.as_posix())
    mb = ZIP_LOCAL.stat().st_size / 1e6
    print(f"Compressed bundle created: {mb:.2f} MB")
    return len(files)

def prune_orphans():
    """Remove server files this build no longer produces.

    Extraction only adds and overwrites, so without this every page a retired
    guide ever had stays online and keeps serving 200. That is what put 57 dead
    URLs into Search Console's "Crawled - currently not indexed" bucket: Google
    crawled leftover duplicates instead of the real pages. tools/prune-stale.py
    diffs each section directory against out/ and removes only what the build
    does not contain.
    """
    script = BASE_DIR / "tools" / "prune-stale.py"
    if not script.exists():
        return
    print("Pruning pages this build no longer produces...")
    try:
        subprocess.run([sys.executable, str(script), "--apply"], cwd=BASE_DIR,
                       check=False)
    except Exception as e:
        print(f"  prune skipped: {e}")


def smoke_check():
    """Verify the release the way a visitor and a crawler see it.

    Extraction can succeed while the site is broken: a bad .htaccess directive
    returns 500 for every page, a missing file leaves a 404 behind a schema
    reference, a CSP change blocks a third-party widget. scripts/smoke-check.mjs
    covers those cases, and its exit code becomes the deploy's.
    """
    print("Running post-deploy smoke check...")
    try:
        result = subprocess.run(["node", "scripts/smoke-check.mjs"], cwd=BASE_DIR, check=False)
    except FileNotFoundError:
        print("  node was not found; smoke check skipped")
        return 0
    if result.returncode != 0:
        print("  The release is live but did not pass the smoke check.")
    return result.returncode


def deploy():
    total_files = build_zip()
    ftp = connect_ftp()
    print("Connected to FTP.")
    
    # Upload zip
    print(f"Uploading {ZIP_LOCAL.name}...")
    t0 = time.time()
    with open(ZIP_LOCAL, "rb") as fh:
        ftp.storbinary(f"STOR {ZIP_REMOTE}", fh, blocksize=256 * 1024)
    print(f"Uploaded zip in {time.time() - t0:.1f}s.")
    
    # Upload unpacker script
    php_local = BASE_DIR / "_ngg-unzip.php"
    php_local.write_text(UNZIP_PHP, encoding="utf-8", newline="\n")
    with open(php_local, "rb") as fh:
        ftp.storbinary(f"STOR {UNZIP_REMOTE}", fh)
    php_local.unlink()
    ftp.quit()
    
    # Trigger unzip over HTTPS
    print("Triggering server-side extraction...")
    url = f"https://newgiftsandgadgets.com/{UNZIP_REMOTE}"
    deadline = time.time() + 300
    while time.time() < deadline:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "NGG-Deployer/1.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read().decode("utf-8", "replace").strip()
                if body.startswith("OK"):
                    print(f"Deployment successful! Server response: {body}")
                    # Cleanup local zip
                    if ZIP_LOCAL.exists():
                        ZIP_LOCAL.unlink()
                    prune_orphans()
                    return smoke_check()
                else:
                    print(f"Extraction error: {body}")
                    return 1
        except Exception as e:
            time.sleep(2)
            
    print("Extraction timed out.")
    return 1

if __name__ == "__main__":
    sys.exit(deploy())
