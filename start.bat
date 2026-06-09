@echo off
title French Center - Hoc tieng Phap
cd /d "%~dp0"

echo ================================
echo   French Center
echo   Hoc tieng Phap - Mien phi
echo ================================
echo.

:: ===== 1. Kiem tra / Cai dat Node.js =====
:check_node
where node >nul 2>nul
if %ERRORLEVEL% equ 0 goto node_ok

echo [1/4] Chua thay Node.js tren may tinh.
echo.
echo Dang thu cai dat tu dong...

:: Thu cai bang winget (Windows 10/11)
where winget >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Khong tim thay winget. Vui long cai Node.js bang tay:
    start https://nodejs.org/
    echo.
    echo Sau khi cai xong, chay lai file start.bat.
    pause
    exit /b 1
)

echo Dang tai va cai Node.js (co the mat vai phut)...
winget install -e --id OpenJS.NodeJS.LTS --silent --accept-source-agreements 2>&1 | findstr /V "Progress\|KiB\|B/s\|seconds"
if %ERRORLEVEL% neq 0 (
    echo.
    echo Cai dat that bai. Vui long cai bang tay:
    start https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo Da cai xong. Dang kiem tra lai...

:: Kiem tra trong PATH moi (co the can mo CMD moi)
where node >nul 2>nul
if %ERRORLEVEL% equ 0 goto node_ok

:: Thu tim truc tiep trong Program Files
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 goto node_ok
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 goto node_ok
)

echo.
echo Node.js da duoc cai nhung can mo lai file start.bat de cap nhat duong dan.
echo Vui long dong cua so nay va chay lai.
pause
exit /b 1

:node_ok
for /f "tokens=1" %%i in ('node -v') do set NODE_VER=%%i
echo [1/4] Node.js %NODE_VER% - OK

:: ===== 2. Cai dependencies =====
echo.
echo [2/4] Dang cai dependencies (lan dau co the lau)...

call npm install 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
echo Cai that bai. Thu lai bang cach chay lai file start.bat.
    echo Neu van loi, gui anh loi nay cho nguoi ho tro.
    pause
    exit /b 1
)
echo [2/4] Dependencies - OK

:: ===== 3. Xoa cache cu =====
echo.
echo [3/4] Dang don dep bo nho dem...
if exist ".next" (
    rmdir /s /q ".next"
    echo Da xoa cache cu.
) else (
    echo Khong co cache cu.
)
echo [3/4] Don dep - OK

:: ===== 4. Khoi dong =====
echo.
echo [4/4] Dang khoi dong ung dung...
echo.

:: Kiem tra cong 3000
netstat -ano | findstr ":3000 " >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Canh bao: Cong 3000 dang duoc su dung boi chuong trinh khac.
    echo Dang thu giai phong cong...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
        taskkill /f /pid %%a >nul 2>nul
    )
    ping 127.0.0.1 -n 3 >nul
    echo Da giai phong cong 3000.
    echo.
)

:: Mo server trong cua so rieng
echo Sau khi thay dong "Local: http://localhost:3000"
echo trong cua so moi, trinh duyet se tu dong mo.
echo.
start "French Center" cmd /c "npx next dev -p 3000"

:: Doi server chay (15 giay)
echo Dang cho server khoi dong (15 giay)...
ping 127.0.0.1 -n 16 >nul

:: Mo trinh duyet
start http://localhost:3000

echo.
echo ================================
echo   Thanh cong!
echo   Trinh duyet da duoc mo.
echo.
echo   *** LUU Y ***
echo   - Dong cua so "French Center" de tat server
echo   - Neu bi loi, chay lai file start.bat
echo   - Hotline: lien he nguoi ho tro
echo ================================
echo.
exit
