$ErrorActionPreference = 'Stop'
$panelUrl = 'http://127.0.0.1:48731'
$panelDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$panelData = Join-Path $env:LOCALAPPDATA 'NewGiftsAndGadgets\AdminPanel'
function Test-Panel {
  try { return (Invoke-RestMethod "$panelUrl/api/ping" -TimeoutSec 2).app -eq 'ngg-local-admin' } catch { return $false }
}
try {
  if (-not (Test-Panel)) {
    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    New-Item -ItemType Directory -Path $panelData -Force | Out-Null
    $serverPath = Join-Path $panelDir 'server.mjs'
    Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $panelDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $panelData 'server.log') -RedirectStandardError (Join-Path $panelData 'server-error.log')
    for ($attempt = 0; $attempt -lt 20; $attempt++) { if (Test-Panel) { break }; Start-Sleep -Milliseconds 500 }
    if (-not (Test-Panel)) { throw 'The local panel could not start. Check server-error.log in LocalAppData\NewGiftsAndGadgets\AdminPanel.' }
  }
  Start-Process $panelUrl
} catch {
  Add-Type -AssemblyName System.Windows.Forms
  [Windows.Forms.MessageBox]::Show($_.Exception.Message, 'NewGifts Admin') | Out-Null
  exit 1
}
