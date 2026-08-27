---
title: 毕业检查表
description: 使用一份可验证的 NestJS 能力清单，检查是否能从需求独立推导架构并交付生产应用。
---

# 毕业检查表

## 学习目标

- 用可观察行为而不是“看过教程”评估掌握程度。
- 从业务需求反向推导路由、DTO、权限、事务和测试。
- 找到下一个需要通过真实项目弥补的能力缺口。

## 前置知识

已完成前 32 课，并至少手写过一次 Users/Orders 类型的受保护 CRUD。

## 原理

真正的掌握体现在能否解释取舍并通过测试证明行为。遇到一个新需求时，应自动追问：请求从哪里进入、身份从哪里来、资源归谁、哪些写入必须原子化、失败如何表达。

## 示例代码

需求：“用户创建评论，只能删除自己的评论，管理员可以删除任意评论。”

```text
POST /comments
→ AuthGuard
→ CreateCommentDto / ValidationPipe
→ @CurrentUser('sub')
→ CommentsService
→ Prisma transaction（如果同时更新计数）

DELETE /comments/:id
→ AuthGuard
→ ParseIntPipe
→ Service 查询评论
→ 所有者或 ADMIN？
→ 删除 / 403 / 404
```

为这条链路编写单元测试覆盖归属判断，编写 E2E 测试覆盖 401、403、404 和成功删除。

## 常见错误

- 只检查自己能否写出装饰器，不检查数据归属、失败语义和测试。
- 永远跟着教程从第一行开始写，没有从验收标准和风险反向设计。
- 用过度抽象代替真实需求，或用大量新库回避对 Nest 核心机制的理解。

## 本节总结

- [ ] 能独立建立 Module / Controller / Service / DTO。
- [ ] 能解释 DI、Token、imports/providers/exports 和 Metadata。
- [ ] 能实现 Prisma Migration、CRUD、关联、分页与事务。
- [ ] 能实现 bcrypt、JWT、AuthGuard、`@Public`、`@CurrentUser` 和 RBAC。
- [ ] 能正确选择 Middleware、Guard、Pipe、Interceptor 和 Filter。
- [ ] 能为成功与失败路径编写 Unit / E2E 测试。
- [ ] 能完成 OpenAPI、安全配置、生产 Migration、健康检查和部署。

## 下一步

回到 [课程首页](/)，选一个不同于 Users/Orders 的真实领域，不再逐行照抄，而是按需求、边界、失败模式和测试独立完成项目。
