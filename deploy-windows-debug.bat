@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title CF Clearance Scraper - Windows 调试部署

echo.
echo ===== CF Clearance Scraper Windows 调试部署 =====
echo 开始诊断安装环境...
echo.

:: 获取脚本所在目录并显示
echo [调试] 当前工作目录: %cd%
cd /d "%~dp0"
echo [调试] 脚本所在目录: %cd%
echo.

:: 检查重要文件是否存在
echo [调试] 检查项目文件...
if exist "src\index.js" (
    echo ✓ 找到主程序文件: src\index.js
) else (
    echo ❌ 未找到主程序文件: src\index.js
    echo 请确保在CF Clearance Scraper项目根目录运行此脚本
    goto :error_exit
)

if exist "package.json" (
    echo ✓ 找到配置文件: package.json
) else (
    echo ❌ 未找到配置文件: package.json
    goto :error_exit
)

:: 检查管理员权限
echo.
echo [调试] 检查管理员权限...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ 检测到管理员权限
) else (
    echo ⚠ 建议以管理员权限运行此脚本
    echo 继续安装...
)
echo.

:: 检查 Node.js
echo [1/5] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js 未安装
    echo.
    echo 请选择安装方式:
    echo 1. 自动安装 (需要网络连接)
    echo 2. 手动安装 (推荐)
    echo.
    set /p choice="请输入选择 (1 或 2): "
    
    if "!choice!"=="1" (
        goto :auto_install_nodejs
    ) else (
        goto :manual_install_nodejs
    )
) else (
    echo ✓ Node.js 已安装
    node --version
    npm --version
)

:: 检查 npm
echo.
echo [2/5] 检查 npm...
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ npm 未找到，Node.js 安装可能有问题
    goto :manual_install_nodejs
) else (
    echo ✓ npm 已安装
)

:: 安装项目依赖
echo.
echo [3/5] 安装项目依赖...
if not exist "node_modules" (
    echo 正在安装依赖包...
    echo [调试] 运行命令: npm install
    npm install
    
    if !errorLevel! neq 0 (
        echo ❌ 依赖安装失败，错误代码: !errorLevel!
        echo.
        echo 可能的解决方案:
        echo 1. 检查网络连接
        echo 2. 清除npm缓存: npm cache clean --force
        echo 3. 删除node_modules文件夹后重试
        goto :error_exit
    )
) else (
    echo ✓ 依赖已安装，检查更新...
    npm ci
)

:: 检查防火墙
echo.
echo [4/5] 配置防火墙...
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

:: 检查端口占用
echo.
echo [5/5] 检查端口占用...
netstat -ano | findstr :3000 >nul 2>&1
if %errorLevel% == 0 (
    echo ⚠ 端口 3000 已被占用，尝试关闭现有进程...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000') do (
        echo [调试] 关闭进程 PID: %%i
        taskkill /PID %%i /F >nul 2>&1
    )
    timeout /t 2 >nul
) else (
    echo ✓ 端口 3000 可用
)

:: 获取本机IP地址
echo.
echo [调试] 获取网络信息...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "LOCAL_IP=%%i"
    set "LOCAL_IP=!LOCAL_IP: =!"
    goto :got_ip
)
:got_ip

echo.
echo ===== 安装完成! =====
echo.
echo [调试] 准备启动服务...
echo 启动后服务地址：
echo   本地访问: http://localhost:3000
echo   监控面板: http://localhost:3000/monitor
if defined LOCAL_IP (
    echo   局域网访问: http://!LOCAL_IP!:3000
)
echo.
echo 按任意键启动服务 (Ctrl+C 停止服务)...
pause >nul

echo.
echo [调试] 启动命令: node src/index.js
echo ----------------------------------------

:: 启动服务
set NODE_ENV=production
node src/index.js

goto :end

:auto_install_nodejs
echo.
echo 正在自动安装 Node.js...
echo 检查 Chocolatey...
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo 正在安装 Chocolatey...
    echo 这可能需要几分钟，请耐心等待...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    if !errorLevel! neq 0 (
        echo ❌ Chocolatey 安装失败
        goto :manual_install_nodejs
    )
    
    call refreshenv.cmd >nul 2>&1
)

echo 正在通过 Chocolatey 安装 Node.js...
choco install nodejs -y
call refreshenv.cmd >nul 2>&1

where node >nul 2>&1
if !errorLevel! neq 0 (
    goto :manual_install_nodejs
)

echo ✓ Node.js 安装成功
goto :continue_install

:manual_install_nodejs
echo.
echo ===== 手动安装 Node.js 指南 =====
echo.
echo 1. 打开浏览器访问: https://nodejs.org
echo 2. 下载 LTS 版本 (推荐)
echo 3. 运行下载的 .msi 安装包
echo 4. 安装完成后重新运行此脚本
echo.
echo 或者使用其他安装方式:
echo - Microsoft Store: 搜索 "Node.js"
echo - Winget: winget install OpenJS.NodeJS
echo.
goto :error_exit

:continue_install
echo [调试] 继续安装流程...
goto :check_npm

:check_npm
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ npm 未找到，请重新安装 Node.js
    goto :error_exit
)
goto :install_deps

:install_deps
:: 这里继续原来的安装依赖流程
goto :install_complete

:install_complete
echo [调试] 安装流程完成
goto :end

:error_exit
echo.
echo ===== 安装失败 =====
echo.
echo 常见解决方案:
echo 1. 以管理员身份运行此脚本
echo 2. 检查网络连接
echo 3. 手动安装 Node.js: https://nodejs.org
echo 4. 查看错误信息并搜索解决方案
echo.

:end
echo.
echo 按任意键退出...
pause >nul