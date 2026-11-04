# engine/optimize_seo.ps1
# Automates image alt-tag insertion and HTML minification for NewGiftsAndGadgets.com

$publicDir = "c:\newgiftsandgadgets.com\public"

if (-not (Test-Path $publicDir)) {
    Write-Host "[ERROR] Public directory not found: $publicDir" -ForegroundColor Red
    exit 1
}

Write-Host "--- Starting Post-Build SEO Optimization ---" -ForegroundColor Cyan

# 1. Image Alt-Tag Optimization
Write-Host "[1/2] Optimizing Image Alt-tags..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Regex to find <img> tags without alt or with empty alt
    # We'll inject a generic alt based on the filename if it's a product image
    $newContent = [regex]::Replace($content, '<img([^>]+)>', {
        param($match)
        $attrs = $match.Groups[1].Value
        if ($attrs -notmatch 'alt=') {
            # Try to guess a good alt from src
            if ($attrs -match 'src="([^"]+)"') {
                $src = [System.IO.Path]::GetFileNameWithoutExtension($matches[1]).Replace("-", " ").Replace("_", " ")
                return "<img$attrs alt='$src'>"
            }
            return "<img$attrs alt='New Gifts and Gadgets Item'>"
        }
        return $match.Value
    })
    
    if ($content -ne $newContent) {
        Set-Content $file.FullName $newContent
        Write-Host "  - Updated: $($file.FullName)" -ForegroundColor Gray
    }
}

# 2. Minification (Simple whitespace reduction for this script)
Write-Host "[2/2] Minifying HTML output..." -ForegroundColor Yellow
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    # Very basic minification: remove multiple spaces and newlines (safe version)
    $minified = $content -replace '(?s)<!--.*?-->', '' # Remove comments
    $minified = $minified -replace '\s{2,}', ' '       # Collapse multiple spaces
    
    Set-Content $file.FullName $minified
}

Write-Host "--- SEO Optimization Complete ---" -ForegroundColor Green
