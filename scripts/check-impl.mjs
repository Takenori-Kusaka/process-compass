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
//   <!-- impl IMPL-0001 target=config-roles state=delivered check=machine note="兼務の禁止" -->
//
// state(降りているか)と check(規定の中身を何が確かめるか)は別の事実である(ADR-0061)。
// 降ろし先の実在は本スクリプトが確かめる。規定の中身が検査されているかは check が示す。
// #314 / ADR-0084 で次を足した:
//   - check を欠くマークを落とす。check=machine は test= で試験を名指し、試験が IMPL-NNNN:ng と IMPL-NNNN:ok の
//     目印を持ち、必須の集約(テンプレートは gate-g5.yml の集約が使うジョブの run:、親は package.json の check)から
//     実行されることを確かめる。この確かめは、試験の中身が規定を正しく確かめていることを示さない
//   - check=presence の注記に、規則を運ぶ単位(単位: 欄 / キー / 行 / ファイル)を求める
//   - state=undelivered に plan(scheduled: issue・review / adopter: decision)を求める。
//     採用者が実装するにできない節(src/data/impl-no-adopter.yaml)では adopter を落とす
//   - 逆向きの追跡: テンプレートのゲートのスクリプト・フック・ワークフロー・エージェントの設定(.claude/*.json)・
//     ルールセット(.github/rulesets/*.json)が、登録簿か除外の一覧(src/data/impl-untraced.yaml)にあること
//   - check=manual の注記に確かめる者を求める。:ng と :ok の目印が別の行にあること、試験の手順が || true・if:・
//     continue-on-error を持たないことを確かめる(#314 の突合 X-6・X-11)
//   - 降りていない規定の順序の第2段・第3段を、節の鍵の登録簿(impl-no-adopter.yaml・impl-decision-sections.yaml)で決める(X-13)
//   - スキルの文の範囲の外の否定の件数を台帳へ書き出す(scripts/lib/skill-provisions.mjs。X-15)
//   - テンプレートのコード・スキルに書かれた IMPL 番号が標準に実在すること
//
// 対象の棚卸し(Issue #292 / ADR-0076): 対象のページ(本文8章・規定の附属書・フェーズ5・6)の
// 節ごとに、区分(マーク済み / 判定基準の表 / 対象にしない / 未棚卸し)が登録簿
// src/data/impl-inventory.yaml にあることを確かめる。登録の無い節、消えた鍵、台帳に無い識別子、
// 「対象にしない」の節のマーク、基準線(src/data/impl-inventory-baseline.yaml)に無い未棚卸しは失敗。
// 節の中の規定の網羅と、区分の判断の正しさは確かめない。
// コードブロックの中のマークは失敗(台帳に載らず、読者には文字列のまま表示されるため)。
//
// オプション:
//   --write   台帳ページ(community/implementation-ledger.md)を再生成する

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { missingInputs, describeMissing, INIT_HINT } from './lib/inputs.mjs';
import {
  MARK_RE,
  MARK_LOOSE_RE,
  maskFences,
  marksInFences,
  parseSections,
  checkInventory,
  summarize,
  STATUSES,
  plannedProblem,
  renderUndelivered,
  markAttrProblems,
  machineTestProblems,
  parentTestWired,
  templateTestWired,
  undeliveredRank,
  overdueCount,
  untracedProblems,
  sectionKeyMatches,
  PLANS,
  OVERDUE_PREFIX,
} from './lib/impl-inventory.mjs';
import { scanSkillProvisions } from './lib/skill-provisions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = 'src/content/docs';
const LEDGER_PATH = `${DOCS_ROOT}/community/implementation-ledger.md`;
const BASE_PATH = '/process-compass';
/** 見直しの年月を過ぎた計画を数える基準の月(生成した時点。台帳の鮮度の比較では、この件数の行を除く) */
const MONTH = new Date().toISOString().slice(0, 7);
const TEMPLATE_ROOT = path.join(ROOT, 'template');

