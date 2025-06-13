#!/usr/bin/env node
/**
 * hCaptcha 快速测试脚本
 * 用于快速验证 hCaptcha 解决器是否正常工作
 */

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
    }
}

const baseUrl = `http://${host}:${port}`;

console.log('📡 检查服务状态...');

// 检查服务是否运行
function checkService() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: host,
            port: port,
            path: '/monitor',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ 服务运行正常');
                resolve(true);
            } else {
                reject(new Error(`服务返回状态码: ${res.statusCode}`));
            }
        });
        
        req.on('error', (error) => {
            reject(new Error(`无法连接到服务: ${error.message}`));
        });
        
        req.on('timeout', () => {
            reject(new Error('连接服务超时'));
        });
        
        req.end();
    });
}

// 测试 hCaptcha 解决器
function testHcaptcha() {
    return new Promise((resolve, reject) => {
        console.log('\n🎯 开始 hCaptcha 解决测试...');
        console.log('⏱️  预计耗时: 30-120 秒');
        
        const testData = JSON.stringify({
            type: 'hcaptcha',
            websiteUrl: 'https://accounts.hcaptcha.com/demo',
            websiteKey: '338af34c-7bcb-4c7c-900b-acbec73d7d43'
        });
        
        console.log(`📤 发送请求到: ${baseUrl}/`);
        console.log('📤 请求数据:', {
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
                
                console.log('📥 收到响应:');
                console.log('────────────────────────────────────────');
                console.log(`⏱️  耗时: ${duration}s`);
                console.log(`📊 状态码: ${res.statusCode}`);
                
                try {
                    const response = JSON.parse(data);
                    console.log('📋 响应体:', response);
                    
                    console.log('\n🔍 响应验证:');
                    console.log('────────────────────────────────────────');
                    
                    // 验证响应
                    const statusOk = res.statusCode === 200;
                    const formatOk = typeof response === 'object' && response !== null;
                    const hasCode = 'code' in response;
                    const hasMessage = 'message' in response;
                    const hasToken = 'token' in response;
                    const tokenValid = response.token && typeof response.token === 'string' && response.token.length > 0;
                    
                    console.log(`${statusOk ? '✅' : '❌'} PASS HTTP Status: ${res.statusCode}`);
                    console.log(`${formatOk ? '✅' : '❌'} PASS Response Format: ${formatOk ? 'Valid JSON' : 'Invalid JSON'}`);
                    console.log(`${hasCode ? '✅' : '❌'} PASS Field: code: ${hasCode ? 'Present' : 'Missing'}`);
                    console.log(`${hasMessage ? '✅' : '❌'} PASS Field: message: ${hasMessage ? 'Present' : 'Missing'}`);
                    
                    if (statusOk && response.code === 200) {
                        console.log(`${tokenValid ? '✅' : '❌'} PASS Token: ${tokenValid ? 'Valid' : 'Invalid/Missing'}`);
                    }
                    
                    const passedTests = [statusOk, formatOk, hasCode, hasMessage].filter(Boolean).length;
                    const totalTests = 4 + (statusOk && response.code === 200 ? 1 : 0);
                    
                    console.log('\n📈 测试总结:');
                    console.log('────────────────────────────────────────');
                    console.log(`✅ 通过验证: ${passedTests}/${totalTests}`);
                    console.log(`⏱️  总耗时: ${duration}s`);
                    
                    if (statusOk && response.code === 200 && tokenValid) {
                        console.log('🎉 hCaptcha 解决成功');
                        console.log(`🔑 Token: ${response.token.substring(0, 50)}...`);
                        resolve(response);
                    } else if (response.code === 500) {
                        console.log('⚠️  hCaptcha 解决失败');
                        console.log(`❌ 错误: ${response.message}`);
                        reject(new Error(response.message || 'hCaptcha 解决失败'));
                    } else {
                        console.log('⚠️  响应异常');
                        reject(new Error(`意外的响应状态: ${res.statusCode}`));
                    }
                    
                } catch (error) {
                    console.log('📋 响应体 (原始):', data);
                    console.log(`❌ JSON 解析失败: ${error.message}`);
                    reject(new Error(`响应解析失败: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ 请求失败: ${error.message}`);
            reject(error);
        });
        
        req.on('timeout', () => {
            console.log('❌ 请求超时 (3分钟)');
            reject(new Error('请求超时'));
        });
        
        req.write(testData);
        req.end();
    });
}

// 主函数
async function main() {
    try {
        await checkService();
        await testHcaptcha();
        console.log('\n🎉 所有测试通过！hCaptcha 解决器工作正常！');
        process.exit(0);
    } catch (error) {
        console.log(`\n❌ 测试失败: ${error.message}`);
        console.log('\n💡 解决建议:');
        console.log('  1. 检查服务是否已启动');
        console.log('  2. 检查 .env 文件中的 GEMINI_API_KEY 配置');
        console.log('  3. 检查 Python 虚拟环境和依赖安装');
        console.log('  4. 运行完整测试: node test_hcaptcha_deployment.js');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}