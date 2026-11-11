// #378: #288 第3巡の採用者のリポジトリ(東海精機工業 情報システム部の設備点検スケジューラ)を作り、元の連鎖の段を流す補助。
//
// 元は research/319-deliberation/legacy-suite/fix288-r3/ の setup.mjs(clone・init・seats)と trial.mjs(a〜g)で、
// 1 つの作業ツリー adopter/ を段ごとに書き換え、scen.mjs → scen2.mjs → scen3.mjs が前の段の状態を引き継いだ。
// setup.mjs の「docs」の段(採用者の製品のコード・テスト・受入基準・D-0・層1 を置く)は退避物に無く、再現できなかった。
// 作り直しの形は research/378-deliberation/decision.md の裁定による:
//   - R-1 各スクリプトは単独で流す。採用者のリポジトリと a〜g を作り直し、元の連鎖で前の段が状態を変えた手順
//     (scenSteps・verifySteps)を、判定なしで再生してから場面へ入る。再生の手順は、場面を判定するスクリプトと同じ関数である
//   - R-2 製品のコードは fixtures/adopter-r3/ の固定の本文を写す。欠陥注入は INJECTIONS の1か所から当て、
//     差分が注入の記録の4行だけであることと、node --test が main で通り注入の分岐で落ちることを [前提] で確かめる
//   - R-4 作り直した入力の出所(下の INPUT_ORIGIN)。期待の文から逆算・推定した入力には、外したときの対照の場面を置く
//   - R-5 段の確認は [前提](kind: precondition)の場面にする。落ちたらスクリプトを止める(前提の崩れた状態の上で判定しない)
// 時計は宣言した時刻から子プロセスごとに 1 秒進む論理の時計(lib/clock.mjs)なので、作り直した状態は毎回同じになる。
import fs from 'node:fs';
import path from 'node:path';
import { check, done, fixes, ghRun, POLICY, CYCLE, gateRecord } from './lib288.mjs';
import { workspace, fill, clRecord, rosterAccount, reasons, TODAY, HERE, FIXTURES } from './lib.mjs';

export { check, done, fixes, ghRun, TODAY, HERE };

/**
 * 作り直した入力の出所(裁定 R-4)。
 *   元: 元のスクリプトの置き換えの文字列・入力に字面がある
 *   規定: いまの規定・様式が要求する(元の当時は無かった)
 *   逆算: 元の場面の期待の文から入力を逆に決めた、または推定した。外したときの対照の場面を置く
 */
export const INPUT_ORIGIN = {
  product: '元(trial.mjs d の置き換えの文字列と注入の記録・見つける者の記録の行番号。scen j の tests/README.md。trial e の AC-1〜AC-3)',
  successorQa: '元(scen3.mjs C の置き換えの文字列「| 出荷判定者 | 品質保証部 課長 | 全部 | 確認済み | 2026-09-26 |」)',
  successorOthers: '逆算(元に字面が無い。名簿の人を置いた。scen j の後継不在の書式が出荷判定者だけを挙げる形になる)',
  table7: '元(scen.mjs q の置き換えの文字列)。列「復旧の目安」の値「1 週」は様式の列が足された後に選んだ値',
  trainer: '逆算(scen j の期待の文「品質保証部 課長(QA の候補)」)。対照: 名簿の氏名を書けば外部向けで伏せる',
  performer: '逆算(scen i の「AI の層は測定値のまま」と scen q の転記の案内は、AI の担い手を置いた席にだけ出る。元の setup.mjs の席は担い手を置いていない)。対照: 担い手を置かない採用者',
  riskFloor: '逆算(scen3 A の「11 / 11」。場面集 #6 と「規則が無ければ止まらなかった」の分岐は、#288 の最初のテンプレートのコミット bcaf3da に既にある。規則のパスと下限の値は推定)。対照: 規則の無い採用者',
  criteriaEnv: '規定(合否の基準の行「実環境の統制の確認」。ADR-0057 補足 S38、#315)',
  d0Forms: '規定(D-0 表1 の市場・顧客仮説の行・節16・非推奨の兼務の記録・引き継ぎ文書の列。lib288.mjs と同じ直し)',
};

/** 採用者の名簿(元の setup.mjs の PEOPLE。アカウントは名簿の照合のため識別子つきにした。#430) */
export const PEOPLE = [
  { id: 'p1', name: '開発 一郎', accounts: [rosterAccount('dev-ichiro')] },
  { id: 'p2', name: '審査 花子', accounts: [rosterAccount('shinsa-hanako')] },
  { id: 'p3', name: '品証 三郎', accounts: [rosterAccount('hinsho-saburo')] },
];
export const PERFORMER = { model: 'claude-sonnet-5-5', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
export const TRIAL = 'docs/adoption-trial';
const REPO = 'tokai-seiki/inspection-scheduler';
export const PRODUCT = path.join(FIXTURES, 'adopter-r3');

/** 欠陥注入(元の trial.mjs d)。置き換えはここから導く。行の中身は写した後に確かめる */
export const INJECTIONS = [
  { file: 'src/inspection.js', line: 6, type: '業務規則(期限 +1 日)', from: 'due.setUTCDate(due.getUTCDate() + intervalDays);', to: 'due.setUTCDate(due.getUTCDate() + intervalDays + 1);' },
  { file: 'src/inspection.js', line: 16, type: 'データ(削除日時の欠落)', from: 'return { ...record, deletedAt: now.toISOString(), deletedBy: user.id };', to: 'return { ...record, deletedBy: user.id };' },
  { file: 'src/auth/permission.js', line: 4, type: '権限(inspector が削除可)', from: "if (action === 'delete') return user.roles.includes('admin');", to: "if (action === 'delete') return user.roles.includes('admin') || user.roles.includes('inspector');" },
  { file: 'src/auth/permission.js', line: 3, type: '入力の検査(roles の型)', from: 'if (!user || !Array.isArray(user.roles)) return false;', to: 'if (!user) return false;' },
];
/** 見つける者(人)が誤検出として挙げる行(注入していない行) */
export const FALSE_POSITIVE = { file: 'src/inspection.js', line: 11, text: 'return now.getTime() > nextDue(record.lastInspectedAt, record.intervalDays).getTime();' };

/** 前提の段の確認。落ちたらスクリプトを止める(裁定 R-5) */
export const pre = (label, cond, detail = '') => {
  const ok = check(`[前提] ${label}`, cond, detail, { kind: 'precondition' });
  if (!ok) {
    console.log('前提を満たさないため、以後の場面を流さない');
    done();
  }
  return ok;
};
/** 拒否の前提: 終了コードに加えて、拒否の理由の1件に語があること(裁定 R-5) */
const preRefused = (label, r, word) => pre(label, !r.ok && reasons(r.out).some((e) => e.includes(word)), r.out);
/** 置き換え。空振りしたら [前提] の失敗として記録して止める(様式の見出しや行が変わると replace は黙って空振りする。#319) */
export const must = (ws, text, from, to, what) => {
  const hit = from instanceof RegExp ? from.test(text) : text.includes(from);
  // 当たった置き換えは場面にしない(数が多く、一覧を読みにくくする)。空振りだけを [前提] の失敗として記録して止める
  if (!hit) pre(`${ws}: 入力の置き換え(${what})`, false, `置き換える元が無い: ${String(from).slice(0, 120)}`);
  return text.replace(from, to);
};
/** 判定しない check(再生の段で使う) */
export const quiet = (label, cond) => Boolean(cond);

const copyTree = (src, dst) => {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyTree(s, d);
    } else fs.writeFileSync(d, fs.readFileSync(s, 'utf8').replace(/\r\n/g, '\n'));
  }
};

