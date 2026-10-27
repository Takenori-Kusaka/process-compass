// #286 2回目の通しの検証(tmp/eval286-novice2)の N6〜N9 の場面を、同じ意図の入力で確かめる。
//   sh fresh.sh vn1 && node verify-n.mjs [-v]
// @regress {"now": "2026-10-02T12:00:00Z", "workspaces": ["vn1"], "fixes": ["#286"]}
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace, checker, NAMES, SEATS, fill, TODAY, BASE } from './lib.mjs';

const { check, done, ghRun, fixes } = checker();
// gh は PATH 上の代役(lib/bin/gh)。元は --import mockgh-prs.mjs で execFileSync を差し替えていた
// N7 の場面は移さない(入力 tmp/eval286-novice2 が退避物に無い。scripts/regress/DISPOSITION.md)

const W = workspace('vn1');
const { DIR, run, git, write, read, gen, commit, cfg } = W;
const next = (...a) => run('node', ['scripts/gate/next.mjs', ...a]);
const json = () => JSON.parse(next('--json').out);
const all = (j) => [...j.project, ...j.features, ...j.ship];
const tpl = git('rev-parse', 'HEAD').out.trim();

// ---------------------------------------------------------------- 準備(log-A と同じ 1名+AI)
// #319 §8 X-1: 節ごとに固定する決定(元は #286 だけ)
fixes(['K60', '標準 2.8']);
write('answers.json', { 'q-team-size': 'size-1-2', 'q-biz-phase': 'poc', 'q-external-reviewer': 'reviewer-no', ...BASE });
check('初期化(1名・poc・node)', gen('--answers', 'answers.json', '--stack', 'node').ok);
fs.rmSync(path.join(DIR, 'answers.json'));
fs.copyFileSync(path.join(DIR, 'templates/00-d0-governance.md'), path.join(DIR, 'docs/D-0-governance.md'));
gen('--answers', 'process.config.json');
const people = [{ id: 'p1', name: NAMES[0], accounts: ['acct-1'] }];
check('任免(1名で全席)', fill(W, people, Object.fromEntries(SEATS.map((s) => [s, { accountable: NAMES[0] }]))).ok);
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^approver:.*$/m, `approver: ${NAMES[0]}`).replace(/^approved_at:.*$/m, `approved_at: ${TODAY}`).replace(/^approval_scope:.*$/m, 'approval_scope: all').replace(/^next_review:.*$/m, 'next_review: 2027-03-31'));
fs.rmSync(path.join(DIR, 'change.json'), { force: true });
commit('docs: 体制を記入し、D-0 を承認する');

// ---------------------------------------------------------------- N9: D-0 節3 の手で書く行
fixes(['K42', 'ADR-0055 決定4']);
let j = json();
const note = (j.notes ?? []).find((n) => n.includes('節3'));
check('N9: D-0 節3 の空欄の行を数え、手で書く欄・版を上げない・種別が無いことを出す', note && /空欄の行が \d+ 件/.test(note) && note.includes('例外承認') && note.includes('version は上げない') && note.includes('種別は無い'), note ?? JSON.stringify(j.notes));
check('N9: 全文の出力に「注記(段階を止めない)」', next().out.includes('## 注記(段階を止めない)'));
// N9(#319 §8 X-7 で挙動へ改めた): 元は様式(templates/00-d0-governance.md)に「ほかの行は手で書きます」「version は上げません」の
// 文があるかだけを見た。決定の中身(手で書く行を記入・変更しても版は上げない。版を上げるのは変化点だけで、構成の d0Version と
// 一致しない版は D-0 の検査が落とす)を、D-0 を書き換えて確かめる
const d0Text = read('docs/D-0-governance.md');
const blankBefore = Number(/空欄の行が (\d+) 件/.exec(note ?? '')?.[1]);
const handRow = /^\| 例外承認 \| \| \| \| \| \| *$/m;
check('N9 準備: D-0 節3 の「例外承認」の行が空欄', handRow.test(d0Text), d0Text.split('\n').filter((l) => l.includes('例外承認')).join('\n'));
write('docs/D-0-governance.md', d0Text.replace(handRow, '| 例外承認 | 事業決裁者 | | 開発者 | | |'));
const handD0 = W.checkD0();
const noteAfter = (json().notes ?? []).find((n) => n.includes('節3'));
check('N9: 手で書く行を記入しても、版を上げずに D-0 の検査が通る', handD0.ok && read('docs/D-0-governance.md').match(/^version:\s*(.+)$/m)?.[1].trim() === String(cfg().d0Version), handD0.out);
check('N9: 手で書く行を記入すると、空欄の行の数が 1 減る', Number(/空欄の行が (\d+) 件/.exec(noteAfter ?? '')?.[1]) === blankBefore - 1, `${note}\n${noteAfter}`);
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:\s*(.+)$/m, (_, v) => `version: ${(Number(v) + 0.1).toFixed(1)}`));
const bumped = W.checkD0();
check('N9: 手で版だけを上げると、構成の d0Version と一致せず D-0 の検査が落ちる', !bumped.ok && bumped.out.includes(String(cfg().d0Version)), bumped.out);
write('docs/D-0-governance.md', d0Text);

