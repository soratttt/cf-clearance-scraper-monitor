# CF Clearance Scraper

本地版本的 Cloudflare 保护绕过工具，专门用于测试和学习目的。可以获取受 Cloudflare WAF 保护网站的页面源码、创建 Turnstile 令牌和 WAF 会话。

## 特性

- 🚀 **本地部署** - 无需Docker，直接在本地运行
- 🔄 **智能浏览器管理** - 按需创建浏览器上下文，最大支持100个并发
- 📊 **实时监控** - 内置监控面板，实时查看服务状态
- 💾 **内存优化** - 自动内存清理和垃圾回收
- 🎯 **多种模式** - 支持页面源码获取、Turnstile令牌生成、WAF会话创建

## 🚀 一键部署（推荐）

### 📱 Mac 系统
双击运行 **`一键部署-MAC.command`** 即可自动安装所有依赖并启动服务

### 🖥️ Windows 系统  
双击运行 **`一键部署-WIN.bat`** 即可自动安装所有依赖并启动服务

### ✨ 部署特性
- 🔧 **全自动安装** - Node.js、Chrome、npm、项目依赖一键搞定
- 🛡️ **智能配置** - 自动配置防火墙和网络访问权限
- 🌐 **局域网支持** - 自动获取IP，支持多设备访问
- ⚡ **零配置启动** - 双击即用，无需任何手动配置
- 📋 **详细日志** - 安装过程可视化，问题一目了然
- 🌍 **浏览器检测** - 自动检测并引导安装Chrome浏览器

### 🎯 快速启动（已部署用户）
- **Mac**: 双击 `start-mac.command`
- **Windows**: 双击 `start-windows.bat`

## 手动安装与运行

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

### 自定义配置启动

```bash
# 设置并发数和端口
PORT=3000 browserLimit=100 node src/index.js
```

### 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `browserLimit` | 100 | 最大并发浏览器上下文数 |
| `timeOut` | 60000 | 请求超时时间(毫秒) |
| `memoryCleanupInterval` | 300000 | 内存清理间隔(毫秒) |
| `maxMemoryUsage` | 512 | 最大内存使用(MB) |
| `authToken` | 无 | API认证令牌(可选) |

## API 使用

### 🔗 API 端点

本服务支持两种API格式，完全兼容：

#### 📡 格式一
- **端点**: `POST /cf-clearance-scraper`
- **参数**: `url`, `siteKey`, `mode`
- **特性**: 支持代理配置，完整功能

#### 🆕 格式二
- **端点**: `POST /cftoken` 
- **参数**: `type: "cftoken"`, `websiteUrl`, `websiteKey`
- **响应**: `{code: 200, message: "success", token: "xxx"}`
- **特性**: 标准化响应格式，更易集成

### 1. 获取页面源码

获取受 Cloudflare WAF 保护网站的页面源码：

```javascript
const response = await fetch('http://localhost:3000/cf-clearance-scraper', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://example.com',
        mode: 'source'
    })
});

const result = await response.json();
console.log(result.source); // 页面源码
```

### 2. 创建 Turnstile 令牌 (轻量级)

使用最少资源生成 Turnstile 令牌：

```javascript
const response = await fetch('http://localhost:3000/cf-clearance-scraper', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://turnstile.zeroclover.io/',
        siteKey: '0x4AAAAAAAEwzhD6pyKkgXC0',
        mode: 'turnstile-min'
    })
});

const result = await response.json();
console.log(result.token); // Turnstile 令牌
```

### 3. 创建 Turnstile 令牌 (完整页面)

加载完整页面并生成 Turnstile 令牌：

```javascript
const response = await fetch('http://localhost:3000/cf-clearance-scraper', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://turnstile.zeroclover.io/',
        mode: 'turnstile-max'
    })
});

const result = await response.json();
console.log(result.token); // Turnstile 令牌
```

### 4. 创建 WAF 会话

创建可重复使用的 Cloudflare WAF 会话：

