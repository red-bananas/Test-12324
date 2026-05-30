# Removes the empty legacy UTC Pro folder after closing that Cursor workspace.
$legacy = Join-Path (Split-Path $PSScriptRoot -Parent) "UTC Pro"

if (-not (Test-Path $legacy)) {
  Write-Host "Already removed: $legacy"
  exit 0
}

$items = Get-ChildItem $legacy -Force -ErrorAction SilentlyContinue
if ($items) {
  Write-Host "UTC Pro is not empty. Close Cursor workspace and delete manually."
  exit 1
}

Remove-Item -Force $legacy
Write-Host "Removed: $legacy"
