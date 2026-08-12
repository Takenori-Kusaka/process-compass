#!/usr/bin/env node
// 実装マークの検査と台帳生成(Issue #222)
//
// 標準の規定は、案件の実行層(process.config.json / CLAUDE.md など)へ降りて
// 初めて実行主体へ届く。降りていない規定は、案件からは「規定がない」ものとして
// 扱われる(#216 / #217)。本スクリプトは規定に付けた実装マークを収集し、
// 降ろし先が実在するかを機械的に確かめ、台帳を生成する。
//
// マークの書式(規約: community/implementation-marking.md):
//
//   <!-- impl IMPL-0001 target=config-roles state=delivered note="兼務の禁止" -->
//
// オプション:
//   --write   台帳ページ(community/implementation-ledger.md)を再生成する

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = 'src/content/docs';
const LEDGER_PATH = `${DOCS_ROOT}/community/implementation-ledger.md`;
const BASE_PATH = '/process-compass';
const TEMPLATE_ROOT = path.join(ROOT, 'template');

const STATES = { delivered: '降りている', undelivered: '**降りていない**' };

const MARK_RE = /<!--\s*impl\s+(IMPL-\d{4})\s+([^>]*?)-->/;
const MARK_LOOSE_RE = /<!--\s*impl\s/;

const args = new Set(process.argv.slice(2));
const errors = [];
const marks = [];

const registry = YAML.parse(readFileSync(path.join(ROOT, 'src/data/impl-targets.yaml'), 'utf8'));
const TARGETS = Object.fromEntries(registry.targets.map((t) => [t.id, t]));

/** src/content/docs/a/b.md -> /process-compass/a/b/ */
function toUrl(file) {
  const rel = file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
  const slug = rel.replace(/\/index$/, '').replace(/^index$/, '');
  return slug ? `${BASE_PATH}/${slug}/` : `${BASE_PATH}/`;
}

