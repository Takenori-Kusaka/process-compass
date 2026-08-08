#!/usr/bin/env node
/**
 * PostToolUse hook: src/content/docs 配下の .md / .mdx を Edit/Write した直後に
 * その1ファイルへ textlint を実行する。違反があれば exit 2 で Claude にフィードバックし、
 * その場で修正させる(CLAUDE.md の「push 前に check」を強制層で保証する)。
 */
import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

let filePath = '';
try {
  filePath = JSON.parse(input)?.tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}

const normalized = filePath.replace(/\\/g, '/');

// 本リポジトリの外のファイルは対象にしない。
// サブモジュール(zenn / template)は別リポジトリであり、それぞれ自分の校正設定を持つ。
// 媒体が違うものへ規程文書向けの規約を当てると、どちらかが不自然になる。
const repoRoot = process.cwd().replace(/\\/g, '/');
if (!normalized.startsWith(repoRoot)) process.exit(0);
const relative = normalized.slice(repoRoot.length).replace(/^\//, '');
if (/^(zenn|template|node_modules|dist)\//.test(relative)) process.exit(0);

if (!/^src\/content\/docs\/.+\.(md|mdx)$/.test(relative) && relative !== 'README.md') {
  process.exit(0);
}

const res = spawnSync(`npx textlint --format compact "${filePath}"`, {
  shell: true,
  encoding: 'utf8',
  timeout: 60000,
});

if (res.status !== 0) {
  console.error(`textlint 違反があります。修正してください:\n${res.stdout || ''}${res.stderr || ''}`);
  process.exit(2);
}
process.exit(0);
