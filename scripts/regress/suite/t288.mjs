// #288: 保証の主張の成立判定・組織継続の側の状態・停止の申し立て(準拠テンプレートの実装)を場面で確かめる。
//   sh fresh.sh t3 && sh fresh.sh t1 && node t288.mjs [-v]
// @regress {"now": "2026-10-08T12:00:00Z", "workspaces": ["t3", "t1"], "fixes": ["#288"]}
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace, checker, NAMES, SEATS, fill, TODAY, BASE } from './lib.mjs';

const { check, done, ghRun, fixes } = checker();
// #319 §8 X-1: 節ごとに固定する決定(元は ADR-0057 の全体。ADR-0057 は決定を番号で分けるため、決定の番号か、採用後の補足が改めた標準の条項で引く)
fixes(['K60', 'ADR-0057 決定8']);
// gh は PATH 上の代役(lib/bin/gh)。元は --import mockgh-prs.mjs で execFileSync を差し替えていた
const FUTURE = '2099-12-31';
const PAST = '2020-01-01';

const CYCLE = { drill: '半年に1回', exit: '12か月', degradation: '12か月', competence: '12か月', min: '価値責任者: 1 / 技術判断者: 1 / 独立レビュア: 1 / QA: 1', trainer: '技術判断者の席の責任者' };
const POLICY = ({ signer = '社長 一郎', tolerance = '許容しない', conditions = ['[R1未確認] 独立した人の確認を経ていない R1 の変更', '[台帳:個人データ] 個人データの取り扱いに当たる未達'], stopRole = '事業決裁者', outRole = '事業決裁者', contRole = '事業決裁者', cycle = CYCLE, power = '有', cosign = 'なし', blankRequired = null } = {}) => `# 品質保証の方針と受容の基準

| 項目 | 値 |
| --- | --- |
| 適用範囲の組織単位 | 開発部 |
| 保証の相手 | 顧客 |
| 版 | v1.2 |
| 記名(記名者) | ${signer} |
| 記名日 | 2026-09-01 |
| 記名者の権限(ア) 単位の予算と要員の配置 | ${power} |
| 記名者の権限(イ) 単位の構成員の評価の方針 | 有 |
| 記名者の権限(ウ) 保証の相手への出荷を止める権限 | 有 |
| 連署 | ${cosign} |
| 全社の品質方針との関係 | 全社の品質マネジメントシステムなし |
| 権限の委譲の根拠 | なし |
| 改めた契機 | 導入 |
| 起案者 | 品質 保証 |

## 1. 保証の相手と範囲の方針

| 項目 | 記載 |
| --- | --- |
| 組織として品質を保証する対象 | S1 以降の顧客向け製品 |
| 組織として品質を保証しない対象 | S0 探索の案件 |
| 検出能力の未測定を許容する期間 | ${tolerance} |
| 評価の方針 | 件数を減点に使わない |

## 2. 受容しない条件

${conditions.map((c) => `- ${c}`).join('\n')}

## 3. 外枠

| 区分 | 適用されるもの |
| --- | --- |
| 法令 | 個人情報保護法 |
| 契約 | 利用規約 |
| 規格・指針 | — |

## 4. 受容の権限の段階

| 受容の対象 | 受容できる水準 | 受容者(役割) | 受容の期限 |
| --- | --- | --- | --- |
| 品質の残存リスク(保証の開示の項目5) | R2・R3 の未達 | 事業決裁者 | — |
| 品質保証の対象外として出荷すること | すべて | ${outRole} | — |
| (必須)組織継続の状態: 代替の無い依存先 | | ${contRole} | 期限つき |
| (必須)組織継続の状態: 退出を試していない依存先 | | ${contRole} | 期限つき |
| (必須)組織継続の状態: 縮退の能力を確かめていない業務 | | ${contRole} | 期限つき |
| (必須)組織継続の状態: 後継のいない判断の席、理解の保持者が1名以下のコア機能 | | ${contRole} | 期限つき |
| (必須)停止の申し立ての解除(第7章 7.11) | | ${blankRequired === 'stop' ? '' : stopRole} | — |
| (必須)AI の利用の拡大(自律レベルの引き上げ、委任の範囲の登録) | | 事業決裁者 | — |
| (必須)AI の利用の縮小・停止(組織全体) | | ${blankRequired === 'shrink' ? '' : '社長'} | — |
| (必須)有事の決定: 重大事故(停止・切替・顧客説明) | | 事業決裁者 | — |
| (必須)有事の決定: 情報漏えい(停止・切替・顧客説明) | | 事業決裁者 | — |
| (必須)有事の決定: 契約変更(停止・切替・顧客説明) | | ${blankRequired === 'contract' ? '' : '社長'} | — |
| (必須)有事の決定: 規制変更(停止・切替・顧客説明) | | 社長 | — |

### 確認の周期と後継

| 項目 | 値 | 空欄の場合の扱い |
| --- | --- | --- |
| 演習(開発避難訓練の類型E・F)の頻度 | ${cycle.drill ?? ''} | — |
| 退出の予行の間隔(第3章 3.12.3) | ${cycle.exit ?? ''} | — |
| 縮退の実測の頻度(第3章 3.12.5) | ${cycle.degradation ?? ''} | — |
| AI を使わない力量の確認の周期(第3章 3.4.3) | ${cycle.competence ?? ''} | — |
| 判断の席ごとの後継候補の最低数 | ${cycle.min ?? ''} | — |
| 育成の担当(役割) | ${cycle.trainer ?? ''} | — |

## 5. 上申先

| 上申の種類 | 届け先(役割) |
| --- | --- |
| 出荷判定者の異議を退けた受容の届け先 | 社長 |
| 停止の申し立てを退けた解除の届け先 | 社長 |
`;

