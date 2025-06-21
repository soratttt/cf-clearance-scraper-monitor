# CF Clearance Scraper 安装指南

本指南将帮助您从零开始手动安装 CF Clearance Scraper，包括所需的基础环境和依赖包。

> [INFO] **为什么选择手动安装？**  
> 手动安装虽然步骤较多，但可以让您：
> - 完全了解每个组件的作用
> - 更好地控制安装过程
> - 便于后续的问题排查和维护
> - 确保与您的系统环境最佳兼容

## [LIST] 安装流程概述

安装分为以下几个步骤：
1. **基础环境安装** - Node.js、Python、Chrome
2. **项目下载** - 获取源代码
3. **依赖安装** - Node.js 和 Python 依赖包
4. **配置设置** - 环境变量和 API 密钥
5. **验证测试** - 确认所有功能正常

### [LIST] 系统要求

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| **Node.js** | 16.0+ | 18.0+ LTS | JavaScript 运行环境 |
| **Python** | 3.10+ | 3.12 | 验证码解决器功能 |
| **Google Chrome** | 最新版 | 最新版 | 浏览器自动化 |
| **系统内存** | 1GB+ | 2GB+ | 推荐配置 |
| **操作系统** | - | - | Windows 10+, macOS 10.15+, Ubuntu 20.04+ |

---

## 🛠️ 基础环境安装

### 第一步：安装 Node.js

#### 🪟 Windows 系统
1. **访问官网**: https://nodejs.org
2. **下载 LTS 版本**（推荐 18.x 或 20.x）
3. **运行安装包**，确保勾选 **"Add to PATH"**
4. **验证安装**：
   ```cmd
   node --version
   npm --version
   ```

#### 🍎 Mac 系统
**方法一：官网安装**
1. 访问 https://nodejs.org 下载 LTS 版本
2. 运行 `.pkg` 安装包

**方法二：Homebrew（推荐）**
```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 验证安装
node --version
npm --version
```

#### 🐧 Linux 系统
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

### 第二步：安装 Python 3.12

#### 🪟 Windows 系统
1. **访问官网**: https://python.org/downloads/
2. **下载 Python 3.12.x**
3. **运行安装包**，**必须勾选**:
   - [OK] "Add Python to PATH"
   - [OK] "Install pip"
   - [OK] "Add Python to environment variables"
4. **验证安装**：
   ```cmd
   python --version
   pip --version
   ```

**如果环境变量配置失败，手动配置**：
1. **找到 Python 安装路径**（通常是 `C:\Users\用户名\AppData\Local\Programs\Python\Python312`）
2. **打开系统环境变量设置**：
   - 右键"此电脑" → "属性" → "高级系统设置" → "环境变量"
3. **编辑 PATH 变量**，添加以下路径：
   ```
   C:\Users\用户名\AppData\Local\Programs\Python\Python312
   C:\Users\用户名\AppData\Local\Programs\Python\Python312\Scripts
   ```
4. **重启命令提示符**，验证配置：
   ```cmd
   python --version
   pip --version
   ```

#### 🍎 Mac 系统
**方法一：Homebrew（推荐）**
```bash
# 安装 Python 3.12
brew install python@3.12

# 验证安装
python3 --version
pip3 --version
```

**配置环境变量（如果需要）**：
```bash
# 将 Python 3.12 添加到 PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'alias python=python3' >> ~/.zshrc
echo 'alias pip=pip3' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 验证配置
python --version
pip --version
```

**方法二：官网安装**
1. 访问 https://python.org/downloads/
2. 下载 macOS 安装包
3. 运行 `.pkg` 文件
4. **配置环境变量**：
   ```bash
   # 添加到 shell 配置文件
   echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
   echo 'alias python=python3' >> ~/.zshrc
   echo 'alias pip=pip3' >> ~/.zshrc
   source ~/.zshrc
   ```

#### 🐧 Linux 系统
```bash
# Ubuntu 22.04+
sudo apt update
sudo apt install python3.12 python3.12-pip python3.12-venv

# CentOS/RHEL (需要 EPEL)
sudo dnf install python3.12 python3.12-pip

# 验证安装
python3.12 --version
pip3.12 --version
```