/**
 * 採用者のリポジトリを作る(元の setup.mjs の clone・init・seats と、退避物に無い docs の段)。
 * 作業用の複製は run.mjs が作る(事前点検への調整を含む)。
 *   performer: false … 開発者の席に AI の担い手を置かない(元の setup.mjs の席の入力。対照)
 *   riskFloor: false … 区分の下限の規則を置かない(対照)
 */
export function adopter(ws, { performer = true, riskFloor = true } = {}) {
  const W = workspace(ws);
  const { run, git, write, read, gen, cfg } = W;
  const DIR = W.DIR;
  const PRS = path.join(DIR, '.git', 'prs');
  fs.mkdirSync(PRS, { recursive: true });
  const env = { GITHUB_REPOSITORY: REPO, MOCK_PRS: PRS };
  const m = (text, from, to, what) => must(ws, text, from, to, what);
  const commit = (msg) => {
    git('add', '-A');
    git('commit', '-q', '-m', msg);
    return git('rev-parse', 'HEAD').out.trim();
  };
  // PR の記録(gh の代役が読む)。承認は承認した差分に束ねる(ADR-0079 の 2)
  const prJson = (num, title, hash, { author = 'dev-ichiro', reviewer = 'shinsa-hanako', risk = 'R2', confirmer = '審査 花子', instructor = '開発 一郎', summary = '挙動要約: 差分を読み、点検期限の計算と削除の権限の分岐を自分で確かめた' } = {}) =>
    fs.writeFileSync(
      path.join(PRS, `${num}.json`),
      JSON.stringify({
        number: num,
        title,
        author: { login: author },
        reviews: reviewer ? [{ author: { login: reviewer }, state: 'APPROVED', body: summary, commit: { oid: hash } }] : [],
        headRefOid: hash,
        statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }],
        body: `## 検証方法と結果\n\ng5-local が通過。node --test が通過\n\n## 作成を指示した者\n\n${instructor}\n\n## リスク区分\n\n${risk}\n${confirmer ? `\n確定した者: ${confirmer}\n` : ''}\n## トレーラ\n\nSpec: F-001\n`,
        mergeCommit: { oid: hash },
        commits: [{ oid: hash, messageHeadline: title }],
        labels: [],
      })
    );
  let prNo = 0;
  const prCommit = (msg, opts) => {
    prNo += 1;
    const h = commit(`${msg} (#${prNo})`);
    prJson(prNo, msg, h, opts);
    return h;
  };
  const rm = (rel) => fs.rmSync(path.join(DIR, rel), { force: true });

  // ---------------------------------------------------------------- init(元の setup.mjs init)
  write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'growth', 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-exist', 'q-ai-constraint': 'ai-approved-only', 'q-product-type': 'internal' });
  const init = gen('--answers', 'answers.json', '--stack', 'node', '--project-id', 'P-2026-017', '--profile-name', 'inspection-scheduler');
  rm('answers.json');
  pre(`${ws}: 初期化が通る`, init.ok, init.out);
  write('package-lock.json', '{ "name": "inspection-scheduler", "lockfileVersion": 3, "requires": true, "packages": {} }\n');
  git('switch', '-q', '-c', 'chore/process-init');
  commit('chore: プロセス構成を初期化する');
  git('switch', '-q', 'main');
  git('merge', '-q', '--squash', 'chore/process-init');
  prCommit('chore: プロセス構成を初期化する', { risk: 'R3', summary: '挙動要約: 構成の生成物を読み、ゲートと成果物の一覧を確かめた' });
  fs.copyFileSync(path.join(DIR, 'templates/00-d0-governance.md'), path.join(DIR, 'docs/D-0-governance.md'));
  write('docs/D-0-governance.md', m(read('docs/D-0-governance.md'), '| 市場・顧客仮説の検証の実施 | | | | | |', '| 市場・顧客仮説の検証の実施 | 価値責任者 | | | | 価値責任者 |', 'D-0 表1 の市場・顧客仮説の検証の行'));
  gen('--answers', 'process.config.json');

  // ---------------------------------------------------------------- 席(元の setup.mjs seats。3名)
  const seats = {
    'biz-approver': { accountable: '審査 花子' },
    'value-owner': { accountable: '開発 一郎' },
    'tech-lead': { accountable: '開発 一郎' },
    'dev-verifier': { accountable: '開発 一郎' },
    'independent-reviewer': { accountable: '審査 花子' },
    'qa-gatekeeper': { accountable: '品証 三郎' },
    'context-owner': { accountable: '開発 一郎' },
    'ai-maintainer': { accountable: '審査 花子' },
    'ai-ops': { accountable: '開発 一郎' },
  };
  const f = fill(W, PEOPLE, seats, { summary: '初期の体制を記入(開発者・独立レビュア・出荷判定者を別人)' });
  rm('change.json');
  pre(`${ws}: 席の記入が通る`, f.ok, f.out);
  if (performer) {
    // 出所 INPUT_ORIGIN.performer。AI の層を検出の層に数えるには、適合性確認の記録と附属書H H.4 の条件2〜5 の確認の記録
    // (確認 AI維持管理者、承認 当該の席の責任者)が要る(標準 3.4.2、ADR-0054 決定9。t288b.mjs 節7 と同じ)
    const q = W.change({ kind: 'performer', date: TODAY, summary: '開発者の席に AI の担い手を置く(適合性確認と条件2〜5 の確認つき)', seats: { 'dev-verifier': { performer: PERFORMER, fallback: 'human', qualification: { confirmedAt: TODAY, performedBy: '審査 花子', approvedBy: '開発 一郎', cases: 'docs/qualification/dev.md', result: '20 件中 19 件を再現', performer: PERFORMER, conditions: { checkedAt: TODAY, checkedBy: '審査 花子', approvedBy: '開発 一郎' } } } }, decidedBy: '開発 一郎', reason: '開発者の席に AI の担い手を置く' });
    rm('change.json');
    pre(`${ws}: 開発者の席に AI の担い手を置き、適合性確認と条件2〜5 の確認を記録する`, q.ok, q.out);
  }

  // ---------------------------------------------------------------- docs(退避物に無い段の作り直し)
  let d0 = read('docs/D-0-governance.md');
  d0 = m(d0, /^approver:.*$/m, 'approver: 審査 花子', 'D-0 の前付け approver');
  d0 = m(d0, /^approved_at:.*$/m, `approved_at: ${TODAY}`, 'D-0 の前付け approved_at');
  d0 = m(d0, /^approval_scope:.*$/m, 'approval_scope: all', 'D-0 の前付け approval_scope');
  d0 = m(d0, /^next_review:.*$/m, 'next_review: 2027-03-31', 'D-0 の前付け next_review');
  d0 = m(d0, /^- 品質保証の方針と受容の基準\(テンプレ11\)の版:.*$/m, '- 品質保証の方針と受容の基準(テンプレ11)の版: v1.2(記名日 2026-09-01)', 'D-0 冒頭の層1 の版');
  // 節9 の代理者(後継候補)。行の全体で照らす(行の一部の一致は、ほかの表の列の多い行に当たる)
  for (const [role, who] of [['価値責任者', '審査 花子'], ['技術判断者', '品証 三郎'], ['独立レビュア', '開発 一郎'], ['出荷判定者', '品質保証部 課長']]) d0 = m(d0, new RegExp(`^\\| ${role} \\| \\| \\| \\| \\|$`, 'm'), `| ${role} | ${who} | 全部 | 確認済み | 2026-09-26 |`, `D-0 節9 の ${role} の行`);
  for (const ev of ['重大事故', '情報漏えい', '契約変更(提供者の契約・規約・価格の変更を含む)', '規制変更(適用される法令・整合規格)']) d0 = m(d0, `| ${ev} | | | |`, `| ${ev} | 事業決裁者 | 層1 の項目4 による | 事業決裁者 |`, `D-0 節7 の ${ev} の行`);
  d0 = m(d0, '| 兼務する組 | 責任者 | 兼務を選んだ理由 | 記録日 |\n| --- | --- | --- | --- |\n| | | | |', `| 兼務する組 | 責任者 | 兼務を選んだ理由 | 記録日 |\n| --- | --- | --- | --- |\n| 価値責任者 × 技術判断者 | 開発 一郎 | 3名の体制で技術判断を兼ねる | ${TODAY} |`, 'D-0 の非推奨の兼務の記録の表');
  d0 = m(d0, /^\| 開発者\(検証者\) \| 未確認 \| \| \| \|$/m, '| 開発者(検証者) | 未確認 | | 新規の機能の追加 | 1 週 |', 'D-0 節12 の縮退の3列の行');
  d0 = clRecord(d0, { judge: '審査 花子', cls: 'CL0' });
  write('docs/D-0-governance.md', d0);
  write('docs/quality-assurance-policy.md', POLICY({ cycle: { ...CYCLE, trainer: '品質保証部 課長(QA の候補)' } }));
  let brief = read('templates/06-project-brief.md');
  brief = m(brief, '| <価値仮説を支える事実> | <実在の顧客・利用者の観測 / 二次資料 / AI の生成物> | <ヒアリングの記録、利用の記録などの所在。観測でなければ「なし」> |', '| 点検担当者 5 名への聞き取り | 実在の顧客・利用者の観測 | docs/interviews.md |', '企画書の観点3 の裏づけ');
  for (const k of ['想定する利用者・目的・利用状況・制約', 'この案件に掛かる外枠', 'AI の利用で期待する成果', 'AI を使わない場合との比較の基準値', 'AI の利用の拡大と停止の基準']) brief = m(brief, new RegExp(`^\\| ${k} \\| .*$`, 'm'), `| ${k} | 記入済み |`, `企画書の行「${k}」`);
  brief = m(brief, /^\| 保証範囲と範囲外 \| .*$/m, '| 保証範囲と範囲外 | 点検の期限の計算と記録の削除 |', '企画書の行「保証範囲と範囲外」');
  brief = m(brief, /^\| 壊してはならない品質条件 \| .*$/m, '| 壊してはならない品質条件 | 下の表による |', '企画書の行「壊してはならない品質条件」');
  brief = m(brief, /^\| QC-01 \| .*$/m, '| QC-01 | 点検の期限は法定の間隔を超えない | 業務規則 |', '企画書の行「QC-01」');
  const costRe = /^\| (AI の実行|検証|修正|教育|管理) \| ([^|]*) \| \| \| [^|]* \| \|$/gm;
  pre(`${ws}: 入力の置き換え(企画書の工数の5区分)`, (brief.match(costRe) ?? []).length === 5, brief.match(/^\| (AI の実行|検証|修正|教育|管理) .*$/gm)?.join('\n'));
  brief = brief.replace(costRe, '| $1 | $2 | 10時間 | 見積り | 見積りの方法 | 10時間 |');
  write('docs/project-brief.md', brief);
  write('docs/defect-ledger.md', '# 欠陥の台帳\n\n## 台帳\n\n| ID | 現象 | 重大度(Sev1 / Sev2 / Sev3) | 優先度 | 状態(未解決 / 解決済み) | コア機能(はい / いいえ) | 回避策(文書の所在) |\n| --- | --- | --- | --- | --- | --- | --- |\n\n既知の欠陥なし\n');
  write('docs/handover.md', m(read('templates/05-handover.md'), '| 機能 | 理解保持者 | 確認した者(本人以外) | 確認の記録と確認日 | 判断記録 | 関わる登録した変更種別 |\n| --- | --- | --- | --- | --- | --- |\n| | | | | | |', `| 機能 | 理解保持者 | 確認した者(本人以外) | 確認の記録と確認日 | 判断記録 | 関わる登録した変更種別 |\n| --- | --- | --- | --- | --- | --- |\n| 点検期限 | 開発 一郎 | 審査 花子 | H-3 理解の実証 ${TODAY} | ADR-0001 | |\n| 点検期限 | 審査 花子 | 品証 三郎 | H-3 理解の実証 ${TODAY} | ADR-0001 | |`, '引き継ぎ文書の節2 の表'));
  write('docs/debt-ledger.md', '# 技術負債台帳\n\n## 台帳\n\n| ID | 区分 | 対象 | 内容 | 受容した理由 | 顕在化の兆候 | 返却の目安 | 状態 | 記録者 | 承認した者 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n');
  write('docs/gates/g1-P-2026-017.md', gateRecord('G-1 企画承認', 'P-2026-017', '審査 花子', cfg().d0Version));
  write('evidence/license-scan.json', '{ "scanRun": true, "result": "success", "scannedAt": "2026-10-01T00:00:00Z" }\n');
  prCommit('docs: 体制・層1・企画の記録を置く', { risk: 'R3', confirmer: null, summary: '挙動要約: D-0・層1・企画書の記入を読み、空欄が無いことを確かめた' });
  if (riskFloor) {
    // 出所 INPUT_ORIGIN.riskFloor。規則の変更は製品のコードと別の PR にする
    const rf = W.change({ kind: 'settings', date: TODAY, summary: '区分の下限の規則を置く(認可のコード)', settings: { riskFloor: { rules: [{ id: 'auth', paths: ['src/auth/**'], floor: 'R1', why: '認証・認可' }] } } });
    rm('change.json');
    pre(`${ws}: 区分の下限の規則を置く`, rf.ok, rf.out);
    prCommit('chore: 区分の下限の規則を置く', { risk: 'R2' });
  }
  // 製品のコード(出所 INPUT_ORIGIN.product)。元の PR #2 に当たる。出荷の集約の範囲の始点(元の pr2)
  copyTree(PRODUCT, DIR);
  for (const x of [...INJECTIONS, FALSE_POSITIVE]) {
    const line = read(x.file).split('\n')[x.line - 1]?.trim();
    pre(`${ws}: 製品のコードの ${x.file} の ${x.line} 行が欠陥注入・見つける者の記録の前提の行である`, line === (x.from ?? x.text), line);
  }
  const t = run('node', ['--test', 'tests/inspection.test.mjs']);
  pre(`${ws}: 製品のコードのテストが通る(node --test)`, t.ok, t.out.slice(-1500));
  const product = prCommit('feat(F-001): 点検期限の計算と論理削除', { risk: 'R1' });

  const trial = (...a) => run('node', ['scripts/gate/adoption-trial.mjs', ...a], env);
  /** 出荷の集約。quiet なら代役の場面を記録しない(再生の段) */
  const agg = (label, from, { quiet: q = false } = {}) => {
    const args = ['scripts/gate/aggregate-evidence.mjs', '--from', from, '--to', 'HEAD'];
    const r = q ? run('node', args, env) : ghRun(W, label, 'node', args, env);
    const rd = (x) => (fs.existsSync(path.join(DIR, x)) ? read(x) : '');
    let ev = {};
    try {
      ev = JSON.parse(rd('evidence/evidence.json') || '{}');
    } catch {}
    return { ...r, ev, report: rd('evidence/quality-report.md'), ext: rd('evidence/assurance-disclosure.external.md') };
  };
  const records = () => (fs.existsSync(path.join(DIR, TRIAL)) ? fs.readdirSync(path.join(DIR, TRIAL)).filter((x) => /^record-.*\.md$/.test(x)).sort() : []);
  /** 一時のファイル(リポジトリの外。元は fix288-r3/ の直下) */
  const outside = (name) => path.join(HERE, 'w', `${ws}-${name}`);
  return { ws, W, DIR, PRS, env, product, commit, prCommit, prJson, trial, agg, records, outside, m, lastPr: () => prNo };
}

