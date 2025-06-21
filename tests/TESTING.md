# hCaptcha 部署测试指南

本文档介绍如何测试 hCaptcha 解决器的部署状态，确保所有组件正常工作。

## [TEST] 测试脚本

项目提供了三个测试脚本，适用于不同的测试场景：

### 1. 部署自检脚本 `deployment_check.sh`

**用途**: 部署后快速检查环境配置
**特点**: 
- 检查环境配置文件
- 验证依赖安装状态
- 检查服务端口
- 提供测试命令建议

```bash
# 使用方法
./deployment_check.sh

# 或者
bash deployment_check.sh
```

### 2. 完整测试脚本 `test_hcaptcha_deployment.js`

**用途**: 全面测试所有组件
**特点**:
- 环境配置检查
- Node.js 依赖验证
- Python 环境测试
- 服务状态检查
- API 接口测试
- hCaptcha 解决器测试

```bash
# 基本使用
node test_hcaptcha_deployment.js

# 指定端口
node test_hcaptcha_deployment.js --port 3001

# 指定主机和端口 (远程测试)
node test_hcaptcha_deployment.js --host 192.168.1.100 --port 3000

# 查看帮助
node test_hcaptcha_deployment.js --help
```

### 3. 快速测试脚本 `quick_test.js`

**用途**: 快速验证 hCaptcha 解决器是否工作
**特点**:
- 直接测试 hCaptcha 解决功能
- 详细的响应分析
- 适合日常快速检查

```bash
# 基本使用
node quick_test.js

# 指定主机和端口
node quick_test.js --host 192.168.1.100 --port 3000
```

## [LIST] 测试流程建议

### 新部署测试

1. **运行部署自检**
   ```bash
   ./deployment_check.sh
   ```

2. **启动服务**
   ```bash
   npm start
   ```

3. **运行完整测试**
   ```bash
   node test_hcaptcha_deployment.js
   ```

### 日常维护测试

```bash
# 快速检查服务状态
node quick_test.js

# 如有问题，运行完整诊断
node test_hcaptcha_deployment.js
```

### 远程部署测试

```bash
# 从其他机器测试部署的服务
node quick_test.js --host 192.168.1.100 --port 3000
```

## [DEBUG] 测试项目说明

### 环境配置检查
- [OK] `.env` 文件存在
- [OK] `GEMINI_API_KEY` 已配置且非示例值
- [OK] 端口配置正常

### 依赖检查
- [OK] `package.json` 存在
- [OK] `node_modules` 目录存在
- [OK] 关键依赖包已安装

### Python 环境检查
- [OK] Python 虚拟环境存在
- [OK] `hcaptcha-challenger` 包可导入
- [OK] `playwright` 包可导入
- [OK] API 密钥在 Python 中可读取

### 服务状态检查
- [OK] 服务在指定端口运行
- [OK] 监控页面可访问
- [OK] API 端点响应正常

### hCaptcha 功能测试
- [OK] 成功解决验证码
- [OK] 返回有效 token
- [OK] 响应时间合理 (通常 30-120 秒)

## [FAIL] 常见问题排查

### API 密钥相关

**问题**: `API密钥未配置或仍为示例值`
**解决**: 
1. 编辑 `.env` 文件
2. 设置 `GEMINI_API_KEY=你的真实密钥`
3. 重启服务

### Python 环境相关

**问题**: `hcaptcha-challenger 模块未安装`
**解决**:
```bash
cd captcha-solvers/hcaptcha
source venv/bin/activate
pip install -e hcaptcha-challenger
```

**问题**: `Playwright 模块未安装`
**解决**:
```bash
cd captcha-solvers/hcaptcha
source venv/bin/activate
pip install playwright
playwright install chromium
```

### 服务连接相关

**问题**: `无法连接到服务`
**解决**:
1. 确认服务已启动: `npm start`
2. 检查端口配置
3. 检查防火墙设置
4. 确认服务监听地址

### hCaptcha 解决失败

**问题**: `hCaptcha solver failed with exit code 1`
**可能原因及解决**:
1. **API 密钥无效**: 检查 Gemini API 密钥配置
2. **网络问题**: 检查网络连接和代理设置
3. **依赖缺失**: 重新运行一键部署脚本
4. **浏览器问题**: 确保 Chromium 已正确安装

## [TARGET] 成功测试示例

### 完整测试成功输出
```
[TEST] hCaptcha 部署测试开始
[NETWORK] 测试目标: http://localhost:3000

[DEBUG] [1/6] 检查环境配置...
[OK] 环境配置文件: .env 文件存在
[OK] Gemini API 密钥配置: API 密钥已配置
[OK] 端口配置: 端口配置正常

[PACKAGE] [2/6] 检查 Node.js 依赖...
[OK] package.json: package.json 存在
[OK] Node.js 依赖: node_modules 目录存在

[PYTHON] [3/6] 检查 Python 环境...
[OK] Python 虚拟环境: 虚拟环境存在
[OK] Python 版本: Python 3.11.0
[OK] hcaptcha-challenger: 模块可用
[OK] Playwright: 模块可用
[OK] API 密钥在 Python 中可读: API 密钥配置正确

[NETWORK] [4/6] 检查服务状态...
[OK] 服务可访问性: 服务在 http://localhost:3000 正常运行
[OK] 监控页面: 监控页面可访问

[CONNECT] [5/6] 测试基础 API...
[OK] API 端点响应: API 正确拒绝了无效请求
[OK] JSON 响应格式: 返回格式正确

[TARGET] [6/6] 测试 hCaptcha 解决器...
[OK] hCaptcha 解决器: 成功解决验证码 (45秒)
[OK] Token 生成: Token: P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

[STATS] 测试总结
==================================================
[SUCCESS] 所有测试通过! (12/12)
[OK] hCaptcha 解决器部署成功，可以正常使用！
```

### 快速测试成功输出
```
[STATUS] 检查服务状态...
[OK] 服务运行正常

[TARGET] 开始 hCaptcha 解决测试...
[TIMER]  预计耗时: 30-120 秒

[REQUEST] 发送请求到: http://localhost:3000/
[RESPONSE] 收到响应:
────────────────────────────────────────
[TIMER]  耗时: 42s
[STATS] 状态码: 200
[LIST] 响应体: {
  "code": 200,
  "message": "hCaptcha solved successfully",
  "token": "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

[DEBUG] 响应验证:
────────────────────────────────────────
[OK] PASS HTTP Status: 200
[OK] PASS Response Format: Valid JSON
[OK] PASS Field: code: Present
[OK] PASS Field: message: Present
[OK] PASS Token: Valid

[INFO] 测试总结:
────────────────────────────────────────
[OK] 通过验证: 5/5
[TIMER]  总耗时: 42s
[SUCCESS] hCaptcha 解决成功

[SUCCESS] 所有测试通过！hCaptcha 解决器工作正常！
```

## [INFO] 提示

1. **首次部署**: 建议运行完整测试确保所有组件正常
2. **日常维护**: 使用快速测试即可
3. **远程验证**: 从其他机器测试确保网络访问正常
4. **性能监控**: 关注解决验证码的耗时，正常范围是 30-120 秒
5. **问题诊断**: 如果快速测试失败，运行完整测试获取详细诊断信息

---

有问题请参考项目文档或提交 Issue。