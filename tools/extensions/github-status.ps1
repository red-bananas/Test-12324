# Quick GitHub Actions status for this repo (no browser needed).
#
# Usage:
#   pwsh -File scripts/github-status.ps1
#   pwsh -File scripts/github-status.ps1 -Watch

[CmdletBinding()]
param(
    [string]$Repo = "tejas-veer/browser-extensions",
    [switch]$Watch
)

$ErrorActionPreference = "Stop"

function Get-GhExe {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\GitHub CLI\gh.exe"),
        (Join-Path $env:ProgramFiles "GitHub CLI\gh.exe")
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }
    throw "gh not found. Run: powershell -ExecutionPolicy Bypass -File scripts/install-gh.ps1"
}

function Ensure-GhAuth {
    if ($env:GH_TOKEN) { return }
    try {
        $cred = "protocol=https`nhost=github.com`n" | git credential fill 2>$null
        if ($cred -match '(?m)^password=(.+)$') {
            $env:GH_TOKEN = $Matches[1]
        }
    } catch {}
}

$gh = Get-GhExe
Ensure-GhAuth
& $gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Not logged in. Run: powershell -ExecutionPolicy Bypass -File scripts/gh-auth.ps1"
}

Write-Host "Recent Release Extension runs:" -ForegroundColor Cyan
& $gh run list --repo $Repo --workflow "Release Extension" --limit 5

if ($Watch) {
    $latest = & $gh run list --repo $Repo --workflow "Release Extension" --limit 1 --json databaseId | ConvertFrom-Json
    if ($latest) {
        & $gh run watch $latest[0].databaseId --repo $Repo --exit-status
    }
}
