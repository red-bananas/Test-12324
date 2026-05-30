# GitHub CLI login for this repo.
# Uses existing Git credential token when available (no browser needed if git push works).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/gh-auth.ps1

[CmdletBinding()]
param(
    [string]$Token = "",
    [string]$Repo = "tejas-veer/browser-extensions"
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

function Get-GitHubTokenFromCredentialManager {
    try {
        $cred = "protocol=https`nhost=github.com`n" | git credential fill 2>$null
        if ($cred -match '(?m)^password=(.+)$') {
            return $Matches[1]
        }
    } catch {}
    return $null
}

$gh = Get-GhExe

if (-not $Token) {
    $Token = Get-GitHubTokenFromCredentialManager
}

if ($Token) {
    $env:GH_TOKEN = $Token
    Write-Host "Using GitHub token from git credentials (GH_TOKEN)." -ForegroundColor Green
} else {
    Write-Host "Opening browser for GitHub login..." -ForegroundColor Cyan
    Write-Host "Choose: GitHub.com -> HTTPS -> Login with a web browser" -ForegroundColor Cyan
    & $gh auth login --hostname github.com --git-protocol https --web
}

& $gh auth status
Write-Host ""
Write-Host "Repo remote:" -ForegroundColor Cyan
& $gh repo view $Repo --json nameWithOwner,url -q ".nameWithOwner + `" -> `" + .url"
