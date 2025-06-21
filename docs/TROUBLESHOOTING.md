# 故障排除指南

## 常见问题及解决方案

### 服务启动问题

#### 1. 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE :::3000
```

**解决方案**:
```bash
# 查看端口占用
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 终止占用进程
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# 或者更换端口
PORT=8080 npm start
```

#### 2. Node.js 版本过低

**错误信息**:
```
Error: The engine "node" is incompatible with this module
```

**解决方案**:
```bash
# 使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 或直接从官网下载最新版本
# https://nodejs.org/
```

#### 3. 依赖安装失败

**错误信息**:
```
npm ERR! peer dep missing
```

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### hCaptcha 问题

#### 1. Gemini API 503 错误

**错误信息**:
```
503 Service Unavailable. {'message': '', 'status': 'Service Unavailable'}
```

**解决方案**:
1. **检查 API 密钥**:
   ```bash
   # 确认 .env 文件中的 GEMINI_API_KEY 正确
   cat .env | grep GEMINI_API_KEY
   ```

2. **确认使用免费模型**:
   ```bash
   # 检查模型配置
   grep "MODEL" .env
   
   # 应该使用 gemini-2.0-flash
   IMAGE_CLASSIFIER_MODEL=gemini-2.0-flash
   ```

3. **等待重试**:
   ```bash
   # API 过载时等待几分钟后重试
   sleep 300 && npm start
   ```

#### 2. hCaptcha 解决失败

**错误信息**:
```
"message": "No challenge response found"
```

**解决方案**:
1. **检查网站参数**:
   ```javascript
   // 确认 websiteUrl 和 websiteKey 正确
   {
     "websiteUrl": "https://accounts.hcaptcha.com/demo",
     "websiteKey": "338af34c-7bcb-4c7c-900b-acbec73d7d43"
   }
   ```

2. **增加超时时间**:
   ```bash
   # 在 .env 文件中设置
   HCAPTCHA_SOLVER_TIMEOUT=600000  # 10分钟
   HCAPTCHA_PAGE_TIMEOUT=60000     # 1分钟
   ```

3. **检查网络连接**:
   ```bash
   # 测试网络连接
   curl -I https://accounts.hcaptcha.com/demo
   ```

#### 3. Python 环境问题

**错误信息**:
```
Failed to start solver: spawn python3 ENOENT
```

**解决方案**:
```bash
# 检查 Python 安装
python3 --version

# 如果未安装 Python
# Ubuntu/Debian:
sudo apt-get install python3 python3-pip python3-venv

# macOS:
brew install python3

# Windows: 从官网下载安装
# https://www.python.org/downloads/

# 重新安装 hCaptcha 依赖
cd captcha-solvers/hcaptcha
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

### [NETWORK] 浏览器问题

#### 1. Chromium 启动失败

**错误信息**:
```
Error: Failed to launch the browser process
```

**解决方案**:
```bash
# Ubuntu/Debian 安装依赖
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2

# macOS 安装 Chromium
brew install chromium

# 检查系统权限
# macOS: 系统偏好设置 > 安全性与隐私 > 辅助功能
```

#### 2. 内存不足

**错误信息**:
```
Page crashed with reason: oom
```

**解决方案**:
```bash
# 降低并发数
BROWSER_LIMIT=5
MAX_MEMORY_USAGE=256

# 增加内存清理频率
MEMORY_CLEANUP_INTERVAL=120000

# 启用内存监控
curl http://localhost:3000/api/monitor
```

### 网络问题

#### 1. 请求超时

**错误信息**:
```
Request timeout
```

**解决方案**:
```bash
# 增加超时时间
TIMEOUT=600000  # 10分钟

# 检查网络连接
ping google.com
curl -I https://cloudflare.com

# 使用代理
{
  "proxy": {
    "host": "127.0.0.1",
    "port": 8080
  }
}
```

#### 2. SSL 证书问题

**错误信息**:
```
Error: unable to verify the first certificate
```

**解决方案**:
```bash
# 设置环境变量忽略 SSL 错误（仅开发环境）
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start

# 或更新系统证书
# Ubuntu/Debian:
sudo apt-get update && sudo apt-get install ca-certificates

# macOS:
brew install ca-certificates
```

### 配置问题

#### 1. 环境变量未生效

**问题**: 修改 `.env` 文件后配置未生效

**解决方案**:
```bash
# 确认 .env 文件位置正确（项目根目录）
ls -la .env

# 重启服务
pkill -f "node start.js"
npm start

# 检查配置加载
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

#### 2. 权限问题

**错误信息**:
```
Permission denied
```

**解决方案**:
```bash
# 给脚本执行权限
chmod +x 一键部署-MAC.command
chmod +x start-mac.command

# 检查文件所有者
ls -la

# 修改所有者（如需要）
sudo chown -R $USER:$USER ./
```

### 监控问题

#### 1. 监控面板无法访问

**问题**: `http://localhost:3000/monitor` 无法打开

**解决方案**:
```bash
# 检查服务状态
curl http://localhost:3000/health

# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-ports  # CentOS

# 检查浏览器控制台错误
# F12 > Console
```

