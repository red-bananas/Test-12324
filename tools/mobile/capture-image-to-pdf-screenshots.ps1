# Capture Play Store screenshots via dev screenshot bar + wireless ADB.
# Prereqs: Metro running, debug dev build on phone.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/mobile/capture-image-to-pdf-screenshots.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$singleScript = Join-Path $PSScriptRoot "capture-image-to-pdf-screenshot.ps1"
$adb = if ($env:ADB) { $env:ADB } elseif (Test-Path "C:\Android\platform-tools\adb.exe") { "C:\Android\platform-tools\adb.exe" } else { "adb" }

$configPath = Join-Path $PSScriptRoot "adb-device.local.json"
if (-not (Test-Path $configPath)) {
  $configPath = Join-Path $PSScriptRoot "adb-device.example.json"
}
$cfg = Get-Content $configPath -Raw | ConvertFrom-Json
$serial = "{0}:{1}" -f $cfg.host, $cfg.port
$package = $cfg.package
$activity = $cfg.activity

function Test-Metro {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8081/status" -UseBasicParsing -TimeoutSec 8
    return ($r.StatusCode -eq 200)
  } catch {
    return $false
  }
}

function Tap-TestId {
  param([string]$TestId)
  & $adb -s $serial shell uiautomator dump /sdcard/ui.xml | Out-Null
  $localXml = Join-Path $env:TEMP "itpdf-ui.xml"
  & $adb -s $serial pull /sdcard/ui.xml $localXml | Out-Null
  $xml = Get-Content $localXml -Raw
  $pattern = "content-desc=`"$([regex]::Escape($TestId))`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`""
  $match = [regex]::Match($xml, $pattern)
  if (-not $match.Success) {
    $pattern = "resource-id=`"[^`"]*:id/$([regex]::Escape($TestId))`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`""
    $match = [regex]::Match($xml, $pattern)
  }
  if (-not $match.Success) {
    throw "UI node not found for testID/content-desc: $TestId"
  }
  $x = [int](([int]$match.Groups[1].Value + [int]$match.Groups[3].Value) / 2)
  $y = [int](([int]$match.Groups[2].Value + [int]$match.Groups[4].Value) / 2)
  & $adb -s $serial shell input tap $x $y | Out-Null
}

function Launch-App {
  & $adb connect $serial | Out-Null
  & $adb -s $serial reverse "tcp:$($cfg.metroPort)" "tcp:$($cfg.metroPort)" | Out-Null
  & $adb -s $serial shell am force-stop $package | Out-Null
  Start-Sleep -Milliseconds 500
  & $adb -s $serial shell am start -W -n "${package}/${activity}" | Out-Null
}

if (-not (Test-Metro)) {
  throw "Metro not running on :8081. Start: cd apps/mobile/image-to-pdf && npx expo start"
}

Launch-App
Write-Host "Waiting for dev bundle..."
Start-Sleep -Seconds 8

$shots = @(
  @{ Number = 1; Name = "hub"; TestId = "screenshot-dev-hub"; Wait = 2 },
  @{ Number = 2; Name = "editor"; TestId = "screenshot-dev-editor"; Wait = 4 },
  @{ Number = 3; Name = "crop"; TestId = "screenshot-dev-crop"; Wait = 4 },
  @{ Number = 4; Name = "success"; TestId = "screenshot-dev-success"; Wait = 3 }
)

foreach ($shot in $shots) {
  Write-Host "==> $($shot.Name)"
  Tap-TestId -TestId $shot.TestId
  Start-Sleep -Seconds $shot.Wait
  & powershell -ExecutionPolicy Bypass -File $singleScript -Name $shot.Name -Number $shot.Number -Serial $serial | Write-Host
}

Write-Host ""
Write-Host "==> Building Play-ready 1080x1920 exports"
python (Join-Path $repoRoot "tools/mobile/prepare-play-store-images.py") image-to-pdf
Write-Host "Done. Upload files in apps/mobile/image-to-pdf/store/upload/"