const gateRecord = (gate, target, judge, d0, extra = '', result = '通過') => `# ゲート判定記録

| 項目 | 値 |
| --- | --- |
| ゲート | ${gate} |
| 対象 | ${target} |
| 判定者 | ${judge} |
| 判定日時 | ${TODAY} 10:00 |
| 結果 | ${result} |
| 確定の形態 | 人確定 |
| 参照した D-0 の版 | ${d0} |

${extra}`;

const g8Extra = ({ policyVersion = 'v1.2', escalation = '該当なし', objection = '異議なし。未達・未測定は無い', outOfScope = '該当なし' } = {}) => `## 決断の記録

| 欄 | 記載 |
| --- | --- |
| 確認した事項 | 保証の開示 |
| 確認していない事項 | 本番の負荷 |
| 判断が変わる条件 | 重大な欠陥の報告 |
| 受容したリスク | なし |
| 出荷判定者の異議(リリース決裁 G-8 の記録に限る) | ${objection} |
| 照らした層1 の版(G-8 に限る) | ${policyVersion} |
| 上申(G-8 に限る。段階を超える受容・異議を退けた受容) | ${escalation} |
| 品質保証の対象外として出荷することの受容(G-8 に限る) | ${outOfScope} |
`;

const stopRelease = ({ judge, requester = NAMES[0], declined = '退けていない(申し立てた者が取り下げた)', escalation = '該当なし', day = TODAY, reason = '異常の原因を除いた', d0 = '1.1', pr = 7 }) =>
  gateRecord('停止の申し立ての解除', `PR #${pr}`, judge, d0, `## 停止の申し立ての解除

| 欄 | 記載 |
| --- | --- |
| 申し立てた者 | ${requester} |
| 申し立ての内容 | 個人データの漏えいの恐れ |
| 解除の理由 | ${reason} |
| 申し立てた者の見解を退けたか | ${declined} |
| 上申先と日付(退けた場合) | ${escalation} |
`).replace(`${TODAY} 10:00`, `${day} 10:00`);

