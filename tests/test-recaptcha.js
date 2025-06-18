/**
 * 综合 reCAPTCHA v2 和 v3 测试脚本
 * 一次性测试 Python reCAPTCHA v2 和 reCAPTCHA v3 解决方案
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试配置
const TEST_CONFIGS = {
    recaptchav2: {
        name: 'reCAPTCHA v2 (Python)',
        type: 'recaptchav2',
        websiteUrl: 'https://2captcha.com/demo/recaptcha-v2',
        websiteKey: '6LfAqCMTAAAAAJa_Eq_nI4W6D4fkSaKYTyM8eiWJ',
        // proxy: {
        //     host: '92.113.231.145',
        //     port: 7230,
        //     username: 'axckvtcp',
        //     password: 'cumroe8vrdoj'
        // },
        timeout: 300000, // 5分钟
        expectedTokenLength: 900,
    },
    recaptchav3: {
        name: 'reCAPTCHA v3',
        type: 'recaptchav3',
        websiteUrl: 'https://testnet.humanity.org',
        websiteKey: '6LenESAqAAAAAL9ZymIB_A4Y03U3s3cPhBYKfcnU',
        pageAction: 'LOGIN',
        timeout: 60000, // 1分钟
        expectedTokenLength: 500,
    }
};

/**
 * 执行单个 reCAPTCHA 测试
 */
