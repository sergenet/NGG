"""Deploy the PHP control room to /control-room/ over FTP.

The .htaccess rewrite happens server-side: the file holds the app's env secrets
(DB password, API keys), so it is never pulled into the working tree.
"""

import ftplib
import io
import os
import secrets
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # newgiftsandgadgets.com/
FTP_HOST = "newgiftsandgadgets.com"


def credentials():
    env = {}
    with open(os.path.join(ROOT, ".env.local"), encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env.setdefault(key.strip(), value.strip())
    return env["NGG_FTP_USER"], env["NGG_FTP_PASSWORD"]


FILES = [
    ("operations-console/php/index.html", "/control-room/index.html"),
    ("operations-console/php/login.html", "/control-room/login.html"),
    ("operations-console/php/api.php", "/control-room/api.php"),
    ("operations-console/php/setup.php", "/control-room/setup.php"),
    ("operations-console/php/assets/app.js", "/control-room/assets/app.js"),
    ("operations-console/php/assets/login.js", "/control-room/assets/login.js"),
    ("operations-console/php/assets/account.js", "/control-room/assets/account.js"),
    ("operations-console/php/assets/style.css", "/control-room/assets/style.css"),
    ("operations-console/php/assets/account.css", "/control-room/assets/account.css"),
]

ADDED_DIRECTIVES = """Options -Indexes
DirectoryIndex index.html

# The analytics collector posts to /control-room/event; route it to the API.
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^event$ api.php?action=event [L,QSA]
</IfModule>

# Nothing in this directory is public except the dashboard pages themselves.
<FilesMatch "^\\.">
  Require all denied
</FilesMatch>
<FilesMatch "^(server\\.js|package(-lock)?\\.json)$">
  Require all denied
</FilesMatch>
RedirectMatch 404 ^/control-room/app/
"""

MARKER = "# App internals are not served directly"


def main():
    user, password = credentials()
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, 21, timeout=60)
    ftp.login(user, password)
    ftp.set_pasv(True)

    try:
        ftp.mkd("/control-room/assets")
        print("created /control-room/assets")
    except ftplib.error_perm as error:
        print("assets dir:", error)

    for local, remote in FILES:
        source = os.path.join(ROOT, local)
        with open(source, "rb") as handle:
            ftp.storbinary("STOR " + remote, handle)
        print(f"uploaded {remote} ({os.path.getsize(source)} bytes)")

    # --- rewrite .htaccess: drop the dead Passenger block, keep the env block ---
    buffer = []
    ftp.retrbinary("RETR /control-room/.htaccess", buffer.append)
    original = b"".join(buffer).decode("utf-8", "replace")
    with open(os.path.join(ROOT, "_deployed/control-room-htaccess.backup"), "w", encoding="utf-8") as handle:
        handle.write(original)

    env_block = original
    if "CLOUDLINUX ENV VARS CONFIGURATION BEGIN" in original:
        env_block = original[original.index("# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION BEGIN"):]
    else:
        print("WARNING: env block not found, keeping the original file untouched")
        sys.exit(1)

    updated = (
        "# Control room: static pages plus PHP. The Node/Passenger app this used to\n"
        "# point at is retired; PassengerAppRoot pointed outside the web root and\n"
        "# could not be redeployed, so the dashboard no longer depends on it.\n"
        + ADDED_DIRECTIVES
        + "\n"
        + env_block.strip()
        + "\n"
    )
    ftp.storbinary("STOR /control-room/.htaccess", io.BytesIO(updated.encode("utf-8")))
    print("rewrote /control-room/.htaccess (%d bytes)" % len(updated))

    # --- one-time setup token ---
    token = secrets.token_hex(24)
    ftp.storbinary("STOR /control-room/.setup-token", io.BytesIO(token.encode()))
    print("SETUP_URL=https://newgiftsandgadgets.com/control-room/setup.php?t=" + token)

    ftp.quit()


if __name__ == "__main__":
    main()
