// 简单的图表库
class SimpleChart {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            type: 'line',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            maxDataPoints: 50,
            ...options
        };
        this.data = [];
        this.labels = [];
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width || this.canvas.parentElement.clientWidth;
        const height = rect.height || 300;
        
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    addData(value, label) {
        // 支持多数据系列
        if (typeof value === 'object' && value !== null) {
            this.data.push(value);
        } else {
            this.data.push(value);
        }
        this.labels.push(label);
        
        if (this.data.length > this.options.maxDataPoints) {
            this.data.shift();
            this.labels.shift();
        }
        
        this.draw();
    }

    draw() {
        const { canvas, ctx, data, options } = this;
        const width = canvas.clientWidth || canvas.width / window.devicePixelRatio;
        const height = canvas.clientHeight || canvas.height / window.devicePixelRatio;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        // 计算数据范围 - 支持对象数据
        let maxValue = 1;
        let minValue = 0;
        
        if (data.length > 0 && typeof data[0] === 'object') {
            // 多系列数据
            const allValues = [];
            data.forEach(item => {
                if (item.responseTime !== undefined) allValues.push(item.responseTime);
                if (item.activeRequests !== undefined) allValues.push(item.activeRequests);
                if (item.successRate !== undefined) allValues.push(item.successRate);
            });
            maxValue = Math.max(...allValues, 1);
            minValue = Math.min(...allValues, 0);
        } else {
            // 单系列数据
            maxValue = Math.max(...data, 1);
            minValue = Math.min(...data, 0);
        }
        
        const range = maxValue - minValue || 1;
        
        // 绘制网格线
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = (height - 40) * i / 5 + 20;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }
        
        // 垂直网格线
        for (let i = 0; i <= 5; i++) {
            const x = 40 + (width - 60) * i / 5;
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, height - 20);
            ctx.stroke();
        }
        
        // 绘制数据线
        if (options.type === 'line' || options.type === 'candlestick') {
            if (data.length > 0 && typeof data[0] === 'object') {
                // 绘制多系列数据
                const series = [
                    { key: 'responseTime', color: '#e74c3c', label: '响应时间(ms)' },
                    { key: 'activeRequests', color: '#3498db', label: '活跃请求' },
                    { key: 'successRate', color: '#27ae60', label: '成功率(%)' }
                ];
                
                series.forEach(serie => {
                    ctx.strokeStyle = serie.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    
                    let hasData = false;
                    data.forEach((item, index) => {
                        if (item[serie.key] !== undefined) {
                            const x = 40 + (width - 60) * index / (data.length - 1 || 1);
                            const y = height - 20 - ((item[serie.key] - minValue) / range) * (height - 40);
                            
                            if (!hasData) {
                                ctx.moveTo(x, y);
                                hasData = true;
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                    });
                    
                    if (hasData) {
                        ctx.stroke();
                    }
                });
                
                // 绘制图例
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                series.forEach((serie, index) => {
                    const x = width - 150;
                    const y = 30 + index * 20;
                    ctx.fillStyle = serie.color;
                    ctx.fillRect(x, y - 8, 12, 12);
                    ctx.fillStyle = '#333';
                    ctx.fillText(serie.label, x + 18, y);
                });
            } else {
                // 单系列数据 - 原有逻辑
                ctx.strokeStyle = options.borderColor;
                ctx.lineWidth = options.borderWidth;
                ctx.beginPath();
                
                data.forEach((value, index) => {
                    const x = 40 + (width - 60) * index / (data.length - 1 || 1);
                    const y = height - 20 - ((value - minValue) / range) * (height - 40);
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                
                ctx.stroke();
                
                // 填充区域
                if (options.backgroundColor) {
                    ctx.fillStyle = options.backgroundColor;
                    ctx.lineTo(width - 20, height - 20);
                    ctx.lineTo(40, height - 20);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
        
        // 绘制Y轴标签
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (range * (5 - i) / 5);
            const y = (height - 40) * i / 5 + 20;
            ctx.fillText(value.toFixed(0), 35, y);
        }
        
        // 绘制X轴标签（显示最新几个时间点）
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        if (this.labels.length > 0) {
            const labelInterval = Math.max(1, Math.floor(data.length / 5));
            for (let i = 0; i < data.length; i += labelInterval) {
                const x = 40 + (width - 60) * i / (data.length - 1 || 1);
                const label = this.labels[i];
                if (label) {
                    const time = new Date(label).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    ctx.fillText(time, x, height - 15);
                }
            }
        }
    }

    clear() {
        this.data = [];
        this.labels = [];
        this.draw();
    }
}

// 图表管理器
class ChartManager {
    constructor() {
        this.charts = new Map();
    }

    createChart(canvasId, options) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const chart = new SimpleChart(canvas, options);
        this.charts.set(canvasId, chart);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            chart.resize();
            chart.draw();
        });
        
        // 强制立即重绘以确保正确尺寸
        setTimeout(() => {
            chart.resize();
            chart.draw();
        }, 50);
        
        return chart;
    }

    getChart(canvasId) {
        return this.charts.get(canvasId);
    }

    updateChart(canvasId, value, label = new Date()) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.addData(value, label);
        }
    }

    clearChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.clear();
        }
    }
}

