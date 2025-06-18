/**
 * reCAPTCHA v3 快速测试
 * 注意: 推荐使用 test-recaptcha-comprehensive.js 进行完整测试
 */

const { testSingle } = require('./test-recaptcha');

async function testRecaptchaV3Simple() {
    console.log('🔒 reCAPTCHA v3 快速测试');
    console.log('💡 使用综合测试模块...');
    console.log('');
    
    return await testSingle('recaptchav3');
}

// 运行测试
if (require.main === module) {
    console.log('🚀 开始 reCAPTCHA v3 快速测试');
    console.log('📝 提示: 如需完整测试，请使用: node test-recaptcha-comprehensive.js');
    console.log('');

    testRecaptchaV3Simple()
        .catch((error) => {
            console.error('💀 测试异常:', error.message);
            process.exit(1);
        });
}

module.exports = { testRecaptchaV3Simple };