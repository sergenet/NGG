$file = "c:\newgiftsandgadgets.com\public\index.html"
$content = Get-Content -Raw $file
$content = $content -replace "Get Weekly Gadget Picks", "Get Our Best Picks In Your Inbox"
$content = $content -replace "Subscribe to our newsletter to get our latest reviews, deals, and gift guides delivered straight to your inbox.", "Join smart shoppers who save hundreds with our weekly curated deals and expert gadget picks."
Set-Content -Path $file -Value $content -NoNewline
