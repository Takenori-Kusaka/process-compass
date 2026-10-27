// #286 段1: next.mjs の出力を段階ごとに確かめる(1・5・15名)。
//   sh fresh.sh st1 && sh fresh.sh st5 && sh fresh.sh st15 && node stages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, NAMES, SEATS, fill, TODAY } from './lib.mjs';

const { check, done } = checker();
const SHOW = process.argv.includes('-v');
const SIZE = { 1: 'size-1-2', 5: 'size-3-9', 15: 'size-10plus' };
const PHASE = { 1: 'poc', 5: 'mvp', 15: 'growth' };
const ASSIGN = { 1: [0, 0, 0, 0, 0, 0, 0, 0, 0], 5: [0, 1, 2, 2, 3, 4, 1, 2, 4], 15: [0, 1, 2, 3, 4, 5, 6, 7, 8] };

const rows = [];
for (const n of [1, 5, 15]) {
  const W = workspace(`st${n}`);
  const { run, git, write, read, cfg, gen } = W;
  const next = (...a) => run('node', ['scripts/gate/next.mjs', ...a]);
  const brief = () => next('--brief');
  const json = () => JSON.parse(next('--json').out);
  const all = (j) => [...j.project, ...j.features, ...j.ship];
  const first = (j) => all(j)[0];
  const record = (file, gate, target, result = '通過', at = null) => {
    const now = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    const ts = at ?? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes() + 1)}`;
    write(`docs/gates/${file}`, `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | ${gate} |\n| 対象 | ${target} |\n| 判定者 | ${NAMES[0]} |\n| 判定日時 | ${ts} |\n| 結果 | ${result} |\n| 確定の形態 | 人確定 |\n`);
  };
  // #286 段2: 出力の「読む:」の所在が実在すること
  const readOk = (j, label) => {
    for (const st of all(j).flatMap((x) => [x, x.then].filter(Boolean))) {
      for (const r of [].concat(st.read ?? [])) check(`${n}名 ${label}: 読む ${r} が実在する`, fs.existsSync(path.join(W.DIR, r)), r);
    }
  };
  const log = (label) => {
    const j = json();
    readOk(j, label);
    const s = first(j);
    const b = brief();
    rows.push(`[${n}名] ${label}: ${s ? `${s.feature ? s.feature + ' ' : ''}${s.stage} / ${s.kind}${s.command ? ' ' + s.command : ''}${s.seat ? ' / 待つ席 ' + s.seat.name + ' ' + s.seat.labels.join(',') : ''}` : '(なし)'}  [brief ${b.out.length}字]`);
    if (SHOW) console.log(b.out);
    return j;
  };
  const tag = `${n}名`;

  // 0. 構成なし
  let j = log('構成なし');
  check(`${tag} 構成なし → /process-init`, first(j).command === '/process-init');

  // 1. 初期化
  const answers = { 'q-team-size': SIZE[n], 'q-biz-phase': PHASE[n], 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' };
  if (n === 1) answers['q-external-reviewer'] = 'reviewer-no';
  write('answers.json', answers);
  const init = gen('--answers', 'answers.json', '--stack', 'node');
  check(`${tag} 初期化が通り、出力の末尾に次の一手が出る`, init.ok && init.out.includes('[ピットイン] 次の一手'), init.out);
  check(`${tag} 初期化が SessionStart のフックを保つ`, Boolean(JSON.parse(read('.claude/settings.json')).hooks?.SessionStart));
  j = log('初期化後(D-0 なし)');
  check(`${tag} D-0 なし → D-0 を作るコマンド`, first(j).stage === 'D-0 体制図なし' && first(j).kind === 'command');

  // 2. 出力のコマンドどおり D-0 を作る
  fs.copyFileSync(path.join(W.DIR, 'templates/00-d0-governance.md'), path.join(W.DIR, 'docs/D-0-governance.md'));
  const regen = gen('--answers', 'process.config.json');
  check(`${tag} 出力のコマンド(D-0 の生成区間の書き込み)が通る`, regen.ok, regen.out);
  j = log('D-0 あり・席が未記入');
  check(`${tag} 席が未記入 → 人の判断待ち(決定者・needs-owner)`, first(j).kind === 'human-wait' && first(j).seat?.labels.includes('state:needs-owner'));
  check(`${tag} 人の判断待ちに AI のコマンドが無い`, !first(j).command);

  // 3. 席を埋める(人が決めた体制)
  const people = NAMES.slice(0, n).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [`acct-${i + 1}`] }));
  const seats = Object.fromEntries(SEATS.map((s, i) => [s, { accountable: NAMES[ASSIGN[n][i]] }]));
  const f = fill(W, people, seats);
  check(`${tag} 席の記入(/process-change)が通り、次の一手が出る`, f.ok && f.out.includes('[ピットイン] 次の一手'), f.out);
  j = log('席の記入後(D-0 未承認)');
  check(`${tag} D-0 未承認 → 人の判断待ち`, first(j).stage.startsWith('D-0 体制図が未承認') && first(j).kind === 'human-wait', JSON.stringify(first(j)));
  write(
    'docs/D-0-governance.md',
    read('docs/D-0-governance.md')
      .replace(/^approver:.*$/m, `approver: ${NAMES[0]}`)
      .replace(/^approved_at:.*$/m, `approved_at: ${TODAY}`)
      .replace(/^approval_scope:.*$/m, 'approval_scope: all')
      .replace(/^next_review:.*$/m, 'next_review: 2027-03-31')
  );
  const d0 = W.checkD0();
  j = log('D-0 承認後');
  const s3 = first(j);
  if (!d0.ok) {
    check(`${tag} D-0 の検査が失敗するあいだは人の判断待ちのまま`, s3.kind === 'human-wait' && s3.stage.startsWith('D-0'), d0.out);
    rows.push(`[${n}名] (D-0 の検査: ${d0.out.split('\n').filter((l) => /error/.test(l)).slice(0, 2).join(' / ')})`);
    continue;
  }
  // 4. G-1
  const g1 = cfg().gates.g1;
  if (['required', 'simplified'].includes(g1.state)) {
    check(`${tag} 企画書なし → 企画書を作るコマンド`, s3.stage === '企画書なし' && s3.kind === 'command', JSON.stringify(s3));
    // #286 N6: 企画書なしの次に、前提の台帳を作るコマンド(段階を止めない)
    check(`${tag} 企画書なしの次に、前提の台帳を作るコマンドと artifacts/10`, j.project[1]?.stage === '前提の台帳なし' && j.project[1].read === '.claude/skills/artifact/artifacts/10-assumption-ledger.md', JSON.stringify(j.project[1]));
    fs.copyFileSync(path.join(W.DIR, 'templates/06-project-brief.md'), path.join(W.DIR, 'docs/project-brief.md'));
    j = log('企画書あり(前提の台帳なし)');
    check(`${tag} 企画書あり・台帳なし → 前提の台帳を作るコマンドが先、G-1 待ちが続く`, first(j).stage === '前提の台帳なし' && first(j).kind === 'command' && j.project[1]?.stage === '企画承認(G-1)待ち', JSON.stringify(j.project.map((x) => x.stage)));
    fs.copyFileSync(path.join(W.DIR, 'templates/10-assumption-ledger.md'), path.join(W.DIR, 'docs/assumptions.md'));
    j = log('企画書あり(G-1 待ち)');
    check(`${tag} G-1 待ち → 人の判断待ち(事業決裁者・needs-owner)`, first(j).kind === 'human-wait' && first(j).seat?.role === 'biz-approver' && first(j).seat.labels.includes('state:needs-owner'), JSON.stringify(first(j)));
    record('g1-P-001.md', 'G-1 企画承認', 'P-001');
  }
  // G-1 を持たない構成でも、前提の台帳は案内される(段階を止めない)
  if (!fs.existsSync(path.join(W.DIR, 'docs/assumptions.md'))) {
    check(`${tag} G-1 なし → 前提の台帳を作るコマンド`, all(json()).some((x) => x.stage === '前提の台帳なし'));
    fs.copyFileSync(path.join(W.DIR, 'templates/10-assumption-ledger.md'), path.join(W.DIR, 'docs/assumptions.md'));
  }
  // 5. 仕様なし
  j = log('G-1 通過後(仕様なし)');
  check(`${tag} 仕様なし → /spec-write`, first(j).command === '/spec-write', JSON.stringify(first(j)));
  fs.mkdirSync(path.join(W.DIR, 'specs/F-001'), { recursive: true });
  write('specs/F-001/spec.md', read('templates/01-feature-spec.md').replace(/^\| 1 \| イベント駆動 \|.*$/m, '| 1 | イベント駆動 | |').replace(/^\| 2 \|.*$/m, '| 2 | 望ましくない事象 | |').replace(/^\| 3 \|.*$/m, '| 3 | ユビキタス | |'));
  j = log('受入基準が空');
  check(`${tag} 受入基準が空 → /spec-write F-001`, first(j).command === '/spec-write F-001', JSON.stringify(first(j)));
  // 様式の説明の行は禁止語を並べているため、写したままでは spec-lint が検出する(既存の挙動)。説明の行を消してから確かめる
  write('specs/F-001/spec.md', read('templates/01-feature-spec.md').split(/\n/).filter((l) => !l.includes('適切に')).join(String.fromCharCode(10)));
  const lint = run('node', ['scripts/gate/spec-lint.mjs', 'specs/F-001']);
  j = log('受入基準あり');
  const s5 = first(j);
  if (!lint.ok) check(`${tag} 曖昧語あり → /spec-write`, s5.stage === '受入基準に曖昧語');
  else if (['required', 'simplified'].includes(cfg().gates.g2.state)) {
    check(`${tag} G-2 待ち → 人の判断待ち(価値責任者・needs-po)`, s5.kind === 'human-wait' && s5.seat?.labels.includes('state:needs-po'), JSON.stringify(s5));
    record('g2-F-001.md', 'G-2 要件合意', 'F-001');
    j = log('G-2 通過後(計画なし)');
  }
  check(`${tag} 計画なし → /task-breakdown F-001`, first(j).command === '/task-breakdown F-001', JSON.stringify(first(j)));
  write('specs/F-001/plan.md', read('templates/07-implementation-plan.md'));
  j = log('計画あり(G-4 待ち)');
  check(`${tag} G-4 待ち → 人の判断待ち(終端)`, first(j).kind === 'human-wait' && first(j).stage.includes('G-4'), JSON.stringify(first(j)));
  check(`${tag} G-4 待ちの「読む」が gates/G-4.md、その後が /gate G-4`, first(j).read === '.claude/skills/gate/gates/G-4.md' && first(j).after.includes('/gate G-4'), JSON.stringify(first(j)));
  check(`${tag} 全文の出力に「読む: .claude/skills/gate/gates/G-4.md」`, next().out.includes('読む: .claude/skills/gate/gates/G-4.md'));
  record('g4-F-001.md', 'G-4 機能仕様承認', 'F-001');
  W.commit('docs: 記録');
  // 6. 実装
  j = log('G-4 通過後(実装前)');
  check(`${tag} 実装前 → /implement F-001 Task-1`, first(j).command === '/implement F-001 Task-1', JSON.stringify(first(j)));
  git('switch', '-q', '-c', 'feature/F-001-task-1');
  j = log('実装中(ブランチあり)');
  check(`${tag} 実装中 → /implement を続ける`, first(j).stage === '実装中(Task-1)', JSON.stringify(first(j)));
  // 自己修正ループ
  const sh = (...a) => run('node', ['scripts/gate/self-heal.mjs', ...a]);
  check(`${tag} self-heal start`, sh('start', '--spec', 'F-001', '--task', 'Task-1').ok);
  j = log('自己修正ループ中');
  check(`${tag} ループ中 → iterate`, first(j).stage.startsWith('自己修正ループ中'), JSON.stringify(first(j)));
  for (let i = 0; i < 3; i++) sh('iterate');
  const over = sh('iterate');
  check(`${tag} 上限を超える iterate は保留(終了コード3)`, !over.ok && over.out.includes('保留'), over.out);
  j = log('自己修正が保留');
  check(`${tag} 保留 → 人の判断待ち(needs-po)`, first(j).kind === 'human-wait' && first(j).stage === '自己修正が保留' && first(j).seat.labels.includes('state:needs-po'), JSON.stringify(first(j)));
  check(`${tag} 保留中は stop で終えられない`, !sh('stop', '--reason', 'pass').ok);
  check(`${tag} release は記名を要する`, !sh('release').ok && sh('release', '--by', NAMES[0]).ok);
  // 7. 取り込み
  git('switch', '-q', 'main');
  write('src/a.js', 'export const a = 1;\n');
  W.commit('feat: task1\n\nSpec: F-001 / Task-1');
  write('src/b.js', 'export const b = 1;\n');
  W.commit('feat: task2\n\nSpec: F-001 / Task-2');
  j = log('全タスク取り込み(出荷前)');
  const fs1 = j.features.find((x) => x.feature === 'F-001');
  check(`${tag} 機能は実装済み`, fs1?.kind === 'done', JSON.stringify(fs1));
  const sp = j.ship[0];
  rows.push(`[${n}名]   出荷: ${sp ? `${sp.stage} / ${sp.kind}${sp.command ? ' ' + sp.command : ''}${sp.then ? ' → ' + sp.then.what : ''}${sp.seat ? ' / 待つ席 ' + sp.seat.name : ''}` : '(なし)'}`);
  const c = cfg();
  if (c.shipBlocked) check(`${tag} 出荷できない状態 → 人の判断待ち`, sp?.stage === '出荷できない状態');
  else if (['required', 'simplified'].includes(c.gates.g7.state)) {
    check(`${tag} 出荷前(引き継ぎ文書なし) → 引き継ぎ文書を作るコマンドと artifacts/05`, sp?.stage === '出荷前(運用引き継ぎ文書なし)' && sp.kind === 'command' && sp.read === '.claude/skills/artifact/artifacts/05-handover.md', JSON.stringify(sp));
    fs.copyFileSync(path.join(W.DIR, 'templates/05-handover.md'), path.join(W.DIR, 'docs/handover.md'));
    j = log('引き継ぎ文書あり(出荷前)');
    const sp2 = j.ship[0];
    rows.push(`[${n}名]   出荷: ${sp2.stage} / ${sp2.kind} ${sp2.command ?? ''}`);
    check(`${tag} 出荷前 → 証跡の集約 → G-7 待ち(読む gates/G-7.md)`, sp2?.command?.startsWith('node scripts/gate/aggregate-evidence.mjs') && sp2.then?.kind === 'human-wait' && sp2.read === '.claude/skills/gate/gates/G-7.md', JSON.stringify(sp2));
  }
  else check(`${tag} G-7 なし → G-8 待ち(読む gates/G-8.md)`, sp?.stage === 'リリース決裁(G-8)待ち' && sp.kind === 'human-wait' && sp.read === '.claude/skills/gate/gates/G-8.md', JSON.stringify(sp));
  const b = brief();
  check(`${tag} --brief は 1,200 字以内`, b.out.length <= 1200, String(b.out.length));
}
console.log(rows.join('\n'));
done();
