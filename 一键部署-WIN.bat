@echo off
title CF Clearance Scraper - Windows Deploy

REM Enable delayed variable expansion
setlocal EnableDelayedExpansion

REM Error handling setup
set "SCRIPT_ERROR=0"

REM Debug mode switch (set to 1 to enable debug output)
set "DEBUG_MODE=0"

echo.
echo ========== CF Clearance Scraper ==========
echo Windows One-Click Deployment v1.0.4
echo.

REM Check if debug mode is needed
if "%1"=="--debug" set "DEBUG_MODE=1"
if "%1"=="-d" set "DEBUG_MODE=1"

if %DEBUG_MODE%==1 (
    echo [DEBUG] Debug mode enabled. Use without --debug flag for normal operation.
    echo.
)

REM Add error handling to prevent immediate closure
set "ERROR_OCCURRED=0"

cd /d "%~dp0"

REM Check Node.js
echo [1/5] Checking Node.js...

REM Refresh environment variables - simple version for early execution
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%USERPROFILE%\AppData\Roaming\npm"

if %DEBUG_MODE%==1 (
    echo [DEBUG] Current PATH: %PATH%
)
echo.

REM Check multiple possible Node.js locations
set NODE_FOUND=0
set NODE_CMD=

REM First try where command
if %DEBUG_MODE%==1 echo [DEBUG] Trying 'where node' command...
where node >nul 2>&1
if %errorLevel% equ 0 (
    if %DEBUG_MODE%==1 echo [DEBUG] 'where node' succeeded
    set NODE_FOUND=1
    set NODE_CMD=node
    goto :node_found
) else (
    if %DEBUG_MODE%==1 echo [DEBUG] 'where node' failed with error level %errorLevel%
)

REM Check common installation paths
if %DEBUG_MODE%==1 echo [DEBUG] Checking %ProgramFiles%\nodejs\node.exe
if exist "%ProgramFiles%\nodejs\node.exe" (
    if %DEBUG_MODE%==1 echo [DEBUG] Found Node.js at Program Files
    set NODE_FOUND=1
    set NODE_CMD="%ProgramFiles%\nodejs\node.exe"
    set PATH=%ProgramFiles%\nodejs;%PATH%
    goto :node_found
)

if %DEBUG_MODE%==1 echo [DEBUG] Checking %ProgramFiles(x86)%\nodejs\node.exe
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    if %DEBUG_MODE%==1 echo [DEBUG] Found Node.js at Program Files (x86)
    set NODE_FOUND=1
    set NODE_CMD="%ProgramFiles(x86)%\nodejs\node.exe"
    set PATH=%ProgramFiles(x86)%\nodejs;%PATH%
    goto :node_found
)

REM Check user directory
if %DEBUG_MODE%==1 echo [DEBUG] Checking %USERPROFILE%\AppData\Roaming\npm\node.exe
if exist "%USERPROFILE%\AppData\Roaming\npm\node.exe" (
    if %DEBUG_MODE%==1 echo [DEBUG] Found Node.js at user AppData
    set NODE_FOUND=1
    set NODE_CMD="%USERPROFILE%\AppData\Roaming\npm\node.exe"
    set PATH=%USERPROFILE%\AppData\Roaming\npm;%PATH%
    goto :node_found
)

:node_not_found
echo [ERROR] Node.js not found!
echo.
echo Checked locations:
echo   - System PATH
echo   - %ProgramFiles%\nodejs\
echo   - %ProgramFiles(x86)%\nodejs\
echo   - %USERPROFILE%\AppData\Roaming\npm\
echo.
echo Please install Node.js:
echo 1. Visit: https://nodejs.org
echo 2. Download LTS version ^(18+ recommended^)
echo 3. Make sure to check "Add to PATH" during installation
echo 4. Restart this script after installation
echo.
echo Press any key to open Node.js website or Ctrl+C to exit...
pause >nul
start https://nodejs.org
echo.
echo Press any key to continue without Node.js or Ctrl+C to exit...
pause >nul
goto :check_chrome

