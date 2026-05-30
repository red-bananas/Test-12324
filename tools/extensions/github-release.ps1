# Verify CWS access, sync GitHub secrets, and trigger Release Extension workflow.
# Requires: gh auth (scripts/gh-auth.ps1), CHROME_* env vars for verify step.
#
# Usage:
#   pwsh -File scripts/github-release.ps1 -Extension utc-clock-pro -Version 2.0.1
#   pwsh -File scripts/github-release.ps1 -Extension utc-clock-pro -Version 2.0.1 -Watch
#   pwsh -File scripts/github-release.ps1 -Extension utc-clock-pro -Version 2.0.1 -SetSecrets

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("utc-clock-pro", "file-info", "formatkit")]
    [string]$Extension,

    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$Repo = "tejas-veer/Auto-App",

    [switch]$SetSecrets,
    [switch]$SkipVerify,
    [switch]$Watch,
    [switch]$UseTag
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

function Get-RegistryEntry($slug) {
    $registry = Get-Content (Join-Path $PSScriptRoot "extensions.json") -Raw | ConvertFrom-Json
    return $registry.extensions.$slug
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
    throw "Not logged in to GitHub. Run: powershell -ExecutionPolicy Bypass -File scripts/gh-auth.ps1"
}

$entry = Get-RegistryEntry $Extension
if (-not $entry) {
    throw "Unknown extension slug: $Extension"
}

$extensionId = $entry.chromeWebStoreId
if (-not $extensionId -and $entry.extensionIdSecret) {
    $extensionId = (Get-Item "Env:$($entry.extensionIdSecret)" -ErrorAction SilentlyContinue).Value
}

Write-Host "Extension: $Extension v$Version" -ForegroundColor Cyan
if ($extensionId) {
    Write-Host "CWS ID:    $extensionId" -ForegroundColor Cyan
}

if (-not $SkipVerify) {
    if (-not $env:CHROME_CLIENT_ID -or -not $env:CHROME_CLIENT_SECRET -or -not $env:CHROME_REFRESH_TOKEN) {
        Write-Warning "CHROME_CLIENT_ID/SECRET/REFRESH_TOKEN not set — skipping local CWS verify."
    } elseif ($entry.extensionIdSecret) {
        Set-Item -Path "Env:$($entry.extensionIdSecret)" -Value $extensionId
        Write-Host "Running local verify..." -ForegroundColor Cyan
        node (Join-Path $PSScriptRoot "verify-cws-item.mjs") $Extension
        if ($LASTEXITCODE -ne 0) { throw "CWS verify failed. Fix credentials or extension ID first." }
    }
}

if ($SetSecrets) {
    if (-not $extensionId) {
        throw "No chromeWebStoreId in extensions.json for $Extension"
    }

    $secretName = $entry.extensionIdSecret
    Write-Host "Setting GitHub secret $secretName..." -ForegroundColor Cyan
    & $gh secret set $secretName --body $extensionId --repo $Repo

    foreach ($name in @("CHROME_CLIENT_ID", "CHROME_CLIENT_SECRET", "CHROME_REFRESH_TOKEN")) {
        $value = (Get-Item "Env:$name" -ErrorAction SilentlyContinue).Value
        if ($value) {
            Write-Host "Setting GitHub secret $name..." -ForegroundColor Cyan
            & $gh secret set $name --body $value --repo $Repo
        }
    }
}

if ($UseTag) {
    $tag = "$Extension@v$Version"
    Write-Host "Creating and pushing tag $tag..." -ForegroundColor Cyan
    git tag -f $tag
    git push origin $tag --force
    Write-Host "Tag pushed. Workflow starts from tag push." -ForegroundColor Green
} else {
    Write-Host "Dispatching Release Extension workflow..." -ForegroundColor Cyan
    & $gh workflow run "extensions-release.yml" `
        --repo $Repo `
        -f extension=$Extension `
        -f version=$Version

    Start-Sleep -Seconds 3
    $run = & $gh run list --repo $Repo --workflow "extensions-release.yml" --limit 1 --json databaseId,status,url | ConvertFrom-Json
    if ($run) {
        Write-Host "Run: $($run[0].url)" -ForegroundColor Green
        if ($Watch) {
            & $gh run watch $run[0].databaseId --repo $Repo --exit-status
        }
    }
}

Write-Host ""
Write-Host "Check runs anytime:" -ForegroundColor Yellow
Write-Host "  gh run list --repo $Repo --workflow extensions-release.yml"
