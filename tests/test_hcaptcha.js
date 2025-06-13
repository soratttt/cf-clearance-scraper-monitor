#!/usr/bin/env node
/**
 * hCaptcha 功能测试脚本
 * 支持单次测试和压力测试两种模式
 */

const http = require('http');
const readline = require('readline');

// 测试配置
const TEST_CONFIG = {
    server: {
        host: 'localhost',
        port: 3001,
        timeout: 360000 // 6分钟超时，给Python更多时间
    },
    hcaptcha: {
        websiteUrl: 'https://accounts.hcaptcha.com/demo',
        websiteKey: '338af34c-7bcb-4c7c-900b-acbec73d7d43'
    }
};

/**
 * 发送 hCaptcha 解决请求
 */
function solveHcaptcha(testData = {}) {
    return new Promise((resolve, reject) => {
        const requestData = {
            type: "hcaptcha",
            websiteUrl: testData.websiteUrl || TEST_CONFIG.hcaptcha.websiteUrl,
            websiteKey: testData.websiteKey || TEST_CONFIG.hcaptcha.websiteKey,
            ...testData
        };

        const postData = JSON.stringify(requestData);
        
        const options = {
            hostname: TEST_CONFIG.server.host,
            port: TEST_CONFIG.server.port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log(`📤 发送请求到: http://${options.hostname}:${options.port}${options.path}`);
        console.log(`📤 请求数据:`, JSON.stringify(requestData, null, 2));

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: jsonResponse,
                        requestTime: Date.now()
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseData,
                        parseError: e.message,
                        requestTime: Date.now()
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        // 设置请求超时
        req.setTimeout(TEST_CONFIG.server.timeout);

        req.write(postData);
        req.end();
    });
}

/**
 * 检查服务状态
 */
function checkServerStatus() {
    return new Promise((resolve) => {
        const options = {
            hostname: TEST_CONFIG.server.host,
            port: TEST_CONFIG.server.port,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            resolve({
                status: res.statusCode === 200,
                statusCode: res.statusCode
            });
        });

        req.on('error', () => {
            resolve({ status: false, error: 'Connection failed' });
        });

        req.on('timeout', () => {
            resolve({ status: false, error: 'Timeout' });
        });

        req.end();
    });
}

/**
 * 验证响应格式
 */
function validateResponse(response) {
    const validations = [];
    
    // 检查状态码
    if (response.statusCode === 200) {
        validations.push({ check: 'HTTP Status', result: '✅ PASS', detail: `200 OK` });
    } else {
        validations.push({ check: 'HTTP Status', result: '❌ FAIL', detail: `${response.statusCode}` });
    }
    
    // 检查响应体
    if (response.body && typeof response.body === 'object') {
        validations.push({ check: 'Response Format', result: '✅ PASS', detail: 'Valid JSON' });
        
        // 检查必需字段
        const requiredFields = ['code', 'message'];
        requiredFields.forEach(field => {
            if (response.body.hasOwnProperty(field)) {
                validations.push({ check: `Field: ${field}`, result: '✅ PASS', detail: `Present` });
            } else {
                validations.push({ check: `Field: ${field}`, result: '❌ FAIL', detail: `Missing` });
            }
        });
        
        // 检查成功响应的 token 字段
        if (response.body.code === 200) {
            if (response.body.token) {
                validations.push({ 
                    check: 'Token Field', 
                    result: '✅ PASS', 
                    detail: `Length: ${response.body.token.length}` 
                });
            } else {
                validations.push({ 
                    check: 'Token Field', 
                    result: '❌ FAIL', 
                    detail: 'Missing token in success response' 
                });
            }
        }
    } else {
        validations.push({ check: 'Response Format', result: '❌ FAIL', detail: 'Invalid JSON' });
    }
    
    return validations;
}

/**
 * 格式化时间
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * 运行测试套件
 */
