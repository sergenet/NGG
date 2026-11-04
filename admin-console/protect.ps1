$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security
try {
  $request = [Console]::In.ReadToEnd() | ConvertFrom-Json
  $scope = [System.Security.Cryptography.DataProtectionScope]::CurrentUser
  if ($request.action -eq 'encrypt') {
    $bytes = [Text.Encoding]::UTF8.GetBytes([string]$request.value)
    [Console]::Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect($bytes, $null, $scope)))
  } elseif ($request.action -eq 'decrypt') {
    $bytes = [Convert]::FromBase64String([string]$request.value)
    [Console]::Write([Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, $scope)))
  } else { throw 'Unknown operation' }
} catch { [Console]::Error.Write('Windows credential protection failed.'); exit 1 }
