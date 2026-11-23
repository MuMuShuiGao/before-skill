#!/usr/bin/env node
// 扫描 docs/ 下所有 .md，把「链接 + 状态 + 摘要」写回 INDEX.md 的 AUTO-INDEX 块。
// 标记之外的手写内容不动。可重复执行。

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, basename, sep } from 'node:path';

const BEGIN = '<!-- BEGIN AUTO-INDEX -->';
const END = '<!-- END AUTO-INDEX -->';
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build']);
const RECENT_LIMIT = 5;
const WARN_LIMIT = 12;

const SECTIONS = [
  { dir: '.', label: '根文档' },
  { dir: 'decisions', label: '决策记录（ADR）' },
  { dir: 'design', label: '正式设计' },
  { dir: 'refactor', label: '重构专项' },
  { dir: 'templates', label: '模板' },
];

function fail(msg) {
  console.log(`✗ ${msg}`);
  process.exit(1);
}

function walk(root, rel = '') {
  const out = [];
  const abs = join(root, rel);
  let entries;
  try {
    entries = readdirSync(abs, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const childRel = rel ? `${rel}${sep}${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      if (!ent.name.startsWith('.') && !IGNORE_DIRS.has(ent.name)) out.push(...walk(root, childRel));
    } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
      out.push(childRel);
    }
  }
  return out;
}

const strip = (s) =>
  s
    .replace(/^#+\s*/, '')
    .replace(/^\s*>\s*/, '')
    .replace(/\*\*/g, '')
    .trim();

function pick(lines, labels) {
  const re = new RegExp(`^\\s*>?\\s*\\*{0,2}(?:${labels.join('|')})\\*{0,2}\\s*[：:]\\s*(.+?)\\s*$`, 'i');
  for (let i = 0; i < Math.min(lines.length, 25); i += 1) {
    const m = lines[i].match(re);
    if (m) return strip(m[1]);
  }
  return '';
}

function parseDoc(root, rel) {
  const abs = join(root, rel);
  let text;
  try {
    text = readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
  const lines = text.split(/\r?\n/);
  const heading = lines.find((l) => /^#\s+\S/.test(l)) || '';
  const name = basename(rel, '.md').replace(/\.md$/, '');
  const isTemplate = rel.split(sep)[0] === 'templates';
  const fallback = isTemplate ? `${name} 模板` : name;
  return {
    rel,
    link: rel.split(sep).join('/'),
    dir: rel.includes(sep) ? rel.split(sep)[0] : '.',
    title: heading ? strip(heading) : fallback,
    status: pick(lines, ['状态', 'Status']),
    summary: pick(lines, ['摘要', 'Summary']),
    mtime: statSync(abs).mtimeMs,
  };
}

const isPlaceholder = (v) => !v || /^<.*>$/.test(v);

function esc(cell) {
  return cell.replace(/\|/g, '\\|');
}

function fmtDate(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderBlocks(docs) {
  const known = new Map(SECTIONS.map((s) => [s.dir, []]));
  const extra = new Map();
  for (const d of docs) {
    if (known.has(d.dir)) known.get(d.dir).push(d);
    else {
      if (!extra.has(d.dir)) extra.set(d.dir, []);
      extra.get(d.dir).push(d);
    }
  }
  const sort = (a, b) => a.link.localeCompare(b.link, 'zh', { numeric: true });
  const sections = [
    ...SECTIONS.map((s) => ({ label: s.label, items: (known.get(s.dir) || []).sort(sort) })),
    ...[...extra.keys()].sort().map((dir) => ({ label: `${dir}/`, items: extra.get(dir).sort(sort) })),
  ];

  const blocks = [];
  for (const sec of sections) {
    if (!sec.items.length) continue;
    const rows = sec.items.map(
      (d) =>
        `| [${esc(d.title)}](${d.link}) | ${esc(d.status || '—')} | ${esc(d.summary || '—')} |`,
    );
    blocks.push(
      [`### ${sec.label}`, '', '| 文档 | 状态 | 说明 |', '| --- | --- | --- |', ...rows].join('\n'),
    );
  }

  const recent = docs
    .filter((d) => d.dir !== 'templates' && d.link !== 'INDEX.md')
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, RECENT_LIMIT);
  if (recent.length) {
    const rows = recent.map(
      (d) => `| ${fmtDate(d.mtime)} | [${esc(d.title)}](${d.link}) | ${esc(d.status || '—')} |`,
    );
    blocks.push(
      [
        '### 最近改动',
        '',
        '| 时间 | 文档 | 状态 |',
        '| --- | --- | --- |',
        ...rows,
      ].join('\n'),
    );
  }
  return { blocks, sections };
}

