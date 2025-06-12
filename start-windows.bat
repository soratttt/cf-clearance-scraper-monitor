@echo off
chcp 65001 >nul
title CF Clearance Scraper - 快速启动

:: CF Clearance Scraper - Windows 快速启动脚本
:: 用于已完成部署后的快速启动

cd /d "%~dp0"

echo.
echo 🚀 启动 CF Clearance Scraper...
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js 未安装，请先运行 deploy-windows.bat
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules" (
    echo ❌ 依赖未安装，请先运行 deploy-windows.bat
    pause
    exit /b 1
)

:: 检查端口占用
netstat -ano | findstr :3000 >nul 2>&1
if %errorLevel% == 0 (
    echo ⚠ 端口 3000 已被占用，尝试关闭现有进程...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%i /F >nul 2>&1
    )
    timeout /t 2 >nul
)

:: 获取本机IP
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "LOCAL_IP=%%i"
    set "LOCAL_IP=!LOCAL_IP: =!"
    goto :got_ip
)
:got_ip

echo 服务地址：
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

echo.
echo 服务已停止
pause