const STATES = { delivered: '降りている', undelivered: '**降りていない**' };

/** 検査の手段(ADR-0061)。#314 以後、属性を欠くマークは検査が落とす(ADR-0084 決定1) */
const CHECKS = {
  machine: '機械が確かめる',
  presence: '実在だけ確かめる',
  manual: '人が確かめる',
};

const INVENTORY_PATH = 'src/data/impl-inventory.yaml';
const BASELINE_PATH = 'src/data/impl-inventory-baseline.yaml';
/**
 * 基準線の凍結時(2026-10-23)の要約。鍵(857 件)を整列し、改行で連ねた文字列の SHA-256(baselineDigest)。
 * 基準線のファイルは編集しない。鍵の追加・削除・入れ替えのどれでも食い違い、検査が失敗する(突合 X-1)
 */
const BASELINE_DIGEST = '59c751b0d0dcf2bc01857405fd30d97fcdeb9aa9dc22c6584853e10b03e896e5';
/**
 * 棚卸し済みの節を未棚卸しへ戻していないかを比べる基点(突合 X-2)。既定は origin/main。
 * CI は IMPL_BASE_REF で基点を渡す。基点の登録簿が読めない環境では比べず、比べなかったことを出力する
 */
const BASE_REF = process.env.IMPL_BASE_REF || 'origin/main';
/** 基準線の外で節の区分を判定した件数を見るための、対象のフェーズのディレクトリ */
const PHASE_DIRS = { 'phase5-implementation': 'フェーズ5', 'phase6-operation': 'フェーズ6' };

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

/** key=value / key="value を含む文字列" の並びを読む */
function parseAttrs(text) {
  const attrs = {};
  const re = /(\w+)=(?:"([^"]*)"|(\S+))/g;
  let m;
  while ((m = re.exec(text))) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

