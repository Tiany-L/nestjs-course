---
title: 创建第一个项目
description: 使用 Nest CLI 11 和 pnpm 创建严格模式的 NestJS 项目，启动开发服务器并完成第一次 HTTP 验证。
---

# 创建第一个项目

## 学习目标

- 用 Nest CLI 创建可直接运行的 TypeScript 项目。
- 理解创建命令中的项目名、包管理器和严格模式。
- 启动开发服务器并验证首个 HTTP 响应。
- 能区分开发监听、普通启动和生产启动。

## 前置知识

已完成 Node.js 22、pnpm 和 Nest CLI 的版本检查，并准备了一个用于存放代码的目录。

## 原理

`nest new` 不只是创建几个 `.ts` 文件。它会生成目录结构、TypeScript 配置、Lint 配置、测试配置和 `package.json`，然后安装一组彼此兼容的 Nest 依赖。

```text
nest new
→ 生成工程文件
→ 写入 @nestjs/* 依赖
→ 安装 node_modules
→ 生成 pnpm-lock.yaml
→ 得到可启动项目
```

课程使用 `--strict` 开启更严格的 TypeScript 检查。越早处理空值和类型边界，后续接入 DTO、配置与数据库时越不容易积累隐患。

## 示例代码

### 1. 创建工程

在准备好的父目录执行：

```bash
nest new nest-course --package-manager pnpm --strict
```

这就是 Nest 官方 CLI 的脚手架创建方式。命令会创建目录、生成基础代码和工程配置，并自动安装依赖。

参数含义：

| 参数 | 作用 |
| --- | --- |
| `nest new nest-course` | 用脚手架创建名为 `nest-course` 的项目 |
| `--package-manager pnpm` | 使用 pnpm 安装依赖并生成锁文件 |
| `--strict` | 开启严格 TypeScript 配置 |

项目名建议使用小写字母和连字符，例如 `nest-course`。代码类名仍然使用 PascalCase。

### 2. 进入项目并检查依赖

```bash
cd nest-course
pnpm list @nestjs/core @nestjs/common
```

这两个包应显示 `11.x`。同时确认项目根目录只有 `pnpm-lock.yaml`，不要再执行 `npm install` 生成 `package-lock.json`。

### 3. 启动开发服务器

```bash
pnpm start:dev
```

终端出现类似下面的信息，表示应用已经监听端口：

```text
Nest application successfully started
```

`start:dev` 会监听源码变化并自动重新编译。这个终端需要保持运行，另开一个终端执行验证命令。

### 4. 验证首个响应

```bash
curl -i http://localhost:3000/
```

你应该看到 `HTTP/1.1 200 OK`，响应体通常为：

```text
Hello World!
```

也可以直接用浏览器访问 `http://localhost:3000/`。浏览器适合查看 GET 响应，后面的 POST、PATCH 和 DELETE 更适合使用 curl 或 API 客户端。

### 5. 认识三种启动方式

```bash
pnpm start
pnpm start:dev
pnpm build
pnpm start:prod
```

| 命令 | 用途 |
| --- | --- |
| `pnpm start` | 启动一次开发进程，不监听文件变化 |
| `pnpm start:dev` | 开发时监听文件并自动重启 |
| `pnpm build` | 把 TypeScript 编译到 `dist/` |
| `pnpm start:prod` | 运行已经构建的 `dist/main.js` |

`start:prod` 之前必须先执行 `pnpm build`，它不会替你编译源码。

## 常见错误

- 在目标目录内部又创建同名目录，最后得到 `nest-course/nest-course`。
- 终端提示 `nest: command not found`；应返回环境准备页安装并检查 Nest CLI。
- 创建过程中断后直接启动，忽略依赖并未完整安装。
- 开发服务器占住当前终端后，以为无法再执行 curl；应另开终端。
- 修改源码后使用 `start:prod`，却没有重新构建，因此看到旧代码。
- 只看到浏览器无法访问就判断 Nest 安装失败，没有先检查启动终端中的错误。

## 本节总结

`nest new` 创建的是一套完整工程基线。第一次学习时应先确认版本、成功启动、拿到 200 响应，再开始修改代码。

## 下一步

继续阅读 [目录与常用脚本](/guide/project-files)，认识 CLI 生成的每个关键文件以及一次修改如何进入运行中的应用。
