---
title: Swagger / OpenAPI
description: 使用 @nestjs/swagger 从 NestJS Metadata 生成 OpenAPI 文档和带 Bearer Auth 的 Swagger UI。
---

# Swagger / OpenAPI

## 学习目标

- 从 Controller 和 DTO Metadata 生成 OpenAPI Document。
- 配置 Bearer Auth、标签、参数与响应描述。
- 将 OpenAPI 契约纳入评审和测试。

## 前置知识

已完成稳定的 Controller、DTO、认证和 HTTP 状态码设计。

## 原理

`@nestjs/swagger` 扫描 Controller、路由装饰器和 DTO Metadata，生成标准 OpenAPI JSON；Swagger UI 只是该文档的一个可交互渲染器。

```text
Nest Metadata → OpenAPI Document → Swagger UI / SDK / Contract Test
```

## 示例代码

```bash
pnpm add @nestjs/swagger
```

```ts
const config = new DocumentBuilder()
  .setTitle('Nest Demo API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, documentFactory);
```

```ts
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: '查询用户详情' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: '用户不存在' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {}
}
```

## 常见错误

- 把 Swagger UI 当成测试套件，用手工点击代替自动化验证。
- 只写成功响应，不记录 400、401、403、404 和 409。
- 直接暴露 Prisma Model 作为 API 响应契约，让数据库结构变更波及公开 API。

## 本节总结

OpenAPI 是可机器读取的 HTTP 契约，Swagger UI 是其中一个消费者。文档应与 DTO、状态码和认证边界一起演进。

## 下一步

学习 [测试](/engineering/testing)，从 DI 单元和完整 HTTP 链路两个层次验证行为。
