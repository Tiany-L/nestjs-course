---
title: NestJS 三大核心原理
description: 用 Metadata、IOC Container 和 Request Pipeline 统一解释 NestJS 装饰器、依赖管理和 HTTP 执行模型。
---

# NestJS 三大核心原理

## 学习目标

- 从 Metadata 角度解释路由、公开接口和角色装饰器。
- 从 IOC Container 角度解释 Module 和构造函数注入。
- 从 Request Pipeline 角度定位每个横切关注点。

## 前置知识

已完成本课程前六个阶段，能独立追踪一个受保护 CRUD 请求。

## 原理

### Metadata

`@Controller()`、`@Get()`、`@Public()` 和 `@Roles()` 都在对类或方法写入描述信息。Nest 核心和 `Reflector` 会在启动或请求阶段读取它们。

### IOC Container

Module 提供 Provider 注册表和可见性边界，IOC 容器根据 Token 建立依赖图、创建实例并注入构造函数。

### Request Pipeline

HTTP 请求经过 Middleware、Guard、Interceptor、Pipe 和 Controller，成功值通过 Interceptor 返回，异常由 Filter 翻译。

## 示例代码

一个管理员删除用户的路由，同时使用了三套原理：

```ts
@Roles(Role.ADMIN) // Metadata
@Delete(':id')     // 路由 Metadata
remove(
  @Param('id', ParseIntPipe) id: number, // Request Pipeline
) {
  return this.usersService.remove(id);   // IOC 注入的 Provider
}
```

```text
Metadata 描述“这是什么”
IOC Container 决定“对象从哪里来”
Request Pipeline 决定“请求如何通过”
```

## 常见错误

- 把装饰器当作会立即执行业务的函数，不追问谁在什么时候读取 Metadata。
- 为了方便而跳过 IOC 容器手动创建依赖，破坏作用域和测试。
- 不区分认证、参数校验、响应映射和异常翻译，把全部逻辑塞进一个环节。

## 本节总结

Metadata、IOC Container 和 Request Pipeline 是理解 NestJS 的三个坐标轴。当新机制出现时，先问它描述了什么、依赖如何产生、在请求中何时执行。

## 下一步

使用 [毕业检查表](/engineering/graduation-checklist) 检验自己是否能从需求反向推导模块、数据和请求边界。