:node_found
echo [OK] Node.js found
if %DEBUG_MODE%==1 echo [DEBUG] Using Node.js command: %NODE_CMD%
for /f "tokens=*" %%i in ('%NODE_CMD% --version 2^>nul') do set NODE_VERSION=%%i
if defined NODE_VERSION (
    echo Version: %NODE_VERSION%
) else (
    echo [WARNING] Could not get Node.js version, but executable found
)
echo.

:check_chrome
REM Check Google Chrome
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

REM Install dependencies
echo.
echo [3/5] Installing dependencies...

REM Set npm command path
set NPM_CMD=npm
if defined NODE_CMD (
    REM If Node.js found, try to find corresponding npm
    if exist "%ProgramFiles%\nodejs\npm.cmd" (
        set NPM_CMD="%ProgramFiles%\nodejs\npm.cmd"
    ) else if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" (
        set NPM_CMD="%ProgramFiles(x86)%\nodejs\npm.cmd"
    ) else if exist "%USERPROFILE%\AppData\Roaming\npm\npm.cmd" (
        set NPM_CMD="%USERPROFILE%\AppData\Roaming\npm\npm.cmd"
    )
)

if not exist "node_modules" (
    echo Installing packages, please wait...
    %NPM_CMD% install
    if %errorLevel% neq 0 (
        echo [ERROR] Installation failed, trying clean install...
        if exist "node_modules" rmdir /s /q "node_modules"
        if exist "package-lock.json" del "package-lock.json"
        %NPM_CMD% install
        if %errorLevel% neq 0 (
            echo [ERROR] Installation failed. Please check internet connection.
            echo [INFO] NPM Command used: %NPM_CMD%
            echo.
            echo Press any key to continue or Ctrl+C to exit...
            pause >nul
            goto :check_python
        )
    )
    echo [OK] Dependencies installed successfully
) else (
    echo [OK] Dependencies already installed
    %NPM_CMD% ci >nul 2>&1 || echo [INFO] Skipping dependency update
)

:check_python
REM Check and Install Python environment
echo.
echo [4/7] Checking and Installing Python environment...

REM Function to compare version numbers (Windows batch equivalent)
:check_python_version
setlocal
if exist "%~1\python.exe" (
    for /f "tokens=2" %%i in ('"%~1\python.exe" --version 2^>^&1') do set PYTHON_VERSION=%%i
) else if exist "%~1\python3.exe" (
    for /f "tokens=2" %%i in ('"%~1\python3.exe" --version 2^>^&1') do set PYTHON_VERSION=%%i
) else (
    endlocal & exit /b 1
)

REM Extract major and minor version
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    set MAJOR=%%a
    set MINOR=%%b
)

REM Check if version is 3.10+
if %MAJOR% LSS 3 (
    endlocal & exit /b 1
) else if %MAJOR% EQU 3 (
    if %MINOR% LSS 10 (
        endlocal & exit /b 1
    )
)

echo [OK] Python %PYTHON_VERSION% meets requirements
endlocal & exit /b 0

REM Check current Python installation
set PYTHON_FOUND=0
set PYTHON_CMD=

REM Check different possible Python locations
where python >nul 2>&1
if %errorLevel% equ 0 (
    call :check_python_version ""
    if %errorLevel% equ 0 (
        set PYTHON_FOUND=1
        set PYTHON_CMD=python
        goto :python_check_done
    ) else (
        for /f "delims=" %%i in ('where python') do (
            for /f "tokens=2" %%j in ('"%%i" --version 2^>^&1') do echo Current Python version: %%j
        )
        echo [WARNING] Python version too old (need 3.10+), will upgrade
    )
)

where python3 >nul 2>&1
if %errorLevel% equ 0 (
    call :check_python_version ""
    if %errorLevel% equ 0 (
        set PYTHON_FOUND=1
        set PYTHON_CMD=python3
        goto :python_check_done
    )
)

