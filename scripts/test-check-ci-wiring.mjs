// CI の結線の検査(check-ci-wiring.mjs)と、検査器の入力の扱い(lib/inputs.mjs)の陽性対照
// (Issue #293 / ADR-0077)
//
// 検査が既知の違反で落ちることを確かめる。検査が黙って通る故障(何も見ていない状態)を、
// 通過の出力からは見分けられないためである。
//
//   node scripts/test-check-ci-wiring.mjs   (npm run test:ci-wiring)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { checkWiring, checkRegressWiring, renderProblems } from './lib/ci-wiring.mjs';
import { missingInputs, commitProblems, describeMissing, describeMissingTarget, INIT_HINT } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

/** 結線が揃った最小の ci.yml */
function goodCi() {
  return {
    on: { pull_request: null, push: { branches: ['main'] }, workflow_dispatch: null },
    permissions: { contents: 'read' },
    jobs: {
      check: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v7' },
          { run: 'git submodule update --init --recursive template' },
          { run: 'npm ci' },
          { name: 'check', run: 'npm run check' },
        ],
      },
      deploy: {
        needs: 'check',
        if: "github.event_name == 'push' && github.ref == 'refs/heads/main'",
        permissions: { pages: 'write', 'id-token': 'write' },
        steps: [{ uses: 'actions/deploy-pages@v5' }],
      },
      publish: {
        needs: 'check',
        if: "github.event_name == 'push' && github.ref == 'refs/heads/main' && needs.check.outputs.dist_changed == 'true'",
        permissions: { contents: 'write' },
        environment: 'dist-standard',
        steps: [
          { uses: 'actions/checkout@v7', with: { 'fetch-depth': 0 } },
          { run: 'git push -q origin HEAD:refs/heads/dist/standard' },
        ],
      },
    },
  };
}
const wf = (doc, file = 'ci.yml') => ({ file, doc });
const expectProblem = (doc, re, others = []) => {
  const problems = checkWiring([wf(doc), ...others]);
  assert.ok(problems.some((p) => re.test(p)), `期待した問題が出ない: ${re}\n${problems.join('\n')}`);
};

