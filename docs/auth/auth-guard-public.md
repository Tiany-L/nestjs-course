---
title: AuthGuard 与 @Public
description: 用全局 APP_GUARD 验证 Bearer Token，并通过 Metadata 为公开路由显式豁免。
---

# AuthGuard 与 @Public

## 学习目标

- 从 Authorization Header 安全提取 Bearer Token。
- 在 Guard 中验证 JWT 并把 Payload 写入 `request.user`。
- 用全局 Guard + `@Public()` 建立默认保护的路由策略。

## 前置知识

已能签发短期 JWT，并理解装饰器可以写入 Metadata。

## 原理

Guard 在 Controller 之前回答“这个请求能否进入”。将 AuthGuard 注册为 `APP_GUARD` 后，默认所有路由都需要认证；`@Public()` 只对必须匿名访问的登录、健康检查等路由开放。

```text
@Public()
→ SetMetadata(IS_PUBLIC_KEY, true)
→ Reflector 读取方法或 Controller Metadata
→ AuthGuard 跳过 JWT 验证
```

## 示例代码

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```ts
async canActivate(context: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
  if (isPublic) return true;

  const request = context.switchToHttp().getRequest<RequestWithUser>();
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) throw new UnauthorizedException();

  try {
    request.user = await this.jwtService.verifyAsync(token);
  } catch {
    throw new UnauthorizedException();
  }
  return true;
}
```

```ts
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

## 常见错误

- 只把 AuthGuard 放进 `providers` 就以为它已经全局执行。
- 对 Token 验证失败不做捕获，泄露底层 JWT 错误细节。
- 采用“默认公开、逐个加 Guard”，新增路由时容易忘记保护。

## 本节总结

全局 AuthGuard 建立默认拒绝边界，`@Public()` 用 Metadata 显式记录豁免意图。验证成功后，`request.user` 成为后续授权的身份上下文。

## 下一步

学习 [@CurrentUser](/auth/current-user)，把 `request.user` 以显式、可复用的方式交给 Controller 参数。
