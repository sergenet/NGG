$ErrorActionPreference = 'Stop'
$base = 'https://newgiftsandgadgets.com'
$sitemapResponse = Invoke-WebRequest -Uri "$base/sitemap.xml" -UseBasicParsing -TimeoutSec 45
$urls = [regex]::Matches($sitemapResponse.Content, '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value }

$results = $urls | ForEach-Object -Parallel {
    $url = $_
    $lastError = $null
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45
            return [pscustomobject]@{
                Url = $url
                Status = [int]$response.StatusCode
                Content = [string]$response.Content
                Error = ''
            }
        } catch {
            $lastError = $_.Exception.Message
            Start-Sleep -Milliseconds (500 * $attempt)
        }
    }
    [pscustomobject]@{ Url = $url; Status = 0; Content = ''; Error = $lastError }
} -ThrottleLimit 6

$failures = @($results | Where-Object { $_.Status -ne 200 })
$canonicalFailures = @()
foreach ($result in $results) {
    if ($result.Status -ne 200) { continue }
    $expected = if ($result.Url.EndsWith('/')) { $result.Url } else { "$($result.Url)/" }
    if ($result.Content -notmatch ('<link rel="canonical" href="' + [regex]::Escape($expected) + '"')) {
        $canonicalFailures += $result.Url
    }
}

$joinedHtml = ($results | Where-Object Status -eq 200 | ForEach-Object Content) -join "`n"
$legacyPattern = '40%\+ open rates|ages 25-45|60% male|minimum 2-week testing|we spent 100\+ hours|after testing|we tested|prevents eye strain|rock-solid reliability|investment for a lifetime|without you lifting a finger|complete peace of mind'
$legacyHits = [regex]::Matches($joinedHtml, $legacyPattern, 'IgnoreCase').Count
$closedIdHits = [regex]::Matches($joinedHtml, 'sergenet05-20', 'IgnoreCase').Count
$amazonDestinationHits = [regex]::Matches($joinedHtml, '(?:href|action)=["'']https?://[^"'']*(?:amazon\.|amzn\.)', 'IgnoreCase').Count
$amazonImageHits = [regex]::Matches($joinedHtml, '(?:src|srcset)=["''][^"'']*(?:m\.media-amazon\.com|images-na\.ssl-images-amazon\.com|amazon\.com/images)', 'IgnoreCase').Count

$representative = @(
    @{ Url = "$base/work-with-us/"; Phrase = 'Clear terms before promotion.' },
    @{ Url = "$base/editorial-policy/"; Phrase = 'Sponsored content and samples' },
    @{ Url = "$base/privacy/"; Phrase = 'Retention and sharing' },
    @{ Url = "$base/home-office/mx-master-3s-review-the-best-office-mouse/"; Phrase = 'This is a research-based buying guide, not a hands-on review.' },
    @{ Url = "$base/smart-home/roomba-vs-roborock-which-robot-vacuum-wins/"; Phrase = 'This research-based comparison uses published cleaning features' }
)
$representativeFailures = @()
foreach ($check in $representative) {
    $match = $results | Where-Object Url -eq $check.Url | Select-Object -First 1
    if (-not $match -or $match.Status -ne 200 -or -not $match.Content.Contains($check.Phrase)) {
        $representativeFailures += $check.Url
    }
}

$client = [System.Net.Http.HttpClient]::new()
$pdfBytes = $client.GetByteArrayAsync("$base/downloads/2026-gadget-buyers-checklist.pdf").GetAwaiter().GetResult()
$sha = [System.Security.Cryptography.SHA256]::Create()
$livePdfHash = [Convert]::ToHexString($sha.ComputeHash($pdfBytes))
$localPdfHash = (Get-FileHash -LiteralPath 'public/downloads/2026-gadget-buyers-checklist.pdf' -Algorithm SHA256).Hash
$client.Dispose()

$summary = [ordered]@{
    sitemap_status = [int]$sitemapResponse.StatusCode
    sitemap_url_count = $urls.Count
    http_200_count = @($results | Where-Object Status -eq 200).Count
    http_failure_count = $failures.Count
    canonical_failure_count = $canonicalFailures.Count
    representative_failure_count = $representativeFailures.Count
    legacy_claim_hits = $legacyHits
    closed_store_id_hits = $closedIdHits
    amazon_destination_hits = $amazonDestinationHits
    amazon_image_hits = $amazonImageHits
    live_pdf_bytes = $pdfBytes.Length
    live_pdf_sha256 = $livePdfHash
    local_pdf_sha256 = $localPdfHash
    pdf_hash_match = $livePdfHash -eq $localPdfHash
}

$summary | ConvertTo-Json
if ($failures.Count) { $failures | Select-Object Url,Status,Error | Format-Table -AutoSize }
if ($canonicalFailures.Count) { 'Canonical failures:'; $canonicalFailures }
if ($representativeFailures.Count) { 'Representative failures:'; $representativeFailures }

if ($failures.Count -or $canonicalFailures.Count -or $representativeFailures.Count -or $legacyHits -or $closedIdHits -or $amazonDestinationHits -or $amazonImageHits -or $livePdfHash -ne $localPdfHash) {
    exit 1
}
