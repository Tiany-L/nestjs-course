---
title: 内存版 Users CRUD
description: 在接入 Prisma 前，用内存数组完成 Users 的创建、查询、更新和删除，串联 Module、Controller、Service、DTO 与异常处理。
---

# 内存版 Users CRUD

## 学习目标

- 在不接数据库的情况下跑通一套完整 CRUD。
- 把 DTO、Controller、Service 和异常组合起来。
- 理解 HTTP 状态码与 Service 返回值的关系。
- 建立接入 Prisma 前的可验证行为基线。

## 前置知识

已创建 `UsersModule`、`UsersController` 和 `UsersService`，并配置全局 `ValidationPipe`。示例需要安装 `class-validator`、`class-transformer` 与 `@nestjs/mapped-types`。

## 原理

数据库只是持久化实现。先用内存数组跑通请求边界和业务接口，可以把“路由是否正确”和“数据库是否连接”两类问题分开。

```text
HTTP Request
→ ValidationPipe + DTO
→ UsersController
→ UsersService
→ User[]
```

本节结束后，接口契约已经稳定。数据库阶段主要把 `User[]` 替换为 `PrismaService.user`，而不是重新设计所有路由。

## 示例代码

### 1. 定义 User 模型

创建 `src/users/user.model.ts`：

```ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

这是当前练习的内部模型，不是请求 DTO。模型描述系统中的数据，DTO 描述客户端允许提交的数据。

### 2. 定义创建与更新 DTO

`src/users/dto/create-user.dto.ts`：

```ts
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  name!: string;

  @IsEmail()
  email!: string;
}
```

`src/users/dto/update-user.dto.ts`：

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

`UpdateUserDto` 复用相同校验规则，但把字段变为可选，适合 PATCH 的部分更新语义。

### 3. 实现内存 Service

`src/users/users.service.ts`：

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private nextId = 1;

  create(dto: CreateUserDto): User {
    const user: User = {
      id: this.nextId++,
      ...dto,
    };

    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  update(id: number, dto: UpdateUserDto): User {
    const user = this.findOne(id);
    Object.assign(user, dto);
    return user;
  }

  remove(id: number): void {
    const user = this.findOne(id);
    const index = this.users.indexOf(user);
    this.users.splice(index, 1);
  }
}
```

`findOne()` 统一处理不存在的用户，让更新和删除复用同一个 404 规则。

### 4. 实现 Controller

`src/users/users.controller.ts`：

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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.usersService.remove(id);
  }
}
```

### 5. 确认模块注册

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

`UsersModule` 已被 `AppModule` 导入时，不需要再次在根模块注册 `UsersController` 或 `UsersService`。

### 6. 按顺序验证 CRUD

创建用户：

```bash
curl -i -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

查询列表和单个用户：

```bash
curl -i http://localhost:3000/users
curl -i http://localhost:3000/users/1
```

更新用户：

```bash
curl -i -X PATCH http://localhost:3000/users/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice Chen"}'
```

删除并验证 404：

```bash
curl -i -X DELETE http://localhost:3000/users/1
curl -i http://localhost:3000/users/1
```

还要主动测试错误输入：非法邮箱、多余字段、非数字 ID 和不存在的 ID。成功路径与失败路径都符合预期，接口才算完成。

## 常见错误

- 重启开发服务器后数据消失；内存数组不提供持久化，这是本节刻意保留的限制。
- 直接使用 `Partial<CreateUserDto>` 代替更新 DTO，导致运行时没有新的校验 Metadata。
- 删除接口返回 204 时仍返回 JSON；204 响应不应包含响应体。
- 在 Controller 中操作数组，让业务规则无法复用和测试。
- 接入数据库前没有验证 400、404、201 和 204，后续把 HTTP 问题误判为 Prisma 问题。

## 本节总结

这套内存 CRUD 已经建立完整的请求契约：DTO 保证输入，Controller 负责 HTTP，Service 负责操作与 404 规则，Module 负责组装。持久化实现可以替换，但这些边界不应随数据库改变。

## 下一步

进入 [DI / IOC](/core/di-ioc)，深入理解 Nest 为什么能创建 `UsersService` 并把同一个实例注入 `UsersController`。
