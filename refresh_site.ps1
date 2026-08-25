# Refresh-Site.ps1
throw "DISABLED: legacy Python site builder retired during Stage 0 on 2026-08-25; use npm run build."
# Automates the NewGiftsAndGadgets build process and product rotation.

Write-Host "--- NewGiftsAndGadgets Site Refresh ---" -ForegroundColor Cyan
Write-Host "Rebuilding site and rotating products for the current 2-week period..."

# Path to the build script
$BuildScript = "c:\newgiftsandgadgets.com\engine\build.py"

# Run the build
python $BuildScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS: Site rebuilt! Your fresh products are now live in /public/." -ForegroundColor Green
} else {
    Write-Host "`nERROR: Build failed. Please check the engine logs." -ForegroundColor Red
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
