// #288: 保証の主張の成立判定・組織継続の側の状態・停止の申し立て(準拠テンプレートの実装)を場面で確かめる。
//   sh fresh.sh t3 && sh fresh.sh t1 && node t288.mjs [-v]
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, NAMES, SEATS, fill, TODAY, BASE } from './lib.mjs';

export const { check, done, ghRun, fixes } = checker();
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


export { POLICY, CYCLE, gateRecord, g8Extra, stopRelease, setup, cond, FUTURE, PAST };