// ---------------------------------------------------------------- N6: 前提の台帳の案内
fixes(['ADR-0018', '標準 G-1']);
check('N6: 企画書なしの次に、前提の台帳を作るコマンド', j.project[0]?.stage === '企画書なし' && j.project[1]?.stage === '前提の台帳なし' && j.project[1]?.command === 'cp templates/10-assumption-ledger.md docs/assumptions.md', JSON.stringify(j.project.map((s) => s.stage)));
const readFile = j.project[1]?.read;
check('N6: 「読む」の補助ファイルが実在する', readFile && fs.existsSync(path.join(DIR, readFile)), readFile);
const sup = readFile ? read(readFile) : '';
check(
  'N6: 補助ファイルに6つの前提の内容・劣化とみなす事象・観測の手がかり・共通条件との関係がある(外部のサイトを要しない)',
  ['A-T3', 'A-T4', 'A-O1', 'A-O2', 'A-O3', 'A-K3'].every((a) => new RegExp(`^\\| ${a} \\|[^\\n]*\\|[^\\n]*\\|[^\\n]*\\|[^\\n]*\\|`, 'm').test(sup)) &&
    sup.includes('劣化とみなす事象') && sup.includes('全ゲートの共通条件との関係') && sup.includes('AS-0') && sup.includes('有効期限'),
  '',
  // 前提の充足状態の記号を AC-0〜2 から AS-0〜2 へ改めた(#316)
  { changed: [{ by: 'ADR-0086 決定5', on: '2026-10-24', from: "sup.includes('AC-0')" }] }
);
fs.copyFileSync(path.join(DIR, 'templates/06-project-brief.md'), path.join(DIR, 'docs/project-brief.md'));
j = json();
check('N6: 企画書を作った後は、前提の台帳 → G-1 待ちの順', j.project[0]?.stage === '前提の台帳なし' && j.project[1]?.stage === '企画承認(G-1)待ち', JSON.stringify(j.project.map((s) => s.stage)));
check('N6: --brief にも前提の台帳が出る', next('--brief').out.includes('前提の台帳なし'));
fs.copyFileSync(path.join(DIR, 'templates/10-assumption-ledger.md'), path.join(DIR, 'docs/assumptions.md'));
j = json();
check('N6: 台帳を作ると案内が消え、G-1 待ちが先頭', j.project[0]?.stage === '企画承認(G-1)待ち' && !all(j).some((s) => s.stage === '前提の台帳なし'));

// ---------------------------------------------------------------- N8: 結果欄が2値のどちらでもない記録(log-B の G-1)
fixes(['ADR-0036 決定1', 'ADR-0036 決定2']);
const rec = (file, result, extra = '') =>
  write(`docs/gates/${file}`, `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-1 企画承認 |\n| 対象 | P-001 |\n| 判定者 | ${NAMES[0]} |\n| 判定日時 | ${TODAY} 09:00 |\n| 結果 | ${result} |\n| 確定の形態 | 人確定 |\n| 参照した D-0 の版 | ${cfg().d0Version} |\n${extra}`);
rec('g1-P-001.md', '通過(判定者の申告を転記。判定者が確かめること)');
j = json();
let g1 = j.project.find((s) => s.stage === '企画承認(G-1)待ち');
check('N8: 注記つきの結果欄は通過に数えない(安全側のまま)', Boolean(g1));
check('N8: 記録の所在と「2値のどちらでもない」理由を出す', g1?.detail?.includes('docs/gates/g1-P-001.md') && g1.detail.includes('「通過」「差し戻し」のどちらでもない') && g1.detail.includes('通過(判定者の申告'), g1?.detail);
check('N8: 全文の出力に「詳細:」として出る', next().out.includes('詳細: 記録 docs/gates/g1-P-001.md の結果欄'));
check('N8: --brief に通過に数えなかった記録の所在が出る', next('--brief').out.includes('通過に数えなかった記録: docs/gates/g1-P-001.md'), next('--brief').out);
rec('g1-P-001.md', '通過 / 差し戻し');
g1 = json().project.find((s) => s.stage === '企画承認(G-1)待ち');
check('N8: 様式の文言のままの結果欄は「未記入、または様式の文言のまま」', g1?.detail?.includes('未記入、または様式の文言のまま'), g1?.detail);
rec('g1-P-001.md', '差し戻し');
g1 = json().project.find((s) => s.stage === '企画承認(G-1)待ち');
check('N8: 差し戻しの記録は、その所在と再判定の手順を出す', g1?.detail?.includes('差し戻しの記録 docs/gates/g1-P-001.md'), g1?.detail);
rec('g1-P-001.md', '通過');
j = json();
check('N8: 結果欄が「通過」なら G-1 を通過に数え、/spec-write へ進む', !j.project.some((s) => s.stage === '企画承認(G-1)待ち') && j.features[0]?.command === '/spec-write', JSON.stringify(all(j).map((s) => s.stage)));
check('N8: /gate の補助ファイルが、結果欄に2値の語だけを書かせ、注記を本文へ置かせる', read('.claude/skills/gate/reference/recording.md').includes('## 結果欄には2値の語だけを書く') && read('.claude/skills/gate/reference/recording.md').includes('本文の節'));
commit('docs: G-1');

