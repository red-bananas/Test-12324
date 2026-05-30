# Upload a built extension zip to Chrome Web Store and submit for review.
#
# Usage:
#   pwsh -File scripts/publish-cws.ps1 `
#     -ClientJsonPath "C:\path\to\client_secret.json" `
#     -RefreshToken "1//0g..." `
#     -ExtensionId "your-extension-id" `
#     -ZipPath "dist\utc-clock-pro\utc-clock-pro.zip"

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$ClientJsonPath,
    [Parameter(Mandatory = $true)][string]$RefreshToken,
    [Parameter(Mandatory = $true)][string]$ExtensionId,
    [Parameter(Mandatory = $true)][string]$ZipPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ZipPath)) {
    throw "Zip not found: $ZipPath"
}

$json   = Get-Content $ClientJsonPath -Raw | ConvertFrom-Json
$client = if ($json.installed) { $json.installed } else { $json.web }

Write-Host "Refreshing access token..." -ForegroundColor Cyan
$tokenResp = Invoke-RestMethod -Method Post `
    -Uri "https://oauth2.googleapis.com/token" `
    -Body @{
        client_id     = $client.client_id
        client_secret = $client.client_secret
        refresh_token = $RefreshToken
        grant_type    = "refresh_token"
    } `
    -ContentType "application/x-www-form-urlencoded"

$token = $tokenResp.access_token
if (-not $token) {
    throw "Failed to refresh access token."
}

$uploadUrl = "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$ExtensionId?uploadType=media"
$zipBytes  = [System.IO.File]::ReadAllBytes((Resolve-Path $ZipPath))

Write-Host "Uploading $ZipPath ($($zipBytes.Length) bytes)..." -ForegroundColor Cyan
try {
    $uploadResp = Invoke-RestMethod -Method Put `
        -Uri $uploadUrl `
        -Headers @{
            "Authorization"      = "Bearer $token"
            "x-goog-api-version" = "2"
        } `
        -ContentType "application/zip" `
        -Body $zipBytes
    $uploadResp | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Upload failed:" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    throw
}

Write-Host "Submitting for review (publish)..." -ForegroundColor Cyan
try {
    $publishResp = Invoke-RestMethod -Method Post `
        -Uri "https://www.googleapis.com/chromewebstore/v1.1/items/$ExtensionId/publish" `
        -Headers @{
            "Authorization"      = "Bearer $token"
            "x-goog-api-version" = "2"
        } `
        -ContentLength 0

    Write-Host ""
    Write-Host "SUCCESS - submitted for review." -ForegroundColor Green
    $publishResp | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Publish failed:" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    throw
}
