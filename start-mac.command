#!/bin/bash

# CF Clearance Scraper - Mac 快速启动脚本
# 用于已完成部署后的快速启动

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 启动 CF Clearance Scraper..."
echo

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先运行 一键部署-MAC.command"
    echo "按任意键关闭..."
    read -n 1 -s
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "❌ 依赖未安装，请先运行 一键部署-MAC.command"
    echo "按任意键关闭..."
    read -n 1 -s
    exit 1
fi

# 检查端口占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠ 端口 $PORT 已被占用，尝试关闭现有进程..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "服务地址："
echo "  本地访问: http://localhost:$PORT"
echo "  监控面板: http://localhost:$PORT/monitor"
# 获取局域网IP
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
if [ -n "$LAN_IP" ]; then
    echo "  局域网访问: http://$LAN_IP:$PORT"
else
    echo "  局域网访问: 请查看系统网络IP"
fi
echo
echo "按 Ctrl+C 停止服务"
echo "----------------------------------------"

# 启动服务
export NODE_ENV=production

# 检查启动文件
if [ -f "start.js" ]; then
    node start.js
elif [ -f "src/index.js" ]; then
    node src/index.js
else
    echo "❌ 找不到启动文件"
    echo "按任意键关闭..."
    read -n 1 -s
    exit 1
fi

echo
echo "服务已停止"
echo "按任意键关闭窗口..."
read -n 1 -s