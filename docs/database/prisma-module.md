---
title: PrismaModule
description: 使用 Prisma 7 Driver Adapter 封装 PrismaService，并通过 PrismaModule 提供统一数据库能力。
---

# PrismaModule

## 学习目标

- 将 Prisma Client 封装为 NestJS Provider。
- 正确建立与关闭数据库连接。
- 通过 Module 导出让业务 Service 复用数据能力。

## 前置知识

已生成 Prisma 7 Client，并理解 NestJS Provider 的注册、导出与注入机制。

## 原理

Prisma Client 是需要管理连接生命周期的基础设施对象。将它包装为 `PrismaService` 后，IOC 容器能在应用启动时创建它，并在关闭时释放连接。

```text
UsersService
→ PrismaService
→ Prisma Client
→ MariaDB Driver Adapter
→ MySQL
```

## 示例代码

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: config.getOrThrow('DB_HOST'),
      port: config.getOrThrow<number>('DB_PORT'),
      user: config.getOrThrow('DB_USER'),
      password: config.getOrThrow('DB_PASSWORD'),
      database: config.getOrThrow('DB_NAME'),
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## 常见错误

- 每个 Service 都创建新的 `PrismaClient`，造成连接数与生命周期难以管理。
- 忘记从 `PrismaModule` 导出 `PrismaService`，或在业务 Module 忘记导入 `PrismaModule`。
- 将 Prisma 6 以前的无 Adapter 构造方式与 Prisma 7 新生成器混用。

## 本节总结

PrismaModule 将数据库连接和 Client 生命周期收口到一个基础设施模块，业务层只依赖稳定的 `PrismaService`。

## 下一步

通过 [Users CRUD 全链路](/database/users-crud) 把路由、DTO、Service、Prisma 和 HTTP 状态码连起来。