:python_check_done
if %PYTHON_FOUND% equ 0 (
    echo [INFO] Python 3.10+ not found, installing latest version...
    
    REM Check for package managers
    where choco >nul 2>&1
    if %errorLevel% equ 0 (
        echo Installing Python via Chocolatey...
        choco install python311 -y >nul 2>&1
        if %errorLevel% equ 0 (
            echo [OK] Python installed via Chocolatey
            set PYTHON_CMD=python
            goto :verify_python
        )
    )
    
    where winget >nul 2>&1
    if %errorLevel% equ 0 (
        echo Installing Python via WinGet...
        winget install Python.Python.3.11 --silent >nul 2>&1
        if %errorLevel% equ 0 (
            echo [OK] Python installed via WinGet
            set PYTHON_CMD=python
            goto :verify_python
        )
    )
    
    REM Manual installation
    echo [INFO] No package manager found, opening manual download...
    echo.
    echo Python installation required:
    echo 1. Visit: https://www.python.org/downloads/
    echo 2. Download Python 3.11+ version
    echo 3. Install with "Add Python to PATH" checked
    echo 4. Restart this script after installation
    echo.
    start https://www.python.org/downloads/
    echo Press any key to continue without Python or Ctrl+C to exit...
    pause >nul
    goto :skip_python_verify
)

:verify_python
REM Verify Python installation
where %PYTHON_CMD% >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=2" %%i in ('%PYTHON_CMD% --version 2^>^&1') do echo [OK] Python %%i is ready
) else (
    echo [WARNING] Python verification failed, but continuing...
)

:skip_python_verify

REM Install Python captcha solver dependencies
echo.
echo [5/7] Installing Python captcha solver dependencies...

REM Check unified requirements file
set CAPTCHA_SOLVERS_DIR=captcha-solvers
set UNIFIED_REQUIREMENTS=%CAPTCHA_SOLVERS_DIR%\requirements.txt

if defined PYTHON_CMD (
    echo Installing unified Python dependencies...
    
    REM Upgrade pip
    echo Upgrading pip...
    %PYTHON_CMD% -m pip install --user --upgrade pip >nul 2>&1
    
    REM Install unified dependencies
    if exist "%UNIFIED_REQUIREMENTS%" (
        echo Installing from unified requirements file...
        %PYTHON_CMD% -m pip install --user -r "%UNIFIED_REQUIREMENTS%" >nul 2>&1
        if %errorLevel% equ 0 (
            echo [OK] Unified dependencies installed successfully
            set DEPS_INSTALLED=true
        ) else (
            echo [WARNING] Unified dependencies installation failed, trying manual install...
            set DEPS_INSTALLED=false
        )
    ) else (
        echo [WARNING] Unified requirements file not found, trying manual install...
        set DEPS_INSTALLED=false
    )
    
    REM If unified installation failed, try manual installation
    if "%DEPS_INSTALLED%"=="false" (
        echo Installing core dependencies manually...
        
        REM hCaptcha core dependencies
        echo Installing hCaptcha dependencies...
        %PYTHON_CMD% -m pip install --user hcaptcha-challenger google-genai playwright opencv-python numpy pillow httpx loguru pydantic-settings >nul 2>&1
        
        REM reCaptcha core dependencies
        echo Installing reCaptcha dependencies...
        %PYTHON_CMD% -m pip install --user DrissionPage pydub SpeechRecognition >nul 2>&1
        
        REM Common dependencies
        echo Installing common dependencies...
        %PYTHON_CMD% -m pip install --user python-dotenv pathlib2 >nul 2>&1
        
        if %errorLevel% equ 0 (
            echo [OK] Core dependencies manually installed
        ) else (
            echo [WARNING] Some dependencies installation failed
        )
    )
    
    REM Install Playwright browser
    echo Installing Playwright browser...
    %PYTHON_CMD% -m playwright install chromium >nul 2>&1
    if %errorLevel% equ 0 (
        echo [OK] Playwright browser installed
    ) else (
        echo [WARNING] Playwright browser installation failed
    )
    
    REM Test key package imports
    echo Testing dependency imports...
    echo Testing hcaptcha_challenger...
    %PYTHON_CMD% -c "import hcaptcha_challenger; print('  [OK] hCaptcha Challenger')" 2>nul || echo   [WARNING] hCaptcha Challenger: Import failed
    echo Testing DrissionPage...
    %PYTHON_CMD% -c "import DrissionPage; print('  [OK] DrissionPage (reCAPTCHA)')" 2>nul || echo   [WARNING] DrissionPage: Import failed
    echo Testing playwright...
    %PYTHON_CMD% -c "import playwright; print('  [OK] Playwright')" 2>nul || echo   [WARNING] Playwright: Import failed
    echo Testing opencv...
    %PYTHON_CMD% -c "import cv2; print('  [OK] OpenCV')" 2>nul || echo   [WARNING] OpenCV: Import failed
    echo Testing pydub...
    %PYTHON_CMD% -c "import pydub; print('  [OK] PyDub (reCAPTCHA)')" 2>nul || echo   [WARNING] PyDub: Import failed
    echo Testing speech_recognition...
    %PYTHON_CMD% -c "import speech_recognition; print('  [OK] SpeechRecognition (reCAPTCHA)')" 2>nul || echo   [WARNING] SpeechRecognition: Import failed
    echo [INFO] Dependency test completed
    
) else (
    echo [WARNING] Python not available, skipping captcha solver installation
)

