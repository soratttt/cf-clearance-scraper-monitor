#!/usr/bin/env python3
"""
CF-Clearance-Scraper 项目设置脚本
统一安装和配置所有验证码解决器
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(command, cwd=None):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=cwd
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def setup_hcaptcha():
    """设置 hCaptcha 解决器"""
    print("设置 hCaptcha 解决器...")
    print("-" * 40)
    
    hcaptcha_dir = Path("captcha-solvers/hcaptcha")
    if not hcaptcha_dir.exists():
        print("✗ hCaptcha 目录不存在")
        return False
    
    # 运行 hCaptcha 设置脚本
    success, stdout, stderr = run_command("python3 setup.py", cwd=hcaptcha_dir)
    if success:
        print("✓ hCaptcha 解决器设置成功")
        print(stdout)
        return True
    else:
        print("✗ hCaptcha 解决器设置失败")
        print(stderr)
        return False


def setup_nodejs():
    """设置 Node.js 依赖"""
    print("设置 Node.js 依赖...")
    print("-" * 40)
    
    # 检查 package.json 是否存在
    if not Path("package.json").exists():
        print("✗ package.json 不存在")
        return False
    
    # 安装 Node.js 依赖
    success, stdout, stderr = run_command("npm install")
    if success:
        print("✓ Node.js 依赖安装成功")
        return True
    else:
        print("✗ Node.js 依赖安装失败")
        print(stderr)
        return False


def create_project_structure_info():
    """创建项目结构说明文件"""
    structure_info = """# CF-Clearance-Scraper 项目结构

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
"""
    
    with open("PROJECT_STRUCTURE.md", "w", encoding="utf-8") as f:
        f.write(structure_info)
    
    print("✓ 项目结构说明文件已创建")


def test_setup():
    """测试设置是否成功"""
    print("测试项目设置...")
    print("-" * 40)
    
    # 测试 Node.js 服务
    print("测试 Node.js 模块...")
    try:
        import subprocess
        result = subprocess.run(
            ["node", "-e", "console.log('Node.js test passed')"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print("✓ Node.js 测试通过")
        else:
            print("✗ Node.js 测试失败")
    except Exception as e:
        print(f"✗ Node.js 测试失败: {e}")
    
    # 测试 hCaptcha 模块
    hcaptcha_venv_python = Path("captcha-solvers/hcaptcha/venv/bin/python")
    if not hcaptcha_venv_python.exists():
        hcaptcha_venv_python = Path("captcha-solvers/hcaptcha/venv/Scripts/python.exe")
    
    if hcaptcha_venv_python.exists():
        print("✓ hCaptcha 虚拟环境已创建")
    else:
        print("✗ hCaptcha 虚拟环境未找到")


def main():
    """主函数"""
    print("CF-Clearance-Scraper 项目设置")
    print("=" * 50)
    
    # 设置 Node.js 依赖
    nodejs_success = setup_nodejs()
    
    # 设置 hCaptcha 解决器
    hcaptcha_success = setup_hcaptcha()
    
    # 创建项目结构说明
    create_project_structure_info()
    
    # 测试设置
    test_setup()
    
    print("=" * 50)
    if nodejs_success and hcaptcha_success:
        print("✓ 项目设置完成！")
        print()
        print("启动服务：")
        print("  npm start")
        print()
        print("API 文档：")
        print("  查看 PROJECT_STRUCTURE.md")
    else:
        print("✗ 项目设置过程中出现错误")
        if not nodejs_success:
            print("  - Node.js 依赖安装失败")
        if not hcaptcha_success:
            print("  - hCaptcha 解决器设置失败")


if __name__ == "__main__":
    main()