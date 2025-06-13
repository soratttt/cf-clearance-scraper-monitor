# API 使用指南

## API 端点

本服务支持多种API格式，完全兼容：

### 格式一 - 传统格式
- **端点**: `POST /cf-clearance-scraper`
- **参数**: `url`, `siteKey`, `mode`
- **特性**: 支持代理配置，完整功能

### 格式二 - 统一格式  
- **端点**: `POST /`
- **参数**: `type`, `websiteUrl`, `websiteKey`
- **响应**: `{code: 200, message: "success", token: "xxx"}`
- **特性**: 标准化响应格式，更易集成

## Cloudflare 功能

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
const response = await fetch('http://localhost:3000/', {
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

## hCaptcha 功能

### 基本用法

解决 hCaptcha 验证码：

```javascript
const response = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        type: "hcaptcha",
        websiteUrl: "https://accounts.hcaptcha.com/demo",
        websiteKey: "338af34c-7bcb-4c7c-900b-acbec73d7d43"
    })
});

const result = await response.json();
if (result.code === 200) {
    console.log('hCaptcha solved successfully!');
    console.log('Token:', result.token);
} else {
    console.error('Failed to solve hCaptcha:', result.message);
}
```

### 带代理的 hCaptcha

```javascript
const response = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        type: "hcaptcha",
        websiteUrl: "https://accounts.hcaptcha.com/demo",
        websiteKey: "338af34c-7bcb-4c7c-900b-acbec73d7d43",
        proxy: {
            host: "127.0.0.1",
            port: 8080,
            username: "user", // 可选
            password: "pass"  // 可选
        }
    })
});
```

### hCaptcha 测试脚本

使用内置测试脚本：

```bash
node test_hcaptcha.js
```

测试脚本会：
- 检查服务状态
- 发送hCaptcha解决请求
- 验证响应格式
- 显示性能数据

## 代理支持

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

## 认证

如果服务设置了认证令牌，需要在请求中包含：

```javascript
{
    type: "cftoken",
    websiteUrl: "https://example.com",
    websiteKey: "your-site-key",
    authToken: "your-auth-token"
}
```

## 响应格式

### 成功响应

```json
{
    "code": 200,
    "source": "页面源码...",           // source 模式
    "token": "turnstile_token...",    // turnstile/hcaptcha 模式
    "message": "success",             // 成功消息
    "headers": {...},                 // waf-session 模式
    "cookies": [...]                  // waf-session 模式
}
```

### 错误响应

```json
{
    "code": 500,
    "message": "错误描述",
    "token": null
}
```

### 状态码说明

- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 认证失败 (当设置了 authToken)
- `429` - 请求过多 (超过并发限制)
- `500` - 服务器内部错误

## Python 示例

```python
import requests
import json

def solve_hcaptcha(website_url, website_key):
    url = "http://localhost:3000/"
    
    payload = {
        "type": "hcaptcha",
        "websiteUrl": website_url,
        "websiteKey": website_key
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=300)
    result = response.json()
    
    if result.get("code") == 200:
        print(f"✅ hCaptcha solved successfully!")
        print(f"Token: {result['token'][:50]}...")
        return result["token"]
    else:
        print(f"❌ Failed: {result.get('message')}")
        return None

# 使用示例
token = solve_hcaptcha(
    "https://accounts.hcaptcha.com/demo", 
    "338af34c-7bcb-4c7c-900b-acbec73d7d43"
)
```

## 性能优化

### 并发请求

```javascript
// 并发处理多个请求
const requests = [
    solve_captcha("https://site1.com", "key1"),
    solve_captcha("https://site2.com", "key2"),
    solve_captcha("https://site3.com", "key3")
];

const results = await Promise.all(requests);
```

### 错误重试

```javascript
async function solve_with_retry(websiteUrl, websiteKey, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch('http://localhost:3000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "hcaptcha",
                    websiteUrl,
                    websiteKey
                })
            });
            
            const result = await response.json();
            if (result.code === 200) {
                return result.token;
            }
            
            console.log(`Attempt ${i + 1} failed: ${result.message}`);
        } catch (error) {
            console.log(`Attempt ${i + 1} error: ${error.message}`);
        }
        
        // 等待重试
        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    throw new Error('All retry attempts failed');
}
```

## 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/health

# 获取监控数据
curl http://localhost:3000/api/monitor
```

## 限制说明

### 并发限制
- 默认最大并发请求数：100
- 可通过 `MAX_CONCURRENT_REQUESTS` 配置调整

### 超时限制
- 默认请求超时：5分钟 (300秒)
- hCaptcha 解决通常需要 20-60 秒
- 可通过 `TIMEOUT` 配置调整

### 内存限制
- 默认最大内存使用：512MB
- 可通过 `MAX_MEMORY_USAGE` 配置调整
- 自动内存清理机制