test('結線が揃った ci.yml は通る', () => {
  assert.deepEqual(checkWiring([wf(goodCi())]), []);
});
test('リポジトリの実際のワークフローは通る', () => {
  const dir = path.join(ROOT, '.github/workflows');
  const all = fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => wf(YAML.parse(fs.readFileSync(path.join(dir, f), 'utf8')), f));
  assert.deepEqual(checkWiring(all), []);
});
test('ci.yml が無ければ失敗する', () => {
  const problems = checkWiring([wf({ permissions: { contents: 'read' } }, 'other.yml')]);
  assert.ok(problems.some((p) => /ci\.yml がありません/.test(p)));
});
test('条件1: pull_request が無い', () => {
  const d = goodCi();
  delete d.on.pull_request;
  expectProblem(d, /pull_request がありません/);
});
test('条件1: main への push が無い', () => {
  const d = goodCi();
  d.on.push = { branches: ['develop'] };
  expectProblem(d, /main への push がありません/);
});
test('条件2: npm run check の手順が無い', () => {
  const d = goodCi();
  d.jobs.check.steps[3].run = 'npm run build';
  expectProblem(d, /ちょうど「npm run check」/);
});
test('条件2: npm run check の手順に if がある', () => {
  const d = goodCi();
  d.jobs.check.steps[3].if = "github.event_name == 'push'";
  expectProblem(d, /npm run check の手順に if/);
});
test('条件2: npm run check の手順に continue-on-error がある', () => {
  const d = goodCi();
  d.jobs.check.steps[3]['continue-on-error'] = true;
  expectProblem(d, /npm run check の手順に continue-on-error/);
});
test('条件2: ジョブ check に continue-on-error・if がある', () => {
  const d = goodCi();
  d.jobs.check['continue-on-error'] = true;
  d.jobs.check.if = 'false';
  expectProblem(d, /ジョブ check に continue-on-error/);
  expectProblem(d, /ジョブ check に if/);
});
test('条件3: template のサブモジュールを取得しない', () => {
  const d = goodCi();
  d.jobs.check.steps.splice(1, 1);
  expectProblem(d, /template のサブモジュールを取得していません/);
});
test('条件3: checkout の submodules で取得する形は通る', () => {
  const d = goodCi();
  d.jobs.check.steps.splice(1, 1);
  d.jobs.check.steps[0].with = { submodules: 'recursive' };
  assert.deepEqual(checkWiring([wf(d)]), []);
});
test('条件4: 公開のジョブが needs に check を持たない', () => {
  const d = goodCi();
  delete d.jobs.deploy.needs;
  expectProblem(d, /Pages へ配備するジョブ deploy の needs/);
});
test('条件4: 配布のジョブが main への push に限っていない', () => {
  const d = goodCi();
  d.jobs.publish.if = "github.ref == 'refs/heads/main'";
  expectProblem(d, /dist\/standard へ書くジョブ publish の if/);
});
test('条件4: 公開のジョブが ci.yml の外にある', () => {
  const d = goodCi();
  delete d.jobs.deploy;
  const other = wf({ permissions: { contents: 'read' }, jobs: { build: { steps: [{ uses: 'actions/deploy-pages@v5' }] } } }, 'deploy.yml');
  expectProblem(d, /deploy\.yml: Pages へ配備するジョブ build が ci\.yml の外/, [other]);
});
test('条件4: 公開・配布のジョブの if に always()・!cancelled()・failure()・|| がある', () => {
  for (const cond of [
    "always() && github.event_name == 'push' && github.ref == 'refs/heads/main'",
    "!cancelled() && github.event_name == 'push' && github.ref == 'refs/heads/main'",
    "failure() && github.event_name == 'push' && github.ref == 'refs/heads/main'",
    "github.event_name == 'push' || github.ref == 'refs/heads/main'",
  ]) {
    const d = goodCi();
    d.jobs.deploy.if = cond;
    expectProblem(d, /状態の関数/);
  }
});
test('条件4・6: dist/standard を変数に置き、push を別の手順に分けても配布のジョブと認識する', () => {
  const d = goodCi();
  d.jobs.publish.steps = [{ run: 'BR=dist/standard; echo "BR=$BR" >> "$GITHUB_ENV"' }, { run: 'git push -q "$REMOTE" "HEAD:refs/heads/$BR"' }];
  delete d.jobs.publish.environment;
  expectProblem(d, /environment がありません/);
});
test('条件3: --recursive だけで template の語の無い取得は通さない', () => {
  const d = goodCi();
  d.jobs.check.steps[1].run = 'git submodule update --init --recursive zenn';
  expectProblem(d, /template のサブモジュールを取得していません/);
});
test('条件8: dist/standard が publish の外に現れる', () => {
  const d = goodCi();
  d.jobs.check.steps.push({ run: 'git fetch origin dist/standard' });
  expectProblem(d, /ジョブ check: dist\/standard が/);
  const other = wf({ permissions: { contents: 'read' }, jobs: { x: { steps: [{ run: 'git fetch origin dist/standard' }] } } }, 'other.yml');
  expectProblem(goodCi(), /other\.yml のジョブ x/, [other]);
});
test('条件5: 最上位の permissions が無い・書き込みを与える', () => {
  const d = goodCi();
  delete d.permissions;
  expectProblem(d, /最上位に permissions がありません/);
  const e = goodCi();
  e.permissions = { contents: 'write' };
  expectProblem(e, /最上位の permissions が書き込み/);
  const f = goodCi();
  f.permissions = 'write-all';
  expectProblem(f, /最上位の permissions が書き込み/);
});
test('条件9: check のジョブに contents: write を付けると失敗する', () => {
  const d = goodCi();
  d.jobs.check.permissions = { contents: 'write' };
  expectProblem(d, /ジョブ check が contents の書き込みを持ちます/);
  const e = goodCi();
  e.jobs.deploy.permissions = 'write-all';
  expectProblem(e, /ジョブ deploy が contents の書き込みを持ちます/);
});
test('条件5・9: 最上位の contents: write は失敗する(publish の権限をそこから継ぐ形も通さない)', () => {
  const d = goodCi();
  d.permissions = { contents: 'write' };
  delete d.jobs.publish.permissions;
  expectProblem(d, /最上位の permissions が書き込み/);
  expectProblem(d, /publish の permissions に contents: write がありません/);
});
test('条件9: publish に contents: write が無い・write-all・environment が別・needs が無い', () => {
  const a = goodCi();
  a.jobs.publish.permissions = { contents: 'read' };
  expectProblem(a, /publish の permissions に contents: write がありません/);
  const b = goodCi();
  b.jobs.publish.permissions = 'write-all';
  expectProblem(b, /publish の permissions が「write-all」/);
  const c = goodCi();
  c.jobs.publish.environment = { name: 'github-pages' };
  expectProblem(c, /environment dist-standard を参照していません/);
  const e = goodCi();
  e.jobs.publish.environment = { name: 'dist-standard' };
  assert.deepEqual(checkWiring([wf(e)]), []);
  const f = goodCi();
  delete f.jobs.publish.needs;
  expectProblem(f, /ジョブ publish の needs に check がありません/);
});
test('条件10: 配布のジョブが秘密情報・SSH の鍵を使うと失敗する', () => {
  const a = goodCi();
  a.jobs.publish.steps.unshift({ env: { DEPLOY_KEY: '${{ secrets.DIST_STANDARD_DEPLOY_KEY }}' }, run: 'test -n "$DEPLOY_KEY"' });
  expectProblem(a, /秘密情報\(secrets\.\)を参照します/);
  const b = goodCi();
  b.jobs.publish.steps.unshift({ run: 'echo "GIT_SSH_COMMAND=ssh -i $HOME/.ssh/k" >> "$GITHUB_ENV"' });
  expectProblem(b, /SSH の鍵・接続を使います/);
  const c = goodCi();
  c.jobs.publish.steps[0].with.token = '${{ secrets.PAT }}';
  expectProblem(c, /秘密情報\(secrets\.\)を参照します/);
  const d = goodCi();
  d.jobs.publish.steps[1].run = 'git push -q git@github.com:o/r.git HEAD:refs/heads/dist/standard';
  expectProblem(d, /SSH の鍵・接続を使います/);
  // ci.yml の外で dist/standard へ書くジョブも同じく見る(条件4・8 と重ねて出る)
  const other = wf({ permissions: { contents: 'read' }, jobs: { x: { steps: [{ run: 'echo ${{ secrets.K }}; git push o HEAD:dist/standard' }] } } }, 'other.yml');
  expectProblem(goodCi(), /other\.yml: 配布のジョブ x が秘密情報/, [other]);
});
test('条件6: 配布のジョブに environment が無い', () => {
  const d = goodCi();
  delete d.jobs.publish.environment;
  expectProblem(d, /environment がありません/);
});
test('条件7: 失敗の文言は検査の一覧の正本を示す', () => {
  assert.match(renderProblems(['x']), /正本は package\.json の check/);
});

