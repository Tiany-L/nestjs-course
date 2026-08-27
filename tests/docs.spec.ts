import { expect, test, type Page } from '@playwright/test';

const consoleErrorsByPage = new WeakMap<Page, string[]>();
const failedResponsesByPage = new WeakMap<Page, string[]>();

function normalizeBase(value: string | undefined) {
  if (!value) return '/';

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const base = normalizeBase(process.env.VITEPRESS_BASE);

function sitePath(path = '') {
  return `${base}${path.replace(/^\//, '')}`;
}

test.beforeEach(async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  consoleErrorsByPage.set(page, consoleErrors);
  failedResponsesByPage.set(page, failedResponses);
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const location = message.location();
      consoleErrors.push(`${message.text()} @ ${location.url || 'unknown'}:${location.lineNumber}`);
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.goto(sitePath());
  await page.waitForLoadState('networkidle');
});

test.afterEach(async ({ page }) => {
  const failedResponses = failedResponsesByPage.get(page) ?? [];
  const consoleErrors = (consoleErrorsByPage.get(page) ?? []).filter((message) => {
    const isOriginFaviconProbe =
      base !== '/' &&
      message.includes('Failed to load resource: the server responded with a status of 404') &&
      /\/favicon\.ico:0$/.test(message) &&
      !message.includes(`${base}favicon.ico`);
    return !isOriginFaviconProbe;
  });
  expect(failedResponses, `失败的资源请求：${failedResponses.join('\n')}`).toEqual([]);
  expect(consoleErrors, `浏览器控制台错误：${consoleErrors.join('\n')}`).toEqual([]);
});

test('首页展示学习路线且没有页面级横向滚动', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'NestJS 从零到真实项目' })).toBeVisible();
  await expect(page.getByRole('link', { name: '开始学习' })).toBeVisible();
  await expect(page.getByRole('link', { name: '查看学习路线' })).toBeVisible();
  await expect(page.locator('.home-hero-visual')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '七阶段学习路线' })).toBeVisible();
  await expect(page.locator('.learning-path > a')).toHaveCount(7);
  await expect(page.locator('.course-audience__item')).toHaveCount(3);
  await expect(page.locator('.VPLastUpdated')).toHaveCount(0);
  await expect(page.locator(`link[href="${sitePath('favicon.ico')}"]`)).toHaveCount(1);
  await expect(page.locator(`link[href="${sitePath('favicon.png')}"]`)).toHaveCount(1);

  const [icoResponse, pngResponse] = await Promise.all([
    page.request.get(sitePath('favicon.ico')),
    page.request.get(sitePath('favicon.png')),
  ]);
  expect(icoResponse.ok()).toBe(true);
  expect(pngResponse.ok()).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test('整体认知页使用从首页迁移的全流程总图', async ({ page }) => {
  await page.goto(sitePath('/guide/overview.html'));
  await expect(page.getByRole('heading', { level: 1, name: 'NestJS 整体认知' })).toBeVisible();
  await expect(page.locator('.VPLastUpdated')).toBeVisible();

  const diagram = page.locator('.doc-diagram');
  await expect(diagram.getByRole('button', { name: '放大查看：NestJS 全流程架构学习总图' })).toBeVisible();
  await expect(diagram.locator('img')).toHaveAttribute(
    'src',
    sitePath('/images/optimized/full-architecture.webp'),
  );
  await expect(diagram.locator('.doc-diagram__original')).toHaveAttribute(
    'href',
    sitePath('/images/original/full-architecture.png'),
  );
});

test('文档页可导航、放大图片并用 Escape 关闭', async ({ page }) => {
  await page.goto(sitePath('/guide/dto-validation.html'));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'DTO 与 ValidationPipe' })).toBeVisible();

  const trigger = page.locator('.doc-diagram__trigger');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const actualSizeButton = dialog.getByRole('button', { name: '100% 查看' });
  await expect(actualSizeButton).toBeVisible();
  const imageFitsViewport = await dialog.locator('img').evaluate((image) => {
    const rect = image.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= window.innerWidth;
  });
  expect(imageFitsViewport).toBe(true);
  await actualSizeButton.click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('搜索可找到中文与技术关键词', async ({ page }) => {
  const searchButton = page.getByRole('button', { name: '搜索文档' }).first();
  await searchButton.click();
  const searchbox = page.getByRole('searchbox');
  await searchbox.fill('ValidationPipe');
  await expect(page.getByText('DTO 与 ValidationPipe', { exact: false }).first()).toBeVisible();
});

test('亮暗主题可切换', async ({ page }) => {
  const mobileNavigation = page.getByRole('button', { name: 'mobile navigation' });
  if (await mobileNavigation.isVisible()) {
    await mobileNavigation.click();
  }

  const themeSwitch = page.locator('.VPSwitchAppearance:visible');
  await expect(themeSwitch).toBeVisible();
  await themeSwitch.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