#### 2. 监控数据异常

**问题**: 显示的数据不正确

**解决方案**:
```bash
# 重置监控数据
curl -X POST http://localhost:3000/api/monitor/reset

# 检查系统时间
date

# 重启服务
npm start
```

### 💾 数据问题

#### 1. JSON 解析错误

**错误信息**:
```
Unexpected token in JSON
```

**解决方案**:
```bash
# 检查输出日志
tail -f service.log

# 查看原始输出
grep "原始输出" service.log

# 确认特殊标记工作正常
grep "特殊标记" service.log
```

#### 2. Token 格式异常

**问题**: 返回的 token 格式不正确

**解决方案**:
```bash
# 检查 token 长度和格式
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"type":"hcaptcha","websiteUrl":"https://accounts.hcaptcha.com/demo","websiteKey":"338af34c-7bcb-4c7c-900b-acbec73d7d43"}'

# 验证 token 有效性
# 在目标网站使用 token
```

## 调试工具

### 1. 详细日志

```bash
# 启用详细日志
LOG_LEVEL=INFO
PYTHON_LOG_LEVEL=INFO
NODE_ENV=development
VERBOSE_ERRORS=true
```

### 2. 测试脚本

```bash
# 运行内置测试
python3 test_service.py
node test_hcaptcha.js

# 创建自定义测试
curl -X POST http://localhost:3000/health
```

### 3. 监控检查

```bash
# 获取详细监控信息
curl http://localhost:3000/api/monitor | jq

# 检查内存使用
ps aux | grep node
htop  # 如果已安装
```

## 性能优化

### 1. 内存优化

```bash
# 限制内存使用
MAX_MEMORY_USAGE=512
MEMORY_CLEANUP_INTERVAL=120000

# 调整垃圾回收
node --max-old-space-size=1024 start.js
```

### 2. 并发优化

```bash
# 根据服务器性能调整
# 高性能服务器
BROWSER_LIMIT=50
MAX_CONCURRENT_REQUESTS=200

# 低配置服务器
BROWSER_LIMIT=5
MAX_CONCURRENT_REQUESTS=20
```

### 3. 网络优化

```bash
# 使用本地代理
HTTP_PROXY=http://127.0.0.1:8080

# 优化 DNS
echo "8.8.8.8 google.com" >> /etc/hosts
```

## 日志分析

### 1. 错误日志

```bash
# 查看错误日志
grep "ERROR\|[FAIL]" service.log

# 统计错误类型
grep "ERROR" service.log | cut -d']' -f2 | sort | uniq -c
```

### 2. 性能日志

```bash
# 查看响应时间
grep "总耗时" service.log

# 统计平均响应时间
grep "总耗时" service.log | grep -o '[0-9]*ms' | sed 's/ms//' | awk '{sum+=$1; count++} END {print "Average:", sum/count "ms"}'
```

### 3. 成功率统计

```bash
# 统计成功/失败请求
success=$(grep "[OK].*返回结果" service.log | wc -l)
failed=$(grep "[FAIL]\|ERROR" service.log | wc -l)
total=$((success + failed))
rate=$(echo "scale=2; $success * 100 / $total" | bc)
echo "成功率: $rate%"
```

## 应急处理

### 1. 服务卡死

```bash
# 强制重启服务
pkill -9 -f "node"
pkill -9 -f "python"
npm start
```

### 2. 内存泄漏

```bash
# 检查内存使用
ps aux | grep node
free -h

# 重启服务释放内存
systemctl restart cf-scraper  # 如果使用 systemd
```

### 3. 磁盘空间不足

```bash
# 检查磁盘使用
df -h

# 清理临时文件
rm -rf captcha-solvers/hcaptcha/tmp/*
npm cache clean --force

# 清理日志文件
> service.log
```

## 获取帮助

### 1. 社区支持

- 📖 查看文档: [GitHub Wiki](https://github.com/0xsongsu/cf-clearance-scraper/wiki)
- 🐛 报告问题: [GitHub Issues](https://github.com/0xsongsu/cf-clearance-scraper/issues)
- 💬 讨论交流: [GitHub Discussions](https://github.com/0xsongsu/cf-clearance-scraper/discussions)

### 2. 系统信息收集

报告问题时请提供：

```bash
# 系统信息
uname -a
node --version
npm --version
python3 --version

# 服务信息
curl http://localhost:3000/api/monitor
grep "ERROR\|[FAIL]" service.log | tail -10

# 配置信息（隐敏感信息）
cat .env | sed 's/API_KEY=.*/API_KEY=***hidden***/'
```

### 3. 远程诊断

```bash
# 启用远程诊断模式
DEBUG=* npm start > debug.log 2>&1

# 生成诊断报告
node -e "
const fs = require('fs');
const report = {
  timestamp: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  memoryUsage: process.memoryUsage(),
  uptime: process.uptime()
};
fs.writeFileSync('diagnostic.json', JSON.stringify(report, null, 2));
console.log('诊断报告已生成: diagnostic.json');
"
```