---
title: Users CRUD 全链路
description: 用 Controller、DTO、Service 和 Prisma 完成用户列表、详情、创建、更新与删除。
---

# Users CRUD 全链路

## 学习目标

- 将五个 HTTP 路由映射到清晰的 Controller 方法。
- 在 Service 中处理资源不存在和唯一约束冲突。
- 正确区分 200、201、204、400、404 和 409。

## 前置知识

已完成全局 ValidationPipe 与 PrismaModule，并了解 Controller 只处理 HTTP 边界。

## 原理

CRUD 不是把 Prisma API 直接暴露给 Controller。Controller 负责路由和参数，Pipe 负责转换与校验，Service 表达“用户不存在”、“邮箱已占用”等业务语义，Prisma 负责持久化。

| 方法 | 路由 | 成功状态 |
| --- | --- | --- |
| GET | `/users` | 200 |
| GET | `/users/:id` | 200 |
| POST | `/users` | 201 |
| PATCH | `/users/:id` | 200 |
| DELETE | `/users/:id` | 204 |

## 示例代码

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
  }
}
```

```ts
async findOne(id: number) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException('用户不存在');
  return user;
}
```

<DocDiagram
  src="/images/optimized/users-crud.webp"
  original="/images/original/users-crud.png"
  alt="NestJS Users CRUD 五个接口通过路由、参数、Pipe、Controller、Service 和数据层返回成功或异常响应"
  caption="NestJS Users CRUD 完整请求流转"
  :width="1122"
  :height="1402"
/>

## 常见错误

- 将路由参数当作数字使用，却没有 `ParseIntPipe`。
- 删除成功返回 204 时仍返回 JSON 响应体。
- 把所有 Prisma 错误都返回 500；已知的唯一约束冲突应转成 409，资源不存在应转成 404。

## 本节总结

一条健康的 CRUD 链路有明确分层、可信参数、资源级错误语义和准确的 HTTP 状态码。

## 下一步

学习 [密码与 bcrypt](/auth/passwords)，为 Users 能力增加不可逆的密码存储。
