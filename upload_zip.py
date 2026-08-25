import ftplib
import json
import os
import sys
import time

def load_local_env(path=".env.local"):
    """Load ignored local deployment settings without an extra dependency."""
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

load_local_env()

FTP_HOST = "newgiftsandgadgets.com"
FTP_USER = os.environ["NGG_FTP_USER"]
FTP_PASS = os.environ["NGG_FTP_PASSWORD"]
LOCAL_DIR = "out"
REMOTE_DIR = ""
MAX_RETRIES = 5
LOCAL_MANIFEST_FILE = ".deploy-manifest.json"
REMOTE_MANIFEST_FILE = "/.deploy-manifest.json"
DELETE_MISSING = os.getenv("FTP_DELETE_MISSING", "1") == "1"

ftp = None

def connect():
    global ftp
    print("Connecting to FTP server...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, 21, timeout=60)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("Connected.")

def ensure_remote_dir(remote_path):
    """Recursively create remote directories if they don't exist."""
    if not remote_path or remote_path == "/":
        return
    parts = remote_path.strip("/").split("/")
    current = ""
    for part in parts:
        current = current + "/" + part
        try:
            ftp.mkd(current)
        except ftplib.error_perm:
            pass  # Already exists

def file_fingerprint(path):
    """Return a fast fingerprint for change detection."""
    stat_result = os.stat(path)
    return {
        "mtime_ns": stat_result.st_mtime_ns,
        "size": stat_result.st_size,
    }

def load_local_manifest(path):
    """Load local manifest JSON if present."""
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}

def normalize_manifest_entry(entry):
    """Support both legacy hash manifests and the new fast fingerprint format."""
    if isinstance(entry, dict):
        return entry
    if isinstance(entry, str):
        return {"hash": entry}
    return None

def save_local_manifest(path, manifest):
    """Persist manifest JSON locally."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)

def load_remote_manifest(remote_path):
    """Load remote manifest JSON from FTP if present."""
    chunks = []
    try:
        ftp.retrbinary(f"RETR {remote_path}", chunks.append)
    except ftplib.error_perm:
        return {}
    except Exception:
        return {}

    try:
        raw = b"".join(chunks).decode("utf-8")
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}

def upload_manifest_remote(remote_path, manifest):
    """Upload manifest JSON to FTP server."""
    payload = json.dumps(manifest, indent=2, sort_keys=True).encode("utf-8")
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            from io import BytesIO
            ftp.storbinary(f"STOR {remote_path}", BytesIO(payload))
            print(f"  [OK]   {remote_path}")
            return True
        except (ftplib.error_temp, EOFError, OSError, TimeoutError, ConnectionResetError) as e:
            print(f"  [WARN] Attempt {attempt}/{MAX_RETRIES} failed for {remote_path}: {e}")
            time.sleep(3)
            try:
                connect()
            except Exception as ce:
                print(f"  [WARN] Reconnect failed: {ce}")
                time.sleep(5)
    print(f"  [ERROR] Giving up on {remote_path} after {MAX_RETRIES} attempts.")
    return False

def delete_remote_file(remote_path):
    """Delete a remote file with retry on transient failures."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            ftp.delete(remote_path)
            print(f"  [DEL]  {remote_path}")
            return True
        except ftplib.error_perm as e:
            # Permanent errors (already missing, permission denied) are not retryable.
            print(f"  [WARN] Could not delete {remote_path}: {e}")
            return False
        except (ftplib.error_temp, EOFError, OSError, TimeoutError, ConnectionResetError) as e:
            print(f"  [WARN] Attempt {attempt}/{MAX_RETRIES} failed deleting {remote_path}: {e}")
            time.sleep(3)
            try:
                connect()
            except Exception as ce:
                print(f"  [WARN] Reconnect failed: {ce}")
                time.sleep(5)
    print(f"  [ERROR] Giving up deleting {remote_path} after {MAX_RETRIES} attempts.")
    return False

def prune_empty_remote_dirs(remote_dirs):
    """Best-effort removal of empty remote directories, deepest first."""
    for d in sorted(remote_dirs, key=lambda x: x.count("/"), reverse=True):
        if not d or d == "/":
            continue
        try:
            ftp.rmd(d)
            print(f"  [RMD]  {d}")
        except Exception:
            # Ignore non-empty or missing directories.
            pass

def delete_missing_remote_files(baseline_manifest, new_manifest, remote_dir):
    """Delete files from FTP that no longer exist locally."""
    stats = {
        "deleted": 0,
        "delete_failed": 0,
    }
    candidate_dirs = set()

    removed_rel_paths = sorted(set(baseline_manifest.keys()) - set(new_manifest.keys()))
    for rel_file in removed_rel_paths:
        remote_path = f"/{rel_file}" if not remote_dir else f"{remote_dir}/{rel_file}"
        if delete_remote_file(remote_path):
            stats["deleted"] += 1
            parts = rel_file.split("/")[:-1]
            while parts:
                d = "/" + "/".join(parts) if not remote_dir else f"{remote_dir}/" + "/".join(parts)
                candidate_dirs.add(d)
                parts.pop()
        else:
            stats["delete_failed"] += 1

    prune_empty_remote_dirs(candidate_dirs)
    return stats

