#!/bin/bash
# 自动配置 Python 环境变量的 Shell 脚本
# macOS 版本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "=== Python 环境自动配置工具 (macOS) ==="
echo -e "${NC}"
echo

# 检测当前使用的 Shell
detect_shell() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "zsh"
    elif [ -n "$BASH_VERSION" ]; then
        echo "bash"
    else
        # 通过 $SHELL 环境变量检测
        case "$SHELL" in
            */zsh) echo "zsh" ;;
            */bash) echo "bash" ;;
            *) echo "unknown" ;;
        esac
    fi
}

# 获取对应的配置文件路径
get_shell_config() {
    local shell_type="$1"
    case "$shell_type" in
        "zsh")
            echo "$HOME/.zshrc"
            ;;
        "bash")
            # macOS 使用 .bash_profile，Linux 使用 .bashrc
            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo "$HOME/.bash_profile"
            else
                echo "$HOME/.bashrc"
            fi
            ;;
        *)
            echo "$HOME/.profile"
            ;;
    esac
}

# 1. 检测 Shell 类型和配置文件
CURRENT_SHELL=$(detect_shell)
SHELL_CONFIG=$(get_shell_config "$CURRENT_SHELL")

echo -e "${YELLOW}检测到 Shell: $CURRENT_SHELL${NC}"
echo -e "${YELLOW}配置文件: $SHELL_CONFIG${NC}"
echo

# 2. 搜索 Python 安装路径
echo -e "${YELLOW}正在搜索 Python 安装路径...${NC}"

PYTHON_PATHS=(
    "/opt/homebrew/bin/python3"        # Apple Silicon Homebrew
    "/usr/local/bin/python3"           # Intel Homebrew
    "/usr/bin/python3"                 # 系统默认
    "/Library/Frameworks/Python.framework/Versions/3.12/bin/python3"  # 官网安装
    "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3"
    "/Library/Frameworks/Python.framework/Versions/3.10/bin/python3"
)

PYTHON_PATH=""
PYTHON_VERSION=""

# 按优先级搜索 Python
for path in "${PYTHON_PATHS[@]}"; do
    if [[ -x "$path" ]]; then
        # 检查版本是否符合要求 (3.10+)
        version_output=$("$path" --version 2>&1)
        if [[ $? -eq 0 ]]; then
            version=$(echo "$version_output" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
            if [[ -n "$version" ]]; then
                # 检查是否为 3.10+
                major=$(echo "$version" | cut -d. -f1)
                minor=$(echo "$version" | cut -d. -f2)
                if [[ $major -ge 3 ]] && [[ $minor -ge 10 ]]; then
                    PYTHON_PATH="$path"
                    PYTHON_VERSION="$version"
                    echo -e "${GREEN}找到 Python: $path (版本: $version)${NC}"
                    break
                fi
            fi
        fi
    fi
done

# 如果没找到合适的 Python，提示安装
if [[ -z "$PYTHON_PATH" ]]; then
    echo -e "${RED}未找到 Python 3.10+ 安装！${NC}"
    echo
    echo "请先安装 Python 3.10+："
    echo "1. 通过 Homebrew: brew install python@3.12"
    echo "2. 从官网下载: https://python.org/downloads/"
    echo
    read -p "按任意键退出..." -n 1
    exit 1
fi

# 3. 获取 Python 安装目录
PYTHON_DIR=$(dirname "$PYTHON_PATH")
PIP_PATH="${PYTHON_DIR}/pip3"

# 如果 pip3 不存在，尝试其他路径
if [[ ! -x "$PIP_PATH" ]]; then
    # 尝试同目录下的 pip
    if [[ -x "${PYTHON_DIR}/pip" ]]; then
        PIP_PATH="${PYTHON_DIR}/pip"
    else
        # 使用 python -m pip
        PIP_PATH="$PYTHON_PATH -m pip"
    fi
fi

echo -e "${GREEN}Python 路径: $PYTHON_PATH${NC}"
echo -e "${GREEN}Python 版本: $PYTHON_VERSION${NC}"
echo -e "${GREEN}pip 路径: $PIP_PATH${NC}"
echo

# 4. 检查是否已经配置过
echo -e "${YELLOW}检查现有配置...${NC}"

NEEDS_CONFIG=false

# 检查配置文件是否存在
if [[ ! -f "$SHELL_CONFIG" ]]; then
    echo -e "${YELLOW}配置文件不存在，将创建: $SHELL_CONFIG${NC}"
    touch "$SHELL_CONFIG"
    NEEDS_CONFIG=true
else
    # 检查是否已有 Python 配置
    if ! grep -q "alias python=" "$SHELL_CONFIG" 2>/dev/null; then
        NEEDS_CONFIG=true
    fi
fi

# 5. 配置环境变量
if [[ "$NEEDS_CONFIG" == true ]]; then
    echo -e "${YELLOW}正在配置环境变量...${NC}"
    
    # 备份现有配置文件
    if [[ -f "$SHELL_CONFIG" ]]; then
        cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}已备份现有配置到: ${SHELL_CONFIG}.backup.*${NC}"
    fi
    
    # 添加配置到文件末尾
    cat >> "$SHELL_CONFIG" << EOF