**配置环境变量（推荐）**：
```bash
# 创建符合常用习惯的别名
echo 'alias python=python3.12' >> ~/.bashrc
echo 'alias pip=pip3.12' >> ~/.bashrc

# 或者添加到 ~/.zshrc (如果使用 zsh)
echo 'alias python=python3.12' >> ~/.zshrc
echo 'alias pip=pip3.12' >> ~/.zshrc

# 重新加载配置
source ~/.bashrc  # 或 source ~/.zshrc

# 验证配置
python --version
pip --version
```

### 第三步：安装 Google Chrome

#### 🪟 Windows 系统
1. **访问**: https://www.google.com/chrome
2. **下载并安装** Chrome 浏览器
3. **验证安装**：检查 Chrome 是否能正常启动

#### 🍎 Mac 系统
**方法一：官网下载**
1. 访问 https://www.google.com/chrome
2. 下载 `.dmg` 文件并安装

**方法二：Homebrew**
```bash
brew install --cask google-chrome
```

#### 🐧 Linux 系统
```bash
# Ubuntu/Debian
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install google-chrome-stable

# CentOS/RHEL
sudo yum install -y wget
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo yum install -y google-chrome-stable_current_x86_64.rpm
```

---

## [RESPONSE] 项目下载和基础安装

### 下载项目
```bash
# 方法一：Git 克隆
git clone https://github.com/0xsongsu/cf-clearance-scraper.git
cd cf-clearance-scraper

# 方法二：下载 ZIP
# 从 GitHub 下载 ZIP 文件并解压
```

### 安装 Node.js 依赖
```bash
# 进入项目目录
cd cf-clearance-scraper

# 安装依赖
npm install

# 验证安装
npm list --depth=0
```

### 验证基础安装
```bash
# 启动基础服务（不含验证码功能）
npm start

# 访问服务
# 浏览器打开: http://localhost:3000
# 监控面板: http://localhost:3000/monitor
```

---

## 🤖 验证码解决器安装

### 统一 Python 依赖安装

项目现在使用统一的依赖管理，支持 hCaptcha 和 reCAPTCHA 解决器：

```bash
# 进入项目根目录
cd cf-clearance-scraper

# 安装统一 Python 依赖
pip install --user -r captcha-solvers/requirements.txt

# 或者使用 pip3（推荐）
pip3 install --user -r captcha-solvers/requirements.txt

# 安装 Playwright 浏览器
python -m playwright install chromium
# 或
python3 -m playwright install chromium
```

### 依赖包说明

统一依赖文件 `captcha-solvers/requirements.txt` 包含：

| 类别 | 包名 | 用途 |
|------|------|------|
| **hCaptcha 核心** | hcaptcha-challenger | AI 驱动的 hCaptcha 解决器 |
| **AI 模型** | google-genai | Google Gemini API |
| **浏览器自动化** | playwright | 无头浏览器控制 |
| **图像处理** | opencv-python, pillow, numpy | 图像识别和处理 |
| **reCAPTCHA 核心** | DrissionPage | 浏览器自动化框架 |
| **音频处理** | pydub, SpeechRecognition | 音频验证码处理 |
| **网络处理** | httpx | HTTP 客户端 |
| **配置管理** | python-dotenv, pydantic-settings | 环境配置 |
| **日志系统** | loguru | 日志记录 |

### 验证 Python 环境

```bash
# 测试关键包导入
python -c "
import hcaptcha_challenger
import DrissionPage
import playwright
import cv2
import pydub
import speech_recognition
print('[OK] 所有验证码解决器依赖安装成功')
"
```

### API 密钥配置

验证码解决功能需要配置 API 密钥：

#### 1. 获取 Gemini API 密钥
1. 访问 https://aistudio.google.com/app/apikey
2. 登录 Google 账户
3. 创建新的 API 密钥

#### 2. 配置环境变量
```bash
# 复制示例配置文件
cp .env.example .env

# 编辑配置文件
# 将 GEMINI_API_KEY=your_actual_api_key_here 
# 改为 GEMINI_API_KEY=你的真实API密钥
```

---

## [TEST] 安装验证

