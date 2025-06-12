@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: CF Clearance Scraper - Windows 一键部署脚本
:: 双击即可自动安装和启动服务

title CF Clearance Scraper - Windows 一键部署

echo.
echo ===== CF Clearance Scraper Windows 一键部署 =====
echo 正在准备自动安装和启动服务...
echo.

:: 获取脚本所在目录
cd /d "%~dp0"

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ 检测到管理员权限
) else (
    echo ⚠ 建议以管理员权限运行此脚本以避免权限问题
    echo 继续安装...
)
echo.

:: [1/6] 检查 Chocolatey
echo [1/6] 检查包管理器 Chocolatey...
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo Chocolatey 未安装，正在安装...
    echo 这可能需要几分钟时间，请耐心等待...
    
    :: 安装 Chocolatey
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    :: 刷新环境变量
    call refreshenv.cmd >nul 2>&1
    
    if !errorLevel! neq 0 (
        echo ❌ Chocolatey 安装失败，尝试手动下载 Node.js...
        goto :manual_nodejs
    )
) else (
    echo ✓ Chocolatey 已安装
)

:: [2/6] 检查 Node.js
echo.
echo [2/6] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js 未安装，正在通过 Chocolatey 安装...
    choco install nodejs -y
    call refreshenv.cmd >nul 2>&1
    
    :: 再次检查
    where node >nul 2>&1
    if !errorLevel! neq 0 (
        goto :manual_nodejs
    )
) else (
    echo ✓ Node.js 已安装
    node --version
)
goto :continue_install

:manual_nodejs
echo.
echo ❌ 自动安装失败，请手动安装 Node.js：
echo 1. 访问 https://nodejs.org
echo 2. 下载并安装 LTS 版本
echo 3. 重新运行此脚本
echo.
pause
exit /b 1

:continue_install
:: [3/6] 检查 npm
echo.
echo [3/6] 检查 npm...
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ npm 未找到，Node.js 安装可能有问题
    goto :manual_nodejs
) else (
    echo ✓ npm 已安装
    npm --version
)

:: [4/6] 安装项目依赖
echo.
echo [4/6] 安装项目依赖...
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
) else (
    echo ✓ 依赖已安装，检查更新...
    npm ci
)

if %errorLevel% neq 0 (
    echo ❌ 依赖安装失败
    echo 请检查网络连接，或尝试运行: npm install
    pause
    exit /b 1
)

:: [5/6] 检查防火墙
echo.
echo [5/6] 检查防火墙设置...
echo 提示：如果 Windows 防火墙弹出询问，请选择"允许访问"

:: 尝试添加防火墙规则
netsh advfirewall firewall show rule name="CF Clearance Scraper" >nul 2>&1
if %errorLevel% neq 0 (
    echo 正在添加防火墙规则...
    netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
    if !errorLevel! == 0 (
        echo ✓ 防火墙规则已添加
    ) else (
        echo ⚠ 防火墙规则添加失败，可能需要手动允许
    )
) else (
    echo ✓ 防火墙规则已存在
)

:: [6/6] 检查端口占用
echo.
echo [6/6] 检查端口占用...
netstat -ano | findstr :3000 >nul 2>&1
if %errorLevel% == 0 (
    echo 端口 3000 已被占用，尝试关闭现有进程...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%i /F >nul 2>&1
    )
    timeout /t 2 >nul
)

:: 获取本机IP地址
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "LOCAL_IP=%%i"
    set "LOCAL_IP=!LOCAL_IP: =!"
    goto :got_ip
)
:got_ip

echo.
echo ===== 安装完成! =====
echo.
echo 正在启动 CF Clearance Scraper 服务...
echo 启动后服务地址：
echo   本地访问: http://localhost:3000
echo   监控面板: http://localhost:3000/monitor
if defined LOCAL_IP (
    echo   局域网访问: http://!LOCAL_IP!:3000
)
echo.
echo 按 Ctrl+C 停止服务
echo ----------------------------------------
echo.

:: 启动服务
set NODE_ENV=production
node src/index.js

:: 如果脚本意外退出，保持窗口打开
echo.
echo 服务已停止
pause