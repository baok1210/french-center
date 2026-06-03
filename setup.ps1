# French Center - 1-Click Setup & Launch
# Right-click "Run with PowerShell" or run: powershell -File setup.ps1

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FRENCH CENTER" -ForegroundColor Cyan
Write-Host "  Student Evaluation System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    Write-Host "  Node.js $nodeVer - OK" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Download from: https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# 2. Install dependencies
Write-Host ""
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies (1-2 min)..."
    npm install --loglevel=error
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "  Dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Dependencies already installed." -ForegroundColor Green
}

# 3. Build
Write-Host ""
Write-Host "[3/4] Building application..." -ForegroundColor Yellow
npx next build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Build successful." -ForegroundColor Green

# 4. Start server
Write-Host ""
Write-Host "[4/4] Starting WebUI..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WebUI starting at http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo accounts (no Supabase needed):"
Write-Host "  - Admin:   admin@demo.com"
Write-Host "  - Teacher: teacher@demo.com"
Write-Host "  - Student: student@demo.com"
Write-Host ""
Write-Host "  Go to Settings to add OpenAI API key."
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing server on port 3000
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "next start" -or $_.CommandLine -match "next dev"
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start server using npm
$serverJob = Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList "/c title French Center && cd /d ""$rootDir"" && npm run start" -PassThru

# Wait for server to start (any HTTP response = ready)
Write-Host "  Waiting for server..." -NoNewline
$maxWait = 30
$serverReady = $false
for ($i = 0; $i -lt $maxWait; $i++) {
    Start-Sleep 1
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.ConnectAsync("127.0.0.1", 3000).Wait(2000)
        if ($tcp.Connected) {
            $tcp.Close()
            $serverReady = $true
            break
        }
        $tcp.Close()
    } catch {}
    Write-Host "." -NoNewline
}
Write-Host ""

if ($serverReady) {
    Write-Host "  Server ready!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  Timed out waiting for server." -ForegroundColor Yellow
    Write-Host "  Try opening http://localhost:3000 manually." -ForegroundColor Yellow
}

# Open browser
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "  WebUI opened in your browser!" -ForegroundColor Green
Write-Host "  Close this PowerShell window to stop the server."
Write-Host ""
Read-Host "Press Enter to exit"
