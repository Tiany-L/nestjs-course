---
title: Middleware
description: 在 NestJS 请求最前端使用 Middleware 完成 requestId、基础记录和 HTTP 预处理。
---

# Middleware

## 学习目标

- 识别 Middleware 在请求生命周期中的位置。
- 在 Module 中精确配置 Middleware 的路由范围。
- 区分 Middleware、Guard 和 Interceptor 的责任。

## 前置知识

已理解 Express/Fastify 是 Nest 下方的 HTTP 适配层，且 Guard 需要 Nest 路由的 `ExecutionContext`。

## 原理

Middleware 在路由处理管道之前执行，它了解原始请求与响应，但不了解即将调用的 Controller 方法 Metadata。因此 requestId、基础记录和协议预处理适合 Middleware，角色授权适合 Guard。

```text
HTTP Adapter
→ Middleware
→ Guard / Interceptor / Pipe
→ Controller
```

## 示例代码

```ts
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.header('x-request-id') ?? randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
```

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
```

NestJS 11 使用 path-to-regexp 8，通配路由需要命名，例如 `*path`，而不是旧写法 `*`。

## 常见错误

- 在 Middleware 中读取 `@Roles()` 等路由 Metadata；它没有 Guard 的 `ExecutionContext`。
- 忘记调用 `next()` 且没有结束响应，导致请求挂起。
- 把需要 Controller 执行时间的统计放在 Middleware；这类洋葱式逻辑更适合 Interceptor。

## 本节总结

Middleware 是请求的前台登记处：靠近 HTTP 适配器，适合与具体 Controller 方法无关的预处理。

## 下一步

进入 [完整请求链路](/request/lifecycle)，把 Middleware、Guard、Interceptor、Pipe、Controller 和 Filter 串成一张图。
