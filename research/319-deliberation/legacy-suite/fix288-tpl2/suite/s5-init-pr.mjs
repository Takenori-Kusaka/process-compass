// #286 N4: 3名の体制で、初期化のコミットを PR 経由(案内どおり)で入れた場合に、出荷の証跡で G-6 の欠落にならないこと。
// 対照: 旧い案内どおり main へ直接入れた場合は欠落になる(B の事例の再現)。
//   sh fresh.sh s5a && sh fresh.sh s5b && node s5-init-pr.mjs
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, NAMES, SEATS, fill, TODAY, BASE } from './lib.mjs';

const { check, done } = checker();
const MOCK = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), 'mockgh-prs.mjs');

for (const [ws, viaPr] of [['s5a', true], ['s5b', false]]) {
  const W = workspace(ws);
  const { run, git, write, read, gen, commit } = W;
  const tag = viaPr ? 'PR 経由' : '直接(対照)';
  const tpl = git('rev-parse', 'HEAD').out.trim();
  write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', ...BASE });
  const init = gen('--answers', 'answers.json', '--stack', 'node');
  fs.rmSync(path.join(W.DIR, 'answers.json'));
  check(`${tag}: 3名で初期化が通る`, init.ok, init.out);
  write('package-lock.json', '{ "name": "x", "lockfileVersion": 3, "requires": true, "packages": {} }\n');
  let initHash;
  if (viaPr) {
    git('switch', '-q', '-c', 'chore/process-init');
    commit('chore: プロセス構成を初期化する');
    git('switch', '-q', 'main');
    git('merge', '-q', '--squash', 'chore/process-init');
    commit('chore: プロセス構成を初期化する (#1)');
  } else {
    git('add', '-A');
    git('commit', '-q', '-m', 'chore: プロセス構成を初期化する\n\nRisk: R2\nVerification: verify-gate-contract と check-process-rules が通過');
  }
  initHash = git('rev-parse', 'HEAD').out.trim();

  // D-0 と任免(記録だけのコミット)
  fs.copyFileSync(path.join(W.DIR, 'templates/00-d0-governance.md'), path.join(W.DIR, 'docs/D-0-governance.md'));
  gen('--answers', 'process.config.json');
  const people = NAMES.slice(0, 3).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [`acct-${i + 1}`] }));
  const assign = { 'biz-approver': 1, 'value-owner': 0, 'tech-lead': 0, 'dev-verifier': 0, 'independent-reviewer': 1, 'qa-gatekeeper': 2, 'context-owner': 0, 'ai-maintainer': 1, 'ai-ops': 0 };
  const seats = Object.fromEntries(SEATS.map((s) => [s, { accountable: NAMES[assign[s]] }]));
  const f = fill(W, people, seats);
  check(`${tag}: 3名の任免が通る`, f.ok, f.out);
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^approver:.*$/m, `approver: ${NAMES[1]}`).replace(/^approved_at:.*$/m, `approved_at: ${TODAY}`).replace(/^approval_scope:.*$/m, 'approval_scope: all').replace(/^next_review:.*$/m, 'next_review: 2027-03-31'));
  fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
  commit('docs: 体制を記入し、D-0 を承認する');

  // PR #1 の記録(独立レビュアが挙動要約つきで承認)
  const prs = path.join(W.DIR, '.git', 'prs');
  fs.mkdirSync(prs, { recursive: true });
  fs.writeFileSync(
    path.join(prs, '1.json'),
    JSON.stringify({
      number: 1,
      title: 'chore: プロセス構成を初期化する',
      author: { login: 'acct-1' },
      reviews: [{ author: { login: 'acct-2' }, state: 'APPROVED', body: '挙動要約: 3名の構成で G-6 を適用し、強制層の初期値がテンプレートの既定と一致することを確かめた' }],
      statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }],
      body: `## 検証方法と結果\n\ng5-local が通過\n\n## 作成を指示した者\n\n${NAMES[0]}\n\n## リスク区分\n\nR2\n\n## トレーラ\n\nSpec: setup\n`,
      mergeCommit: { oid: initHash },
      commits: [{ oid: initHash, messageHeadline: 'chore: プロセス構成を初期化する' }],
    })
  );
  const agg = run('node', ['--import', `file:///${MOCK.replace(/\\/g, '/')}`, 'scripts/gate/aggregate-evidence.mjs', '--from', tpl, '--to', 'HEAD'], { GITHUB_REPOSITORY: 'example/s5', MOCK_PRS: prs });
  const init8 = initHash.slice(0, 8);
  const ev = JSON.parse(read('evidence/evidence.json'));
  const gapsText = (ev.gaps ?? []).join('\n');
  const initGap = (ev.gaps ?? []).filter((g) => g.includes(init8) || g.includes('PR #1') || g.includes(initHash.slice(0, 7)));
  if (viaPr) {
    check(`${tag}: 初期化の変更は PR #1 として数えられる`, (ev.prs ?? []).some((p) => p.number === 1), JSON.stringify(ev.prs?.map((p) => p.number)));
    check(`${tag}: 初期化の PR に G-6 の欠落が無い(独立した人の確認に数える)`, !initGap.length, initGap.join('\n') || agg.out);
  } else {
    check(`${tag}: 初期化のコミットが G-6 の欠落になる(旧い案内の事例を再現)`, initGap.some((g) => /独立した人の確認|G-6/.test(g)), gapsText || agg.out);
  }
}
done();
