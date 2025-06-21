const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * hCaptcha 解决器端点
 */
async function solveHcaptcha(req, res) {
    const requestId = Math.random().toString(36).substring(2, 8);
    const startTime = new Date();
    
    console.log(`[HCAPTCHA] [${requestId}] hCaptcha请求开始: ${new Date().toISOString()}`);
    console.log(`[INFO] [${requestId}] 请求参数:`, req.body);
    
    try {
        // 参数验证
        const { websiteUrl, websiteKey } = req.body;
        
        if (!websiteUrl || !websiteKey) {
            return res.status(400).json({
                code: 400,
                message: 'websiteUrl 和 websiteKey 是必需的参数',
                token: null
            });
        }

        // 更新全局监控计数器
        if (global.monitoringData) {
            global.monitoringData.totalRequests++;
            global.monitoringData.lastRequestTime = new Date();
            global.monitoringData.activeRequestsByService.hcaptcha++;
            
            // 添加到活跃请求列表
            global.monitoringData.activeRequests.set(requestId, {
                id: requestId,
                url: websiteUrl,
                mode: 'hcaptcha',
                startTime: startTime,
                clientIP: req.ip || req.connection.remoteAddress
            });
            
            console.log(`[INFO] [${requestId}] 更新监控计数器`);
        }

        // 更新活跃请求计数
        if (typeof global.activeRequestCount === 'number') {
            global.activeRequestCount++;
        } else {
            global.activeRequestCount = 1;
        }

        console.log(`[INFO] [${requestId}] 当前活跃请求: ${global.activeRequestCount}, hCaptcha活跃: ${global.monitoringData.activeRequestsByService.hcaptcha}`);

        // 准备调用 Python 解决器
        const params = {
            websiteUrl,
            websiteKey,
            // 添加其他可选参数
            proxy: req.body.proxy,
            userAgent: req.body.userAgent
        };

        console.log(`[PYTHON] [${requestId}] 准备调用Python解决器，参数:`, params);

        try {
            console.log(`[START] [${requestId}] 开始调用Python解决器: ${new Date().toISOString()}`);
            const result = await callPythonSolver(params, requestId);
            console.log(`[OK] [${requestId}] Python解决器返回结果: ${new Date().toISOString()}`, result);

            // 更新成功计数
            if (global.monitoringData) {
                global.monitoringData.successfulRequests++;
                
                // 添加到最近的token列表
                global.monitoringData.recentTokens.unshift({
                    token: result.token ? result.token.substring(0, 20) + '...' : null,
                    timestamp: new Date(),
                    url: websiteUrl,
                    service: 'hcaptcha'
                });
                
                // 只保留最近20个token
                if (global.monitoringData.recentTokens.length > 20) {
                    global.monitoringData.recentTokens = global.monitoringData.recentTokens.slice(0, 20);
                }
            }

            return res.json({
                code: result.success ? 200 : 500,
                message: result.success ? 'hCaptcha 解决成功' : result.error || '解决失败',
                token: result.token || null
            });

        } catch (error) {
            console.error(`[ERROR] [${requestId}] Python解决器调用出错:`, error.message);
            console.error(`[DEBUG] [${requestId}] 错误堆栈:`, error.stack);

            // 更新失败计数
            if (global.monitoringData) {
                global.monitoringData.failedRequests++;
            }

            return res.status(500).json({
                code: 500,
                message: `hCaptcha 解决失败: ${error.message}`,
                token: null
            });
        }

    } finally {
        // 清理资源
        console.log(`[CLEANUP] [${requestId}] 清理资源，总耗时: ${Date.now() - startTime.getTime()}ms`);
        
        // 更新监控数据
        if (global.monitoringData) {
            global.monitoringData.activeRequests.delete(requestId);
            global.monitoringData.activeRequestsByService.hcaptcha = Math.max(0, global.monitoringData.activeRequestsByService.hcaptcha - 1);
            
            // 添加到请求历史
            global.monitoringData.requestHistory.unshift({
                id: requestId,
                url: req.body.websiteUrl,
                mode: 'hcaptcha',
                startTime: startTime,
                endTime: new Date(),
                duration: Date.now() - startTime.getTime(),
                success: res.statusCode === 200,
                clientIP: req.ip || req.connection.remoteAddress
            });
            
            // 只保留最近100条历史
            if (global.monitoringData.requestHistory.length > 100) {
                global.monitoringData.requestHistory = global.monitoringData.requestHistory.slice(0, 100);
            }
        }

        // 更新活跃请求计数
        if (typeof global.activeRequestCount === 'number') {
            global.activeRequestCount = Math.max(0, global.activeRequestCount - 1);
        }
    }
}

