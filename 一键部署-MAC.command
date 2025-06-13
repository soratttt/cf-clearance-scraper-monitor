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
    if [ $? -ne 0 ]; then
        echo -e "${RED}Node.js 安装失败，请手动安装${NC}"
        echo "请访问 https://nodejs.org 下载安装包"
        echo "按任意键关闭..."
        read -n 1 -s
        exit 1
    fi
else
    echo "✓ Node.js 已安装 (版本: $(node --version))"
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${YELLOW}警告: Node.js 版本过低 (需要 16+)，正在升级...${NC}"
    brew upgrade node || {
        echo -e "${RED}升级失败，但可以继续运行${NC}"
    }
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
    if [ $? -ne 0 ]; then
        echo -e "${RED}依赖安装失败，尝试清理后重新安装...${NC}"
        rm -rf node_modules package-lock.json
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}安装失败，请检查网络连接${NC}"
            echo "按任意键关闭..."
            read -n 1 -s
            exit 1
        fi
    fi
else
    echo "✓ 依赖已安装，检查更新..."
    npm ci || npm install
fi

# 安装Python环境
echo -e "${YELLOW}[5/8] 安装Python环境...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "Python3 未安装，正在通过 Homebrew 安装..."
    brew install python
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}警告: Python3 安装失败，但可以继续运行（仅影响hCaptcha功能）${NC}"
    fi
else
    echo "✓ Python3 已安装 (版本: $(python3 --version))"
fi

# 安装hCaptcha依赖
echo -e "${YELLOW}[6/8] 安装hCaptcha依赖...${NC}"
HCAPTCHA_DIR="captcha-solvers/hcaptcha"
if [ -d "$HCAPTCHA_DIR" ] && command -v python3 &> /dev/null; then
    cd "$HCAPTCHA_DIR"
    
    # 检查是否已经存在虚拟环境
    if [ ! -d "venv" ]; then
        echo "创建 Python 虚拟环境..."
        python3 -m venv venv
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}警告: 虚拟环境创建失败，将使用系统 Python${NC}"
            cd "$SCRIPT_DIR"
        else
            # 激活虚拟环境并安装依赖
            source venv/bin/activate
            echo "安装 hCaptcha 依赖包..."
            pip install --upgrade pip &> /dev/null
            pip install -r requirements.txt &> /dev/null
            if [ $? -eq 0 ]; then
                echo "安装 Playwright 浏览器..."
                playwright install chromium &> /dev/null
                if [ $? -eq 0 ]; then
                    echo "✓ hCaptcha 依赖安装完成"
                else
                    echo -e "${YELLOW}警告: Playwright 浏览器安装失败${NC}"
                fi
            else
                echo -e "${YELLOW}警告: hCaptcha 依赖安装失败${NC}"
            fi
            deactivate
            cd "$SCRIPT_DIR"
        fi
    else
        echo "✓ hCaptcha 虚拟环境已存在"
        cd "$SCRIPT_DIR"
    fi
else
    echo -e "${YELLOW}警告: 跳过 hCaptcha 安装（Python3 不可用或目录不存在）${NC}"
fi

# 检查防火墙设置
echo -e "${YELLOW}[7/8] 检查系统设置...${NC}"
echo "提示：如果系统弹出防火墙询问，请选择"允许"以便局域网访问"

# 创建启动脚本
echo -e "${YELLOW}[8/8] 准备启动服务...${NC}"

# 检查端口是否被占用
PORT=3000  # 🔧 修改这里的端口号
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}端口 $PORT 已被占用，尝试关闭现有进程...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}=== 安装完成! ===${NC}"
echo
echo -e "${BLUE}正在启动 CF Clearance Scraper 服务...${NC}"
echo "启动后服务地址："
echo "  本地访问: http://localhost:$PORT"
echo "  监控面板: http://localhost:$PORT/monitor"
# 获取局域网IP
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "未知")
if [ "$LAN_IP" != "未知" ]; then
    echo "  局域网访问: http://$LAN_IP:$PORT"
else
    echo "  局域网访问: 请查看系统偏好设置中的网络IP"
fi
echo
echo "按 Ctrl+C 停止服务"
echo "----------------------------------------"

# 启动服务
export NODE_ENV=production
export PORT=$PORT

# 检查启动文件
if [ -f "start.js" ]; then
    node start.js
elif [ -f "src/index.js" ]; then
    node src/index.js
else
    echo -e "${RED}找不到启动文件${NC}"
    echo "按任意键关闭..."
    read -n 1 -s
    exit 1
fi

# 如果脚本意外退出，保持终端打开
echo
echo -e "${RED}服务已停止${NC}"
echo "按任意键关闭窗口..."
read -n 1 -s