@echo off
cd /d "%~dp0"

:: French Center - 1-Click Launcher
:: Tries PowerShell first, falls back to cmd

where pwsh >nul 2>&1
if %errorlevel% equ 0 (
    pwsh -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
    pause
    exit /b
)

where powershell >nul 2>&1
if %errorlevel% equ 0 (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
    pause
    exit /b
)

:: Fallback: try batch-only mode (Node.js check + npm run dev)
cls
echo ==========================================
echo   FRENCH CENTER
echo ==========================================
echo.
echo [1/3] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required.
    echo Download from https://nodejs.org
    pause
    exit /b 1
)
echo   OK

echo.
echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo   Installing...
    call npm install --loglevel=error
    if %errorlevel% neq 0 (
        echo [ERROR] Install failed.
        pause
        exit /b 1
    )
)
echo   OK

echo.
echo [3/3] Starting...
echo.
echo   Server: http://localhost:3001
echo.
echo   Demo accounts:
echo   - admin@demo.com
echo   - teacher@demo.com
echo   - student@demo.com
echo.
start http://localhost:3001
npm run dev -- -p 3001
pause
