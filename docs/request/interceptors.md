---
title: Interceptor
description: 理解 NestJS Interceptor 的洋葱模型，实现响应映射、耗时统计和横切逻辑。
---

# Interceptor

## 学习目标

- 理解 `next.handle()` 前后的执行边界。
- 使用 RxJS Operator 处理响应成功、异常与收尾时机。
- 判断统一响应、日志、缓存等横切能力是否适合 Interceptor。

## 前置知识

已理解 Controller 返回值与异常的不同通道，并了解 Observable 的基本概念。

## 原理

Interceptor 包裹 Controller 方法。`next.handle()` 之前是前置阶段，返回的 Observable 代表后续 Controller/Service 执行。多个 Interceptor 像洋葱一样嵌套：先进入的在响应时最后退出。

```text
Global before → Controller before → Route before
→ Controller / Service
→ Route after → Controller after → Global after
```

`map()` 只处理成功值，`catchError()` 可处理错误流，`finalize()` 无论成功失败都会执行，适合耗时统计收尾。

## 示例代码

```ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
      })),
    );
  }
}
```

```ts
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const startedAt = performance.now();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      finalize(() => {
        const duration = Math.round(performance.now() - startedAt);
        this.logger.log(`${request.method} ${request.url} ${duration}ms`);
      }),
    );
  }
}
```

## 常见错误

- 调用 `next.handle()` 后不返回 Observable，导致请求链断开。
- 用 `map()` 包装异常，却忽略异常根本不会进入成功 `map`。
- 对文件流、204 响应或已经是标准契约的结果一律包装，破坏响应语义。

## 本节总结

Interceptor 处于 Controller 外层，适合同时需要“进入前”与“返回后”时机的横切能力。响应映射与异常格式化必须分开考虑。

## 下一步

学习 [Exception Filter](/request/exception-filters)，在异常通道中建立统一、不泄露内部细节的响应。
