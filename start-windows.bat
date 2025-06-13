@echo off
title CF Clearance Scraper - Quick Start

echo.
echo CF Clearance Scraper - Quick Start
echo ================================
echo.

cd /d "%~dp0"

:: Check Node.js
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed
    echo Please run the deployment script first: 一键部署-WIN.bat
    echo.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found
    echo Please run the deployment script first: 一键部署-WIN.bat  
    echo.
    pause
    exit /b 1
)

:: Kill existing processes on port
set PORT=3000
echo Checking port %PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Stopping existing process on port %PORT%...
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
echo Service URLs:
echo   Local:    http://localhost:%PORT%
echo   Monitor:  http://localhost:%PORT%/monitor
if defined LAN_IP (
    echo   LAN:      http://%LAN_IP%:%PORT%
)
echo.
echo Press Ctrl+C to stop service
echo ============================
echo.

set NODE_ENV=production
set PORT=%PORT%

:: Check for startup file and start
if exist "start.js" (
    node start.js
) else if exist "src\index.js" (
    node src\index.js  
) else (
    echo [ERROR] Startup file not found
    pause
    exit /b 1
)

echo.
echo Service stopped.
pause