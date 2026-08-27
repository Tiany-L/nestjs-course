---
title: 项目结构
description: 以业务模块和共享横切能力组织 NestJS 项目，避免技术层和全局模块失控。
---

# 项目结构

## 学习目标

- 按业务能力组织 Controller、Service、DTO 和 Module。
- 将 Prisma、认证和共享横切能力放入清晰边界。
- 识别不必要的抽象和过度的全局可见性。

## 前置知识

已完成 Users、Orders、Auth 和 Prisma 模块，并理解模块通过 exports/imports 建立显式依赖。

## 原理

项目结构应让业务边界比技术类型更容易被看见。一个新成员应该能从 `users/` 或 `orders/` 找到该能力的入口、规则和 DTO，而不是在全局 `controllers/` 和 `services/` 目录之间往返搜索。

`common/` 只放真正跨业务的无状态能力。某个业务专用的装饰器、Guard 或帮助函数仍应留在对应模块。

## 示例代码

```text
src/
├── auth/
│   ├── dto/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── guards/
│   └── decorators/
├── users/
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── orders/
│   ├── dto/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── filters/
│   ├── interceptors/
│   └── middleware/
├── app.module.ts
└── main.ts

prisma/
├── migrations/
└── schema.prisma

test/
└── app.e2e-spec.ts
```

## 常见错误

- 一开始就建立大量 Repository、BaseService 和通用 CRUD 抽象，却没有真实重复。
- 把所有模块标记为 Global，隐藏功能之间的依赖方向。
- 把业务专用代码不断移入 `common/`，最终形成无人能解释边界的大型目录。

## 本节总结

好的项目结构优先表达业务模块，再表达共享基础设施。只在重复和边界已经出现时抽象，不为假想的未来复杂度预支成本。

## 下一步

进入 [三大核心原理](/engineering/core-principles)，用 Metadata、IOC Container 和 Request Pipeline 重新审视整个项目。
