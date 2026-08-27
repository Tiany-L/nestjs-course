---
title: JWT
description: 在 NestJS 中签发与验证短期 JWT Access Token，理解 payload、sub、签名和密钥边界。
---

# JWT

## 学习目标

- 理解 JWT 是签名凭据，而不是加密容器。
- 用 `sub` 表示当前身份主体。
- 通过 `ConfigService` 注入密钥并限制 Access Token 有效期。

## 前置知识

已完成登录凭据校验，且应用启动时会校验 `JWT_SECRET` 至少 32 个字符。

## 原理

JWT 由 Header、Payload 和 Signature 组成。Payload 可以被任何拿到 Token 的人解码；Signature 用来验证内容是否被篡改。

```text
登录成功
→ 组装最小 Payload
→ JwtService.signAsync()
→ accessToken
→ 客户端后续携带 Bearer Token
```

`sub` 是 JWT 标准 Claim `subject`，适合存放稳定的用户 ID。不要把密码、密钥、数据库连接串或其他敏感信息放入 Payload。

## 示例代码

```bash
pnpm add @nestjs/jwt
```

```ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow<string>('JWT_SECRET'),
    signOptions: { expiresIn: '15m' },
  }),
});
```

```ts
type AccessTokenPayload = {
  sub: number;
  email: string;
  role: Role;
};

const payload: AccessTokenPayload = {
  sub: user.id,
  email: user.email,
  role: user.role,
};

const accessToken = await this.jwtService.signAsync(payload);
```

## 常见错误

- 把 JWT Payload 当作不可见的加密数据。
- 使用过短、可预测或提交到 Git 的 Secret。
- 给 Access Token 设置过长有效期，却没有撤销或 Refresh Token 策略。

## 本节总结

JWT 只能证明一份有限时的签名声明未被篡改。Payload 应最小化，Access Token 应短期化，Secret 应由配置边界管理。

## 下一步

进入 [AuthGuard 与 @Public](/auth/auth-guard-public)，在请求到达 Controller 前验证 Token 并建立默认保护策略。