def upload_file(local_path, remote_path):
    """Upload a single file with retry on failure."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)
            print(f"  [OK]   {remote_path}")
            return True
        except (ftplib.error_temp, EOFError, OSError, TimeoutError, ConnectionResetError) as e:
            print(f"  [WARN] Attempt {attempt}/{MAX_RETRIES} failed for {remote_path}: {e}")
            time.sleep(3)
            try:
                connect()
            except Exception as ce:
                print(f"  [WARN] Reconnect failed: {ce}")
                time.sleep(5)
    print(f"  [ERROR] Giving up on {remote_path} after {MAX_RETRIES} attempts.")
    return False

def should_upload(rel_path, file_hash, baseline_manifest):
    """Decide whether a file needs upload based on baseline manifest hash."""
    previous_entry = normalize_manifest_entry(baseline_manifest.get(rel_path))
    
    # If previous entry is a dict with 'mtime_ns' key (new format), compare directly
    # If previous entry is a string (old SHA-256 hash), force upload (format mismatch)
    if isinstance(previous_entry, str):
        # Old format detected, force full upload
        return True
    
    return previous_entry != file_hash

def scan_and_upload(local_dir, remote_dir, baseline_manifest):
    """Scan local tree and upload only files that changed vs baseline manifest."""
    stats = {
        "uploaded": 0,
        "skipped": 0,
        "failed": 0,
        "deleted": 0,
        "delete_failed": 0,
    }
    new_manifest = {}

    for root, dirs, files in os.walk(local_dir):
        dirs.sort()
        files.sort()

        rel_root = os.path.relpath(root, local_dir)
        if rel_root == ".":
            rel_root = ""
        else:
            rel_root = rel_root.replace("\\", "/")

        for d in dirs:
            rel_dir = f"{rel_root}/{d}" if rel_root else d
            rel_dir = rel_dir.replace("\\", "/")
            remote_path = f"/{rel_dir}" if not remote_dir else f"{remote_dir}/{rel_dir}"
            print(f"  [DIR]  {remote_path}")
            ensure_remote_dir(remote_path)

        for f_name in files:
            local_path = os.path.join(root, f_name)
            rel_file = f"{rel_root}/{f_name}" if rel_root else f_name
            rel_file = rel_file.replace("\\", "/")
            remote_path = f"/{rel_file}" if not remote_dir else f"{remote_dir}/{rel_file}"

            file_fingerprint_value = file_fingerprint(local_path)
            new_manifest[rel_file] = file_fingerprint_value

            if should_upload(rel_file, file_fingerprint_value, baseline_manifest):
                ok = upload_file(local_path, remote_path)
                if ok is False:
                    stats["failed"] += 1
                else:
                    stats["uploaded"] += 1
            else:
                print(f"  [SKIP] {remote_path}")
                stats["skipped"] += 1

            # Send a keepalive every so often to prevent timeout
            try:
                ftp.voidcmd("NOOP")
            except Exception:
                try:
                    connect()
                except Exception:
                    pass

    return new_manifest, stats

print("=" * 50)
print("  NewGiftsAndGadgets FTP Deployer")
print("=" * 50)

try:
    connect()
    print(f"\nUploading changed files from '{LOCAL_DIR}' -> FTP root (public_html)...\n")

    remote_manifest = load_remote_manifest(REMOTE_MANIFEST_FILE)
    local_manifest = load_local_manifest(LOCAL_MANIFEST_FILE)
    baseline_manifest = remote_manifest if remote_manifest else local_manifest

    new_manifest, stats = scan_and_upload(LOCAL_DIR, REMOTE_DIR, baseline_manifest)

    if DELETE_MISSING:
        print("\nDeleting remote files removed locally...\n")
        delete_stats = delete_missing_remote_files(baseline_manifest, new_manifest, REMOTE_DIR)
        stats["deleted"] = delete_stats["deleted"]
        stats["delete_failed"] = delete_stats["delete_failed"]
    else:
        print("\nDelete sync disabled (FTP_DELETE_MISSING=0).")

    save_local_manifest(LOCAL_MANIFEST_FILE, new_manifest)
    upload_manifest_remote(REMOTE_MANIFEST_FILE, new_manifest)

    print(
        f"\nSummary: uploaded={stats['uploaded']} skipped={stats['skipped']} "
        f"deleted={stats['deleted']} failed={stats['failed']} delete_failed={stats['delete_failed']}"
    )

    if stats["failed"] > 0 or stats["delete_failed"] > 0:
        print("\n--- UPLOAD FAILED ---")
        print("Some files failed to upload/delete.")
        ftp.quit()
        sys.exit(1)

    print("\n" + "=" * 50)
    print("  UPLOAD COMPLETE!")
    print("=" * 50)
    ftp.quit()
except Exception as e:
    print(f"\n--- UPLOAD FAILED ---\nError: {e}")
    sys.exit(1)
