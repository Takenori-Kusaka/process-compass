// 検証の補助。作業用の複製(tmp/fix2-g3a/w/<name>)でスクリプトを実行する。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));

export function workspace(name) {
  const DIR = path.join(HERE, 'w', name);
  const run = (cmd, args, env = {}) => {
    try {
      return { ok: true, out: execFileSync(cmd, args, { cwd: DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GITHUB_BASE_REF: '', ...env } }) };
    } catch (e) {
      return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
    }
  };
  const git = (...args) => run('git', args);
  const write = (rel, obj) => {
    fs.mkdirSync(path.dirname(path.join(DIR, rel)), { recursive: true });
    fs.writeFileSync(path.join(DIR, rel), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
  };
  const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8');
  const cfg = () => JSON.parse(read('process.config.json'));
  const gen = (...args) => run('node', ['scripts/init/generate-profile.mjs', ...args]);
  const change = (c, dry = false) => {
    write('change.json', c);
    return gen('--change', 'change.json', ...(dry ? ['--dry-run'] : []));
  };
  const contract = (...args) => run('node', ['scripts/gate/verify-gate-contract.mjs', ...args]);
  const checkD0 = () => run('node', ['scripts/gate/check-d0.mjs']);
  const checkRules = () => run('node', ['scripts/gate/check-process-rules.mjs']);
  const resetTo = (ref) => {
    git('reset', '-q', '--hard', ref);
    git('clean', '-qfd');
  };
  const commit = (msg) => {
    git('add', '-A');
    git('commit', '-q', '-m', msg);
  };
  /** 様式から D-0 を作る(frontmatter を埋める) */
  const d0 = (version = '1.0') =>
    write(
      'docs/D-0-governance.md',
      read('templates/00-d0-governance.md')
        .replace(/^version:.*$/m, `version: ${version}`)
        .replace(/^approver:.*$/m, 'approver: 山田 太郎')
        .replace(/^approved_at:.*$/m, 'approved_at: 2026-09-30')
        .replace(/^approval_scope:.*$/m, 'approval_scope: all')
        .replace(/^next_review:.*$/m, 'next_review: 2027-03-31')
    );
  const d0Version = () => read('docs/D-0-governance.md').match(/^version:\s*(.+)$/m)?.[1].trim();
  return { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0, d0Version };
}

export function checker() {
  const VERBOSE = process.argv.includes('-v');
  let bad = 0;
  const check = (label, cond, detail = '') => {
    if (!cond) bad++;
    console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
    if ((!cond || VERBOSE) && detail) {
      const lines = String(detail).trim().split('\n').filter((l) => !/^- なし$|^$|較正引き継ぎ|人へ戻る判定件数/.test(l));
      const shown = lines.length > 30 ? [...lines.slice(0, 8), '...', ...lines.slice(-20)] : lines;
      console.log(shown.map((l) => `       ${l.slice(0, 400)}`).join('\n'));
    }
  };
  const refused = (label, r, ...words) => check(`${label} → 拒否`, !r.ok && words.every((w) => r.out.includes(w)), r.out);
  const accepted = (label, r, ...words) => check(`${label} → 反映`, r.ok && words.every((w) => r.out.includes(w)), r.out);
  const done = () => {
    console.log(bad ? `${bad} FAILED` : 'all ok');
    process.exit(bad ? 1 : 0);
  };
  return { check, refused, accepted, done };
}

export const BASE = { 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' };
export const NAMES = ['山田 太郎', '佐藤 花子', '鈴木 一郎', '高橋 次郎', '田中 三郎', '伊藤 四郎', '渡辺 五郎', '中村 六郎', '小林 七郎', '加藤 八郎', '吉田 九郎', '山本 十郎', '松本 一', '井上 二', '木村 三'];
export const SEATS = ['biz-approver', 'value-owner', 'tech-lead', 'dev-verifier', 'independent-reviewer', 'qa-gatekeeper', 'context-owner', 'ai-maintainer', 'ai-ops'];

// 第3巡(K60): 席の責任者の任免は、D-0 表1 の決定者の記名を要する。初期化の直後(全席が未記入)の初回の記入は、
// この変化点で「体制と運用形態」の決定者(事業決裁者)の席に記入する人の記名と理由で、1回の変化点として受け付ける
export const APPOINTER = { id: 'org', name: '組織 任命者', external: true, appointer: true };
/** 名簿と全席を、事業決裁者の席に記入する人の記名で1回の変化点として記入する */
export function fill(W, people, seats, { date = TODAY, summary = '体制を記入', signer = null, extra = {} } = {}) {
  const ref = seats['biz-approver']?.accountable;
  const who = signer ?? people.find((p) => p.id === ref || p.name === ref)?.name ?? ref;
  return W.change({ kind: 'accountable', date, summary, people, seats, decidedBy: who, reason: '初期の体制を記入する', ...extra });
}
// 第3巡(K55): 変更種別の登録の根拠
export const BASIS = { detection: { rejectionRate: 'docs/metrics/q3.md(差し戻しの件数から算出)', duplicationRate: 'docs/metrics/q3.md(類似の検知の出力から算出)', reworkRate: 'docs/metrics/q3.md(14日以内の書き換えの行数から算出)' }, rollback: 'docs/rollback/2026-09.md(文言の取り消しを3回実行)', tests: 'tests/i18n/*.spec.ts が全キーの表示を確かめる' };
// 第3巡(K65): 発効日は未来を受け付けず、最後の記録より前も受け付けない。初期化の記録は実行日になるため、
// 場面の発効日は実行日(手元の時刻帯)にそろえる
export const TODAY = (() => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();
