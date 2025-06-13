# hCaptcha 使用指南

## 概述

hCaptcha 是一个广泛使用的验证码服务，本项目集成了基于 AI 的自动解决方案，使用 Google Gemini 模型进行图像识别和推理。

## 功能特性

- **AI驱动** - 使用 Google Gemini 2.0 Flash 模型
- **高准确率** - 支持多种hCaptcha挑战类型
- **快速响应** - 平均解决时间 20-60 秒
- **自动重试** - 内置错误处理和重试机制
- **实时监控** - 集成监控面板，查看解决状态

## 配置要求

### 1. 获取 Gemini API Key

访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取免费的 API 密钥。

### 2. 配置环境

在根目录的 `.env` 文件中设置：

```bash
# Google Gemini API Key (必需)
GEMINI_API_KEY=your_api_key_here

# AI模型配置 (推荐使用免费模型)
IMAGE_CLASSIFIER_MODEL=gemini-2.0-flash
SPATIAL_POINT_REASONER_MODEL=gemini-2.0-flash
SPATIAL_PATH_REASONER_MODEL=gemini-2.0-flash
CHALLENGE_CLASSIFIER_MODEL=gemini-2.0-flash

# hCaptcha超时设置
HCAPTCHA_SOLVER_TIMEOUT=300000
HCAPTCHA_PAGE_TIMEOUT=30000
```

### 3. 安装 Python 依赖

```bash
cd captcha-solvers/hcaptcha
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt
playwright install chromium
```

## 基本用法

### JavaScript 示例

```javascript
async function solveHcaptcha(websiteUrl, websiteKey) {
    const response = await fetch('http://localhost:3000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: "hcaptcha",
            websiteUrl: websiteUrl,
            websiteKey: websiteKey
        })
    });

    const result = await response.json();
    
    if (result.code === 200) {
        console.log('✅ hCaptcha solved successfully!');
        console.log('Token:', result.token);
        return result.token;
    } else {
        console.error('❌ Failed to solve hCaptcha:', result.message);
        throw new Error(result.message);
    }
}

// 使用示例
const token = await solveHcaptcha(
    'https://accounts.hcaptcha.com/demo',
    '338af34c-7bcb-4c7c-900b-acbec73d7d43'
);
```

### Python 示例

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
    
    response = requests.post(url, json=payload, timeout=300)
    result = response.json()
    
    if result.get("code") == 200:
        print(f"✅ hCaptcha solved: {result['token'][:50]}...")
        return result["token"]
    else:
        print(f"❌ Failed: {result.get('message')}")
        raise Exception(result.get('message'))

# 使用示例
token = solve_hcaptcha(
    "https://accounts.hcaptcha.com/demo",
    "338af34c-7bcb-4c7c-900b-acbec73d7d43"
)
```

### cURL 示例

```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "type": "hcaptcha",
    "websiteUrl": "https://accounts.hcaptcha.com/demo",
    "websiteKey": "338af34c-7bcb-4c7c-900b-acbec73d7d43"
  }'
