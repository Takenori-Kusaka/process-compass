// 実装マークの計画の Issue の検出(check-impl-plan-issues.mjs / lib/plan-issues.mjs)の陽性対照(Issue #439 / ADR-0130)
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
} from './lib/plan-issues.mjs';

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

test('コメントは Issue の状態を変える操作を案内しない(責任者・承認者を書かない)', () => {
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

console.log(`\n計画の Issue の検出の試験: ${passed}件 合格`);