async function runTests() {
    console.log('🧪 hCaptcha 功能测试');
    console.log('='.repeat(60));
    console.log(`🌐 测试网站: ${TEST_CONFIG.hcaptcha.websiteUrl}`);
    console.log(`🔑 Site Key: ${TEST_CONFIG.hcaptcha.websiteKey}`);
    console.log(`🖥️  服务地址: http://${TEST_CONFIG.server.host}:${TEST_CONFIG.server.port}`);
    console.log('='.repeat(60));
    console.log();

    // 1. 检查服务状态
    console.log('📡 检查服务状态...');
    const serverStatus = await checkServerStatus();
    
    if (!serverStatus.status) {
        console.log('❌ 服务未运行或无法连接');
        console.log(`   错误: ${serverStatus.error || 'Unknown'}`);
        console.log('   请确保服务已启动: npm start');
        process.exit(1);
    }
    
    console.log('✅ 服务运行正常');
    console.log();

    // 2. 基本功能测试
    console.log('🎯 开始 hCaptcha 解决测试...');
    console.log('⏱️  预计耗时: 30-120 秒');
    console.log();
    
    const startTime = Date.now();
    
    try {
        const response = await solveHcaptcha();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('📥 收到响应:');
        console.log('─'.repeat(40));
        console.log(`⏱️  耗时: ${formatDuration(duration)}`);
        console.log(`📊 状态码: ${response.statusCode}`);
        console.log(`📋 响应体:`, JSON.stringify(response.body, null, 2));
        console.log();
        
        // 3. 验证响应
        console.log('🔍 响应验证:');
        console.log('─'.repeat(40));
        const validations = validateResponse(response);
        
        validations.forEach(validation => {
            console.log(`${validation.result} ${validation.check}: ${validation.detail}`);
        });
        console.log();
        
        // 4. 结果总结
        const passedValidations = validations.filter(v => v.result.includes('✅')).length;
        const totalValidations = validations.length;
        
        console.log('📈 测试总结:');
        console.log('─'.repeat(40));
        console.log(`✅ 通过验证: ${passedValidations}/${totalValidations}`);
        console.log(`⏱️  总耗时: ${formatDuration(duration)}`);
        
        if (response.body && response.body.code === 200 && response.body.token) {
            console.log('🎉 hCaptcha 解决成功!');
            console.log(`🎫 Token: ${response.body.token.substring(0, 50)}...`);
        } else if (response.body && response.body.code !== 200) {
            console.log('⚠️  hCaptcha 解决失败');
            console.log(`❌ 错误: ${response.body.message || 'Unknown error'}`);
        } else {
            console.log('❓ 响应格式异常');
        }
        
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('💥 测试失败:');
        console.log('─'.repeat(40));
        console.log(`⏱️  耗时: ${formatDuration(duration)}`);
        console.log(`❌ 错误: ${error.message}`);
        
        if (error.message.includes('timeout')) {
            console.log('⏰ 可能原因:');
            console.log('   - hCaptcha 挑战过于复杂');
            console.log('   - 网络连接不稳定');
            console.log('   - Gemini API 响应缓慢');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('🔌 可能原因:');
            console.log('   - 服务未启动');
            console.log('   - 端口号错误');
        }
    }
    
    console.log();
    console.log('�� 测试完成');
}

/**
 * 运行压力测试
 */
