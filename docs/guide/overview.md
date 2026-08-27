---
title: NestJS 整体认知
description: 用 Module、IOC/DI、Metadata 和 Request Pipeline 建立 NestJS 的整体心智模型。
---

# NestJS 整体认知

## 学习目标

- 说清 NestJS 在 Node.js 后端中解决的工程问题。
- 识别 Module、IOC/DI、Metadata 和 Request Pipeline 四个核心概念。
- 了解本课程的版本边界与学习路线。

## 前置知识

需要基本的 TypeScript、HTTP 和 Node.js 经验。本站以 Node.js 22 LTS、NestJS 11、Prisma 7 和 MySQL 8.4 为讲解基线。

进入数据库阶段前，你会先完成下面这条不依赖 MySQL 的路径：

```text
准备环境
→ 创建 Nest 项目
→ 认识目录与启动流程
→ 创建 UsersModule
→ 创建 Controller 与 Service
→ 配置 DTO 校验
→ 完成内存版 Users CRUD
```

## 原理

NestJS 不是一组装饰器的集合，它主要解决大型 Node.js 应用如何组织：

```text
NestJS
= HTTP 适配层
+ TypeScript
+ Module 边界
+ IOC / DI
+ Decorator / Metadata
+ Request Pipeline
```

Module 定义能力边界，IOC 容器负责对象创建，Metadata 保存框架需要的描述信息，Request Pipeline 则定义一个 HTTP 请求如何通过权限、校验、业务与异常处理。

## 示例代码

同一个用户列表请求，会穿过多个责任层：

```text
GET /users
→ UsersController.findAll()
→ UsersService.findAll()
→ PrismaService.user.findMany()
→ MySQL
```

<DocDiagram
  src="/images/optimized/full-architecture.webp"
  original="/images/original/full-architecture.png"
  alt="NestJS 从应用启动、依赖注入、HTTP 请求生命周期、JWT、Prisma 到生产部署的整体架构"
  caption="NestJS 全流程架构学习总图"
  :width="1024"
  :height="1536"
/>

## 常见错误

- 把 Controller 当作全部业务的容器，导致 HTTP 边界与领域逻辑耦合。
- 在业务代码里手动 `new` 依赖，绕过 Nest 的生命周期和测试替换能力。
- 只记装饰器写法，但不追问它写入了什么 Metadata。

## 本节总结

NestJS 的核心不是“更快写一个接口”，而是让模块边界、对象创建、请求流转和横切能力有统一规则。

## 下一步

进入 [环境准备](/guide/environment)，先把 Node.js、pnpm 与 Nest CLI 的版本和职责理清楚。
