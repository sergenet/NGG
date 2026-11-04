import ftplib
import os
import sys


def load_local_env(path: str = ".env.local") -> None:
    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


if len(sys.argv) != 3:
    raise SystemExit("usage: upload_single_ftp.py LOCAL_FILE REMOTE_NAME")

load_local_env()
local_file, remote_name = sys.argv[1:]
if "\\" in remote_name or remote_name.startswith("/") or ".." in remote_name.split("/"):
    raise SystemExit("REMOTE_NAME must be a safe path relative to the FTP root")

with ftplib.FTP("newgiftsandgadgets.com", timeout=60) as ftp:
    ftp.login(os.environ["NGG_FTP_USER"], os.environ["NGG_FTP_PASSWORD"])
    ftp.set_pasv(True)
    remote_root = ftp.pwd()
    with open(local_file, "rb") as payload:
        ftp.storbinary(f"STOR /{remote_name}", payload)

print(f"uploaded {os.path.getsize(local_file)} bytes to {remote_root}/{remote_name}")
