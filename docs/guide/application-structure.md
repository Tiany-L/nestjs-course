---
title: Module / Controller / Service
description: 理解 NestJS 功能模块内 Controller、Service 和 Module 的责任分工。
---

# Module / Controller / Service

## 学习目标

- 把 HTTP 边界、业务逻辑和能力注册分开。
- 用构造函数注入让 Controller 调用 Service。
- 判断一段代码应属于哪个层次。
- 用功能目录组织同一业务的 Module、Controller、Service 与 DTO。

## 前置知识

已能根据 Controller 和方法装饰器计算最终 HTTP 路由。

## 原理

Controller 负责 HTTP 协议细节，Service 承载可复用的业务规则，Module 声明这个功能拥有哪些 Controller 和 Provider。

```text
HTTP Request
→ Controller：取参数、调用用例
→ Service：执行业务规则
→ Repository / Prisma：读写数据
```

依赖方向应从外层入口指向业务能力。Service 不应该反向依赖 Controller，也不应该为了读取参数而直接接收 Express 的 `Request` 对象。

## 示例代码

### 1. 按功能组织文件

```text
src/users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── user.model.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

这是“按功能”组织，而不是把整个项目拆成全局的 `controllers/`、`services/` 和 `dto/`。修改用户功能时，相关文件集中在一个边界内。

### 2. Service 实现用例

```ts
@Injectable()
export class UsersService {
  findAll() {
    return [{ id: 1, name: 'Alice' }];
  }
}
```

### 3. Controller 适配 HTTP

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

Controller 不关心数据来自内存、Prisma 还是远程服务，只依赖 `UsersService` 暴露的业务方法。

### 4. Module 完成组装

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### 5. 用职责问题判断代码位置

| 代码 | 建议位置 | 原因 |
| --- | --- | --- |
| 读取 `@Param('id')` | Controller | 属于 HTTP 输入映射 |
| 判断用户是否存在 | Service | 属于可复用业务规则 |
| 注册 `UsersService` | Module | 属于依赖组装 |
| 查询 `prisma.user` | Service 或 Repository | 属于数据访问 |
| 设置响应状态码 | Controller | 属于 HTTP 输出语义 |

一个请求应能从 Controller 追到 Service，再追到数据访问。层次不是为了增加文件，而是为了让每一层只有一种主要变化原因。

## 常见错误

- 在 Controller 里直接写数据库查询和复杂业务分支。
- 创建 Service 后忘记加入 Module 的 `providers`。
- 把 Module 当作执行业务的类；它的主要职责是组装和边界声明。
- 为只有一行转发逻辑的每个方法继续增加无意义层次。
- Service 返回 Express `Response`，导致业务代码无法脱离 HTTP 环境测试。

## 本节总结

Controller 处理 HTTP，Service 处理业务，Module 注册和组织能力。这个分工是后续 DI、测试和模块化的基础。

## 下一步

进入 [DTO 与 ValidationPipe](/guide/dto-validation)，在数据进入 Controller 之前建立可信边界。
