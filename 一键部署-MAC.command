#!/bin/bash

# CF Clearance Scraper - Mac 一键部署脚本
# 双击即可自动安装和启动服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}=== CF Clearance Scraper Mac 一键部署 ===${NC}"
echo "正在准备自动安装和启动服务..."
echo

# 检查并安装 Homebrew
echo -e "${YELLOW}[1/5] 检查 Homebrew...${NC}"
if ! command -v brew &> /dev/null; then
    echo "Homebrew 未安装，正在安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 添加 Homebrew 到 PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "✓ Homebrew 已安装"
fi

# 检查并安装 Node.js
echo -e "${YELLOW}[2/6] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，正在通过 Homebrew 安装..."
    brew install node
else
    echo "✓ Node.js 已安装 (版本: $(node --version))"
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${YELLOW}警告: Node.js 版本较低，建议升级到 16+ 版本${NC}"
    echo "正在升级 Node.js..."
    brew upgrade node
fi

# 检查并安装 Google Chrome
echo -e "${YELLOW}[3/6] 检查 Google Chrome...${NC}"
if ! [ -d "/Applications/Google Chrome.app" ]; then
    echo "Google Chrome 未安装，正在通过 Homebrew 安装..."
    brew install --cask google-chrome
    echo "✓ Google Chrome 安装完成"
else
    echo "✓ Google Chrome 已安装"
fi

# 安装项目依赖
echo -e "${YELLOW}[4/6] 安装项目依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖包..."
    npm install
else
    echo "✓ 依赖已安装，检查更新..."
    npm ci
fi

# 检查防火墙设置
echo -e "${YELLOW}[5/6] 检查系统设置...${NC}"
echo "提示：如果系统弹出防火墙询问，请选择"允许"以便局域网访问"

# 创建启动脚本
echo -e "${YELLOW}[6/6] 准备启动服务...${NC}"

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}端口 $PORT 已被占用，尝试关闭现有进程...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}=== 安装完成! ===${NC}"
echo
echo -e "${BLUE}正在启动 CF Clearance Scraper 服务...${NC}"
echo "启动后服务地址："
echo "  本地访问: http://localhost:3000"
echo "  监控面板: http://localhost:3000/monitor"
echo "  局域网访问: http://$(ipconfig getifaddr en0):3000 (如果连接WiFi)"
echo
echo "按 Ctrl+C 停止服务"
echo "----------------------------------------"

# 启动服务
export NODE_ENV=production
node src/index.js

# 如果脚本意外退出，保持终端打开
echo
echo -e "${RED}服务已停止${NC}"
echo "按任意键关闭窗口..."
read -n 1 -s