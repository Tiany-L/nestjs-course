---
title: 密码与 bcrypt
description: 用 bcrypt 安全哈希密码，理解 salt、cost 和登录比较的正确边界。
---

# 密码与 bcrypt

## 学习目标

- 理解密码哈希与加密的区别。
- 在注册时哈希密码，在登录时执行安全比较。
- 根据服务器能力调整 bcrypt cost。

## 前置知识

已完成 Users CRUD，并知道敏感数据不应出现在日志、DTO 返回值或 JWT 中。

## 原理

bcrypt 是专门为密码设计的慢哈希函数。它为每个密码使用随机 salt，并通过 cost 控制计算成本。密码不会被“解密”，登录时只能使用 `compare()` 检查候选值。

```text
注册：明文密码 → bcrypt.hash → 保存哈希
登录：候选密码 + 已存哈希 → bcrypt.compare → true / false
```

## 示例代码

```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

```ts
import * as bcrypt from 'bcrypt';

const passwordHash = await bcrypt.hash(dto.password, 12);
const matched = await bcrypt.compare(dto.password, user.passwordHash);
```

cost `12` 只是起点。应在目标硬件上测量响应时间，并为登录接口同时配置限流。

## 常见错误

- 明文存储密码，或使用通用快速哈希 SHA-256 直接存储密码。
- 自己生成和复用固定 salt，破坏 bcrypt 每条记录独立 salt 的设计。
- 将 cost 设得过低或盲目设得过高，没有在目标硬件上压测。

## 本节总结

密码应被单向慢哈希，不应被可逆加密或明文保存。bcrypt 的 cost 是需要持续校准的安全与性能参数。

## 下一步

进入 [AuthModule 登录边界](/auth/auth-module)，组合用户查询、密码比较与统一的失败响应。
