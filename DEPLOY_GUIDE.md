# 🚀 一键部署指南

CF Clearance Scraper 提供傻瓜式一键部署，支持 Mac 和 Windows 系统，完全零配置。

## 🍎 Mac 系统部署

### 🎯 超简单部署（推荐）
1. 双击 **`一键部署-MAC.command`** 文件
2. 如果提示"无法打开"，右键点击 → "打开" → 确认运行
3. 自动完成：Homebrew安装 → Node.js安装 → 依赖安装 → 服务启动
4. 看到服务地址后即可使用

### ⚡ 终端运行
```bash
chmod +x "一键部署-MAC.command"
./"一键部署-MAC.command"
```

## 🪟 Windows 系统部署

### 🎯 超简单部署（推荐）
1. 双击 **`一键部署-WIN.bat`** 文件
2. 如果弹出安全警告，选择"仍要运行"
3. 建议"以管理员身份运行"以获得最佳体验
4. 自动完成：Node.js检查 → 依赖安装 → 防火墙配置 → 服务启动
5. 看到服务地址后即可使用

### ⚡ 命令行运行
```cmd
"一键部署-WIN.bat"
```

## 📋 部署说明

### 🔧 自动安装内容
- **Mac**: Homebrew → Node.js → 项目依赖 → 环境配置
- **Windows**: Node.js检查 → 项目依赖 → 防火墙配置 → 服务启动

### 🌐 服务地址
部署成功后，脚本会自动显示访问地址：
- **本地访问**: `http://localhost:3000`
- **监控面板**: `http://localhost:3000/monitor` 
- **局域网访问**: `http://[自动获取的IP]:3000`

### 🔗 API 端点
- **旧版格式**: `POST /cf-clearance-scraper`
- **新版格式**: `POST /cftoken`
- **监控接口**: `GET /api/monitor`
- **健康检查**: `GET /health`

## 🔧 故障排除

### Mac 常见问题
1. **权限问题**: 右键点击文件 → "打开" → 确认运行
2. **Homebrew 安装失败**: 检查网络连接，手动安装 Homebrew
3. **端口占用**: 脚本会自动处理，或手动关闭占用进程

### Windows 常见问题
1. **执行策略限制**: 以管理员身份运行 PowerShell，执行 `Set-ExecutionPolicy RemoteSigned`
2. **防火墙阻止**: 选择"允许访问"或手动添加防火墙规则
3. **Chocolatey 安装失败**: 检查网络连接，或手动安装 Node.js

### 手动安装 Node.js
如果自动安装失败，请手动安装：
- Mac: 从 [nodejs.org](https://nodejs.org) 下载 .pkg 安装包
- Windows: 从 [nodejs.org](https://nodejs.org) 下载 .msi 安装包

安装完成后重新运行部署脚本。

## 🚀 使用说明

1. **启动服务**: 运行部署脚本后服务自动启动
2. **查看监控**: 访问 `http://localhost:3000/monitor`
3. **停止服务**: 在终端按 `Ctrl+C`
4. **重启服务**: 重新运行部署脚本

## 🌐 局域网部署

部署脚本自动配置局域网访问：
- 服务绑定到 `0.0.0.0:3000`
- 自动显示局域网访问地址
- 添加必要的防火墙规则

其他设备可通过 `http://[部署机器IP]:3000` 访问服务。

## 📞 技术支持

如遇问题，请：
1. 检查 Node.js 版本 >= 16.0
2. 确保网络连接正常
3. 查看终端错误信息
4. 尝试手动安装依赖: `npm install`