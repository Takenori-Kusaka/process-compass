// 実装マークの計画の Issue の検出(check-impl-plan-issues.mjs / lib/plan-issues.mjs)の陽性対照(Issue #439 / ADR-0131)
//
// 違反(閉じた Issue・実在しない番号・PR を名指す)で所見が出ること、適合(open の Issue)で出ないことを対で確かめる。
// 純粋な関数だけを対象にする。GitHub の実機での発火は、この試験の範囲の外である(implementation-marking.md に開示)。
//
//   node scripts/test-plan-issues.mjs   (npm run test:plan-issues)
import assert from 'node:assert/strict';
import {
  marksWithIssue,
  planIssueFindings,
  renderFindings,
  commentBody,
  findingSignature,
  alreadyCommented,
  parseClosedFrom,
  issueRefProblem,
  marksNaming,
  parseIssueList,
  ghStateOf,
} from './lib/plan-issues.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const DOC = [
  '---',
  'title: 見本',
  '---',
  '',
  '規定の文。',
  '',
  '<!-- impl IMPL-0001 target=claude-md state=undelivered check=manual plan=scheduled issue=100 review=2027-05 note="閉じた Issue" -->',
  '<!-- impl IMPL-0002 target=claude-md state=undelivered check=manual plan=scheduled issue=200 review=2027-05 note="open の Issue" -->',
  '<!-- impl IMPL-0003 target=claude-md state=delivered check=manual note="issue= を持たない" -->',
  '',
  '```markdown',
  '<!-- impl IMPL-0009 target=claude-md state=undelivered check=manual plan=scheduled issue=100 review=2027-05 note="見本" -->',
  '```',
  '',
  '<!-- impl IMPL-0004 target=claude-md state=undelivered check=manual plan=scheduled issue=100 review=2027-05 note="同じ閉じた Issue" -->',
  '<!-- impl IMPL-0005 target=claude-md state=undelivered check=manual plan=scheduled issue=300 review=2027-05 note="PR" -->',
  '<!-- impl IMPL-0006 target=claude-md state=undelivered check=manual plan=scheduled issue=999 review=2027-05 note="実在しない" -->',
].join('\n');

const STATE = parseClosedFrom('100 closed\n200 open\n300 pr\n999 notfound\n');

test('マークの読み取り: issue= を持つ行だけを返し、コードブロックの見本を数えない', () => {
  const ms = marksWithIssue('a.md', DOC);
  assert.deepEqual(ms.map((m) => m.id), ['IMPL-0001', 'IMPL-0002', 'IMPL-0004', 'IMPL-0005', 'IMPL-0006']);
  assert.equal(ms[0].line, 7);
  assert(!ms.some((m) => m.id === 'IMPL-0009'), 'コードブロックの中の見本は数えない');
});

test('IMPL-PLAN:ng 閉じた Issue を名指すと所見が出る(番号ごとにまとめる)', () => {
  const f = planIssueFindings(marksWithIssue('a.md', DOC), STATE);
  const closed = f.find((x) => x.reason === 'closed');
  assert.equal(closed.issue, 100);
  assert.deepEqual(closed.marks.map((m) => m.id), ['IMPL-0001', 'IMPL-0004']);
});

test('IMPL-PLAN:ng 実在しない番号と PR の番号も所見になる', () => {
  const f = planIssueFindings(marksWithIssue('a.md', DOC), STATE);
  assert.equal(f.find((x) => x.issue === 999).reason, 'notfound');
  assert.equal(f.find((x) => x.issue === 300).reason, 'pr');
});

test('IMPL-PLAN:ok open の Issue だけを名指すと所見が出ない', () => {
  const only = marksWithIssue('a.md', DOC).filter((m) => m.id === 'IMPL-0002');
  assert.deepEqual(planIssueFindings(only, STATE), []);
  assert.deepEqual(planIssueFindings([], STATE), []);
});

test('--closed-from: 状態を省くと closed。一覧に無い番号は open。不正な行は拒む', () => {
  const s = parseClosedFrom('# 見本\n7\n8 open\n');
  assert.equal(s(7).state, 'closed');
  assert.equal(s(8).state, 'open');
  assert.equal(s(9).state, 'open');
  assert.throws(() => parseClosedFrom('abc closed\n'));
  assert.throws(() => parseClosedFrom('7 reopened\n'));
});