async function runStressTest(concurrency, totalRequests) {
    console.log('🧪 开始压力测试');
    console.log('='.repeat(60));
    console.log(`📊 并发数: ${concurrency}`);
    console.log(`🎯 总请求数: ${totalRequests}`);
    console.log(`🌐 测试网站: ${TEST_CONFIG.hcaptcha.websiteUrl}`);
    console.log(`🔑 Site Key: ${TEST_CONFIG.hcaptcha.websiteKey}`);
    console.log('='.repeat(60));
    console.log();

    const results = {
        success: 0,
        failed: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: []
    };

    const startTime = Date.now();
    let completedRequests = 0;
    let activeRequests = 0;

    // 创建请求队列
    const queue = Array.from({ length: totalRequests }, (_, i) => i);
    
    // 处理单个请求
    async function processRequest() {
        if (queue.length === 0 || activeRequests >= concurrency) return;
        
        activeRequests++;
        const requestStartTime = Date.now();
        
        try {
            const response = await solveHcaptcha();
            const requestTime = Date.now() - requestStartTime;
            
            results.totalTime += requestTime;
            results.minTime = Math.min(results.minTime, requestTime);
            results.maxTime = Math.max(results.maxTime, requestTime);
            
            if (response.statusCode === 200 && response.body.code === 200) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({
                    statusCode: response.statusCode,
                    message: response.body?.message || 'Unknown error',
                    time: requestTime
                });
            }
        } catch (error) {
            results.failed++;
            results.errors.push({
                error: error.message,
                time: Date.now() - requestStartTime
            });
        }
        
        completedRequests++;
        activeRequests--;
        
        // 更新进度
        const progress = (completedRequests / totalRequests * 100).toFixed(1);
        process.stdout.write(`\r⏳ 进度: ${progress}% (${completedRequests}/${totalRequests}) 成功: ${results.success} 失败: ${results.failed}`);
        
        // 继续处理队列
        processRequest();
    }

    // 启动初始请求
    for (let i = 0; i < concurrency; i++) {
        processRequest();
    }

    // 等待所有请求完成
    while (completedRequests < totalRequests) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n📊 压力测试结果:');
    console.log('='.repeat(60));
    console.log(`✅ 成功请求: ${results.success}`);
    console.log(`❌ 失败请求: ${results.failed}`);
    console.log(`⏱️  总耗时: ${formatDuration(Date.now() - startTime)}`);
    console.log(`📈 平均响应时间: ${formatDuration(results.totalTime / totalRequests)}`);
    console.log(`⚡ 最快响应: ${formatDuration(results.minTime)}`);
    console.log(`🐢 最慢响应: ${formatDuration(results.maxTime)}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ 错误详情:');
        results.errors.slice(0, 5).forEach((error, index) => {
            console.log(`${index + 1}. ${error.error || error.message} (${formatDuration(error.time)})`);
        });
        if (results.errors.length > 5) {
            console.log(`... 还有 ${results.errors.length - 5} 个错误未显示`);
        }
    }
}

/**
 * 交互式测试模式
 */
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('🎮 hCaptcha 测试工具');
    console.log('='.repeat(60));
    console.log('1. 单次测试 - 测试服务是否正常运行');
    console.log('2. 压力测试 - 测试服务在高负载下的表现');
    console.log('='.repeat(60));
    console.log();

    const answer = await new Promise(resolve => {
        rl.question('请选择测试模式 (1/2): ', resolve);
    });

    if (answer === '1') {
        console.log('\n🧪 开始单次测试...\n');
        await runTests();
    } else if (answer === '2') {
        console.log('\n🧪 开始压力测试配置...\n');
        
        // 获取并发数
        const concurrency = await new Promise(resolve => {
            rl.question('请输入并发数 (1-50): ', answer => {
                const num = parseInt(answer);
                if (isNaN(num) || num < 1 || num > 50) {
                    console.log('⚠️  无效的并发数，使用默认值 1');
                    resolve(1);
                } else {
                    resolve(num);
                }
            });
        });

        // 获取总请求数
        const totalRequests = await new Promise(resolve => {
            rl.question('请输入总请求数 (1-1000): ', answer => {
                const num = parseInt(answer);
                if (isNaN(num) || num < 1 || num > 1000) {
                    console.log('⚠️  无效的请求数，使用默认值 1');
                    resolve(1);
                } else {
                    resolve(num);
                }
            });
        });

        console.log('\n📊 测试配置:');
        console.log(`- 并发数: ${concurrency}`);
        console.log(`- 总请求数: ${totalRequests}`);
        console.log();

        const confirm = await new Promise(resolve => {
            rl.question('确认开始测试? (y/n): ', answer => {
                resolve(answer.toLowerCase() === 'y');
            });
        });

        if (confirm) {
            await runStressTest(concurrency, totalRequests);
        } else {
            console.log('❌ 测试已取消');
        }
    } else {
        console.log('❌ 无效的选择');
    }

    rl.close();
}

// 主程序
async function main() {
    try {
        await interactiveMode();
    } catch (error) {
        console.error('💥 发生错误:', error.message);
        process.exit(1);
    }
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('💥 未捕获的异常:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 未处理的 Promise 拒绝:', reason);
    process.exit(1);
});

// 运行主程序
main().catch(console.error);