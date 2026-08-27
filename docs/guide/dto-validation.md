---
title: DTO 与 ValidationPipe
description: 用 class-validator、class-transformer 和 ValidationPipe 完成 NestJS 请求体的运行时校验与转换。
---

# DTO 与 ValidationPipe

## 学习目标

- 区分 TypeScript 静态类型与 HTTP 运行时数据。
- 用 DTO 声明请求体结构与校验规则。
- 正确配置 `transform`、`whitelist` 和 `forbidNonWhitelisted`。
- 为创建、更新和查询分别设计 DTO。

## 前置知识

已理解 Controller 通过 `@Body()`、`@Param()` 和 `@Query()` 接收外部输入。

## 原理

TypeScript 类型会在编译后消失，客户端仍然可以发送任意 JSON。DTO 使用 `class` 保留运行时类信息，`class-validator` 装饰器保存校验 Metadata，`ValidationPipe` 在 Controller 执行前进行校验。

`transform: true` 会把素数据转成 DTO 实例；对 DTO 属性进行数字转换时，应显式使用 `@Type(() => Number)`，不要依赖隐式转换。

## 示例代码

### 1. 安装运行时校验依赖

```bash
pnpm add class-validator class-transformer @nestjs/mapped-types
```

### 2. 创建请求体 DTO

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

### 3. 派生更新 DTO

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

`PartialType()` 不只是 TypeScript 层面的可选字段，它还会复制校验 Metadata。单纯写 `Partial<CreateUserDto>` 只能改变静态类型，不能生成运行时 DTO 类。

### 4. 为查询参数做显式转换

```ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
}
```

查询字符串中的 `page=2` 原始值是字符串。`@Type(() => Number)` 在校验前完成明确转换，不依赖隐式行为。

### 5. 注册全局 ValidationPipe

```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

这段配置应放在 `NestFactory.create()` 之后、`app.listen()` 之前。

### 6. 在 Controller 使用 DTO

```ts
@Post()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateUserDto,
) {
  return this.usersService.update(id, dto);
}

@Get()
findAll(@Query() query: ListUsersQueryDto) {
  return this.usersService.findAll(query);
}
```

### 7. 主动验证失败路径

```bash
curl -i -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"A","email":"not-an-email","role":"admin"}'
```

名称过短、邮箱非法和多余的 `role` 都应让请求在 Controller 执行前返回 400。

<DocDiagram
  src="/images/optimized/validation-flow.webp"
  original="/images/original/validation-flow.png"
  alt="POST users 请求从 Body 提取、ValidationPipe 执行 DTO 校验到 Controller 成功或返回 400 的流程"
  caption="POST Body 经 ValidationPipe 和 DTO 进入 Controller 的流程"
  :width="1672"
  :height="941"
/>

## 常见错误

- 只写 `age: number` 就以为 HTTP 输入会被校验。
- 用 `interface` 承载需要运行时 Metadata 的 DTO。
- 同时开启 `whitelist` 和 `forbidNonWhitelisted` 后，仍认为未声明字段会被静默删除；实际会返回 400。
- 用同一个 DTO 同时承担创建、更新、数据库模型和响应序列化。
- 认为 `Partial<T>` 会自动复制 `class-validator` Metadata。
- 忘记给查询字符串中的数字做转换，导致 `@IsInt()` 校验字符串失败。

## 本节总结

DTO 描述外部输入的运行时契约，ValidationPipe 负责在进入业务前转换、过滤和拒绝不合法数据。

## 下一步

完成 [内存版 Users CRUD](/guide/in-memory-crud)，在接入数据库之前把路由、校验、分层与异常完整串起来。
