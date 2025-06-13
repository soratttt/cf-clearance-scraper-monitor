# 安装指南

## 一键部署（推荐）

### Mac 系统
双击运行 `一键部署-MAC.command`

### Windows 系统  
双击运行 `一键部署-WIN.bat`

### 特性
- 全自动安装 Node.js、Chrome、项目依赖
- 自动配置网络访问权限
- 支持局域网多设备访问
- 零配置启动

### 快速启动（已部署用户）
- **Mac**: 双击 `start-mac.command`
- **Windows**: 双击 `start-windows.bat`

## 手动安装

### 环境要求

- Node.js 16+
- macOS/Windows/Linux 系统
- 至少 1GB 可用内存

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/0xsongsu/cf-clearance-scraper.git
cd cf-clearance-scraper

# 安装依赖
npm install

# 启动服务
npm start
```

### hCaptcha 功能安装

如果需要使用hCaptcha解决功能，需要额外安装Python依赖：

```bash
# 进入hCaptcha解决器目录
cd captcha-solvers/hcaptcha

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 安装Playwright浏览器
playwright install chromium
```

### Docker 安装

```bash
# 克隆仓库
git clone https://github.com/0xsongsu/cf-clearance-scraper.git
cd cf-clearance-scraper

# 使用Docker Compose启动
docker-compose up -d
```

## 故障排除

### 常见问题

1. **浏览器启动失败**
   ```bash
   # 确保系统安装了必要的依赖
   # macOS
   brew install chromium
   
   # Ubuntu/Debian
   sudo apt-get install chromium-browser
   ```

2. **Node.js版本过低**
   ```bash
   # 使用nvm管理Node.js版本
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

3. **权限问题**
   ```bash
   # Linux/Mac 给执行权限
   chmod +x 一键部署-MAC.command
   chmod +x start-mac.command
   ```

4. **Python依赖安装失败**
   ```bash
   # 更新pip
   pip install --upgrade pip
   
   # 使用国内镜像
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
   ```

### 性能优化建议

- **生产环境**: 推荐设置 `BROWSER_LIMIT=50-100`
- **开发环境**: 推荐设置 `BROWSER_LIMIT=5-10`
- **低内存设备**: 设置 `MAX_MEMORY_USAGE=256`

## 验证安装

安装完成后，可以使用以下方法验证：

```bash
# 检查服务状态
curl http://localhost:3000/health

# 查看监控面板
open http://localhost:3000/monitor

# 运行测试脚本
python3 test_service.py
```

## 下一步

- 📖 查看 [配置指南](CONFIGURATION.md)
- 🔧 查看 [API文档](API.md)
- 🤖 查看 [hCaptcha使用指南](HCAPTCHA.md)
- 📊 查看 [监控指南](MONITORING.md)