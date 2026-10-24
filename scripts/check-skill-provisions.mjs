#!/usr/bin/env node
// 準拠テンプレートのスキルの文の検査(Issue #310 / ADR-0064)
//
// スキルの文のうち、要求と禁止の文末を持つものに、本標準の所在か「テンプレート独自」の印があることを確かめる。
// 標準を改めても、スキルの文へ届く経路が無かった(#300 の決定が2件、スキルに改訂前のまま残った)。
// npm run check から呼ばれ、検出時は終了コード 1 で失敗する。
//
// 対象の文(template/.claude/skills/ の .md と、template/CLAUDE.md の構成依存部分(生成区間)の外。コードブロックの外):
//   1. 文末が要求・禁止の形の行   〜なければなりません/〜なければならない/〜てはなりません/〜てはならない/〜ないでください
//      (依頼の形「〜ないでください」は #314 / ADR-0084 決定5 で足した。書き直した後に同じ形が印なしで戻ることを防ぐ)
//   2. 禁止を列挙する節の項目      見出しに「〜てはならない」「禁止事項」を含む節の、箇条書きと表の行
//
// 印(対象の行に書く。2 の項目は、節の見出しの行か、見出しの直後の行に書いた印でも足りる):
//   <!-- 根拠: 標準 第5章 5.8.5 -->            本標準の所在。複数は「、」で区切る
//   <!-- テンプレート独自: 理由 -->            本標準に対応する規定が無い文。理由を書く
//
// 所在として書ける形(実在を確かめる):
//   第N章 a.b / 第N章 a.b.c     その章に、番号で始まる見出しがある
//   第4章 G-N                   第4章に、そのゲートの見出しがある
//   第N章「節の名前」            その章に、名前を含む見出しがある
//   附属書X / 附属書X X.n / 附属書X「節の名前」   規定の附属書に限る。参考の附属書は根拠にならない
//   IMPL-NNNN                   その実装マークが標準本文にある
//
// 検査しないこと: 引いた節の内容と、スキルの文が合っているか。標準の要求をスキルが落としていること。
// 平叙の否定(〜しない)と太字の否定(**〜しない**)で書いた規則。件数だけを出力し、実装の台帳(自動生成)へ書き出す
// (scripts/check-impl.mjs が同じ走査を使う。#314 の突合 X-15)。限界の表は台帳の件数を引く。
// この検査は文の所在の追跡であり、AI がその文に従うことを示さない。振る舞いの評価(複数回の試行)は CI に課さない。
// 書式と運用は community/implementation-marking.md「準拠テンプレートのスキルの文」による。

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireInputs } from './lib/inputs.mjs';
import { scanSkillProvisions } from './lib/skill-provisions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 入力(template/)が無ければ失敗させる。飛ばさない(Issue #293 / ADR-0077)
requireInputs(ROOT, ['template', 'template/.claude/skills'], 'スキルの文の検査');

const { files, errors, stats } = scanSkillProvisions(ROOT);

if (errors.length) {
  console.error(`スキルの文の検査: ${errors.length} 件の問題があります。\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('\n規約: src/content/docs/community/implementation-marking.md「準拠テンプレートのスキルの文」');
  process.exit(1);
}
console.log(
  `スキルの文: ${files.length} ファイル(スキルと CLAUDE.md の生成区間の外)、要求・禁止の文 ${stats.targets} 件(本標準の所在つき ${stats.source} 件、テンプレート独自 ${stats.local} 件)`
);
console.log(
  `範囲の外(印を求めない): 太字の否定を含む行 ${stats.boldNeg} 件、平叙の否定で終わる行 ${stats.plainNeg} 件。` +
    'この検査は文の所在の追跡で、AI が従うことを示さない(community/implementation-marking.md「検査の限界」)'
);
