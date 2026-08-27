---
title: Exception Filter
description: 用全局 Exception Filter 将 HttpException 和未知错误转换为稳定响应，同时保留服务端日志。
---

# Exception Filter

## 学习目标

- 读取 `ArgumentsHost` 中的 HTTP 请求和响应。
- 保留已知 `HttpException` 的状态码与安全信息。
- 对未知错误返回通用 500，并在服务端记录细节。

## 前置知识

已会在 Service 中抛出 NestJS 内置异常，并知道 Interceptor 的成功映射不会替代异常处理。

## 原理

Exception Filter 只在异常流中执行。查找顺序从路由级到 Controller 级，再到全局；与 Interceptor 不同，Filter 捕获后不会再向外层 Filter 传播。

全局 Catch-all Filter 要区分两类错误：

```text
HttpException → 保留可公开的状态和消息
unknown       → 记录完整错误，对外只返回 500 通用信息
```

## 示例代码

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const isHttpError = exception instanceof HttpException;
    const status = isHttpError
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttpError) this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      message: isHttpError ? exception.message : '服务器内部错误',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

```ts
{
  provide: APP_FILTER,
  useClass: AllExceptionsFilter,
}
```

## 常见错误

- 把 `exception.message` 原样返回给所有 500 响应，泄露内部信息。
- 忽略 `ValidationPipe` 的响应可能包含消息数组，强制压成单一字符串。
- 认为路由级 Filter 能捕获所有 Middleware 或 HTTP 适配器之外的错误。

## 本节总结

Filter 将内部异常翻译成稳定 HTTP 契约。客户端只得到安全信息，服务端日志保留排查所需的完整错误。

## 下一步

学习 [Middleware](/request/middleware)，理解请求进入 Nest 执行上下文前的 HTTP 预处理阶段。