// --- 検査器の入力(Issue #293 裁定 J-3) ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inputs-'));
fs.mkdirSync(path.join(tmp, 'empty'));
fs.mkdirSync(path.join(tmp, 'full'));
fs.writeFileSync(path.join(tmp, 'full/a.txt'), 'x');
test('入力: 無いファイル・空のディレクトリを欠けとして返す', () => {
  const m = missingInputs(tmp, ['empty', 'full', 'full/a.txt', 'nothing.json']);
  assert.deepEqual(m.map((x) => x.rel), ['empty', 'nothing.json']);
  assert.match(m[0].why, /空のディレクトリ/);
});
test('入力: 欠けの説明は失敗に数えることと取得の命令を出す', () => {
  const s = describeMissing('検査', [{ rel: 'template', why: 'ありません' }]);
  assert.match(s, /失敗に数えます/);
  assert.ok(s.includes(INIT_HINT));
});
test('入力: 書き出し先の欠けは、検査でなく書き出しの文言で出し、--out の明示を案内する', () => {
  const s = describeMissingTarget('書き出し', [{ rel: 'template', why: 'ありません' }]);
  assert.match(s, /書き出しません/);
  assert.doesNotMatch(s, /検査を実施できません/);
  assert.match(s, /--out/);
});
fs.rmSync(tmp, { recursive: true, force: true });

