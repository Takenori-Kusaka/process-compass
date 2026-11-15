// 節番号の参照の検査(check-section-refs.mjs)の番号と名の対応の陽性・陰性対照(Issue #326 の項目)
//
//   node scripts/test-section-refs.mjs   (npm run lint:refs に含む)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'refs-'));
const LINK = '(/process-compass/phase4-process-design/roles-responsibilities/)';

function run(name, text) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, `${text}\n`);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/check-section-refs.mjs'), file], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

test('番号と名が合う参照は通る', () => {
  assert.equal(run('ok.md', `決裁は [第3章 3.8]${LINK}「決裁権限マトリクス」で定める。`).code, 0);
});
test('名が番号つきの見出しの下の小見出しにある参照は通る(1.10.1 の下の番号の無い小見出し)', () => {
  assert.equal(run('child.md', '正本は [第1章 1.10.1](/process-compass/phase4-process-design/overview/)「実環境の統制の確認と、導入前の検証の結果」です。').code, 0);
});
test('番号の見出しに名が無い参照(元の誤参照の型)は落ちる', () => {
  const r = run('bad.md', `決裁は [第3章 3.9]${LINK}「決裁権限マトリクス」で定める。`);
  assert.equal(r.code, 1);
  assert.match(r.out, /番号と名の対応/);
});
test('名を鉤括弧の中に入れたリンクの形でも落ちる', () => {
  assert.equal(run('bad2.md', `決裁は [第3章 3.9「決裁権限マトリクス」]${LINK}で定める。`).code, 1);
});
test('語を添えない参照は機械で閉じない(通る。ヘッダに開示)', () => {
  assert.equal(run('bare.md', '決裁は第3章 3.9 で定める。').code, 0);
});
test('ref-ok の理由つきの印で除外できる', () => {
  assert.equal(run('exempt.md', `決裁は [第3章 3.9]${LINK}「決裁権限マトリクス」で定める。<!-- ref-ok: 試験 -->`).code, 0);
});

fs.rmSync(dir, { recursive: true, force: true });
console.log(`節番号の参照の試験: ${passed}件通過`);
