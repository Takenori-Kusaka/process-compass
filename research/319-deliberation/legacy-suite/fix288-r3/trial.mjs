// 導入前の検証を採用者として実行する(init → 基準 → seal/tally → run)。出力は out/ へ。
//   node trial.mjs <step>   step: a | b | c | d | e | f | g | all
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'adopter');
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });
const step = process.argv[2] ?? 'all';
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const HHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
const log = (s) => console.log(s);
const run = (cmd, args, { env = {}, save = null } = {}) => {
  const r = spawnSync(cmd, args, { cwd: DIR, encoding: 'utf8', env: { ...process.env, GITHUB_BASE_REF: '', PATH: `${path.resolve(HERE, '../fix288-tpl2/fakebin')}:${process.env.PATH}`, ...env }, maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (save) fs.writeFileSync(path.join(OUT, save), `$ ${cmd} ${args.join(' ')}\nexit ${r.status}\n\n${out}`);
  log(`$ ${cmd} ${args.join(' ')} -> exit ${r.status}${save ? ` (out/${save})` : ''}`);
  return { ok: r.status === 0, out, code: r.status };
};
const git = (...a) => run('git', a);
const trial = (save, ...a) => run('node', ['scripts/gate/adoption-trial.mjs', ...a], { save });
const write = (rel, t) => {
  fs.mkdirSync(path.dirname(path.join(DIR, rel)), { recursive: true });
  fs.writeFileSync(path.join(DIR, rel), typeof t === 'string' ? t : JSON.stringify(t, null, 2) + '\n');
};
const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
const commit = (msg) => {
  git('add', '-A');
  git('commit', '-q', '-m', msg);
  return git('rev-parse', 'HEAD').out.trim();
};
const TRIAL = 'docs/adoption-trial';
const records = () => (fs.existsSync(path.join(DIR, TRIAL)) ? fs.readdirSync(path.join(DIR, TRIAL)).filter((f) => /^record-.*\.md$/.test(f)).sort() : []);
const show = (label, text) => {
  log(`---- ${label}`);
  log(text.split('\n').slice(0, 80).join('\n'));
};

// ---------------------------------------------------------------- a. 基準を書かずに実行、next.mjs の案内
if (step === 'a' || step === 'all') {
  run('node', ['scripts/gate/next.mjs'], { save: 'a-next-before.out' });
  const r = trial('a-run-without-criteria.out', 'run');
  show('基準なしの run', r.out);
}

// ---------------------------------------------------------------- b. init → 採用者が基準を書く → コミット → 書き換えの検出
if (step === 'b' || step === 'all') {
  trial('b-init.out', 'init');
  let c = read(`${TRIAL}/criteria.md`);
  const row = (t, key, val) => t.replace(new RegExp(`^(\\| ${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^|]*\\| )[^|]*\\|`, 'm'), `$1${val} |`);
  c = row(c, '適用候補', '設備点検スケジューラ(P-2026-017)/ 情報システム部 開発課');
  c = row(c, '記入日時', `${TODAY} ${HHMM}`);
  c = row(c, '記入者', '山本 健一(情報システム部長)。起案 品証 三郎(品質保証部)');
  c = row(c, '欠陥注入: 人の層の検出率の下限', '70%(注入 4 件以上。類型は業務規則・権限・データを含む)');
  c = row(c, '欠陥注入: AI の層の扱い', '検出の層に数えない(参考値として記録する)');
  c = row(c, '場面集: 止まるべき11場面のうち止まる数', '11');
  c = row(c, '類型E: 人へ戻したときに処理できる量の下限', '1週 3件(AI を止めた 1 週間で、R2 以下の変更を 3 件マージ)');
  c = row(c, '類型F: 別の提供者での差分の許容の範囲', '基準集合 12 件のうち、失敗の増加が 2 件以内。指示資産の書き直しが 3 ファイル以内');
  write(`${TRIAL}/criteria.md`, c);
  // 未コミットのまま run → 実行しない
  let r = trial('b-run-uncommitted.out', 'run');
  show('未コミットの基準で run', r.out);
  commit('docs(adoption-trial): 合否の基準を記入(山本 部長)');
  // コミット後に書き換え → 実行しない
  write(`${TRIAL}/criteria.md`, read(`${TRIAL}/criteria.md`).replace('70%(注入', '50%(注入'));
  r = trial('b-run-modified-after-commit.out', 'run');
  show('コミット後に書き換えた基準で run', r.out);
  git('checkout', '-q', '--', `${TRIAL}/criteria.md`);
}

// ---------------------------------------------------------------- c. 1回目の run(欠陥注入・演習なし)
if (step === 'c' || step === 'all') {
  const r = trial('c-run-1.out', 'run', '--keep');
  show('run 1', r.out);
  const rec = records().at(-1);
  if (rec) {
    fs.copyFileSync(path.join(DIR, TRIAL, rec), path.join(OUT, 'c-record-1.md'));
    log(`record -> out/c-record-1.md (${rec})`);
  }
  commit('docs(adoption-trial): 1回目の記録');
}

// ---------------------------------------------------------------- d. 目隠しの欠陥注入(注入: 品証 三郎 / 見つける人: 審査 花子 / AI の層: Claude)
if (step === 'd' || step === 'all') {
  // 注入した差分をブランチに置く(見つける者が読む対象)
  git('switch', '-q', '-c', 'trial/injected');
  let s = read('src/inspection.js');
  s = s.replace('due.setUTCDate(due.getUTCDate() + intervalDays);', 'due.setUTCDate(due.getUTCDate() + intervalDays + 1);'); // 行6 業務規則
  s = s.replace("return { ...record, deletedAt: now.toISOString(), deletedBy: user.id };", 'return { ...record, deletedBy: user.id };'); // 行16 データ(論理削除の印が落ちる)
  write('src/inspection.js', s);
  let a = read('src/auth/permission.js');
  a = a.replace("if (action === 'delete') return user.roles.includes('admin');", "if (action === 'delete') return user.roles.includes('admin') || user.roles.includes('inspector');"); // 行4 権限
  a = a.replace("if (!user || !Array.isArray(user.roles)) return false;", "if (!user) return false;"); // 行3 入力の検査
  write('src/auth/permission.js', a);
  const injectedHead = commit('trial: 注入した差分(見つける者が読む)');
  git('switch', '-q', 'main');
  const manifestOut = path.join(HERE, 'injection-manifest.json'); // リポジトリの外
  const manifest = {
    injector: '品証 三郎',
    branch: 'trial/injected',
    commit: injectedHead,
    injections: [
      { file: 'src/inspection.js', line: 6, type: '業務規則(期限 +1 日)' },
      { file: 'src/inspection.js', line: 16, type: 'データ(削除日時の欠落)' },
      { file: 'src/auth/permission.js', line: 4, type: '権限(inspector が削除可)' },
      { file: 'src/auth/permission.js', line: 3, type: '入力の検査(roles の型)' },
    ],
  };
  // (1) リポジトリの中に置いた注入の記録 → 封じない
  write('injection-manifest.json', manifest);
  let r = trial('d-seal-inside.out', 'seal', '--manifest', path.join(DIR, 'injection-manifest.json'));
  show('リポジトリの中の manifest を seal', r.out);
  fs.rmSync(path.join(DIR, 'injection-manifest.json'));
  fs.writeFileSync(manifestOut, JSON.stringify(manifest, null, 2));
  // (2) tally を seal の前に → 拒否
  r = trial('d-tally-before-seal.out', 'tally', '--manifest', manifestOut);
  show('seal の前に tally', r.out);
  // (3) seal → コミット
  r = trial('d-seal.out', 'seal', '--manifest', manifestOut);
  show('seal', r.out);
  log(read(`${TRIAL}/injection-seal.json`));
  commit('docs(adoption-trial): 注入を封じる(品証 三郎)');
  // (4) 見つける者の記録(人: 審査 花子。AI: Claude)。花子は 4 件中 3 件を見つけ、1 件は誤検出
  write(`${TRIAL}/findings-human.json`, {
    finder: '審査 花子',
    reviewedBranch: 'trial/injected',
    findings: [
      { file: 'src/inspection.js', line: 6, note: '間隔に 1 を足している。法定の間隔を超える(QC-01)' },
      { file: 'src/auth/permission.js', line: 4, note: 'inspector が削除できる(QC-02)' },
      { file: 'src/inspection.js', line: 16, note: 'deletedAt が落ちている。論理削除の印が無い(QC-03)' },
      { file: 'src/inspection.js', line: 11, note: 'isOverdue が当日を超過に含めない(誤検出。仕様どおり)' },
    ],
  });
  write(`${TRIAL}/findings-ai.json`, {
    finder: 'Claude(claude-sonnet-5-5。新しいセッション、注入の記録を渡さない)',
    findings: [
      { file: 'src/inspection.js', line: 6, note: 'off-by-one' },
      { file: 'src/auth/permission.js', line: 3, note: 'roles が配列でない場合に includes で例外' },
    ],
  });
  commit('docs(adoption-trial): 見つける者の記録');
  // (5) 見つける者 = 注入した者 の記録を試す → 目隠しにならない
  const same = { finder: '品証 三郎', findings: [{ file: 'src/inspection.js', line: 6 }] };
  fs.writeFileSync(path.join(HERE, 'findings-same.json'), JSON.stringify(same));
  r = trial('d-tally-same-person.out', 'tally', '--manifest', manifestOut, '--human', path.join(HERE, 'findings-same.json'));
  show('見つける者が注入した者と同じ', r.out);
  // (6) 本番の tally
  r = trial('d-tally.out', 'tally', '--manifest', manifestOut);
  show('tally', r.out);
  log(read(`${TRIAL}/injection-result.json`));
  log(read('evidence/seeded-errors.json'));
  commit('docs(adoption-trial): 集計');
}

// ---------------------------------------------------------------- e. 演習の記録(類型E・F)と退出の予行、基準集合
if (step === 'e' || step === 'all') {
  write('docs/eval-baseline/cases.json', { cases: Array.from({ length: 12 }, (_, i) => ({ id: `B-${pad(i + 1)}`, spec: 'F-001', expect: '受入基準 AC-1〜AC-3 の既知の入出力' })) });
  write('docs/drills/e-2026-10-05.md', '# 類型E 人へ戻す演習(2026-10-05〜2026-10-09)\n\nAI の担い手を止めた 1 週間で、開発者(開発 一郎・開発 二郎)が R2 以下の変更 4 件をマージした。\n\n## 判断を担う席の AI を使わない判断\n\n- 技術判断者(開発 一郎): 期限の計算のタイムゾーンの扱いを、ADR-0001 を読まずに自分の言葉で説明し、設計の判断を 2 件行った(判定者 審査 花子 の面前)\n- 独立レビュア(審査 花子): 4 件の差分を AI の要約なしで読み、挙動要約を自分で書いた\n');
  write('docs/drills/f-2026-10-05.md', '# 類型F 別の提供者へ替える演習(2026-10-05)\n\n現行 Anthropic claude-sonnet-5-5 → 別の提供者 OpenAI gpt-5 で、評価用の基準集合 12 件を回帰評価した。\n\n- 失敗の増加: 1 件(B-07。日付の書式の指示が提供者に依存)\n- 書き直しを要した指示資産: CLAUDE.md の 1 節(2 ファイル以内)\n- 切り替えの決定者を確かめた: 契約変更は層1 の項目4(情報システム部長)、切替の実行は AI運用担当者(開発 一郎)\n');
  write(`${TRIAL}/drills.json`, {
    drills: [
      { type: 'E', at: '2026-10-09', result: '1週 4件(R2 以下の変更のマージ)', judgement: 'docs/drills/e-2026-10-05.md', record: 'docs/drills/e-2026-10-05.md' },
      { type: 'F', at: '2026-10-05', provider: 'Anthropic', alternative: 'OpenAI', result: '基準集合 12 件のうち失敗の増加 1 件。指示資産の書き直し 1 ファイル', judgement: 'docs/drills/f-2026-10-05.md', record: 'docs/drills/f-2026-10-05.md' },
    ],
  });
  write('docs/exit-rehearsal.json', {
    baselineScope: { scope: '含める: F-001 の受入基準 AC-1〜AC-3 の既知の入出力 12 件。含めない: 一覧の表示・CSV(非コア。理由: 期限と認可の正しさだけを退出の判断に使う)', draftedBy: '開発 一郎', approvedBy: '開発 一郎', at: '2026-10-04' },
    rehearsals: [{ model: 'claude-sonnet-5-5', provider: 'Anthropic', alternative: { provider: 'OpenAI', model: 'gpt-5' }, at: '2026-10-05', baseline: 'docs/eval-baseline/cases.json', diff: 'docs/drills/f-2026-10-05.md', approvedBy: '開発 一郎' }],
  });
  commit('docs(adoption-trial): 演習の記録と退出の予行');
}

// ---------------------------------------------------------------- f. 2回目の run(すべてそろえた状態)
if (step === 'f' || step === 'all') {
  const r = trial('f-run-2.out', 'run', '--keep');
  show('run 2', r.out);
  const rec = records().at(-1);
  if (rec) {
    fs.copyFileSync(path.join(DIR, TRIAL, rec), path.join(OUT, 'f-record-2.md'));
    log(`record -> out/f-record-2.md (${rec})`);
  }
  commit('docs(adoption-trial): 2回目の記録');
  // 記録を手で書き換えても検出されるか(要約値が無い)
  const t = read(`${TRIAL}/${rec}`).replace('止まった:', '止まった(改ざん):');
  write(`${TRIAL}/${rec}`, t);
  log(`記録を書き換えた後の git status: ${git('status', '--porcelain').out.trim() || '(差分なし)'}`);
  git('checkout', '-q', '--', `${TRIAL}/${rec}`);
}

// ---------------------------------------------------------------- g. 実行の後に基準を緩める → 採用の証拠に数えない
if (step === 'g' || step === 'all') {
  let c = read(`${TRIAL}/criteria.md`).replace('70%(注入', '50%(注入').replace(/^\| 記入日時 \| .*$/m, '| 記入日時 | 2026-10-01 09:00 |');
  write(`${TRIAL}/criteria.md`, c);
  commit('docs(adoption-trial): 基準を緩める(検証のため)');
  const r = trial('g-run-reworked.out', 'run');
  show('基準を緩めた後の run', r.out);
  const rec = records().at(-1);
  if (rec) fs.copyFileSync(path.join(DIR, TRIAL, rec), path.join(OUT, 'g-record-3.md'));
  git('reset', '-q', '--hard', 'HEAD~1');
  git('clean', '-qfd', TRIAL);
}
