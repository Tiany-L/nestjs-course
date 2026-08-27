---
title: 测试
description: 使用 Nest TestingModule 进行 Service 单元测试，并通过 Supertest 验证完整 HTTP 请求链路。
---

# 测试

## 学习目标

- 使用 TestingModule 创建最小 DI 测试容器。
- 用 `useValue` 替换 PrismaService 等外部依赖。
- 用 E2E 测试覆盖 Guard、Pipe、Controller、Service 和响应。

## 前置知识

已理解 Provider Token、自定义 Provider 和完整请求生命周期。

## 原理

单元测试验证一个 Service 的分支和业务不变量，外部 Provider 用可控替身隔离。E2E 测试从 HTTP 进入，验证横切机制和模块组装是否与生产一致。

```text
Unit：Service + mock providers
E2E：HTTP → Guard → Pipe → Controller → Service → Response
```

## 示例代码

```ts
const prismaMock = {
  user: { findUnique: jest.fn() },
};

const moduleRef = await Test.createTestingModule({
  providers: [
    UsersService,
    { provide: PrismaService, useValue: prismaMock },
  ],
}).compile();

const service = moduleRef.get(UsersService);
```

```ts
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
}).compile();

app = moduleRef.createNestApplication();
configureApp(app); // 与 main.ts 共用 Pipe、CORS 等配置
await app.init();

await request(app.getHttpServer())
  .post('/auth/login')
  .send({ email: 'alice@example.com', password: 'correct-password' })
  .expect(201);
```

## 常见错误

- 在单元测试中连接真实数据库，让测试变慢且不稳定。
- E2E 应用没有安装与 `main.ts` 相同的全局 Pipe/Filter，造成测试和生产行为不一致。
- 只测成功路径，不覆盖认证失败、无权、资源不存在和事务回滚。

## 本节总结

DI 让单元测试能精确替换依赖，E2E 测试让完整请求管道得到保障。两者关注的失败类型不同，需要同时存在。

## 下一步

进入 [安全与工程化](/engineering/security)，将认证之外的 HTTP 防护、限流、日志和 Token 生命周期纳入系统。
