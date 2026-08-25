$ErrorActionPreference = "Stop"

Write-Host "--- NGG Deploy Preflight ---" -ForegroundColor Cyan

$required = @(
  "BEEHIIV_API_KEY",
  "BEEHIIV_PUBLICATION_ID"
)

$missing = @()
foreach ($name in $required) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing required environment variables:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$gaId = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_GA_MEASUREMENT_ID")
if ([string]::IsNullOrWhiteSpace($gaId)) {
  Write-Host "Warning: NEXT_PUBLIC_GA_MEASUREMENT_ID is not set. GA4 conversion events will be disabled." -ForegroundColor Yellow
}

Write-Host "Preflight passed." -ForegroundColor Green
exit 0
