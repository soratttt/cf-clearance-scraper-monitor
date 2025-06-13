# 🔧 端口配置指南

CF Clearance Scraper 支持自定义端口配置，默认使用 3000 端口。

## 🎯 快速修改方法

### 方法一：修改部署脚本（推荐）

#### Mac 系统
编辑 `一键部署-MAC.command` 文件：
```bash
# 找到这一行：
PORT=3000  # 🔧 修改这里的端口号

# 改为你想要的端口，例如：
PORT=8080  # 🔧 修改这里的端口号
```

#### Windows 系统  
编辑 `一键部署-WIN.bat` 文件：
```batch
REM 找到这一行：
set PORT=3000
REM 🔧 修改上面这行的端口号

REM 改为你想要的端口，例如：
set PORT=8080
REM 🔧 修改上面这行的端口号
```

### 方法二：环境变量设置

#### 临时设置（当次运行有效）

**Mac/Linux:**
```bash
PORT=8080 node src/index.js
```

**Windows:**
```cmd
set PORT=8080 && node src/index.js
```

#### 永久设置

**Mac/Linux:**
```bash
# 添加到环境变量文件
echo 'export PORT=8080' >> ~/.zprofile
source ~/.zprofile
```

**Windows:**
```cmd
# 通过系统设置添加环境变量
# 控制面板 > 系统 > 高级系统设置 > 环境变量
# 添加新的用户变量: PORT = 8080
```

## 📋 修改步骤详解

### 🔧 完整修改流程

1. **选择端口号**
   - 建议使用 3000-9999 范围内的端口
   - 避免使用系统保留端口（1-1023）
   - 常用端口：3000, 8080, 8000, 9000

2. **修改部署脚本**
   - Mac: 编辑 `一键部署-MAC.command` 第82行
   - Windows: 编辑 `一键部署-WIN.bat` 第71行

3. **重新部署**
   - 运行修改后的部署脚本
   - 脚本会自动配置防火墙规则

## 🌐 端口配置示例

### 示例1：使用8080端口

**Mac 脚本修改:**
```bash
PORT=8080  # 🔧 修改这里的端口号
```

**Windows 脚本修改:**
```batch
set PORT=8080
REM 🔧 修改上面这行的端口号
```

**访问地址变为:**
- 本地: `http://localhost:8080`
- 监控: `http://localhost:8080/monitor`
- 局域网: `http://[IP]:8080`

### 示例2：使用9000端口

**修改部署脚本:**
```bash
# Mac
PORT=9000

# Windows  
set PORT=9000
```

**API调用示例:**
```javascript
// 旧格式
fetch('http://localhost:9000/cf-clearance-scraper', {
    method: 'POST',
    body: JSON.stringify({
        url: 'https://example.com',
        siteKey: 'your-site-key',
        mode: 'turnstile-min'
    })
});

// 新格式
fetch('http://localhost:9000/cftoken', {
    method: 'POST', 
    body: JSON.stringify({
        type: 'cftoken',
        websiteUrl: 'https://example.com',
        websiteKey: 'your-site-key'
    })
});
```

## 🔒 防火墙配置

### 自动配置
部署脚本会自动配置防火墙规则，支持自定义端口。

### 手动配置

**Mac/Linux:**
```bash
# 开放端口（以8080为例）
sudo ufw allow 8080/tcp
```

**Windows:**
```cmd
# 添加防火墙规则（以8080为例）
netsh advfirewall firewall add rule name="CF Clearance Scraper" dir=in action=allow protocol=TCP localport=8080
```

## ⚠️ 注意事项

1. **端口冲突**
   - 确保选择的端口未被其他程序占用
   - 部署脚本会自动检查并关闭冲突进程

2. **局域网访问**
   - 修改端口后，局域网访问地址也会相应变化
   - 确保路由器没有阻止自定义端口

3. **云服务器部署**
   - 需要在云服务器控制台开放对应端口
   - 安全组或防火墙规则需要包含新端口

4. **反向代理**
   - 如使用Nginx等反向代理，需要相应修改配置
   
## 🚀 验证配置

修改端口后，通过以下方式验证：

1. **检查服务启动日志**
   ```
   Server running on port 8080
   Local access: http://localhost:8080
   Network access: http://0.0.0.0:8080
   ```

2. **访问监控面板**
   ```
   http://localhost:[你的端口]/monitor
   ```

3. **API测试**
   ```bash
   curl http://localhost:[你的端口]/health
   ```

## 📞 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用（Mac/Linux）
   lsof -i :8080
   
   # 查看端口占用（Windows）
   netstat -ano | findstr :8080
   ```

2. **防火墙阻止**
   - 检查系统防火墙设置
   - 云服务器检查安全组配置

3. **权限不足**
   - 使用1024以下端口需要管理员权限
   - 建议使用1024以上端口

配置完成后，重新运行部署脚本即可使用新端口！