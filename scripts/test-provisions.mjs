// 除外の印の理由と、異表記の登録の自己試験の、違反と適合の試験(#438 / ADR-0118)
//
//   node scripts/test-provisions.mjs   (npm run test:provisions)
//
// 判定の本体は scripts/lib/exempt-marks.mjs。check-tone.mjs と check-provisions.mjs が同じ関数を使う。

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { hasMark, hasToneOk, hasRefOk, markReason, variantEntryProblems, findVariants } from './lib/exempt-marks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
let checks = 0;
function check(name, ok, detail = '') {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'NG  '} ${name}${ok || !detail ? '' : `\n       ${detail}`}`);
}

// --- 除外の印: 理由の無い印は無効(違反) ---
check('理由の無い tone-ok は除外しない', !hasToneOk('めっちゃ <!-- tone-ok: -->'));
check('理由が空白だけの tone-ok は除外しない', !hasToneOk('めっちゃ <!-- tone-ok:   -->'));
check('コロンの無い tone-ok は除外しない', !hasToneOk('めっちゃ <!-- tone-ok -->'));
check('理由の無い retired-ok(HTML コメント)は除外しない。閉じの - を理由に数えない', !hasMark('統合 <!-- retired-ok: -->', 'retired-ok'));
check('理由の無い retired-ok(行末のコメント)は除外しない', !hasMark('x # retired-ok:', 'retired-ok'));
check('理由の無い provision-ok は除外しない', !hasMark('| 可 | <!-- provision-ok: -->', 'provision-ok'));
check('理由の無い variant-ok は除外しない', !hasMark('x <!-- variant-ok: -->', 'variant-ok'));
check('理由の無い ref-ok は除外しない(突合 X-2)', !hasRefOk('第4章 9.9 <!-- ref-ok: -->'));
check('理由が - の1字の印は除外しない(突合 X-1)', !hasMark('統合 <!-- retired-ok: - -->', 'retired-ok') && !hasToneOk('めっちゃ <!-- tone-ok: - -->') && !hasMark('| 可 | <!-- provision-ok: - -->', 'provision-ok') && !hasRefOk('x <!-- ref-ok: - -->'));
check('ハイフン3つの閉じ(--->)を理由に数えない(突合 X-1)', !hasMark('統合 <!-- retired-ok: --->', 'retired-ok'));

// --- 除外の印: 理由のある印は有効(適合) ---
check('理由のある tone-ok は除外する', hasToneOk('めっちゃ <!-- tone-ok: 引用 -->'));
check('理由のある retired-ok(HTML コメント)は除外する', hasMark('統合 <!-- retired-ok: 廃した旧称を示す -->', 'retired-ok'));
check('理由のある retired-ok(YAML のコメント)は除外する', hasMark('x: y # retired-ok: 経緯の引用', 'retired-ok'));
check('理由のある provision-ok は除外する', hasMark('| 可 | <!-- provision-ok: 規定の強さではない -->', 'provision-ok'));
check('理由は閉じの前までを取る', markReason('a <!-- retired-ok: 経緯 --> b', 'retired-ok') === '経緯');
check('HTML コメントの外の tone-ok は数えない', !hasToneOk('めっちゃ tone-ok: 引用'));
check('理由のある ref-ok は除外する', hasRefOk('ISO 9001:2015 の 9.2 <!-- ref-ok: 外部の規格の箇条 -->'));
check('英数字だけの理由も理由に数える', hasMark('x # retired-ok: ADR-0027', 'retired-ok'));

// --- 異表記の登録の自己試験の仕組み ---
const good = { variant: 'ピット[・ ]イン', correct: 'ピットイン', by: 'ADR-0027', specs: { hit: ['ピット・イン方式'], miss: ['ピットイン方式'] } };
check('自己試験が合う登録は通る(適合)', variantEntryProblems(good).length === 0, variantEntryProblems(good).join(' / '));
check('hit を検出しない登録で失敗する(違反)', variantEntryProblems({ ...good, specs: { hit: ['ピットイン方式'], miss: ['x'] } }).some((p) => p.includes('hit')));
check('miss を検出する登録で失敗する(違反)', variantEntryProblems({ ...good, specs: { hit: ['ピット・イン'], miss: ['ピット イン'] } }).some((p) => p.includes('miss')));
check('hit の無い登録で失敗する', variantEntryProblems({ ...good, specs: { miss: ['x'] } }).some((p) => p.includes('hit')));
check('miss の無い登録で失敗する', variantEntryProblems({ ...good, specs: { hit: ['ピット・イン'] } }).some((p) => p.includes('miss')));
check('正規表現として読めない登録で失敗する', variantEntryProblems({ ...good, variant: '(' }).some((p) => p.includes('正規表現')));
check('correct・by の無い登録で失敗する', variantEntryProblems({ variant: 'a', specs: { hit: ['a'], miss: ['b'] } }).length === 2);
check('行の中の異表記をすべて返す', findVariants('ピット・イン と ピット イン', good).length === 2);

// --- 登録簿の各項目の自己試験(prh の specs に相当) ---
const reg = YAML.parse(readFileSync(path.join(ROOT, 'src/data/provision-forms.yaml'), 'utf8'));
const entries = reg.variantForms ?? [];
check('登録簿に異表記の区画(variantForms)があり、項目が1つ以上ある', entries.length > 0);
for (const e of entries) {
  const p = variantEntryProblems(e);
  check(`登録簿の項目「${e.variant}」の自己試験`, p.length === 0, p.join(' / '));
}

console.log(`\n${checks - failures}/${checks} 件が合格`);
process.exit(failures === 0 ? 0 : 1);
