---
title: 跨模块依赖
description: 用 imports、providers 和 exports 控制 NestJS Provider 在模块间的可见性。
---

# 跨模块依赖

## 学习目标

- 准确说明 `imports`、`providers` 和 `exports` 的方向。
- 让 `OrdersService` 合法注入 `UsersService`。
- 利用模块边界避免全局可见性。
- 能从错误的重复注册中识别模块边界问题。

## 前置知识

已理解 Provider Token 和 IOC 容器根据构造函数解析依赖的过程。

## 原理

Provider 默认只在声明它的模块上下文中可见。要跨模块使用，提供方必须导出 Provider，消费方必须导入提供方 Module。

```text
providers = 这个模块拥有什么
exports   = 哪些能力允许其他模块使用
imports   = 这个模块需要谁导出的能力
```

## 示例代码

### 1. 提供方注册并导出

```ts
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

`providers` 让 `UsersService` 在 `UsersModule` 内可用，`exports` 只公开选中的 Provider，不会自动公开整个模块内部。

### 2. 消费方导入模块

```ts
@Module({
  imports: [UsersModule],
  providers: [OrdersService],
})
export class OrdersModule {}
```

`OrdersModule` 导入的是 `UsersModule`，不是直接导入 `UsersService` 文件。Module 的 `imports` 建立模块图，TypeScript 的 `import` 只解决源码符号引用，两者不能互相替代。

### 3. 在消费方声明依赖

```ts
@Injectable()
export class OrdersService {
  constructor(private readonly usersService: UsersService) {}
}
```

完整解析方向如下：

```text
OrdersService 需要 UsersService Token
→ OrdersModule 当前没有该 Provider
→ 查找 imports 中的 UsersModule
→ UsersModule exports 包含 UsersService
→ 注入 UsersService 实例
```

### 4. 避免重复注册

下面的写法看似能消除报错，但模糊了所有权：

```ts
@Module({
  providers: [OrdersService, UsersService],
})
export class OrdersModule {}
```

`UsersService` 应由 `UsersModule` 拥有。消费方应导入提供方模块，而不是重新声明别人的 Provider。

### 5. 先处理职责，再处理循环依赖

当 `UsersModule` 和 `OrdersModule` 互相导入时，先检查能否提取共同能力、改变调用方向或通过事件解耦。`forwardRef()` 是处理无法立即拆开的技术手段，不是默认模块设计。

<DocDiagram
  src="/images/optimized/cross-module-di.webp"
  original="/images/original/cross-module-di.png"
  alt="UsersModule 导出 UsersService，OrdersModule 导入 UsersModule 后由 IOC 容器将 UsersService 注入 OrdersService"
  caption="UsersService 跨模块注入 OrdersService 的完整关系"
  :width="1536"
  :height="1024"
/>

## 常见错误

- 只在 `UsersModule` 的 `providers` 里注册，却没有放入 `exports`。
- 在 `OrdersModule` 里直接再注册一遍 `UsersService`，意外建立了不同的模块上下文。
- 过早使用 `forwardRef()` 隐藏循环依赖，而不是重新检查模块职责。
- 只写 TypeScript `import { UsersService }`，误以为 Nest Module 已经获得该 Provider。
- 为省略 `imports` 把大量模块设为全局，导致依赖来源不可见。

## 本节总结

跨模块注入需要“提供方导出 + 消费方导入”。这个显式过程就是 NestJS 的能力边界。

## 下一步

学习 [自定义 Provider](/core/providers)，看类、配置对象与工厂函数如何共用同一套 Token 机制。
