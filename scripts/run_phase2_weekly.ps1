# PowerShell script to automate weekly KPI reporting

# Define database connection parameters
$DbHost = "127.0.0.1"
$DbPort = "5522"

# Define the Python script to run
$PythonScript = "weekly_kpi_report.py"

# Run the Python script
Write-Output "Starting weekly KPI report generation..."
python $PythonScript --db --host $DbHost --port $DbPort

if ($LASTEXITCODE -eq 0) {
    Write-Output "Weekly KPI report generated successfully."
} else {
    Write-Output "Failed to generate weekly KPI report."
    exit $LASTEXITCODE
}

# Schedule next execution (example: every Monday at 8 AM)
# Note: Use Task Scheduler or a similar tool to schedule this script.