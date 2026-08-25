# run_daily_post.ps1
# This script runs the social_autopost.py script, alternating platforms based on the day of the year.
# Designed to be scheduled via Windows Task Scheduler (e.g., daily at 10:00 AM).

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BaseDir = Split-Path -Parent $ScriptDir

# Determine platform based on day of the year (alternating)
$DayOfYear = (Get-Date).DayOfYear
$Platform = if ($DayOfYear % 2 -eq 0) { "twitter" } else { "pinterest" }

Write-Host "Starting Daily Social Post for platform: $Platform"
Write-Host "Time: $(Get-Date)"

# Change to the base directory so Python finds the relative paths correctly
Set-Location $BaseDir

# First, run in dry-run to log what would be posted (optional safety net)
# python social_autopost.py --platform $Platform --dry-run

# Run the actual post
python social_autopost.py --platform $Platform

Write-Host "Daily post execution finished."
