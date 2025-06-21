@echo off
:: 自动配置 Python 环境变量的 Batch 脚本
:: 需要以管理员权限运行

:: 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 请右键此脚本，选择"以管理员身份运行"！
    pause
    exit /b
)

:: 设置标题
title Python 环境自动配置工具

echo.
echo === 正在配置 Python 环境变量 ===
echo.

:: 1. 查找 Python 安装路径
set PYTHON_PATH=
echo 正在搜索 Python 安装路径...

:: 检查默认安装路径（如 C:\Python39）
for /d %%i in (C:\Python*) do (
    if exist "%%i\python.exe" (
        set PYTHON_PATH=%%i
    )
)

:: 如果未找到，检查用户 AppData 路径
if "%PYTHON_PATH%"=="" (
    for /d %%i in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
        if exist "%%i\python.exe" (
            set PYTHON_PATH=%%i
        )
    )
)

:: 如果仍然未找到，提示用户手动输入
if "%PYTHON_PATH%"=="" (
    echo 未找到 Python 安装路径，请手动输入（例如：C:\Python39）：
    set /p PYTHON_PATH="请输入 Python 安装路径："
)

if not exist "%PYTHON_PATH%\python.exe" (
    echo 错误：路径 "%PYTHON_PATH%" 无效，未找到 python.exe！
    pause
    exit /b
)

:: 2. 添加 Python 和 Scripts 到系统 PATH
echo.
echo 正在配置环境变量...
setx /M PATH "%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%PATH%"
if %errorLevel% neq 0 (
    echo 错误：无法设置环境变量！
    pause
    exit /b
)

:: 3. 修复 pip（运行 ensurepip）
echo.
echo 正在修复 pip...
call "%PYTHON_PATH%\python.exe" -m ensurepip --upgrade
call "%PYTHON_PATH%\python.exe" -m pip install --upgrade pip

:: 4. 验证配置
echo.
echo === 验证配置 ===
echo.
call "%PYTHON_PATH%\python.exe" --version
call "%PYTHON_PATH%\Scripts\pip.exe" --version

echo.
echo 配置完成！请重新启动 CMD/PowerShell 使环境变量生效。
pause