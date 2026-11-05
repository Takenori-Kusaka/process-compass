// 第8章 軸B の表の升と、テーラリングエンジンの出力を突き合わせる(Issue #374 / ADR-0112 決定2・決定3)。
//
// 升は「テーラリングの規則が定める結果」である(第1章 1.7.3)。軸の間の優先により、最終の状態は導出の出力を正とする。
// ここでは、升の状態の語と括弧の上書きの条件が、エンジンの出力と食い違わないことを確かめる。
//   1. 升の状態の語(適用・簡略・統合・省略)が、基準の構成(標準品質・CL0・3〜9名・内製)の出力と一致する
//   2. 緩める升(省略・簡略・統合)と、範囲を限る升(「コア機能」)について、上書きの条件(CL1 以上・品質「高」以上 など)の
//      各値で出力が適用(または全変更)へ戻るなら、升の括弧がその条件を書いている。書いた条件で戻らなければ食い違い
//   3. 「簡略」の升は、括弧の中に上書きの条件のほかの限定(減らすもの)を持つ(第1章 1.7.3 の「簡略」の定義)
//
// 確かめないこと: 括弧の限定が減らすものを正しく書いているか(条項の起草と査読に残る)、体制(軸A)の条件
// (「確認者を置けない体制は未達」など)、ゲート以外の行(コア指定の範囲・負債台帳)。

import { evaluate } from '../../src/lib/tailoring-engine.mjs';

/** 升の行の G-N と、知識ベースのゲートの id */
export const GATE_IDS = {
  'G-1': 'g-plan-approval',
  'G-2': 'g-req-agree',
  'G-3': 'g-tech-design',
  'G-4': 'g-spec-cycle',
  'G-5': 'g-ci',
  'G-6': 'g-indep-review',
  'G-7': 'g-ship',
  'G-8': 'g-release',
};

/** 表の列の順の事業ステージ */
export const PHASE_COLUMNS = ['poc', 'mvp', 'growth', 'stable'];

/** 基準の構成。升の状態の語はこの構成の出力と比べる */
export const BASE_ANSWERS = {
  'q-team-size': 'size-3-9',
  'q-quality': 'quality-standard',
  'q-criticality': 'cl0',
  'q-dev-form': 'inhouse',
  'q-existing-gates': 'gates-none',
  'q-ai-constraint': 'ai-free',
};

/** 上書きの条件の語と、その条件に当たる回答の値 */
export const CONDITIONS = [
  { word: 'CL1 以上', answers: [{ 'q-criticality': 'cl1' }, { 'q-criticality': 'cl2' }, { 'q-criticality': 'cl3' }] },
  { word: 'CL2 以上', answers: [{ 'q-criticality': 'cl2' }, { 'q-criticality': 'cl3' }] },
  { word: 'CL3', answers: [{ 'q-criticality': 'cl3' }] },
  { word: '品質「高」以上', answers: [{ 'q-quality': 'quality-high' }, { 'q-quality': 'quality-regulated' }] },
  { word: '規制業', answers: [{ 'q-quality': 'quality-regulated' }] },
];

/** 走査する上書きの値(条件の語に依らず、すべての値で出力を見る) */
const PROBES = [
  { 'q-criticality': 'cl1' },
  { 'q-criticality': 'cl2' },
  { 'q-criticality': 'cl3' },
  { 'q-quality': 'quality-high' },
  { 'q-quality': 'quality-regulated' },
];

const probeText = (p) => Object.values(p).join('');

/** 升の文字列を、状態の語と括弧の中身に分ける */
export function parseCell(cell) {
  const c = String(cell ?? '').trim().replace(/\*\*/g, '');
  const m = /^(適用|簡略|統合|省略|未達)\s*(?:[((](.*)[))])?\s*$/.exec(c);
  if (!m) return null;
  return { word: m[1], inner: (m[2] ?? '').trim() };
}

/** 括弧の中身を「。」で区切り、上書きの条件の句(「〜以上は適用」「〜以上は全変更」など)とそれ以外に分ける */
export function splitInner(inner) {
  const parts = String(inner ?? '')
    .split(/。/)
    .map((x) => x.trim())
    .filter(Boolean);
  const overrides = [];
  const limits = [];
  for (const p of parts) {
    const m = /^(.+?)は(?:全変更に)?(適用|全変更)$/.exec(p);
    if (m) overrides.push({ text: p, conditions: m[1].split(/・/).map((x) => x.trim()), to: m[2] === '全変更' || /全変更に/.test(p) ? 'all' : 'applied' });
    else limits.push(p);
  }
  return { overrides, limits };
}

