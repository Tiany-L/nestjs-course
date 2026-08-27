---
title: '@CurrentUser'
description: 使用自定义参数装饰器从 request.user 提取当前用户或指定字段。
---

# @CurrentUser

## 学习目标

- 理解 AuthGuard 与参数装饰器之间的数据交接。
- 封装 `request.user` 读取逻辑。
- 区分当前身份 ID 与客户端提交的用户 ID。

## 前置知识

AuthGuard 已完成 JWT 验证，并保证保护路由的 `request.user` 存在。

## 原理

`createParamDecorator()` 创建的装饰器在 Controller 参数解析时执行。它不负责验证 Token，只读取 AuthGuard 已放入请求上下文的 Payload。

```text
AuthGuard verifyAsync()
→ request.user = payload
→ @CurrentUser('sub')
→ Controller 获得当前用户 ID
```

## 示例代码

```ts
export const CurrentUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return field ? request.user[field] : request.user;
  },
);
```

```ts
@Get('profile')
getProfile(@CurrentUser() user: AccessTokenPayload) {
  return this.usersService.findOne(user.sub);
}

@Get('orders')
findMyOrders(@CurrentUser('sub') userId: number) {
  return this.ordersService.findByUser(userId);
}
```

## 常见错误

- 在未受 AuthGuard 保护的公开路由上盲目读取 `request.user`。
- 从 `@Body()` 或 `@Query()` 接收 `userId` 来决定资源归属。
- 让装饰器查询数据库或执行业务逻辑，破坏其只负责参数提取的边界。

## 本节总结

`@CurrentUser` 是请求上下文的读取器，不是认证器。它让 Controller 不再重复解析 Request，并让当前身份的来源更清晰。

## 下一步

进入 [RBAC](/auth/rbac)，在已认证身份之上增加角色级授权。
