# hCaptcha 解决器

[START] 基于 hcaptcha-challenger 的强大 hCaptcha 解决方案，使用本机环境安装，简化部署流程。

## 特点

[OK] **简化安装** - 无需虚拟环境，直接使用本机Python  
[OK] **智能切换** - 支持本机环境和虚拟环境灵活切换  
[OK] **AI驱动** - 基于多模态大语言模型的验证码解决  
[OK] **环境变量配置** - 统一的配置管理

## 快速开始

### 1. 安装依赖

```bash
# 运行自动安装脚本
python3 install_dependencies.py
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp ../../.env.example ../../.env

# 编辑配置文件，添加你的 Gemini API 密钥
nano ../../.env
```

在 `.env` 文件中配置：
```bash
# 必需：Gemini API 密钥
GEMINI_API_KEY=your_actual_gemini_api_key_here

# 可选：多个API密钥（逗号分隔，随机选择）
GEMINI_API_KEYS=key1,key2,key3

# 可选：自定义Python路径
HCAPTCHA_PYTHON_PATH=/usr/bin/python3
```

### 3. 测试配置

```bash
python3 test_config.py
```

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `HCAPTCHA_PYTHON_PATH` | 指定Python路径 | `python3`/`python` |
| `USE_VENV` | 是否使用虚拟环境 | `false` |
| `PYTHON_LOG_LEVEL` | Python日志级别 | `CRITICAL` |
| `HCAPTCHA_SOLVER_TIMEOUT` | 解决超时时间(ms) | `300000` |
| `HCAPTCHA_PAGE_TIMEOUT` | 页面加载超时(ms) | `30000` |

## 使用方式

### API调用示例

```javascript
POST /solve-hcaptcha
Content-Type: application/json

{
  "type": "hcaptcha",
  "websiteUrl": "https://example.com",
  "websiteKey": "your-site-key",
  "proxy": "host:port:username:password" // 可选
}
```

### 响应示例

```javascript
{
  "code": 200,
  "message": "hCaptcha solved successfully",
  "token": "P1_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 故障排除

### 1. Python包安装失败
```bash
# 升级pip
python3 -m pip install --upgrade pip

# 逐个安装失败的包
python3 -m pip install hcaptcha-challenger
python3 -m pip install playwright
playwright install chromium
```

### 2. 指定Python版本
```bash
# 在环境变量中指定
export HCAPTCHA_PYTHON_PATH=/usr/bin/python3.11

# 或在.env文件中设置
HCAPTCHA_PYTHON_PATH=/usr/bin/python3.11
```

### 3. 使用虚拟环境（可选）
```bash
# 设置环境变量强制使用虚拟环境
export USE_VENV=true

# 或创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
python3 install_dependencies.py
```

## 技术架构

- **Node.js 接口** - 统一的RESTful API
- **Python解决器** - 基于hcaptcha-challenger的AI解决方案
- **本机环境优先** - 简化部署，减少环境问题
- **配置驱动** - 灵活的环境变量控制


![hcaptcha-challenger-demo](https://github.com/QIN2DIM/img_pool/blob/main/img/hcaptcha-challenger3.gif)

## Introduction

Does not rely on any Tampermonkey script.

Does not use any third-party anti-captcha services.

Just implement some interfaces to make `AI vs AI` possible.

**Documentation:** [English](./docs/README.md) | [简体中文](./docs/README_zh.md) | [Русский 🇷🇺](./docs/README_ru.md) | [Tiếng Việt](./docs/README_vi.md) 🙌

## What's features

| Challenge Type                          | Pluggable Resource                                           | Agent Capability |
| --------------------------------------- | ------------------------------------------------------------ | ---------------- |
| `image_label_binary`                    | ResNet  ONNX classification [#220401](https://github.com/QIN2DIM/hcaptcha-challenger/issues?q=label%3A%22%F0%9F%94%A5+challenge%22+) | [OK]                |
| `image_label_area_select: point`        | YOLOv8 ONNX detection  [#230826](https://github.com/QIN2DIM/hcaptcha-challenger/issues/588) | [OK]                |
| `image_label_area_select: bounding box` | YOLOv8 ONNX segmentation  [#230828](https://github.com/QIN2DIM/hcaptcha-challenger/issues/592) | -                |
| `image_label_multiple_choice`           | ViT ONNX zero-shot motion [#231109](https://github.com/QIN2DIM/hcaptcha-challenger/issues/917) | -                |
| `image_drag_drop`                       | Spatial Chain-of-Thought [#250401](https://github.com/QIN2DIM/hcaptcha-challenger/issues/995) | [OK]                |

| Advanced Task               | Pluggable Resource                                           |
| --------------------------- | ------------------------------------------------------------ |
| `Rank.Strategy`             | nested-model-zoo [#231006](https://github.com/QIN2DIM/hcaptcha-challenger/issues/797) |
| `self-supervised challenge` | CLIP-ViT [#231022](https://github.com/QIN2DIM/hcaptcha-challenger/issues/858) |
| `Agentic Workflow`          | AIOps Multimodal Large language model [#250331](https://github.com/QIN2DIM/hcaptcha-challenger/pull/980) |

## Workflow

| Tasks                         | Resource                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `ci: sentinel`                | [![hCAPTCHA Sentinel](https://github.com/QIN2DIM/hcaptcha-challenger/actions/workflows/sentinel.yaml/badge.svg?branch=main)](https://github.com/QIN2DIM/hcaptcha-challenger/actions/workflows/sentinel.yaml) |
| `ci: collector`               | [![hCAPTCHA Collector](https://github.com/QIN2DIM/hcaptcha-challenger/actions/workflows/collector.yaml/badge.svg)](https://github.com/QIN2DIM/hcaptcha-challenger/actions/workflows/collector.yaml) |
| `datasets: VCS, annoate`      | [#roboflow](https://app.roboflow.com/), [#model-factory](https://github.com/beiyuouo/hcaptcha-model-factory) |
| `model: ResNet - train / val` | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/captcha-challenger/hcaptcha-model-factory/blob/main/automation/roboflow_resnet.ipynb) |
| `model: YOLOv8 - train / val` | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/QIN2DIM/hcaptcha-challenger/blob/main/automation/roboflow_yolov8.ipynb) |
| `model: upload, upgrade`      | [#objects](https://github.com/QIN2DIM/hcaptcha-challenger/tree/main/src), [#modelhub](https://github.com/QIN2DIM/hcaptcha-challenger/releases/tag/model) |
| `datasets: public, archive`   | [#roboflow-universe](https://universe.roboflow.com/qin2dim/), [#captcha-datasets](https://github.com/captcha-challenger/hcaptcha-whistleblower) |

## Contributors
I would like to express my sincere gratitude to all the contributors.

[![](https://opencollective.com/hcaptcha-challenger/contributors.svg?width=890&button=false)](https://github.com/QIN2DIM/hcaptcha-challenger/graphs/contributors)

## What's next

- [Dislock](https://github.com/Vinyzu/DiscordGenerator), the most advanced Discord Browser Generator. Powered by hCaptcha Solving AI.
- [undetected-playwright](https://github.com/QIN2DIM/undetected-playwright), stash the fingerprint of playwright-based web agents.
- [epic-awesome-gamer](https://github.com/QIN2DIM/epic-awesome-gamer), gracefully claim weekly free games from Epic Store.

## Reference

- [Microsoft/playwright-python](https://github.com/microsoft/playwright-python)
- [Anthropic/MCP](https://github.com/modelcontextprotocol)
- [Google/A2A](https://github.com/google/A2A)
- [Google/Gemini](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro-preview-03-25)
