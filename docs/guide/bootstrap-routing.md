---
title: 启动与路由
description: 理解 NestFactory.create、AppModule 扫描、HTTP 服务启动和 Controller 路由映射。
---

# 启动与路由

## 学习目标

- 描述 `NestFactory.create(AppModule)` 之后发生的事。
- 知道应用级配置为什么必须写在 `listen()` 之前。
- 根据 Controller 和方法装饰器计算最终路由。
- 理解路由注册与 `app.listen()` 的边界。

## 前置知识

已了解 Node.js 进程、HTTP 方法与 TypeScript 装饰器的基本语法。

## 原理

`main.ts` 是应用组装入口。`create()` 会从根模块扫描模块图、注册 Provider、解析依赖并收集路由 Metadata；`listen()` 才会让 HTTP 适配器监听端口。

可以把启动过程拆成五步：

```text
Node.js 执行 main.ts
→ NestFactory.create(AppModule)
→ 扫描 Module 并建立依赖图
→ 创建 Provider / Controller 并注册路由
→ app.listen() 开始接收请求
```

全局前缀、CORS、全局 Pipe 等应用级设置应在 `create()` 之后、`listen()` 之前完成。这样第一个进入应用的请求就会使用完整配置。

最终路由由三部分组成：

```text
HTTP 方法 + Controller 前缀 + 方法路径
```

## 示例代码

### 1. 阅读最小启动入口

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
```

`bootstrap()` 是普通异步函数。`NestFactory.create()` 返回应用实例，`await app.listen()` 等待底层 HTTP 服务成功绑定端口。

`void bootstrap()` 明确表示调用者不使用这个 Promise。生产项目还可以捕获启动错误，记录后以非零状态退出；不要静默吞掉初始化失败。

### 2. 在监听前加入应用级设置

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:5173'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
```

设置全局前缀后，原来的 `/users` 会变成 `/api/users`。课程后续示例默认不加全局前缀；如果你选择添加，测试命令要同步带上 `/api`。

### 3. 计算 Controller 路由

```ts
@Controller('users')
export class UsersController {
  @Get()
  findAll() {}

  @Get('profile')
  getProfile() {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {}
}
```

对应 `GET /users`、`GET /users/profile` 和动态路由 `GET /users/:id`。固定路由 `profile` 应放在动态路由前面，让阅读与调试更直观。

### 4. 从启动日志确认映射

开发模式启动时，Nest 会输出 Controller 与路由映射日志。新增方法后可以先查看终端是否出现预期路径，再发送请求：

```bash
curl -i http://localhost:3000/users
curl -i http://localhost:3000/users/profile
curl -i http://localhost:3000/users/1
```

404 通常表示路径或 HTTP 方法未匹配；应用根本无法连接则应先检查进程和端口。两者不是同一类问题。

<DocDiagram
  src="/images/optimized/routing-map.webp"
  original="/images/original/routing-map.png"
  alt="NestJS 项目从 main.ts 启动、创建应用、注册 Controller 到路由与方法映射的流程"
  caption="NestJS 启动流程与路由映射"
  :width="1536"
  :height="1024"
/>

## 常见错误

- 把 `@Get(':id')` 理解成固定路径，忽略 `id` 来自路由参数。
- 只看方法级装饰器，忘记加上 `@Controller('users')` 前缀。
- 在 `listen()` 之后再注册全局 Pipe 或 CORS，导致初始化顺序不清晰。
- 添加了全局前缀，却继续请求没有前缀的旧地址。
- 看到 404 就重装依赖，没有先核对请求方法、完整路径和启动日志。

## 本节总结

`create()` 完成应用图的组装，`listen()` 开放 HTTP 入口；路由是 Controller 前缀和方法路径的组合。

## 下一步

继续学习 [创建功能模块](/guide/create-module)，用 CLI 创建 `UsersModule` 并把它接入根模块。
