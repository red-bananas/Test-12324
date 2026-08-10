# One-time Android SDK (CLI only, no Android Studio IDE).
# Usage: powershell -ExecutionPolicy Bypass -File tools\mobile\setup-android-cli.ps1

$ErrorActionPreference = "Stop"
$AndroidHome = "C:\Android"
$ZipUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"
$ZipPath = "$env:TEMP\commandlinetools-win.zip"
$ExpectedBytes = 157809664  # ~150.5 MB per Google checksum page
$SdkManager = Join-Path $AndroidHome "cmdline-tools\latest\bin\sdkmanager.bat"

function Download-WithProgress {
  param([string]$Url, [string]$OutFile, [long]$ExpectedSize)

  if (Test-Path $OutFile) {
    $existing = (Get-Item $OutFile).Length
    if ($existing -ge ($ExpectedSize * 0.98)) {
      Write-Host "==> Zip already complete ($([math]::Round($existing / 1MB, 1)) MB). Skipping download."
      return
    }
    Write-Host "==> Removing incomplete download ($([math]::Round($existing / 1MB, 1)) MB)..."
    Remove-Item $OutFile -Force
  }

  Write-Host "==> Downloading command-line tools (~150 MB)..."
  Write-Host "    URL: $Url"
  Write-Host "    To:  $OutFile"
  Write-Host ""

  # curl shows a live progress bar on Windows 10+
  $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curl) {
    & curl.exe -L --progress-bar -o $OutFile $Url
    if ($LASTEXITCODE -ne 0) { throw "curl download failed (exit $LASTEXITCODE)" }
  } else {
    # Fallback: byte progress via .NET
    Add-Type -AssemblyName System.Net.Http
    $handler = New-Object System.Net.Http.HttpClientHandler
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [TimeSpan]::FromMinutes(60)
    $response = $client.GetAsync($Url, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).Result
    $response.EnsureSuccessStatusCode() | Out-Null
    $total = $response.Content.Headers.ContentLength
    if (-not $total -or $total -le 0) { $total = $ExpectedSize }
    $stream = $response.Content.ReadAsStreamAsync().Result
    $file = [System.IO.File]::Open($OutFile, [System.IO.FileMode]::Create)
    try {
      $buffer = New-Object byte[] 81920
      $read = 0L
      $lastPct = -1
      while (($n = $stream.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $file.Write($buffer, 0, $n)
        $read += $n
        $pct = [math]::Min(100, [math]::Floor(100 * $read / $total))
        if ($pct -ne $lastPct -and ($pct % 2 -eq 0)) {
          $mb = [math]::Round($read / 1MB, 1)
          $totalMb = [math]::Round($total / 1MB, 1)
          Write-Host ("`r    Progress: {0,3}% ({1} / {2} MB)" -f $pct, $mb, $totalMb) -NoNewline
          $lastPct = $pct
        }
      }
      Write-Host ""
    } finally {
      $file.Close()
      $stream.Close()
      $client.Dispose()
    }
  }

  $final = (Get-Item $OutFile).Length
  Write-Host "==> Download complete: $([math]::Round($final / 1MB, 1)) MB"
}

Write-Host "==> Android SDK root: $AndroidHome"

if (-not (Test-Path $SdkManager)) {
  Download-WithProgress -Url $ZipUrl -OutFile $ZipPath -ExpectedSize $ExpectedBytes

  Write-Host "==> Extracting..."
  $extractRoot = Join-Path $env:TEMP "android-cmdline-extract"
  if (Test-Path $extractRoot) { Remove-Item -Recurse -Force $extractRoot }
  Expand-Archive -Path $ZipPath -DestinationPath $extractRoot -Force

  $latestDir = Join-Path $AndroidHome "cmdline-tools\latest"
  New-Item -ItemType Directory -Force -Path $latestDir | Out-Null

  $inner = Get-ChildItem $extractRoot -Directory | Select-Object -First 1
  if ($inner.Name -eq "cmdline-tools") {
    Copy-Item -Path (Join-Path $inner.FullName "*") -Destination $latestDir -Recurse -Force
  } else {
    Copy-Item -Path (Join-Path $extractRoot "*") -Destination $latestDir -Recurse -Force
  }

  Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
  Write-Host "==> Command-line tools installed."
} else {
  Write-Host "==> Command-line tools already present."
}

$env:ANDROID_HOME = $AndroidHome
$env:ANDROID_SDK_ROOT = $AndroidHome
$env:Path = "$AndroidHome\platform-tools;$AndroidHome\cmdline-tools\latest\bin;$env:Path"

Write-Host "==> Accepting SDK licenses..."
1..80 | ForEach-Object { "y" } | & $SdkManager --sdk_root=$AndroidHome --licenses 2>&1 | Out-Null

Write-Host "==> Installing platform-tools, platform 34, build-tools 34.0.0..."
& $SdkManager --sdk_root=$AndroidHome "platform-tools" "platforms;android-34" "build-tools;34.0.0"

Write-Host ""
Write-Host "Done. Add to your user PATH (once):"
Write-Host '  ANDROID_HOME = C:\Android'
Write-Host '  Path += C:\Android\platform-tools; C:\Android\cmdline-tools\latest\bin'
Write-Host ""
Write-Host "Verify phone:"
Write-Host "  adb devices"
