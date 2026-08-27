---
title: AuthModule 登录边界
description: 将登录 DTO、账号查询、bcrypt 比较和通用失败响应收口到 AuthModule。
---

# AuthModule 登录边界

## 学习目标

- 将认证用例与 Users 资源管理分开。
- 为登录输入建立独立 DTO。
- 用统一失败信息减少账号枚举风险。

## 前置知识

已安全存储用户密码，并能通过 `UsersService` 根据邮箱查找用户。

## 原理

UsersModule 回答“用户资源如何管理”，AuthModule 回答“如何证明请求者的身份”。登录用例根据唯一账号标识查询用户，比较密码，并在成功时进入 Token 签发阶段。

```text
POST /auth/login
→ LoginDto
→ UsersService.findByEmail()
→ bcrypt.compare()
→ 成功：签发 Token
→ 失败：401 邮箱或密码错误
```

## 示例代码

```ts
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
```

```ts
async validateCredentials(dto: LoginDto) {
  const user = await this.usersService.findByEmail(dto.email);
  const matched = user
    ? await bcrypt.compare(dto.password, user.passwordHash)
    : false;

  if (!user || !matched) {
    throw new UnauthorizedException('邮箱或密码错误');
  }

  return user;
}
```

## 常见错误

- 分别返回“用户不存在”和“密码错误”，帮助攻击者枚举有效账号。
- 把密码哈希随用户对象返回 Controller。
- 把登录失败当作 404；对客户端而言，这是认证失败，应返回 401。

## 本节总结

AuthModule 是认证用例的边界：校验登录输入、查找账号、比较密码，并对外暴露最少的失败信息。

## 下一步

学习 [JWT](/auth/jwt)，将已验证身份编码成可验证的短期访问凭据。
