# Connect wireless ADB, keep a longer dev session, reverse Metro, optionally launch app.
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/mobile/adb-connect.ps1
#   powershell -ExecutionPolicy Bypass -File tools/mobile/adb-connect.ps1 -Launch
#   powershell -ExecutionPolicy Bypass -File tools/mobile/adb-connect.ps1 -Port 41627 -Launch
#
# Copy adb-device.example.json -> adb-device.local.json and edit host/port once.
# When the phone shows a new wireless port, update only "port" in adb-device.local.json.

param(
  [string]$ConfigPath = "",
  [string]$HostName = "",
  [int]$Port = 0,
  [int]$MetroPort = 0,
  [string]$Package = "",
  [string]$Activity = "",
  [switch]$Launch,
  [switch]$SkipKeepAlive
)

$ErrorActionPreference = "Stop"

function Get-AdbPath {
  if ($env:ADB) { return $env:ADB }
  $candidate = "C:\Android\platform-tools\adb.exe"
  if (Test-Path $candidate) { return $candidate }
  return "adb"
}

function Read-DeviceConfig {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    throw "Missing config: $Path`nCopy tools/mobile/adb-device.example.json to tools/mobile/adb-device.local.json"
  }
  return Get-Content $Path -Raw | ConvertFrom-Json
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
if (-not $ConfigPath) {
  $ConfigPath = Join-Path $PSScriptRoot "adb-device.local.json"
  if (-not (Test-Path $ConfigPath)) {
    $ConfigPath = Join-Path $PSScriptRoot "adb-device.example.json"
  }
}

$config = Read-DeviceConfig -Path $ConfigPath
$adb = Get-AdbPath
$targetHost = if ($HostName) { $HostName } else { [string]$config.host }
$targetPort = if ($Port -gt 0) { $Port } else { [int]$config.port }
$targetMetro = if ($MetroPort -gt 0) { $MetroPort } else { [int]$config.metroPort }
$targetPackage = if ($Package) { $Package } else { [string]$config.package }
$targetActivity = if ($Activity) { $Activity } else { [string]$config.activity }
$screenTimeoutMs = if ($config.screenTimeoutMs) { [int]$config.screenTimeoutMs } else { 1800000 }
$serial = "${targetHost}:${targetPort}"

Write-Host "==> ADB connect $serial"
& $adb connect $serial | Write-Host
Start-Sleep -Milliseconds 400

$devicesOutput = (& $adb devices 2>&1 | Out-String).Trim()
$devicePattern = "$([regex]::Escape($serial))\s+device"
if ($devicesOutput -notmatch $devicePattern) {
  throw "Device not online. Open Wireless debugging on the phone and update port in adb-device.local.json."
}

Write-Host "==> Metro reverse tcp:$targetMetro -> tcp:$targetMetro"
& $adb -s $serial reverse "tcp:${targetMetro}" "tcp:${targetMetro}" | Write-Host

if (-not $SkipKeepAlive) {
  Write-Host "==> Dev keepalive (screen timeout ${screenTimeoutMs}ms, stay awake while charging)"
  & $adb -s $serial shell settings put system screen_off_timeout $screenTimeoutMs | Out-Null
  & $adb -s $serial shell settings put global stay_on_while_plugged_in 7 | Out-Null
  & $adb -s $serial shell settings put global adb_wifi_enabled 1 2>$null | Out-Null
}

if ($Launch) {
  Write-Host "==> Launch $targetPackage$targetActivity"
  & $adb -s $serial shell am force-stop $targetPackage | Out-Null
  & $adb -s $serial shell am start -n "${targetPackage}/${targetActivity}" | Write-Host
}

Write-Host "==> Ready. Device $serial | Metro localhost:$targetMetro"
Write-Host "    Tip: run tools/mobile/adb-watch.ps1 in another terminal to auto-reconnect."
