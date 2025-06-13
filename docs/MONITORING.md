# 监控指南

## 监控面板概述

CF Clearance Scraper 提供了完整的实时监控系统，帮助您了解服务状态、性能指标和请求历史。

## 访问监控面板

### 本地访问
```
http://localhost:3000/monitor
```

### 网络访问
```
http://your-server-ip:3000/monitor
```

## 主要功能

### 服务状态总览

显示关键性能指标：
- **运行状态** - 服务运行时间和状态
- **实例使用情况** - 活跃/总计/可用实例数
- **请求统计** - 总计/成功/失败/活跃请求数
- **成功率** - 实时计算的请求成功百分比
- **内存信息** - 堆内存使用、RSS、外部内存等

### 实时性能图表

动态图表显示：
- **响应时间趋势** - 过去一小时的响应时间变化
- **活跃请求数量** - 并发请求数量变化
- **成功率趋势** - 成功率波动情况
- **内存使用变化** - 内存占用趋势

### 统一请求记录

实时表格显示：
- **时间** - 请求开始时间
- **URL** - 目标网站地址
- **服务** - Cloudflare 或 hCaptcha
- **状态** - 处理中/已完成/失败
- **Token** - 生成的令牌（前20字符，悬停查看完整）
- **响应时间** - 处理耗时

### 状态标识

- **处理中** 🟡 - 请求正在处理中，显示实时响应时间
- **已完成** 🟢 - 请求成功完成
- **失败** 🔴 - 请求处理失败

## 监控 API

### 获取监控数据

```bash
GET /api/monitor
```

**响应示例**：
```json
{
  "status": "running",
  "uptime": 3600000,
  "startTime": "2024-01-01T00:00:00.000Z",
  "instances": {
    "total": 100,
    "active": 5,
    "available": 95
  },
  "requests": {
    "total": 1250,
    "successful": 1180,
    "failed": 70,
    "active": 5,
    "successRate": "94.40"
  },
  "activeRequests": [
    {
      "id": "1749777375410_ltz1hbu9d",
      "url": "https://accounts.hcaptcha.com/demo",
      "mode": "hcaptcha",
      "startTime": "2024-01-01T01:16:15.410Z",
      "duration": 45000,
      "clientIP": "127.0.0.1"
    }
  ],
  "recentTokens": [
    {
      "token": "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "url": "https://accounts.hcaptcha.com/demo",
      "mode": "hcaptcha",
      "timestamp": "2024-01-01T01:17:03.496Z",
      "requestId": "1749777375410_ltz1hbu9d"
    }
  ],
  "requestHistory": [
    {
      "requestId": "1749777375410_ltz1hbu9d",
      "url": "https://accounts.hcaptcha.com/demo",
      "mode": "hcaptcha",
      "success": true,
      "timestamp": "2024-01-01T01:17:03.496Z",
      "responseTime": 48086
    }
  ],
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 67.8,
    "external": 12.3,
    "rss": 89.1,
    "heapUsagePercent": 0.67
  },
  "activeRequestsByService": {
    "cloudflare": 2,
    "hcaptcha": 3
  },
  "timestamp": "2024-01-01T01:20:00.000Z"
}
```

### 重置监控数据

```bash
POST /api/monitor/reset
```

清除所有统计数据，重新开始计数。

### 健康检查

```bash
GET /health
```

返回 `healthy` 表示服务正常运行。

## 自定义监控

### JavaScript 集成

```javascript
// 获取监控数据
async function getMonitorData() {
    const response = await fetch('/api/monitor');
    const data = await response.json();
    return data;
}

// 监控特定指标
function checkPerformance() {
    getMonitorData().then(data => {
        console.log(`成功率: ${data.requests.successRate}%`);
        console.log(`活跃请求: ${data.requests.active}`);
        console.log(`内存使用: ${data.memory.heapUsagePercent * 100}%`);
        
        // 警告检查
        if (data.requests.successRate < 90) {
            console.warn('⚠️ 成功率过低！');
        }
        
        if (data.memory.heapUsagePercent > 0.8) {
            console.warn('⚠️ 内存使用过高！');
        }
    });
}

// 每30秒检查一次
setInterval(checkPerformance, 30000);
```

### Python 监控脚本

```python
import requests
import time
import json

def monitor_service():
    try:
        response = requests.get('http://localhost:3000/api/monitor')
        data = response.json()
        
        print(f"状态: {data['status']}")
        print(f"成功率: {data['requests']['successRate']}%")
        print(f"活跃请求: {data['requests']['active']}")
        print(f"内存使用: {data['memory']['heapUsagePercent']:.1%}")
        
        # 检查异常
        if float(data['requests']['successRate']) < 90:
            print("⚠️ 警告: 成功率过低")
        
        if data['memory']['heapUsagePercent'] > 0.8:
            print("⚠️ 警告: 内存使用过高")
            
    except Exception as e:
        print(f"❌ 监控失败: {e}")

# 持续监控
while True:
    monitor_service()
    time.sleep(30)
```

## 性能分析

### 响应时间分析

