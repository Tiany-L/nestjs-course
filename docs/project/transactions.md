---
title: 事务
description: 使用 Prisma 批量事务和交互式事务保证多步数据库操作的原子性。
---

# 事务

## 学习目标

- 判断什么时候需要事务。
- 区分 `$transaction([])` 和交互式 `$transaction(async tx => {})`。
- 保持事务短小，避免在事务中执行外部网络请求。

## 前置知识

已会使用 Prisma 执行查询和写入，并能识别“全部成功或全部失败”的业务不变量。

## 原理

事务保证一组数据库操作作为一个原子单元提交或回滚。已经确定的独立 Prisma Promise 可以使用数组形式；前一步结果会影响后一步或中间需要分支/抛错时，使用交互式事务。

## 示例代码

```ts
return this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });

  await tx.user.update({
    where: { id: userId },
    data: { orderCount: { increment: 1 } },
  });

  return order;
});
```

```ts
const [list, total] = await this.prisma.$transaction([
  this.prisma.order.findMany({ where, skip, take }),
  this.prisma.order.count({ where }),
]);
```

```text
函数正常返回 → COMMIT
函数抛出异常 → ROLLBACK
```

## 常见错误

- 事务回调内仍使用 `this.prisma`，而不是事务客户端 `tx`。
- 在事务中发送邮件或调用远程 API，长时间占用数据库连接和锁。
- 认为事务会自动解决所有并发更新；隔离级别、唯一约束和乐观锁仍需要单独设计。

## 本节总结

事务用来保护真实业务不变量，不是所有查询的默认包装。选择最简单的事务形式，并尽量缩短持有连接的时间。

## 下一步

进入 [Swagger / OpenAPI](/engineering/swagger)，把已稳定的 HTTP 契约生成可交互的接口文档。