function main() {
  const rootArg = process.argv[2] || 'docs';
  if (!existsSync(rootArg) || !statSync(rootArg).isDirectory()) {
    fail(`${rootArg} 不存在或不是目录。用法：node reindex.mjs [docs-dir]，默认 ./docs`);
  }

  const rels = walk(rootArg).filter((r) => {
    const name = basename(r).toLowerCase();
    return name !== 'index.md' && name !== 'readme.md';
  });
  const docs = rels.map((r) => parseDoc(rootArg, r)).filter(Boolean);
  if (!docs.length) fail(`${rootArg} 下没有找到任何 .md 文档`);

  const missing = [];
  for (const d of docs) {
    const placeholdersAllowed = d.dir === 'templates';
    const gaps = [];
    if (!d.status) gaps.push('缺 状态');
    else if (!placeholdersAllowed && isPlaceholder(d.status)) gaps.push('状态未填');
    if (!d.summary) gaps.push('缺 摘要');
    else if (!placeholdersAllowed && isPlaceholder(d.summary)) gaps.push('摘要未填');
    if (gaps.length) missing.push({ link: d.link, gaps });
  }

  const { blocks } = renderBlocks(docs);
  const generated = [
    `> 本节由 \`scripts/reindex.mjs\` 生成于 ${fmtDate(Date.now())}，共 ${docs.length} 篇文档。请勿手改。`,
    '',
    blocks.join('\n\n'),
  ].join('\n');

  const indexPath = join(rootArg, 'INDEX.md');
  let body;
  let created = false;
  if (existsSync(indexPath)) {
    const cur = readFileSync(indexPath, 'utf8');
    const a = cur.indexOf(BEGIN);
    const b = cur.indexOf(END);
    if (a !== -1 && b !== -1 && b > a) {
      body = `${cur.slice(0, a + BEGIN.length)}\n\n${generated}\n\n${cur.slice(b)}`;
    } else {
      body = `${cur.replace(/\s*$/, '')}\n\n## 文档清单\n\n${BEGIN}\n\n${generated}\n\n${END}\n`;
      created = true;
    }
  } else {
    body = `# 项目索引\n\n> 状态：生效中\n> 摘要：docs/ 全部文档的总目录\n\n## 文档清单\n\n${BEGIN}\n\n${generated}\n\n${END}\n`;
    created = true;
  }
  writeFileSync(indexPath, body, 'utf8');

  console.log(`✓ ${indexPath} 已重建（${docs.length} 篇文档）`);
  if (created) console.log(`  注意：原文件没有 AUTO-INDEX 标记，已在末尾补上一对。`);
  const perSection = SECTIONS.map((s) => {
    const n = docs.filter((d) => (s.dir === '.' ? !d.rel.includes(sep) : d.dir === s.dir)).length;
    return n ? `${n} ${s.label.replace(/（.*）$/, '').replace('根文档', '根')}` : '';
  }).filter(Boolean);
  if (perSection.length) console.log(`  ${perSection.join(' · ')}`);

  if (missing.length) {
    console.log(`\n! ${missing.length} 篇文档的头部需要补全（模板要求 > 状态： 和 > 摘要： 两行）`);
    for (const m of missing.slice(0, WARN_LIMIT)) console.log(`  - ${m.link}：${m.gaps.join('、')}`);
    if (missing.length > WARN_LIMIT) console.log(`  … 还有 ${missing.length - WARN_LIMIT} 篇`);
  }
}

try {
  main();
} catch (err) {
  fail(`重建失败：${err && err.message ? err.message : String(err)}`);
}
