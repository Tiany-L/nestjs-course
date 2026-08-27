---
title: 完整请求链路
description: 追踪 HTTP 请求经过 Middleware、Guard、Interceptor、Pipe、Controller、Service、Prisma 和 Filter 的全链路。
---

# 完整请求链路

## 学习目标

- 记住 NestJS HTTP 请求的高层执行顺序。
- 对每个横切机制只分配一个清晰职责。
- 追踪正常响应和异常响应的分叉。

## 前置知识

已分别学习 Middleware、Guard、Interceptor、Pipe、Controller、Service 和 Exception Filter。

## 原理

对一个常规 HTTP 请求，可以使用下面的高层模型：

```text
HTTP Request
→ Middleware
→ AuthGuard / RolesGuard
→ Interceptor Before
→ Pipe
→ Controller
→ Service
→ PrismaService / Prisma Client / MySQL
→ Interceptor After
→ HTTP Response
```

任何路由执行环节抛出未被 Interceptor 处理的异常时，会进入匹配的 Exception Filter。Filter 是异常分支，不是成功链路中 Controller 之后的固定一步。

## 示例代码

```ts
// 在根模块中声明全局横切能力
providers: [
  { provide: APP_GUARD, useClass: AuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
]
```

```ts
// main.ts 中的全局 Pipe
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

<DocDiagram
  src="/images/optimized/request-lifecycle.webp"
  original="/images/original/request-lifecycle.png"
  alt="HTTP 请求经过 Middleware、AuthGuard、RolesGuard、Interceptor、Pipe、Controller、Service、Prisma 和 MySQL 后返回，异常进入全局 Filter"
  caption="NestJS 核心请求机制总图"
  :width="1122"
  :height="1402"
/>

## 常见错误

- 把 Pipe 放在 Guard 前的心智模型中；Nest 先决定请求能否进入，再处理 Controller 参数。
- 认为 Interceptor After 永远会执行；如果需要成功失败都收尾，应使用 `finalize()`。
- 在 Middleware、Guard、Interceptor 中重复实现同一份日志或认证逻辑。

## 本节总结

Middleware 处理请求刚到达，Guard 决定能不能进，Interceptor 包裹执行，Pipe 校验参数，Controller 处理 HTTP，Service 执行业务，Filter 将异常翻译成响应。

## 下一步

进入项目阶段的 [User 1:N Order](/project/relations)，把请求链路应用到真实的关联数据模型。
