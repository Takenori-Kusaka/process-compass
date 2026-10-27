#!/usr/bin/env node
// 準拠テンプレートの試験を、親の npm run check から流す(#319 裁定 R-6 / ADR-0089)。
//
//   node scripts/test-template-suite.mjs [--list]   (npm run test:template-suite)
//
// 試験の一覧は、テンプレートの gate-g5.yml のジョブ contract の手順と共有する。別の一覧を持たない。
// 一覧を2か所に持つと、片方へ足した試験が他方で流れない。gate-g5.yml を一覧の正本とし、次の手順を試験として読む:
//   - run がちょうど `node scripts/gate/<名>.mjs`(引数なし)で、if を持たない手順
// 確かめること:
//   1. 一覧の試験がすべて通る(どれかが落ちれば終了コード 1)
//   2. テンプレートの scripts/gate/test-*.mjs のうち、gate-g5.yml のどこからも実行されないものが無い
//      (試験のファイルを足して一覧へ足し忘れる形を止める)
//   3. 試験がテンプレートの作業ツリーを書き換えない(実行の前後で git status が同じ)
// 確かめないこと: gate-g5.yml の Node の版(setup-node が無い。後継の Issue の候補。裁定 R-6)
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { missingInputs, describeMissing } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TPL = path.join(ROOT, 'template');
const WF = '.github/workflows/gate-g5.yml';
const missing = missingInputs(ROOT, ['template', `template/${WF}`]);
if (missing.length) {
  console.error(describeMissing('テンプレートの試験', missing));
  process.exit(1);
}

const wfText = fs.readFileSync(path.join(TPL, WF), 'utf8');
const wf = YAML.parse(wfText);
const STEP = /^node (scripts\/gate\/[\w-]+\.mjs)$/;
const list = (wf.jobs?.contract?.steps ?? [])
  .filter((s) => s && typeof s.run === 'string' && !('if' in s) && STEP.test(s.run.trim()))
  .map((s) => STEP.exec(s.run.trim())[1]);
if (!list.length) {
  console.error(`テンプレートの試験: ${WF} のジョブ contract に試験の手順が見つかりません。一覧の読み方を確かめてください`);
  process.exit(1);
}
if (process.argv.includes('--list')) {
  console.log(list.join('\n'));
  process.exit(0);
}

const problems = [];
const tests = fs.readdirSync(path.join(TPL, 'scripts/gate')).filter((f) => /^test-[\w-]+\.mjs$/.test(f));
for (const f of tests) if (!wfText.includes(`scripts/gate/${f}`)) problems.push(`scripts/gate/${f} が ${WF} のどこからも実行されません(一覧へ足すか、試験でないなら名を改める)`);

const status = () => execFileSync('git', ['-C', TPL, 'status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' });
const before = status();
const started = Date.now();
for (const rel of list) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [rel], { cwd: TPL, encoding: 'utf8', timeout: 15 * 60 * 1000, env: { ...process.env, GITHUB_BASE_REF: '' } });
  const sec = Math.round((Date.now() - t0) / 1000);
  if (r.status === 0) console.log(`  ok   ${rel} (${sec}s)`);
  else {
    console.log(`  FAIL ${rel} (${sec}s、終了コード ${r.status ?? r.signal})`);
    console.log(`${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-30).map((l) => `       ${l}`).join('\n'));
    problems.push(`${rel} が落ちた(終了コード ${r.status ?? r.signal})`);
  }
}
const after = status();
if (after !== before) problems.push(`試験がテンプレートの作業ツリーを書き換えた:\n${after}`);

if (problems.length) {
  console.error(`テンプレートの試験: ${problems.length} 件\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`テンプレートの試験: ${list.length} 本が通った(一覧は ${WF} のジョブ contract と共有。${Math.round((Date.now() - started) / 1000)}s)`);
