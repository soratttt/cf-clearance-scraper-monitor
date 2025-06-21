#!/usr/bin/env python3
"""
hCaptcha 依赖安装脚本
直接安装到本机Python环境，避免虚拟环境复杂性
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """执行命令并处理错误"""
    print(f"[EXEC] {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"[OK] {description} 成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {description} 失败:")
        print(f"   错误码: {e.returncode}")
        print(f"   错误信息: {e.stderr}")
        return False

def check_python_version():
    """检查Python版本"""
    version = sys.version_info
    print(f"[PYTHON] Python版本: {version.major}.{version.minor}.{version.micro}")
    
    if version < (3, 10):
        print("[ERROR] 需要Python 3.10或更高版本")
        return False
    
    print("[OK] Python版本符合要求")
    return True

def install_pip_packages():
    """安装Python包"""
    packages = [
        "hcaptcha-challenger",
        "playwright",
        "opencv-python",
        "numpy",
        "pillow",
        "google-genai",
        "httpx[http2]",
        "loguru",
        "pydantic-settings",
        "python-dotenv",
        "asyncio",
        "pathlib"
    ]
    
    print("[INSTALL] 安装Python包...")
    
    # 先升级pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "升级pip"):
        return False
    
    # 批量安装包
    packages_str = " ".join(f'"{pkg}"' for pkg in packages)
    command = f"{sys.executable} -m pip install {packages_str}"
    
    if not run_command(command, "安装Python包"):
        print("[ERROR] 批量安装失败，尝试逐个安装...")
        
        # 逐个安装
        failed_packages = []
        for package in packages:
            if not run_command(f"{sys.executable} -m pip install \"{package}\"", f"安装 {package}"):
                failed_packages.append(package)
        
        if failed_packages:
            print(f"[ERROR] 以下包安装失败: {', '.join(failed_packages)}")
            return False
    
    return True

def install_playwright_browsers():
    """安装Playwright浏览器"""
    return run_command("playwright install chromium", "安装Playwright浏览器")

def test_imports():
    """测试关键包导入"""
    print("[TEST] 测试包导入...")
    
    test_packages = [
        ("hcaptcha_challenger", "hCaptcha Challenger"),
        ("playwright", "Playwright"),
        ("cv2", "OpenCV"),
        ("numpy", "NumPy"),
        ("PIL", "Pillow"),
        ("google.genai", "Google GenAI"),
        ("httpx", "HTTPX"),
        ("loguru", "Loguru"),
        ("pydantic", "Pydantic"),
        ("dotenv", "Python-dotenv")
    ]
    
    failed_imports = []
    for package_name, display_name in test_packages:
        try:
            __import__(package_name)
            print(f"  [OK] {display_name}")
        except ImportError as e:
            print(f"  [ERROR] {display_name}: {e}")
            failed_imports.append(display_name)
    
    if failed_imports:
        print(f"[ERROR] 以下包导入失败: {', '.join(failed_imports)}")
        return False
    
    print("[OK] 所有包导入成功")
    return True

def create_env_example():
    """创建环境变量示例文件"""
    env_content = """# hCaptcha 配置示例
# 复制为 .env 并填入你的配置

# Gemini API 密钥（必需）
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 可选：多个 Gemini API 密钥（逗号分隔）
# GEMINI_API_KEYS=key1,key2,key3

# 可选：指定 Python 路径
# HCAPTCHA_PYTHON_PATH=/usr/bin/python3
# PYTHON_PATH=/usr/bin/python3

# 可选：强制使用虚拟环境
# USE_VENV=false

# 可选：日志级别
PYTHON_LOG_LEVEL=CRITICAL

# 可选：超时设置（毫秒）
HCAPTCHA_SOLVER_TIMEOUT=300000
HCAPTCHA_PAGE_TIMEOUT=30000
"""
    
    root_dir = Path(__file__).parent.parent.parent
    env_example_path = root_dir / '.env.example'
    
    try:
        with open(env_example_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"[OK] 创建环境变量示例文件: {env_example_path}")
        return True
    except Exception as e:
        print(f"[ERROR] 创建环境变量示例文件失败: {e}")
        return False

def main():
    """主安装流程"""
    print("[START] hCaptcha 依赖安装脚本")
    print("=" * 50)
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装Python包
    if not install_pip_packages():
        print("[ERROR] Python包安装失败")
        sys.exit(1)
    
    # 安装Playwright浏览器
    if not install_playwright_browsers():
        print("[WARN] Playwright浏览器安装失败，但不影响主要功能")
    
    # 测试导入
    if not test_imports():
        print("[ERROR] 包导入测试失败")
        sys.exit(1)
    
    # 创建环境变量示例
    create_env_example()
    
    print("\n" + "=" * 50)
    print("[SUCCESS] 安装完成！")
    print("\n[LIST] 下一步:")
    print("1. 复制 .env.example 为 .env")
    print("2. 在 .env 中配置你的 GEMINI_API_KEY")
    print("3. 启动服务并测试 hCaptcha 解决功能")
    print("\n[INFO] 提示:")
    print("- 无需创建虚拟环境，直接使用本机Python")
    print("- 如需指定Python路径，设置 HCAPTCHA_PYTHON_PATH 环境变量")
    print("- 如仍想使用虚拟环境，设置 USE_VENV=true")

if __name__ == "__main__":
    main()