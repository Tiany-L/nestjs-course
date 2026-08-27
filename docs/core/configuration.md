---
title: 配置与启动校验
description: 用 ConfigModule、ConfigService 和 Joi 在 NestJS 启动阶段管理并校验环境变量。
---

# 配置与启动校验

## 学习目标

- 通过 `ConfigModule` 统一加载环境配置。
- 使用 `getOrThrow()` 避免静默的 `undefined`。
- 在应用接收流量前对关键配置 Fail Fast。
- 区分本地 `.env`、进程环境变量和代码中的默认值。

## 前置知识

已了解 Provider 可以通过 `useFactory` 组合其他依赖，并知道敏感配置不应写进源码。

## 原理

`.env` 只是一种本地配置来源，`ConfigModule` 负责加载并向 DI 容器提供 `ConfigService`。启动校验属于应用配置边界，与请求阶段的 DTO 校验不是同一件事。

```text
进程环境 / .env
→ ConfigModule
→ Joi 启动校验
→ ConfigService
→ 其他 Provider
```

## 示例代码

### 1. 安装配置模块

```bash
pnpm add @nestjs/config joi
```

### 2. 在根模块加载并校验

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DB_HOST: Joi.string().hostname().required(),
        DB_PORT: Joi.number().port().default(3306),
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(32).required(),
      }),
    }),
  ],
})
export class AppModule {}
```

`isGlobal: true` 让其他模块无需重复导入 `ConfigModule` 即可注入 `ConfigService`。只应在确实属于全应用基础设施的模块上谨慎使用全局可见性。

### 3. 准备本地环境文件

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DATABASE_URL=mysql://app:password@127.0.0.1:3306/nest_course
JWT_SECRET=replace-with-at-least-32-characters
```

把字段名和无敏感值的说明提交到 `.env.example`，把真实 `.env` 加入 `.gitignore`。新成员可以从示例知道需要哪些配置，但不会拿到真实密码。

### 4. 读取关键配置

```ts
const secret = this.configService.getOrThrow<string>('JWT_SECRET');
```

应用端口也可以在 `main.ts` 中读取：

```ts
const config = app.get(ConfigService);
const port = config.getOrThrow<number>('PORT');
await app.listen(port);
```

Joi 的默认值和转换发生在启动边界。业务代码只消费已经验证的配置，不应在各个 Service 中重复解析字符串。

`.env` 保存本地开发值并必须被 `.gitignore` 排除；生产环境通过平台 Secret 或密钥管理服务注入。

## 常见错误

- 用 `config.get()` 取得关键值后不处理 `undefined`。
- 将 `.env` 当成可提交的应用配置文件，泄露数据库密码或 JWT Secret。
- 把所有环境变量保留为字符串，没有在边界完成端口、布尔值等类型转换。
- 只维护本地 `.env`，却没有提供可提交的 `.env.example` 字段清单。
- 为了方便给生产密钥设置弱默认值，让配置缺失时应用仍然启动。

## 本节总结

配置应该在启动阶段被加载、校验和转换；一旦关键配置缺失，应立即停止启动，而不是等到首个请求才失败。

## 下一步

进入 [Prisma + MySQL](/database/prisma-mysql)，把已校验的数据库配置连接到持久化层。