/**
 * 调用 Python hCaptcha 解决器
 */
function callPythonSolver(params, requestId) {
    return new Promise((resolve, reject) => {
        const timeout = 300000; // 5分钟超时
        
        // 构建路径
        const solverDir = __dirname;
        const solverPath = path.join(solverDir, 'solver.py');
        
        // 检查文件是否存在
        if (!fs.existsSync(solverPath)) {
            return reject(new Error(`Python解决器文件不存在: ${solverPath}`));
        }

        // 准备参数
        const paramsJson = JSON.stringify(params);
        
        // 跨平台Python命令选择
        const isWindows = process.platform === 'win32';
        const pythonCommands = isWindows ? ['python', 'py'] : ['python3', 'python'];
        
        let finalPythonCommand = pythonCommands[0];
        
        console.log(`[EXEC] Python命令: ${finalPythonCommand}`);
        console.log(`[PATH] 解决器路径: ${solverPath}`);
        console.log(`[PARAMS] 参数JSON: ${paramsJson}`);
        
        // 启动 Python 子进程，跨平台重定向stderr
        console.log(`[START] 启动Python进程: ${new Date().toISOString()}`);
        
        // 跨平台处理 stderr 重定向
        let stderrRedirect;
        try {
            if (process.platform === 'win32') {
                // Windows 使用 NUL 设备
                stderrRedirect = fs.openSync('NUL', 'w');
            } else {
                // Unix/Linux 使用 /dev/null
                stderrRedirect = fs.openSync('/dev/null', 'w');
            }
        } catch (error) {
            console.warn('[WARN] 无法打开空设备，使用 ignore 模式:', error.message);
            stderrRedirect = 'ignore';
        }
        
        const pythonProcess = spawn(finalPythonCommand, [solverPath, paramsJson], {
            stdio: ['pipe', 'pipe', stderrRedirect], // 重定向stderr到空设备
            cwd: solverDir,
            env: { 
                ...process.env, 
                LOG_LEVEL: 'CRITICAL',
                PYTHONUNBUFFERED: '1',  // 确保Python输出不被缓冲
                PYTHONIOENCODING: 'utf-8',  // 强制使用UTF-8编码
                LANG: 'en_US.UTF-8',  // 设置语言环境为UTF-8
                LC_ALL: 'en_US.UTF-8'  // 设置所有本地化设置为UTF-8
            }
        });

        let stdout = '';
        let isResolved = false;
        
        // 设置超时
        const timeoutId = setTimeout(() => {
            if (!isResolved) {
                isResolved = true;
                console.log(`[TIMEOUT] Python进程超时，强制终止: ${new Date().toISOString()}`);
                pythonProcess.kill('SIGKILL');
                reject(new Error('Python解决器超时'));
            }
        }, timeout);

        // 收集输出
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // 处理进程退出
        pythonProcess.on('close', (code) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            
            console.log(`[EXIT] Python进程退出，代码: ${code}, 时间: ${new Date().toISOString()}`);
            console.log(`[OUTPUT] stdout长度: ${stdout.length}`);
            
            if (code !== 0) {
                console.error('[ERROR] hCaptcha solver failed with exit code:', code);
                return reject(new Error(`Python解决器异常退出，代码: ${code}`));
            }

            // 解析输出
            try {
                const result = parseOutput(stdout, requestId);
                resolve(result);
            } catch (parseError) {
                reject(parseError);
            }
        });

        // 处理启动错误
        pythonProcess.on('error', (error) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            console.error('[ERROR] 启动hCaptcha解决器失败:', error.message);
            console.error('[DEBUG] 错误详情:', error);
            reject(new Error(`启动Python解决器失败: ${error.message}`));
        });
    });
}

