---
title: User 1:N Order
description: 在 Prisma 中建模 User 与 Order 的一对多关系，理解 Relation Field、外键与索引。
---

# User 1:N Order

## 学习目标

- 在 Prisma Schema 中建立一对多关系。
- 区分 Prisma Relation Field 与 MySQL 真实列。
- 为外键查询和删除行为做明确设计。

## 前置知识

已会使用 Prisma Model、Migration 和 CRUD API，并了解 MySQL 主键与外键。

## 原理

一个 User 可以拥有多个 Order，每个 Order 必须属于一个 User。外键存在于“多”的一侧：`Order.userId` 是 MySQL 真实列，`User.orders` 是 Prisma 用于导航关系的字段。

```text
User.id ← Order.userId
一个 User 对应多个 Order
```

## 示例代码

```prisma
model User {
  id     Int     @id @default(autoincrement())
  orders Order[]
}

model Order {
  id          Int    @id @default(autoincrement())
  productName String
  amount      Int
  userId      Int
  user        User   @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([userId])
}
```

```ts
const userWithOrders = await this.prisma.user.findUnique({
  where: { id: userId },
  include: { orders: true },
});
```

`onDelete` 必须与业务规则一致。教程默认使用 `Restrict`，防止无意删除已有订单的用户。

## 常见错误

- 认为 `User.orders` 是 MySQL 中的 JSON 列。
- 只定义 `userId` 而不定义 Prisma Relation Field，失去关联查询能力。
- 未明确 `onDelete` 语义就在生产数据上使用级联删除。

## 本节总结

关联字段表达对象导航，外键列保存真实归属。索引和删除行为应与关系一起设计。

## 下一步

学习 [当前用户创建订单](/project/current-user-orders)，把关联归属与认证身份绑定。
