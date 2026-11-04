import ftplib
import os
import sys
import shutil
import urllib.request
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

# Configuration
FTP_HOST = "newgiftsandgadgets.com"
FTP_USER = os.environ["NGG_FTP_USER"]
FTP_PASS = os.environ["NGG_FTP_PASSWORD"]
LOCAL_DIR = Path(__file__).parent.parent / "out"

def main():
    if not LOCAL_DIR.exists():
        print(f"Error: Local directory {LOCAL_DIR} not found. Run 'npm run build' first.")
        sys.exit(1)

    print("Zipping the 'out' directory locally...")
    shutil.make_archive('out', 'zip', LOCAL_DIR)
    
    # Create unzip.php script
    php_script = """<?php
$zip = new ZipArchive;
$res = $zip->open('out.zip');
if ($res === TRUE) {
  $zip->extractTo('./');
  $zip->close();
  echo 'woot!';
} else {
  echo 'doh!';
}
?>"""
    with open("unzip.php", "w") as f:
        f.write(php_script)

    print(f"Connecting to {FTP_HOST}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21, timeout=120)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        print("Login successful. Passive mode enabled.")
        
        dirs = ftp.nlst()
        if "public_html" in dirs:
            print("Moving to public_html...")
            ftp.cwd("public_html")
        
        print("Uploading out.zip (with 256KB blocksize)...")
        with open("out.zip", "rb") as f:
            ftp.storbinary("STOR out.zip", f, blocksize=262144)
            
        print("Uploading unzip.php...")
        with open("unzip.php", "rb") as f:
            ftp.storbinary("STOR unzip.php", f, blocksize=262144)
            
        extraction_ok = False
        print("Triggering extraction on the server...")
        try:
            request = urllib.request.Request(
                "https://newgiftsandgadgets.com/unzip.php",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
            )
            req = urllib.request.urlopen(request, timeout=30)
            result = req.read().decode('utf-8').strip()
            if result == "woot!":
                print("Extraction successful on server!")
                extraction_ok = True
            else:
                print(f"Unexpected response from extraction: {result}")
        except Exception as e:
            print(f"Failed to trigger unzip.php over HTTP: {e}")
            print("Please visit https://newgiftsandgadgets.com/unzip.php manually to extract.")
            
        if extraction_ok:
            print("Cleaning up temporary files on server...")
            try:
                ftp.delete("out.zip")
                ftp.delete("unzip.php")
                print("Cleanup successful.")
            except Exception as e:
                print(f"Warning: Could not delete temporary files on server: {e}")
        else:
            print("Skipping server cleanup so extraction can be triggered manually.")
        
        print("\n--- DEPLOYMENT SUCCESSFUL ---")
        print(f"Live site should now be updated at https://{FTP_HOST}")

        # Trigger IndexNow URL submission
        if extraction_ok:
            print("Triggering IndexNow search engine URL submissions...")
            try:
                sys.path.append(str(Path(__file__).parent))
                from indexnow_submit import submit_urls
                submit_urls()
            except Exception as idx_err:
                print(f"Warning: IndexNow submission failed: {idx_err}")
        
        ftp.quit()
    except Exception as e:
        print(f"\n--- DEPLOYMENT FAILED ---")
        print(f"Error: {e}")
    finally:
        # Clean up local zip
        if os.path.exists("out.zip"):
            os.remove("out.zip")
        if os.path.exists("unzip.php"):
            os.remove("unzip.php")

if __name__ == "__main__":
    main()