// ---------------------------------------------------------------- 3名の体制の準備
function setup(ws, n) {
  const W = workspace(ws);
  const { run, git, write, read, gen, commit, cfg } = W;
  const tpl = git('rev-parse', 'HEAD').out.trim();
  const answers = n === 1 ? { 'q-team-size': 'size-1-2', 'q-biz-phase': 'poc', 'q-external-reviewer': 'reviewer-no', ...BASE } : { 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', ...BASE };
  write('answers.json', answers);
  const init = gen('--answers', 'answers.json', '--stack', 'node');
  fs.rmSync(path.join(W.DIR, 'answers.json'));
  check(`${ws}: 初期化が通る`, init.ok, init.out);
  write('package-lock.json', '{ "name": "x", "lockfileVersion": 3, "requires": true, "packages": {} }\n');
  git('switch', '-q', '-c', 'chore/process-init');
  commit('chore: プロセス構成を初期化する');
  git('switch', '-q', 'main');
  git('merge', '-q', '--squash', 'chore/process-init');
  commit('chore: プロセス構成を初期化する (#1)');
  const initHash = git('rev-parse', 'HEAD').out.trim();
  fs.copyFileSync(path.join(W.DIR, 'templates/00-d0-governance.md'), path.join(W.DIR, 'docs/D-0-governance.md'));
  gen('--answers', 'process.config.json');
  // 第3巡(C): D-0 節9 の代理者は名簿の人へ対応づく氏名だけを候補に数える。代理者を名簿へ入れる
  const people = [...NAMES.slice(0, n).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [`acct-${i + 1}`] })), ...(n === 1 ? [] : [{ id: 'dep1', name: '代理 太郎', accounts: ['acct-dep1'] }, { id: 'dep2', name: '候補 花子', accounts: ['acct-dep2'] }])];
  const assign = n === 1 ? Object.fromEntries(SEATS.map((s) => [s, 0])) : { 'biz-approver': 1, 'value-owner': 0, 'tech-lead': 0, 'dev-verifier': 0, 'independent-reviewer': 1, 'qa-gatekeeper': 2, 'context-owner': 0, 'ai-maintainer': 1, 'ai-ops': 0 };
  const seats = Object.fromEntries(SEATS.map((s) => [s, { accountable: NAMES[assign[s]] }]));
  const f = fill(W, people, seats);
  check(`${ws}: 任免が通る`, f.ok, f.out);
  fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
  let d0 = read('docs/D-0-governance.md')
    .replace(/^approver:.*$/m, `approver: ${NAMES[assign['biz-approver']]}`)
    .replace(/^approved_at:.*$/m, `approved_at: ${TODAY}`)
    .replace(/^approval_scope:.*$/m, 'approval_scope: all')
    .replace(/^next_review:.*$/m, 'next_review: 2027-03-31')
    .replace(/^- 品質保証の方針と受容の基準\(テンプレ11\)の版:.*$/m, '- 品質保証の方針と受容の基準(テンプレ11)の版: v1.2(記名日 2026-09-01)');
  for (const role of ['価値責任者', '技術判断者', '独立レビュア', '出荷判定者']) d0 = d0.replace(new RegExp(`^\\| ${role} \\| \\| \\| \\| \\|$`, 'm'), n === 1 ? `| ${role} | | | なし | |` : `| ${role} | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`);
  for (const ev of ['重大事故', '情報漏えい', '契約変更(提供者の契約・規約・価格の変更を含む)', '規制変更(適用される法令・整合規格)']) d0 = d0.replace(`| ${ev} | | | |`, `| ${ev} | 事業決裁者 | 層1 の項目4 による | 事業決裁者 |`);
  // #319 7.5(入力の直し): 3〜9名の非推奨の兼務(価値責任者 × 技術判断者)は D-0 へ記録する(ADR-0082。#312)。席は分けない
  if (n > 1) d0 = d0.replace('| 兼務する組 | 責任者 | 兼務を選んだ理由 | 記録日 |\n| --- | --- | --- | --- |\n| | | | |', `| 兼務する組 | 責任者 | 兼務を選んだ理由 | 記録日 |\n| --- | --- | --- | --- |\n| 価値責任者 × 技術判断者 | ${NAMES[0]} | 3名の体制で技術判断を兼ねる | ${TODAY} |`);
  // #319: 様式の見出しが変わると replace は黙って空振りする(#311 の引き継ぎの表で起きた)。置き換えが起きたことを確かめる
  if (n > 1 && !d0.includes(`| 価値責任者 × 技術判断者 | ${NAMES[0]} |`)) throw new Error('D-0 の非推奨の兼務の記録の表の置き換えが空振りした(様式の見出しが変わった)');
  write('docs/D-0-governance.md', d0);
  write('docs/quality-assurance-policy.md', POLICY());
  write('docs/project-brief.md', read('templates/06-project-brief.md').replace(/^\| (想定する利用者・目的・利用状況・制約|この案件に掛かる外枠|AI の利用で期待する成果|AI を使わない場合との比較の基準値|AI の利用の拡大と停止の基準) \| .*$/gm, '| $1 | 記入済み |').replace(/^\| 保証範囲と範囲外 \| .*$/m, '| 保証範囲と範囲外 | 顧客向け機能の全体 |').replace(/^\| 壊してはならない品質条件 \| .*$/m, '| 壊してはならない品質条件 | 下の表による |').replace(/^\| QC-01 \| .*$/m, '| QC-01 | 権限の無い利用者は招待を取り消せない | 権限 |').replace(/^\| (AI の実行|検証|修正|教育|管理) \| ([^|]*) \| \| \| [^|]* \|$/gm, '| $1 | $2 | 10時間 | 見積り | 見積りの方法 |'));
  write('docs/defect-ledger.md', '# 欠陥の台帳\n\n## 台帳\n\n| ID | 現象 | 重大度(Sev1 / Sev2 / Sev3) | 優先度 | 状態(未解決 / 解決済み) | コア機能(はい / いいえ) | 回避策(文書の所在) |\n| --- | --- | --- | --- | --- | --- | --- |\n\n既知の欠陥なし\n');
  // #319 7.5(入力の直し): 引き継ぎ文書の節2 の表に列「関わる登録した変更種別」が足された(ADR-0081。#311)
  write('docs/handover.md', read('templates/05-handover.md').replace('| 機能 | 理解保持者 | 確認した者(本人以外) | 確認の記録と確認日 | 判断記録 | 関わる登録した変更種別 |\n| --- | --- | --- | --- | --- | --- |\n| | | | | | |', `| 機能 | 理解保持者 | 確認した者(本人以外) | 確認の記録と確認日 | 判断記録 | 関わる登録した変更種別 |\n| --- | --- | --- | --- | --- | --- |\n${(n > 1 ? [NAMES[0], NAMES[1], '代理 太郎'] : [NAMES[0]]).map((h, i, a) => `| 招待 | ${h} | ${n > 1 ? a[(i + 1) % a.length] : '外部 確認者'} | H-3 理解の実証 ${TODAY} | ADR-0001 | |`).join('\n')}`));
  if (!read('docs/handover.md').includes(`| 招待 | ${NAMES[0]} |`)) throw new Error('引き継ぎ文書の節2 の表の置き換えが空振りした(様式の見出しが変わった)');
  write('docs/debt-ledger.md', '# 技術負債台帳\n\n## 台帳\n\n| ID | 区分 | 対象 | 内容 | 受容した理由 | 顕在化の兆候 | 返却の目安 | 状態 | 記録者 | 承認した者 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n');
  write('evidence/license-scan.json', '{ "scanRun": true, "result": "success", "scannedAt": "2026-10-01T00:00:00Z" }\n');
  write('evidence/seeded-errors.json', '{ "seeded": 10, "detected": 8, "measuredAt": "2026-10-01", "method": "試験の固定値", "blind": true }\n');
  const d0v = cfg().d0Version;
  write('docs/gates/g1-P-001.md', gateRecord('G-1 企画承認', 'P-001', NAMES[assign['biz-approver']], d0v));
  // PR の記録(独立レビュアが挙動要約つきで承認。1名では承認なし)
  const prs = path.join(W.DIR, '.git', 'prs');
  fs.mkdirSync(prs, { recursive: true });
  const reviewer = n === 1 ? null : { author: { login: 'acct-2' }, state: 'APPROVED', body: '挙動要約: 変更の内容を確かめた' };
  const prJson = (num, title, hash) =>
    fs.writeFileSync(
      path.join(prs, `${num}.json`),
      JSON.stringify({
        number: num,
        title,
        author: { login: 'acct-1' },
        // #319 7.5(入力の直し): 承認を承認した差分に束ねる(ADR-0079 の 2)
        reviews: reviewer ? [{ ...reviewer, commit: { oid: hash } }] : [],
        headRefOid: hash,
        statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }],
        body: `## 検証方法と結果\n\ng5-local が通過\n\n## 作成を指示した者\n\n${NAMES[0]}\n\n## リスク区分\n\nR2\n\n## トレーラ\n\nSpec: setup\n`,
        mergeCommit: { oid: hash },
        commits: [{ oid: hash, messageHeadline: title }],
      })
    );
  prJson(1, 'chore: プロセス構成を初期化する', initHash);
  let prNo = 1;
  // 記録の置き場の外(企画書・引き継ぎ・層1 など)を変える変更は、PR のスカッシュとして入れる
  const prCommit = (msg) => {
    prNo += 1;
    git('add', '-A');
    git('commit', '-q', '-m', `${msg} (#${prNo})`);
    prJson(prNo, msg, git('rev-parse', 'HEAD').out.trim());
  };
  prCommit('docs: 体制・層1・企画・記録を置く');
  git('tag', 'base288');
  const agg = () => {
    const r = ghRun(W, '出荷の証跡の集約', 'node', ['scripts/gate/aggregate-evidence.mjs', '--from', tpl, '--to', 'HEAD'], { GITHUB_REPOSITORY: 'example/t288', MOCK_PRS: prs });
    const ev = JSON.parse(read('evidence/evidence.json'));
    return { r, ev, report: read('evidence/quality-report.md'), ext: read('evidence/assurance-disclosure.external.md') };
  };
  // evidence/ は無視の対象(コミットされない)。測定の記録は場面ごとに置き直す
  const seed = () => write('evidence/seeded-errors.json', '{ "seeded": 10, "detected": 8, "measuredAt": "2026-10-01", "method": "試験の固定値", "blind": true }\n');
  const reset = () => {
    git('reset', '-q', '--hard', 'base288');
    git('clean', '-qfd');
    seed();
  };
  return { W: { ...W, commit: prCommit }, agg, reset, d0v, assign };
}