test('所見の表示は、Issue 番号と、マークの識別子と所在を含む', () => {
  const f = planIssueFindings(marksWithIssue('a.md', DOC), STATE).filter((x) => x.reason === 'closed');
  const out = renderFindings(f).join('\n');
  assert.match(out, /#100 は閉じています/);
  assert.match(out, /IMPL-0001 a\.md:7/);
});

test('コメント: 署名を含み、識別子の順序に依らない。同じ所見の繰り返しを避ける', () => {
  const [f] = planIssueFindings(marksWithIssue('a.md', DOC), STATE).filter((x) => x.reason === 'closed');
  const body = commentBody(f);
  assert.match(body, /<!-- impl-plan-issues:IMPL-0001,IMPL-0004 -->/);
  assert.match(body, /IMPL-0001/);
  const reversed = { ...f, marks: [...f.marks].reverse() };
  assert.equal(findingSignature(reversed), findingSignature(f));
  assert.equal(alreadyCommented([body], f), true, '同じ所見のコメントがあれば足さない');
  assert.equal(alreadyCommented(['関係ないコメント', null], f), false);
  const another = { ...f, marks: f.marks.slice(0, 1) };
  assert.equal(alreadyCommented([body], another), false, 'マークの集合が変われば、新しい所見として足す');
});

test('コメントは、機械が状態を変えないことを書き、責任者・承認者を書かない', () => {
  const [f] = planIssueFindings(marksWithIssue('a.md', DOC), STATE);
  const body = commentBody(f);
  assert.match(body, /機械はこの Issue の状態を変えません/);
  assert.doesNotMatch(body, /承認者|責任者/);
});

test('IMPL-PLAN:ng 一覧の写しに無い番号と PR の番号を、lint:impl の側で落とす', () => {
  const index = new Map([
    [100, { kind: 'issue', title: 'a' }],
    [300, { kind: 'pr', title: 'b' }],
  ]);
  assert.match(issueRefProblem('999', index), /写しにありません/);
  assert.match(issueRefProblem('300', index), /プルリクエスト/);
  assert.match(issueRefProblem('100', new Map()), /写しが空か/);
});

test('IMPL-PLAN:ok 写しに在る Issue は通る(状態は見ない)', () => {
  const index = new Map([[100, { kind: 'issue', title: 'a' }]]);
  assert.equal(issueRefProblem('100', index), null);
});

// ---- H-1: 閉じる前の確認(--issue)。状態に依らず、その番号を issue= に持つマークを出す ----
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, 'check-impl-plan-issues.mjs');
const CHECK_IMPL = path.join(HERE, 'check-impl.mjs');
const FIX = mkdtempSync(path.join(tmpdir(), 'plan-issues-'));
process.on('exit', () => rmSync(FIX, { recursive: true, force: true }));
writeFileSync(path.join(FIX, 'a.md'), DOC);
const EMPTY = path.join(FIX, 'empty');
mkdirSync(EMPTY);
/** PATH を空にして走らせる。gh が呼ばれれば ENOENT で exit=2 になる(ネットワークへ出ない) */
function run(args, docs = FIX) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, PATH: '', Path: '', IMPL_DOCS_DIR: docs },
  });
  return { code: r.status, out: r.stdout + r.stderr };
}
const NAMED = marksWithIssue('a.md', DOC);
const NUM = NAMED[0].issue;

test('marksNaming: 名指すマークがあれば出す(状態は問わない)、無ければ出さない', () => {
  assert.equal(marksNaming(NAMED, [NUM]).length, 1);
  assert.equal(marksNaming(NAMED, [NUM + 100000]).length, 0);
  assert.deepEqual(parseIssueList('443,444'), [443, 444]);
  assert.throws(() => parseIssueList('x'));
  assert.throws(() => parseIssueList('443,'));
});

test('--issue 違反: その番号を issue= に持つマークが残れば exit=1(gh なしで動く)', () => {
  const r = run(['--issue', String(NUM)]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp('#' + NUM));
  assert.match(r.out, /IMPL-/);
});

test('--issue 適合: 名指すマークが 0 件なら exit=0', () => {
  const r = run(['--issue', String(NUM + 100000)]);
  assert.equal(r.code, 0, r.out);
});

