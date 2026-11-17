// 知識ベースの生成元(source.commit)が HEAD の祖先かの検査の試験(#332 / ADR-0157 決定3)
//   node scripts/test-kb-ancestry.mjs   (npm run test:criteria)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ancestryProblems } from './lib/inputs.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-ancestry-'));
const g = (...a) => {
  const r = spawnSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...a], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`  ok ${name}`); }

try {
  g('init', '-q', '-b', 'main');
  g('commit', '-q', '--allow-empty', '-m', 'a');
  const a = g('rev-parse', 'HEAD');
  g('commit', '-q', '--allow-empty', '-m', 'b');
  g('checkout', '-q', '-b', 'side');
  g('commit', '-q', '--allow-empty', '-m', 'orphaned');
  const orphan = g('rev-parse', 'HEAD');
  g('checkout', '-q', 'main');
  g('branch', '-q', '-D', 'side'); // 枝を消して、HEAD から到達できないコミットを作る(オブジェクトは残る)

  test('祖先である: 問題なし', () => assert.deepEqual(ancestryProblems(dir, a), []));
  test('祖先でない(到達できないコミット): 失敗。再生成を案内する', () => {
    const p = ancestryProblems(dir, orphan);
    assert.equal(p.length, 1);
    assert.match(p[0], /祖先ではありません/);
    assert.match(p[0], /npm run template:kb/);
  });
  test('オブジェクトが無い: 失敗(一致として扱わない)', () => {
    const p = ancestryProblems(dir, 'f'.repeat(40));
    assert.equal(p.length, 1);
    assert.match(p[0], /ありません/);
  });
  test('git のリポジトリでない: 失敗', () => {
    const p = ancestryProblems(os.tmpdir(), a);
    assert.equal(p.length, 1);
  });
  test('浅い clone: 失敗(履歴を読めないことを一致として扱わない)', () => {
    const shallow = path.join(dir, 'shallow-clone');
    const r = spawnSync('git', ['clone', '-q', '--depth', '1', pathToFileURL(dir).href, shallow], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const p = ancestryProblems(shallow, a);
    assert.equal(p.length, 1);
    assert.match(p[0], /浅い clone/);
  });
  console.log(`知識ベースの生成元の祖先の試験: ${passed}件 通過`);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
