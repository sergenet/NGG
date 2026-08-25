# deploy_to_namecheap.ps1
# Automates the build and direct FTP upload to Namecheap.
# No zip/unzip needed - uploads files directly via FTP with correct paths.

$ErrorActionPreference = "Stop"
$BaseDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $BaseDir

Write-Host "--- NewGiftsAndGadgets Namecheap Deployment ---" -ForegroundColor Cyan

# 1. Build the Next.js static site
Write-Host "`nStep 1: Building the Next.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed." -ForegroundColor Red
    exit 1
}

# 2. Upload files directly to Namecheap via FTP (recursive, no zip)
Write-Host "`nStep 2: Uploading files to Namecheap via FTP..." -ForegroundColor Yellow
Write-Host "(This uploads all files in /out directly to /public_html with correct folder structure)" -ForegroundColor Gray
python upload_zip.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: FTP Upload failed." -ForegroundColor Red
    exit 1
}

Write-Host "`nSUCCESS: Deployment complete! Your site is live at https://newgiftsandgadgets.com" -ForegroundColor Green
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
