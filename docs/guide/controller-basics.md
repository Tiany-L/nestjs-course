---
title: Controller 与请求参数
description: 创建 UsersController，学习路由装饰器以及 Param、Query、Body 的请求数据提取方式。
---

# Controller 与请求参数

## 学习目标

- 使用 CLI 创建并注册 Controller。
- 根据装饰器准确计算 HTTP 方法与最终路径。
- 区分 `@Param()`、`@Query()` 和 `@Body()`。
- 使用内置 Pipe 把路由参数转换为可信类型。

## 前置知识

已创建并导入 `UsersModule`，理解模块的 `controllers` 字段用于注册 HTTP 入口。

## 原理

Controller 位于 HTTP 边界。它读取请求中的路径、查询字符串和请求体，调用业务能力，再把结果交给 Nest 序列化为响应。

```text
HTTP 请求
→ 路由匹配
→ Controller 提取输入
→ 调用 Service
→ 返回响应
```

最终路由由 Controller 前缀和方法路径组合，HTTP 方法由 `@Get()`、`@Post()` 等装饰器决定。

## 示例代码

### 1. 生成 Controller

```bash
nest g controller users --no-spec
```

CLI 创建 `src/users/users.controller.ts`，并把 `UsersController` 加入 `UsersModule`：

```ts
@Module({
  controllers: [UsersController],
})
export class UsersModule {}
```

`--no-spec` 仅用于当前跟练时减少文件数量。真实项目应为关键 Controller 保留测试。

### 2. 创建基础路由

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Query('keyword') keyword?: string) {
    return { keyword: keyword ?? null };
  }

  @Get('profile')
  getProfile() {
    return { id: 1, name: 'Current user' };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return { id };
  }

  @Post()
  create(@Body() body: unknown) {
    return body;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return { id, body };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    void id;
  }
}
```

### 3. 对照请求位置

| 请求 | 提取方式 | 得到的值 |
| --- | --- | --- |
| `GET /users/12` | `@Param('id')` | 路径中的 `'12'` |
| `GET /users?keyword=nest` | `@Query('keyword')` | 查询值 `'nest'` |
| `POST /users` + JSON | `@Body()` | 解析后的请求体对象 |

HTTP 路径和查询字符串原本都是字符串。`ParseIntPipe` 会把合法数字转换成 `number`，非法值会在进入方法前得到 400 响应。

### 4. 用 curl 验证

```bash
curl -i http://localhost:3000/users/12
curl -i 'http://localhost:3000/users?keyword=nest'
curl -i -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice"}'
curl -i http://localhost:3000/users/not-a-number
```

`POST` 默认返回 201，普通 `GET` 返回 200，示例 `DELETE` 显式返回 204。不要把所有成功响应都机械改成 200。

## 常见错误

- 忘记 Controller 前缀，只用方法装饰器推算路径。
- 认为 `@Param('id') id: number` 会自动把字符串变成数字；类型标注本身不会转换 HTTP 数据。
- 把 `@Body()` 的原始对象直接当作已校验数据。
- 让动态路由 `:id` 掩盖固定语义路由，增加阅读和迁移适配器时的风险。
- 在 Controller 中开始堆数组查询、密码处理和数据库逻辑。

## 本节总结

Controller 负责 HTTP 映射与输入提取。装饰器描述路径和参数来源，Pipe 才负责运行时转换或校验，TypeScript 类型不能代替运行时边界。

## 下一步

进入 [Service 与依赖注入](/guide/service-basics)，把业务处理从 Controller 移到可复用、可测试的 Provider。
