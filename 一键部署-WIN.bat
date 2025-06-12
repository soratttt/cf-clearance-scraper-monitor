@echo off
title CF Clearance Scraper - Windows Deploy

echo.
echo ========== CF Clearance Scraper ==========
echo Windows One-Click Deployment
echo.

cd /d "%~dp0"

:: Check Node.js
echo [1/3] Checking Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js:
    echo 1. Visit: https://nodejs.org
    echo 2. Download LTS version
    echo 3. Install and restart this script
    echo.
    echo Opening Node.js website...
    start https://nodejs.org
    pause
    exit
) else (
    echo [OK] Node.js found: 
    node --version
)

:: Install dependencies
echo.
echo [2/3] Installing dependencies...
if not exist "node_modules" (
    npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Installation failed
        pause
        exit
    )
) else (
    echo [OK] Dependencies ready
)

:: Setup firewall
echo.
echo [3/3] Configuring system...
netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1

:: Kill existing processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Get LAN IP
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr 192.168') do (
    set "LAN_IP=%%i"
    set "LAN_IP=%LAN_IP: =%"
    goto :start
)

:start
echo.
echo ========== Ready to Start ==========
echo.
echo Service URLs:
echo   Local:    http://localhost:3000
echo   Monitor:  http://localhost:3000/monitor
if defined LAN_IP (
    echo   LAN:      http://%LAN_IP%:3000
)
echo.
echo Press Ctrl+C to stop service
echo ====================================
echo.

set NODE_ENV=production
node src/index.js

echo.
echo Service stopped.
pause