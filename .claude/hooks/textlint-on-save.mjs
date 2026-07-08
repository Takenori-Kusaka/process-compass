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
if (!/src\/content\/docs\/.+\.(md|mdx)$/.test(normalized) && !/README\.md$/.test(normalized)) {
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
