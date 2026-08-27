---
title: 生产部署
description: 建立包含锁定依赖、Prisma Client 生成、测试、生产迁移、健康检查与优雅关闭的部署流程。
---

# 生产部署

## 学习目标

- 区分开发迁移与生产迁移命令。
- 按可重复顺序安装、生成、测试、构建和发布。
- 通过健康检查和优雅关闭控制流量切换。

## 前置知识

已具备自动化测试、Prisma Migration 和已校验的环境配置。

## 原理

生产发布必须从锁定依赖得到可重复产物，先通过测试与构建，再用已评审的 Migration 更新数据库。应用只在健康检查通过后接收流量。

```text
pnpm install --frozen-lockfile
→ prisma generate
→ lint / unit / e2e
→ pnpm build
→ prisma migrate deploy
→ 启动新版本
→ readiness 通过
→ 切换流量
```

## 示例代码

```bash
# 开发环境创建迁移
pnpm exec prisma migrate dev --name add_order_status

# 生产环境只应用已提交迁移
pnpm exec prisma migrate deploy
```

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
```

`@nestjs/terminus` 可用于 liveness/readiness 检查。Readiness 可检查应用是否能接收流量，liveness 只用于判断进程是否需要重启。

## 常见错误

- 在生产中执行 `prisma migrate reset`，这会删除数据。
- 容器开始接收流量后才进行 Migration，造成新代码与旧 Schema 短暂不兼容。
- 将“进程正在运行”当成“数据库和依赖都可用”。

## 本节总结

部署是一条受测试、数据库迁移和健康状态约束的流量切换过程，不是简单的“构建后启动”。

## 下一步

学习 [项目结构](/engineering/project-structure)，确保代码边界能支撑持续测试与发布。
