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

# 检测和安装Python环境
echo -e "${YELLOW}[5/8] 检测和安装Python环境...${NC}"

# 函数：比较版本号
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# 检查Python版本
check_python_version() {
    if command -v python3 &> /dev/null; then
        CURRENT_PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        if [ -n "$CURRENT_PYTHON_VERSION" ]; then
            echo "当前Python版本: $CURRENT_PYTHON_VERSION"
            if version_gt "3.10.0" "$CURRENT_PYTHON_VERSION"; then
                echo "[WARN]  Python版本过低 (需要 3.10+)，需要升级"
                return 1
            else
                echo "✓ Python版本符合要求 (版本: $CURRENT_PYTHON_VERSION)"
                return 0
            fi
        fi
    fi
    echo "Python3 未安装或版本检测失败"
    return 1
}

# 安装或升级Python
install_upgrade_python() {
    echo "正在安装/升级Python到最新版本..."
    
    # 首先确保Homebrew可用
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}错误: 需要先安装Homebrew${NC}"
        return 1
    fi
    
    # 更新Homebrew
    echo "更新Homebrew..."
    brew update &> /dev/null || echo "Homebrew更新失败，继续安装"
    
    # 安装最新版Python
    echo "安装最新版Python..."
    if brew install python@3.12 &> /dev/null; then
        echo "✓ Python 3.12 安装成功"
        
        # 创建软链接确保python3指向最新版本
        PYTHON_NEW_PATH="/opt/homebrew/bin/python3.12"
        if [ ! -f "$PYTHON_NEW_PATH" ]; then
            PYTHON_NEW_PATH="/usr/local/bin/python3.12"
        fi
        
        if [ -f "$PYTHON_NEW_PATH" ]; then
            # 更新PATH，优先使用新安装的Python
            export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
            
            # 验证安装
            if command -v python3 &> /dev/null; then
                NEW_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
                echo "✓ Python已更新到版本: $NEW_VERSION"
                return 0
            fi
        fi
    fi
    
    # 如果3.12失败，尝试3.11
    echo "尝试安装Python 3.11..."
    if brew install python@3.11 &> /dev/null; then
        echo "✓ Python 3.11 安装成功"
        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
        return 0
    fi
    
    # 最后尝试默认python
    echo "尝试安装默认Python..."
    if brew install python &> /dev/null; then
        echo "✓ Python 安装成功"
        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
        return 0
    fi
    
    echo -e "${RED}Python安装失败${NC}"
    return 1
}

# 执行Python检查和安装
if ! check_python_version; then
    echo "需要安装或升级Python..."
    if install_upgrade_python; then
        echo "验证Python安装..."
        if check_python_version; then
            echo "✓ Python环境配置完成"
        else
            echo -e "${YELLOW}警告: Python版本仍不符合要求，但继续安装（可能影响hCaptcha功能）${NC}"
        fi
    else
        echo -e "${YELLOW}警告: Python安装失败，继续安装（将影响hCaptcha功能）${NC}"
    fi
fi

# 安装Python验证码解决器依赖
echo -e "${YELLOW}[6/8] 安装Python验证码解决器依赖...${NC}"

# 检查统一依赖文件
CAPTCHA_SOLVERS_DIR="captcha-solvers"
UNIFIED_REQUIREMENTS="$CAPTCHA_SOLVERS_DIR/requirements.txt"

if command -v python3 &> /dev/null; then
    echo "开始安装统一的Python依赖..."
    
    # 升级pip
    echo "升级pip..."
    pip3 install --user --upgrade pip &> /dev/null
    
    # 安装统一依赖
    if [ -f "$UNIFIED_REQUIREMENTS" ]; then
        echo "从统一依赖文件安装包..."
        pip3 install --user -r "$UNIFIED_REQUIREMENTS" &> /dev/null
        if [ $? -eq 0 ]; then
            echo "✓ 统一依赖安装成功"
            DEPS_INSTALLED=true
        else
            echo -e "${YELLOW}警告: 统一依赖安装失败，尝试逐个安装...${NC}"
            DEPS_INSTALLED=false
        fi
    else
        echo -e "${YELLOW}未找到统一依赖文件，尝试手动安装核心包...${NC}"
        DEPS_INSTALLED=false
    fi
    
    # 如果统一安装失败，尝试手动安装核心包
    if [ "$DEPS_INSTALLED" = false ]; then
        echo "手动安装核心依赖包..."
        
        # hCaptcha 核心依赖
        echo "安装hCaptcha依赖..."
        pip3 install --user hcaptcha-challenger google-genai playwright opencv-python numpy pillow httpx loguru pydantic-settings &> /dev/null
        
        # reCaptcha 核心依赖
        echo "安装reCaptcha依赖..."
        pip3 install --user DrissionPage pydub SpeechRecognition &> /dev/null
        
        # 通用依赖
        echo "安装通用依赖..."
        pip3 install --user python-dotenv pathlib2 &> /dev/null
        
        if [ $? -eq 0 ]; then
            echo "✓ 核心依赖手动安装完成"
        else
            echo -e "${YELLOW}警告: 部分依赖安装失败${NC}"
        fi
    fi
    
    # 安装 Playwright 浏览器
    echo "安装Playwright浏览器..."
    python3 -m playwright install chromium &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Playwright浏览器安装完成"
    else
        echo -e "${YELLOW}警告: Playwright浏览器安装失败${NC}"
    fi
    
    # 测试关键包导入
    echo "测试依赖包导入..."
    python3 -c "
import sys
packages = [
    ('hcaptcha_challenger', 'hCaptcha Challenger'),
    ('DrissionPage', 'DrissionPage (reCAPTCHA)'),
    ('playwright', 'Playwright'),
    ('cv2', 'OpenCV'),
    ('pydub', 'PyDub (reCAPTCHA)'),
    ('speech_recognition', 'SpeechRecognition (reCAPTCHA)')
]

success_count = 0
for package, name in packages:
    try:
        __import__(package)
        print(f'  ✓ {name}')
        success_count += 1
    except ImportError:
        print(f'  [WARN] {name}: 导入失败')

print(f'[STATS] 导入结果: {success_count}/{len(packages)} 成功')
if success_count >= 4:
    print('[OK] 核心验证码解决器可用')
else:
    print('[WARN] 部分验证码功能可能不可用')
"
    
else
    echo -e "${YELLOW}警告: Python3不可用，跳过验证码解决器安装${NC}"
fi

# 检查防火墙设置
echo -e "${YELLOW}[7/8] 检查系统设置...${NC}"
echo "提示：如果系统弹出防火墙询问，请选择"允许"以便局域网访问"

# 创建启动脚本
echo -e "${YELLOW}[8/8] 准备启动服务...${NC}"

# 检查端口是否被占用
PORT=3000  # [CONFIG] 修改这里的端口号
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