### 快速验证
```bash
# 1. 检查 Node.js 环境
node --version
npm --version

# 2. 检查 Python 环境
python --version  # 或 python3 --version
pip --version     # 或 pip3 --version

# 3. 启动服务
npm start

# 4. 访问监控面板
# 浏览器打开: http://localhost:3000/monitor
```

### 完整功能测试
```bash
# 运行完整部署测试
node tests/test_hcaptcha_deployment.js

# 快速功能测试
node tests/quick_test.js
```

### 验证成功标志
[OK] **Node.js 服务正常**: 能访问 http://localhost:3000  
[OK] **监控面板可用**: 能访问 http://localhost:3000/monitor  
[OK] **Python 依赖完整**: 导入测试无错误  
[OK] **验证码功能**: API 调用返回有效 token

---

## [WARN] 注意事项

### Windows 用户
- 确保安装时勾选 "Add to PATH"
- 如果遇到权限问题，以管理员身份运行命令提示符
- 建议使用 PowerShell 而非 cmd

### Mac 用户
- 首次运行可能需要在"系统偏好设置 > 安全性与隐私"中允许
- 建议使用 Homebrew 管理软件包

### Linux 用户
- 确保安装 `python3-dev` 和 `python3-pip`
- 某些包可能需要额外的系统依赖

### 网络环境
- 如果网络受限，可使用国内镜像：
  ```bash
  # Python 包镜像
  pip install -r captcha-solvers/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
  
  # npm 镜像
  npm install --registry https://registry.npmmirror.com
  ```

### 🐳 Docker 安装

```bash
# 克隆仓库
git clone https://github.com/0xsongsu/cf-clearance-scraper.git
cd cf-clearance-scraper

# 使用Docker Compose启动
docker-compose up -d
```

---

## [CONFIG] 故障排除

### 基础环境问题

#### 🪟 Windows 常见问题

**问题1: Node.js 未找到**
```cmd
# 错误: 'node' 不是内部或外部命令
# 解决: 重新安装 Node.js，确保勾选 "Add to PATH"

# 验证环境变量
echo %PATH%
# 手动添加 Node.js 路径（临时）
set PATH=%PATH%;C:\Program Files\nodejs
```

**问题2: Python 未找到**
```cmd
# 错误: 'python' 不是内部或外部命令
# 解决方案1: 重新安装 Python，确保勾选 "Add Python to PATH"

# 解决方案2: 手动配置环境变量
# 1. 找到 Python 安装路径
where python3
# 或查看常见位置
dir "C:\Users\%USERNAME%\AppData\Local\Programs\Python"

# 2. 添加到 PATH（临时）
set PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312
set PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\Scripts

# 3. 验证配置
python --version
pip --version

# 解决方案3: 使用完整路径（临时解决）
C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe --version
```

**永久配置环境变量**：
1. 右键"此电脑" → "属性" → "高级系统设置" → "环境变量"
2. 在"用户变量"中找到"Path"，点击"编辑"
3. 点击"新建"，添加以下路径：
   - `C:\Users\用户名\AppData\Local\Programs\Python\Python312`
   - `C:\Users\用户名\AppData\Local\Programs\Python\Python312\Scripts`
4. 点击"确定"保存
5. 重新打开命令提示符验证

**问题3: 权限错误**
```cmd
# 以管理员身份运行 PowerShell 或命令提示符
# 右键 → "以管理员身份运行"
```

#### 🍎 Mac 常见问题

**问题1: 脚本权限问题**
```bash
# 错误: "无法执行脚本"或"权限被拒绝"
# 解决方案: 给脚本执行权限
chmod +x your_script.sh

# 如果是下载的脚本，移除隔离标记
xattr -d com.apple.quarantine your_script.sh
```

**问题2: Homebrew 安装失败**
```bash
# 网络问题导致安装失败
# 使用国内镜像:
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

**问题3: Python 版本冲突**
```bash
# 系统自带 Python 与 Homebrew Python 冲突
# 解决方案1: 使用指定版本
brew install python@3.12
/opt/homebrew/bin/python3.12 --version

# 解决方案2: 配置正确的 PATH 优先级
# 查看当前 Python 位置
which python3
which pip3

# 配置 PATH（优先使用 Homebrew 版本）
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc

