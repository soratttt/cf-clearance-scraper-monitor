# hCaptcha 集成使用指南

## 🎯 概述

本项目已集成 hCaptcha 解决器，基于 hcaptcha-challenger 和 Google Gemini API。

## 🔧 配置步骤

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录您的 Google 账户
3. 点击 "Create API Key" 创建新的 API Key
4. 复制生成的 API Key

### 2. 设置环境

```bash
# 运行项目设置脚本
python3 setup.py

# 或者单独设置 hCaptcha 模块
cd captcha-solvers/hcaptcha
python3 setup.py
```

### 3. 配置 API Key

编辑 `captcha-solvers/hcaptcha/.env` 文件：

```bash
# hCaptcha Challenger 配置文件

# Gemini API Key (必需)
GEMINI_API_KEY=your_actual_api_key_here

# 可选配置
# DISABLE_BEZIER_TRAJECTORY=false
```

## 🚀 使用方法

### 统一 API 接口

```javascript
const response = await fetch('http://43.163.0.170:3000/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        type: "hcaptcha",
        websiteUrl: "https://discord.com/login",
        websiteKey: "4c672d35-0701-42b2-88c3-78380b0db560"
    })
});

const result = await response.json();
console.log(result);
```

### 响应格式

```json
{
    "code": 200,
    "message": "hCaptcha solved successfully",
    "token": "P1_eyJ0eXAiOiJKV1Q..."
}
```

## 🔍 支持的验证码类型

hcaptcha-challenger 支持以下类型的 hCaptcha 挑战：

1. **图像二元分类** (`image_label_binary`)
   - 选择包含特定对象的图像
   - 例如：选择包含汽车的图像

2. **图像区域选择** (`image_label_area_select`)
   - 点击图像中的特定区域
   - 例如：点击所有交通信号灯

3. **拖拽挑战** (`image_drag_drop`)
   - 将对象拖拽到指定位置
   - 例如：将拼图块拖到正确位置

## ⚡ 性能优化

### Gemini 模型选择

hcaptcha-challenger 使用不同的 Gemini 模型：

- **快速推理**: `gemini-2.0-flash` (默认)
- **高精度推理**: `gemini-2.5-pro-preview-06-05`

### 成本控制

- **免费额度**: Gemini 提供免费的 API 调用额度
- **付费计划**: 根据使用量付费，详见 [Gemini 定价](https://ai.google.dev/pricing)

## 🧪 测试

### 测试单个请求

```bash
cd captcha-solvers/hcaptcha
python solver.py '{"websiteUrl":"https://discord.com/login","websiteKey":"4c672d35-0701-42b2-88c3-78380b0db560"}'
```

### 测试统一 API

```bash
# 在项目根目录
node test_unified_api.js
```

## 🛠️ 故障排除

### 常见错误

1. **API Key 未配置**
   ```json
   {
     "code": 500,
     "message": "Gemini API Key not configured..."
   }
   ```
   **解决方案**: 检查 `.env` 文件中的 `GEMINI_API_KEY` 配置

2. **模块导入失败**
   ```json
   {
     "code": 500,
     "message": "hcaptcha_challenger module not found..."
   }
   ```
   **解决方案**: 运行 `python3 setup.py` 重新安装依赖

3. **浏览器启动失败**
   **解决方案**: 确保 Playwright 浏览器已安装
   ```bash
   cd captcha-solvers/hcaptcha/venv/bin
   ./python -m playwright install chromium
   ```

### 调试模式

设置环境变量启用详细日志：

```bash
export LOGURU_LEVEL=DEBUG
```

## 📊 API 限制

### Gemini API 限制

- **请求频率**: 每分钟 60 次请求 (免费版)
- **并发请求**: 最多 5 个并发请求
- **超时时间**: 单次请求最长 5 分钟

### hCaptcha 限制

- **解决时间**: 通常 10-60 秒
- **成功率**: 取决于验证码复杂度，通常 85-95%
- **代理支持**: 支持 HTTP/HTTPS 代理

## 🔐 安全注意事项

1. **保护 API Key**: 不要将 API Key 提交到代码仓库
2. **使用 HTTPS**: 生产环境中使用 HTTPS 协议
3. **限制访问**: 配置防火墙规则限制 API 访问
4. **监控使用**: 定期检查 API 使用量和费用

## 📈 监控和日志

- **服务监控**: 访问 `http://localhost:3000/api/monitor`
- **日志文件**: 位于 `captcha-solvers/hcaptcha/logs/`
- **性能指标**: 包括成功率、响应时间等

## 🆕 更新和维护

```bash
# 更新 hcaptcha-challenger
cd captcha-solvers/hcaptcha
git pull origin main
pip install -e .

# 更新 Gemini API 库
pip install --upgrade google-generativeai
```