---
title: 分页、搜索与 Query DTO
description: 使用 Query DTO 校验分页、搜索和排序输入，并用 Prisma 返回当前用户的订单列表。
---

# 分页、搜索与 Query DTO

## 学习目标

- 将 Query String 显式转换为数字并限制范围。
- 在每个查询条件中保留当前用户边界。
- 通过白名单把外部排序选项映射为 Prisma `orderBy`。

## 前置知识

已能从 `@CurrentUser()` 获取用户 ID，并理解 DTO 适用于 Body、Param 和 Query 等所有外部输入。

## 原理

Query String 的原始值都是字符串。分页参数必须有下限和上限，搜索必须受当前用户条件约束，排序必须是预定义选项，不能直接接收任意字段名。

```text
skip = (page - 1) * pageSize
```

## 示例代码

```ts
export class OrderQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsIn(['latest', 'amount_asc', 'amount_desc'])
  sort: 'latest' | 'amount_asc' | 'amount_desc' = 'latest';
}
```

```ts
const where: Prisma.OrderWhereInput = {
  userId,
  ...(query.keyword && {
    productName: { contains: query.keyword },
  }),
};

const orderBy: Prisma.OrderOrderByWithRelationInput =
  query.sort === 'amount_asc'
    ? { amount: 'asc' }
    : query.sort === 'amount_desc'
      ? { amount: 'desc' }
      : { createdAt: 'desc' };

const [list, total] = await this.prisma.$transaction([
  this.prisma.order.findMany({
    where,
    orderBy,
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  }),
  this.prisma.order.count({ where }),
]);
```

MySQL 的大小写匹配受列 Collation 影响，应在数据库 Schema 层确认搜索语义。

## 常见错误

- 不限制 `pageSize`，让一个请求读取无界数据。
- 在列表查询中忘记 `userId` 条件，泄露其他用户的资源。
- 将客户端传入的任意字段直接作为排序条件。

## 本节总结

Query DTO 是查询边界：它转换类型、限制资源消耗并约束可用查询能力。Service 仍要始终附加当前用户条件。

## 下一步

进入 [事务](/project/transactions)，让多个必须共同成功的数据库操作保持原子性。