```javascript
// 分析响应时间趋势
function analyzeResponseTimes(history) {
    const times = history.map(req => req.responseTime);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    
    console.log(`平均响应时间: ${avg}ms`);
    console.log(`最大响应时间: ${max}ms`);
    console.log(`最小响应时间: ${min}ms`);
    
    return { avg, max, min };
}
```

### 服务类型分析

```javascript
// 分析不同服务的性能
function analyzeServiceTypes(history) {
    const cloudflare = history.filter(req => req.mode !== 'hcaptcha');
    const hcaptcha = history.filter(req => req.mode === 'hcaptcha');
    
    const cfSuccess = cloudflare.filter(req => req.success).length;
    const hcSuccess = hcaptcha.filter(req => req.success).length;
    
    console.log(`Cloudflare 成功率: ${(cfSuccess / cloudflare.length * 100).toFixed(2)}%`);
    console.log(`hCaptcha 成功率: ${(hcSuccess / hcaptcha.length * 100).toFixed(2)}%`);
}
```

## 告警设置

### 配置告警阈值

在 `.env` 文件中设置：

```bash
# 告警阈值
ALERT_SUCCESS_RATE_THRESHOLD=90    # 成功率低于90%告警
ALERT_MEMORY_THRESHOLD=0.8         # 内存使用超过80%告警
ALERT_RESPONSE_TIME_THRESHOLD=60000 # 响应时间超过60秒告警
```

### 邮件告警

```javascript
const nodemailer = require('nodemailer');

async function sendAlert(subject, message) {
    const transporter = nodemailer.createTransporter({
        // 邮件配置
    });
    
    await transporter.sendMail({
        from: 'monitor@yoursite.com',
        to: 'admin@yoursite.com',
        subject: `CF Scraper Alert: ${subject}`,
        text: message
    });
}

// 监控并发送告警
function checkAndAlert(data) {
    if (data.requests.successRate < 90) {
        sendAlert('Low Success Rate', `成功率降至 ${data.requests.successRate}%`);
    }
    
    if (data.memory.heapUsagePercent > 0.8) {
        sendAlert('High Memory Usage', `内存使用率 ${(data.memory.heapUsagePercent * 100).toFixed(1)}%`);
    }
}
```

## 日志分析

### 访问服务日志

```bash
# 实时查看日志
tail -f service.log

# 搜索特定内容
grep "hCaptcha" service.log
grep "ERROR" service.log

# 统计成功/失败请求
grep "✅" service.log | wc -l
grep "❌" service.log | wc -l
```

### 日志格式说明

```
🎯 [1749777375410_ltz1hbu9d] hCaptcha请求开始: 2025-06-13T01:16:15.410Z
📍 [1749777375410_ltz1hbu9d] 请求参数: {...}
⏰ [1749777375410_ltz1hbu9d] 开始调用Python解决器: 2025-06-13T01:16:15.413Z
✅ [1749777375410_ltz1hbu9d] Python解决器返回结果: 2025-06-13T01:17:03.496Z
🧹 [1749777375410_ltz1hbu9d] 清理资源，总耗时: 48086ms
```

- `🎯` - 请求开始
- `📍` - 请求参数
- `⏰` - 处理阶段
- `✅` - 成功完成
- `❌` - 处理失败
- `🧹` - 资源清理

## 故障排除

### 监控面板无法访问

1. **检查服务状态**
   ```bash
   curl http://localhost:3000/health
   ```

2. **检查端口占用**
   ```bash
   lsof -i :3000  # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   ```

3. **检查防火墙设置**
   ```bash
   sudo ufw status  # Ubuntu
   ```

### 监控数据异常

1. **重置监控数据**
   ```bash
   curl -X POST http://localhost:3000/api/monitor/reset
   ```

2. **重启服务**
   ```bash
   npm start
   ```

3. **检查内存使用**
   ```bash
   ps aux | grep node
   ```

### 性能问题诊断

1. **检查并发数**
   - 降低 `BROWSER_LIMIT`
   - 调整 `MAX_CONCURRENT_REQUESTS`

2. **检查内存设置**
   - 增加 `MAX_MEMORY_USAGE`
   - 缩短 `MEMORY_CLEANUP_INTERVAL`

3. **检查网络延迟**
   - 使用更快的网络连接
   - 配置代理服务器

## 最佳实践

1. **定期检查监控面板** - 每日查看关键指标
2. **设置自动告警** - 及时发现异常
3. **分析趋势数据** - 优化性能配置
4. **备份监控数据** - 保留历史记录
5. **监控资源使用** - 避免资源耗尽

## 监控集成

### Grafana 集成

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'cf-scraper'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/monitor'
    scrape_interval: 30s
```

### 第三方监控

```javascript
// 集成到现有监控系统
function integrateMonitoring() {
    setInterval(async () => {
        const data = await getMonitorData();
        
        // 发送到监控系统
        sendMetric('cf_scraper.success_rate', data.requests.successRate);
        sendMetric('cf_scraper.active_requests', data.requests.active);
        sendMetric('cf_scraper.memory_usage', data.memory.heapUsagePercent);
    }, 60000);
}
```