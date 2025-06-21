# 测试目录

本目录包含 CF Clearance Scraper 项目的所有测试脚本和相关文档。

## [FOLDER] 文件结构

```
tests/
├── README.md                      # 本文件
├── TESTING.md                     # 详细测试指南
├── deployment_check.sh            # 部署自检脚本
├── quick_test.js                  # 快速功能测试
├── test_hcaptcha_deployment.js    # 完整部署测试
└── test_hcaptcha.js              # hCaptcha 单元测试
```

## [TEST] 测试脚本说明

### 1. `deployment_check.sh` - 部署自检脚本
**用途**: 快速检查部署环境是否正确配置

**特点**:
- 检查环境配置文件 (.env)
- 验证 Node.js 和 Python 依赖
- 检查服务端口状态
- 提供修复建议

**使用方法**:
```bash
# 从项目根目录运行
./tests/deployment_check.sh
```

### 2. `quick_test.js` - 快速功能测试
**用途**: 快速验证 hCaptcha 解决器是否正常工作

**特点**:
- 直接测试 hCaptcha 解决功能
- 详细的响应分析和验证
- 支持远程测试
- 适合日常快速检查

**使用方法**:
```bash
# 本地测试
node tests/quick_test.js

# 远程测试
node tests/quick_test.js --host 192.168.1.100 --port 3000

# 查看帮助
node tests/quick_test.js --help
```

### 3. `test_hcaptcha_deployment.js` - 完整部署测试
**用途**: 全面测试所有组件和功能

**特点**:
- 环境配置检查
- Node.js 和 Python 依赖验证
- 服务状态检查
- API 接口测试
- hCaptcha 解决器完整测试
- 详细的错误诊断

**使用方法**:
```bash
# 完整测试
node tests/test_hcaptcha_deployment.js

# 指定主机和端口
node tests/test_hcaptcha_deployment.js --host 192.168.1.100 --port 3000

# 查看帮助
node tests/test_hcaptcha_deployment.js --help
```

### 4. `test_hcaptcha.js` - hCaptcha 单元测试
**用途**: hCaptcha 功能的单元测试

**特点**:
- 针对 hCaptcha 模块的具体测试
- 用于开发和调试

## [LIST] 推荐的测试流程

### 新部署验证
1. **运行部署自检**: `./tests/deployment_check.sh`
2. **启动服务**: `npm start`
3. **运行完整测试**: `node tests/test_hcaptcha_deployment.js`

### 日常维护检查
```bash
# 快速功能检查
node tests/quick_test.js
```

### 远程部署验证
```bash
# 从其他机器测试
node tests/quick_test.js --host 服务器IP --port 3000
```

### 问题诊断
1. **部署自检**: `./tests/deployment_check.sh`
2. **详细测试**: `node tests/test_hcaptcha_deployment.js`
3. **查看日志**: `NODE_ENV=development npm start`

## [CONFIG] 常见问题

### 脚本权限问题
```bash
chmod +x tests/deployment_check.sh
```

### 路径问题
确保从项目根目录运行所有测试脚本：
```bash
# 正确的运行方式
./tests/deployment_check.sh
node tests/quick_test.js

# 错误的运行方式 (在tests目录中)
cd tests
./deployment_check.sh  # [FAIL] 会找不到项目文件
```

### Node.js 模块路径
测试脚本已经正确配置了相对路径，会自动找到项目根目录的依赖和配置文件。

## 📖 详细文档

查看 `TESTING.md` 获取更详细的测试指南，包括：
- 测试项目详细说明
- 常见问题排查
- 成功测试示例
- 错误代码含义

## [START] 快速开始

如果你是第一次使用，建议按以下顺序进行：

1. **阅读测试指南**: `tests/TESTING.md`
2. **运行部署自检**: `./tests/deployment_check.sh`
3. **配置必要参数**: 根据自检结果修复问题
4. **启动服务**: `npm start`
5. **验证功能**: `node tests/quick_test.js`

成功后你就可以正常使用 hCaptcha 解决器了！[SUCCESS]