import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const projectRoot = process.cwd();
const docsRoot = join(projectRoot, 'docs');
const lessons = [];
const errors = [];

async function walk(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === 'cache') continue;
      files.push(...(await walk(path, extensions)));
    } else if (!extensions || extensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

function report(file, message) {
  errors.push(`${relative(projectRoot, file)}: ${message}`);
}

function parseDocument(source) {
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---\n/);
  const frontmatter = frontmatterMatch?.[1] ?? '';
  const body = frontmatterMatch ? source.slice(frontmatterMatch[0].length) : source;
  const lines = body.split('\n');
  const contentLines = [];
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) contentLines.push(line);
  }

  return { frontmatter, body, content: contentLines.join('\n') };
}

function resolveDocLink(file, target) {
  const withoutHash = target.split('#')[0].split('?')[0];
  if (!withoutHash) return file;

  if (withoutHash.startsWith('/')) {
    const route = withoutHash === '/' ? 'index' : withoutHash.slice(1);
    return resolve(docsRoot, route);
  }

  return resolve(file, '..', withoutHash);
}

function docTargetExists(path) {
  if (existsSync(path)) return true;
  if (!extname(path) && existsSync(`${path}.md`)) return true;
  return existsSync(join(path, 'index.md'));
}

function validateMarkdown(file, source) {
  const { frontmatter, body, content } = parseDocument(source);
  const isHome = file === join(docsRoot, 'index.md');

  if (!frontmatter) report(file, '缺少 frontmatter');
  if (!/^title:\s*.+$/m.test(frontmatter)) report(file, 'frontmatter 缺少 title');
  if (!/^description:\s*.+$/m.test(frontmatter)) report(file, 'frontmatter 缺少 description');

  const h1Count = (content.match(/^#\s+.+$/gm) ?? []).length;
  if (h1Count !== 1) report(file, `应有且仅有一个 H1，当前为 ${h1Count}`);

  let previousLevel = 0;
  for (const match of content.matchAll(/^(#{1,6})\s+(.+)$/gm)) {
    const level = match[1].length;
    if (previousLevel && level > previousLevel + 1) {
      report(file, `标题层级从 H${previousLevel} 跳到 H${level}：${match[2]}`);
    }
    previousLevel = level;
  }

  if (!isHome) {
    lessons.push(file);
    const requiredHeadings = [
      '学习目标',
      '前置知识',
      '原理',
      '示例代码',
      '常见错误',
      '本节总结',
      '下一步',
    ];
    for (const heading of requiredHeadings) {
      if (!content.includes(`## ${heading}`)) report(file, `缺少统一章节：${heading}`);
    }
  }

  for (const match of body.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+['\"][^)]*['\"])?\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
    const resolved = resolveDocLink(file, target);
    if (!docTargetExists(resolved)) report(file, `内部链接不存在：${target}`);
  }

  for (const match of body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (!match[1].trim()) report(file, `图片缺少替代文本：${match[2]}`);
  }

  for (const match of body.matchAll(/<DocDiagram\s+([\s\S]*?)\/>/g)) {
    const attrs = new Map(
      [...match[1].matchAll(/:?([a-zA-Z]+)="([^"]*)"/g)].map((item) => [item[1], item[2]]),
    );
    for (const attr of ['src', 'original', 'alt', 'caption', 'width', 'height']) {
      if (!attrs.get(attr)?.trim()) report(file, `DocDiagram 缺少 ${attr}`);
    }
    for (const attr of ['src', 'original']) {
      const value = attrs.get(attr);
      if (!value?.startsWith('/')) {
        report(file, `DocDiagram ${attr} 必须使用从 public 根目录开始的路径`);
      } else if (!existsSync(join(docsRoot, 'public', value))) {
        report(file, `DocDiagram ${attr} 文件不存在：${value}`);
      }
    }
  }
}

async function validateDuplicateAssets() {
  const imageRoot = join(docsRoot, 'public', 'images');
  const images = await walk(imageRoot, new Set(['.png', '.webp']));
  const hashes = new Map();

  for (const file of images) {
    const hash = createHash('sha256').update(await readFile(file)).digest('hex');
    const key = `${extname(file)}:${hash}`;
    const duplicate = hashes.get(key);
    if (duplicate) report(file, `与 ${relative(projectRoot, duplicate)} 内容重复`);
    else hashes.set(key, file);
  }
}

const markdownFiles = await walk(docsRoot, new Set(['.md']));
for (const file of markdownFiles) validateMarkdown(file, await readFile(file, 'utf8'));
await validateDuplicateAssets();

if (lessons.length !== 40) {
  errors.push(`课程页面数量应为 40，当前为 ${lessons.length}`);
}

if (errors.length) {
  console.error(`\n内容检查失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`内容检查通过：${markdownFiles.length} 个 Markdown 文件，${lessons.length} 个课程页面。`);
}