/** 合否の基準(元の trial.mjs b)を書いてコミットする */
export function writeCriteria(A) {
  const { W, trial, commit, ws } = A;
  const { write, read } = W;
  let r = trial('init');
  pre(`${ws}: b init が様式を写す`, r.ok, r.out);
  let c = read(`${TRIAL}/criteria.md`);
  const row = (t, key, val) => A.m(t, new RegExp(`^(\\| ${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^|]*\\| )[^|]*\\|`, 'm'), `$1${val} |`, `合否の基準の行「${key}」`);
  c = row(c, '適用候補', '設備点検スケジューラ(P-2026-017)/ 情報システム部 開発課');
  // 記入日時はコミットより前(宣言の時刻 12:00 の前)。元は起動時の時刻
  c = row(c, '記入日時', `${TODAY} 09:00`);
  c = row(c, '記入者', '山本 健一(情報システム部長)。起案 品証 三郎(品質保証部)');
  c = row(c, '欠陥注入: 人の層の検出率の下限', '70%(注入 4 件以上。類型は業務規則・権限・データを含む)');
  c = row(c, '欠陥注入: AI の層の扱い', '検出の層に数えない(参考値として記録する)');
  c = row(c, '場面集: 止まるべき11場面のうち止まる数', '11');
  c = row(c, '類型E: 人へ戻したときに処理できる量の下限', '1週 3件(AI を止めた 1 週間で、R2 以下の変更を 3 件マージ)');
  c = row(c, '類型F: 別の提供者での差分の許容の範囲', '基準集合 12 件のうち、失敗の増加が 2 件以内。指示資産の書き直しが 3 ファイル以内');
  // 出所 INPUT_ORIGIN.criteriaEnv
  c = row(c, '実環境の統制の確認', '9 項目とも確認済みか対象外(この検証では env-check を実行しない。記録に「未確認」が残る)');
  write(`${TRIAL}/criteria.md`, c);
  r = trial('run');
  preRefused(`${ws}: b 未コミットの基準で run は実行しない`, r, 'コミットされていない');
  commit('docs(adoption-trial): 合否の基準を記入(山本 部長)');
}