test('生成元の版: unknown・短い識別子・空を通さない', () => {
  assert.equal(commitProblems('unknown').length, 1);
  assert.equal(commitProblems('bce0c25').length, 1);
  assert.equal(commitProblems('').length, 1);
  assert.equal(commitProblems(undefined).length, 1);
  assert.equal(commitProblems(`${'a'.repeat(40)}-dirty`).length, 1);
});
test('生成元の版: 40 桁の16進は通り、期待と違えば失敗する', () => {
  const sha = '0123456789abcdef0123456789abcdef01234567';
  assert.deepEqual(commitProblems(sha), []);
  assert.deepEqual(commitProblems(sha, sha), []);
  assert.match(commitProblems(sha, 'f'.repeat(40))[0], /一致しません/);
});

// ---------------------------------------------------------------- 条件11〜14(#319 裁定 R-6)
const RUN_SRC = fs.readFileSync(path.join(ROOT, 'scripts/regress/run.mjs'), 'utf8');
const goodPkg = () => ({
  scripts: {
    check: 'npm run lint:ci && npm run test:regress && npm run test:template-suite && npm run build',
    'test:regress': 'node scripts/regress/test-run.mjs && node scripts/regress/run.mjs',
    'test:template-suite': 'node scripts/test-template-suite.mjs',
  },
});
const goodCiT = () => ({ jobs: { check: { 'timeout-minutes': 60 } } });
const regress = (over = {}) => checkRegressWiring({ pkg: goodPkg(), ci: goodCiT(), runSource: RUN_SRC, ...over });
test('条件11〜14: 結線が揃えば通る', () => {
  assert.deepEqual(regress(), []);
});
test('条件11〜14: リポジトリの実際の package.json・ci.yml・run.mjs は通る', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const ci = YAML.parse(fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8'));
  assert.deepEqual(checkRegressWiring({ pkg, ci, runSource: RUN_SRC }), []);
});
test('条件11: check が test:regress・test:template-suite を含まない', () => {
  const pkg = goodPkg();
  pkg.scripts.check = 'npm run lint:ci && npm run build';
  const p = regress({ pkg });
  assert.equal(p.filter((x) => x.includes('条件11')).length, 2);
});
test('条件11: 名前の前方一致(test:regress-fast)では満たさない', () => {
  const pkg = goodPkg();
  pkg.scripts.check = 'npm run test:regress-fast && npm run test:template-suite';
  assert.ok(regress({ pkg }).some((x) => x.includes('test:regress を含みません')));
});
test('条件12: 場面を絞る・失敗を握りつぶす', () => {
  for (const cmd of ['node scripts/regress/run.mjs --only v3', 'node scripts/regress/run.mjs || true', 'node scripts/regress/run.mjs; true', 'echo skip']) {
    const pkg = goodPkg();
    pkg.scripts['test:regress'] = cmd;
    assert.ok(regress({ pkg }).some((x) => x.includes('条件12')), cmd);
  }
  const pkg = goodPkg();
  pkg.scripts['test:template-suite'] = 'node scripts/test-template-suite.mjs || exit 0';
  assert.ok(regress({ pkg }).some((x) => x.includes('test:template-suite が失敗を握りつぶします')));
});
test('条件13: ジョブ check に timeout-minutes が無い・数でない', () => {
  assert.ok(regress({ ci: { jobs: { check: {} } } }).some((x) => x.includes('条件13')));
  assert.ok(regress({ ci: { jobs: { check: { 'timeout-minutes': '60' } } } }).some((x) => x.includes('条件13')));
});
test('条件14: 作業の場所を作業ツリーの外に作らない・中を止めない・終了コードを返さない', () => {
  const p1 = regress({ runSource: RUN_SRC.replace('mkdtempSync(path.join(os.tmpdir()', 'mkdtempSync(path.join(REPO') });
  assert.ok(p1.some((x) => x.includes('mkdtemp')));
  const p2 = regress({ runSource: RUN_SRC.replaceAll('作業の場所が作業ツリーの中にある', 'x') });
  assert.ok(p2.some((x) => x.includes('作業ツリーの中なら止める')));
  const p3 = regress({ runSource: RUN_SRC.replace(/(if \(errors\.length\) \{[\s\S]*?)process\.exit\(1\);/, '$1process.exit(0);') });
  assert.ok(p3.some((x) => x.includes('終了コード 1')));
});

console.log(`\nCI の結線と検査器の入力の試験: ${passed}件 合格`);