# 创建方便的别名
echo 'alias python=python3' >> ~/.zshrc
echo 'alias pip=pip3' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 验证配置
python --version
pip --version
```

**问题4: command not found: python**
```bash
# 错误: zsh: command not found: python
# 解决方案: 检查 Shell 配置文件

# 1. 确定使用的 Shell
echo $SHELL

# 2. 根据 Shell 类型编辑对应配置文件
# Zsh (macOS 默认)
echo 'alias python=python3' >> ~/.zshrc
echo 'alias pip=pip3' >> ~/.zshrc
source ~/.zshrc

# Bash
echo 'alias python=python3' >> ~/.bash_profile
echo 'alias pip=pip3' >> ~/.bash_profile
source ~/.bash_profile

# 3. 验证环境变量
echo $PATH
```

### Python 依赖问题

#### [PYTHON] 统一依赖安装问题

**问题1: 依赖安装失败**
```bash
# 错误: pip install 失败
# 解决方案1: 升级 pip
pip install --upgrade pip
pip3 install --upgrade pip

# 解决方案2: 使用国内镜像
pip install -r captcha-solvers/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/

# 解决方案3: 手动安装核心依赖
pip install --user hcaptcha-challenger google-genai playwright opencv-python numpy pillow
pip install --user DrissionPage pydub SpeechRecognition
```

**问题2: 包导入失败**
```bash
# 错误: ModuleNotFoundError: No module named 'xxx'
# 检查安装状态
pip list | grep hcaptcha-challenger
pip list | grep playwright
pip list | grep opencv-python

# 重新安装特定包
pip install --user --force-reinstall hcaptcha-challenger
```

**问题3: Playwright 浏览器下载失败**
```bash
# 错误: Browser download failed
# 解决方案1: 手动安装
python -m playwright install chromium

# 解决方案2: 指定下载源
PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net python -m playwright install chromium

# 解决方案3: 离线安装
# 下载离线包然后安装
```

#### [CONFIG] API 配置问题

**问题1: Gemini API 密钥无效**
```bash
# 错误: API 密钥未配置或无效
# 解决步骤:
# 1. 获取新的 API 密钥: https://aistudio.google.com/app/apikey
# 2. 检查 .env 文件格式:
GEMINI_API_KEY=你的实际密钥（不要有空格和引号）

# 3. 测试 API 密钥
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=你的密钥"
```

**问题2: API 配额超限**
```bash
# 错误: API quota exceeded
# 解决方案:
# 1. 检查 Google AI Studio 配额使用情况
# 2. 等待配额重置或升级账户
# 3. 配置多个 API 密钥轮换使用:
GEMINI_API_KEYS=密钥1,密钥2,密钥3
```

### 验证码解决器问题

#### 🤖 hCaptcha 问题

**问题1: hCaptcha 解决超时**
```bash
# 增加超时时间
# 在 .env 文件中添加:
HCAPTCHA_SOLVER_TIMEOUT=300000
HCAPTCHA_PAGE_TIMEOUT=60000
```

**问题2: 图像识别失败**
```bash
# 检查 OpenCV 安装
python -c "import cv2; print(cv2.__version__)"

# 重新安装图像处理依赖
pip install --user --force-reinstall opencv-python pillow numpy
```

#### [RESTART] reCAPTCHA 问题

**问题1: DrissionPage 启动失败**
```bash
# 检查 Chrome 浏览器
google-chrome --version
# 或
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version

# 重新安装 DrissionPage
pip install --user --force-reinstall DrissionPage
```

**问题2: 音频处理失败**
```bash
# 检查音频处理依赖
python -c "import pydub; import speech_recognition; print('Audio dependencies OK')"

# 安装系统音频依赖（Linux）
sudo apt-get install ffmpeg libavcodec-extra
# 或（Mac）
brew install ffmpeg
```

### 网络和服务问题

#### [NETWORK] 服务启动问题

**问题1: 端口被占用**
```bash
# 检查端口占用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# 终止占用进程
taskkill /PID [进程ID] /F     # Windows
kill -9 [进程ID]              # Mac/Linux

# 或更换端口
export PORT=8080
npm start
```

**问题2: 服务无法访问**
```bash
# 检查防火墙设置
# Windows (管理员权限)
netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=3000