/** コードブロックの中身を空行へ置換し、行番号を保ったまま対象外にする */
function maskFences(lines) {
  const masked = [...lines];
  let fence = null;
  for (let i = 0; i < masked.length; i++) {
    const m = /^\s*(`{3,})/.exec(masked[i]);
    if (fence === null && m) {
      fence = m[1];
      masked[i] = '';
      continue;
    }
    if (fence !== null) {
      if (m && m[1].length >= fence.length) fence = null;
      masked[i] = '';
    }
  }
  return masked;
}

/** key=value / key="value を含む文字列" の並びを読む */
function parseAttrs(text) {
  const attrs = {};
  const re = /(\w+)=(?:"([^"]*)"|(\S+))/g;
  let m;
  while ((m = re.exec(text))) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

function collect(file) {
  const lines = maskFences(readFileSync(file, 'utf8').split(/\r?\n/));
  for (let i = 0; i < lines.length; i++) {
    if (!MARK_LOOSE_RE.test(lines[i])) continue;

    const m = MARK_RE.exec(lines[i]);
    if (!m) {
      errors.push(`${file}:${i + 1} 実装マークが書式に合致しません: ${lines[i].trim()}`);
      errors.push('  期待する書式: <!-- impl IMPL-0001 target=config-roles state=delivered note="..." -->');
      continue;
    }

    const [, id, rest] = m;
    const attrs = parseAttrs(rest);

    for (const key of ['target', 'state', 'note']) {
      if (!attrs[key]) errors.push(`${file}:${i + 1} ${id} に ${key} がありません`);
    }
    if (attrs.state && !STATES[attrs.state]) {
      errors.push(`${file}:${i + 1} ${id} の state が不正です: ${attrs.state}(delivered / undelivered)`);
    }
    if (attrs.target && !TARGETS[attrs.target]) {
      errors.push(
        `${file}:${i + 1} ${id} の target が登録簿にありません: ${attrs.target}` +
          `(src/data/impl-targets.yaml へ追加してください)`
      );
    }

    marks.push({
      id,
      file,
      line: i + 1,
      url: toUrl(file),
      target: attrs.target ?? '',
      state: attrs.state ?? '',
      note: attrs.note ?? '',
    });
  }
}

/**
 * 降ろし先が実在するかを確かめる。
 *
 * 台帳が「降ろしたつもり」の一覧になると、規定が降りていない状態を隠す。
 * config-key はサンプル回答から実際に構成を生成して確認する。
 */
async function verifyTargets(used) {
  const needConfig = [...used].some((id) => TARGETS[id]?.kind === 'config-key');
  let config = null;

  if (needConfig) {
    const gen = path.join(TEMPLATE_ROOT, 'scripts/init/generate-profile.mjs');
    if (!existsSync(gen)) {
      errors.push('template/ が初期化されていないため、降ろし先を確認できません(git submodule update --init)');
      return;
    }
    const m = await import(pathToFileURL(gen).href);
    config = m.buildConfig(
      {
        'q-team-size': 'size-1-2',
        'q-biz-phase': 'mvp',
        'q-quality': 'quality-high',
        'q-criticality': 'cl0',
        'q-dev-form': 'inhouse',
        'q-external-reviewer': 'reviewer-no',
        'q-existing-gates': 'gates-none',
        'q-ai-constraint': 'ai-free',
      },
      { generatedAt: 'check' }
    ).config;
  }

  for (const id of used) {
    const t = TARGETS[id];
    if (!t) continue;

    if (t.kind === 'config-key') {
      if (config && config[t.keyPath] === undefined) {
        errors.push(`降ろし先 ${id}: process.config.json に ${t.keyPath} がありません`);
      }
    } else if (t.kind === 'template-file') {
      if (!existsSync(path.join(TEMPLATE_ROOT, t.path))) {
        errors.push(`降ろし先 ${id}: template/${t.path} がありません`);
      }
    }

    if (t.check && !existsSync(path.join(TEMPLATE_ROOT, `scripts/gate/${t.check}.mjs`))) {
      errors.push(`降ろし先 ${id}: 検査 ${t.check} が template/scripts/gate/ にありません`);
    }
  }
}

function renderLedger(rows) {
  const out = [];
  const undelivered = rows.filter((m) => m.state === 'undelivered');

  if (undelivered.length) {
    out.push('### 降りていない規定');
    out.push('');
    out.push('次の規定は、実行層に対応する記述がありません。**案件からは「規定がない」ものとして扱われます**。');
    out.push('');
    out.push('| 識別子 | 規定 | 降ろし先(予定) | 記載箇所 |');
    out.push('| --- | --- | --- | --- |');
    for (const m of undelivered) {
      const page = m.file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
      out.push(`| ${m.id} | ${m.note} | ${TARGETS[m.target]?.name ?? m.target} | [${page}](${m.url}) |`);
    }
    out.push('');
  }

  out.push('### 全件');
  out.push('');
  out.push('| 識別子 | 規定 | 降ろし先 | 検査 | 状態 | 記載箇所 |');
  out.push('| --- | --- | --- | --- | --- | --- |');
  for (const m of rows) {
    const t = TARGETS[m.target];
    const page = m.file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
    out.push(
      `| ${m.id} | ${m.note} | ${t?.name ?? m.target} | ${t?.check ? `\`${t.check}\`` : '—'} | ` +
        `${STATES[m.state] ?? m.state} | [${page}](${m.url}) |`
    );
  }
  return out.join('\n');
}

function replaceBlock(text, body) {
  const start = '<!-- implementation-ledger:start -->';
  const end = '<!-- implementation-ledger:end -->';
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si === -1 || ei === -1) throw new Error(`${LEDGER_PATH} に ${start} / ${end} がありません`);
  return `${text.slice(0, si + start.length)}\n\n${body}\n\n${text.slice(ei)}`;
}

// --- 実行 ---

const files = [];
for await (const f of glob(`${DOCS_ROOT}/**/*.{md,mdx}`)) {
  const norm = f.replace(/\\/g, '/');
  if (norm.endsWith('community/implementation-ledger.md')) continue;
  if (norm.endsWith('community/implementation-marking.md')) continue;
  files.push(norm);
}
files.sort();
for (const f of files) collect(f);

const seen = new Map();
for (const m of marks) {
  if (seen.has(m.id)) {
    errors.push(`${m.file}:${m.line} 識別子 ${m.id} が重複しています(既出: ${seen.get(m.id)})`);
  } else {
    seen.set(m.id, `${m.file}:${m.line}`);
  }
}

marks.sort((a, b) => a.id.localeCompare(b.id));

await verifyTargets(new Set(marks.map((m) => m.target).filter((t) => TARGETS[t])));

const ledgerText = readFileSync(LEDGER_PATH, 'utf8');
const nextText = replaceBlock(ledgerText, renderLedger(marks));

if (args.has('--write')) {
  if (nextText !== ledgerText) {
    writeFileSync(LEDGER_PATH, nextText);
    console.log(`更新: ${LEDGER_PATH}`);
  } else {
    console.log(`変更なし: ${LEDGER_PATH}`);
  }
} else if (nextText !== ledgerText) {
  errors.push(`${LEDGER_PATH} が最新ではありません。'npm run impl:write' を実行してください`);
}

if (errors.length > 0) {
  console.error('実装マークの検査で問題が見つかりました:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n規約: ${DOCS_ROOT}/community/implementation-marking.md`);
  process.exit(1);
}

const undelivered = marks.filter((m) => m.state === 'undelivered');
console.log(`実装マーク: ${marks.length}件(降りていない規定: ${undelivered.length}件)`);
for (const m of undelivered) console.log(`  降りていない ${m.id} ${m.file}:${m.line} — ${m.note}`);
