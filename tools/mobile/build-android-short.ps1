# Build/install PixShrink on Windows (short path avoids CMake 250-char limit).
# Copies repo to C:\pix, builds there, installs to USB device.
# Usage: powershell -ExecutionPolicy Bypass -File tools\mobile\build-android-short.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$BuildRoot = "C:\pix"
$AppDir = "$BuildRoot\apps\mobile\image-toolkit"
$AppAndroid = "$AppDir\android"

$env:ANDROID_HOME = "C:\Android"
$env:ANDROID_SDK_ROOT = "C:\Android"
$env:GRADLE_USER_HOME = "C:\gradle"
$env:Path = "C:\Android\platform-tools;C:\Android\cmdline-tools\latest\bin;$env:Path"

Write-Host "==> Syncing repo to $BuildRoot (excludes node_modules, android, build caches)..."
if (-not (Test-Path $BuildRoot)) { New-Item -ItemType Directory -Path $BuildRoot | Out-Null }
robocopy $RepoRoot $BuildRoot /MIR /XD node_modules android .gradle .cxx dist .expo /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

Push-Location $AppDir
if (-not (Test-Path node_modules)) {
  Write-Host "==> npm install..."
  npm install
}
if (-not (Test-Path android)) {
  Write-Host "==> expo prebuild..."
  npx expo prebuild --platform android
}
Pop-Location

$gradleProps = Join-Path $AppAndroid "gradle.properties"
(Get-Content $gradleProps) `
  -replace 'reactNativeArchitectures=.*', 'reactNativeArchitectures=arm64-v8a' |
  Set-Content $gradleProps

$devices = adb devices | Select-String "device$"
if (-not $devices) {
  Write-Warning "No USB device detected. Plug in phone, enable USB debugging, then re-run."
}

Write-Host "==> Gradle installDebug (first build ~20-90 min; keep phone connected)..."
Push-Location $AppAndroid
.\gradlew.bat installDebug -PreactNativeDevServerPort=8083
Pop-Location

$apk = "$AppAndroid\app\build\outputs\apk\debug\app-debug.apk"
if ((Test-Path $apk) -and -not $devices) {
  Write-Host "APK ready: $apk"
  Write-Host "When phone is connected: adb install -r `"$apk`""
}