/**
 * 解析 Python 输出
 */
function parseOutput(stdout, requestId) {
    console.log(`[DEBUG] 原始输出长度: ${stdout.length}`);
    
    // 方法1: 寻找特殊标记的JSON
    const resultMatch = stdout.match(/RESULT_JSON_START\s*({.*?})\s*RESULT_JSON_END/s);
    if (resultMatch) {
        try {
            const jsonResult = JSON.parse(resultMatch[1]);
            console.log(`[OK] 通过特殊标记找到JSON: ${resultMatch[1]}`);
            return jsonResult;
        } catch (e) {
            console.log(`[WARN] 特殊标记的内容不是有效JSON: ${e.message}`);
        }
    }

    // 方法2: 清理输出后再尝试
    console.log(`[DEBUG] 特殊标记方法失败，尝试清理输出`);
    
    // 移除ANSI颜色代码和其他控制字符
    const cleanOutput = stdout
        .replace(/\x1b\[[0-9;]*m/g, '') // 移除ANSI颜色代码
        .replace(/\r\n/g, '\n')         // 统一换行符
        .replace(/\r/g, '\n')           // 统一换行符
        .trim();
    
    console.log(`[DEBUG] 清理后的输出长度: ${cleanOutput.length}`);
    
    // 方法3: 逐行查找JSON
    const lines = cleanOutput.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const jsonResult = JSON.parse(line);
                console.log(`[OK] 找到JSON在第${i+1}行: ${line}`);
                return jsonResult;
            } catch (e) {
                console.log(`[WARN] 第${i+1}行不是有效JSON: ${line.substring(0, 50)}... 错误: ${e.message}`);
            }
        }
    }

    // 方法4: 在清理后的输出中再次寻找特殊标记
    const cleanResultMatch = cleanOutput.match(/RESULT_JSON_START\s*({.*?})\s*RESULT_JSON_END/s);
    if (cleanResultMatch) {
        try {
            const jsonResult = JSON.parse(cleanResultMatch[1]);
            console.log(`[OK] 清理后通过特殊标记找到JSON: ${cleanResultMatch[1]}`);
            return jsonResult;
        } catch (e) {
            console.log(`[WARN] 清理后特殊标记的内容不是有效JSON: ${e.message}`);
        }
    }

    // 方法5: 使用简单的正则表达式匹配
    const simpleJsonMatch = cleanOutput.match(/\{[^{}]*"success"[^{}]*\}/);
    if (simpleJsonMatch) {
        try {
            const jsonResult = JSON.parse(simpleJsonMatch[0]);
            console.log(`[OK] 通过简单正则表达式找到JSON: ${simpleJsonMatch[0]}`);
            return jsonResult;
        } catch (e) {
            console.log(`[WARN] 简单正则匹配的内容不是有效JSON: ${e.message}`);
        }
    }

    // 如果所有方法都失败，输出调试信息
    console.error('[DEBUG] 调试信息 - 原始输出:');
    console.error(stdout.substring(0, 1000)); // 只显示前1000字符

    // 最后尝试解析整个输出
    try {
        const jsonResult = JSON.parse(cleanOutput);
        console.log(`[OK] 成功解析JSON结果:`, jsonResult);
        return jsonResult;
    } catch (parseError) {
        console.error('[ERROR] 解析Python输出失败:', parseError.message);
        console.error('[DEBUG] 原始输出长度:', stdout.length);
        console.error('[DEBUG] 清理后输出:', cleanOutput.substring(0, 500));
        console.error('[DEBUG] 输出行数:', lines.length);
        console.error('[DEBUG] 最后5行:');
        lines.slice(-5).forEach((line, i) => {
            console.error(`  ${lines.length - 5 + i + 1}: ${line}`);
        });
        
        throw new Error(`无法解析Python输出: ${parseError.message}`);
    }
}

module.exports = { solveHcaptcha };