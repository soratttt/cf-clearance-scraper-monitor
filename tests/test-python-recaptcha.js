/**
 * Python reCAPTCHA v2 快速测试
 * 测试 GoogleRecaptchaBypass Python 集成
 * 注意: 推荐使用 test-recaptcha-comprehensive.js 进行完整测试
 */

const { testSingle } = require('./test-recaptcha-comprehensive');

async function testPythonRecaptchaV2() {
    console.log('🐍 Python reCAPTCHA v2 快速测试');
    console.log('💡 使用综合测试模块...');
    console.log('');
    
    return await testSingle('recaptchav2');
}

// 运行测试
if (require.main === module) {
    console.log('🚀 开始 Python reCAPTCHA v2 快速测试');
    console.log('📝 提示: 如需完整测试，请使用: node test-recaptcha-comprehensive.js');
    console.log('');

    testPythonRecaptchaV2()
        .catch((error) => {
            console.error('💀 测试异常:', error.message);
            process.exit(1);
        });
}

module.exports = { testPythonRecaptchaV2 };