const cond = (ev, id) => ev.assurance.claim.conditions.find((c) => c.id === id);

// ================================================================ (1) 成立条件の判定
fixes(['ADR-0057 決定8', 'ADR-0057 決定9', 'ADR-0057 決定10']);
{
  const { W, agg, reset, d0v } = setup('t3', 3);
  const { write, read, commit, git } = W;
  let { r, ev, report, ext } = agg();
  const c = ev.assurance.claim;
  check('3名: 記録の欠落が無い', ev.gaps.length === 0, ev.gaps.join('\n') || r.out);
  check('3名: 6条件をすべて満たし成立(全件)、定型の文なし', c.total === 2 && c.established === 2 && c.notEstablished === 0 && !c.statement, JSON.stringify(c, null, 1));
  check('3名: 条件4 は構成上(判定記録の前)', cond(ev, 4).ok && cond(ev, 4).basis === 'structure');
  check('3名: 品質レポートに成立判定の節と照らした層1 の版', report.includes('### 保証の主張の成立判定') && report.includes('v1.2(記名日 2026-09-01)'), report.slice(0, 2000));
  check('3名: 外へ渡す開示にも成立判定の節が出て、層1 の記名者の氏名を出さない', ext.includes('### 保証の主張の成立判定') && !ext.includes('社長 一郎'), ext.slice(0, 1500));
  check('3名: 受容しない条件は機械で照合した 2 件・当たる事実なし', c.nonAcceptable.checked === 2 && !c.nonAcceptable.facts.length);
  // G-7・G-8 の記録を書いて集約し直す(記名で判定)
  write('docs/gates/g7-ship.md', gateRecord('G-7 出荷判定', 'HEAD', NAMES[2], d0v));
  write('docs/gates/g8-ship.md', gateRecord('G-8 リリース決裁', 'HEAD', NAMES[1], d0v, g8Extra()));
  commit('docs: G-7・G-8 の記録');
  ({ r, ev } = agg());
  check('3名: 記録の後の集約で、条件4 を記名で判定して成立、欠落なし', ev.gaps.length === 0 && cond(ev, 4).ok && cond(ev, 4).basis === 'record' && ev.assurance.claim.established === ev.assurance.claim.total, ev.gaps.join('\n') + JSON.stringify(cond(ev, 4)));
  // G-8 の新しい3行の欠落
  write('docs/gates/g8-ship.md', gateRecord('G-8 リリース決裁', 'HEAD', NAMES[1], d0v, g8Extra({ policyVersion: '<受容を照らした…>', escalation: '', objection: '異議あり: R1 の未確認を受容すべきでない' })));
  commit('docs: G-8 の記録(欄の欠落)');
  ({ ev } = agg());
  check('G-8: 照らした層1 の版が様式のまま → 欠落', ev.gaps.some((g) => g.includes('照らした層1 の版')), ev.gaps.join('\n'));
  check('G-8: 上申が空欄 → 欠落', ev.gaps.some((g) => g.includes('「上申」が未記入')), ev.gaps.join('\n'));
  write('docs/gates/g8-ship.md', gateRecord('G-8 リリース決裁', 'HEAD', NAMES[1], d0v, g8Extra({ escalation: '社長へ届けた', objection: '異議あり: 検出率が低い' })));
  commit('docs: G-8 の記録(異議を退けた受容・日付なし)');
  ({ ev } = agg());
  check('G-8: 異議ありを退けた受容に上申の日付が無い → 欠落', ev.gaps.some((g) => g.includes('異議(「異議あり」)を退けて受容')), ev.gaps.join('\n'));
  write('docs/gates/g8-ship.md', gateRecord('G-8 リリース決裁', 'HEAD', NAMES[1], d0v, g8Extra({ escalation: `社長へ届けた(${TODAY})`, objection: '異議あり: 検出率が低い' })));
  commit('docs: G-8 の記録(上申の日付あり)');
  ({ ev } = agg());
  check('G-8: 上申の日付があれば欠落なし', !ev.gaps.some((g) => g.includes('上申')), ev.gaps.join('\n'));
  // G-7 と G-8 を同じ人が記名
  write('docs/gates/g8-ship.md', gateRecord('G-8 リリース決裁', 'HEAD', NAMES[2], d0v, g8Extra()));
  commit('docs: G-8 を出荷判定者が記名');
  ({ ev } = agg());
  check('条件4: G-7 と G-8 を同じ人が記名 → 不成立(記名で判定)', !cond(ev, 4).ok && cond(ev, 4).basis === 'record' && ev.assurance.claim.notEstablished === ev.assurance.claim.total, JSON.stringify(cond(ev, 4)));
  check('条件4 不成立の出荷で、対象外の受容が「該当なし」 → 欠落', ev.gaps.some((g) => g.includes('品質保証の対象外として出荷することの受容')), ev.gaps.join('\n'));

  // 層1 なし
  reset();
  fs.rmSync(path.join(W.DIR, 'docs/quality-assurance-policy.md'));
  commit('docs: 層1 を外す');
  ({ ev, report, ext } = agg());
  let cl = ev.assurance.claim;
  check('層1 なし: 条件1 を満たさず、すべて対象外の定型の文', !cond(ev, 1).ok && cl.notEstablished === cl.total && cl.statement?.startsWith('本リリースは、品質保証の対象外として出荷しました'), JSON.stringify(cl, null, 1));
  check('層1 なし: 出力に「層1 なし」と定型の文(内・外とも)', report.includes('層1 なし') && ext.includes('本リリースは、品質保証の対象外として出荷しました'), ext.slice(0, 1200));
  check('層1 なし: 条件5 も不成立(許容期間なしとして扱う)ではなく、測定済みなので成立', cond(ev, 5).ok);
  check('層1 なし: 停止の申し立て・継続の状態の表示は出る', report.includes('組織継続の側の状態'), '');

  // 未測定
  reset();
  fs.rmSync(path.join(W.DIR, 'evidence/seeded-errors.json'));
  commit('chore: 測定の記録を外す');
  ({ ev } = agg());
  check('未測定・許容しない: 条件5 不成立', !cond(ev, 5).ok && ev.assurance.claim.byCondition[5] === ev.assurance.claim.total, JSON.stringify(cond(ev, 5)));
  write('docs/quality-assurance-policy.md', POLICY({ tolerance: '出荷 2 回' }));
  commit('docs: 許容期間を出荷2回に');
  ({ ev } = agg());
  check('未測定・許容 出荷2回(1回目): 条件5 成立', cond(ev, 5).ok, JSON.stringify(cond(ev, 5)));
  write('docs/quality-assurance-policy.md', POLICY({ tolerance: '30日', conditions: ['[未測定] 検出能力が未測定のまま出荷すること'] }));
  commit('docs: 未測定を受容しない条件に');
  ({ ev } = agg());
  check('受容しない条件 [未測定] に当たる → 条件6 不成立と事実の出所', !cond(ev, 6).ok && ev.assurance.claim.nonAcceptable.facts.some((f) => f.source.includes('項目6')), JSON.stringify(ev.assurance.claim.nonAcceptable));

  // 受容しない条件(台帳の語)
  reset();
  write('docs/debt-ledger.md', read('docs/debt-ledger.md') + '| D-001 | 未解決 | — | 個人データの削除の手順が未整備 | G-2 に含まれない | 削除依頼 | G-3 まで | 未返却 | 山田 太郎 | — |\n');
  commit('docs: 台帳に個人データの未解決');
  ({ ev, report } = agg());
  cl = ev.assurance.claim;
  check('受容しない条件 [台帳:個人データ] に当たる → 条件6 不成立、事実 D-001', !cond(ev, 6).ok && cl.nonAcceptable.facts.some((f) => f.fact.includes('D-001')) && ev.gaps.length === 0, JSON.stringify(cl.nonAcceptable) + ev.gaps.join('\n'));
  check('受容しない条件の事実が品質レポートの成立判定に出る', report.includes('当たる事実 1 件'), '');
  check('G-7 の基準9 に受容しない条件の照合の範囲が出る', ev.criteria.find((x) => x.id === 9).result.includes('受容しない条件'), JSON.stringify(ev.criteria.find((x) => x.id === 9)));
  write('docs/quality-assurance-policy.md', POLICY({ conditions: ['確約範囲に当たる未解決の欠陥', '[謎の印] なにか'] }));
  commit('docs: 印の無い条件');
  ({ ev } = agg());
  check('印の無い条件・知らない印は「機械で照合していない」と出し、G-7 の突合へ回す', ev.assurance.claim.nonAcceptable.notChecked.length === 2 && ev.criteria.find((x) => x.id === 9).humanReconcile?.includes('機械で照合していない 2 件'), JSON.stringify(ev.assurance.claim.nonAcceptable));

  // 層2: 保証しない
  reset();
  write('docs/project-brief.md', read('docs/project-brief.md').replace(/^\| 保証範囲と範囲外 \| .*$/m, '| 保証範囲と範囲外 | 組織として保証しない |'));
  commit('docs: 保証しない案件');
  ({ ev } = agg());
  check('層2「組織として保証しない」: 条件2 不成立', !cond(ev, 2).ok && cond(ev, 2).reason.includes('組織として保証しない'), JSON.stringify(cond(ev, 2)));
  // 層1 の記名が AI の名義
  reset();
  write('docs/quality-assurance-policy.md', POLICY({ signer: 'Claude' }));
  commit('docs: AI の名義の記名');
  ({ ev } = agg());
  check('層1 の記名が AI の名義: 条件1 不成立', !cond(ev, 1).ok && /AI/.test(cond(ev, 1).reason), JSON.stringify(cond(ev, 1)));

  // ============================================================ (2) 組織継続の側の状態
  fixes(['ADR-0057 決定12', '標準 3.4.3', '標準 3.12.11']);
  reset();
  ({ ev, report } = agg());
  const spof = ev.assurance.continuity.spof;
  check('継続: 確認済みの代理者・保持者3名・AI の担い手なしでは単一障害点なし', spof.length === 0, JSON.stringify(spof));
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 独立レビュア | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, `| 独立レビュア | 代理 太郎 | 全部 | 暫定任命 | |`).replace(`| 出荷判定者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, '| 出荷判定者 | | | なし | |'));
  write('docs/handover.md', read('docs/handover.md').split('\n').filter((l) => !(l.startsWith('| 招待 |') && !l.startsWith(`| 招待 | ${NAMES[0]} |`))).join('\n'));
  commit('docs: 後継不在とコア理解1名');
  ({ ev, report, ext } = agg());
  const states = ev.assurance.continuity.spof.map((x) => `${x.state}:${x.subject}`);
  check('継続: 暫定任命・なしの席を後継不在、保持者1名の機能を出す', states.includes('後継不在の席:独立レビュア') && states.includes('後継不在の席:出荷判定者') && states.includes('コア理解の保持者が1名以下:招待'), states.join(' / '));
  check('継続: 項目5 に「受容なし」で、欠落にしない(成立条件に入れない)', report.includes('後継不在の席: 出荷判定者') && report.includes('受容なし') && ev.gaps.length === 0 && ev.assurance.claim.established === ev.assurance.claim.total, ev.gaps.join('\n') + JSON.stringify(ev.assurance.claim.conditions.filter((x) => !x.ok)) + (report.split('### 5.')[1] ?? '').slice(0, 900));
  check('継続: 項目7 に後継と理解保持者を出す', report.includes('判断を担う席の後継(確認済みで周期内の候補の数 / 最低数)') && report.includes('招待 1 名(1名以下)'), '');
  // 期限切れの受容
  const accept = (rows) => write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 状態 | 対象 | 受容した者 | 受容の期限 | 照らした層1 の版 |\n| --- | --- | --- | --- | --- |\n| | | | | |', `| 状態 | 対象 | 受容した者 | 受容の期限 | 照らした層1 の版 |\n| --- | --- | --- | --- | --- |\n${rows}`));
  accept(`| 後継不在の席 | 出荷判定者 | ${NAMES[1]} | ${PAST} | v1.2 |`);
  commit('docs: 期限切れの受容');
  ({ ev, report } = agg());
  check('継続: 期限を過ぎた受容 → 記載の欠落', ev.gaps.some((g) => g.includes('後継不在の席: 出荷判定者') && g.includes('受容の期限')), ev.gaps.join('\n'));
  check('継続: 期限切れで条件6 も不成立になる(欠落のため)', !cond(ev, 6).ok, JSON.stringify(cond(ev, 6)));
  reset();
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 出荷判定者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, '| 出荷判定者 | | | なし | |'));
  accept(`| 後継不在の席 | 出荷判定者 | ${NAMES[1]} | ${FUTURE} | v1.2 |\n| 後継不在の席 | 独立レビュア | Claude | ${FUTURE} | v1.2 |`);
  commit('docs: 期限内の受容');
  ({ ev, report } = agg());
  const acc = ev.assurance.continuity.spof.find((x) => x.subject === '出荷判定者')?.acceptance;
  check('継続: 期限内の受容は「受容あり」で欠落なし', acc?.status === 'accepted' && ev.gaps.length === 0, JSON.stringify(acc) + ev.gaps.join('\n'));
  write('docs/quality-assurance-policy.md', POLICY({ contRole: '出荷判定者' }));
  commit('docs: 継続の受容者を出荷判定者に');
  ({ ev } = agg());
  const acc2 = ev.assurance.continuity.spof.find((x) => x.subject === '出荷判定者')?.acceptance;
  check('継続: 層1 の受容者の席の責任者でない記名は無効(受容として数えない)', acc2?.status === 'invalid' && acc2.why.some((w) => w.includes('権限者')), JSON.stringify(acc2));
  // 縮退・退出の予行(AI の担い手を宣言した構成)
  reset();
  write(
    'docs/exit-rehearsal.json',
    JSON.stringify({ rehearsals: [{ model: 'model-a-1', provider: 'ProvA', alternative: { provider: 'ProvA', model: 'model-a-2' }, at: '2026-09-20', baseline: 'evals/base' }] })
  );
  commit('docs: 同じ提供者の世代交代の記録');
  ({ ev } = agg());
  check('退出の予行: 同じ提供者の記録は数えない(読めない記録として出す)', ev.assurance.continuity.problems.some((p) => p.includes('同じ提供者')), JSON.stringify(ev.assurance.continuity.problems));
  // AI の担い手を宣言した構成(構成は /process-change だけが書き換えるため、ここでは構成の写しを読む関数を直接呼ぶ)
  const mod = await import(pathToFileURL(path.join(W.DIR, 'scripts/gate/org-assurance.mjs')).href);
  const cfgAI = JSON.parse(read('process.config.json'));
  const dev = cfgAI.seats.find((s) => s.role === 'dev-verifier');
  dev.performer = { model: 'model-a-1', instructions: 'CLAUDE.md@abc1234', permissions: 'repo-write' };
  dev.fallback = 'human';
  const rev = cfgAI.seats.find((s) => s.role === 'independent-reviewer');
  rev.performer = { model: 'model-a-1', instructions: 'https://example.com/prompts', permissions: 'read' };
  rev.fallback = 'stop';
  cfgAI.dependencies = [{ provider: 'ProvA', models: ['model-a-1'], noticePeriod: '90日(利用規約 第12条)', data: 'ソースコード。学習に使わない契約' }];
  const pol = mod.readPolicy(cfgAI, { root: W.DIR });
  let ct = mod.continuityState(cfgAI, pol, { root: W.DIR, day: TODAY });
  let st = ct.spof.map((x) => `${x.state}:${x.subject}`);
  check(
    'AI の担い手: 退出を試していない・代替の無い依存先・止める席・縮退を確かめていない業務・自組織に無い資産を出す',
    st.includes('代替の無い依存先:model-a-1') && st.includes('退出を試していない依存先:model-a-1') && st.some((x) => x.startsWith('止める席:独立レビュア')) && st.some((x) => x.startsWith('縮退を確かめていない業務:開発者')) && st.some((x) => x.startsWith('自組織に無い資産:')),
    st.join(' / ')
  );
  fs.mkdirSync(path.join(W.DIR, 'evals/base'), { recursive: true });
  write('evals/base/README.md', '基準集合\n');
  write(
    'docs/exit-rehearsal.json',
    JSON.stringify({ rehearsals: [{ model: 'model-a-1', provider: 'ProvA', alternative: { provider: 'ProvB', model: 'model-b-1' }, at: '2026-09-20', baseline: 'evals/base', approvedBy: NAMES[0] }] })
  );
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 開発者(検証者) | 未確認 | | | |', `| 開発者(検証者) | 実測 1週 6件(2026-09 の停止期間) | ${TODAY} | 新機能の取り込み | 1日 |`));
  ct = mod.continuityState(cfgAI, pol, { root: W.DIR, day: TODAY });
  st = ct.spof.map((x) => `${x.state}:${x.subject}`);
  const dep = ct.dependencies.find((d) => d.kind === 'モデル');
  check(
    '退出の予行(別の提供者・AI運用担当者の承認・基準集合が手元)と縮退の実測で、モデルと開発者の席は単一障害点から外れる',
    !st.some((x) => x.includes('model-a-1')) && !st.some((x) => x.startsWith('縮退を確かめていない業務:開発者')) && dep.lastExitRehearsal === '2026-09-20' && dep.provider === 'ProvA' && dep.hasAlternative,
    st.join(' / ') + JSON.stringify(dep)
  );
  check('指示資産が URL の担い手は「自組織に無い資産」に残る', st.some((x) => x.startsWith('自組織に無い資産:指示資産')), st.join(' / '));
}

// ================================================================ check-g1 と next.mjs
fixes(['ADR-0057 決定3', 'ADR-0057 決定12', '標準 G-1']);
{
  const W = workspace('t3');
  const { run, git, write, read } = W;
  git('reset', '-q', '--hard', 'base288');
  git('clean', '-qfd');
  let r = run('node', ['scripts/gate/check-g1.mjs']);
  check('check-g1: 層2 の4欄と AI の3行を記入した企画書では、その欄を指摘しない', !/品質の約束と保証範囲|AI の利用/.test(r.out), r.out);
  write('docs/project-brief.md', read('templates/06-project-brief.md'));
  r = run('node', ['scripts/gate/check-g1.mjs']);
  const hits = ['想定する利用者', '壊してはならない品質条件', '保証範囲と範囲外', 'この案件に掛かる外枠', 'AI の利用で期待する成果', 'AI を使わない場合との比較の基準値', 'AI の利用の拡大と停止の基準'].filter((k) => r.out.includes(k));
  check('check-g1: 様式のままの企画書では、層2 の4欄と AI の3行を未記入として出す', !r.ok && hits.length === 7, r.out);
  write('docs/project-brief.md', read('docs/project-brief.md').replace(/^\| 保証範囲と範囲外 \| .*$/m, '| 保証範囲と範囲外 | 層1 なし |'));
  r = run('node', ['scripts/gate/check-g1.mjs']);
  check('check-g1: 「層1 なし」は記入として受け付ける', !r.out.includes('「保証範囲と範囲外」が未記入'), r.out);
  git('checkout', '-q', '--', '.');
  fs.rmSync(path.join(W.DIR, 'docs/quality-assurance-policy.md'));
  const j = JSON.parse(run('node', ['scripts/gate/next.mjs', '--json']).out);
  check('next: G-1 の後に層1 が無ければ、段階を止めず注記で作成を案内する', j.notes.some((n) => n.includes('quality-assurance-policy.md')) && !j.project.some((x) => x.stage.startsWith('層1')), JSON.stringify(j.notes));
  git('checkout', '-q', '--', '.');
}

// ================================================================ (1') 1名体制
fixes(['ADR-0057 決定8']);
{
  const { W, agg } = setup('t1', 1);
  const { ev, report } = agg();
  const cl = ev.assurance.claim;
  check('1名: 条件3(独立した人の確認)と条件4(別の自然人)を満たさない', !cond(ev, 3).ok && !cond(ev, 4).ok && cl.notEstablished === cl.total && cl.statement?.includes('品質保証の対象外'), JSON.stringify(cl.conditions, null, 1));
  check('1名: 後継不在・コア理解1名を出す', ev.assurance.continuity.spof.some((x) => x.state === 'コア理解の保持者が1名以下'), JSON.stringify(ev.assurance.continuity.spof));
  void W;
  void report;
}

// ================================================================ (3) 停止の申し立て(G-5 の pr-rules)
fixes(['標準 7.11', 'ADR-0057 決定9']);
{
  const W = workspace('t3');
  const { run, git, write, commit } = W;
  git('reset', '-q', '--hard', 'base288');
  git('clean', '-qfd');
  const d0v = JSON.parse(W.read('process.config.json')).d0Version;
  git('switch', '-q', '-c', 'docs/fix');
  write('docs/notes.md', '# メモ\n');
  commit('docs: メモ');
  const body = '## 検証方法と結果\n\nなし\n\n## リスク区分\n\nR3\n\n## トレーラ\n\nSpec: setup\n';
  const pr = (extra) => {
    write('../pr-t288.json', JSON.stringify({ number: 7, title: 'docs', body, author: 'acct-1', ...extra }));
    return run('node', ['scripts/gate/check-pr.mjs', '--base', 'main', '--pr', '../pr-t288.json', '--json']);
  };
  const res = (r) => JSON.parse(r.out.slice(r.out.indexOf('{')));
  let r = pr({ labels: [] });
  check('停止: ラベルなしでは対象外', r.ok && !res(r).stop.requested, r.out.slice(0, 800));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: ラベルが付いた PR は失敗(保留)', !r.ok && res(r).errors.some((e) => e.startsWith('停止の申し立て')), r.out.slice(0, 1500));
  // PR の中で足した解除の記録は数えない
  write('docs/gates/stop-7.md', stopRelease({ judge: NAMES[1], d0: d0v }));
  commit('docs: 解除の記録(PR の中)');
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: PR の中で足した解除の記録は数えない', !r.ok, r.out.slice(0, 800));
  git('reset', '-q', '--hard', 'HEAD~1');
  const onMain = (rec) => {
    git('switch', '-q', 'main');
    write('docs/gates/stop-7.md', rec);
    commit('docs: 解除の記録');
    git('switch', '-q', 'docs/fix');
  };
  onMain(stopRelease({ judge: 'Claude', d0: d0v }));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: AI の名義の解除は受け付けない', !r.ok && /AI/.test(res(r).errors.join('')), res(r).errors.join('\n'));
  onMain(stopRelease({ judge: NAMES[0], d0: d0v }));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 層1 の権限者(事業決裁者)でない人の解除は受け付けない', !r.ok && res(r).errors.join('').includes('権限者'), res(r).errors.join('\n'));
  onMain(stopRelease({ judge: NAMES[1], d0: d0v, declined: '退けた', escalation: '' }));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 見解を退けた解除に上申先と日付が無い → 受け付けない', !r.ok && res(r).errors.join('').includes('上申先と日付'), res(r).errors.join('\n'));
  onMain(stopRelease({ judge: NAMES[1], d0: d0v, declined: '退けた', escalation: `社長(${TODAY})` }));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 権限者の記名・理由・上申の記録がある解除で通る', r.ok && res(r).stop.released, r.out.slice(0, 1500));
  r = pr({ labels: [], labelEvents: [{ event: 'labeled', label: 'state:stop-requested', at: `2099-01-01T00:00:00Z` }, { event: 'unlabeled', label: 'state:stop-requested', at: '2099-01-02T00:00:00Z' }] });
  check('停止: 解除の後に付け直した申し立ては、ラベルを外しても失敗(解除の日が古い)', !r.ok && res(r).errors.join('').includes('ラベルを外しただけでは解除にならない'), res(r).errors.join('\n'));
  // 層1 で解除の権限者を出荷判定者にする
  git('switch', '-q', 'main');
  write('docs/quality-assurance-policy.md', POLICY({ stopRole: '出荷判定者' }));
  commit('docs: 解除の権限者を出荷判定者に');
  git('switch', '-q', 'docs/fix');
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 層1 の権限者が出荷判定者なら、事業決裁者の解除は受け付けない', !r.ok, res(r).errors.join('\n'));
  onMain(stopRelease({ judge: NAMES[2], d0: d0v }));
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 層1 の権限者(出荷判定者)の解除で通る', r.ok, r.out.slice(0, 800));
  // 層1 なし → 事業決裁者を権限者とみなす
  git('switch', '-q', 'main');
  fs.rmSync(path.join(W.DIR, 'docs/quality-assurance-policy.md'));
  write('docs/gates/stop-7.md', stopRelease({ judge: NAMES[1], d0: d0v }));
  commit('docs: 層1 なしで事業決裁者の解除');
  git('switch', '-q', 'docs/fix');
  r = pr({ labels: ['state:stop-requested'] });
  check('停止: 層1 なしでは事業決裁者を権限者とみなし、その旨を出す', r.ok && res(r).notices.join('').includes('みなした'), r.out.slice(0, 1200));
  // 解除の記録が集約で項目7 に出る
  git('switch', '-q', 'main');
  const agg = ghRun(W, '出荷の証跡の集約(停止の解除)', 'node', ['scripts/gate/aggregate-evidence.mjs', '--from', 'base288', '--to', 'HEAD'], { GITHUB_REPOSITORY: 'example/t288', MOCK_PRS: path.join(W.DIR, '.git', 'prs') });
  const ev = JSON.parse(W.read('evidence/evidence.json'));
  check('停止: 解除の記録が保証の開示の項目7 に出る', ev.assurance.stopReleases.length >= 1 && W.read('evidence/quality-report.md').includes('停止の申し立ての解除: PR #7'), agg.out.slice(0, 600));
}

done();