// 负载历史图表类
class LoadHistoryChart {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            backgroundColor: '#f8f9fa',
            fillColor: 'rgba(52, 144, 220, 0.2)',
            lineColor: 'rgba(52, 144, 220, 1)',
            lineWidth: 2,
            maxDataPoints: 60, // 显示60秒数据
            gridColor: 'rgba(0, 0, 0, 0.05)',
            textColor: '#6c757d',
            ...options
        };
        this.data = [];
        this.labels = [];
        this.maxConcurrent = 0;
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width || this.canvas.parentElement.clientWidth;
        const height = rect.height || 150;
        
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    addData(activeRequests, timestamp) {
        this.data.push(activeRequests);
        this.labels.push(timestamp);
        
        // 更新最大并发数
        this.maxConcurrent = Math.max(this.maxConcurrent, activeRequests);
        
        // 保持数据点数量
        if (this.data.length > this.options.maxDataPoints) {
            this.data.shift();
            this.labels.shift();
        }
        
        this.draw();
    }

    draw() {
        const { canvas, ctx, data, options } = this;
        const width = canvas.clientWidth || canvas.width / window.devicePixelRatio;
        const height = canvas.clientHeight || canvas.height / window.devicePixelRatio;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        // 计算图表区域
        const padding = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // 计算Y轴范围
        const maxValue = Math.max(this.maxConcurrent, Math.max(...data), 5); // 最小显示5
        const minValue = 0;
        const range = maxValue - minValue;
        
        // 绘制网格线
        ctx.strokeStyle = options.gridColor;
        ctx.lineWidth = 1;
        
        // 水平网格线
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight * i / 4);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }
        
        // 垂直网格线
        for (let i = 0; i <= 6; i++) {
            const x = padding.left + (chartWidth * i / 6);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();
        }
        
        // 绘制Y轴标签
        ctx.fillStyle = options.textColor;
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 4; i++) {
            const value = maxValue - (range * i / 4);
            const y = padding.top + (chartHeight * i / 4);
            ctx.fillText(Math.round(value), padding.left - 8, y);
        }
        
        // 绘制数据线
        if (data.length > 1) {
            // 创建平滑路径
            const points = data.map((value, index) => ({
                x: padding.left + (chartWidth * index / (data.length - 1)),
                y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight
            }));
            
            // 绘制填充区域
            ctx.fillStyle = options.fillColor;
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartHeight);
            
            // 使用简单的平滑算法
            for (let i = 0; i < points.length; i++) {
                if (i === 0) {
                    ctx.lineTo(points[i].x, points[i].y);
                } else {
                    const prevPoint = points[i - 1];
                    const currentPoint = points[i];
                    
                    // 使用简单的平滑
                    const cpx = (prevPoint.x + currentPoint.x) / 2;
                    ctx.quadraticCurveTo(cpx, prevPoint.y, currentPoint.x, currentPoint.y);
                }
            }
            
            ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
            ctx.closePath();
            ctx.fill();
            
            // 绘制边线
            ctx.strokeStyle = options.lineColor;
            ctx.lineWidth = options.lineWidth;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length; i++) {
                const prevPoint = points[i - 1];
                const currentPoint = points[i];
                const cpx = (prevPoint.x + currentPoint.x) / 2;
                ctx.quadraticCurveTo(cpx, prevPoint.y, currentPoint.x, currentPoint.y);
            }
            
            ctx.stroke();
        }
        
        // 绘制X轴标签（时间）
        ctx.fillStyle = options.textColor;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        if (this.labels.length > 0) {
            const now = new Date();
            for (let i = 0; i <= 5; i++) {
                const secondsAgo = 60 - (i * 12);
                const time = new Date(now.getTime() - secondsAgo * 1000);
                const x = padding.left + (chartWidth * i / 5);
                const timeStr = time.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }).substring(3); // 只显示分:秒
                ctx.fillText(timeStr, x, padding.top + chartHeight + 5);
            }
        }
    }

    clear() {
        this.data = [];
        this.labels = [];
        this.maxConcurrent = 0;
        this.draw();
    }
}

// 全局图表管理器实例
window.chartManager = new ChartManager();

// 负载历史图表管理
window.loadHistoryChart = null;