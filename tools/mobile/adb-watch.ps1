# Auto-reconnect wireless ADB when the phone drops the session.
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/mobile/adb-watch.ps1
# Leave this running while you code. Update port in adb-device.local.json when it changes.

param(
  [string]$ConfigPath = "",
  [int]$IntervalSeconds = 0
)

$ErrorActionPreference = "Continue"
$connectScript = Join-Path $PSScriptRoot "adb-connect.ps1"

if (-not $ConfigPath) {
  $ConfigPath = Join-Path $PSScriptRoot "adb-device.local.json"
  if (-not (Test-Path $ConfigPath)) {
    $ConfigPath = Join-Path $PSScriptRoot "adb-device.example.json"
  }
}

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$interval = if ($IntervalSeconds -gt 0) { $IntervalSeconds } else { [int]$config.watchIntervalSeconds }
if ($interval -lt 10) { $interval = 10 }

$adb = if ($env:ADB) { $env:ADB } elseif (Test-Path "C:\Android\platform-tools\adb.exe") { "C:\Android\platform-tools\adb.exe" } else { "adb" }
$serial = "$($config.host):$($config.port)"

Write-Host "==> ADB watch for $serial every ${interval}s (Ctrl+C to stop)"

while ($true) {
  $online = $false
  try {
    $devicesOutput = (& $adb devices 2>&1 | Out-String).Trim()
    $devicePattern = "$([regex]::Escape($serial))\s+device"
    if ($devicesOutput -match $devicePattern) {
      $online = $true
    }
  } catch {
    $online = $false
  }

  if (-not $online) {
    $stamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$stamp] Reconnecting $serial..."
    try {
      & powershell -ExecutionPolicy Bypass -File $connectScript -ConfigPath $ConfigPath -SkipKeepAlive | Out-Host
    } catch {
      Write-Host "[$stamp] Connect failed - check wireless debugging port on phone."
    }
  }

  Start-Sleep -Seconds $interval
}