```

## 高级功能

### 代理支持

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

### 错误处理和重试

```javascript
async function solveWithRetry(websiteUrl, websiteKey, maxRetries = 3) {
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
            
            // 处理特定错误
            if (result.code === 503) {
                console.log('Gemini API overloaded, retrying...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }
            
            throw new Error(result.message);
            
        } catch (error) {
            console.log(`Attempt ${i + 1} failed: ${error.message}`);
            
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // 等待重试
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
```

### 批量处理

```javascript
async function solveBatch(challenges) {
    const results = await Promise.allSettled(
        challenges.map(challenge => 
            solveHcaptcha(challenge.websiteUrl, challenge.websiteKey)
        )
    );
    
    return results.map((result, index) => ({
        challenge: challenges[index],
        success: result.status === 'fulfilled',
        token: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
    }));
}

// 使用示例
const challenges = [
    { websiteUrl: 'https://site1.com', websiteKey: 'key1' },
    { websiteUrl: 'https://site2.com', websiteKey: 'key2' },
    { websiteUrl: 'https://site3.com', websiteKey: 'key3' }
];

const results = await solveBatch(challenges);
```

## 测试和调试

### 内置测试脚本

```bash
# 运行 hCaptcha 测试
node test_hcaptcha.js
```

测试脚本功能：
- ✅ 服务状态检查
- ✅ hCaptcha 解决测试
- ✅ 响应格式验证
- ✅ 性能数据统计
- ✅ 错误处理测试

### 监控面板

访问 `http://localhost:3000/monitor` 查看：
- hCaptcha 请求状态
- 成功率统计
- 平均响应时间
- 活跃请求详情
- Token 生成历史

### 调试模式

临时启用详细日志：

```bash
# 修改 .env 文件
PYTHON_LOG_LEVEL=INFO
LOG_LEVEL=INFO
NODE_ENV=development
```

## 支持的挑战类型

本解决方案支持多种 hCaptcha 挑战类型：

- 🖼️ **图像分类** - 识别特定物体
- 📍 **点击选择** - 点击图像中的特定区域
- 🎯 **拖拽操作** - 拖拽物体到指定位置
- 🔢 **数量统计** - 计算图像中物体数量
- 🎨 **形状识别** - 识别几何形状和图案

## 性能优化

### 提高成功率

1. **使用稳定的网络连接**
2. **确保充足的 Gemini API 配额**
3. **适当增加超时时间**
4. **使用代理避免IP限制**

### 提高响应速度

1. **使用更快的服务器**
2. **优化网络延迟**
3. **减少并发请求数**
4. **使用本地缓存**

### 配置优化

```bash
# 高性能配置
HCAPTCHA_SOLVER_TIMEOUT=300000
HCAPTCHA_PAGE_TIMEOUT=30000
BROWSER_LIMIT=10
MAX_MEMORY_USAGE=1024

# 节省资源配置
HCAPTCHA_SOLVER_TIMEOUT=180000
HCAPTCHA_PAGE_TIMEOUT=20000
BROWSER_LIMIT=5
MAX_MEMORY_USAGE=512
```

## 常见问题

### 1. Gemini API 503 错误

**问题**: `503 Service Unavailable` 错误

**解决方案**:
- 检查 API 密钥是否正确
- 确认使用免费模型 `gemini-2.0-flash`
- 等待几分钟后重试
- 检查 API 配额使用情况

### 2. hCaptcha 解决失败

**问题**: `No challenge response found`

**解决方案**:
- 检查网站 URL 和 Site Key 是否正确
- 确认网站确实有 hCaptcha 验证码
- 增加超时时间
- 检查网络连接

### 3. Python 进程超时

**问题**: Python 解决器超时

**解决方案**:
```bash
# 增加超时时间
HCAPTCHA_SOLVER_TIMEOUT=600000  # 10分钟
HCAPTCHA_PAGE_TIMEOUT=60000     # 1分钟
```

### 4. 内存使用过高

**问题**: 内存占用过多

**解决方案**:
```bash
# 降低并发数
BROWSER_LIMIT=5
MAX_MEMORY_USAGE=256
MEMORY_CLEANUP_INTERVAL=120000
```

## 限制说明

### API 限制
- **Gemini 免费版**: 每分钟 15 次请求
- **Token 有效期**: 通常 10-120 分钟
- **并发限制**: 根据服务器配置

### 技术限制
- **网络依赖**: 需要稳定的网络连接
- **计算资源**: 需要一定的 CPU 和内存
- **浏览器要求**: 需要 Chromium 浏览器

## 最佳实践

1. **合理设置超时时间** - 根据网络情况调整
2. **使用连接池** - 避免频繁创建连接
3. **实现重试机制** - 处理临时失败
4. **监控成功率** - 及时发现问题
5. **遵守使用条款** - 合法合理使用

## 更新日志

- **v2.1.3**: 统一配置系统，改进 JSON 解析
- **v2.1.2**: 添加特殊标记解析，提高稳定性
- **v2.1.1**: 修复日志干扰问题
- **v2.1.0**: 集成 hcaptcha-challenger 库
- **v2.0.0**: 重构架构，添加 hCaptcha 支持