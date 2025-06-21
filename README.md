# CF Clearance Scraper

本地版本的 Cloudflare 保护绕过工具，支持 Turnstile 令牌生成、WAF 会话创建以及 hCaptcha AI 自动解决。

## 📸 项目展示

![本地打码服务监控](assets/dashboard.png)
> 实时监控面板展示服务状态、性能指标和请求统计，支持 CPU、内存监控和双折线图表

## 版本信息

**当前版本：v1.0.4** 🚀

### 版本记录

| 版本 | 发布时间 | 主要更新 |
|------|----------|----------|
| **v1.0.4** | 2025-06-21 | 🔧 **重大优化更新**<br/>🐛 修复 Turnstile 上下文池 Cookie 持久化问题<br/>🎯 统一 Python 依赖管理（hCaptcha + reCAPTCHA）<br/>⚡ 智能 Python 版本检测和自动升级（3.10+）<br/>🛠️ 增强一键部署脚本（Mac + Windows）<br/>📦 本机环境优先，简化虚拟环境依赖<br/>🔍 完善依赖测试和错误处理机制<br/>📋 创建统一 requirements.txt 依赖文件 |
| **v1.0.3** | 2025-06 | ✨ 新增 hCaptcha 本地AI打码功能<br/>🔑 支持多个 Gemini API 密钥轮换使用<br/>⚡ 优化内存管理和系统性能监控<br/>📊 增强实时监控面板<br/>🚀 完善一键部署脚本，支持Python环境自动配置<br/>🛠️ 重构文档结构，提升用户体验 |
| **v1.0.2** | 2025-05 | 🔧 优化 Turnstile 解决算法<br/>📈 改进监控系统稳定性<br/>🐛 修复内存泄漏问题 |
| **v1.0.1** | 2025-04 | 🎯 初始版本发布<br/>✅ 基础 Cloudflare 绕过功能<br/>📊 实时监控面板 |

## 致谢开发者

本项目基于以下优秀开源项目构建：

- [QIN2DIM/hcaptcha-challenger](https://github.com/QIN2DIM/hcaptcha-challenger) - hCaptcha AI解决方案
- [ZFC-Digital/cf-clearance-scraper](https://github.com/ZFC-Digital/cf-clearance-scraper) - Cloudflare绕过基础

## 支持功能

| 功能类型 | 支持状态 | 说明 |
|---------|---------|------|
| **Cloudflare Turnstile** | ✅ | 支持轻量级和完整页面模式 |
| **hCaptcha 自动解决** | ✅ | 基于 Google Gemini AI 模型 |
| **reCAPTCHA v2** | ✅ | 支持音频和图像挑战解决 |
| **reCAPTCHA v3** | ✅ | 支持网络监听和分数优化 |
| **实时监控面板** | ✅ | 服务状态和性能指标监控 |
| **代理支持** | ✅ | HTTP/HTTPS 代理配置 |

## 文档指南

| 文档 | 功能说明 | 适用场景 |
|------|---------|----------|
| [📦 部署文档](docs/INSTALLATION.md) | 一键部署和手动安装步骤 | 初次使用 |
| [🔧 API文档](docs/API.md) | 完整的接口使用说明和示例 | 开发集成 |
| [⚙️ 配置指南](docs/CONFIGURATION.md) | 统一配置系统、参数调优和监控 | 环境配置 |
| [🛠️ 故障排除](docs/TROUBLESHOOTING.md) | 常见问题诊断和解决方案 | 问题解决 |

## 免责声明

⚠️ 本工具仅用于测试和学习目的。使用者需对任何可能产生的法律责任承担责任。本库不意图对任何网站或公司造成损害，使用者对可能产生的任何损害承担责任。

## 许可证

ISC License - 详见 [LICENSE](LICENSE.md) 文件