/**
 * 元の trial.mjs の a〜g(導入前の検証を採用者として実行する)。元に判定は無い。段の結果は [前提] で確かめる
 */
export function trialSteps(A) {
  const { ws, W, trial, commit, records, outside, DIR } = A;
  const { run, git, write, read } = W;

  // a. 基準を書かずに実行
  run('node', ['scripts/gate/next.mjs'], A.env);
  let r = trial('run');
  preRefused(`${ws}: a 基準なしの run は実行しない`, r, 'criteria.md がありません');

  // b. init → 採用者が基準を書く → コミット → 書き換えの検出
  writeCriteria(A);
  write(`${TRIAL}/criteria.md`, A.m(read(`${TRIAL}/criteria.md`), '70%(注入', '50%(注入', '合否の基準の人の層の下限'));
  r = trial('run');
  preRefused(`${ws}: b コミット後に書き換えた基準で run は実行しない`, r, 'コミットの後の変更');
  git('checkout', '-q', '--', `${TRIAL}/criteria.md`);

  // c. 1回目の run(欠陥注入・演習なし)
  r = trial('run', '--keep');
  pre(`${ws}: c 1回目の run が通る`, r.ok && records().length === 1, r.out.slice(-2000));
  commit('docs(adoption-trial): 1回目の記録');

  // d. 目隠しの欠陥注入(注入: 品証 三郎 / 見つける人: 審査 花子 / AI の層)
  git('switch', '-q', '-c', 'trial/injected');
  for (const x of INJECTIONS) write(x.file, A.m(read(x.file), x.from, x.to, `欠陥注入 ${x.file}:${x.line}`));
  const injectedHead = commit('trial: 注入した差分(見つける者が読む)');
  // 注入が効いたこと(裁定 R-2): 差分は注入の記録の行だけ、テストは注入の分岐で落ちる
  const changed = [];
  for (const file of [...new Set(INJECTIONS.map((x) => x.file))]) {
    const before = git('show', `main:${file}`).out.split('\n');
    const after = read(file).split('\n');
    for (let i = 0; i < Math.max(before.length, after.length); i++) if (before[i] !== after[i]) changed.push(`${file}:${i + 1}`);
  }
  const want = INJECTIONS.map((x) => `${x.file}:${x.line}`).sort();
  pre(`${ws}: d 注入の分岐の差分は、注入の記録の4行だけ`, JSON.stringify(changed.sort()) === JSON.stringify(want), changed.join(' '));
  const t = run('node', ['--test', 'tests/inspection.test.mjs']);
  pre(`${ws}: d 注入の分岐では製品のコードのテストが落ちる`, !t.ok, t.out.slice(-800));
  git('switch', '-q', 'main');
  const manifestOut = outside('injection-manifest.json');
  const manifest = { injector: '品証 三郎', branch: 'trial/injected', commit: injectedHead, injections: INJECTIONS.map(({ file, line, type }) => ({ file, line, type })) };
  write('injection-manifest.json', manifest);
  r = trial('seal', '--manifest', path.join(DIR, 'injection-manifest.json'));
  preRefused(`${ws}: d リポジトリの中の注入の記録は封じない`, r, 'リポジトリの中');
  fs.rmSync(path.join(DIR, 'injection-manifest.json'));
  fs.writeFileSync(manifestOut, JSON.stringify(manifest, null, 2));
  r = trial('tally', '--manifest', manifestOut);
  preRefused(`${ws}: d seal の前の tally は拒否する`, r, '先に seal を実行します');
  r = trial('seal', '--manifest', manifestOut);
  pre(`${ws}: d seal が通る`, r.ok, r.out);
  commit('docs(adoption-trial): 注入を封じる(品証 三郎)');
  write(`${TRIAL}/findings-human.json`, {
    finder: '審査 花子',
    reviewedBranch: 'trial/injected',
    findings: [
      { file: 'src/inspection.js', line: 6, note: '間隔に 1 を足している。法定の間隔を超える(QC-01)' },
      { file: 'src/auth/permission.js', line: 4, note: 'inspector が削除できる(QC-02)' },
      { file: 'src/inspection.js', line: 16, note: 'deletedAt が落ちている。論理削除の印が無い(QC-03)' },
      { file: FALSE_POSITIVE.file, line: FALSE_POSITIVE.line, note: 'isOverdue が当日を超過に含めない(誤検出。仕様どおり)' },
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
  const sameFile = outside('findings-same.json');
  fs.writeFileSync(sameFile, JSON.stringify({ finder: '品証 三郎', findings: [{ file: 'src/inspection.js', line: 6 }] }));
  r = trial('tally', '--manifest', manifestOut, '--human', sameFile);
  pre(`${ws}: d 見つける者が注入した者と同じ tally は、人の層を未測定と出す`, r.ok && r.out.includes('人の層 未測定'), r.out);
  r = trial('tally', '--manifest', manifestOut);
  pre(`${ws}: d tally が通る`, r.ok, r.out);
  commit('docs(adoption-trial): 集計');

  // e. 演習の記録(類型E・F)と退出の予行、基準集合
  const pad = (n) => String(n).padStart(2, '0');
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
  // 元と同じく、基準集合を演習の記録と同じコミットで入れる(S23 では PR で入れるもの。出荷の集約は、このコミットを欠落にする)
  commit('docs(adoption-trial): 演習の記録と退出の予行');

  // f. 2回目の run(すべてそろえた状態)
  r = trial('run', '--keep');
  pre(`${ws}: f 2回目の run が通る`, r.ok && records().length === 2, r.out.slice(-2000));
  commit('docs(adoption-trial): 2回目の記録');

  // g. 実行の後に基準を緩める → 採用の証拠に数えない(検証の後に戻す)
  write(`${TRIAL}/criteria.md`, A.m(A.m(read(`${TRIAL}/criteria.md`), '70%(注入', '50%(注入', '合否の基準の人の層の下限'), /^\| 記入日時 \| .*$/m, '| 記入日時 | 2026-10-01 09:00 |', '合否の基準の記入日時'));
  commit('docs(adoption-trial): 基準を緩める(検証のため)');
  r = trial('run');
  pre(`${ws}: g 基準を緩めた後の run は採用の証拠に数えない`, r.ok && r.out.includes('採用の証拠に数えない'), r.out.slice(-1500));
  git('reset', '-q', '--hard', 'HEAD~1');
  git('clean', '-qfd', TRIAL);
  return { manifestOut, sameFile };
}

/**
 * 元の scen.mjs のうち、状態を変える節(i・q・j)。check に場面の判定を渡す(r3-scen)か、quiet を渡して判定せずに再生する
 * (r3-verify・r3-succession。裁定 R-1)。h の節は状態を残さない(作った記録を消して戻す)ため、再生しない
 */
export function scenSteps(A, T, check) {
  const { W, trial, agg, records, commit, prCommit, product } = A;
  const { read, write } = W;
  const replay = check === quiet;
  const { manifestOut, sameFile } = T;
  const SEEDED = `${TRIAL}/seeded-errors.json`;

  // ---------------------------------------------------------------- i. 注入者=見つける者の層は未測定(指摘1。補足 S16)
  fixes(['ADR-0057 決定11', '標準 5.6.2']);
  {
    // 測定の記録の置き場は docs/adoption-trial/seeded-errors.json(補足 S26・S32。evidence/ は CI に届かない)
    const moved = [{ by: 'ADR-0057 決定11', on: '2026-11-11', from: "補足 S26・S32 の前: JSON.parse(read('evidence/seeded-errors.json'))" }];
    let r = trial('tally', '--manifest', manifestOut, '--human', sameFile);
    let seeded = {};
    try {
      seeded = JSON.parse(read(SEEDED));
    } catch {}
    check('i: tally は人の層を blind:false で書き、検出数を測定値として書かない', r.ok && seeded.human?.blind === false && seeded.human.detected === undefined && Array.isArray(seeded.human.blindProblems) && seeded.human.blindProblems[0].includes('同じ') && typeof seeded.ai?.detected === 'number', JSON.stringify(seeded), { changed: moved });
    check('i: tally の出力が、人の層を未測定と言う', r.out.includes('人の層 未測定') && r.out.includes('blind:false'), r.out);
    commit('docs(adoption-trial): 集計(注入者が見つける者の記録。検証のため)');
    r = trial('run');
    const rec = read(`${TRIAL}/${records().at(-1)}`);
    // 理由の文は、見つける者を複数にした補足 S35 で「見つける者 <氏名> が注入した者と同じ」へ改まった
    check('i: 記録の節2 は人の層の検出数を「未測定」と出す', r.ok && /\| 品証 三郎 \|[^\n]*\| \*\*未測定\*\*\(目隠しを確かめられない\) \| 2 \|/.test(rec) && rec.includes('人の層: 見つける者 品証 三郎 が注入した者と同じ'), rec.split('## 2.')[1]?.slice(0, 1200), { changed: [{ by: 'ADR-0057 決定11', on: '2026-11-11', from: "補足 S35 の前: rec.includes('人の層: 見つける者が注入した者と同じ')" }] });
    check('i: 記録の節6 の人の層は「測定なし」(基準と比べない)', /\| 欠陥注入: 人の層の検出率の下限 \|[^\n]*\| 測定なし[^|]*\| 人が照合する \|/.test(rec), rec.split('## 6.')[1]?.slice(0, 1200));
    commit('docs(adoption-trial): 記録(検証のため)');
    const g = agg('i: 出荷の集約', product, { quiet: replay });
    const human = g.ev.assurance?.detection?.human;
    check('i: 出荷の集約の項目6 は人の層を未測定(目隠しを確かめられない)として扱い、理由を出す', typeof human === 'string' && human.startsWith('未測定(目隠しを確かめられない') && human.includes('同じ') && g.report.includes('- 人の層(欠陥注入): 未測定(目隠しを確かめられない'), `${JSON.stringify(human)}\n${g.report.match(/- 人の層.*$/m)?.[0]}\n${g.out.slice(-1500)}`);
    fixes(['ADR-0057 決定11', '標準 5.6.2', '標準 G-7']);
    const performerInput = [{ by: 'ADR-0054 決定9', on: '2026-11-11', what: '開発者の席の AI の担い手・適合性確認・附属書H H.4 の条件2〜5 の確認の記録を足した(lib-r3.mjs INPUT_ORIGIN.performer)', without: '落ちる。AI の層が「未測定(AI の担い手の宣言なし)」(r3-scen の対照 n で固定)' }];
    check('i: AI の層は測定値のまま(率と件数)', g.report.includes('- AI の層(欠陥注入): 検出率 50%(検出 2 件 / 注入 4 件。測定時点 '), g.report.match(/- AI の層.*$/m)?.[0], { inputs: performerInput });
    fixes(['ADR-0057 決定11', '標準 5.6.2']);
    check('i: 組織の外へ渡す形の人の層は measuring:false', g.ev.assurance?.detectionExternal?.human?.measuring === false, JSON.stringify(g.ev.assurance?.detectionExternal));
    r = trial('tally', '--manifest', manifestOut);
    let back = {};
    try {
      back = JSON.parse(read(SEEDED));
    } catch {}
    check('i: 本来の tally(別の人)は測定値を書く', r.ok && back.human?.detected === 3, r.out, { changed: moved });
    commit('docs(adoption-trial): 集計(戻す)');
    if (replay) pre(`${A.ws}: 再生 i 同一人物の集計と記録の後に、本来の集計へ戻した`, r.ok && back.human?.detected === 3, r.out);
  }

  // ---------------------------------------------------------------- q. 類型E の記録の日付を過去にすると数え、D-0 表7 への転記を案内する(指摘5。補足 S20)
  fixes(['ADR-0057 決定12', '標準 3.12.5']);
  {
    // q1 は、類型E の実施日 2026-10-09 が宣言の時刻(2026-10-07)より後であることに依る
    pre(`${A.ws}: q 類型E の実施日(2026-10-09)が今日(${TODAY})より後`, TODAY < '2026-10-09', TODAY);
    const performerInput = [{ by: 'ADR-0054 決定9', on: '2026-11-11', what: '開発者の席の AI の担い手を足した(lib-r3.mjs INPUT_ORIGIN.performer)', without: '落ちる。転記の案内は AI の担い手を置いた席にだけ出る(r3-scen の対照 n で固定)' }];
    const d = JSON.parse(read(`${TRIAL}/drills.json`));
    const prev = read(`${TRIAL}/${records().at(-1)}`);
    check('q: 実施日が未来の類型E は数えない(前の記録)', prev.includes('今日(') && prev.includes('より後。行っていない演習は数えない'), prev.split('## 4.')[1]?.slice(0, 1200));
    d.drills[0].at = '2026-10-05';
    write(`${TRIAL}/drills.json`, d);
    commit('docs(adoption-trial): 演習の実施日を直す');
    const r = trial('run');
    const rec = read(`${TRIAL}/${records().at(-1)}`);
    check('q: 類型E を数え、判定の行に結果が出る', r.ok && /\| 類型E: [^\n]*\| 2026-10-05 1週 4件\(R2 以下の変更のマージ\) \| 人が照合する \|/.test(rec), rec.match(/\| 類型E.*$/m)?.[0]);
    check('q: 節4 に D-0 表7 の行「開発者(検証者)」へ転記する値と実測の日を案内する', rec.includes('表7 の行「開発者(検証者)」の「人へ戻したときに処理できる量」に「実測 1週 4件(R2 以下の変更のマージ)(2026-10-05 の類型E の演習)」、「実測の日」に 2026-10-05 と書く'), rec.split('## 4.')[1]?.slice(0, 1200), { inputs: performerInput });
    check('q: コマンドの出力にも転記の案内が出る', r.out.includes('D-0 表7 の行「開発者(検証者)」へ転記する'), r.out, { inputs: performerInput });
    commit('docs(adoption-trial): 記録(演習を数えた)');
    write('docs/D-0-governance.md', A.m(read('docs/D-0-governance.md'), '| 開発者(検証者) | 未確認 | | 新規の機能の追加 | 1 週 |', '| 開発者(検証者) | 実測 1週 4件(2026-10-05 の類型E の演習) | 2026-10-05 | 新規の機能の追加 | 1 週 |', 'D-0 表7 の転記'));
    commit('docs(D-0): 表7 の実測を転記する');
    const r2 = trial('run');
    const rec2 = read(`${TRIAL}/${records().at(-1)}`);
    check('q: 転記の後は「実測あり。転記は不要」と出る', r2.ok && rec2.includes('「開発者(検証者)」(扱い 人へ戻す): 実測あり(実測 1週 4件(2026-10-05 の類型E の演習))。転記は不要'), rec2.split('## 4.')[1]?.slice(0, 1200), { inputs: performerInput });
    commit('docs(adoption-trial): 記録(転記の後)');
    if (replay) pre(`${A.ws}: 再生 q 類型E を数え、D-0 表7 が実測あり`, rec2.includes('転記は不要'), rec2.split('## 4.')[1]?.slice(0, 800));
  }

  // ---------------------------------------------------------------- j. 出荷の集約(指摘8・2・6・10・9)
  fixes(['ADR-0057 決定11', '標準 G-7']);
  {
    write('src/inspection.js', read('src/inspection.js') + '\nexport const SCHEMA_VERSION = 2;\n');
    prCommit('feat(F-001): スキーマの版を公開する', { risk: 'R2', confirmer: '審査 花子' });
    const d0v = JSON.parse(read('process.config.json')).d0Version;
    write('docs/gates/g6-pr-next.md', `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-6 独立レビュー |\n| 対象 | PR #${A.lastPr()} |\n| 判定者 | 審査 花子 |\n| 判定日時 | 2026-10-07 10:00 |\n| 結果 | 通過 |\n| 確定の形態 | 人確定 |\n| 参照した D-0 の版 | ${d0v} |\n| 変更のリスク区分 | R2 |\n| リスク区分を確定した者 | 審査 花子 |\n| 期限内か | はい |\n\n## 挙動要約\n\n差分を読み、定数の公開だけであることを確かめた。\n`);
    commit('docs(gates): G-6 の判定記録');
    if (replay) {
      // 元の連鎖では、この後の集約が evidence/ を書いた状態で scen2 が流れた。evidence/ は無視の対象(コミットされない)で、
      // scen2・scen3 の判定の式は読まない(独立の突合 F-11)。再生では集約を流さない
      pre(`${A.ws}: 再生 j 製品の PR と G-6 の判定記録がコミットされた`, A.W.git('status', '--porcelain').out.trim() === '' && fs.existsSync(path.join(A.DIR, 'docs/gates/g6-pr-next.md')) && fs.existsSync(path.join(A.PRS, `${A.lastPr()}.json`)), A.W.git('log', '--oneline', '-3').out);
      return;
    }
    const g = agg('j: 出荷の集約', product);
    const gaps = g.ev.gaps ?? [];
    // 導入前の検証の記録だけのコミット(製品の PR の後で、docs/adoption-trial/ だけを変えたもの)の識別子が、欠落の文に現れないこと
    const trialOnly = A.W.git('log', '--format=%H', `${product}..HEAD`).out.trim().split('\n').filter(Boolean).filter((h) => {
      const files = A.W.git('show', '--name-only', '--format=', h).out.trim().split('\n').filter(Boolean);
      return files.length && files.every((f) => f.startsWith(`${TRIAL}/`));
    });
    const trialGaps = gaps.filter((x) => trialOnly.some((h) => x.includes(h.slice(0, 7))));
    // 元の式は欠落の文の語で照らした。語の照合は、欠落の文に path が出る書き方に依る(council-02 欠陥7。裁定 R-7)。
    // いまの式は、元の式に加えて、記録だけのコミットの識別子でも照らし、そのコミットが 8 件以上あることを確かめる(元より強い)
    const j1Changed = [{ by: 'ADR-0057 決定11', on: '2026-11-12', from: "g.ev.gaps.filter((x) => /adoption-trial/.test(x)).length === 0(欠落の文の語で照らす)" }];
    check('j: 導入前の検証の記録のコミットは、出荷の集約で欠落にならない(記録だけのコミット)', g.ev.gaps !== undefined && trialOnly.length >= 8 && trialGaps.length === 0 && !gaps.some((x) => /adoption-trial/.test(x)), `記録だけのコミット ${trialOnly.length} 件\n${trialGaps.join('\n') || g.out.slice(-1500)}`, { changed: j1Changed });
    const ro = g.report.match(/記録だけのコミット (\d+) 件/);
    // 元の名前は「j: 記録だけのコミットの件数が出る(${ro?.[1]} 件)」。件数は観測に残す
    check('j: 記録だけのコミットの件数が出る', ro && Number(ro[1]) >= 8, g.report.match(/PR を経ていないコミット.*$/m)?.[0], { observed: ro?.[1] });
    check('j: 記録の置き場に docs/adoption-trial/** が入る', g.report.includes('docs/adoption-trial/**'), g.report.match(/記録の置き場.*$/m)?.[0]);
    console.log(`       (j: 出荷の集約の欠落 ${gaps.length} 件: ${gaps.map((x) => x.slice(0, 60)).join(' / ')})`);
    fixes(['ADR-0057 決定11', '標準 G-7', '標準 5.6.2']);
    const h6 = g.report.match(/- 人の層\(欠陥注入\): .*$/m)?.[0] ?? '';
    check('j: 項目6 の人の層は率と件数(生の JSON を印字しない)', h6.includes('検出率 75%(検出 3 件 / 注入 4 件。測定時点 2026-10-07') && !h6.includes('{"seeded"') && h6.includes('見逃した類型 入力の検査'), h6);
    fixes(['ADR-0057 決定11', '標準 G-7']);
    const src = g.report.match(/- リスク区分の出所: .*$/m)?.[0] ?? '';
    check('j: 区分の出所は PR 本文の確定者も数え、「記名は無い」と「確定者あり」が同時に出ない', src.includes('PR 本文の「確定した者」の記名') && !src.includes('記名は無い') && g.ev.assurance?.changes?.riskConfirmation?.confirmed >= 1, src);
    fixes(['ADR-0057 決定12', '標準 3.12.3']);
    const baseInput = [{ by: 'ADR-0054 決定9', on: '2026-11-11', what: '開発者の席の AI の担い手を足した(lib-r3.mjs INPUT_ORIGIN.performer)', without: '落ちる。依存先「評価用の基準集合」は AI の担い手を置いた構成にだけ出る(r3-scen の対照 n で固定)' }];
    const bs = g.ev.assurance?.continuity?.dependencies?.find((x) => x.kind === '評価用の基準集合');
    check('j: 基準集合の範囲の承認は、起案と承認が同一人物なら承認に数えず、その旨を出す', bs && bs.scopeApproved === false && bs.scopeWhy.some((w) => w.includes('同一人物') && w.includes('要求事項10')), JSON.stringify(bs), { inputs: baseInput });
    check('j: 品質レポートに理由が出る', g.report.includes('範囲の承認(AI運用担当者の起案・技術判断者の記名): **なし**(起案した者と承認した者が同一人物'), g.report.match(/評価用の基準集合.*$/m)?.[0], { inputs: baseInput });
    fixes(['ADR-0057 決定12', '標準 3.4.3', '標準 G-7']);
    check('j: 外部向け: 役割名「品質保証部 課長」を氏名として伏せない', g.ext.includes('品質保証部 課長(QA の候補)'), g.ext.match(/育成の担当.*$/m)?.[0]);
    check('j: 外部向け: 名簿の氏名は伏せる', g.ext && !/開発 一郎|審査 花子|品証 三郎|山本 健一/.test(g.ext), g.ext.match(/.*(開発 一郎|審査 花子|品証 三郎|山本 健一).*$/m)?.[0]);
    const succ = g.ext.match(/後継不在の席: .*$/m)?.[0] ?? '';
    check('j: 外部向け: 「候補 0 名 < 最低数 1 名(数えなかった候補あり。氏名は出さない)」の書式', succ.includes('候補 0 名 < 最低数 1 名(数えなかった候補あり。氏名は出さない))。'), succ);
    fixes(['ADR-0057 決定11', '標準 G-7']);
    check('j: 外部向け: 項目6 は値を出さない', g.ext && !g.ext.includes('検出率 75%') && g.ext.includes('測定している事実'), g.ext.match(/.*欠陥注入.*$/gm)?.join('\n'));
    const r = A.W.run('node', ['-e', "import('./scripts/gate/verification-trace.mjs').then(m => console.log(JSON.stringify(m.testFiles())))"]);
    let files = [];
    try {
      files = JSON.parse(r.out.trim().split('\n').at(-1));
    } catch {}
    check('j: tests/README.md はテストのファイルに数えない', !files.some((x) => /README\.md$/.test(x)) && files.some((x) => /\.test\.(m?js|ts)$/.test(x)), JSON.stringify(files) + r.out.slice(-400));
  }
}

/**
 * 元の scen2.mjs のうち、状態を変える段(記録の生成と人が書く欄の記入のコミット)と、その上の判定。
 * check に quiet を渡すと判定せずに再生する(r3-succession。裁定 R-1)
 */
export function verifySteps(A, check) {
  const { W, trial, records, commit, DIR } = A;
  const { git, write, read } = W;
  const replay = check === quiet;
  fixes(['ADR-0057 決定11']);
  // 記録の様式の語「検証の開発ライン」「検証した構成と開発ライン」は、ADR-0066 決定3(#304)で「開発組織」へ改まった。
  // 埋める欄と値は元のまま、置き換える欄の名(入力)だけを改めた
  const wording = [{ by: 'ADR-0066 決定3', on: '2026-11-11', what: '置き換える欄の名を「下流の指標の基準値(検証を行った開発組織で測った値。…)」「検証した構成と開発組織」へ改めた', without: '元の欄の名「検証の開発ライン」「検証した構成と開発ライン」は記録に無く、置き換えが空振りする([前提] で止まる)' }];

  // 1. run → 節10 の要約値 → verify が一致(補足 S24・S25)
  let r = trial('run');
  const rec = records().at(-1);
  const file = `${TRIAL}/${rec}`;
  let text = read(file);
  check('記録の末尾に要約値の節(6 行)がある', r.ok && text.includes('## 10. 要約値') && (text.match(/\| [0-9a-f]{64} \|$/gm) ?? []).length === 6 && /\| 注入の記録\(封じた要約値\) \| ([0-9a-f]{64}|なし) \|/.test(text), text.split('## 10.')[1] ?? r.out.slice(-1500));
  check('人が書く欄の範囲が印で示される(節0 と節9)', text.includes('<!-- human-fields start cols=2 -->') && text.includes('<!-- human-fields start cols=3,4 -->') && (text.match(/^<!-- human-fields end -->$/gm) ?? []).length === 2, '');
  commit('docs(adoption-trial): 記録');
  r = trial('verify', file);
  check('verify: 出力したままの記録は一致(終了コード 0)', r.ok && r.out.includes('要約値が一致しました'), r.out);

  // 2. 人が書く欄(節0 の記入、節9 の受容者・期限)を埋める → 一致のまま
  text = read(file);
  text = A.m(text, '| 実施者(氏名と席。席に就く予定の人) | <人が書く> | 要件② |', '| 実施者(氏名と席。席に就く予定の人) | 審査 花子(独立レビュア)、品証 三郎(出荷判定者) | 要件② |', '記録の節0 の実施者');
  text = A.m(text, '| 下流の指標の基準値(検証を行った開発組織で測った値。指標の名前、値、測定の期間、出所) | <人が書く> | Q10 |', '| 下流の指標の基準値(検証を行った開発組織で測った値。指標の名前、値、測定の期間、出所) | 出荷後30日の不具合 0.8 件/月(2026-04〜09。障害管理台帳) | Q10 |', '記録の節0 の下流の指標の基準値');
  text = A.m(text, '| 検証した構成と開発組織 | <人が書く> | <YYYY-MM-DD> |', '| 検証した構成と開発組織 | 山本 健一(情報システム部長) | 2027-03-31 |', '記録の節9 の受容者・期限');
  write(file, text);
  r = trial('verify', file);
  check('verify: 人が書く欄を埋めても一致', r.ok && r.out.includes('要約値が一致しました'), r.out, { inputs: wording });
  commit('docs(adoption-trial): 実施者・基準値・受容者を記入');
  if (replay) {
    pre(`${A.ws}: 再生 scen2 の記録と人が書く欄の記入がコミットされ、verify が一致`, r.ok, r.out);
    return;
  }

  // 3. 人が書く欄の外(節3 の結果)を書き換える → 不一致
  write(file, A.m(read(file), '| 止まった: 作成を指示した者だけが承認した R1 の変更を、出荷の集約が欠落にした |', '| 止まった: 自己承認の変更を欠落にした(書き換え) |', '記録の節3 の結果'));
  r = trial('verify', file);
  check('verify: 節3 の結果を書き換えると本文の要約値が不一致(終了コード 1)', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致') && r.out.includes('記録として数えません'), r.out);
  git('checkout', '-q', '--', file);

  // 4. 節9 の残余リスクの文(人が書く欄でない列)を書き換える → 不一致
  write(file, A.m(read(file), '| 結果の効果(欠陥の流出が減るか)は未実証 | 検証した構成と開発組織 |', '| 結果の効果は実証済み | 検証した構成と開発組織 |', '記録の節9 の残余リスクの文'));
  r = trial('verify', file);
  check('verify: 節9 の受容者・期限以外の列を書き換えると不一致', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致'), r.out, { inputs: wording });
  git('checkout', '-q', '--', file);

  // 5. 実行の記録(runs/<stamp>.json)の場面の結果を書き換える → 場面集の要約値が不一致
  const stamp = rec.match(/^record-(\d{8}-\d{6})\.md$/)[1];
  const runFile = `${TRIAL}/runs/${stamp}.json`;
  const j = JSON.parse(read(runFile));
  j.scenes[0].result = '止まらなかった';
  write(runFile, j);
  r = trial('verify', file);
  check('verify: 実行の記録の場面の結果を書き換えると不一致', !r.ok && r.out.includes('場面集の結果: 不一致'), r.out);
  git('checkout', '-q', '--', runFile);

  // 6. 要約値の行そのもの(合否の基準)を書き換える → コミットから読み直した値と不一致
  write(file, A.m(read(file), /(\| 合否の基準\(コミット [0-9a-f]+ の docs\/adoption-trial\/criteria\.md\) \| )[0-9a-f]{64}/, '$1' + 'f'.repeat(64), '記録の節10 の合否の基準の要約値'));
  r = trial('verify', file);
  check('verify: 合否の基準の要約値の行を書き換えると、コミットから読み直した値と不一致', !r.ok && /合否の基準\(コミット [0-9a-f]+ の docs\/adoption-trial\/criteria\.md\): 不一致/.test(r.out), r.out);
  git('checkout', '-q', '--', file);

  // 7. 構成が後で変わっても、本文は一致し、構成は「現在の状態と違う」の警告(失敗にしない)。検証の後に戻す
  r = W.change({ kind: 'settings', summary: '検証のため上限を変える(検証後に戻す)', settings: { task: { maxChangedLines: 300 } }, decidedBy: '審査 花子', reason: '検証' });
  fs.rmSync(path.join(DIR, 'change.json'), { force: true });
  check('(前提)構成の変更が通る', r.ok, r.out);
  r = trial('verify', file);
  check('verify: 構成が後で変わっても失敗にせず、現在の状態と違うと警告する', r.ok && r.out.includes('構成: 現在の状態と違う'), r.out);
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd');

  // 8. 要約値の無い古い記録 → verify は「要約値の節が無い」と出して失敗
  write(`${TRIAL}/record-20260101-000000.md`, '# 導入前の検証の記録: 旧い様式\n\n## 1. 合否の基準\n');
  r = trial('verify', `${TRIAL}/record-20260101-000000.md`);
  check('verify: 要約値の無い記録は、その旨を出して失敗', !r.ok && r.out.includes('要約値の節'), r.out);
  fs.rmSync(path.join(DIR, `${TRIAL}/record-20260101-000000.md`));
}
