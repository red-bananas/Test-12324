# Sanity-check Chrome Web Store credentials by calling the items API.
# Reads OAuth client JSON for client_id/secret, takes refresh_token + extension_id
# as parameters, prints the API response.
#
# Usage:
#   pwsh -File scripts/verify-cws-credentials.ps1 `
#     -ClientJsonPath "C:\path\to\client_secret_xxx.json" `
#     -RefreshToken "1//0g..." `
#     -ExtensionId "abcdefghijklmnopqrstuvwxyzabcdef"

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string]$ClientJsonPath,
    [Parameter(Mandatory = $true)] [string]$RefreshToken,
    [Parameter(Mandatory = $true)] [string]$ExtensionId
)

$ErrorActionPreference = "Stop"

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

if (-not $tokenResp.access_token) {
    throw "Failed to refresh access token: $($tokenResp | ConvertTo-Json)"
}

Write-Host "Calling Web Store API for item $ExtensionId ..." -ForegroundColor Cyan
try {
    $itemResp = Invoke-RestMethod `
        -Uri "https://www.googleapis.com/chromewebstore/v1.1/items/$ExtensionId?projection=DRAFT" `
        -Headers @{
            "Authorization"     = "Bearer $($tokenResp.access_token)"
            "x-goog-api-version" = "2"
        }

    Write-Host ""
    Write-Host "SUCCESS" -ForegroundColor Green
    $itemResp | ConvertTo-Json -Depth 5
} catch {
    Write-Host ""
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
}
