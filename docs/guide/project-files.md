---
title: 目录与常用脚本
description: 认识 NestJS 新项目的源码、配置、测试和构建目录，理解 package.json 脚本背后的执行过程。
---

# 目录与常用脚本

## 学习目标

- 识别新项目中最重要的目录和配置文件。
- 说清 `src/main.ts`、`AppModule` 与 `dist/main.js` 的关系。
- 正确使用开发、构建、格式化和测试脚本。
- 知道哪些文件应该提交，哪些生成物不应该提交。

## 前置知识

已创建并成功启动 `nest-course` 项目，能通过 `GET /` 得到响应。

## 原理

Nest 项目可以先分成四类文件：源码、工程配置、测试和生成物。不要一开始逐行背配置，先知道修改某类问题时应该去哪一层查找。

```text
nest-course/
├── src/                    # 应用源码
│   ├── main.ts             # 进程入口
│   ├── app.module.ts       # 根模块
│   ├── app.controller.ts   # 示例 HTTP 入口
│   └── app.service.ts      # 示例业务 Provider
├── test/                   # 端到端测试
├── package.json            # 依赖与命令入口
├── pnpm-lock.yaml          # 精确依赖版本
├── nest-cli.json           # Nest CLI 编译配置
├── tsconfig.json           # TypeScript 基础配置
├── tsconfig.build.json     # 生产构建配置
└── eslint.config.mjs       # 静态检查规则
```

源码不会被 Node.js 直接当作生产入口运行。构建阶段会把 `src/main.ts` 及其依赖编译到 `dist/`，生产命令再运行 `dist/main.js`。

## 示例代码

### 1. 从入口追到根模块

`src/main.ts`：

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
```

`src/app.module.ts`：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

`main.ts` 把 `AppModule` 交给 Nest。Nest 再从根模块递归发现 Controller、Provider 和其他 Module。

### 2. 认识 package.json 脚本

常用命令如下：

```bash
pnpm start:dev
pnpm build
pnpm lint
pnpm format
pnpm test
pnpm test:e2e
```

输入 `pnpm <脚本名>` 时，pnpm 会读取 `package.json` 的 `scripts`。团队应把复杂命令固化为脚本，让本地和 CI 使用同一入口。

### 3. 修改默认响应

打开 `src/app.service.ts`：

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJS course is running';
  }
}
```

保存后观察 `start:dev` 终端重新编译，再验证：

```bash
curl http://localhost:3000/
```

### 4. 检查构建结果

```bash
pnpm build
ls dist
node dist/main.js
```

`dist/` 是生成物，可以删除后重新构建，不应手动编辑。通常提交 `src/`、配置文件、测试和锁文件，而忽略 `node_modules/`、`dist/` 与本地 `.env`。

## 常见错误

- 直接修改 `dist/`，下次构建后改动全部消失。
- 删除 `pnpm-lock.yaml`，让不同机器安装出不同的间接依赖。
- 把 `node_modules/` 提交到仓库，造成体积和平台兼容问题。
- 看到 `app.controller.spec.ts` 就删除全部测试配置；示例测试可以调整，但测试能力应保留。
- 只会运行 `nest start`，不知道实际团队入口应统一放在 `package.json` 脚本中。

## 本节总结

`src/` 是事实来源，`main.ts` 是入口，`AppModule` 是根边界，`dist/` 是可重建产物，`package.json` 脚本是团队统一操作入口。

## 下一步

进入 [启动与路由](/guide/bootstrap-routing)，理解 Nest 如何从根模块建立应用图并把 Controller 映射为 HTTP 路由。
