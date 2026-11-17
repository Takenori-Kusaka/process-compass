// 除外の印の理由と、異表記の登録の自己試験の、違反と適合の試験(#438 / ADR-0118)
//
//   node scripts/test-provisions.mjs   (npm run test:provisions)
//
// 判定の本体は scripts/lib/exempt-marks.mjs。check-tone.mjs と check-provisions.mjs が同じ関数を使う。

import { readFileSync, writeFileSync, mkdtempSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { hasMark, hasToneOk, hasRefOk, markReason, variantEntryProblems, findVariants } from './lib/exempt-marks.mjs';
import { frameOpening, isFenceClose, subjectlessDeclarations, declarationVerbProblems, undecidedProblems, prohibitionPresenceProblems, unregisteredSentences } from './lib/frame-checks.mjs';

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

// --- 注意の枠の中の要求・禁止(検査12 の拡張)と、主語の無い表明の文末(検査17)。#440 / ADR-0132 ---
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
check('違反: ledgerPage の頁の全文に所在の文字列が無ければ失敗する(表の行までは見ない)', up([{ ...base, ledgerKey: '無い所在' }]).some((p) => p.includes('文字列がありません')));
check('違反: 頁が無い登録は失敗する', up([{ ...base, page: 'none' }]).some((p) => p.includes('頁')));
check('違反: 必須の項目が無い登録は失敗する', up([{ ...base, issue: undefined }]).some((p) => p.includes('issue')));
check('違反: kind が frame・declaration でない登録は失敗する', up([{ ...base, kind: 'x' }]).some((p) => p.includes('kind')));

// 確かめた安全の禁止の文の存在(検査12 の続き。#440 / ADR-0155)
const PP = { linesOf: (page) => ({ ok: ['前', '低減後 SR の算定に、RRS3 を数えてはなりません', ':::danger', '枠', ':::'], inframe: ['前', ':::danger', '低減後 SR の算定に、RRS3 を数えてはなりません', ':::'], gone: ['前', '空'] })[page] ?? null, inFrame: (page) => ({ ok: [false, false, true, true, false], inframe: [false, true, true, false], gone: [false, false] })[page] };
const pb = { page: 'ok', phrase: 'RRS3 を数えてはなりません', adr: 'ADR-0155', issue: 440 };
const pp = (entries) => prohibitionPresenceProblems({ ...PP, entries });
check('適合: 禁止の句が本文にあれば通る', pp([pb]).length === 0, pp([pb]).join(' / '));
check('違反: 禁止の句が本文から消えたら失敗する', pp([{ ...pb, page: 'gone' }]).some((p) => p.includes('にありません')));
check('違反: 禁止の句が注意の枠の中にしか無いなら失敗する', pp([{ ...pb, page: 'inframe' }]).some((p) => p.includes('にありません')));
check('違反: 頁が無い登録は失敗する', pp([{ ...pb, page: 'none' }]).some((p) => p.includes('頁')));
check('違反: 必須の項目が無い登録は失敗する', pp([{ ...pb, adr: undefined }]).some((p) => p.includes('adr')));
const sp = reg.confirmedSafetyProhibitions?.entries ?? [];
check('登録簿に、確かめた安全の禁止の文が3件ある(F.5 の禁止・例外承認の対象外・RRS3)', sp.length === 3, String(sp.length));

// 実物: 登録簿の未決の文がすべて、いまの本文と一致している(検査12 の拡張の本体は npm run lint:provisions)
check('登録簿に未決の文の区画があり、項目は配列である(2026-11-17 に全項目を除いた。0件でよい)', Array.isArray(reg.undecidedFrameSentences?.entries));

// 文の単位の除外(X-5): 登録した文だけを通し、同じ行へ足した別の禁止は残す
const SH = /[てで]はなりません$/;
check('適合: 登録した文だけの行は残さない', unregisteredSentences('検証で挿入してはなりません。', SH, ['挿入してはなりません']).length === 0);
check('違反: 登録した文と同じ行の別の禁止は残す', unregisteredSentences('検証で挿入してはなりません。加えて記録を消してはなりません。', SH, ['挿入してはなりません']).length === 1);
check('違反: 登録が無ければ残す', unregisteredSentences('消してはなりません。', SH, []).length === 1);

// 検査の本体の結線(X-4): 違反の見本を置いた一時の木で check-provisions.mjs を子プロセスとして走らせる
{
  const tmp = mkdtempSync(path.join(tmpdir(), 'prov-'));
  try {
    cpSync(path.join(ROOT, 'src/data'), path.join(tmp, 'src/data'), { recursive: true });
    cpSync(path.join(ROOT, 'src/content/docs'), path.join(tmp, 'src/content/docs'), { recursive: true });
    mkdirSync(path.join(tmp, 'template'), { recursive: true });
    writeFileSync(path.join(tmp, 'template/README.md'), '# placeholder'); // 入力の存在検査(空のディレクトリは失敗)を通すため
    const DOC = (p) => path.join(tmp, 'src/content/docs', `${p}.md`);
    const REG = path.join(tmp, 'src/data/provision-forms.yaml');
    const run = () => spawnSync(process.execPath, [path.join(ROOT, 'scripts/check-provisions.mjs')], { env: { ...process.env, PROVISIONS_ROOT: tmp }, encoding: 'utf8' });
    const trial = (file, edit) => {
      const orig = readFileSync(file, 'utf8');
      writeFileSync(file, edit(orig));
      try {
        const r = run();
        return r.status !== 0 ? r.stdout + r.stderr : '';
      } finally {
        writeFileSync(file, orig);
      }
    };
    const base = run();
    check('結線: 見本の木(違反なし)で本体が exit 0 になる', base.status === 0, (base.stdout + base.stderr).slice(-300));
    const PG = 'phase4-process-design/';
    const safety = DOC(`${PG}safety-verification`);
    const o1 = trial(safety, (t) => `${t}\n\n:::danger\n記録を省いてはなりません。\n:::\n`);
    check('結線: 枠の中の未登録の禁止で本体が非 0 になる', o1.includes('注意の枠の中の要求・禁止'), o1.slice(-200));
    // 登録簿は空(2026-11-17。ADR-0156)。登録の仕組みは、見本の木に登録を足して確かめる
    const NOTICE = '前の枠の中の禁止は、枠の外へ出すかどうかを審議中です。決まるまで要求として読みます(第1章 1.7.2)。';
    const trial2 = (edits) => {
      const origs = edits.map(([file]) => readFileSync(file, 'utf8'));
      edits.forEach(([file, edit], i) => writeFileSync(file, edit(origs[i])));
      try {
        const r = run();
        return r.status !== 0 ? r.stdout + r.stderr : '';
      } finally {
        edits.forEach(([file], i) => writeFileSync(file, origs[i]));
      }
    };
    const regEntry = (ledgerKey) => `entries:
    - { kind: frame, page: ${PG}safety-verification, phrase: 登録句を省いてはなりません, ledgerKey: ${ledgerKey}, issue: 440, review: 2027-05 }`;
    const addFrame = (extra) => (t) => `${t}

:::danger
登録句を省いてはなりません。${extra}
:::

${NOTICE}
`;
    const setReg = (ledgerKey) => (t) => t.replace('entries: []', regEntry(ledgerKey));
    const o2a = trial2([[safety, addFrame('')], [REG, setReg('1.7.2 規定と説明の読み分け')]]);
    check('結線: 登録と表示と ledgerKey の文字列がそろえば登録した枠の文は通る', o2a === '', o2a.slice(-200));
    const o2 = trial2([[safety, addFrame('加えて記録を消してはなりません。')], [REG, setReg('1.7.2 規定と説明の読み分け')]]);
    check('結線: 登録した枠の同じ行へ足した別の禁止で本体が非 0 になる(X-5)', o2.includes('注意の枠の中の要求・禁止'), o2.slice(-200));
    const o2b = trial(safety, (t) => t.replace('禁止の定めは、前の段落にあります', '禁止の定めは、前の段落にあります。記録を省いてはなりません'));
    check('結線: 登録簿が空のとき、枠の中の強い文末は例外なく失敗する', o2b.includes('注意の枠の中の要求・禁止'), o2b.slice(-200));
    const o3 = trial(DOC(`${PG}overview`), (t) => `${t}\n\n新しいゲートを設けません。\n`);
    check('結線: 主語の無い「設けません」で本体が非 0 になる(検査17)', o3.includes('主語の無い表明の文末'), o3.slice(-200));
    const o4 = trial2([[safety, addFrame('')], [REG, setReg('存在しない所在')]]);
    check('結線: 未決の登録の ledgerKey が overview.md に無いと本体が非 0 になる', o4.includes('未決の文の登録'), o4.slice(-200));
    // 変異試験(重の突合 M-1): 安全の禁止の文を本文から消すと、本体が非 0 になる
    const dropPhrase = (ph) => (t) => { if (!t.includes(ph)) throw new Error(`変異の対象が無い: ${ph}`); return t.replace(ph, '(削除)'); };
    for (const e of sp) {
      const file = DOC(e.page);
      const m = trial(file, dropPhrase(e.phrase));
      check(`変異: 安全の禁止の句を消すと本体が非 0 になる「${e.phrase.slice(0, 24)}」`, m.includes('安全の禁止の登録'), m.slice(-200));
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

console.log(`\n${checks - failures}/${checks} 件が合格`);
process.exit(failures === 0 ? 0 : 1);
