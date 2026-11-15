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
import { frameOpening, isFenceClose, subjectlessDeclarations, declarationVerbProblems, undecidedProblems } from './lib/frame-checks.mjs';

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

// --- 注意の枠の中の要求・禁止(検査12 の拡張)と、主語の無い表明の文末(検査17)。#440 / ADR-0131 ---
const decl = reg.declarationVerbs ?? {};
const subj = decl.subject ?? '';
const verbs = decl.verbs ?? [];
check('枠の開き: 札の無い caution は対象の枠', frameOpening(':::caution') === 'frame');
check('枠の開き: danger は対象の枠', frameOpening(':::danger') === 'frame');
check('枠の開き: 暫定の札の caution は対象の外', frameOpening(':::caution[暫定 EV-0001 / 見直し 2027-05]') === 'tentative');
check('枠の開き: note は枠の対象ではない(注記は別に見る)', frameOpening(':::note') === null);
check('枠の閉じは:::だけの行', isFenceClose(':::') && !isFenceClose(':::danger'));
check('登録簿に declarationVerbs があり、項目が1つ以上ある', verbs.length > 0 && subj !== '');
for (const v of verbs) {
  const p = declarationVerbProblems(v, subj);
  check(`表明の動詞「${v.verb}」の自己試験`, p.length === 0, p.join(' / '));
}
const sl = (line) => subjectlessDeclarations(line, verbs, subj).length;
check('違反: 主語の無い「設けません」を検出する', sl('新しいゲートを設けません。') === 1);
check('違反: 太字と表の升の中の「設けない」を検出する', sl('| 記載する場所 | **新しい様式を設けない** |') === 1);
check('違反: 開き括弧の前の「設けない」を検出する', sl('段に数える経路も設けない(AI の確認は検出の層である)') === 1);
check('適合: 主語「本標準は」のある文は検出しない', sl('本標準は、新しいゲートを設けません。') === 0);
check('適合: 主語「本節は」のある文は検出しない', sl('- 本節は新しいゲートを設けない。戻る先は既存の工程ゲートである。') === 0);
check('違反: 文を分ければ前の文の主語は引き継がない', sl('本標準は定めます。新しい経路を設けません。') === 1);
check('適合: 「設けない場合」「設けないのは」は文末ではない', sl('設けない場合は記録します。') === 0 && sl('設けないのは運用を圧迫するためです。') === 0);

const U = {
  notice: { frame: 'F通知', declaration: 'D通知' },
  ledgerText: '| 所在K1 |',
  linesOf: (page) => ({
    ok: ['前', ':::danger', '禁止してはなりません', ':::', '', 'F通知', '宣言を設けません。D通知'],
    nonotice: ['前', ':::danger', '禁止してはなりません', ':::', '', '空'],
    gone: ['前', '空'],
    outside: ['禁止してはなりません', ':::danger', '別', ':::'],
  })[page] ?? null,
  inFrame: (page) => ({ ok: [false, true, true, false, false, false, false], nonotice: [false, true, true, false, false, false], outside: [false, true, true, false] })[page],
};
const base = { kind: 'frame', page: 'ok', phrase: '禁止してはなりません', ledgerKey: '所在K1', issue: 440, review: '2027-05' };
const up = (entries) => undecidedProblems({ ...U, entries });
check('適合: 登録と実物・表示・マークの表が一致すれば通る(枠)', up([base]).length === 0, up([base]).join(' / '));
check('適合: 登録と実物・表示・マークの表が一致すれば通る(文)', up([{ ...base, kind: 'declaration', phrase: '宣言を設けません' }]).length === 0);
check('違反: 登録の句が本文から消えたら失敗する', up([{ ...base, page: 'gone' }]).some((p) => p.includes('消えた登録')));
check('違反: 登録の句が枠の外にあるなら枠の登録は失敗する', up([{ ...base, page: 'outside' }]).some((p) => p.includes('消えた登録')));
check('違反: 実物のそばに表示の文が無ければ失敗する', up([{ ...base, page: 'nonotice' }]).some((p) => p.includes('表示の文')));
check('違反: マークの表に所在の文字列が無ければ失敗する', up([{ ...base, ledgerKey: '無い所在' }]).some((p) => p.includes('マークの表')));
check('違反: 頁が無い登録は失敗する', up([{ ...base, page: 'none' }]).some((p) => p.includes('頁')));
check('違反: 必須の項目が無い登録は失敗する', up([{ ...base, issue: undefined }]).some((p) => p.includes('issue')));
check('違反: kind が frame・declaration でない登録は失敗する', up([{ ...base, kind: 'x' }]).some((p) => p.includes('kind')));

// 実物: 登録簿の未決の文がすべて、いまの本文と一致している(検査12 の拡張の本体は npm run lint:provisions)
check('登録簿に未決の文の区画があり、項目が1つ以上ある', (reg.undecidedFrameSentences?.entries ?? []).length > 0);

console.log(`\n${checks - failures}/${checks} 件が合格`);
process.exit(failures === 0 ? 0 : 1);
