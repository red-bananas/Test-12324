# Trigger Release Mobile App workflow (EAS build + Play Store submit).
#
# Usage:
#   pwsh -File tools/mobile/github-release.ps1 -App tile-merge -Version 1.0.0
#   pwsh -File tools/mobile/github-release.ps1 -App tile-merge -Version 1.0.0 -Profile preview -Submit:$false
#   pwsh -File tools/mobile/github-release.ps1 -App tile-merge -Version 1.0.0 -Watch
#   pwsh -File tools/mobile/github-release.ps1 -App tile-merge -Version 1.0.0 -UseTag

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("tile-merge")]
    [string]$App,

    [Parameter(Mandatory = $true)]
    [string]$Version,

    [ValidateSet("production", "preview")]
    [string]$Profile = "production",

    [string]$Repo = "tejas-veer/Auto-App",

    [switch]$Submit,
    [switch]$NoSubmit,
    [switch]$Watch,
    [switch]$UseTag
)

$ErrorActionPreference = "Stop"

if ($NoSubmit) {
    $submitFlag = "false"
} elseif ($Profile -eq "preview") {
    $submitFlag = "false"
} elseif ($Submit) {
    $submitFlag = "true"
} else {
    $submitFlag = "true"
}

function Get-GhExe {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\GitHub CLI\gh.exe"),
        (Join-Path $env:ProgramFiles "GitHub CLI\gh.exe")
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }
    throw "gh not found. Run: npm run gh:install"
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
    throw "Not logged in to GitHub. Run: npm run gh:auth"
}

Write-Host "Mobile app: $App v$Version (profile=$Profile, submit=$submitFlag)" -ForegroundColor Cyan

if ($UseTag) {
    $tag = "$App@v$Version"
    Write-Host "Creating tag $tag ..." -ForegroundColor Yellow
    git tag $tag
    git push origin $tag
    Write-Host "Pushed $tag — Release Mobile App workflow will run." -ForegroundColor Green
} else {
    Write-Host "Dispatching workflow Release Mobile App ..." -ForegroundColor Yellow
    & $gh workflow run "Release Mobile App" `
        --repo $Repo `
        -f app=$App `
        -f version=$Version `
        -f profile=$Profile `
        -f submit=$submitFlag
    if ($LASTEXITCODE -ne 0) { throw "gh workflow run failed" }
    Write-Host "Workflow dispatched." -ForegroundColor Green
}

if ($Watch) {
    Start-Sleep -Seconds 3
    & $gh run list --repo $Repo --workflow "Release Mobile App" --limit 1
    $runId = (& $gh run list --repo $Repo --workflow "Release Mobile App" --limit 1 --json databaseId -q '.[0].databaseId')
    if ($runId) {
        & $gh run watch $runId --repo $Repo --exit-status
    }
}
