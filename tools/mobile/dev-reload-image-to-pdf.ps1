# One command: connect ADB + reverse Metro + relaunch Image to PDF.
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/mobile/dev-reload-image-to-pdf.ps1
#   powershell -ExecutionPolicy Bypass -File tools/mobile/dev-reload-image-to-pdf.ps1 -Port 41627

param([int]$Port = 0)

$connectScript = Join-Path $PSScriptRoot "adb-connect.ps1"
if ($Port -gt 0) {
  & powershell -ExecutionPolicy Bypass -File $connectScript -Port $Port -Launch
} else {
  & powershell -ExecutionPolicy Bypass -File $connectScript -Launch
}