```javascript
const session = await fetch('http://localhost:3000/cf-clearance-scraper', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: 'https://nopecha.com/demo/cloudflare',
        mode: 'waf-session'
    })
}).then(res => res.json());

// 使用会话信息发送后续请求
const cookies = session.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
```

### 5. 新版 API 格式示例

使用新版 API 格式创建 Turnstile 令牌：

```javascript
const response = await fetch('http://localhost:3000/cftoken', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        type: "cftoken",
        websiteUrl: "https://turnstile.zeroclover.io/",
        websiteKey: "0x4AAAAAAAEwzhD6pyKkgXC0"
    })
});

const result = await response.json();
console.log(result.token); // Turnstile 令牌
console.log(result.code);  // 200
```

### 5. 代理支持

所有模式都支持代理配置：

```javascript
{
    url: 'https://example.com',
    mode: 'source',
    proxy: {
        host: '127.0.0.1',
        port: 8080,
        username: 'user', // 可选
        password: 'pass'  // 可选
    }
}
```

## 监控面板

访问 `http://localhost:3000/monitor` 查看实时监控面板，包含：

### 核心功能
- 📊 **服务状态总览** - 运行状态、实例使用情况、请求统计、内存信息
- 📈 **实时性能图表** - 响应时间、活跃请求、成功率趋势
- 📋 **统一请求记录** - 时间|URL|状态|Token|响应时间 格式的实时表格

### 状态说明
- **处理中** 🟡 - 请求正在处理中，显示实时响应时间
- **已完成** 🟢 - 请求成功完成
- **失败** 🔴 - 请求处理失败

### 特色功能
- **实时更新** - 每3秒自动刷新数据
- **智能整合** - 自动关联请求和生成的Token
- **Token缩略** - 显示前20字符，悬停查看完整内容
- **活跃高亮** - 处理中的请求动态高亮显示

### 监控 API

```bash
# 获取监控数据
curl http://localhost:3000/api/monitor

# 重置监控统计
curl -X POST http://localhost:3000/api/monitor/reset
```

## 测试工具

使用内置测试脚本验证服务状态：

```bash
python3 test_service.py
```

测试包含：
- ✅ 健康检查
- ✅ 监控API
- ✅ 基础功能测试
- ✅ 并发请求测试

## 性能特性

### 智能资源管理

- **按需创建**: 只有在收到请求时才创建浏览器上下文
- **自动清理**: 完成请求后立即释放上下文资源
- **内存监控**: 实时监控内存使用，自动触发垃圾回收
- **并发控制**: 智能限制同时运行的浏览器上下文数量

### 并发处理能力

- **默认配置**: 最大100个并发请求
- **资源优化**: 每个上下文独立运行，互不影响
- **负载均衡**: 自动分配请求到可用上下文
- **超时保护**: 自动清理超时请求，防止资源泄露

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

2. **内存使用过高**
   ```bash
   # 降低并发数
   browserLimit=10 node src/index.js
   
   # 增加内存清理频率
   memoryCleanupInterval=120000 node src/index.js
   ```

3. **请求超时**
   ```bash
   # 增加超时时间
   timeOut=120000 node src/index.js
   ```

### 性能优化建议

- **生产环境**: 推荐设置 `browserLimit=50-100`
- **开发环境**: 推荐设置 `browserLimit=5-10`
- **低内存设备**: 设置 `maxMemoryUsage=256`

## 响应格式

### 成功响应

```json
{
    "code": 200,
    "source": "页面源码...",           // source 模式
    "token": "turnstile_token...",    // turnstile 模式
    "headers": {...},                 // waf-session 模式
    "cookies": [...]                  // waf-session 模式
}
```

### 错误响应

```json
{
    "code": 500,
    "message": "错误描述"
}
```

### 状态码说明

- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 认证失败 (当设置了 authToken)
- `429` - 请求过多 (超过并发限制)
- `500` - 服务器内部错误

## 安全说明

⚠️ **免责声明**: 本工具仅用于测试和学习目的。使用者需对任何可能产生的法律责任承担责任。本库不意图对任何网站或公司造成损害，使用者对可能产生的任何损害承担责任。

## 许可证

ISC License - 详见 LICENSE 文件