#!/usr/bin/env python3
"""
hCaptcha 配置测试脚本 - 验证本机环境设置
"""
import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*50}")
    print(f"[INFO] {title}")
    print('='*50)

def test_python_environment():
    """测试Python环境"""
    print_section("Python 环境检查")
    
    # Python版本
    version = sys.version_info
    print(f"[PYTHON] Python版本: {version.major}.{version.minor}.{version.micro}")
    print(f"[PATH] Python路径: {sys.executable}")
    
    # 检查版本要求
    if version >= (3, 10):
        print("[OK] Python版本符合要求 (>=3.10)")
    else:
        print("[ERROR] Python版本过低，需要3.10或更高版本")
        return False
    
    # 检查pip
    try:
        import pip
        print(f"[PIP] pip版本: {pip.__version__}")
    except ImportError:
        print("[WARN] pip未安装")
    
    return True

def test_environment_config():
    """测试环境配置"""
    print_section("环境配置检查")
    
    # 加载根目录的统一配置文件
    root_dir = Path(__file__).parent.parent.parent
    env_path = root_dir / '.env'
    print(f"[PATH] 环境文件路径: {env_path}")
    print(f"[CHECK] 文件是否存在: {env_path.exists()}")

    if env_path.exists():
        load_dotenv(env_path, override=True)
        print("[OK] .env 文件加载成功")
    else:
        print("[WARN] .env 文件不存在，请复制 .env.example 并配置")
    
    # 检查API密钥
    api_key = os.getenv('GEMINI_API_KEY')
    api_keys = os.getenv('GEMINI_API_KEYS')
    
    if api_key and api_key != 'your_actual_gemini_api_key_here':
        print(f"[OK] 单个API密钥已配置 (末尾: ...{api_key[-8:]})")
    elif api_keys:
        keys = [k.strip() for k in api_keys.split(',') if k.strip()]
        print(f"[OK] 多个API密钥已配置 ({len(keys)}个)")
    else:
        print("[ERROR] 未配置有效的 Gemini API 密钥")
        return False
    
    # 检查Python路径配置
    python_path = os.getenv('HCAPTCHA_PYTHON_PATH') or os.getenv('PYTHON_PATH')
    if python_path:
        print(f"[CONFIG] 自定义Python路径: {python_path}")
    else:
        print("[DEFAULT] 使用默认Python路径")
    
    # 检查虚拟环境设置
    use_venv = os.getenv('USE_VENV', 'false').lower() == 'true'
    print(f"[VENV] 使用虚拟环境: {'是' if use_venv else '否'}")
    
    return True

def test_package_imports():
    """测试关键包导入"""
    print_section("Python包导入测试")
    
    test_packages = [
        ("hcaptcha_challenger", "hCaptcha Challenger", True),
        ("playwright", "Playwright", True),
        ("cv2", "OpenCV", True),
        ("numpy", "NumPy", True),
        ("PIL", "Pillow", True),
        ("google.genai", "Google GenAI", True),
        ("httpx", "HTTPX", False),
        ("loguru", "Loguru", False),
        ("pydantic", "Pydantic", False),
        ("dotenv", "Python-dotenv", False)
    ]
    
    success_count = 0
    required_count = sum(1 for _, _, required in test_packages if required)
    
    for package_name, display_name, required in test_packages:
        try:
            __import__(package_name)
            print(f"  [OK] {display_name}")
            success_count += 1
        except ImportError as e:
            status = "[ERROR]" if required else "[WARN]"
            print(f"  {status} {display_name}: {e}")
            if required:
                print(f"     [TIP] 安装: python3 -m pip install {package_name.replace('.', '-')}")
    
    print(f"\n[RESULT] 导入结果: {success_count}/{len(test_packages)} 成功")
    return success_count >= required_count

def test_hcaptcha_challenger():
    """测试hcaptcha-challenger功能"""
    print_section("hCaptcha Challenger 功能测试")
    
    try:
        from hcaptcha_challenger import AgentV, AgentConfig
        print("[OK] hcaptcha-challenger 核心类导入成功")
        
        # 测试配置创建
        config = AgentConfig()
        print("[OK] AgentConfig 创建成功")
        
        return True
    except ImportError as e:
        print(f"[ERROR] hcaptcha-challenger 导入失败: {e}")
        print("[TIP] 安装: python3 -m pip install hcaptcha-challenger")
        return False
    except Exception as e:
        print(f"[WARN] hcaptcha-challenger 功能测试异常: {e}")
        return False

def test_playwright():
    """测试Playwright功能"""
    print_section("Playwright 功能测试")
    
    try:
        from playwright.async_api import async_playwright
        print("[OK] Playwright 导入成功")
        
        # 检查浏览器安装
        try:
            result = subprocess.run(['playwright', 'install', '--dry-run'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print("[OK] Playwright 浏览器已安装")
            else:
                print("[WARN] Playwright 浏览器可能未安装")
                print("[TIP] 安装: playwright install chromium")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("[WARN] 无法检查 Playwright 浏览器状态")
        
        return True
    except ImportError as e:
        print(f"[ERROR] Playwright 导入失败: {e}")
        print("[TIP] 安装: python3 -m pip install playwright && playwright install")
        return False

def show_next_steps(all_passed):
    """显示下一步操作"""
    print_section("总结和下一步")
    
    if all_passed:
        print("[SUCCESS] 所有测试通过！环境配置正确。")
        print("\n[NEXT] 下一步操作:")
        print("1. 启动主服务")
        print("2. 测试 hCaptcha 解决功能")
        print("3. 检查日志输出")
    else:
        print("[ERROR] 部分测试失败，请根据上述提示修复问题。")
        print("\n[SUGGEST] 建议操作:")
        print("1. 运行安装脚本: python3 install_dependencies.py")
        print("2. 配置API密钥: 编辑 .env 文件")
        print("3. 重新运行测试: python3 test_config.py")

def main():
    """主测试流程"""
    print("[START] hCaptcha 环境配置测试")
    
    tests = [
        ("Python环境", test_python_environment),
        ("环境配置", test_environment_config),
        ("包导入", test_package_imports),
        ("hCaptcha Challenger", test_hcaptcha_challenger),
        ("Playwright", test_playwright)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"[ERROR] {test_name} 测试异常: {e}")
            results.append((test_name, False))
    
    # 显示测试结果总结
    print_section("测试结果总结")
    all_passed = True
    for test_name, passed in results:
        status = "[OK] 通过" if passed else "[ERROR] 失败"
        print(f"{status}: {test_name}")
        if not passed:
            all_passed = False
    
    show_next_steps(all_passed)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())