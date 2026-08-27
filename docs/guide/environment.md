---
title: 环境准备
description: 安装并验证 Node.js 22、pnpm 与 Nest CLI，为创建第一个 NestJS 11 项目准备一致的开发环境。
---

# 环境准备

## 学习目标

- 理解 Node.js、pnpm 和 Nest CLI 各自负责什么。
- 安装并验证本课程使用的开发环境。
- 安装 Nest CLI 11，并能直接使用 `nest` 命令。
- 能判断一个启动失败是环境问题、依赖问题还是端口问题。

## 前置知识

你需要会打开终端并执行命令。课程示例以 Node.js 22 LTS、NestJS 11 和 pnpm 为基线；MySQL 与 Prisma 会在数据库阶段单独安装。

## 原理

NestJS 最终运行在 Node.js 进程中。pnpm 负责下载和锁定依赖，Nest CLI 则负责创建工程、生成模块和执行构建等开发任务。

```text
Node.js：运行 JavaScript / TypeScript 编译产物
pnpm：安装依赖并执行 package.json 脚本
Nest CLI：创建项目、生成文件、调用编译工具
```

Nest CLI 不是应用运行时，但它是本课程使用的脚手架入口。全局安装后可以直接执行 `nest new` 创建项目，以及使用 `nest g` 生成 Module、Controller 和 Service。

## 示例代码

### 1. 检查 Node.js

```bash
node --version
```

版本应为 `v22.x.x`。如果电脑中有多个 Node.js 项目，建议使用 nvm、fnm 或 Volta 管理版本，但课程不绑定具体版本管理器。

安装完成后再检查 Node.js 自带的包管理入口：

```bash
corepack --version
```

### 2. 启用 pnpm

```bash
corepack enable
corepack prepare pnpm@11.0.8 --activate
pnpm --version
```

如果系统权限阻止 `corepack enable`，可以按照 pnpm 官方安装方式安装到当前用户目录。不要为了省事在不理解目标目录的情况下给命令加 `sudo`。

### 3. 安装 Nest CLI 11

```bash
pnpm add --global @nestjs/cli@11
nest --version
```

`nest --version` 应输出 `11.x`。全局安装的是工程脚手架；`@nestjs/common`、`@nestjs/core` 等应用运行时依赖仍由各个项目自己的 `package.json` 管理。

如果不希望全局安装，也可以临时运行同一版本：

```bash
pnpm dlx @nestjs/cli@11 --version
```

本课程后续以全局 `nest` 命令作为主线。

### 4. 做一次环境自检

```bash
node --version
pnpm --version
nest --version
```

三个命令都应正常输出版本且没有权限错误。此时还不需要安装 MySQL、Prisma、Docker 或全局 TypeScript。

### 5. 认识端口占用

Nest 默认监听 `3000` 端口。macOS 或 Linux 可以检查端口是否已被其他进程占用：

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

如果已有服务占用端口，可以先停止该服务，或在后续项目中设置其他端口。

## 常见错误

- Node.js 版本过旧，导致依赖安装或原生 Web API 不兼容。
- 同时使用 npm、pnpm 和 yarn，生成多份锁文件并让依赖树不一致。
- 全局 `nest` 是旧版本，却以为它一定与项目中的 `@nestjs/*` 版本相同。
- 全局安装 Nest CLI 后长期不检查版本，使用旧脚手架创建新项目。
- 继续把 TypeScript、Prisma 等项目运行依赖全部装到全局，导致工程本身缺少依赖声明。
- 看到端口占用就反复安装依赖；端口问题与依赖安装是两类故障。

## 本节总结

Node.js 提供运行时，pnpm 管理项目依赖，Nest CLI 提供 `nest new` 和 `nest g` 等脚手架命令。CLI 可以全局安装，应用运行依赖仍应保留在项目内部。

## 下一步

进入 [创建第一个项目](/guide/create-project)，用固定版本的 CLI 生成 NestJS 11 工程并启动开发服务器。