# Python 环境配置 - 自动添加于 $(date)
# 优先使用 Homebrew 安装的 Python
export PATH="/opt/homebrew/bin:/usr/local/bin:\$PATH"

# Python 别名配置
alias python='python3'
alias pip='pip3'

# 确保使用找到的 Python 版本
export PYTHON_PATH="$PYTHON_PATH"
EOF

    echo -e "${GREEN}环境变量配置已添加到 $SHELL_CONFIG${NC}"
else
    echo -e "${GREEN}环境变量已经配置过，跳过配置步骤${NC}"
fi

# 6. 升级 pip
echo
echo -e "${YELLOW}正在升级 pip...${NC}"
"$PYTHON_PATH" -m pip install --user --upgrade pip

# 7. 验证配置
echo
echo -e "${BLUE}=== 验证配置 ===${NC}"

# 重新加载配置文件进行测试
echo -e "${YELLOW}重新加载配置文件...${NC}"
source "$SHELL_CONFIG"

# 测试 Python
echo -e "${YELLOW}测试 Python:${NC}"
if command -v python3 &> /dev/null; then
    python3 --version
    echo -e "${GREEN}✓ python3 命令可用${NC}"
else
    echo -e "${RED}✗ python3 命令不可用${NC}"
fi

# 测试 Python 别名
if command -v python &> /dev/null; then
    python --version
    echo -e "${GREEN}✓ python 别名可用${NC}"
else
    echo -e "${RED}✗ python 别名不可用${NC}"
fi

# 测试 pip
echo -e "${YELLOW}测试 pip:${NC}"
if command -v pip3 &> /dev/null; then
    pip3 --version
    echo -e "${GREEN}✓ pip3 命令可用${NC}"
else
    echo -e "${RED}✗ pip3 命令不可用${NC}"
fi

# 测试 pip 别名
if command -v pip &> /dev/null; then
    pip --version
    echo -e "${GREEN}✓ pip 别名可用${NC}"
else
    echo -e "${RED}✗ pip 别名不可用${NC}"
fi

# 8. 完成提示
echo
echo -e "${GREEN}=== 配置完成！ ===${NC}"
echo
echo -e "${YELLOW}重要提示：${NC}"
echo "1. 请重新启动终端或运行以下命令使配置生效："
echo -e "   ${BLUE}source $SHELL_CONFIG${NC}"
echo
echo "2. 验证配置是否生效："
echo -e "   ${BLUE}python --version${NC}"
echo -e "   ${BLUE}pip --version${NC}"
echo
echo "3. 如果配置有问题，可以恢复备份文件："
echo -e "   ${BLUE}mv ${SHELL_CONFIG}.backup.* $SHELL_CONFIG${NC}"
echo

# 询问是否立即应用配置
read -p "是否立即重新加载配置？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}重新加载配置中...${NC}"
    source "$SHELL_CONFIG"
    echo -e "${GREEN}配置已重新加载！${NC}"
    
    # 最终验证
    echo
    echo -e "${BLUE}最终验证：${NC}"
    python --version 2>/dev/null && echo -e "${GREEN}✓ python 命令正常${NC}" || echo -e "${RED}✗ python 命令异常${NC}"
    pip --version 2>/dev/null && echo -e "${GREEN}✓ pip 命令正常${NC}" || echo -e "${RED}✗ pip 命令异常${NC}"
fi

echo
echo "配置脚本执行完成！"