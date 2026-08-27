---
title: 自定义 Provider
description: 理解 NestJS useClass、useValue、useFactory 和自定义 Token 的适用场景。
---

# 自定义 Provider

## 学习目标

- 将 `providers: [UsersService]` 还原成完整 Provider 定义。
- 在 `useClass`、`useValue` 和 `useFactory` 之间做正确选择。
- 用 `Symbol` 创建稳定的非类 Token。
- 区分 `useExisting` 与重新创建一个 Provider。

## 前置知识

已理解 IOC 容器用 Token 定位 Provider，并知道 Module 控制 Provider 可见性。

## 原理

Provider 定义回答两个问题：用什么 Token 查找，以及对应的值如何产生。

```ts
providers: [UsersService]
```

是下面写法的简写：

```ts
{
  provide: UsersService,
  useClass: UsersService,
}
```

`useValue` 适合已经存在的值或测试替身，`useFactory` 适合需要其他依赖或异步初始化的值。

| 写法 | 值如何产生 | 典型用途 |
| --- | --- | --- |
| `useClass` | 容器实例化指定类 | 接口实现切换 |
| `useValue` | 直接使用现有值 | 常量、测试替身 |
| `useFactory` | 调用工厂函数 | 依赖配置的动态对象 |
| `useExisting` | 指向已有 Token | 为同一实例提供别名 |

## 示例代码

### 1. 还原类 Provider 简写

```ts
providers: [UsersService]
```

等价于：

```ts
providers: [{ provide: UsersService, useClass: UsersService }]
```

### 2. 为非类依赖定义 Token

```ts
export const DATABASE_CONFIG = Symbol('DATABASE_CONFIG');
```

TypeScript `interface` 编译后不存在，不能直接作为运行时 Token。`Symbol` 可以避免普通字符串在大型项目中意外重名。

### 3. 用工厂组合其他依赖

```ts
{
  provide: DATABASE_CONFIG,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
  }),
}
```

`inject` 的顺序必须与工厂函数参数顺序一致。工厂也可以是 `async` 函数，Nest 会等待 Promise 完成后再把结果交给消费者。

### 4. 注入自定义 Token

```ts
constructor(
  @Inject(DATABASE_CONFIG)
  private readonly databaseConfig: { host: string; port: number },
) {}
```

非类 Token 无法仅靠参数类型推断，因此需要显式 `@Inject(DATABASE_CONFIG)`。

### 5. 在测试中使用 useValue

```ts
const usersServiceStub = {
  findAll: () => [{ id: 1, name: 'Test user' }],
};

const moduleRef = await Test.createTestingModule({
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useValue: usersServiceStub,
    },
  ],
}).compile();
```

Controller 不需要知道自己拿到的是生产实现还是测试替身，这就是依赖倒置带来的可替换性。

### 6. 用 useExisting 创建别名

```ts
{
  provide: 'APP_LOGGER',
  useExisting: LoggerService,
}
```

`useExisting` 与原 Token 指向同一实例；`useClass: LoggerService` 则可能让容器按另一个 Provider 定义创建实例。

## 常见错误

- 使用到处重复的字符串 Token，并且没有导出统一常量。
- `useFactory` 声明了函数参数，却忘记在 `inject` 中列出对应 Token。
- 在 `useValue` 中放入可被任意修改的全局对象，却没有明确共享状态的意图。
- 直接使用 TypeScript `interface` 作为 Token，忽略它运行时不存在。
- 本想复用同一实例却使用 `useClass`，没有考虑 `useExisting`。

## 本节总结

Token 是查找键，Provider 是创建规则。类只是 Token 的一种，配置、接口实现和测试替身都可以使用自定义 Provider。

## 下一步

进入 [配置与启动校验](/core/configuration)，将环境变量作为类型化依赖使用。
