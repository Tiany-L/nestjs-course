---
title: 安全与工程化
description: 配置 CORS、Helmet、限流、Refresh Token 与结构化日志，补齐 NestJS 生产安全边界。
---

# 安全与工程化

## 学习目标

- 显式限制 CORS 来源并使用 Helmet 安全 Header。
- 为登录等高风险接口配置限流。
- 设计短期 Access Token、可撤销 Refresh Token 和不泄密的日志。

## 前置知识

已完成 JWT 认证、RBAC 与异常处理，并能识别敏感配置和个人数据。

## 原理

安全不是一个 Guard，而是多层边界：浏览器跨域策略、HTTP Header、滥用控制、凭据生命周期、权限实时性和可审计日志。

```text
输入校验 + 认证 + 授权 + 限流 + 安全 Header + 日志 + 密钥管理
```

## 示例代码

```ts
app.use(helmet());
app.enableCors({
  origin: ['https://admin.example.com'],
  credentials: true,
});
```

```ts
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]);
```

```ts
@Throttle({ default: { ttl: 60_000, limit: 5 } })
@Post('login')
login(@Body() dto: LoginDto) {}
```

Refresh Token 应支持轮换与撤销，服务端存储其哈希或会话记录，不应把长期明文 Token 直接持久化。

日志应包含 `requestId`、`userId`、方法、路径、耗时、状态码和错误类型，不记录密码、Secret、完整 Token 或不必要的个人数据。

## 常见错误

- CORS 使用 `*` 同时开启凭据，或把 CORS 误当成非浏览器客户端的访问控制。
- 只为整个应用设置宽松限流，不单独保护登录、验证码和密码重置。
- 将角色放入长期 JWT，却期望数据库中的权限变更立即影响旧 Token。

## 本节总结

安全是多层系统属性。每一层都只降低一类风险，必须通过限流、密钥管理、凭据轮换和可审计日志共同建立。

## 下一步

学习 [生产部署](/engineering/deployment)，把构建、测试、迁移、健康检查和优雅关闭组成发布流程。
