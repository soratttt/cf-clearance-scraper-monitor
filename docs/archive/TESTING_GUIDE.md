# 测试指南

## 🧪 hCaptcha 测试脚本

我为 hCaptcha 功能创建了完整的测试套件，使用官方测试网站进行真实测试。

### 📋 测试脚本说明

| 脚本文件 | 用途 | 运行时间 |
|---------|------|----------|
| `check_hcaptcha_config.js` | 检查配置是否正确 | 5 秒 |
| `quick_test_hcaptcha.js` | 快速功能测试 | 30-120 秒 |
| `test_hcaptcha.js` | 完整测试套件 | 30-120 秒 |
| `test_unified_api.js` | 统一 API 测试 | 10 秒 |

### 🎯 测试网站信息

- **URL**: https://accounts.hcaptcha.com/demo
- **Site Key**: 338af34c-7bcb-4c7c-900b-acbec73d7d43
- **类型**: hCaptcha 官方演示页面

### 🚀 快速开始

#### 1. 检查配置
```bash
node check_hcaptcha_config.js
```

#### 2. 快速测试
```bash
node quick_test_hcaptcha.js
```

#### 3. 完整测试
```bash
node test_hcaptcha.js
```

### 📊 预期结果

#### ✅ 成功响应
```json
{
  "code": 200,
  "message": "hCaptcha solved successfully",
  "token": "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### ❌ 配置错误
```json
{
  "code": 500,
  "message": "Gemini API Key not configured. Please set GEMINI_API_KEY in environment or .env file...",
  "token": null
}
```

#### ⚠️ 常见错误
```json
{
  "code": 500,
  "message": "hcaptcha_challenger module not found. Please run setup.py first.",
  "token": null
}
```

### 🔧 故障排除

#### 问题 1: 服务未运行
```
❌ 服务未运行或无法连接
请确保服务已启动: npm start
```

**解决方案**: 
```bash
npm start
```

#### 问题 2: API Key 未配置
```
❌ Gemini API Key not configured
```

**解决方案**:
1. 获取 API Key: https://aistudio.google.com/app/apikey
2. 编辑 `captcha-solvers/hcaptcha/.env` 文件
3. 设置 `GEMINI_API_KEY=your_actual_key`

#### 问题 3: Python 环境问题
```
❌ hcaptcha_challenger module not found
```

**解决方案**:
```bash
cd captcha-solvers/hcaptcha
python3 setup.py
```

#### 问题 4: 超时错误
```
💥 Request timeout
```

**可能原因**:
- hCaptcha 挑战过于复杂
- 网络连接不稳定
- Gemini API 响应缓慢

**解决方案**:
- 等待并重试
- 检查网络连接
- 查看 Gemini API 状态

### 📈 性能指标

#### 正常范围
- **响应时间**: 30-120 秒
- **成功率**: 85-95%
- **Token 长度**: 500-2000 字符

#### 优化建议
- 使用稳定的网络连接
- 确保 Gemini API 配额充足
- 监控系统资源使用

### 🎮 交互式测试

运行交互式测试模式：
```bash
node test_hcaptcha.js --interactive
```

### 📝 测试日志

测试脚本会输出详细的日志信息：

```
🧪 hCaptcha 功能测试
============================================================
🌐 测试网站: https://accounts.hcaptcha.com/demo
🔑 Site Key: 338af34c-7bcb-4c7c-900b-acbec73d7d43
🖥️  服务地址: http://localhost:3000
============================================================

📡 检查服务状态...
✅ 服务运行正常

🎯 开始 hCaptcha 解决测试...
⏱️  预计耗时: 30-120 秒

📤 发送请求到: http://localhost:3000/
📤 请求数据: {
  "type": "hcaptcha",
  "websiteUrl": "https://accounts.hcaptcha.com/demo",
  "websiteKey": "338af34c-7bcb-4c7c-900b-acbec73d7d43"
}

📥 收到响应:
────────────────────────────────────────
⏱️  耗时: 1m 23s
📊 状态码: 200
📋 响应体: {
  "code": 200,
  "message": "hCaptcha solved successfully",
  "token": "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

🔍 响应验证:
────────────────────────────────────────
✅ PASS HTTP Status: 200 OK
✅ PASS Response Format: Valid JSON
✅ PASS Field: code: Present
✅ PASS Field: message: Present
✅ PASS Token Field: Length: 1247

📈 测试总结:
────────────────────────────────────────
✅ 通过验证: 5/5
⏱️  总耗时: 1m 23s
🎉 hCaptcha 解决成功!
🎫 Token: P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

🏁 测试完成
```

### 🔄 CI/CD 集成

可以将测试脚本集成到 CI/CD 流水线中：

```yaml
# .github/workflows/test.yml
name: Test hCaptcha
on: [push, pull_request]

jobs:
  test-hcaptcha:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Setup hCaptcha
        run: python3 setup.py
      - name: Start service
        run: npm start &
      - name: Wait for service
        run: sleep 10
      - name: Test hCaptcha
        run: node test_hcaptcha.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### 📊 监控和报告

使用监控 API 查看系统状态：
```bash
curl http://localhost:3000/api/monitor
```

这将返回详细的系统监控信息，包括请求统计、内存使用等。