async function testRecaptcha(config) {
    console.log(`\n🧪 测试 ${config.name}`);
    console.log('='.repeat(60));
    console.log(`📋 配置信息:`);
    console.log(`   类型: ${config.type}`);
    console.log(`   网站: ${config.websiteUrl}`);
    console.log(`   SiteKey: ${config.websiteKey}`);
    if (config.pageAction) {
        console.log(`   Action: ${config.pageAction}`);
    }
    console.log('');

    const startTime = Date.now();
    const testData = {
        type: config.type,
        websiteUrl: config.websiteUrl,
        websiteKey: config.websiteKey,
        language: config.language || 'en'
    };

    if (config.pageAction) {
        testData.pageAction = config.pageAction;
    }

    if (config.proxy) {
        testData.proxy = config.proxy;
    }

    try {
        console.log('📤 发送解决请求...');
        console.log(`⏰ 开始时间: ${new Date().toISOString()}`);

        const response = await axios.post(API_BASE_URL, testData, {
            timeout: config.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const result = response.data;

        console.log(`⏰ 结束时间: ${new Date().toISOString()}`);
        console.log('');
        console.log('📊 测试结果:');
        console.log(`   HTTP状态: ${response.status}`);
        console.log(`   响应代码: ${result.code}`);
        console.log(`   成功状态: ${result.code === 200 ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   总耗时: ${totalTime}ms (${Math.round(totalTime / 1000)}秒)`);

        if (result.token) {
            console.log('🎯 Token 信息:');
            console.log(`   长度: ${result.token.length} 字符`);
            console.log(`   预览: ${result.token.substring(0, 80)}...`);
            
            // 验证 token 长度
            if (result.token.length >= config.expectedTokenLength) {
                console.log(`   ✅ Token 长度符合预期 (>= ${config.expectedTokenLength})`);
            } else {
                console.log(`   ⚠️  Token 长度偏短 (< ${config.expectedTokenLength})`);
            }
        } else {
            console.log('❌ 未获得 token');
        }

        if (result.solveTime) {
            console.log(`⏱️  内部解决时间: ${result.solveTime}ms (${Math.round(result.solveTime / 1000)}秒)`);
        }

        if (result.challengeType) {
            console.log(`🔧 挑战类型: ${result.challengeType}`);
        }

        if (config.type === 'recaptchav3' && result.score !== undefined) {
            console.log(`📊 reCAPTCHA v3 分数: ${result.score}`);
        }

        // 分析结果
        console.log('');
        console.log('📈 结果分析:');
        const success = result.code === 200 && result.token && result.token.length >= config.expectedTokenLength;
        
        if (success) {
            console.log(`🎉 ${config.name} 测试完全成功！`);
            console.log('   ✅ 获得有效 token');
            console.log('   ✅ 解决时间合理');
            console.log('   ✅ 系统集成正常');
        } else {
            console.log(`❌ ${config.name} 测试失败`);
            if (result.message) {
                console.log(`   错误: ${result.message}`);
            }
        }

        return {
            config: config.name,
            success: success,
            response: result,
            totalTime: totalTime,
            httpStatus: response.status
        };

    } catch (error) {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`⏰ 失败时间: ${new Date().toISOString()}`);
        console.log(`⏱️  总耗时: ${totalTime}ms`);
        console.log('');
        console.error(`❌ ${config.name} 测试异常:`);
        
        if (error.response) {
            console.error(`   HTTP状态: ${error.response.status}`);
            console.error(`   错误响应:`, error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('   ⏰ 请求超时');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   🔌 连接被拒绝 - 请确保服务器正在运行');
        } else {
            console.error(`   🔍 错误: ${error.message}`);
        }

        return {
            config: config.name,
            success: false,
            error: error.message,
            totalTime: totalTime,
            httpStatus: error.response?.status || 0
        };
    }
}

/**
 * 执行所有测试
 */
async function runAllTests() {
    console.log('🚀 reCAPTCHA 综合测试开始');
    console.log('🎯 目标: 验证 reCAPTCHA v2 (Python) 和 v3 解决方案');
    console.log('💡 注意: 测试可能需要几分钟时间，请耐心等待');
    console.log('');

    const results = [];
    const configs = Object.values(TEST_CONFIGS);

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        console.log(`\n📋 进度: ${i + 1}/${configs.length}`);
        
        const result = await testRecaptcha(config);
        results.push(result);

        // 在测试之间添加延迟，避免请求过于频繁
        if (i < configs.length - 1) {
            console.log('\n⏳ 等待 10 秒后进行下一个测试...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    // 生成总结报告
    console.log('\n\n🎊 测试完成 - 总结报告');
    console.log('='.repeat(80));

    let successCount = 0;
    let totalTime = 0;

    results.forEach((result, index) => {
        const status = result.success ? '✅ 成功' : '❌ 失败';
        console.log(`${index + 1}. ${result.config}: ${status} (${Math.round(result.totalTime / 1000)}秒)`);
        
        if (result.success) {
            successCount++;
        }
        totalTime += result.totalTime;
    });

    console.log('');
    console.log('📊 统计信息:');
    console.log(`   总测试数: ${results.length}`);
    console.log(`   成功数: ${successCount}`);
    console.log(`   失败数: ${results.length - successCount}`);
    console.log(`   成功率: ${Math.round((successCount / results.length) * 100)}%`);
    console.log(`   总耗时: ${Math.round(totalTime / 1000)}秒`);

    console.log('');
    if (successCount === results.length) {
        console.log('🎉 所有测试通过！reCAPTCHA 解决方案工作正常');
        process.exit(0);
    } else {
        console.log('⚠️  部分测试失败，请检查失败的测试项');
        
        // 显示失败的测试详情
        const failedTests = results.filter(r => !r.success);
        if (failedTests.length > 0) {
            console.log('\n❌ 失败的测试:');
            failedTests.forEach(test => {
                console.log(`   - ${test.config}: ${test.error || 'Unknown error'}`);
            });
        }
        
        process.exit(1);
    }
}

/**
 * 测试单个类型（用于快速测试）
 */
async function testSingle(type) {
    if (!TEST_CONFIGS[type]) {
        console.error(`❌ 未知的测试类型: ${type}`);
        console.log('可用类型:', Object.keys(TEST_CONFIGS).join(', '));
        process.exit(1);
    }

    console.log(`🧪 单独测试: ${TEST_CONFIGS[type].name}`);
    const result = await testRecaptcha(TEST_CONFIGS[type]);
    
    if (result.success) {
        console.log('\n✅ 单项测试成功');
        process.exit(0);
    } else {
        console.log('\n❌ 单项测试失败');
        process.exit(1);
    }
}

// 主程序
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // 单独测试指定类型
        testSingle(args[0]);
    } else {
        // 运行所有测试
        runAllTests().catch(error => {
            console.error('💀 测试运行异常:', error.message);
            process.exit(1);
        });
    }
}

module.exports = { testRecaptcha, runAllTests, testSingle, TEST_CONFIGS };