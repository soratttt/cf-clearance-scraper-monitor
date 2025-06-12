const { connect } = require("puppeteer-real-browser")

async function createBrowser(options = {}) {
    try {
        if (global.finished === true) return

        if (global.browser) {
            try {
                await global.browser.close().catch(() => {})
            } catch (e) {
                console.log("Error closing previous browser:", e.message)
            }
        }

        global.browser = null
        global.browserContexts = new Set()
        global.cleanupTimer = null

        console.log('Launching the browser...')

        const defaultWidth = 520
        const defaultHeight = 240

        const width = options.width || defaultWidth
        const height = options.height || defaultHeight

        const { browser } = await connect({
            headless: false,
            turnstile: true,
            connectOption: { 
                defaultViewport: {
                    width: width,
                    height: height
                },
                timeout: 120000,
                protocolTimeout: 300000,
                args: [
                    `--window-size=${width},${height}`,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-extensions',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--safebrowsing-disable-auto-update',
                    '--disable-client-side-phishing-detection',
                    '--disable-component-update',
                    '--disable-domain-reliability',
                    '--disable-features=AudioServiceOutOfProcess',
                    '--disable-hang-monitor',
                    '--disable-prompt-on-repost',
                    '--disable-web-security',
                    '--max_old_space_size=512',
                    '--memory-pressure-off'
                ]
            },
            disableXvfb: false,
        }).catch(e => {
            console.error("Browser connection error:", e.message)
            return { browser: null }
        })

        if (!browser) {
            console.error("Failed to connect to browser")
            // 延迟重试
            setTimeout(createBrowser, 5000)
            return
        }

        console.log('Browser launched successfully')
        
        // 定期清理不活跃的上下文
        if (global.cleanupTimer) {
            clearInterval(global.cleanupTimer)
        }
        
        global.cleanupTimer = setInterval(async () => {
            if (global.browserContexts.size > 0) {
                console.log(`Periodic cleanup: ${global.browserContexts.size} contexts active`)
                
                // 如果上下文数量过多，强制清理一些
                if (global.browserContexts.size > global.browserLimit * 0.8) {
                    const contextsArray = Array.from(global.browserContexts)
                    const toCleanup = contextsArray.slice(0, Math.floor(contextsArray.length * 0.3))
                    
                    for (const context of toCleanup) {
                        try {
                            await context.close().catch(() => {})
                            global.browserContexts.delete(context)
                        } catch (e) {}
                    }
                    console.log(`Cleaned up ${toCleanup.length} inactive contexts`)
                }
            }
        }, 60000) // 每分钟检查一次

        const originalCreateContext = browser.createBrowserContext.bind(browser)
        browser.createBrowserContext = async function(...args) {
            const context = await originalCreateContext(...args)
            if (context) {
                global.browserContexts.add(context)
                
                const originalClose = context.close.bind(context)
                context.close = async function() {
                    try {
                        await originalClose()
                    } catch (e) {
                        console.error("Error closing context:", e.message)
                    } finally {
                        global.browserContexts.delete(context)
                    }
                }
            }
            return context
        }

        global.browser = browser

        browser.on('disconnected', async () => {
            if (global.finished === true) return
            console.log('Browser disconnected, attempting to reconnect...')
            
            try {
                for (const context of global.browserContexts) {
                    try {
                        await context.close().catch(() => {})
                    } catch (e) {
                        console.error("Error closing context during reconnect:", e.message)
                    }
                }
                global.browserContexts.clear()
            } catch (e) {
                console.error("Error cleaning up contexts:", e.message)
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000))
            await createBrowser()
        })

    } catch (e) {
        console.error("Browser creation error:", e.message)
        if (global.finished === true) return
        await new Promise(resolve => setTimeout(resolve, 5000))
        await createBrowser()
    }
}

// 清理函数
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...')
    global.finished = true
    
    if (global.cleanupTimer) {
        clearInterval(global.cleanupTimer)
    }
    
    if (global.browser) {
        try {
            if (global.browserContexts) {
                console.log(`Closing ${global.browserContexts.size} browser contexts...`)
                const closePromises = Array.from(global.browserContexts).map(context => 
                    context.close().catch(() => {})
                )
                await Promise.allSettled(closePromises)
                global.browserContexts.clear()
            }
            await global.browser.close().catch(() => {})
            console.log('Browser closed successfully')
        } catch (e) {
            console.error("Error during cleanup:", e.message)
        }
    }
}

process.on('SIGINT', async () => {
    await gracefulShutdown()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await gracefulShutdown() 
    process.exit(0)
})

module.exports = createBrowser

// 自动启动浏览器
if (!process.env.SKIP_LAUNCH) {
    createBrowser()
}