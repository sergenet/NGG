"""Delete the retired guide directories from the live docroot.

The zip deployer only ever adds or overwrites files, so the twelve retired guide
directories stayed on disk after their 301 rules shipped. A redirect should not
be the only thing standing between a reader and a page claiming "Best Air
Fryers of 2026" while listing a milk frother.

Safety: a path is only deleted if it is in the explicit list below AND no longer
exists in the local build output. If the build still produces the page, the
script refuses - that means it was not actually retired.

Usage:
    python scripts/remove_retired_guides.py [--dry-run]
"""

from __future__ import annotations

import base64
import ftplib
import io
import secrets
import sys
import time
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "out"

FTP_HOST = "newgiftsandgadgets.com"
FTP_USER = "serge@newgiftsandgadgets.com"
FTP_PASS = base64.b64decode("U2FrbyEhTkdHRlRQMjAyNg==").decode("utf-8")

PUBLIC = "https://newgiftsandgadgets.com"

RETIRED = [
    "smart-home/best-smart-speakers",
    "kitchen/best-air-fryers-of-2026",
    "smart-home/best-smart-home-upgrades-2026",
    "home-office/best-desk-lamps-for-home-office-2026",
    "home-office/best-webcam-for-zoom-meetings-2026",
    "smart-home/roomba-vs-roborock-which-robot-vacuum-wins",
    "smart-home/best-smart-light-bulbs-for-every-room",
    "kitchen/ninja-vs-vitamix-the-professional-blender-showdown",
    "kitchen/top-5-smart-coffee-makers-for-2026",
    "home-office/mx-master-3s-review-the-best-office-mouse",
    "home-office/best-power-delivery-hubs-for-macbook-pro",
    "smart-home/smart-home-on-a-budget-build-your-setup-under-200",
]

PHP = """<?php
@set_time_limit(120);
if (($_GET['t'] ?? '') !== '%(token)s') { http_response_code(403); exit('forbidden'); }

function th_rm($path) {
    if (!is_dir($path)) { return 0; }
    $removed = 0;
    foreach (scandir($path) as $entry) {
        if ($entry === '.' || $entry === '..') { continue; }
        $full = $path . '/' . $entry;
        if (is_dir($full)) { $removed += th_rm($full); }
        else { if (@unlink($full)) { $removed++; } }
    }
    @rmdir($path);
    return $removed;
}

$allowed = %(paths)s;
$out = array();
foreach ($allowed as $rel) {
    $target = __DIR__ . '/' . $rel;
    // Refuse anything that is not inside the docroot.
    $real = realpath($target);
    $root = realpath(__DIR__);
    if ($real === false || strpos($real, $root) !== 0) {
        $out[$rel] = 'skipped';
        continue;
    }
    $out[$rel] = th_rm($real) . ' files';
}
@unlink(__FILE__);
header('Content-Type: application/json');
echo json_encode($out);
"""


def main() -> int:
    dry = "--dry-run" in sys.argv

    still_built = [p for p in RETIRED if (OUT / p / "index.html").exists()]
    if still_built:
        print("REFUSING: these are still in the local build, so they were not retired:")
        for p in still_built:
            print("   ", p)
        return 1

    print(f"{len(RETIRED)} retired directories to remove")
    if dry:
        for p in RETIRED:
            print("   ", p)
        return 0

    token = secrets.token_urlsafe(24)
    helper = f"ngg-cleanup-{token[:10]}.php"
    php = PHP % {
        "token": token,
        "paths": "array(" + ", ".join(f"'{p}'" for p in RETIRED) + ")",
    }

    ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=60)
    ftp.storbinary(f"STOR {helper}", io.BytesIO(php.encode("utf-8")))
    ftp.quit()
    print("helper uploaded")

    time.sleep(1)
    with urllib.request.urlopen(
        urllib.request.Request(f"{PUBLIC}/{helper}?t={token}", headers={"User-Agent": "NGG-Cleanup/1.0"}),
        timeout=180,
    ) as r:
        print("server:", r.read().decode("utf-8", "replace"))

    ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=60)
    for name in (helper,):
        try:
            ftp.delete(name)
        except ftplib.error_perm:
            pass
    ftp.quit()
    return 0


if __name__ == "__main__":
    sys.exit(main())
