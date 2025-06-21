#!/bin/bash

# hCaptcha 部署自检脚本
# 用于一键部署后自动验证配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[DEBUG] hCaptcha 部署自检开始...${NC}"
echo

# 检查当前目录 - 现在脚本在tests目录中
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

if [ ! -f "package.json" ]; then
    echo -e "${RED}[FAIL] 错误: 无法找到项目根目录${NC}"
    exit 1
fi

# 1. 检查 .env 文件
echo -e "${YELLOW}[1/5] 检查环境配置...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}[FAIL] .env 文件不存在${NC}"
    exit 1
fi

# 检查 API 密钥
if grep -q "GEMINI_API_KEY=your_actual_gemini_api_key_here" .env; then
    echo -e "${RED}[FAIL] Gemini API 密钥未配置${NC}"
    echo -e "${YELLOW}[INFO] 请编辑 .env 文件，设置正确的 GEMINI_API_KEY${NC}"
    exit 1
elif grep -q "GEMINI_API_KEY=AIza" .env; then
    echo -e "${GREEN}[OK] Gemini API 密钥已配置${NC}"
else
    echo -e "${YELLOW}[WARN]  请检查 GEMINI_API_KEY 配置格式${NC}"
fi

# 2. 检查 Node.js 依赖
echo -e "${YELLOW}[2/5] 检查 Node.js 依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${RED}[FAIL] node_modules 不存在，正在安装依赖...${NC}"
    npm install
fi
echo -e "${GREEN}[OK] Node.js 依赖检查完成${NC}"

# 3. 检查 Python 环境
echo -e "${YELLOW}[3/5] 检查 Python 环境...${NC}"
HCAPTCHA_DIR="captcha-solvers/hcaptcha"
if [ ! -d "$HCAPTCHA_DIR/venv" ]; then
    echo -e "${RED}[FAIL] Python 虚拟环境不存在${NC}"
    echo -e "${YELLOW}[INFO] 请运行一键部署脚本安装 Python 环境${NC}"
    exit 1
fi

# 检查 Python 包
cd "$HCAPTCHA_DIR"
if source venv/bin/activate 2>/dev/null && python -c "import hcaptcha_challenger" 2>/dev/null; then
    echo -e "${GREEN}[OK] hcaptcha-challenger 已安装${NC}"
else
    echo -e "${RED}[FAIL] hcaptcha-challenger 未正确安装${NC}"
    exit 1
fi

if source venv/bin/activate 2>/dev/null && python -c "from playwright.async_api import async_playwright" 2>/dev/null; then
    echo -e "${GREEN}[OK] Playwright 已安装${NC}"
else
    echo -e "${RED}[FAIL] Playwright 未正确安装${NC}"
    exit 1
fi
cd - > /dev/null

# 4. 检查端口
echo -e "${YELLOW}[4/5] 检查端口配置...${NC}"
PORT=$(grep "PORT=" .env | cut -d'=' -f2 | tr -d ' ')
if [ -z "$PORT" ]; then
    PORT=3000
fi

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}[OK] 服务已在端口 $PORT 运行${NC}"
    SERVICE_RUNNING=true
else
    echo -e "${YELLOW}[WARN]  端口 $PORT 未被占用，服务可能未启动${NC}"
    SERVICE_RUNNING=false
fi

# 5. 提供测试命令
echo -e "${YELLOW}[5/5] 生成测试命令...${NC}"
echo
echo -e "${BLUE}[LIST] 部署检查完成！${NC}"
echo
echo -e "${GREEN}[TEST] 测试命令:${NC}"
echo -e "  ${BLUE}完整测试:${NC} node tests/test_hcaptcha_deployment.js"
echo -e "  ${BLUE}快速测试:${NC} node tests/quick_test.js"
if [ "$SERVICE_RUNNING" = true ]; then
    echo -e "  ${BLUE}在线测试:${NC} node tests/quick_test.js --host localhost --port $PORT"
else
    echo -e "  ${YELLOW}请先启动服务:${NC} npm start"
fi
echo
echo -e "${BLUE}[NETWORK] 访问地址:${NC}"
echo -e "  ${BLUE}本地:${NC} http://localhost:$PORT"
echo -e "  ${BLUE}监控:${NC} http://localhost:$PORT/monitor"

# 获取局域网IP (适用于多个平台)
if command -v ip >/dev/null 2>&1; then
    # Linux
    LAN_IP=$(ip route get 1 | awk '{print $7; exit}' 2>/dev/null)
elif command -v ipconfig >/dev/null 2>&1; then
    # macOS
    LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
elif command -v hostname >/dev/null 2>&1; then
    # 通用方法
    LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

if [ -n "$LAN_IP" ] && [ "$LAN_IP" != "127.0.0.1" ]; then
    echo -e "  ${BLUE}局域网:${NC} http://$LAN_IP:$PORT"
fi

echo
if [ "$SERVICE_RUNNING" = true ]; then
    echo -e "${GREEN}[SUCCESS] 部署检查通过！可以开始使用 hCaptcha 解决器${NC}"
else
    echo -e "${YELLOW}[WARN]  服务未运行，请启动服务后进行测试${NC}"
fi