test('--issue の値が読めなければ exit=2', () => {
  assert.equal(run(['--issue', 'x']).code, 2);
  assert.equal(run(['--issue']).code, 2);
});

test('N-1 違反: 書き損ねた引数は exit=2(黙って別の確認へ落ちない)', () => {
  const n = String(NUM);
  for (const args of [['--issues', n], [n], ['--issue', n, '444'], ['--issue=', ], ['--issue', '#' + n], ['--isue=' + n], ['--issue', n, '--bogus'], ['--issue', n, '--issue', n]]) {
    const r = run(args);
    assert.equal(r.code, 2, JSON.stringify(args) + ' ' + r.out);
  }
});

test('N-1 適合: --issue=<番号> の形は --issue <番号> と同じ結果', () => {
  assert.equal(run(['--issue=' + NUM]).code, 1);
  assert.equal(run(['--issue=' + (NUM + 100000)]).code, 0);
});

// ---- M-2: 失敗の扱い ----
test('gh が無ければ(PATH が空)exit=2。所見なしの合格にしない', () => {
  const r = run([]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /実行に失敗しました/);
});

test('--closed-from: 違反で exit=1、適合で exit=0、読めない行で exit=2', () => {
  const f = path.join(FIX, 'closed.txt');
  writeFileSync(f, NUM + ' closed\n');
  assert.equal(run(['--closed-from', f]).code, 1);
  writeFileSync(f, NUM + ' open\n');
  assert.equal(run(['--closed-from', f]).code, 0);
  writeFileSync(f, NUM + ' reopened\n');
  assert.equal(run(['--closed-from', f]).code, 2);
});

test('マークが 1 件も見つからなければ exit=2(置き場や書式の誤りを合格にしない)', () => {
  assert.equal(run(['--closed-from', path.join(FIX, 'closed.txt')], EMPTY).code, 2);
  assert.equal(run(['--issue', '1'], EMPTY).code, 2);
});

test('ghStateOf: HTTP 404 だけを実在しないとし、ほかの失敗は例外にする', () => {
  const fail = (stderr) => () => {
    const e = new Error('x');
    e.stderr = stderr;
    throw e;
  };
  assert.equal(ghStateOf(fail('gh: Not Found (HTTP 404)'), 'o/r', 5), null);
  assert.throws(() => ghStateOf(fail('gh: Bad credentials (HTTP 401)'), 'o/r', 5));
  assert.throws(() => ghStateOf(fail('gh: API rate limit exceeded (HTTP 403)'), 'o/r', 5));
  assert.throws(
    () => ghStateOf(fail('Get "https://api.github.com/repos/o/r/issues/404": dial tcp: refused'), 'o/r', 404),
    undefined,
    '番号に 404 を含む URL の失敗を、実在しないにしない',
  );
  assert.throws(() => ghStateOf(() => { throw new Error('spawnSync gh ENOENT'); }, 'o/r', 5));
});

test('ghStateOf: open / closed / PR を読み分け、状態が読めない応答は例外にする', () => {
  assert.deepEqual(ghStateOf(() => '{"state":"open"}', 'o/r', 5), { kind: 'issue', state: 'open' });
  assert.deepEqual(ghStateOf(() => '{"state":"closed"}', 'o/r', 5), { kind: 'issue', state: 'closed' });
  assert.deepEqual(ghStateOf(() => '{"state":"open","pull_request":{}}', 'o/r', 5), { kind: 'pr', state: 'open' });
  assert.throws(() => ghStateOf(() => '{}', 'o/r', 5));
  assert.throws(() => ghStateOf(() => '{"message":"Bad credentials"}', 'o/r', 5));
  assert.throws(() => planIssueFindings(marksWithIssue('a.md', DOC), () => ({ kind: 'issue', state: undefined })));
});

test('結線: check-impl.mjs が issueRefProblem を issue= のマークに掛け、所見を errors へ入れる', () => {
  const src = readFileSync(CHECK_IMPL, 'utf8');
  assert.match(src, /issueRefProblem/, 'check-impl.mjs が issueRefProblem を読んでいない');
  assert.match(src, /if \(m\.issue\)\s*\{[^}]*issueRefProblem\(m\.issue[^}]*errors\.push/s, 'issue= の番号の検査が errors へ結線されていない');
});

console.log(`\n計画の Issue の検出の試験: ${passed}件 合格`);
