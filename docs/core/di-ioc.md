---
title: DI / IOC
description: 理解 NestJS IOC 容器如何根据 Provider Token 创建、管理并注入依赖。
---

# DI / IOC

## 学习目标

- 区分 IOC 与 DI。
- 说清构造函数参数、Provider Token 与实例的关系。
- 理解默认 Provider 的作用域与生命周期。
- 能按 Nest 的错误信息定位未注册的依赖。

## 前置知识

已会在 Module 中注册 Service，并在 Controller 的构造函数中声明依赖。

## 原理

IOC 表示对象创建和组装的控制权从业务代码转移给框架；DI 是容器把已解析的对象交给使用者的方式。

```text
扫描 Module
→ 注册 Token 与 Provider
→ 分析构造函数依赖
→ 按依赖顺序创建实例
→ 注入到使用者
```

默认作用域下，同一应用上下文中的 Provider 通常为单例。Request 或 Transient scope 会改变这个语义，不应在没有实际需求时滥用。

依赖注入可以拆成“注册”和“解析”两个阶段：Module 先把 Token 与创建方式登记到容器，容器再根据构造函数参数递归解析依赖。`@Injectable()` 参与 Metadata 生成，但不会单独把类注册到任何模块。

## 示例代码

### 1. 注册并声明依赖

```ts
@Injectable()
export class UsersService {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

`UsersService` 类本身同时作为 Token，Nest 会用该 Token 找到 Provider 并注入实例，而不是让 Controller 手动 `new UsersService()`。

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

缺少这段 `providers` 注册时，即使类上存在 `@Injectable()`，容器仍然没有创建规则。

### 2. 观察默认单例语义

如果同一模块中的两个 Provider 都注入 `UsersService`，默认情况下它们拿到的是同一个实例。适合放在 Provider 内的状态应非常谨慎；绝大多数业务状态应该放进数据库，而不是单例字段。

| Scope | 创建时机 | 常见用途 |
| --- | --- | --- |
| Default | 应用上下文复用实例 | 大多数 Service、客户端与配置 |
| Request | 每个请求建立实例链 | 确实依赖请求上下文的能力 |
| Transient | 每个消费者得到新实例 | 必须隔离内部状态的轻量对象 |

不要因为“更独立”就把所有 Provider 改成 Request scope，它会扩大每个请求需要创建的对象图。

### 3. 读懂依赖解析错误

典型错误会说明 Nest 无法解析某个类的第几个构造函数参数。按下面顺序检查：

```text
参数 Token 是否正确
→ Provider 是否在当前模块注册
→ 若来自外部模块，提供方是否 exports
→ 消费方是否 imports 提供方模块
→ 是否存在循环依赖
```

不要看到 `Nest can't resolve dependencies` 就把同一个 Service 到处重复注册，这可能制造多个模块上下文，而不是修复边界。

<DocDiagram
  src="/images/optimized/di-ioc.webp"
  original="/images/original/di-ioc.png"
  alt="NestJS Module 将 Provider 注册到 IOC 容器，容器根据 Token 查找实例并注入 OrdersService 的流程"
  caption="NestJS IOC / DI 依赖创建与注入原理"
  :width="1536"
  :height="1024"
/>

## 常见错误

- 在 Provider 内部手动 `new` 另一个业务 Service，导致测试替换和生命周期失效。
- 把 `@Injectable()` 理解为“自动全局注册”；它不会取代 Module 的 `providers`。
- 认为构造函数的 TypeScript 类型在任何编译配置下都能作为运行时 Token。
- 在单例 Provider 中保存某个请求的用户信息，造成并发请求互相污染。
- 一遇到解析失败就使用 `forwardRef()`，没有先检查模块职责和依赖方向。

## 本节总结

IOC 管理对象创建权，DI 完成依赖交付，Token 是容器查找 Provider 的稳定标识。

## 下一步

继续学习 [跨模块依赖](/core/module-boundaries)，理解一个 Provider 如何对其他模块可见。
