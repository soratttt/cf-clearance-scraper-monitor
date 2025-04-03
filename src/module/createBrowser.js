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
                timeout: 60000,
                args: [
                    `--window-size=${width},${height}`
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

process.on('SIGINT', async () => {
    console.log('Received SIGINT, cleaning up...')
    global.finished = true
    
    if (global.browser) {
        try {
            // 关闭所有上下文
            if (global.browserContexts) {
                for (const context of global.browserContexts) {
                    await context.close().catch(() => {})
                }
            }
            await global.browser.close().catch(() => {})
        } catch (e) {
            console.error("Error during cleanup:", e.message)
        }
    }
    
    process.exit(0)
})

module.exports = createBrowser

// 自动启动浏览器
if (!process.env.SKIP_LAUNCH) {
    createBrowser()
}