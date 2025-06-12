const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const authToken = process.env.authToken || null
const cors = require('cors')
const reqValidate = require('./module/reqValidate')
const memoryManager = require('./utils/memoryManager')

global.browserLength = 0
global.browserLimit = 100
global.timeOut = Number(process.env.timeOut || 60000)
global.memoryCleanupInterval = Number(process.env.memoryCleanupInterval) || 300000 // 5分钟
global.maxMemoryUsage = Number(process.env.maxMemoryUsage) || 512 // MB

// 监控数据
global.monitoringData = {
    startTime: new Date(),
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    activeRequests: new Map(), // 存储当前活跃请求
    recentTokens: [], // 最近生成的token
    requestHistory: [] // 请求历史
}

app.use(bodyParser.json({}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

// 静态文件服务（用于监控页面）
app.use('/monitor', require('express').static(__dirname + '/../monitor'))
if (process.env.NODE_ENV !== 'development') {
    let server = app.listen(port, '0.0.0.0', () => { 
        console.log(`Server running on port ${port}`)
        console.log(`Local access: http://localhost:${port}`)
        console.log(`Network access: http://0.0.0.0:${port}`)
    })
    try {
        server.timeout = global.timeOut
    } catch (e) { }
}
if (process.env.SKIP_LAUNCH != 'true') require('./module/createBrowser')

// 启动内存监控（仅在非测试环境）
if (process.env.NODE_ENV !== 'test') {
    memoryManager.startMonitoring()
}

const getSource = require('./endpoints/getSource')
const solveTurnstileMin = require('./endpoints/solveTurnstile.min')
const solveTurnstileMax = require('./endpoints/solveTurnstile.max')
const wafSession = require('./endpoints/wafSession')


// 新版API格式支持
app.post('/cftoken', async (req, res) => {
    const data = req.body

    // 新版API参数验证
    if (!data.type || data.type !== 'cftoken') {
        return res.status(400).json({ code: 400, message: 'type must be "cftoken"' })
    }

    if (!data.websiteUrl) {
        return res.status(400).json({ code: 400, message: 'websiteUrl is required' })
    }

    if (!data.websiteKey) {
        return res.status(400).json({ code: 400, message: 'websiteKey is required' })
    }

    // 转换为内部格式
    const internalData = {
        url: data.websiteUrl,
        siteKey: data.websiteKey,
        mode: 'turnstile-min',
        authToken: data.authToken
    }

    // 处理请求
    return handleClearanceRequest(req, res, internalData)
})

// 原始API格式支持
app.post('/cf-clearance-scraper', async (req, res) => {
    const data = req.body
    return handleClearanceRequest(req, res, data)
})

// 统一的请求处理函数
async function handleClearanceRequest(req, res, data) {
    const check = reqValidate(data)

    if (check !== true) return res.status(400).json({ code: 400, message: 'Bad Request', schema: check })

    if (authToken && data.authToken !== authToken) return res.status(401).json({ code: 401, message: 'Unauthorized' })

    if (global.browserLength >= global.browserLimit) return res.status(429).json({ code: 429, message: 'Too Many Requests' })

    if (process.env.SKIP_LAUNCH != 'true' && !global.browser) return res.status(500).json({ code: 500, message: 'The scanner is not ready yet. Please try again a little later.' })

    var result = { code: 500 }

    global.browserLength++
    global.monitoringData.totalRequests++
    
    // 生成请求ID
    const requestId = Date.now() + '_' + Math.random().toString(36).substring(2, 11)
    
    // 记录活跃请求
    global.monitoringData.activeRequests.set(requestId, {
        id: requestId,
        url: data.url,
        mode: data.mode,
        startTime: new Date(),
        clientIP: req.ip || req.socket.remoteAddress
    })
    
    // 设置请求超时清理
    const requestTimeout = setTimeout(() => {
        global.browserLength--
        global.monitoringData.activeRequests.delete(requestId)
        console.log('Request timeout, cleaning up')
    }, global.timeOut + 5000)

    switch (data.mode) {
        case "source":
            result = await getSource(data).then(res => { return { source: res, code: 200 } }).catch(err => { return { code: 500, message: err.message } })
            break;
        case "turnstile-min":
            result = await solveTurnstileMin(data).then(res => { return { token: res, code: 200 } }).catch(err => { return { code: 500, message: err.message } })
            break;
        case "turnstile-max":
            result = await solveTurnstileMax(data).then(res => { return { token: res, code: 200 } }).catch(err => { return { code: 500, message: err.message } })
            break;
        case "waf-session":
            result = await wafSession(data).then(res => { return { ...res, code: 200 } }).catch(err => { return { code: 500, message: err.message } })
            break;
    }

    global.browserLength--
    clearTimeout(requestTimeout)
    
    // 更新监控数据
    global.monitoringData.activeRequests.delete(requestId)
    
    if (result.code === 200) {
        global.monitoringData.successfulRequests++
        
        // 记录token（如果有）
        if (result.token) {
            global.monitoringData.recentTokens.unshift({
                token: result.token,
                url: data.url,
                mode: data.mode,
                timestamp: new Date(),
                requestId: requestId
            })
            
            // 只保留最近50个token
            if (global.monitoringData.recentTokens.length > 50) {
                global.monitoringData.recentTokens = global.monitoringData.recentTokens.slice(0, 50)
            }
        }
    } else {
        global.monitoringData.failedRequests++
    }
    
    // 记录请求历史
    const requestStartTime = global.monitoringData.activeRequests.get(requestId)?.startTime
    global.monitoringData.requestHistory.unshift({
        requestId: requestId,
        url: data.url,
        mode: data.mode,
        success: result.code === 200,
        timestamp: new Date(),
        responseTime: requestStartTime ? Date.now() - requestStartTime.getTime() : 0
    })
    
    // 只保留最近100条历史
    if (global.monitoringData.requestHistory.length > 100) {
        global.monitoringData.requestHistory = global.monitoringData.requestHistory.slice(0, 100)
    }
    
    // 检查内存使用情况
    const memStats = memoryManager.checkMemoryUsage()
    if (memStats.heapUsagePercent > 0.8) {
        console.log('⚠️  High memory usage after request completion')
    }

    res.status(result.code ?? 500).send(result)
}

// 监控API端点
app.get('/api/monitor', (req, res) => {
    try {
        const memStats = memoryManager.getMemoryStats()
        const uptime = Date.now() - global.monitoringData.startTime.getTime()
        
        const monitorData = {
            // 基本状态
            status: 'running',
            uptime: uptime,
            startTime: global.monitoringData.startTime,
            
            // 实例信息
            instances: {
                total: global.browserLimit,
                active: global.browserLength,
                available: global.browserLimit - global.browserLength
            },
            
            // 请求统计
            requests: {
                total: global.monitoringData.totalRequests,
                successful: global.monitoringData.successfulRequests,
                failed: global.monitoringData.failedRequests,
                active: global.monitoringData.activeRequests.size,
                successRate: global.monitoringData.totalRequests > 0 ? 
                    (global.monitoringData.successfulRequests / global.monitoringData.totalRequests * 100).toFixed(2) : 0
            },
            
            // 活跃请求详情
            activeRequests: Array.from(global.monitoringData.activeRequests.values()).map(req => ({
                id: req.id,
                url: req.url,
                mode: req.mode,
                startTime: req.startTime,
                duration: Date.now() - req.startTime.getTime(),
                clientIP: req.clientIP
            })),
            
            // 最近的token
            recentTokens: global.monitoringData.recentTokens.slice(0, 10),
            
            // 请求历史
            requestHistory: global.monitoringData.requestHistory.slice(0, 20),
            
            // 内存信息
            memory: memStats,
            
            // 浏览器上下文信息
            browserContexts: global.browserContexts ? global.browserContexts.size : 0,
            
            // 时间戳
            timestamp: new Date()
        }
        
        res.json(monitorData)
    } catch (error) {
        console.error('Monitor API error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// 重置监控数据
app.post('/api/monitor/reset', (req, res) => {
    global.monitoringData = {
        startTime: new Date(),
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        activeRequests: new Map(),
        recentTokens: [],
        requestHistory: []
    }
    res.json({ message: 'Monitor data reset successfully' })
})

// 健康检查端点
app.get('/health', (_, res) => {
    res.status(200).send('healthy\n')
})

app.use((_, res) => { res.status(404).json({ code: 404, message: 'Not Found' }) })

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use((err, _, res, __) => {
  console.error('Express error handler:', err);
  res.status(500).json({
    code: 500,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 清理函数用于测试
function cleanup() {
    memoryManager.stopMonitoring()
    if (global.cleanupTimer) {
        clearInterval(global.cleanupTimer)
    }
}

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    module.exports = { app, cleanup }
} else {
    module.exports = app
}
