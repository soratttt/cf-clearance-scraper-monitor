@echo off
title CF Clearance Scraper - Windows Deploy

echo.
echo ========== CF Clearance Scraper ==========
echo Windows One-Click Deployment
echo.

cd /d "%~dp0"

:: Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js:
    echo 1. Visit: https://nodejs.org
    echo 2. Download LTS version ^(18+ recommended^)
    echo 3. Install and restart this script
    echo.
    echo Opening Node.js website...
    start https://nodejs.org
    pause
    exit /b 1
) else (
    echo [OK] Node.js found
    node --version
    echo.
)

:: Check Google Chrome
echo [2/5] Checking Google Chrome...
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Google Chrome found
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Google Chrome found
) else (
    echo [WARNING] Google Chrome not found!
    echo.
    echo Chrome is required for the service to work properly.
    echo Please install Google Chrome:
    echo 1. Visit: https://www.google.com/chrome
    echo 2. Download and install
    echo 3. Restart this script
    echo.
    echo Opening Chrome download page...
    start https://www.google.com/chrome
    echo.
    echo Press any key to continue anyway or Ctrl+C to exit...
    pause >nul
)

:: Install dependencies
echo.
echo [3/5] Installing dependencies...
if not exist "node_modules" (
    echo Installing packages, please wait...
    npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Installation failed, trying clean install...
        if exist "node_modules" rmdir /s /q "node_modules"
        if exist "package-lock.json" del "package-lock.json"
        npm install
        if %errorLevel% neq 0 (
            echo [ERROR] Installation failed. Please check internet connection.
            pause
            exit /b 1
        )
    )
    echo [OK] Dependencies installed successfully
) else (
    echo [OK] Dependencies already installed
    npm ci >nul 2>&1 || echo [INFO] Skipping dependency update
)

:: Install Python environment
echo.
echo [4/7] Installing Python environment...
where python >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Python not found!
    echo.
    echo Python is recommended for hCaptcha functionality:
    echo 1. Visit: https://www.python.org/downloads/
    echo 2. Download Python 3.8+ version
    echo 3. Install with "Add Python to PATH" checked
    echo.
    echo Opening Python download page...
    start https://www.python.org/downloads/
    echo.
    echo Press any key to continue without Python or Ctrl+C to exit...
    pause >nul
) else (
    echo [OK] Python found
    python --version
)

:: Install hCaptcha dependencies
echo.
echo [5/7] Installing hCaptcha dependencies...
if exist "captcha-solvers\hcaptcha" (
    cd captcha-solvers\hcaptcha
    if not exist "venv" (
        where python >nul 2>&1
        if %errorLevel% equ 0 (
            echo Creating Python virtual environment...
            python -m venv venv
            if %errorLevel% equ 0 (
                echo Installing hCaptcha dependencies...
                call venv\Scripts\activate.bat
                pip install --upgrade pip >nul 2>&1
                pip install -e hcaptcha-challenger/ >nul 2>&1
                if %errorLevel% equ 0 (
                    echo Installing Playwright browser...
                    playwright install chromium >nul 2>&1
                    if %errorLevel% equ 0 (
                        echo [OK] hCaptcha dependencies installed
                    ) else (
                        echo [WARNING] Playwright browser installation failed
                    )
                ) else (
                    echo [WARNING] hCaptcha dependencies installation failed
                )
                deactivate
            ) else (
                echo [WARNING] Virtual environment creation failed
            )
        ) else (
            echo [WARNING] Skipping hCaptcha installation ^(Python not available^)
        )
    ) else (
        echo [OK] hCaptcha virtual environment already exists
    )
    cd ..\..
) else (
    echo [WARNING] hCaptcha directory not found, skipping installation
)

:: Configure system and firewall
echo.
echo [6/7] Configuring system...
set PORT=3000
REM 🔧 修改上面这行的端口号

echo Configuring Windows Firewall...
netsh advfirewall firewall delete rule name="CF Clearance Scraper" >nul 2>&1
netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Firewall rule added for port %PORT%
) else (
    echo [WARNING] Could not configure firewall automatically
    echo Please manually allow port %PORT% in Windows Firewall if needed
)

:: Kill existing processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
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
echo   Local:    http://localhost:%PORT%
echo   Monitor:  http://localhost:%PORT%/monitor
if defined LAN_IP (
    echo   LAN:      http://%LAN_IP%:%PORT%
)
echo.
echo Press Ctrl+C to stop service
echo ====================================
echo.

:: Start service
echo.
echo [7/7] Starting service...
set NODE_ENV=production
set PORT=%PORT%

:: Check for startup file
if exist "start.js" (
    node start.js
) else if exist "src\index.js" (
    node src\index.js
) else (
    echo [ERROR] Startup file not found
    echo Looking for start.js or src\index.js
    pause
    exit /b 1
)

echo.
echo Service stopped.
pause