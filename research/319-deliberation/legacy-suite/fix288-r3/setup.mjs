// 採用判断(2回目)の検証: 採用者(東海精機工業 情報システム部)のリポジトリを、テンプレートの複製から作る。
//   node setup.mjs <phase>   phase: clone | init | seats | docs | all
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TPL = path.resolve(HERE, '../../template');
const DIR = path.join(HERE, 'adopter');
const LOG = path.join(HERE, 'setup.log');
const phase = process.argv[2] ?? 'all';
const TODAY = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();

const log = (s) => {
  fs.appendFileSync(LOG, s + '\n');
  console.log(s);
};
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: DIR, encoding: 'utf8', env: { ...process.env, GITHUB_BASE_REF: '', ...(opts.env ?? {}) }, maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  log(`$ ${cmd} ${args.join(' ')} -> exit ${r.status}`);
  if (r.status !== 0 || opts.show) log(out.split('\n').slice(-40).join('\n'));
  return { ok: r.status === 0, out, code: r.status };
};
const git = (...a) => run('git', a);
const node = (...a) => run('node', a);
const write = (rel, t) => {
  fs.mkdirSync(path.dirname(path.join(DIR, rel)), { recursive: true });
  fs.writeFileSync(path.join(DIR, rel), typeof t === 'string' ? t : JSON.stringify(t, null, 2) + '\n');
};
const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
const cfg = () => JSON.parse(read('process.config.json'));
const change = (c) => {
  write('change.json', c);
  const r = node('scripts/init/generate-profile.mjs', '--change', 'change.json');
  fs.rmSync(path.join(DIR, 'change.json'), { force: true });
  return r;
};
const commit = (msg) => {
  git('add', '-A');
  git('commit', '-q', '-m', msg);
  return git('rev-parse', 'HEAD').out.trim();
};
// PR の記録(模擬の gh が読む)
const PRS = path.join(DIR, '.git', 'prs');
const prJson = (num, title, hash, { author = 'dev-ichiro', reviewer = 'shinsa-hanako', risk = 'R2', confirmer = '審査 花子', instructor = '開発 一郎', summary = '挙動要約: 差分を読み、点検期限の計算と削除の権限の分岐を自分で確かめた' } = {}) =>
  fs.writeFileSync(
    path.join(PRS, `${num}.json`),
    JSON.stringify({
      number: num,
      title,
      author: { login: author },
      reviews: reviewer ? [{ author: { login: reviewer }, state: 'APPROVED', body: summary }] : [],
      statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }],
      body: `## 検証方法と結果\n\ng5-local が通過。node --test が通過\n\n## 作成を指示した者\n\n${instructor}\n\n## リスク区分\n\n${risk}\n\n確定した者: ${confirmer}\n\n## トレーラ\n\nSpec: F-001\n`,
      mergeCommit: { oid: hash },
      commits: [{ oid: hash, messageHeadline: title }],
      labels: [],
    })
  );
let prNo = 1;
const prCommit = (msg, opts) => {
  prNo += 1;
  const h = commit(`${msg} (#${prNo})`);
  prJson(prNo, msg, h, opts);
  return h;
};

// ---------------------------------------------------------------- clone
function clone() {
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.mkdirSync(DIR, { recursive: true });
  execFileSync('sh', ['-c', `cd "${TPL}" && tar cf - --exclude=.git --exclude=node_modules . | (cd "${DIR}" && tar xf -)`]);
  // CRLF → LF
  execFileSync('sh', ['-c', `cd "${DIR}" && find . -type f \\( -name '*.md' -o -name '*.mjs' -o -name '*.js' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.sh' -o -name '*.template' -o -name '.gitignore' -o -name 'CODEOWNERS' \\) -exec sed -i 's/\\r$//' {} +`]);
  git('init', '-q', '-b', 'main', '.');
  git('config', 'user.email', 'it-dept@tokai-seiki.example');
  git('config', 'user.name', 'tokai-seiki-it');
  git('config', 'core.autocrlf', 'false');
  commit('chore: pit-in-template から作成');
  fs.mkdirSync(PRS, { recursive: true });
  log('clone done');
}

// ---------------------------------------------------------------- init(/process-init)
function init() {
  write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'growth', 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-exist', 'q-ai-constraint': 'ai-approved-only', 'q-product-type': 'internal' });
  const r = node('scripts/init/generate-profile.mjs', '--answers', 'answers.json', '--stack', 'node', '--project-id', 'P-2026-017', '--profile-name', 'inspection-scheduler');
  fs.rmSync(path.join(DIR, 'answers.json'));
  if (!r.ok) throw new Error('init failed');
  write('package-lock.json', '{ "name": "inspection-scheduler", "lockfileVersion": 3, "requires": true, "packages": {} }\n');
  git('switch', '-q', '-c', 'chore/process-init');
  commit('chore: プロセス構成を初期化する');
  git('switch', '-q', 'main');
  git('merge', '-q', '--squash', 'chore/process-init');
  const h = commit('chore: プロセス構成を初期化する (#1)');
  prJson(1, 'chore: プロセス構成を初期化する', h, { reviewer: 'shinsa-hanako', risk: 'R3', instructor: '開発 一郎', confirmer: '審査 花子', summary: '挙動要約: 構成の生成物を読んだ' });
  fs.copyFileSync(path.join(DIR, 'templates/00-d0-governance.md'), path.join(DIR, 'docs/D-0-governance.md'));
  node('scripts/init/generate-profile.mjs', '--answers', 'process.config.json');
  log('init done');
}

// ---------------------------------------------------------------- 席(3名)
export const PEOPLE = [
  { id: 'p1', name: '開発 一郎', accounts: ['dev-ichiro'] },
  { id: 'p2', name: '審査 花子', accounts: ['shinsa-hanako'] },
  { id: 'p3', name: '品証 三郎', accounts: ['hinsho-saburo'] },
];
function seats() {
  const r = change({
    kind: 'accountable',
    date: TODAY,
    summary: '初期の体制を記入(開発者・独立レビュア・出荷判定者を別人)',
    people: PEOPLE,
    seats: {
      'biz-approver': { accountable: '審査 花子' },
      'value-owner': { accountable: '開発 一郎' },
      'tech-lead': { accountable: '開発 一郎' },
      'dev-verifier': { accountable: '開発 一郎' },
      'independent-reviewer': { accountable: '審査 花子' },
      'qa-gatekeeper': { accountable: '品証 三郎' },
      'context-owner': { accountable: '開発 一郎' },
      'ai-maintainer': { accountable: '審査 花子' },
      'ai-ops': { accountable: '開発 一郎' },
    },
    decidedBy: '審査 花子',
    reason: '情報システム部 開発課の体制。出荷判定者は品質保証部からの兼務',
  });
  if (!r.ok) throw new Error('seats failed');
  log('seats done');
}

if (phase === 'clone' || phase === 'all') clone();
if (phase === 'init' || phase === 'all') init();
if (phase === 'seats' || phase === 'all') seats();