/**
 * 中身の無い「簡略」か(第1章 1.7.3)。括弧が無い、または括弧の中が上書きの条件だけの「簡略」を返す。
 * 機械が確かめるのは限定の有無までであり、限定が減らすものを書いているかは確かめない
 */
export function emptySimplified(cell) {
  const p = parseCell(cell);
  if (!p || p.word !== '簡略') return false;
  return splitInner(p.inner).limits.length === 0;
}

/** Markdown の本文から、見出し heading の直下の最初の表を読む。{ header, rows: [{ label, cells, line }] } */
export function readTableAfterHeading(text, heading) {
  const lines = String(text).split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return null;
  let i = start + 1;
  while (i < lines.length && !lines[i].trim().startsWith('|')) {
    if (/^#{1,6}\s/.test(lines[i])) return null;
    i++;
  }
  const rows = [];
  const split = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
  const header = split(lines[i] ?? '');
  for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    const cells = split(lines[i]);
    rows.push({ label: cells[0], cells: cells.slice(1), line: i + 1 });
  }
  return { header, rows };
}

const isApplied = (state) => state === 'standard' || state === 'strengthen' || state === undefined;
const engineWord = (state) =>
  isApplied(state) ? '適用' : state === 'simplify' ? '簡略' : state === 'omit' ? '省略' : String(state).startsWith('merged-into') ? '統合' : String(state);

/**
 * 軸B の表の升とエンジンの出力の食い違いを返す(空なら一致)。
 * @param {{ rows: { label: string, cells: string[], line: number }[] }} table
 * @param {{ questions: object[], rules: object[] }} kb
 */
export function stageTableProblems(table, kb) {
  const out = [];
  const known = new Set(CONDITIONS.map((c) => c.word));
  for (const row of table.rows) {
    const g = /\((G-\d)\)/.exec(row.label)?.[1];
    if (!g || !GATE_IDS[g]) continue;
    const key = `gate:${GATE_IDS[g]}`;
    PHASE_COLUMNS.forEach((phase, col) => {
      const cell = row.cells[col];
      const at = `${row.label} の ${table.header?.[col + 1] ?? phase}(${row.line} 行)`;
      const p = parseCell(cell);
      if (!p) {
        out.push(`${at}: 升「${cell}」の状態の語を読めない(適用・簡略・統合・省略・未達で始める)`);
        return;
      }
      const base = evaluate(kb, { ...BASE_ANSWERS, 'q-biz-phase': phase }).profile[key];
      const baseWord = engineWord(base?.state);
      if (p.word !== baseWord) out.push(`${at}: 升は「${p.word}」、エンジンの出力(標準品質・CL0)は「${baseWord}」(${base?.state ?? 'standard'})`);
      if (emptySimplified(cell)) out.push(`${at}: 「簡略」の括弧に、減らすものの限定が無い(第1章 1.7.3)`);
      const { overrides } = splitInner(p.inner);
      for (const o of overrides) {
        for (const w of o.conditions) if (!known.has(w)) out.push(`${at}: 上書きの条件「${w}」を読めない(${[...known].join('・')})`);
      }
      const scoped = /コア機能/.test(p.inner);
      if (scoped && base?.params?.scope !== 'core-only') out.push(`${at}: 升は範囲を「コア機能」に限るが、エンジンの出力の範囲は ${base?.params?.scope ?? '全変更'}`);
      const relaxing = baseWord !== '適用';
      if (!relaxing && !scoped) return;
      // 上書きの値ごとに、出力が適用・全変更へ戻るかを見て、升の括弧の条件と比べる
      for (const probe of PROBES) {
        const r = evaluate(kb, { ...BASE_ANSWERS, ...probe, 'q-biz-phase': phase }).profile[key];
        const lifted = relaxing ? isApplied(r?.state) : r?.params?.scope !== 'core-only';
        const named = overrides.some((o) =>
          o.conditions.some((w) => CONDITIONS.find((c) => c.word === w)?.answers.some((a) => probeText(a) === probeText(probe)))
        );
        if (lifted && !named) out.push(`${at}: ${probeText(probe)} の構成でエンジンは${relaxing ? `「${engineWord(r?.state)}」` : '全変更'}へ戻すが、升の括弧にその条件が無い`);
        if (!lifted && named) out.push(`${at}: 升の括弧は ${probeText(probe)} を上書きの条件に書くが、エンジンの出力は「${engineWord(r?.state)}」${relaxing ? '' : `(範囲 ${r?.params?.scope})`}のまま`);
      }
    });
  }
  return out;
}
