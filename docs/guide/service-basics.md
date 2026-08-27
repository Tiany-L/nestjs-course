---
title: Service 与依赖注入
description: 创建 UsersService，把业务逻辑注册为 Provider，并通过构造函数注入 UsersController。
---

# Service 与依赖注入

## 学习目标

- 使用 CLI 创建 Service 并注册为 Provider。
- 通过构造函数把 Service 注入 Controller。
- 理解 `@Injectable()`、`providers` 和构造函数参数缺一不可的原因。
- 避免在 Controller 中手动创建依赖。

## 前置知识

已创建 `UsersController` 并能通过路由装饰器接收请求，但业务逻辑目前仍写在 Controller 方法中。

## 原理

Service 是一种常见 Provider。`@Injectable()` 让类可以参与 Nest 的依赖分析，Module 的 `providers` 负责注册创建规则，构造函数参数声明使用者需要哪个实例。

```text
UsersModule 注册 UsersService
→ IOC 容器创建 UsersService
→ IOC 容器创建 UsersController
→ 把 UsersService 注入 Controller 构造函数
```

Controller 不应该执行 `new UsersService()`。对象创建交给容器后，生命周期、共享实例和测试替换才能保持一致。

## 示例代码

### 1. 生成 Service

```bash
nest g service users --no-spec
```

CLI 会创建 `src/users/users.service.ts`，并把它加入 `UsersModule`：

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### 2. 在 Service 中放入业务操作

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll() {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }

  findOne(id: number) {
    return { id, name: `User ${id}` };
  }
}
```

### 3. 注入 Controller

```ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
```

`private readonly` 同时完成三件事：声明构造函数参数、创建同名类属性、阻止重新赋值。它不是 Nest 专属语法，而是 TypeScript 的参数属性。

### 4. 追踪容器如何找到实例

这里的 Token 是 `UsersService` 类本身：

```ts
providers: [UsersService]
```

等价于：

```ts
providers: [
  {
    provide: UsersService,
    useClass: UsersService,
  },
]
```

Controller 构造函数参数类型提供 Token，容器用它查找已经注册的 Provider。

### 5. 故意移除注册观察错误

暂时从 `providers` 删除 `UsersService` 并启动应用，会看到 Nest 无法解析 `UsersController` 依赖的错误。读这类错误时依次检查：

1. 失败的是哪个类。
2. 构造函数第几个参数无法解析。
3. 对应 Provider 是否在当前模块注册。
4. 如果来自其他模块，是否正确导出和导入。

观察后恢复 `providers: [UsersService]`。

## 常见错误

- 只有 `@Injectable()`，却忘记在 Module 中注册 Provider。
- 在 Controller 中 `new UsersService()`，绕过容器。
- 把 Controller 放进 `providers`，或把 Service 放进 `controllers`。
- Service 接收 `Request`、`Response` 等 HTTP 对象，让业务层与传输协议绑定。
- 为了复用一个方法就把所有不相关逻辑塞进同一个巨大 Service。

## 本节总结

Service 承载可复用业务能力，Module 把它注册到容器，Controller 通过构造函数声明依赖。这个三步关系是后续 DI、跨模块调用和测试替换的基础。

## 下一步

继续学习 [Module / Controller / Service](/guide/application-structure)，把三个角色放回同一条请求链路，建立稳定的分层判断方法。
