---
title: 当前用户创建订单
description: 从已验证 JWT 中获取 userId，由服务器决定订单归属并使用 Prisma connect 创建关联。
---

# 当前用户创建订单

## 学习目标

- 用 `@CurrentUser('sub')` 获取可信的当前用户 ID。
- 不允许客户端通过 DTO 指定订单归属。
- 使用 Prisma `connect` 建立订单与用户关系。

## 前置知识

已完成 User 1:N Order 模型，且 AuthGuard 保证 `request.user.sub` 来自已验证 JWT。

## 原理

客户端可以决定“买什么”，但不能决定“订单属于谁”。资源归属必须来自服务器已验证的身份上下文。

```text
Bearer Token → AuthGuard → request.user.sub
Body → CreateOrderDto
两者在 OrdersService 中组合为持久化数据
```

## 示例代码

```ts
export class CreateOrderDto {
  @IsString()
  productName!: string;

  @IsInt()
  @Min(1)
  amount!: number;
}
```

```ts
@Post()
create(
  @CurrentUser('sub') userId: number,
  @Body() dto: CreateOrderDto,
) {
  return this.ordersService.create(userId, dto);
}
```

```ts
return this.prisma.order.create({
  data: {
    productName: dto.productName,
    amount: dto.amount,
    user: { connect: { id: userId } },
  },
});
```

## 常见错误

- 在 `CreateOrderDto` 中暴露 `userId`，允许用户为他人创建订单。
- 仅在 Controller 中检查归属，而业务 Service 被其他入口调用时缺少边界。
- 信任可被客户端修改的自定义 Header 作为用户身份。

## 本节总结

资源归属是服务器安全边界。DTO 描述客户端可控的输入，当前用户 ID 来自已验证上下文。

## 下一步

学习 [分页、搜索与 Query DTO](/project/query-pagination)，只返回当前用户可见的订单集合。