// ---------------------------------------------------------------- N7: 文書だけの PR のリスク区分(log-A の PR #2・#7・#8 の本文)
git('switch', '-q', '-c', 'docs/fix');
write('docs/gates/g1-P-001.md', read('docs/gates/g1-P-001.md') + '\n## 訂正\n\n判定日時を訂正した\n');
commit('docs: 訂正');
// N7(log-A の PR #2・#7・#8 の本文のリスク区分)の 3 場面は移さない。入力が無い(DISPOSITION.md)。分岐とコミットは後続の場面の状態のために残す
git('switch', '-q', 'main');

// ---------------------------------------------------------------- N6: ゲートの判定を対象とする例外承認と、変更の例外承認の区別
fixes(['標準 7.3', '標準 G-7']);
const { gateExceptionTarget } = await import(pathToFileURL(path.join(DIR, 'scripts/gate/config.mjs')).href);
check('N6: 対象の形の判別(G-2 F-001 / G-1 P-001 はゲート、PR #12・コミットは変更)', gateExceptionTarget('G-2 F-001')?.gate === 'G-2' && gateExceptionTarget('G-1 P-001')?.subject === 'P-001' && !gateExceptionTarget('PR #12') && !gateExceptionTarget('a1b2c3d4') && !gateExceptionTarget('F-001 の出荷まで'));
// R1 の変更を PR #1 で取り込む(1名の体制では G-6 が未達。R1 の変更は例外承認を要する)
git('switch', '-q', '-c', 'feature/x');
write('src/a.js', 'export const a = 1;\n');
commit('feat: a');
git('switch', '-q', 'main');
git('merge', '-q', '--squash', 'feature/x');
commit('feat: a (#1)\n\nSpec: F-001 / Task-1');
const prHash = git('rev-parse', 'HEAD').out.trim();
const LEDGER = '# 技術負債台帳\n\n| ID | 区分 | 対象 | 内容 | 受容した理由 | 顕在化の兆候 | 返却の目安 | 状態 | 記録者 | 承認した者 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
const row = (id, target, approver = '組織 承認者') => `| ${id} | 例外 | ${target} | 共通の通過条件(前提の台帳)を満たさない。PR #1 に関係 | 台帳の定義が手元に無かった | 前提の劣化を見落とす | 2026-12-31 まで。回収責任者 ${NAMES[0]} | 未返却 | ${NAMES[0]} | ${approver} |\n`;
const prs = path.join(DIR, '.git', 'prs');
fs.mkdirSync(prs, { recursive: true });
fs.writeFileSync(path.join(prs, '1.json'), JSON.stringify({ number: 1, title: 'feat: a', author: { login: 'acct-1' }, reviews: [], statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }], body: `## 検証方法と結果\n\nnpm test\n\n## 作成を指示した者\n\n${NAMES[0]}\n\n## リスク区分\n\nR1\n\n## トレーラ\n\nSpec: F-001 / Task-1\n`, mergeCommit: { oid: prHash }, commits: [{ oid: prHash }] }));
const aggregate = () => {
  const r = ghRun(W, '出荷の証跡の集約', 'node', ['scripts/gate/aggregate-evidence.mjs', '--from', tpl, '--to', 'HEAD'], { GITHUB_REPOSITORY: 'example/vn', MOCK_PRS: prs });
  return { r, ev: JSON.parse(read('evidence/evidence.json')), report: fs.existsSync(path.join(DIR, 'evidence/quality-report.md')) ? read('evidence/quality-report.md') : '' };
};
// 承認した者は名簿の外部の人(1名の体制で、作成を指示した本人と別の人)
const roster = cfg();
write('change.json', { kind: 'accountable', date: TODAY, summary: '外部の承認者を名簿へ足す', people: [...roster.people, { id: 'ext1', name: '組織 承認者', external: true }], decidedBy: NAMES[0], reason: '例外承認の承認者' });
const addExt = gen('--change', 'change.json');
check('N6 準備: 外部の承認者を名簿へ足す', addExt.ok, addExt.out);
fs.rmSync(path.join(DIR, 'change.json'), { force: true });
write('docs/debt-ledger.md', LEDGER + row('D-001', 'G-1 P-001') + row('D-002', 'G-2 F-001', '—'));
commit('docs: 台帳');
let { ev, report } = aggregate();
const gapsText = (ev.gaps ?? []).join('\n');
check('N6: ゲートの判定を対象とする成立した行(D-001)は、変更(PR #1)へ対応づけない', /PR #1: リスク区分 R1 の変更が、独立した人の確認を経ていません/.test(gapsText), gapsText);
check('N6: 承認した者を欠くゲートの判定の例外(D-002)を欠落にする', gapsText.includes('ゲートの判定を対象とする例外承認 D-002(G-2 F-001): 承認した者が未記入'), gapsText);
check('N6: 成立したゲートの判定の例外を保証の開示の項目5 に出す', JSON.stringify(ev).includes('D-001(G-1 P-001)'), JSON.stringify(ev.assurance?.residual ?? {}));
write('docs/debt-ledger.md', LEDGER + row('D-001', 'G-1 P-001') + row('D-003', 'PR #1'));
commit('docs: 台帳(PR #1 の例外)');
({ ev } = aggregate());
check('N6: 対象が PR #1 の行は変更へ対応づき、R1 の欠落が消える', !(ev.gaps ?? []).some((g) => g.startsWith('PR #1: リスク区分 R1')), (ev.gaps ?? []).join('\n'));

// ---------------------------------------------------------------- N9: 判定日時のずれ(log-A の判定時刻の誤り)
fixes(['ADR-0078 決定1', 'ADR-0055 決定4']);
// 変化点で D-0 の版を上げる(担い手の識別)。その後の時刻を判定日時に書いた、旧い版の記録
const before = cfg().d0Version;
write('change.json', { kind: 'performer', date: TODAY, summary: '担い手を宣言する', seats: { 'dev-verifier': { performer: { model: 'claude-sonnet-5', instructions: 'v1', permissions: 'default' } } }, decidedBy: NAMES[0], reason: '担い手の宣言' });
const perf = gen('--change', 'change.json');
check('N9 準備: 担い手の宣言で D-0 の版が上がる', perf.ok && cfg().d0Version !== before, perf.out);
fs.rmSync(path.join(DIR, 'change.json'), { force: true });
commit('docs: 担い手');
const later = new Date(Date.now() + 2 * 3600 * 1000);
const pad = (x) => String(x).padStart(2, '0');
const laterText = `${later.getFullYear()}-${pad(later.getMonth() + 1)}-${pad(later.getDate())} ${pad(later.getHours())}:${pad(later.getMinutes())}`;
write('docs/gates/g2-F-001.md', `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-2 要件合意 |\n| 対象 | F-001 |\n| 判定者 | ${NAMES[0]} |\n| 判定日時 | ${laterText} |\n| 結果 | 通過 |\n| 確定の形態 | 人確定 |\n| 参照した D-0 の版 | ${before} |\n`);
commit('docs: G-2');
({ ev } = aggregate());
const verGap = (ev.gaps ?? []).find((g) => g.startsWith('docs/gates/g2-F-001.md: 参照した D-0 の版'));
const sameDay = laterText.slice(0, 10) === TODAY;
check('N9: 版の不一致に、判定日時が変化点より後であることを添える', verGap && (sameDay ? /変化点\(.*\)(より後|と同じ日)です。記録した版/.test(verGap) : true), verGap ?? (ev.gaps ?? []).join('\n'));
check('N9: 判定日時が記録を取り込んだコミットより後であることを添える', verGap?.includes('この記録を取り込んだコミットの時刻'), verGap);

// ---------------------------------------------------------------- N9: 共著者と担い手の宣言のずれの案内
fixes(['標準 5.8.2', 'ADR-0054 決定9']);
write('src/b.js', 'export const b = 1;\n');
commit('feat: b\n\nSpec: F-001 / Task-1\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>');
({ ev } = aggregate());
const drift = JSON.stringify(ev.assurance?.drift ?? ev);
check('N9: 宣言にない共著者の警告に、直し方(/process-change performer)を添える', drift.includes('宣言にない共著者') && drift.includes('種別 performer'), drift.slice(0, 600));

// ---------------------------------------------------------------- N9: 企画書の置き場
fixes(['標準 3.11.3', '標準 G-1']);
check('N9: /process-init が context/projects に企画書の様式を写させない', read('.claude/skills/process-init/SKILL.md').includes('企画書の様式(`templates/06-project-brief.md`)をここへ写さない'));
done();
