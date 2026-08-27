---
title: RBAC
description: 通过 @Roles Metadata 和 RolesGuard 实现基于角色的访问控制，并区分 401 与 403。
---

# RBAC

## 学习目标

- 用 `@Roles()` 声明路由需要的角色。
- 在 RolesGuard 中读取 Metadata 和当前用户角色。
- 准确区分未认证的 401 与已认证但无权的 403。

## 前置知识

AuthGuard 已经在 RolesGuard 之前完成认证，并将包含 `role` 的 Payload 写入 `request.user`。

## 原理

RBAC 把权限绑定到角色，路由只声明允许的角色。`@Roles()` 写入 Metadata，RolesGuard 使用 `Reflector` 读取并与 `request.user.role` 比较。

```text
无有效身份 → AuthGuard → 401 Unauthorized
已有效身份但角色不符 → RolesGuard → 403 Forbidden
```

JWT 中的角色是签发时快照。如果角色变更需要立即生效，应使用短期 Token，或在高风险操作中查询数据库/Redis 的最新权限。

## 示例代码

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```ts
canActivate(context: ExecutionContext) {
  const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
  if (!required?.length) return true;

  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return required.includes(request.user.role);
}
```

```ts
@Roles(Role.ADMIN)
@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {}
```

RolesGuard 应作为第二个 `APP_GUARD` 在 AuthGuard 之后注册。返回 `false` 时 Nest 会产生 403。

## 常见错误

- 在 RolesGuard 之前没有完成认证，导致 `request.user` 不存在。
- 把无权访问返回为 401，混淆身份失效与权限不足。
- 只依赖长期 JWT 中的角色，却要求角色变更立即生效。

## 本节总结

AuthGuard 确定“你是谁”，RolesGuard 确定“你能否执行这个动作”。Metadata 让权限要求靠近路由，Guard 让执行逻辑保持统一。

## 下一步

进入 [内置异常](/request/exceptions)，统一理解业务失败如何变成 HTTP 错误响应。
