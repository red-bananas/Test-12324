# Capture one Play Store raw screenshot from wireless ADB device.
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/mobile/capture-image-to-pdf-screenshot.ps1 -Name hub
#   powershell -ExecutionPolicy Bypass -File tools/mobile/capture-image-to-pdf-screenshot.ps1 -Name editor -Number 2
#
# Saves: apps/mobile/image-to-pdf/store/source/screenshot-{N}-{Name}-source.png

param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [int]$Number = 0,
  [string]$Serial = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$outDir = Join-Path $repoRoot "apps/mobile/image-to-pdf/store/source"
$adb = if ($env:ADB) { $env:ADB } elseif (Test-Path "C:\Android\platform-tools\adb.exe") { "C:\Android\platform-tools\adb.exe" } else { "adb" }

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

if ([string]::IsNullOrWhiteSpace($Serial)) {
  $configPath = Join-Path $PSScriptRoot "adb-device.local.json"
  if (-not (Test-Path $configPath)) {
    $configPath = Join-Path $PSScriptRoot "adb-device.example.json"
  }
  $cfg = Get-Content $configPath -Raw | ConvertFrom-Json
  $Serial = "{0}:{1}" -f $cfg.host, $cfg.port
}

if ($Number -le 0) {
  $existing = Get-ChildItem $outDir -Filter "screenshot-*-source.png" -ErrorAction SilentlyContinue
  $max = 0
  foreach ($file in $existing) {
    if ($file.Name -match '^screenshot-(\d+)-') {
      $n = [int]$Matches[1]
      if ($n -gt $max) { $max = $n }
    }
  }
  $Number = $max + 1
}

$outFile = Join-Path $outDir ("screenshot-{0}-{1}-source.png" -f $Number, $Name)
$remote = "/sdcard/itpdf-shot.png"

& $adb -s $Serial shell screencap -p $remote | Out-Null
& $adb -s $Serial pull $remote $outFile | Out-Null
& $adb -s $Serial shell rm $remote | Out-Null

Write-Host "Saved $outFile"
