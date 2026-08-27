---
title: 创建功能模块
description: 使用 Nest CLI 创建 UsersModule，理解 imports、controllers、providers 和 exports 的基础作用。
---

# 创建功能模块

## 学习目标

- 用 Nest CLI 创建第一个功能模块。
- 理解根模块与功能模块的关系。
- 认识 `@Module()` 四个常用元数据字段。
- 确认 CLI 自动修改了哪些文件。

## 前置知识

已了解 `main.ts` 从 `AppModule` 启动应用，并能通过开发模式观察文件修改后的重新编译。

## 原理

Module 是 NestJS 组织能力和声明依赖边界的基本单位。按业务能力拆分模块时，用户相关代码放在 `UsersModule`，订单相关代码放在 `OrdersModule`，而不是把所有文件都堆在根模块。

```text
AppModule
├── UsersModule
├── OrdersModule
└── AuthModule
```

每个 Nest 应用至少有一个根模块。功能模块通过根模块或其他模块的 `imports` 接入模块图。

## 示例代码

### 1. 使用 CLI 生成 UsersModule

在项目根目录执行：

```bash
nest generate module users
```

可以使用短命令：

```bash
nest g mo users
```

CLI 会创建 `src/users/users.module.ts`，并通常自动把它加入最近的上级模块。不要只看终端显示 `CREATE`，还要检查 `UPDATE src/app.module.ts`。

### 2. 阅读生成的模块

```ts
import { Module } from '@nestjs/common';

@Module({})
export class UsersModule {}
```

此时模块是空的，但已经成为一个独立的组织边界。

### 3. 检查根模块

```ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
```

如果项目仍保留默认的 `AppController` 和 `AppService`，相应的 `controllers` 与 `providers` 不会消失；这里只突出新增的 `imports`。

### 4. 认识四个字段

```ts
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class UsersModule {}
```

| 字段 | 表达的问题 |
| --- | --- |
| `imports` | 当前模块需要使用哪些其他模块导出的能力 |
| `controllers` | 当前模块接收哪些 HTTP 请求 |
| `providers` | 当前模块由容器管理哪些 Service 或其他 Provider |
| `exports` | 当前模块允许其他模块使用哪些 Provider |

在刚创建模块时，不需要为了“看起来完整”填满四个数组。只有真实依赖出现时再注册。

### 5. 手动创建时要做什么

CLI 只是减少重复操作，下面的手动流程与其本质相同：

1. 创建 `users/users.module.ts`。
2. 导出带 `@Module()` 的 `UsersModule` 类。
3. 在 `AppModule` 中导入这个类。
4. 把 `UsersModule` 加入 `imports`。

理解手动步骤后，CLI 自动更新文件时才不会变成黑盒。

## 常见错误

- 创建了 `UsersModule` 文件，却没有把它接入任何已加载模块。
- 把 `UsersModule` 放进 `providers`；Module 应进入 `imports`。
- 为每个类创建一个 Module，导致边界过碎；模块通常围绕业务能力组织。
- 把功能模块全部标记为全局模块，失去显式依赖关系。
- CLI 更新了错误的上级模块却没有查看差异。

## 本节总结

Module 是能力边界，不是业务执行类。创建功能模块需要“定义模块 + 接入模块图”，`imports`、`controllers`、`providers` 和 `exports` 分别描述依赖、入口、内部能力与公开能力。

## 下一步

继续学习 [Controller 与请求参数](/guide/controller-basics)，为 `UsersModule` 添加真正的 HTTP 入口。
