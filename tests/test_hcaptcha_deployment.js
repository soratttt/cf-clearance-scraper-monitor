#!/usr/bin/env node
/**
 * hCaptcha 部署测试脚本
 * 用于验证 hCaptcha 解决器是否正确部署和配置
 * 
 * 使用方法:
 * 1. 直接运行: node test_hcaptcha_deployment.js
 * 2. 指定端口: node test_hcaptcha_deployment.js --port 3001
 * 3. 指定主机: node test_hcaptcha_deployment.js --host 192.168.1.100 --port 3000
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// 解析命令行参数
const args = process.argv.slice(2);
let host = 'localhost';
let port = 3000;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i + 1]) {
        host = args[i + 1];
        i++;
    } else if (args[i] === '--port' && args[i + 1]) {
        port = parseInt(args[i + 1]);
        i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log(`
[TEST] hCaptcha 部署测试脚本

使用方法:
  node test_hcaptcha_deployment.js [选项]

选项:
  --host <主机>     指定测试主机 (默认: localhost)
  --port <端口>     指定测试端口 (默认: 3000)
  --help, -h       显示帮助信息

示例:
  node test_hcaptcha_deployment.js
  node test_hcaptcha_deployment.js --port 3001
  node test_hcaptcha_deployment.js --host 192.168.1.100 --port 3000
        `);
        process.exit(0);
    }
}

const baseUrl = `http://${host}:${port}`;

// 颜色输出函数
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试结果收集
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function recordTest(name, passed, message = '', details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        colorLog('green', `[OK] ${name}: ${message}`);
    } else {
        testResults.failed++;
        colorLog('red', `[FAIL] ${name}: ${message}`);
        if (details) {
            colorLog('yellow', `   [INFO] ${details}`);
        }
    }
    testResults.tests.push({ name, passed, message, details });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 检查环境配置
function checkEnvironment() {
    colorLog('blue', '\n[DEBUG] [1/6] 检查环境配置...');
    
    // 检查 .env 文件
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        recordTest('环境配置文件', false, '未找到 .env 文件', '请确保根目录存在 .env 配置文件');
        return false;
    }
    recordTest('环境配置文件', true, '.env 文件存在');
    
    // 检查 .env 内容
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const hasGeminiKey = /GEMINI_API_KEY\s*=\s*[^your_actual_gemini_api_key_here]/m.test(envContent);
        
        if (!hasGeminiKey) {
            recordTest('Gemini API 密钥配置', false, 'API 密钥未配置或仍为示例值', 
                '请在 .env 文件中设置正确的 GEMINI_API_KEY');
            return false;
        }
        recordTest('Gemini API 密钥配置', true, 'API 密钥已配置');
        
        // 检查其他重要配置
        const hasPort = /PORT\s*=\s*\d+/m.test(envContent);
        recordTest('端口配置', hasPort, hasPort ? '端口配置正常' : '使用默认端口配置');
        
    } catch (error) {
        recordTest('环境配置解析', false, `无法读取 .env 文件: ${error.message}`);
        return false;
    }
    
    return true;
}

// 2. 检查 Node.js 依赖
function checkNodeDependencies() {
    colorLog('blue', '\n[PACKAGE] [2/6] 检查 Node.js 依赖...');
    
    // 检查 package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    if (!fs.existsSync(packagePath)) {
        recordTest('package.json', false, '未找到 package.json 文件');
        return false;
    }
    recordTest('package.json', true, 'package.json 存在');
    
    // 检查 node_modules
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        recordTest('Node.js 依赖', false, 'node_modules 目录不存在', '请运行 npm install 安装依赖');
        return false;
    }
    recordTest('Node.js 依赖', true, 'node_modules 目录存在');
    
    // 检查关键依赖
    const criticalDeps = ['express', 'dotenv', 'puppeteer-real-browser'];
    let allDepsExist = true;
    
    for (const dep of criticalDeps) {
        const depPath = path.join(nodeModulesPath, dep);
        const exists = fs.existsSync(depPath);
        recordTest(`依赖包 ${dep}`, exists, exists ? '已安装' : '未安装');
        if (!exists) allDepsExist = false;
    }
    
    return allDepsExist;
}

// 3. 检查 Python 环境
function checkPythonEnvironment() {
    return new Promise((resolve) => {
        colorLog('blue', '\n[PYTHON] [3/6] 检查 Python 环境...');
        
        const hcaptchaDir = path.join(__dirname, '..', 'captcha-solvers', 'hcaptcha');
        const venvPath = path.join(hcaptchaDir, 'venv');
        const pythonPath = path.join(venvPath, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
        
        // 检查虚拟环境
        if (!fs.existsSync(venvPath)) {
            recordTest('Python 虚拟环境', false, '虚拟环境不存在', '请运行一键部署脚本创建虚拟环境');
            resolve(false);
            return;
        }
        recordTest('Python 虚拟环境', true, '虚拟环境存在');
        
        // 检查 Python 可执行文件
        const pythonExe = fs.existsSync(pythonPath) ? pythonPath : 'python3';
        
        // 测试 Python 和依赖
        const testScript = `
import sys
import json
try:
    from hcaptcha_challenger import AgentV, AgentConfig
    hcaptcha_ok = True
except ImportError as e:
    hcaptcha_ok = False
    hcaptcha_error = str(e)

try:
    from playwright.async_api import async_playwright
    playwright_ok = True
except ImportError as e:
    playwright_ok = False
    playwright_error = str(e)

try:
    import os
    from pathlib import Path
    from dotenv import load_dotenv
    # 从 hcaptcha 目录向上找到项目根目录
    current_dir = Path.cwd()
    if current_dir.name == 'hcaptcha':
        root_dir = current_dir.parent.parent
    else:
        # 如果当前目录不是 hcaptcha，尝试从测试脚本位置计算
        script_dir = Path(__file__).parent if hasattr(Path(__file__), 'parent') else Path.cwd()
        if script_dir.name == 'tests':
            root_dir = script_dir.parent
        else:
            root_dir = script_dir.parent.parent.parent
    
    env_path = root_dir / '.env'
    
    load_dotenv(env_path, override=True)
    api_key = os.getenv('GEMINI_API_KEY')
    
    api_key_ok = api_key and api_key != 'your_actual_gemini_api_key_here' and len(api_key) > 20
    api_key_configured = bool(api_key_ok)
except Exception as e:
    api_key_configured = False
    api_key_error = str(e)

result = {
    "hcaptcha_challenger": hcaptcha_ok,
    "playwright": playwright_ok,
    "api_key_configured": api_key_configured,
    "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
}
print(json.dumps(result))
        `;
        
        const pythonProcess = spawn(pythonExe, ['-c', testScript], {
            cwd: hcaptchaDir,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                recordTest('Python 环境测试', false, `Python 进程退出码: ${code}`, stderr.trim());
                resolve(false);
                return;
            }
            
            try {
                const result = JSON.parse(stdout.trim());
                recordTest('Python 版本', true, `Python ${result.python_version}`);
                recordTest('hcaptcha-challenger', result.hcaptcha_challenger, 
                    result.hcaptcha_challenger ? '模块可用' : '模块未安装', 
                    !result.hcaptcha_challenger ? '请运行: pip install -e captcha-solvers/hcaptcha/hcaptcha-challenger' : '');
                recordTest('Playwright', result.playwright, 
                    result.playwright ? '模块可用' : '模块未安装',
                    !result.playwright ? '请运行: pip install playwright && playwright install chromium' : '');
                recordTest('API 密钥在 Python 中可读', result.api_key_configured,
                    result.api_key_configured ? 'API 密钥配置正确' : 'API 密钥未配置或无法读取');
                
                resolve(result.hcaptcha_challenger && result.playwright && result.api_key_configured);
            } catch (error) {
                recordTest('Python 环境测试', false, `解析测试结果失败: ${error.message}`, stdout);
                resolve(false);
            }
        });
        
        // 超时处理
        setTimeout(() => {
            pythonProcess.kill();
            recordTest('Python 环境测试', false, 'Python 测试超时');
            resolve(false);
        }, 30000);
    });
}

// 4. 检查服务状态
function checkServiceStatus() {
    return new Promise((resolve) => {
        colorLog('blue', '\n[NETWORK] [4/6] 检查服务状态...');
        
        const req = http.request({
            hostname: host,
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    recordTest('服务可访问性', true, `服务在 ${baseUrl} 正常运行`);
                    recordTest('健康检查', true, '健康检查端点正常');
                    resolve(true);
                } else {
                    recordTest('服务可访问性', false, `服务返回状态码: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            recordTest('服务可访问性', false, `无法连接到服务: ${error.message}`, 
                `请确保服务已启动并监听 ${baseUrl}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            recordTest('服务可访问性', false, '连接服务超时');
            resolve(false);
        });
        
        req.end();
    });
}

// 5. 测试基础 API
function testBasicAPI() {
    return new Promise((resolve) => {
        colorLog('blue', '\n[CONNECT] [5/6] 测试基础 API...');
        
        // 测试根路径
        const testData = JSON.stringify({
            type: 'test',
            websiteUrl: 'https://example.com',
            websiteKey: 'test-key'
        });
        
        const req = http.request({
            hostname: host,
            port: port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 400 && response.message) {
                        recordTest('API 端点响应', true, 'API 正确拒绝了无效请求');
                        recordTest('JSON 响应格式', true, '返回格式正确');
                        resolve(true);
                    } else {
                        recordTest('API 端点响应', false, `意外的响应: ${res.statusCode}`);
                        resolve(false);
                    }
                } catch (error) {
                    recordTest('JSON 响应格式', false, `响应不是有效 JSON: ${error.message}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            recordTest('API 端点响应', false, `API 请求失败: ${error.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            recordTest('API 端点响应', false, 'API 请求超时');
            resolve(false);
        });
        
        req.write(testData);
        req.end();
    });
}

// 6. 测试 hCaptcha 解决器
function testHcaptchaSolver() {
    return new Promise((resolve) => {
        colorLog('blue', '\n[TARGET] [6/6] 测试 hCaptcha 解决器...');
        colorLog('yellow', '[TIMER]  这可能需要 30-120 秒...');
        
        const testData = JSON.stringify({
            type: 'hcaptcha',
            websiteUrl: 'https://accounts.hcaptcha.com/demo',
            websiteKey: '338af34c-7bcb-4c7c-900b-acbec73d7d43'
        });
        
        const startTime = Date.now();
        
        const req = http.request({
            hostname: host,
            port: port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            },
            timeout: 180000  // 3分钟超时
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const duration = Math.round((endTime - startTime) / 1000);
                
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200 && response.code === 200 && response.token) {
                        recordTest('hCaptcha 解决器', true, `成功解决验证码 (${duration}秒)`);
                        recordTest('Token 生成', true, `Token: ${response.token.substring(0, 50)}...`);
                        colorLog('green', `[SUCCESS] hCaptcha 部署测试完全成功！`);
                        resolve(true);
                    } else if (res.statusCode === 500) {
                        recordTest('hCaptcha 解决器', false, 
                            `解决器失败: ${response.message || '未知错误'}`,
                            '检查 Gemini API 密钥配置和 Python 环境');
                        resolve(false);
                    } else {
                        recordTest('hCaptcha 解决器', false, 
                            `意外响应 (${res.statusCode}): ${response.message || data.substring(0, 100)}`);
                        resolve(false);
                    }
                } catch (error) {
                    recordTest('hCaptcha 解决器', false, 
                        `响应解析失败: ${error.message}`, 
                        `原始响应: ${data.substring(0, 200)}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            recordTest('hCaptcha 解决器', false, `请求失败: ${error.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            recordTest('hCaptcha 解决器', false, 'hCaptcha 解决超时 (3分钟)');
            resolve(false);
        });
        
        req.write(testData);
        req.end();
    });
}

// 显示测试总结
function showSummary() {
    colorLog('blue', '\n[STATS] 测试总结');
    colorLog('blue', '='.repeat(50));
    
    if (testResults.failed === 0) {
        colorLog('green', `[SUCCESS] 所有测试通过! (${testResults.passed}/${testResults.total})`);
        colorLog('green', '[OK] hCaptcha 解决器部署成功，可以正常使用！');
    } else {
        colorLog('red', `[FAIL] 测试失败: ${testResults.failed}/${testResults.total}`);
        colorLog('yellow', `[OK] 通过: ${testResults.passed}/${testResults.total}`);
        colorLog('red', '\n[CONFIG] 请根据上述错误信息修复问题后重新测试');
    }
    
    colorLog('blue', '\n[INFO] 提示:');
    colorLog('white', '  • 如果 API 密钥相关测试失败，请检查 .env 文件中的 GEMINI_API_KEY 配置');
    colorLog('white', '  • 如果 Python 环境测试失败，请运行一键部署脚本重新安装');
    colorLog('white', '  • 如果服务无法访问，请确保服务已启动并检查防火墙设置');
    colorLog('white', '  • 完整部署指南请参考项目文档');
    
    process.exit(testResults.failed === 0 ? 0 : 1);
}

// 主测试流程
async function runTests() {
    colorLog('cyan', '[TEST] hCaptcha 部署测试开始');
    colorLog('cyan', `[NETWORK] 测试目标: ${baseUrl}`);
    colorLog('cyan', '='.repeat(50));
    
    try {
        // 按顺序执行测试
        const envOk = checkEnvironment();
        if (!envOk) {
            colorLog('red', '\n[FAIL] 环境配置检查失败，跳过后续测试');
            showSummary();
            return;
        }
        
        const nodeOk = checkNodeDependencies();
        if (!nodeOk) {
            colorLog('red', '\n[FAIL] Node.js 依赖检查失败，跳过后续测试');
            showSummary();
            return;
        }
        
        const pythonOk = await checkPythonEnvironment();
        if (!pythonOk) {
            colorLog('red', '\n[FAIL] Python 环境检查失败，跳过后续测试');
            showSummary();
            return;
        }
        
        const serviceOk = await checkServiceStatus();
        if (!serviceOk) {
            colorLog('red', '\n[FAIL] 服务状态检查失败，跳过后续测试');
            showSummary();
            return;
        }
        
        const apiOk = await testBasicAPI();
        if (!apiOk) {
            colorLog('red', '\n[FAIL] 基础 API 测试失败，跳过 hCaptcha 测试');
            showSummary();
            return;
        }
        
        // 最后测试 hCaptcha 解决器
        await testHcaptchaSolver();
        
    } catch (error) {
        colorLog('red', `\n[ERROR] 测试过程中发生错误: ${error.message}`);
        recordTest('测试执行', false, error.message);
    }
    
    showSummary();
}

// 启动测试
if (require.main === module) {
    runTests().catch(error => {
        colorLog('red', `[ERROR] 测试启动失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runTests };