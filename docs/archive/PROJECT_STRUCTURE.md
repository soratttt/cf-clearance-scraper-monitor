# CF-Clearance-Scraper 项目结构

## 目录说明

```
cf-clearance-scraper/
├── src/                        # 主要源代码
│   ├── index.js               # 主入口文件
│   ├── endpoints/             # API 端点
│   │   └── captcha.js        # 统一验证码处理端点
│   ├── module/                # 核心模块
│   └── utils/                 # 工具函数
├── captcha-solvers/           # 验证码解决器模块
│   ├── hcaptcha/             # hCaptcha 解决器
│   │   ├── hcaptcha_challenger/  # hCaptcha 核心代码
│   │   ├── solver.py         # Python 解决器脚本
│   │   ├── endpoint.js       # Node.js 端点
│   │   ├── setup.py          # 环境设置脚本
│   │   └── venv/             # Python 虚拟环境
│   ├── turnstile/            # Turnstile 解决器
│   │   ├── solveTurnstile.min.js
│   │   └── solveTurnstile.max.js
│   └── common/               # 通用功能
│       ├── getSource.js
│       └── wafSession.js
├── monitor/                   # 监控界面
├── tests/                     # 测试文件
└── docs/                      # 文档
```

## API 端点

### 统一验证码接口
- `POST /captcha` - 统一的验证码解决接口，根据 type 参数调用相应解决器

### 特定验证码接口
- `POST /hcaptcha` - hCaptcha 解决器
- `POST /cftoken` - Cloudflare Turnstile 解决器
- `POST /cf-clearance-scraper` - 原始格式的 Clearance 解决器

## 设置步骤

1. 运行项目设置脚本：
   ```bash
   python3 setup.py
   ```

2. 启动服务：
   ```bash
   npm start
   ```

## 模块说明

### hCaptcha 解决器
- 位置：`captcha-solvers/hcaptcha/`
- 独立的 Python 虚拟环境
- 基于 hcaptcha-challenger 库
- 支持代理配置

### Turnstile 解决器
- 位置：`captcha-solvers/turnstile/`
- Node.js 实现
- 支持 min 和 max 两种模式

### 通用功能
- 位置：`captcha-solvers/common/`
- 页面源码获取
- WAF 会话处理
