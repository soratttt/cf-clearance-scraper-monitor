# 一键部署指南

CF Clearance Scraper 支持 Mac 和 Windows 系统的一键部署，无需手动安装任何依赖。

## 🍎 Mac 系统部署

### 方法一：双击运行（推荐）
1. 双击 `deploy-mac.command` 文件
2. 如果提示"无法打开"，右键点击 → "打开" → 确认
3. 等待自动安装完成并启动服务

### 方法二：终端运行
```bash
chmod +x deploy-mac.command
./deploy-mac.command
```

## 🪟 Windows 系统部署

### 方法一：双击运行（推荐）
1. 双击 `deploy-windows.bat` 文件
2. 如果弹出安全警告，选择"仍要运行"
3. 建议"以管理员身份运行"以获得最佳体验
4. 等待自动安装完成并启动服务

### 方法二：命令行运行
```cmd
deploy-windows.bat
```

## 📝 部署说明

### 自动安装内容
- **Mac**: 自动安装 Homebrew、Node.js、项目依赖
- **Windows**: 自动安装 Chocolatey、Node.js、项目依赖

### 服务地址
部署成功后，可通过以下地址访问：
- 本地访问: `http://localhost:3000`
- 监控面板: `http://localhost:3000/monitor` 
- 局域网访问: `http://[你的IP]:3000`

### API 端点
- 原始格式: `POST /cf-clearance-scraper`
- 新版格式: `POST /cftoken`
- 监控 API: `GET /api/monitor`

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