REM Configure system and firewall
echo.
echo [6/7] Configuring system...
set PORT=3000
REM Change the port number above

echo Configuring Windows Firewall...
netsh advfirewall firewall delete rule name="CF Clearance Scraper" >nul 2>&1
netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Firewall rule added for port %PORT%
) else (
    echo [WARNING] Could not configure firewall automatically
    echo Please manually allow port %PORT% in Windows Firewall if needed
)

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Create environment file if not exists
if not exist "..\..\env" (
    echo Creating default environment configuration...
    echo # CF Clearance Scraper Environment Configuration > ..\..\env
    echo PORT=%PORT% >> ..\..\env
    echo NODE_ENV=production >> ..\..\env
    echo BROWSER_LIMIT=20 >> ..\..\env
    echo TIMEOUT=60000 >> ..\..\env
    echo # GEMINI_API_KEY=your_actual_api_key_here >> ..\..\env
    echo [OK] Environment file created
)

REM Get LAN IP
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
echo Configuration:
echo   Python:   %PYTHON_CMD%
echo   Port:     %PORT%
echo   Captcha Solvers: hCaptcha + reCAPTCHA (if dependencies installed)
echo.
echo Press Ctrl+C to stop service
echo ====================================
echo.

REM Start service
echo.
echo [7/7] Starting service...
set NODE_ENV=production
set PORT=%PORT%

REM Check for startup file
if exist "start.js" (
    if defined NODE_CMD (
        %NODE_CMD% start.js
    ) else (
        node start.js
    )
) else if exist "src\index.js" (
    if defined NODE_CMD (
        %NODE_CMD% src\index.js
    ) else (
        node src\index.js
    )
) else (
    echo [ERROR] Startup file not found
    echo Looking for start.js or src\index.js
    pause
    exit /b 1
)

echo.
echo Service stopped.
pause
goto :end_script

REM ========== Function Definitions ==========

:refresh_env
REM Environment variable refresh function
call :debug_echo "Refreshing environment variables..."

REM Save current PATH
set "OriginalPath=%PATH%"

REM Re-read environment variables from registry
set "SysPath="
set "UserPath="

for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SysPath=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "UserPath=%%b"

REM Merge paths
if defined SysPath (
    if defined UserPath (
        set "PATH=%UserPath%;%SysPath%"
    ) else (
        set "PATH=%SysPath%"
    )
) else (
    call :debug_echo "Could not read system PATH from registry, keeping original"
)

REM Ensure common paths are included
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%USERPROFILE%\AppData\Roaming\npm"

call :debug_echo "Environment refresh completed"
goto :eof

:debug_echo
REM Debug output function
if %DEBUG_MODE%==1 (
    echo [DEBUG] %~1
)
goto :eof

:end_script
REM Script cleanup and exit
if %ERROR_OCCURRED%==1 (
    echo.
    echo [ERROR] Script encountered errors. Press any key to exit...
    pause >nul
)
exit /b 0