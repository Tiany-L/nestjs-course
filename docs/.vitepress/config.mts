import { defineConfig } from 'vitepress';

function normalizeBase(value: string | undefined) {
  if (!value) return '/';

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const base = normalizeBase(process.env.VITEPRESS_BASE);
const siteUrl = process.env.VITEPRESS_SITE_URL;

const sidebar = [
  {
    text: '快速开始',
    collapsed: false,
    items: [
      { text: 'NestJS 整体认知', link: '/guide/overview' },
      { text: '环境准备', link: '/guide/environment' },
      { text: '创建第一个项目', link: '/guide/create-project' },
      { text: '目录与常用脚本', link: '/guide/project-files' },
      { text: '启动与路由', link: '/guide/bootstrap-routing' },
      { text: '创建功能模块', link: '/guide/create-module' },
      { text: 'Controller 与请求参数', link: '/guide/controller-basics' },
      { text: 'Service 与依赖注入', link: '/guide/service-basics' },
      { text: 'Module / Controller / Service', link: '/guide/application-structure' },
      { text: 'DTO 与 ValidationPipe', link: '/guide/dto-validation' },
      { text: '内存版 Users CRUD', link: '/guide/in-memory-crud' },
    ],
  },
  {
    text: 'DI 与模块',
    collapsed: false,
    items: [
      { text: 'DI / IOC', link: '/core/di-ioc' },
      { text: '跨模块依赖', link: '/core/module-boundaries' },
      { text: '自定义 Provider', link: '/core/providers' },
      { text: '配置与启动校验', link: '/core/configuration' },
    ],
  },
  {
    text: 'Prisma 与 CRUD',
    collapsed: false,
    items: [
      { text: 'Prisma + MySQL', link: '/database/prisma-mysql' },
      { text: 'PrismaModule', link: '/database/prisma-module' },
      { text: 'Users CRUD 全链路', link: '/database/users-crud' },
    ],
  },
  {
    text: '认证与授权',
    collapsed: true,
    items: [
      { text: '密码与 bcrypt', link: '/auth/passwords' },
      { text: 'AuthModule 登录边界', link: '/auth/auth-module' },
      { text: 'JWT', link: '/auth/jwt' },
      { text: 'AuthGuard 与 @Public', link: '/auth/auth-guard-public' },
      { text: '@CurrentUser', link: '/auth/current-user' },
      { text: 'RBAC', link: '/auth/rbac' },
    ],
  },
  {
    text: '请求生命周期',
    collapsed: true,
    items: [
      { text: '内置异常', link: '/request/exceptions' },
      { text: 'Interceptor', link: '/request/interceptors' },
      { text: 'Exception Filter', link: '/request/exception-filters' },
      { text: 'Middleware', link: '/request/middleware' },
      { text: '完整请求链路', link: '/request/lifecycle' },
    ],
  },
  {
    text: '真实项目',
    collapsed: true,
    items: [
      { text: 'User 1:N Order', link: '/project/relations' },
      { text: '当前用户创建订单', link: '/project/current-user-orders' },
      { text: '分页、搜索与 Query DTO', link: '/project/query-pagination' },
      { text: '事务', link: '/project/transactions' },
    ],
  },
  {
    text: '测试与生产',
    collapsed: true,
    items: [
      { text: 'Swagger / OpenAPI', link: '/engineering/swagger' },
      { text: '测试', link: '/engineering/testing' },
      { text: '安全与工程化', link: '/engineering/security' },
      { text: '生产部署', link: '/engineering/deployment' },
      { text: '项目结构', link: '/engineering/project-structure' },
      { text: '三大核心原理', link: '/engineering/core-principles' },
      { text: '毕业检查表', link: '/engineering/graduation-checklist' },
    ],
  },
];

export default defineConfig({
  lang: 'zh-CN',
  title: 'NestJS 从零到真实项目',
  description: '从启动、DI 和请求管道，到 Prisma、JWT 与生产部署的中文 NestJS 教程。',
  base,
  lastUpdated: true,
  cleanUrls: false,
  sitemap: siteUrl ? { hostname: siteUrl } : undefined,
  head: [
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }],
    ['meta', { name: 'theme-color', content: '#d61f4b' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
  ],
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true,
    },
  },
  themeConfig: {
    logo: '/favicon.png',
    siteTitle: 'NestJS 实战教程',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路线', link: '/guide/overview' },
      { text: '核心机制', link: '/core/di-ioc' },
      { text: '数据与认证', link: '/database/prisma-mysql' },
      { text: '项目实战', link: '/project/relations' },
      { text: '工程化', link: '/engineering/swagger' },
    ],
    sidebar,
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到亮色主题',
    darkModeSwitchTitle: '切换到暗色主题',
    footer: {
      message: '以理解原理为目标的 NestJS 学习路线',
      copyright: 'NestJS Learning Notes',
    },
  },
});
