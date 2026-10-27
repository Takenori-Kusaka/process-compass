#!/usr/bin/env node
// 基底(既定は main)からの差分として、回帰の試験の「変わった場面」の一覧を出す(#319 裁定 R-4、§8 X-12)。
//
//   node scripts/regress/changed-scenes.mjs [--base REF] [--results DIR]
//
// run.mjs が書く changed.md は、これまでに改めたすべての場面の累積である。どの変更で改めたかを区別しない。
// PR の本文と CI の要約へ出し、人が確かめるのは、この変更で変わった場面である。そのため、基底との差分から次を出す:
//   1. 場面の一覧の宣言(expected/scenes/*.txt)の差: 消えた場面・足した場面
//   2. 期待値のファイル(expected/*.json)の差: 期待値の行の旧・新、changed・knownFailure の増減
//   3. 場面のスクリプト(suite/*.mjs)の差のうち、期待値を改めた記録(changed)と落ちることを期待する印(knownFailure)を含む行
//   4. --results を渡したとき: その実行の場面の記録から、changed を持つ場面の観測(新)を添える
// 確かめないこと: 改めた期待値が、引いた決定の中身に合っているか(人が差分で確かめる)。
// 結果は Markdown で標準出力へ書く(CI では $GITHUB_STEP_SUMMARY へ足す)。差が無ければその旨を書く。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const argv = process.argv.slice(2);
const opt = (n, d = null) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const BASE = opt('--base', 'main');
const RESULTS = opt('--results');
const rel = (p) => path.relative(REPO, p).split(path.sep).join('/');
// 基底に無いファイルの git show のエラーは、差分の「足した」として扱うため、標準エラーへ出さない
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const atBase = (file) => {
  try {
    return git('show', `${BASE}:${file}`);
  } catch {
    return null;
  }
};
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

try {
  git('rev-parse', '--verify', `${BASE}^{commit}`);
} catch {
  console.log(`## 回帰の試験の変わった場面\n\n基底 \`${BASE}\` を読めないため、差分を出さなかった(比べなかった)。`);
  process.exit(0);
}

const out = [`## 回帰の試験の変わった場面(基底 \`${BASE}\` との差分)`, ''];
let any = false;

// 1. 場面の一覧の宣言
const SCENES = path.join(HERE, 'expected', 'scenes');
const lines = (t) => (t ?? '').split('\n').filter((l) => l && !l.startsWith('# '));
const names = new Set([...(fs.existsSync(SCENES) ? fs.readdirSync(SCENES) : []), ...git('ls-tree', '--name-only', `${BASE}`, `${rel(SCENES)}/`).split('\n').filter(Boolean).map((f) => path.basename(f))]);
const sceneRows = [];
for (const f of [...names].filter((n) => n.endsWith('.txt')).sort()) {
  const now = fs.existsSync(path.join(SCENES, f)) ? lines(fs.readFileSync(path.join(SCENES, f), 'utf8')) : [];
  const base = lines(atBase(`${rel(SCENES)}/${f}`));
  const count = (list) => list.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map());
  const [cb, cn] = [count(base), count(now)];
  for (const [l, n] of cb) for (let i = 0; i < n - (cn.get(l) ?? 0); i++) sceneRows.push(`| ${f.replace(/\.txt$/, '')} | 消えた | ${cell(l)} |`);
  for (const [l, n] of cn) for (let i = 0; i < n - (cb.get(l) ?? 0); i++) sceneRows.push(`| ${f.replace(/\.txt$/, '')} | 足した | ${cell(l)} |`);
}
out.push('### 場面の一覧(expected/scenes)', '');
if (sceneRows.length) {
  any = true;
  out.push('| スクリプト | 差 | 場面 |', '| --- | --- | --- |', ...sceneRows, '');
} else out.push('差なし', '');

// 2. 期待値のファイル
const EXPECTED = path.join(HERE, 'expected');
const jsonRows = [];
for (const f of (fs.existsSync(EXPECTED) ? fs.readdirSync(EXPECTED) : []).filter((x) => x.endsWith('.json')).sort()) {
  const now = JSON.parse(fs.readFileSync(path.join(EXPECTED, f), 'utf8'));
  const baseText = atBase(`${rel(EXPECTED)}/${f}`);
  const base = baseText ? JSON.parse(baseText) : {};
  for (const group of Object.keys({ ...now, ...base })) {
    if (group.startsWith('_')) continue;
    const a = base[group] ?? {};
    const b = now[group] ?? {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const [x, y] = [JSON.stringify(a[k]), JSON.stringify(b[k])];
      if (x !== y) jsonRows.push(`| ${f} | ${group} | ${cell(k)} | ${cell(a[k] === undefined ? '(無し)' : typeof a[k] === 'string' ? a[k] : x)} | ${cell(b[k] === undefined ? '(無し)' : typeof b[k] === 'string' ? b[k] : y)} |`);
    }
  }
}
out.push('### 期待値のファイル(expected/*.json)', '');
if (jsonRows.length) {
  any = true;
  out.push('| ファイル | 群 | 行 | 旧 | 新 |', '| --- | --- | --- | --- | --- |', ...jsonRows, '');
} else out.push('差なし', '');

// 3. 場面のスクリプトの changed・knownFailure
const diff = git('diff', '-U0', BASE, '--', `${rel(path.join(HERE, 'suite'))}/`);
const hunks = [];
let file = null;
for (const l of diff.split('\n')) {
  const m = /^\+\+\+ b\/(.*)$/.exec(l);
  if (m) file = m[1];
  else if (/^[-+](?![-+])/.test(l) && /\b(changed|knownFailure|dependsOn)\b/.test(l)) hunks.push(`| ${cell(path.basename(file ?? ''))} | ${l[0] === '+' ? '足した' : '除いた'} | \`${cell(l.slice(1).trim().slice(0, 300))}\` |`);
}
out.push('### 場面のスクリプトの、期待値の改めと印(suite/*.mjs)', '');
if (hunks.length) {
  any = true;
  out.push('| スクリプト | 差 | 行 |', '| --- | --- | --- |', ...hunks, '');
} else out.push('差なし', '');

// 4. 実行の結果の観測
if (RESULTS && fs.existsSync(RESULTS)) {
  const rows = [];
  for (const f of fs.readdirSync(RESULTS).filter((x) => x.endsWith('.jsonl')).sort()) {
    for (const s of fs.readFileSync(path.join(RESULTS, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))) {
      for (const c of s.changed ?? []) rows.push(`| ${f.replace(/\.jsonl$/, '')} | ${cell(s.label)} | ${cell(c.by)} | ${cell(c.on)} | ${cell(c.from)} | ${cell(s.observed ?? (s.ok ? '(場面の期待どおり)' : '(落ちた)'))} |`);
    }
  }
  out.push('### 期待値を改めた場面の観測(この実行。累積)', '');
  out.push(rows.length ? ['| スクリプト | 場面 | 引いた決定 | 日付 | 旧い期待値 | いまの観測 |', '| --- | --- | --- | --- | --- | --- |', ...rows].join('\n') : 'なし', '');
}

if (!any) out.push('この変更で変わった場面は無い。');
console.log(out.join('\n'));
