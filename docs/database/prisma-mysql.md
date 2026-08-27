---
title: Prisma + MySQL
description: 按 Prisma 7 的配置模式连接 MySQL 8.4，完成 Schema、Migration、Client 生成与查询。
---

# Prisma + MySQL

## 学习目标

- 区分 Prisma Schema、Migration、Generated Client 和 MySQL 表。
- 理解 Prisma 7 的 `prisma.config.ts` 与 Driver Adapter 边界。
- 用安全的类型 API 完成基本 CRUD。

## 前置知识

已能通过 `ConfigService` 读取并校验数据库配置，并了解 SQL 表、主键与迁移的基本概念。

## 原理

Prisma Schema 是应用层数据模型，Migration 把模型变更固化为 SQL 历史，Generated Client 提供类型安全的查询 API，Driver Adapter 负责真正的数据库连接。

```text
schema.prisma
→ prisma migrate dev
→ MySQL 表结构

schema.prisma
→ prisma generate
→ TypeScript Prisma Client
```

Prisma 7 将连接 URL 放在 `prisma.config.ts` 中，新的 `prisma-client` generator 要求显式输出目录。

## 示例代码

```bash
pnpm add @prisma/client @prisma/adapter-mariadb
pnpm add -D prisma
pnpm exec prisma init --datasource-provider mysql --output ../src/generated/prisma
```

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  age       Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```ts
// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

<DocDiagram
  src="/images/optimized/prisma-mysql.webp"
  original="/images/original/prisma-mysql.png"
  alt="HTTP 请求经 NestJS Controller、Service、Prisma Client 访问 MySQL，以及 Prisma 7 配置、Schema、Client 生成和迁移流程"
  caption="NestJS、Prisma 7 与 MySQL 的整体关系"
  :width="1536"
  :height="1024"
/>

## 常见错误

- 修改 Schema 后只执行 `generate`，却没有通过 Migration 更新数据库。
- 在生产环境执行 `migrate dev` 或 `migrate reset`。
- 把 Prisma Model 字段类型与 DTO 校验混为一层；数据库约束不会取代 HTTP 边界校验。

## 本节总结

Migration 管理数据库历史，Generated Client 管理类型安全查询，Driver Adapter 管理运行时连接。三者的更新节奏不同。

## 下一步

学习 [PrismaModule](/database/prisma-module)，把 Prisma Client 封装成可跨模块复用的 Nest Provider。