# Mac
sudo pfctl -f /etc/pf.conf

# Linux
sudo ufw allow 3000
```

**问题3: 局域网访问失败**
```bash
# 确保服务监听所有接口
# 检查启动配置，确保不是只监听 localhost
# 应该是: 0.0.0.0:3000 而不是 127.0.0.1:3000
```

### 完整诊断流程

#### [DEBUG] 问题排查步骤

**步骤1: 环境检查**
```bash
# 1. 检查基础环境
node --version
npm --version
python --version  # 或 python3 --version
pip --version     # 或 pip3 --version

# 2. 检查 Chrome
google-chrome --version

# 3. 检查项目文件
ls -la cf-clearance-scraper/
ls -la cf-clearance-scraper/captcha-solvers/
```

**步骤2: 依赖检查**
```bash
# 1. Node.js 依赖
cd cf-clearance-scraper
npm list --depth=0

# 2. Python 依赖
pip list | grep -E "(hcaptcha|playwright|opencv|DrissionPage|pydub)"
```

**步骤3: 功能测试**
```bash
# 1. 基础服务测试
npm start &
curl http://localhost:3000/monitor

# 2. Python 依赖测试
python -c "
try:
    import hcaptcha_challenger
    import DrissionPage  
    import playwright
    import cv2
    import pydub
    import speech_recognition
    print('[OK] 所有依赖正常')
except ImportError as e:
    print(f'[FAIL] 依赖问题: {e}')
"
```

---

## [TEST] 最终验证

### 快速验证清单

```bash
# [OK] 环境检查
node --version     # 应显示 16.0+ 或更高
python --version   # 应显示 3.10+ 或更高（如果显示 3.12.x 最佳）
pip --version      # 确认 pip 可用

# 如果 python 命令不可用，尝试：
python3 --version  # macOS/Linux 系统
pip3 --version     # macOS/Linux 系统

# [OK] 环境变量验证
echo $PATH | grep -i python  # 应该看到 Python 路径
which python  # 应该显示 Python 可执行文件位置
which pip     # 应该显示 pip 可执行文件位置

# [OK] 项目依赖
cd cf-clearance-scraper
npm list --depth=0  # Node.js 依赖完整
pip list | grep -E "(hcaptcha|playwright|opencv|DrissionPage)"  # Python 依赖完整

# [OK] 服务启动
npm start  # 服务正常启动
curl http://localhost:3000/monitor  # 监控面板可访问

# [OK] 功能测试
python -c "import hcaptcha_challenger, DrissionPage, playwright, cv2, pydub, speech_recognition; print('[OK] 验证码解决器就绪')"
```

### 完整功能测试

```bash
# 运行完整测试套件
node tests/test_hcaptcha_deployment.js

# 快速功能验证
node tests/quick_test.js
```

### 成功安装标志

当看到以下信息时，说明安装完全成功：

[OK] **基础环境就绪**: Node.js、Python、Chrome 都已正确安装  
[OK] **依赖安装完成**: 所有 Node.js 和 Python 依赖都已安装  
[OK] **服务正常运行**: 可以访问 http://localhost:3000/monitor  
[OK] **验证码功能可用**: hCaptcha 和 reCAPTCHA 解决器都能正常工作  

---

## [START] 下一步操作

安装完成后，您可以：

### 📖 了解更多
- [配置指南](CONFIGURATION.md) - 详细的配置选项和优化建议
- [API 文档](API.md) - 完整的 API 接口说明和示例
- [故障排除](TROUBLESHOOTING.md) - 常见问题和解决方案

### [CONFIG] 开始使用
- 访问监控面板：http://localhost:3000/monitor
- 查看 API 端点：http://localhost:3000/api
- 开始集成验证码解决功能

### [INFO] 优化配置
- 配置 Gemini API 密钥以启用 hCaptcha 功能
- 根据需求调整性能参数
- 设置防火墙和网络访问权限

---

## 📞 获取支持

如果在安装过程中遇到任何问题：

1. **查看故障排除文档**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **运行诊断脚本**: 使用上述验证命令获取详细信息
3. **提交问题反馈**: 包含系统信息、错误日志和测试结果

感谢使用 CF Clearance Scraper！[SUCCESS]