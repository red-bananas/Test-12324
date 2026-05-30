# One-shot helper to obtain a Chrome Web Store refresh token.
# Reads OAuth client JSON, opens browser, catches redirect on localhost,
# exchanges authorization code for a refresh token, prints it.
#
# Usage:
#   pwsh -File scripts/get-refresh-token.ps1 -ClientJsonPath "C:\path\to\client_secret_xxx.json"
#   pwsh -File scripts/get-refresh-token.ps1 -ClientJsonPath "..." -LoginHint "you@example.com"
#
# Multi-account Chrome: UTC Clock Pro is on /u/1/ — pick that same Google account
# in the sign-in screen (prompt=select_account is enabled by default).

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ClientJsonPath,

    [string]$LoginHint = "",

    [int]$Port = 8765
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ClientJsonPath)) {
    throw "Client JSON not found: $ClientJsonPath"
}

$json   = Get-Content $ClientJsonPath -Raw | ConvertFrom-Json
$client = if ($json.installed) { $json.installed } else { $json.web }

if (-not $client.client_id -or -not $client.client_secret) {
    throw "Invalid client JSON: missing client_id / client_secret."
}

$redirectUri = "http://localhost:$Port/"
$scope       = "https://www.googleapis.com/auth/chromewebstore"
$state       = [guid]::NewGuid().ToString("N")

$authUrl = "https://accounts.google.com/o/oauth2/auth" +
           "?response_type=code" +
           "&client_id=$($client.client_id)" +
           "&redirect_uri=$([uri]::EscapeDataString($redirectUri))" +
           "&scope=$([uri]::EscapeDataString($scope))" +
           "&access_type=offline" +
           "&prompt=consent%20select_account" +
           "&state=$state"

if ($LoginHint) {
    $authUrl += "&login_hint=$([uri]::EscapeDataString($LoginHint))"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($redirectUri)
$listener.Start()

Write-Host ""
Write-Host "IMPORTANT (multi-account Chrome):" -ForegroundColor Yellow
Write-Host "  UTC Clock Pro lives on Chrome profile u/1:" -ForegroundColor Yellow
Write-Host "  https://chrome.google.com/u/1/webstore/devconsole/" -ForegroundColor DarkGray
Write-Host "  In the Google sign-in picker, choose the SAME account as that dashboard." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser for Google sign-in..." -ForegroundColor Cyan
Write-Host "If it does not open automatically, paste this URL:" -ForegroundColor DarkGray
Write-Host $authUrl -ForegroundColor DarkGray
Write-Host ""
Start-Process $authUrl

Write-Host "Waiting for redirect on $redirectUri ..." -ForegroundColor Cyan

$context  = $listener.GetContext()
$request  = $context.Request
$response = $context.Response

$code         = $request.QueryString["code"]
$returnState  = $request.QueryString["state"]
$errParam     = $request.QueryString["error"]

$html = "<html><body style='font-family:sans-serif;text-align:center;margin-top:80px;'>" +
        "<h2>You can close this tab.</h2>" +
        "<p>Refresh token will appear in the PowerShell window.</p></body></html>"
$buf = [Text.Encoding]::UTF8.GetBytes($html)
$response.ContentType = "text/html"
$response.ContentLength64 = $buf.Length
$response.OutputStream.Write($buf, 0, $buf.Length)
$response.OutputStream.Close()
$listener.Stop()

if ($errParam) { throw "OAuth error: $errParam" }
if ($returnState -ne $state) { throw "State mismatch (possible CSRF)." }
if (-not $code) { throw "No authorization code received." }

Write-Host "Auth code captured. Exchanging for refresh token..." -ForegroundColor Cyan

$body = @{
    client_id     = $client.client_id
    client_secret = $client.client_secret
    code          = $code
    grant_type    = "authorization_code"
    redirect_uri  = $redirectUri
}

$tokenResp = Invoke-RestMethod -Method Post `
    -Uri "https://oauth2.googleapis.com/token" `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded"

if (-not $tokenResp.refresh_token) {
    Write-Host ""
    Write-Host "Response did not contain refresh_token." -ForegroundColor Red
    Write-Host "Revoke prior consent at https://myaccount.google.com/permissions and re-run." -ForegroundColor Yellow
    $tokenResp | ConvertTo-Json -Depth 5
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SUCCESS - copy these into GitHub repo Secrets" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "CLIENT_ID:" -ForegroundColor Yellow
Write-Host $client.client_id
Write-Host ""
Write-Host "CLIENT_SECRET:" -ForegroundColor Yellow
Write-Host $client.client_secret
Write-Host ""
Write-Host "REFRESH_TOKEN:" -ForegroundColor Yellow
Write-Host $tokenResp.refresh_token
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Next: add EXTENSION_ID + the 3 above to:" -ForegroundColor Cyan
Write-Host "  https://github.com/tejas-veer/browser-extensions/settings/secrets/actions"
Write-Host ""
Write-Host "Then verify access (must print OK):" -ForegroundColor Cyan
Write-Host "  node scripts/verify-cws-item.mjs utc-clock-pro" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Then DELETE the client_secret JSON from Downloads." -ForegroundColor Magenta
