#!/usr/bin/env node
// 決定の識別子の実在の検査(scripts/lib/decision-refs.mjs)の試験(#319 §8 X-1)。
//
//   node scripts/test-decision-refs.mjs   (npm run lint:refs が流す)
//
// 偽の識別子を落とすことを確かめる。突合(crosscheck.md X-1)が通ることを示した形を、陰性の対照として持つ:
//   - ADR-0078 決定10(ADR-0078 の決定は 1〜7。本文の「書式(決定10)」への部分一致で通っていた)
//   - 調査メモにだけ書かれた Issue の番号(記載の有無で代えていたため、ほぼ全ての番号が通っていた)
import assert from 'node:assert/strict';
import { problemOf, isDecision, byProblems, adrDecisions, issueIndex } from './lib/decision-refs.mjs';

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok ${name}`);
};

test('ADR の決定は、決定の節の見出しの番号で確かめる(本文の他の ADR の決定の引用に一致しない)', () => {
  assert.deepEqual([...adrDecisions('0078').numbers].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(problemOf('ADR-0078 決定1'), null);
  assert.match(problemOf('ADR-0078 決定10'), /決定の節に「### 10\.」が無い/);
  assert.match(problemOf('ADR-0078 決定8'), /「### 8\.」が無い/);
  assert.match(problemOf('ADR-9999'), /ページが無い/);
  assert.match(problemOf('ADR-0028 決定1'), /「### 1\.」が無い/);
  // 「### 決定N:」の形の見出し
  assert.equal(problemOf('ADR-0036 決定2'), null);
  assert.match(problemOf('ADR-0036 決定9'), /「### 9\.」が無い/);
});
test('Issue は一覧の写しで確かめる', () => {
  assert.ok(issueIndex().size > 300);
  assert.equal(problemOf('#319'), null);
  assert.match(problemOf('#99999'), /一覧の写しに無い/);
  assert.match(problemOf('#0'), /一覧の写しに無い/);
});
test('K 番号と標準の条項', () => {
  assert.equal(problemOf('K65'), null);
  assert.match(problemOf('K99'), /見出しが/);
  assert.equal(problemOf('標準 5.8.5'), null);
  assert.match(problemOf('標準 5.8.99'), /見出し「5\.8\.99」が無い/);
  assert.equal(problemOf('標準 G-4'), null);
  assert.match(problemOf('標準 G-9'), /見出し「G-9」が無い/);
  assert.equal(isDecision('標準 G-4'), true);
  assert.match(problemOf('ADR-77'), /形が分からない/);
});
test('決定に当たるのは ADR の決定・番号の無い ADR・K 番号・標準の条項。Issue と、番号つきの決定を持つ ADR の全体は当たらない', () => {
  assert.equal(isDecision('ADR-0088 決定5'), true);
  assert.equal(isDecision('ADR-0028'), true);
  assert.equal(isDecision('ADR-0088'), false);
  assert.equal(isDecision('K65'), true);
  assert.equal(isDecision('標準 5.8.5'), true);
  assert.equal(isDecision('#319'), false);
});
test('changed の by は決定を含む。Issue だけ・偽の決定は落ちる', () => {
  assert.deepEqual(byProblems('ADR-0088 決定5'), []);
  assert.deepEqual(byProblems('ADR-0088 決定5、#319'), []);
  assert.match(byProblems('#319').join(), /決定.*を含まない/);
  assert.match(byProblems('ADR-0088').join(), /決定.*を含まない/);
  assert.match(byProblems('ADR-0078 決定10').join(), /「### 10\.」が無い/);
  assert.match(byProblems('ADR-0088 決定5、#99999').join(), /一覧の写しに無い/);
});
console.log(`決定の識別子の検査の試験: ${passed} 件 合格`);
