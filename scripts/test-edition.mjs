#!/usr/bin/env node
// 本標準の版の解決の試験(Issue #313 / ADR-0083 X-1)。
// 版の名は、発行の時点のコミット(と、発行の記録だけを足したコミット)をビルドしたときだけ付く。
// それ以外のコミットは作業中の版で、最後に発行した版を basedOn に持つ。一時の git リポジトリで確かめる

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { editionAt, editionLabel, editionProblems, WORKING_DRAFT } from './lib/edition.mjs';

let failed = 0;
let n = 0;
const check = (name, ok, detail = '') => {
  n++;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'NG  '} ${name}${ok ? '' : ` ${detail}`}`);
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'edition-'));
const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
git('init', '-q', '-b', 'main');
git('config', 'user.email', 't@example.com');
git('config', 'user.name', 't');
const write = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  fs.writeFileSync(path.join(dir, rel), text);
};
const commit = (msg) => {
  git('add', '-A');
  git('commit', '-q', '-m', msg);
  return git('rev-parse', 'HEAD');
};
try {
  write('src/content/docs/a.md', 'v1\n');
  write('src/data/edition.yaml', 'edition: null\n');
  const issued = commit('content of 第1版');
  write('src/data/edition.yaml', 'edition: 第1版\n');
  const record = commit('record 第1版');
  write('src/content/docs/a.md', 'v2\n');
  const later = commit('after 第1版');

  const none = { edition: null, issuedAt: null, history: [] };
  check('発行が無ければ、どのコミットも作業中の版(未発行)', editionAt(later, none, dir).edition === null && editionLabel(later, none, dir) === WORKING_DRAFT);
  const d = { edition: '第1版', issuedAt: '2026-11-01', history: [{ edition: '第1版', issuedAt: '2026-11-01', commit: issued, change: 'N', summary: 's', citationReview: 'r' }] };
  check('発行の時点のコミットは、発行した版の名を持つ', editionAt(issued, d, dir).edition === '第1版' && editionLabel(issued, d, dir) === '第1版(2026-11-01 発行)');
  check('発行の記録だけを足したコミットも、発行した版の名を持つ', editionAt(record, d, dir).edition === '第1版');
  const after = editionAt(later, d, dir);
  check('発行の後に内容を変えたコミットは、作業中の版(第1版の後)', after.edition === null && after.basedOn === '第1版' && editionLabel(later, d, dir) === '作業中の版(第1版の後)', JSON.stringify(after));
  check('不明なコミットは、作業中の版', editionAt('0'.repeat(40), d, dir).edition === null);
  check('発行の時点のコミットの無い履歴の行は、問題として出る', editionProblems({ ...d, history: [{ ...d.history[0], commit: undefined }] }).some((p) => /commit/.test(p)));
  check('書式の整った発行の記録は、問題を出さない', editionProblems(d).length === 0, JSON.stringify(editionProblems(d)));
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
if (failed) {
  console.error(`版の解決の試験: ${failed} 件が期待と異なります`);
  process.exit(1);
}
console.log(`版の解決の試験: ${n} 件が期待と一致しました`);
