# NestJS 从零到真实项目

一个面向中文学习者的 NestJS 公开教程站，内容覆盖启动、依赖注入、请求生命周期、Prisma、JWT、RBAC、测试与生产部署。

## 本地开发

```bash
nvm use
corepack enable
pnpm install
pnpm docs:dev
```

开发服务默认访问 `http://localhost:5173/`。

## 质量检查

```bash
pnpm check
pnpm docs:build
pnpm exec playwright install chromium
pnpm test:ui
```

## 发布

`.github/workflows/deploy.yml` 会在 Pull Request 中执行内容检查、构建与浏览器测试；`main` 分支通过后自动发布到 GitHub Pages。