function collect(file) {
  const raw = readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of marksInFences(raw)) {
    errors.push(
      `${file}:${line} 実装マークがコードブロックの中にあります。検査が読まず、台帳に載りません。読者には文字列のまま表示されます。` +
        'コードブロックの外(直後)へ移してください'
    );
  }
  const lines = maskFences(raw).masked;
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
    const planned = plannedProblem(TARGETS[attrs.target], attrs.state);
    if (planned) errors.push(`${file}:${i + 1} ${id} の ${planned}`);

    marks.push({
      id,
      file,
      line: i + 1,
      url: toUrl(file),
      target: attrs.target ?? '',
      state: attrs.state ?? '',
      check: attrs.check ?? '',
      note: attrs.note ?? '',
      attrs,
      test: attrs.test ?? '',
      plan: attrs.plan ?? '',
      issue: attrs.issue ?? '',
      review: attrs.review ?? '',
      decision: attrs.decision ?? '',
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
  // 入力(template/)が無い・空なら、降ろし先を確かめられない。失敗に数える(Issue #293 / ADR-0077)
  const missing = missingInputs(ROOT, ['template']);
  if (missing.length) {
    errors.push(describeMissing('降ろし先の実在の確認', missing));
    return;
  }
  const needConfig = [...used].some((id) => TARGETS[id]?.kind === 'config-key');
  let config = null;

  if (needConfig) {
    const gen = path.join(TEMPLATE_ROOT, 'scripts/init/generate-profile.mjs');
    if (!existsSync(gen)) {
      errors.push(`template/ が初期化されていないため、降ろし先を確認できません。実施しなかった検査として失敗に数えます(取得: ${INIT_HINT})`);
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
    } else if (t.kind === 'planned') {
      // 予定の置き場。実在は求めない(state=undelivered に限ることは collect が確かめる)
    } else {
      errors.push(`降ろし先 ${id}: 種別が不正です: ${t.kind}(config-key / template-file / planned)`);
    }

    if (t.checker && !existsSync(path.join(TEMPLATE_ROOT, `scripts/gate/${t.checker}.mjs`))) {
      errors.push(`降ろし先 ${id}: 検査 ${t.checker} が template/scripts/gate/ にありません`);
    }
  }
}

/** 検査の手段ごとの件数 */
function countChecks(rows) {
  const counts = Object.fromEntries(Object.keys(CHECKS).map((k) => [k, 0]));
  for (const m of rows) if (CHECKS[m.check]) counts[m.check] += 1;
  return counts;
}

/** 頁 → 台帳に出すまとまり(章・附属書・フェーズ) */
function groupOf(page) {
  const d = DOCUMENTS.find((x) => x.page === page);
  if (d?.chapter) return `第${d.chapter}章`;
  if (d?.annex) return `附属書${d.annex}`;
  return PHASE_DIRS[page.split('/')[0]] ?? page;
}

/** まとまりの並び: 本文の章 → 規定の附属書 → フェーズ5 → フェーズ6 */
function groupRank(g) {
  let m = /^第(\d+)章$/.exec(g);
  if (m) return Number(m[1]);
  m = /^附属書([A-Z])$/.exec(g);
  if (m) return 100 + m[1].charCodeAt(0);
  return g === 'フェーズ5' ? 500 : g === 'フェーズ6' ? 600 : 900;
}

function renderInventory(sections, entries) {
  const out = [];
  const groups = summarize(sections, entries, groupOf);
  const total = { total: 0, marked: 0, kb: 0, none: 0, pending: 0 };
  out.push('### 棚卸しの状況');
  out.push('');
  out.push(
    '対象のページ(本文8章・規定の附属書・フェーズ5・6)の節ごとの区分です。区分の登録簿は `src/data/impl-inventory.yaml`、手続は[規約](/process-compass/community/implementation-marking/)の「対象の棚卸し」によります。'
  );
  out.push('');
  out.push(
    `| 対象 | 節 | ${STATUSES.marked} | ${STATUSES.kb} | ${STATUSES.none} | **${STATUSES.pending}** |`
  );
  out.push('| --- | --- | --- | --- | --- | --- |');
  for (const [g, c] of [...groups].sort(([a], [b]) => groupRank(a) - groupRank(b))) {
    out.push(`| ${g} | ${c.total} | ${c.marked} | ${c.kb} | ${c.none} | **${c.pending}** |`);
    for (const k of Object.keys(total)) total[k] += c[k];
  }
  out.push(`| **計** | ${total.total} | ${total.marked} | ${total.kb} | ${total.none} | **${total.pending}** |`);
  out.push('');
  out.push(
    `${STATUSES.pending}の${total.pending}節は、実行主体を縛る規定があるかを確かめていません。この節の規定は、マークが無くても本台帳に現れません。`
  );
  out.push('');
  out.push(
    '**台帳の件数は網羅の証明ではありません**。降りていない規定が0件であることも、未棚卸しの節が0件であることも、規定がすべて降りたことを示しません。機械が確かめるのは、節が区分つきで登録されていること、登録の鍵と識別子が実在すること、「対象にしない」の節にマークが無いことまでです。節の中の規定がすべてマークされているかは、区分を登録した者の判断です。'
  );
  out.push('');
  return out;
}

function renderLedger(rows, sections, entries) {
  const out = [...renderInventory(sections, entries)];
  const undelivered = rows
    .filter((m) => m.state === 'undelivered')
    .map((m) => ({ m, r: undeliveredRank(m, noAdopterOf, decisionOf) }))
    .sort((a, b) => a.r - b.r || a.m.id.localeCompare(b.m.id))
    .map((x) => x.m);
  const counts = countChecks(rows);

  out.push('### 検査の手段ごとの件数');
  out.push('');
  out.push('「降りている」は、降ろし先が実在することを示します。規定の中身が検査されていることを示しません。規定の中身を何が確かめるかは、次の区分で示します。');
  out.push('');
  out.push('| 検査の手段 | 意味 | 件数 |');
  out.push('| --- | --- | --- |');
  out.push(`| ${CHECKS.machine} | 機械が規定の中身を検査し、違反を止めるか件数で出す | ${counts.machine} |`);
  out.push(`| ${CHECKS.presence} | 機械が確かめるのは、規則を運ぶ単位(欄・キー・行・ファイル)の有無までである | ${counts.presence} |`);
  out.push(`| ${CHECKS.manual} | 機械は確かめない。確かめる者と時点は注記に書く | ${counts.manual} |`);
  out.push('');
  out.push(
    `「${CHECKS.machine}」について検査が確かめるのは、試験(全件の表の試験の列)が違反の入力で検出する場面(落ちる、または件数・一覧・警告に出る)と適合の入力で通る場面の対を別の行の目印で持つこと、必須の集約から結線の不備なく実行されることまでです。` +
      '試験の中身が規定を正しく確かめていることは示しません。' +
      `「${CHECKS.presence}」は、規則を運ぶ単位(欄・キー・行・ファイル。注記に書く)の実在の確認に限ります。それより粗い単位(節の見出し)の確認は「${CHECKS.manual}」です。`
  );
  out.push('');

  out.push('### スキルの文のうち、検査の範囲の外の否定');
  out.push('');
  out.push(
    '準拠テンプレートのスキルの文の検査(`scripts/check-skill-provisions.mjs`)は、要求と禁止の文末(〜なければならない・〜てはならない・〜ないでください)と、禁止を列挙する節の項目に、本標準の所在か「テンプレート独自」の印を求めます。' +
      '平叙の否定(〜しない)と太字の否定(**〜しない**)で書いた規則には印を求めません。次の件数は、印を求めていない行の数です(規約「検査の限界」)。'
  );
  out.push('');
  out.push('| 区分 | 件数 |');
  out.push('| --- | --- |');
  out.push(`| 走査したファイル(スキルと CLAUDE.md の生成区間の外) | ${skillStats.files} |`);
  out.push(`| 印を求める要求・禁止の文 | ${skillStats.targets} |`);
  out.push(`| 範囲の外: 太字の否定を含む行 | ${skillStats.boldNeg} |`);
  out.push(`| 範囲の外: 平叙の否定で終わる行 | ${skillStats.plainNeg} |`);
  out.push('');

  out.push(
    ...renderUndelivered(
      undelivered,
      (t) => TARGETS[t]?.name ?? t,
      (m) => `[${m.file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '')}](${m.url})`,
      {
        kindOf: (t) => TARGETS[t]?.kind ?? 'planned',
        planOf: (m) =>
          m.plan === 'scheduled'
            ? `${PLANS.scheduled} [#${m.issue}](https://github.com/Takenori-Kusaka/process-compass/issues/${m.issue})(見直し ${m.review})`
            : m.plan === 'adopter'
              ? `${PLANS.adopter}(${m.decision})`
              : '—',
        overdue: overdueCount(undelivered, MONTH),
        month: MONTH,
      }
    )
  );

  out.push('### 全件');
  out.push('');
  out.push('| 識別子 | 規定 | 降ろし先 | 検査のスクリプト | 状態 | 検査の手段 | 試験 | 記載箇所 |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const m of rows) {
    const t = TARGETS[m.target];
    const page = m.file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
    out.push(
      `| ${m.id} | ${m.note} | ${t?.name ?? m.target} | ${t?.checker ? `\`${t.checker}\`` : '—'} | ` +
        `${STATES[m.state] ?? m.state} | ${CHECKS[m.check] ?? m.check} | ${m.test ? `\`${m.test}\`` : '—'} | [${page}](${m.url}) |`
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

const DOCUMENTS = YAML.parse(readFileSync(path.join(ROOT, 'src/data/provision-forms.yaml'), 'utf8')).documents;

/**
 * 棚卸しの対象のページ: 本文8章・規定の附属書の各頁。参考の附属書・フェーズ5・6(手引き)・ADR・community は対象外。
 * フェーズ5・6 は参考(手引き)であり、実装マークは本文の条項の側に置く(第1章 1.8。#316 / ADR-0086 R-1)
 */
async function inventoryPages() {
  return DOCUMENTS.filter((d) => d.kind === 'normative')
    .map((d) => d.page)
    .sort();
}

function pageFile(page) {
  for (const ext of ['md', 'mdx']) {
    const f = `${DOCS_ROOT}/${page}.${ext}`;
    if (existsSync(f)) return f;
  }
  return null;
}

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

// 対象の棚卸し
const sections = [];
for (const page of await inventoryPages()) {
  const f = pageFile(page);
  if (!f) {
    errors.push(`棚卸しの対象のページがありません: ${page}`);
    continue;
  }
  sections.push(...parseSections(page, readFileSync(f, 'utf8')));
}
const inventory = YAML.parse(readFileSync(INVENTORY_PATH, 'utf8'));
const baseline = YAML.parse(readFileSync(BASELINE_PATH, 'utf8'));
const entries = inventory.sections ?? [];
const base = readBaseInventory(BASE_REF);
for (const e of checkInventory({
  sections,
  entries,
  baseline: baseline.sections ?? [],
  baselineDigest: BASELINE_DIGEST,
  ledgerIds: new Set(marks.map((m) => m.id)),
  baseEntries: base.entries,
})) {
  errors.push(`${INVENTORY_PATH}: ${e}`);
}

// --- 検査の手段・計画・逆向きの追跡(#314 / ADR-0084) ---

/** マーク → 置かれた節の鍵 */
const markSection = new Map();
for (const sec of sections) for (const id of sec.marks) markSection.set(id, sec.key);
const NO_ADOPTER = (YAML.parse(readFileSync(path.join(ROOT, 'src/data/impl-no-adopter.yaml'), 'utf8')).sections ?? []).map((x) => x.key);
for (const k of NO_ADOPTER) {
  if (!sections.some((sec) => sec.key === k)) errors.push(`src/data/impl-no-adopter.yaml: 節 ${k} がありません(見出しを改めたら鍵を直します)`);
}
function noAdopterOf(m) {
  return sectionKeyMatches(NO_ADOPTER, markSection.get(m.id) ?? '');
}
// 降りていない規定の順序の第3段(G-7・G-8・R1 の決定に関わる規定)の節(ADR-0084 決定4。#314 の突合 X-13)
const DECISION_SECTIONS = (YAML.parse(readFileSync(path.join(ROOT, 'src/data/impl-decision-sections.yaml'), 'utf8')).sections ?? []).map((x) => x.key);
for (const k of DECISION_SECTIONS) {
  if (!sections.some((sec) => sec.key === k)) errors.push(`src/data/impl-decision-sections.yaml: 節 ${k} がありません(見出しを改めたら鍵を直します)`);
}
function decisionOf(m) {
  return sectionKeyMatches(DECISION_SECTIONS, markSection.get(m.id) ?? '');
}

// スキルの文の範囲の外の否定の件数(台帳へ書き出す。X-15)
const skillStats = { files: '—', targets: '—', boldNeg: '—', plainNeg: '—' };
if (existsSync(path.join(TEMPLATE_ROOT, '.claude/skills'))) {
  const s = scanSkillProvisions(ROOT);
  Object.assign(skillStats, { files: s.files.length, targets: s.stats.targets, boldNeg: s.stats.boldNeg, plainNeg: s.stats.plainNeg });
} else {
  errors.push(`template/.claude/skills がありません。スキルの文の件数を台帳へ書き出せません(取得: ${INIT_HINT})`);
}

const PKG_SCRIPTS = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts ?? {};
let g5 = null;
async function g5Jobs() {
  if (g5) return g5;
  const lib = path.join(TEMPLATE_ROOT, 'scripts/gate/g5-aggregate.mjs');
  const wf = path.join(TEMPLATE_ROOT, '.github/workflows/gate-g5.yml');
  if (!existsSync(lib) || !existsSync(wf)) {
    g5 = { jobs: new Map(), effective: new Set(), missing: true };
    return g5;
  }
  const m = await import(pathToFileURL(lib).href);
  const text = readFileSync(wf, 'utf8');
  g5 = { jobs: m.jobsOf(text), effective: m.aggregateFindings(text).effective, missing: false };
  return g5;
}

for (const m of marks) {
  for (const p of markAttrProblems(m.attrs, { noAdopter: noAdopterOf(m) })) errors.push(`${m.file}:${m.line} ${m.id} の ${p}`);
  if (m.check === 'machine' && m.test) {
    const { jobs, effective, missing } = await g5Jobs();
    const isTemplate = m.test.startsWith('template/');
    if (isTemplate && missing) {
      errors.push(`${m.file}:${m.line} ${m.id}: template/ が初期化されていないため、試験の結線を確かめられません(取得: ${INIT_HINT})`);
      continue;
    }
    for (const p of machineTestProblems(m.id, m.test, {
      exists: (f) => existsSync(path.join(ROOT, f)),
      read: (f) => readFileSync(path.join(ROOT, f), 'utf8'),
      wired: (f) => (isTemplate ? templateTestWired(jobs, effective, f) : parentTestWired(PKG_SCRIPTS, f)),
    })) {
      errors.push(`${m.file}:${m.line} ${m.id}: ${p}`);
    }
  }
}

// 逆向きの追跡: テンプレートのゲートのスクリプト・フック・ワークフロー(試験を除く)が、登録簿か除外の一覧にあること
if (existsSync(path.join(TEMPLATE_ROOT, 'scripts/gate'))) {
  const { jobs } = await g5Jobs();
  const contractRuns = new Set([...(jobs.get('contract') ?? '').matchAll(/run:\s*node\s+(scripts\/gate\/test-[\w-]+\.mjs)/g)].map((x) => x[1]));
  const scoped = [];
  // 対象: ゲートのスクリプト・フック・ワークフロー・エージェントの設定(.claude 直下の json)・ルールセット(json)。
  // 対象の外(規約「逆向きの追跡」に列挙する): .github/CODEOWNERS、.github/actions/、.github/dependabot.yml、
  // .github/ISSUE_TEMPLATE/、.github/PULL_REQUEST_TEMPLATE.md、.claude/skills/(スキルの文の検査が見る)、scripts/vendor/、adapters/ など
  for (const [dir, ext] of [
    ['scripts/gate', /\.(mjs|js|json|yml|yaml|template)$/],
    ['scripts/init', /\.(mjs|js|json|yml|yaml|template)$/],
    ['.claude/hooks', /\.(mjs|js|json|yml|yaml|template)$/],
    ['.github/workflows', /\.(mjs|js|json|yml|yaml|template)$/],
    ['.claude', /\.json$/],
    ['.github/rulesets', /\.json$/],
  ]) {
    for await (const f of glob(`${dir}/*`, { cwd: TEMPLATE_ROOT })) {
      const rel = f.replace(/\\/g, '/');
      if (!ext.test(rel)) continue;
      if (/\/test-[\w-]+\.mjs$/.test(rel) && contractRuns.has(rel)) continue;
      scoped.push(rel);
    }
  }
  scoped.sort();
  const traced = new Set();
  for (const t of registry.targets) {
    if (t.path) traced.add(t.path.replace(/\/$/, ''));
    if (t.checker) traced.add(`scripts/gate/${t.checker}.mjs`);
    if (t.kind === 'config-key') traced.add('scripts/init/generate-profile.mjs');
  }
  const untraced = YAML.parse(readFileSync(path.join(ROOT, 'src/data/impl-untraced.yaml'), 'utf8')).files ?? [];
  for (const p of untracedProblems(scoped, traced, untraced, new Set(registry.targets.map((x) => x.id)))) errors.push(`逆向きの追跡: ${p}`);

  // テンプレートのコード・スキル・様式に書かれた IMPL 番号が、標準に実在すること
  const ids = new Set(marks.map((x) => x.id));
  for (const pattern of ['scripts/**/*.{mjs,json}', '.claude/**/*.{md,mjs,json}', 'templates/**/*.md', '.github/**/*.{yml,md}', 'CLAUDE.md', 'README.md']) {
    for await (const f of glob(pattern, { cwd: TEMPLATE_ROOT })) {
      const rel = f.replace(/\\/g, '/');
      if (rel.startsWith('scripts/vendor/')) continue;
      const text = readFileSync(path.join(TEMPLATE_ROOT, rel), 'utf8');
      for (const x of new Set(text.match(/IMPL-\d{4}/g) ?? [])) {
        if (!ids.has(x)) errors.push(`template/${rel}: ${x} が標準本文の実装マークにありません(番号の誤り、または消えたマーク)`);
      }
    }
  }
}

/** 比較の基点の登録簿を読む。読めなければ entries: null と理由を返す(浅い取得・基点に登録簿が無い など) */
function readBaseInventory(ref) {
  try {
    const text = execFileSync('git', ['show', `${ref}:${INVENTORY_PATH}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return { entries: YAML.parse(text)?.sections ?? [], note: `比較の基点 ${ref} の登録簿と比べました` };
  } catch {
    return {
      entries: null,
      note: `比較の基点 ${ref} の登録簿を読めないため、棚卸し済みの節を未棚卸しへ戻すことを確かめていません(限界: 規約「対象の棚卸し」)`,
    };
  }
}

const ledgerText = readFileSync(LEDGER_PATH, 'utf8');
const nextText = replaceBlock(ledgerText, renderLedger(marks, sections, entries));
/** 鮮度の比較から、生成した月で変わる行(見直しの年月を過ぎた件数)を除く */
const stable = (t) => t.split('\n').filter((l) => !l.startsWith(OVERDUE_PREFIX)).join('\n');

if (args.has('--write')) {
  if (nextText !== ledgerText) {
    writeFileSync(LEDGER_PATH, nextText);
    console.log(`更新: ${LEDGER_PATH}`);
  } else {
    console.log(`変更なし: ${LEDGER_PATH}`);
  }
} else if (stable(nextText) !== stable(ledgerText)) {
  errors.push(`${LEDGER_PATH} が最新ではありません。'npm run impl:write' を実行してください`);
}

console.log(base.note);
if (errors.length > 0) {
  console.error('実装マークの検査で問題が見つかりました:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n規約: ${DOCS_ROOT}/community/implementation-marking.md`);
  process.exit(1);
}

const undelivered = marks.filter((m) => m.state === 'undelivered');
const checkCounts = countChecks(marks);
const pendingByGroup = summarize(sections, entries, groupOf);
const pendingTotal = [...pendingByGroup.values()].reduce((a, c) => a + c.pending, 0);
console.log(
  `棚卸し: ${sections.length}節(未棚卸し ${pendingTotal}節: ` +
    [...pendingByGroup].sort(([a], [b]) => groupRank(a) - groupRank(b)).filter(([, c]) => c.pending).map(([g, c]) => `${g} ${c.pending}`).join(' / ') +
    ')'
);
console.log(`実装マーク: ${marks.length}件(降りていない規定: ${undelivered.length}件)`);
console.log(
  `検査の手段: ${CHECKS.machine} ${checkCounts.machine}件 / ${CHECKS.presence} ${checkCounts.presence}件 / ` +
    `${CHECKS.manual} ${checkCounts.manual}件`
);
console.log(`見直しの年月(${MONTH} の時点)を過ぎた計画: ${overdueCount(undelivered, MONTH)}件(合否に使わない)`);
for (const m of undelivered) console.log(`  降りていない ${m.id} [${m.plan}] ${m.file}:${m.line} — ${m.note}`);
