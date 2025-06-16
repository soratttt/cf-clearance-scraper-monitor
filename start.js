#!/usr/bin/env node
/**
 * CF Clearance Scraper 启动脚本
 * 提供便捷的启动和配置选项
 */

const { spawn } = require('child_process');
const path = require('path');

// 加载统一配置文件
require('dotenv').config({ path: path.join(__dirname, '.env') })

// 默认配置 (合并环境变量配置)
const defaultConfig = {
    PORT: Number(process.env.PORT) || 3000,
    browserLimit: Number(process.env.BROWSER_LIMIT) || 25,
    timeOut: Number(process.env.TIMEOUT) || 60000,
    memoryCleanupInterval: Number(process.env.MEMORY_CLEANUP_INTERVAL) || 300000,
    maxMemoryUsage: Number(process.env.MAX_MEMORY_USAGE) || 512,
    maxConcurrentRequests: Number(process.env.MAX_CONCURRENT_REQUESTS) || 60,
    contextPoolSize: Number(process.env.CONTEXT_POOL_SIZE) || 20
};

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...defaultConfig };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            if (value) {
                config[key] = isNaN(value) ? value : Number(value);
            }
        }
    }
    
    return config;
}

// 显示帮助信息
function showHelp() {
    console.log(`
CF Clearance Scraper 启动脚本

用法:
  node start.js [选项]

选项:
  --PORT=3000                    设置服务端口 (默认: 3000)
  --browserLimit=25              最大并发浏览器数 (默认: 25)
  --timeOut=60000               请求超时时间(毫秒) (默认: 60000)
  --memoryCleanupInterval=300000 内存清理间隔(毫秒) (默认: 300000)
  --maxMemoryUsage=512          最大内存使用(MB) (默认: 512)
  --maxConcurrentRequests=60    最大并发请求数 (默认: 60)
  --contextPoolSize=20          浏览器上下文池大小 (默认: 20)
  --authToken=your_token        API认证令牌 (可选)
  --help                        显示此帮助信息

示例:
  node start.js                                    # 使用默认配置启动
  node start.js --PORT=8080 --browserLimit=10     # 自定义端口和并发数
  node start.js --authToken=your_secret_token     # 启用API认证

快速预设:
  npm run start:dev     # 开发模式 (端口3000, 并发10)
  npm run start:prod    # 生产模式 (端口3000, 并发25)
  npm run start:light   # 轻量模式 (端口3000, 并发5)
`);
}

// 启动服务
function startService(config) {
    // 检查帮助选项
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp();
        return;
    }
    
    console.log('🚀 CF Clearance Scraper 启动中...\n');
    console.log('配置信息:');
    Object.entries(config).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
    console.log('');
    
    // 设置环境变量
    const env = { ...process.env, ...config };
    
    // 启动主服务 - 添加内存限制参数
    const nodeArgs = [
        `--max-old-space-size=${config.maxMemoryUsage}`,
        '--expose-gc',
        'src/index.js'
    ];
    
    console.log('Node启动参数:', nodeArgs);
    console.log('');
    
    const child = spawn('node', nodeArgs, {
        env,
        stdio: 'inherit',
        cwd: __dirname
    });
    
    // 处理进程退出
    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ 服务异常退出，退出码: ${code}`);
        } else {
            console.log('✅ 服务正常退出');
        }
        process.exit(code);
    });
    
    // 处理错误
    child.on('error', (err) => {
        console.error('❌ 启动失败:', err.message);
        process.exit(1);
    });
    
    // 优雅退出处理
    process.on('SIGINT', () => {
        console.log('\n📤 正在停止服务...');
        child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n📤 正在停止服务...');
        child.kill('SIGTERM');
    });
}

// 主函数
if (require.main === module) {
    const config = parseArgs();
    startService(config);
}

module.exports = { startService, parseArgs };