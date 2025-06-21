@echo off
title CF Clearance Scraper - Windows Deploy

echo.
echo ========== CF Clearance Scraper ==========
echo Windows One-Click Deployment v1.0.4
echo.

REM Change to script directory
cd /d "%~dp0"

REM Add common Node.js paths to environment
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%USERPROFILE%\AppData\Roaming\npm"

REM Check Node.js
echo [1/5] Checking Node.js...

REM Try to find Node.js
set NODE_FOUND=0
set NODE_CMD=

REM Method 1: Check if 'node' is in PATH
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Node.js found in PATH
    set NODE_FOUND=1
    set NODE_CMD=node
    node --version
    goto :chrome_check
)

REM Method 2: Check Program Files
if exist "%ProgramFiles%\nodejs\node.exe" (
    echo [OK] Node.js found at Program Files
    set NODE_FOUND=1
    set NODE_CMD="%ProgramFiles%\nodejs\node.exe"
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    "%ProgramFiles%\nodejs\node.exe" --version
    goto :chrome_check
)

REM Method 3: Check Program Files (x86)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    echo [OK] Node.js found at Program Files (x86)
    set NODE_FOUND=1
    set NODE_CMD="%ProgramFiles(x86)%\nodejs\node.exe"
    set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    "%ProgramFiles(x86)%\nodejs\node.exe" --version
    goto :chrome_check
)

REM Node.js not found
echo [ERROR] Node.js not found!
echo.
echo Please install Node.js:
echo 1. Visit: https://nodejs.org
echo 2. Download LTS version (18+ recommended)
echo 3. Make sure to check "Add to PATH" during installation
echo 4. Restart this script after installation
echo.
echo Press any key to open Node.js website...
pause >nul
start https://nodejs.org
echo.
echo Press any key to continue without Node.js...
pause >nul

:chrome_check
echo.
echo [2/5] Checking Google Chrome...
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Google Chrome found
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo [OK] Google Chrome found
) else (
    echo [WARNING] Google Chrome not found
    echo Chrome is recommended for proper operation
    echo You can install it from: https://www.google.com/chrome
)

echo.
echo [3/5] Installing Node.js dependencies...

REM Set npm command
set NPM_CMD=npm
if defined NODE_CMD (
    if exist "%ProgramFiles%\nodejs\npm.cmd" (
        set NPM_CMD="%ProgramFiles%\nodejs\npm.cmd"
    ) else if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" (
        set NPM_CMD="%ProgramFiles(x86)%\nodejs\npm.cmd"
    )
)

if not exist "node_modules" (
    echo Installing packages...
    %NPM_CMD% install
    if %errorLevel% neq 0 (
        echo [ERROR] Installation failed, trying clean install...
        if exist "node_modules" rmdir /s /q "node_modules"
        if exist "package-lock.json" del "package-lock.json"
        %NPM_CMD% install
        if %errorLevel% neq 0 (
            echo [ERROR] Installation failed
            echo Press any key to continue...
            pause >nul
            goto :python_check
        )
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

:python_check
echo.
echo [4/5] Checking Python...

REM Simple Python check
where python >nul 2>&1
if %errorLevel% equ 0 (
    python --version
    echo [OK] Python found
    set PYTHON_CMD=python
) else (
    where python3 >nul 2>&1
    if %errorLevel% equ 0 (
        python3 --version
        echo [OK] Python3 found
        set PYTHON_CMD=python3
    ) else (
        echo [WARNING] Python not found
        echo Python 3.10+ is recommended for captcha solving features
        echo You can install it from: https://python.org
    )
)

echo.
echo [5/5] Configuration...
set PORT=3000

echo.
echo ========== Setup Complete ==========
echo.
echo Service will start at:
echo   Local:    http://localhost:%PORT%
echo   Monitor:  http://localhost:%PORT%/monitor
echo.

if %NODE_FOUND%==1 (
    echo Starting service...
    echo Press Ctrl+C to stop
    echo.
    
    if exist "start.js" (
        %NODE_CMD% start.js
    ) else if exist "src\index.js" (
        %NODE_CMD% src\index.js
    ) else (
        echo [ERROR] No startup file found (start.js or src\index.js)
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
) else (
    echo [ERROR] Cannot start - Node.js not found
    echo Please install Node.js and run this script again
)

echo.
echo Service stopped.
pause