const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv()
addFormats(ajv)

const schema = {
    "type": "object",
    "properties": {
        // 新的参数格式
        "type": {
            "type": "string",
            "enum": ["cftoken", "cfcookie", "recaptchav2", "recaptchav3", "waf-session"] // 添加 waf-session
        },
        "websiteUrl": {
            "type": "string",
            "format": "uri"
        },
        "websiteKey": {
            "type": "string"
        },
        // 兼容旧的参数格式
        "mode": {
            "type": "string",
            "enum": ["source", "turnstile-min", "turnstile-max", "waf-session", "cfcookie", "recaptchav2", "recaptchav3"]
        },
        "url": {
            "type": "string",
            "format": "uri"
        },
        "siteKey": {
            "type": "string"
        },
        "proxy": {
            "type": "object",
            "properties": {
                "host": { "type": "string" },
                "port": { "type": "integer" },
                "username": { "type": "string" },
                "password": { "type": "string" }
            },
            "additionalProperties": false
        },
        "authToken": {
            "type": "string"
        },
        // reCAPTCHA 特有参数
        "language": {
            "type": "string",
            "enum": ["en", "es", "fr", "de", "pt", "ru", "it", "nl", "pl"]
        },
        "method": {
            "type": "string",
            "enum": ["audio", "image"]
        },
        "action": {
            "type": "string"
        },
        // WAF Session 特有参数
        "pageAction": {
            "type": "string"
        },
        "userAgent": {
            "type": "string"
        },
        "timeout": {
            "type": "number"
        }
    },
    "anyOf": [
        {
            // 新格式验证 - cftoken
            "required": ["type", "websiteUrl", "websiteKey"],
            "properties": {
                "type": { "const": "cftoken" }
            }
        },
        {
            // 新格式验证 - cfcookie
            "required": ["type", "websiteUrl"],
            "properties": {
                "type": { "const": "cfcookie" }
            }
        },
        {
            // 新格式验证 - recaptchav2
            "required": ["type", "websiteUrl", "websiteKey"],
            "properties": {
                "type": { "const": "recaptchav2" }
            }
        },
        {
            // 新格式验证 - recaptchav3
            "required": ["type", "websiteUrl", "websiteKey"],
            "properties": {
                "type": { "const": "recaptchav3" }
            }
        },
        {
            // 新格式验证 - waf-session
            "required": ["type", "websiteUrl"],
            "properties": {
                "type": { "const": "waf-session" }
            }
        },
        {
            // 旧格式验证
            "required": ["mode", "url"]
        }
    ],
    "additionalProperties": false
}

// Example data formats:
// New format:
// const data = {
//     type: "cftoken",
//     websiteUrl: "https://example.com",
//     websiteKey: "0x4AAAAAABA4JXCaw9E2Py-9"
// }
//
// WAF Session format:
// const data = {
//     type: "waf-session",
//     websiteUrl: "https://stake.krd",
//     authToken: "your-token"
// }
// 
// Old format (still supported):
// const data = {
//     mode: "turnstile-min",
//     url: "https://example.com",
//     siteKey: "0x4AAAAAABA4JXCaw9E2Py-9",
//     proxy: {
//         host: "localhost",
//         port: 8080,
//         username: "test",
//         password: "test"
//     },
//     authToken: "123456"
// }

function validate(data) {
    const valid = ajv.validate(schema, data)
    if (!valid) return ajv.errors
    else return true
}

module.exports = validate
