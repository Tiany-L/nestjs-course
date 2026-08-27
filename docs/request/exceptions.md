---
title: 内置异常
description: 用 NestJS HttpException 家族将已知业务失败映射为准确的 HTTP 状态码。
---

# 内置异常

## 学习目标

- 将可预期业务失败映射为明确的 HTTP 语义。
- 区分 400、401、403、404、409 和 500。
- 让 Service 抛出语义化异常，而不是返回失败标记。

## 前置知识

已理解 Controller 与 Service 责任边界，并能识别资源不存在、未认证和权限不足等场景。

## 原理

Nest 可以把 `HttpException` 及其子类转换成 HTTP 错误响应。已知失败应在最了解语义的 Service 层抛出；未知编程错误则保留为 500，并在服务端记录。

| 异常 | 状态 | 典型场景 |
| --- | --- | --- |
| `BadRequestException` | 400 | 语义不合法的输入 |
| `UnauthorizedException` | 401 | 缺少或无效身份 |
| `ForbiddenException` | 403 | 已认证但无权 |
| `NotFoundException` | 404 | 资源不存在 |
| `ConflictException` | 409 | 唯一约束或状态冲突 |

## 示例代码

```ts
async findOne(id: number) {
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  return user;
}
```

```ts
if (order.status === OrderStatus.PAID) {
  throw new ConflictException('订单已支付，不能取消');
}
```

## 常见错误

- 对所有失败都抛 `BadRequestException`，丢失资源、认证和冲突语义。
- 捕获所有异常后重新抛 500，覆盖原本准确的 404 或 409。
- 将底层 SQL、堆栈或内部文件路径返回客户端。

## 本节总结

异常是失败语义的载体。越精确的状态码越能让客户端、监控和调试正确理解系统状态。

## 下一步

学习 [Interceptor](/request/interceptors)，在 Controller 执行前后统一处理正常请求。
