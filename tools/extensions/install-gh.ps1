# Install GitHub CLI (gh) on Windows without winget/choco.
# Adds gh to the current user PATH.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/install-gh.ps1

[CmdletBinding()]
param(
    [string]$Version = "2.63.2"
)

$ErrorActionPreference = "Stop"

$installDir = Join-Path $env:LOCALAPPDATA "Programs\GitHub CLI"
$ghExe      = Join-Path $installDir "gh.exe"

if (Test-Path $ghExe) {
    Write-Host "GitHub CLI already installed: $ghExe" -ForegroundColor Green
    & $ghExe --version
    exit 0
}

$zipUrl  = "https://github.com/cli/cli/releases/download/v$Version/gh_${Version}_windows_amd64.zip"
$zipPath = Join-Path $env:TEMP "gh_$Version.zip"
$extract = Join-Path $env:TEMP "gh_extract_$Version"

Write-Host "Downloading GitHub CLI v$Version..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
Expand-Archive -Path $zipPath -DestinationPath $extract -Force

New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item (Join-Path $extract "bin\gh.exe") $ghExe -Force

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*GitHub CLI*") {
    [Environment]::SetEnvironmentVariable("Path", "$installDir;$userPath", "User")
    Write-Host "Added to user PATH: $installDir" -ForegroundColor Green
}

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue

& $ghExe --version
Write-Host ""
Write-Host "Next: powershell -ExecutionPolicy Bypass -File scripts/gh-auth.ps1" -ForegroundColor Yellow
