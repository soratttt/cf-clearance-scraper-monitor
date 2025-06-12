const os = require('os');

class MemoryManager {
    constructor() {
        this.maxHeapUsage = Number(process.env.maxMemoryUsage) || 512; // MB
        this.gcThreshold = 0.8; // 80% of max heap
        this.forceGcThreshold = 0.9; // 90% of max heap
        this.monitoringInterval = 30000; // 30 seconds
        this.monitoring = false;
    }

    startMonitoring() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.monitorInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, this.monitoringInterval);

        console.log('Memory monitoring started');
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitoring = false;
            console.log('Memory monitoring stopped');
        }
    }

    checkMemoryUsage() {
        const memUsage = process.memoryUsage();
        const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        const rssMB = Math.round(memUsage.rss / 1024 / 1024);
        const systemFreeMB = Math.round(os.freemem() / 1024 / 1024);
        const systemTotalMB = Math.round(os.totalmem() / 1024 / 1024);

        const heapUsagePercent = heapUsedMB / this.maxHeapUsage;

        // 记录内存使用情况
        if (heapUsagePercent > 0.7) {
            console.log(`⚠️  High memory usage: ${heapUsedMB}MB/${this.maxHeapUsage}MB (${Math.round(heapUsagePercent * 100)}%)`);
            console.log(`   Heap total: ${heapTotalMB}MB, RSS: ${rssMB}MB`);
            console.log(`   System: ${systemTotalMB - systemFreeMB}MB/${systemTotalMB}MB used`);
        }

        // 执行垃圾回收
        if (heapUsagePercent > this.forceGcThreshold) {
            this.forceGarbageCollection();
            this.cleanupBrowserContexts();
        } else if (heapUsagePercent > this.gcThreshold) {
            this.softGarbageCollection();
        }

        return {
            heapUsedMB,
            heapTotalMB,
            rssMB,
            systemFreeMB,
            heapUsagePercent
        };
    }

    forceGarbageCollection() {
        console.log('🔄 Forcing garbage collection due to high memory usage');
        if (global.gc) {
            try {
                global.gc();
                console.log('✅ Forced GC completed');
            } catch (e) {
                console.error('❌ Failed to force GC:', e.message);
            }
        } else {
            console.warn('⚠️  global.gc() not available. Start with --expose-gc flag');
        }
    }

    softGarbageCollection() {
        if (global.gc && Math.random() < 0.3) { // 30% chance
            setImmediate(() => {
                try {
                    global.gc();
                } catch (e) {}
            });
        }
    }

    cleanupBrowserContexts() {
        if (global.browserContexts && global.browserContexts.size > 0) {
            console.log(`🧹 Cleaning up ${global.browserContexts.size} browser contexts`);
            
            const contextsToClean = Array.from(global.browserContexts);
            let cleaned = 0;
            
            contextsToClean.forEach(async (context) => {
                try {
                    await context.close().catch(() => {});
                    global.browserContexts.delete(context);
                    cleaned++;
                } catch (e) {
                    console.error('Error closing context:', e.message);
                }
            });
            
            if (cleaned > 0) {
                console.log(`✅ Cleaned up ${cleaned} browser contexts`);
            }
        }
    }

    getMemoryStats() {
        const memUsage = process.memoryUsage();
        const systemMem = {
            free: os.freemem(),
            total: os.totalmem()
        };

        return {
            process: {
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024)
            },
            system: {
                free: Math.round(systemMem.free / 1024 / 1024),
                total: Math.round(systemMem.total / 1024 / 1024),
                used: Math.round((systemMem.total - systemMem.free) / 1024 / 1024)
            },
            browserContexts: global.browserContexts ? global.browserContexts.size : 0,
            activeBrowsers: global.browserLength || 0
        };
    }
}

module.exports = new MemoryManager();