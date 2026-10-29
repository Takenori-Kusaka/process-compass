// #288 第2巡: 採用判断シートの1回目の判定(E1〜E5)を受けた修正を、指摘ごとの場面で確かめる。
//   sh fresh.sh u3 && sh fresh.sh u1 && sh fresh.sh ua && node t288b.mjs [-v]
import fs from 'node:fs';
import path from 'node:path';
import { check, done, POLICY, CYCLE, gateRecord, g8Extra, stopRelease, setup, cond, FUTURE, PAST } from './lib288.mjs';
import { workspace, NAMES, TODAY } from './lib.mjs';

const daysAgo = (n) => {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
};
const OLD = daysAgo(400);

// ================================================================ 1. 層1 の必須行・冒頭欄・記名者(E4・Q10・Q18)
{
  const { W, agg, reset } = setup('u3', 3);
  const { write, read, commit } = W;
  const mod = await import(`file:///${path.join(W.DIR, 'scripts/gate/org-assurance.mjs').replace(/\\/g, '/')}`);
  const cfg = JSON.parse(read('process.config.json'));
  // 判定の担当の探り(probe-policy)の本文: 受容者が1行だけで、必須行が空欄
  const probe = fs.readFileSync(path.join(W.DIR, '..', '..', '..', 'probe-policy.mjs'), 'utf8').match(/const text = `([\s\S]*?)`;/)[1];
  let p = mod.readPolicy(cfg, { text: probe, today: TODAY });
  check('探り: 必須行が空欄の層1 は有効にならない(第1巡の不具合の修正)', !p.valid && p.requiredBlank.length >= 9, JSON.stringify(p.problems));
  p = mod.readPolicy(cfg, { text: POLICY(), today: TODAY });
  check('全欄記入の層1 は有効', p.valid, JSON.stringify(p.problems));
  for (const [k, label] of [
    ['stop', '停止の申し立ての解除'],
    ['shrink', 'AI の利用の縮小・停止'],
    ['contract', '有事の決定: 契約変更'],
  ]) {
    p = mod.readPolicy(cfg, { text: POLICY({ blankRequired: k }), today: TODAY });
    check(`必須行「${label}」だけが空欄 → 無効で、その行を出す`, !p.valid && p.requiredBlank.length === 1 && p.requiredBlank[0].includes(label), JSON.stringify(p.requiredBlank));
  }
  p = mod.readPolicy(cfg, { text: POLICY().replace(/^\| \(必須\)有事の決定: 規制変更.*\n/m, ''), today: TODAY });
  check('必須行を消した層1 も無効', !p.valid && p.requiredBlank.some((x) => x.includes('規制変更')), JSON.stringify(p.requiredBlank));
  p = mod.readPolicy(cfg, { text: POLICY({ power: '—' }), today: TODAY });
  check('記名者の権限(ア)が有・連署・上申先のどれでもない → 無効', !p.valid && p.problems.some((x) => x.includes('(ア)')), JSON.stringify(p.problems));
  p = mod.readPolicy(cfg, { text: POLICY({ power: '連署者: 部長 次郎(事業部長)' }), today: TODAY });
  check('権限を連署で補うのに連署の欄が「なし」 → 無効', !p.valid && p.problems.some((x) => x.includes('連署')), JSON.stringify(p.problems));
  p = mod.readPolicy(cfg, { text: POLICY({ power: '連署者: 部長 次郎(事業部長)', cosign: '部長 次郎(事業部長) 2026-09-02' }), today: TODAY });
  check('連署者と連署日があれば有効', p.valid, JSON.stringify(p.problems));
  p = mod.readPolicy(cfg, { text: POLICY({ power: '連署者: Claude', cosign: 'Claude 2026-09-02' }), today: TODAY });
  check('連署に AI の名義 → 無効', !p.valid && p.problems.some((x) => x.startsWith('連署') && /AI/.test(x)), JSON.stringify(p.problems));
  p = mod.readPolicy(cfg, { text: POLICY().replace('| 適用範囲の組織単位 | 開発部 |\n', ''), today: TODAY });
  check('適用範囲の組織単位が無い → 無効', !p.valid && p.problems.some((x) => x.includes('適用範囲の組織単位')), JSON.stringify(p.problems));
  // 記名者が事業決裁者の席の責任者と同一 → 項目1 に表示(無効にはしない)
  write('docs/quality-assurance-policy.md', POLICY({ signer: NAMES[1] }));
  commit('docs: 記名者を事業決裁者に');
  const r1 = agg();
  check('記名者 = 事業決裁者 → 層1 は有効のまま、項目1 に逸脱を出す', cond(r1.ev, 1).ok && r1.report.includes('層1 の記名者が、事業決裁者の席の責任者と同一である'), JSON.stringify(cond(r1.ev, 1)));
  reset();

  // ============================================================ 2. 有事の決定者の空欄(IMPL-0067。Q18)
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 重大事故 | 事業決裁者 | 層1 の項目4 による | 事業決裁者 |', '| 重大事故 | 事業決裁者 | | 事業決裁者 |'));
  commit('docs: 有事の決定者の空欄');
  let r = agg();
  check('D-0 表4 の空欄 → 記載の欠落(G-7 基準9)・集約が失敗', !r.r.ok && r.ev.gaps.some((g) => g.includes('有事の決定者') && g.includes('重大事故: 切替の決定者')), r.ev.gaps.join('\n'));
  const d0check = W.run('node', ['scripts/gate/check-d0.mjs']);
  check('check-d0 も空欄を表示する(G-1 の前提条件は止めない)', d0check.out.includes('有事の決定者に空欄が 1 欄'), d0check.out);
  reset();
  write('docs/quality-assurance-policy.md', POLICY().replace('| (必須)有事の決定: 重大事故(停止・切替・顧客説明) | | 事業決裁者 | — |', '| (必須)有事の決定: 重大事故(停止・切替・顧客説明) | | | — |'));
  commit('docs: 層1 の重大事故の行を空欄に');
  r = agg();
  check('「層1 の項目4 による」で層1 の行が空欄 → 欠落', r.ev.gaps.some((g) => g.includes('「層1 の項目4 による」と書かれているが')), r.ev.gaps.join('\n'));
  reset();

  // ============================================================ 3. 品質条件の識別子と突合(IMPL-0069・0072。Q2)
  write('docs/project-brief.md', read('docs/project-brief.md').replace(/^\| QC-01 \| .*$/m, '| QC-01 | 権限の無い利用者は招待を取り消せない | 権限 |\n| QC-02 | 個人データをログへ出さない | データ |\n| QC-03 | 招待の一覧は1秒以内に返す | 性能 |'));
  fs.mkdirSync(path.join(W.DIR, 'specs/F-001'), { recursive: true });
  write('specs/F-001/spec.md', '# F-001 招待\n\n## 受入基準\n\n| # | 型 | 受入基準 |\n| --- | --- | --- |\n| 1 | イベント駆動 | 権限の無い利用者が取り消しを実行した場合、システムは 403 を返さなければならない(QC-01) |\n| 2 | ユビキタス | システムは招待トークンをログへ出力してはならない(QC-02) |\n| 3 | イベント駆動 | 期限切れの招待は一覧に「失効」と表示しなければならない |\n');
  write('tests/invite.test.js', "// F-001/AC-1 QC-01\ntest('403', () => {});\n// F-001/AC-3\ntest('失効', () => {});\n");
  write('evidence/test-results.json', JSON.stringify({ passed: ['tests/invite.test.js'], runAt: TODAY }));
  commit('feat: 招待の受入基準とテスト');
  r = agg();
  const vf = r.ev.assurance.verification;
  check('QC の突合: QC-01 は受入基準とテストの両方 → 項目4 の件数', r.report.includes('壊してはならない品質条件(受入基準とテストの両方から参照) | 1 / 3 件'), r.report.split('### 4.')[1]?.slice(0, 1500));
  check('QC の突合: QC-02(テストなし)・QC-03(参照なし)を項目5 へ自動で載せる', r.ev.assurance.residual.qcNoTest.join() === 'QC-02' && r.ev.assurance.residual.qcUnreferenced.join() === 'QC-03' && r.report.includes('テストへ降ろしていない品質条件(受入基準から参照、テストから参照なし): QC-02'), JSON.stringify(vf.qc));
  check('QC の突合: 参照の無い条件は欠落にしない(G-8 の受容の対象)', !r.ev.gaps.some((g) => g.includes('QC-0')), r.ev.gaps.join('\n'));
  // ============================================================ 4. G-7 基準1・2(IMPL-0040・0041。Q5)
  const c1 = r.ev.criteria.find((c) => c.id === 1);
  check('G-7 基準1: 受入基準3・計画したテスト1・通過1・テストの無い受入基準1(F-001/AC-2)', c1.machine === 'partial' && /受入基準 3 件、計画したテスト.*1 件。実行して通過 1/.test(c1.result) && c1.result.includes('F-001/AC-2'), c1.result);
  const c2 = r.ev.criteria.find((c) => c.id === 2);
  check('G-7 基準2: 「既知の欠陥なし」の台帳を取り込む', c2.result === '既知の欠陥なし(台帳の記載)', c2.result);
  write('docs/defect-ledger.md', read('docs/defect-ledger.md').replace('\n既知の欠陥なし\n', '| B-1 | 招待が二重に送られる | Sev2 | 高 | 未解決 | はい | docs/known.md |\n| B-2 | 一覧が落ちる | Sev1 | 高 | 未解決 | いいえ | なし |\n| B-3 | 表示崩れ | Sev3 | 低 | 解決済み | いいえ | — |\n'));
  commit('docs: 欠陥の台帳');
  r = agg();
  const c2b = r.ev.criteria.find((c) => c.id === 2);
  check('G-7 基準2: S1 のトリアージの区分ごとに未解決を数える(Sev1 はコア/非コア)', /Sev1 1 件\(コア機能は出荷不可.*コア 0 \/ 非コア 1\)/.test(c2b.result) && c2b.result.includes('Sev2 1 件') && c2b.result.includes('Sev3 0 件'), c2b.result);
  fs.rmSync(path.join(W.DIR, 'docs/defect-ledger.md'));
  commit('docs: 欠陥の台帳を外す');
  r = agg();
  check('G-7 基準2: 欠陥の台帳が無い出荷は記載の欠落', r.ev.gaps.some((g) => g.includes('欠陥の台帳(docs/defect-ledger.md)がありません')), r.ev.gaps.join('\n'));
  reset();
  write('docs/project-brief.md', read('docs/project-brief.md').replace(/^\| QC-01 \| .*$/m, '| QC-01 | 権限の無い利用者は招待を取り消せない | 権限 |\n| | 個人データをログへ出さない | データ |'));
  commit('docs: 識別子の無い条件');
  r = agg();
  check('識別子を持たない条件 → 記載の欠落', r.ev.gaps.some((g) => g.includes('識別子(QC-NN)を持たない条件')), r.ev.gaps.join('\n'));
  const g1 = W.run('node', ['scripts/gate/check-g1.mjs']);
  check('check-g1: 識別子の欠落を検出する', !g1.ok && g1.out.includes('識別子(QC-NN)を持たない条件'), g1.out);
  reset();
  write('docs/project-brief.md', read('docs/project-brief.md').replace(/^\| QC-01 \| .*$/m, '| QC-01 | 権限 | 権限 |\n| QC-01 | 重複 | データ |').replace(/^\| 教育 \| ([^|]*) \| 10時間 \| 見積り \| 見積りの方法 \|$/m, '| 教育 | $1 | | | |'));
  const g1b = W.run('node', ['scripts/gate/check-g1.mjs']);
  check('check-g1: 識別子の重複と、総費用の区分の空欄を検出する', !g1b.ok && g1b.out.includes('識別子が重複') && g1b.out.includes('総費用の内訳」に記入の無い区分があります(教育'), g1b.out);
  reset();

  // ============================================================ 5. 停止の申し立ての出荷の保留(IMPL-0073。Q9・Q17)
  const prsDir = path.join(W.DIR, '.git', 'prs');
  const lastPr = 2; // base288 の時点の範囲の最後の PR(docs: 体制・層1・企画・記録を置く)
  const prFile = path.join(prsDir, `${lastPr}.json`);
  const orig = fs.readFileSync(prFile, 'utf8');
  fs.writeFileSync(prFile, JSON.stringify({ ...JSON.parse(orig), labels: [{ name: 'state:stop-requested' }] }));
  r = agg();
  check('出荷の範囲の PR に未解除の申し立て → 集約が失敗(保留)', !r.r.ok && r.ev.gaps.some((g) => g.startsWith(`停止の申し立ての保留: PR #${lastPr}`)), r.ev.gaps.join('\n'));
  check('保留と自律実行の保留の範囲を項目7 に出す', r.report.includes('**停止の申し立ての保留**') && r.report.includes('AI の担い手の自律実行の停止は、指示文(CLAUDE.md)と AI運用担当者の操作に依る'), '');
  write('docs/gates/stop-ship.md', stopRelease({ judge: NAMES[1], d0: JSON.parse(read('process.config.json')).d0Version, pr: lastPr }));
  commit('docs: 解除の記録');
  fs.writeFileSync(prFile, JSON.stringify({ ...JSON.parse(orig), labels: [{ name: 'state:stop-requested' }] }));
  r = agg();
  check('出荷の終点に成立した解除の記録があれば保留しない', !r.ev.gaps.some((g) => g.startsWith('停止の申し立ての保留')), r.ev.gaps.join('\n'));
  fs.writeFileSync(prFile, orig);
  reset();

  // ============================================================ 6. 周期の失効(IMPL-0060・0061・0063・0064。Q13〜Q16)
  const cfgAI = JSON.parse(read('process.config.json'));
  const dev = cfgAI.seats.find((s) => s.role === 'dev-verifier');
  dev.performer = { model: 'model-a-1', instructions: 'CLAUDE.md@abc1234', permissions: 'repo-write' };
  dev.fallback = 'human';
  cfgAI.dependencies = [{ provider: 'ProvA', models: ['model-a-1'], noticePeriod: '90日', data: 'ソースコード' }];
  fs.mkdirSync(path.join(W.DIR, 'evals/base'), { recursive: true });
  write('evals/base/README.md', '基準集合\n');
  const rehearsal = (at, scope = true) =>
    write('docs/exit-rehearsal.json', JSON.stringify({ rehearsals: [{ model: 'model-a-1', provider: 'ProvA', alternative: { provider: 'ProvB', model: 'model-b-1' }, at, baseline: 'evals/base', approvedBy: NAMES[0] }], ...(scope ? { baselineScope: { scope: '招待の全機能', draftedBy: NAMES[0], approvedBy: NAMES[0], at } } : {}) }));
  const degr = (at) => write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^\| 開発者\(検証者\) \| (未確認|実測 1週 6件) \|[^\n]*$/m, `| 開発者(検証者) | 実測 1週 6件 | ${at} | 新機能 | 1日 |`));
  rehearsal(TODAY);
  degr(TODAY);
  const ct = (policyText) => mod.continuityState(cfgAI, mod.readPolicy(cfgAI, { text: policyText, root: W.DIR }), { root: W.DIR, day: TODAY });
  let c = ct(POLICY());
  let st = c.spof.map((x) => `${x.state}:${x.subject}`);
  check('周期内の予行・実測・確認では、モデル・縮退・後継・保持者は単一障害点に出ない', !st.some((x) => /model-a-1|縮退|後継|コア/.test(x)), st.join(' / '));
  rehearsal(OLD);
  c = ct(POLICY());
  st = c.spof.map((x) => `${x.state}:${x.subject}`);
  check('退出の予行が間隔(12か月)を過ぎた → 退出を試していない', st.includes('退出を試していない依存先:model-a-1') && c.spof.find((x) => x.state === '退出を試していない依存先').detail.includes('過ぎている'), st.join(' / '));
  rehearsal(TODAY);
  c = ct(POLICY({ cycle: { ...CYCLE, exit: '' } }));
  check('退出の予行の間隔が空欄 → 予行の記録があっても退出を試していない', c.spof.some((x) => x.state === '退出を試していない依存先' && x.detail.includes('間隔が空欄')), JSON.stringify(c.spof));
  degr(OLD);
  c = ct(POLICY());
  check('縮退の実測が頻度を過ぎた → 未確認', c.degradation[0].quantity.startsWith('未確認') && c.spof.some((x) => x.state === '縮退を確かめていない業務'), JSON.stringify(c.degradation));
  degr(TODAY);
  c = ct(POLICY({ cycle: { ...CYCLE, degradation: '' } }));
  check('縮退の実測の頻度が空欄 → 実測があっても未確認', c.degradation[0].quantity.includes('頻度が空欄'), JSON.stringify(c.degradation));
  rehearsal(TODAY, false);
  c = ct(POLICY());
  check('基準集合の範囲の承認の記録が無い → その旨を出す', c.baselineScope.approved === false && c.baselineScope.why.some((w) => w.includes('baselineScope')), JSON.stringify(c.baselineScope));
  rehearsal(TODAY);
  // 後継: 確認日が周期を過ぎた候補は数えない / 最低数2で候補1 → 後継不在 / 周期の空欄 → 全席
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 技術判断者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, `| 技術判断者 | 代理 太郎 | 全部 | 確認済み | ${OLD} |`));
  c = ct(POLICY());
  check('後継候補の確認日が力量の確認の周期を過ぎた → 数えず後継不在', c.successors.find((x) => x.seat === '技術判断者').vacant && c.successors.find((x) => x.seat === '技術判断者').reason.includes('過ぎている'), JSON.stringify(c.successors.find((x) => x.seat === '技術判断者')));
  c = ct(POLICY({ cycle: { ...CYCLE, min: '価値責任者: 2 / 技術判断者: 0 / 独立レビュア: 1 / QA: 1' } }));
  check('最低数2の席に確認済みの候補1名 → 後継不在、最低数0の席は不在でない', c.successors.find((x) => x.seat === '価値責任者').vacant && !c.successors.find((x) => x.seat === '技術判断者').vacant, JSON.stringify(c.successors.map((x) => [x.seat, x.counted, x.min, x.vacant])));
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 価値責任者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, `| 価値責任者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |\n| 価値責任者 | 候補 花子 | 一部 | 確認済み | ${TODAY} |`));
  c = ct(POLICY({ cycle: { ...CYCLE, min: '価値責任者: 2 / 技術判断者: 0 / 独立レビュア: 1 / QA: 1' } }));
  check('候補を複数行で書けば数える(2名で最低数2を満たす)', !c.successors.find((x) => x.seat === '価値責任者').vacant && c.successors.find((x) => x.seat === '価値責任者').counted === 2, JSON.stringify(c.successors.find((x) => x.seat === '価値責任者')));
  c = ct(POLICY({ cycle: { ...CYCLE, competence: '', min: '' } }));
  check('力量の確認の周期・最低数が空欄 → 全席を後継不在、保持者も数えない', c.successors.every((x) => x.vacant) && c.core.every((x) => x.holders.length === 0), JSON.stringify([c.successors.map((x) => x.vacant), c.core]));
  // 保持者: 確認した者が本人 / 空欄 / 確認日が古い
  write('docs/handover.md', read('docs/handover.md').replace(new RegExp(`^\\| 招待 \\| ${NAMES[0]} \\| [^|]* \\|`, 'm'), `| 招待 | ${NAMES[0]} | ${NAMES[0]} |`).replace(new RegExp(`^\\| 招待 \\| ${NAMES[1]} \\| [^|]* \\| [^|]* \\|`, 'm'), `| 招待 | ${NAMES[1]} | | H-3 ${TODAY} |`).replace(/^\| 招待 \| 代理 太郎 \| ([^|]*) \| [^|]* \|/m, `| 招待 | 代理 太郎 | $1 | H-3 ${OLD} |`));
  c = ct(POLICY());
  const core = c.core.find((x) => x.name === '招待');
  check('保持者: 確認者が本人・確認者が空欄・確認日が周期外の名前は数えず、理由を出す', core.holders.length === 0 && core.uncounted.map((u) => u.why).join().includes('保持者本人') && core.uncounted.map((u) => u.why).join().includes('確認した者が空欄') && core.uncounted.map((u) => u.why).join().includes('過ぎている'), JSON.stringify(core));
  check('保持者0名 → コア理解の保持者が1名以下(数えなかった名前を出す)', c.spof.some((x) => x.state === 'コア理解の保持者が1名以下' && x.detail.includes('数えなかった名前')), JSON.stringify(c.spof));
  // 育成の担当が空欄 → 後継不在の受容を受け付けない / 演習の頻度が空欄 → 項目7
  c = ct(POLICY({ cycle: { ...CYCLE, trainer: '', drill: '' } }));
  check('育成の担当・演習の頻度が空欄 → 項目7 の注記', c.cycleNotices.some((n) => n.includes('演習の頻度を定めていない')) && c.cycleNotices.some((n) => n.includes('育成の担当')), JSON.stringify(c.cycleNotices));
  // 依存先の欄(IMPL-0065)
  delete cfgAI.dependencies;
  c = ct(POLICY());
  check('依存先の通知の期間・データが空欄 → 単一障害点の候補', c.spof.some((x) => x.state === '通知の期間またはデータが空欄の依存先' && x.candidate), JSON.stringify(c.spof.map((x) => x.state)));
  cfgAI.dependencies = [{ provider: 'ProvA', models: ['model-a-1'], noticePeriod: '90日', data: 'ソースコード' }];
  c = ct(POLICY());
  const depM = c.dependencies.find((d) => d.kind === 'モデル');
  check('依存先の一覧へ通知の期間とデータを転記する', depM.noticePeriod === '90日' && depM.data === 'ソースコード' && c.dependencies.find((d) => d.kind === 'データ').name.includes('ProvA: ソースコード'), JSON.stringify(c.dependencies));
  reset();
  // 育成の担当が空欄の層1 では、後継不在の受容を受け付けない(集約)
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 出荷判定者 | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, '| 出荷判定者 | | | なし | |').replace('| 状態 | 対象 | 受容した者 | 受容の期限 | 照らした層1 の版 |\n| --- | --- | --- | --- | --- |\n| | | | | |', `| 状態 | 対象 | 受容した者 | 受容の期限 | 照らした層1 の版 |\n| --- | --- | --- | --- | --- |\n| 後継不在の席 | 出荷判定者 | ${NAMES[1]} | ${FUTURE} | v1.2 |`));
  write('docs/quality-assurance-policy.md', POLICY({ cycle: { ...CYCLE, trainer: '' } }));
  commit('docs: 育成の担当の空欄');
  r = agg();
  const acc = r.ev.assurance.continuity.spof.find((x) => x.subject === '出荷判定者')?.acceptance;
  check('育成の担当が空欄 → 後継不在の受容は無効', acc?.status === 'invalid' && acc.why.some((w) => w.includes('育成の担当')), JSON.stringify(acc));
  reset();

  // ============================================================ 7. AI の層の条件2〜5(IMPL-0075。Q4)
  {
    const P = { model: 'model-a-1', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
    const Q = { confirmedAt: daysAgo(5), performedBy: NAMES[1], approvedBy: NAMES[0], cases: 'docs/qualification/dev.md', result: '20 件中 19 件を再現', performer: P };
    let ch = W.change({ kind: 'performer', summary: 'AI の担い手を置く', seats: { 'dev-verifier': { performer: P, fallback: 'human', qualification: Q } }, decidedBy: NAMES[0], reason: '開発者の席に AI の担い手を置く' });
    check('AI の担い手と適合性確認を /process-change で置ける', ch.ok, ch.out.slice(-800));
    fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
    commit('chore: AI の担い手');
    write('evidence/seeded-errors.json', JSON.stringify({ human: { seeded: 10, detected: 8, measuredAt: TODAY, method: '試験の固定値', blind: true }, ai: { seeded: 10, detected: 6, measuredAt: TODAY, method: '試験の固定値', blind: true } }));
    r = agg();
    check('AI の層: 条件2〜5 の確認の記録が無い → 条件未確認として検出の層に数えない', String(r.ev.assurance.detection.ai).includes('条件未確認'), String(r.ev.assurance.detection.ai));
    ch = W.change({ kind: 'performer', summary: '条件2〜5 の確認', seats: { 'dev-verifier': { qualification: { conditions: { checkedAt: TODAY, checkedBy: NAMES[1], approvedBy: NAMES[0] } } } } });
    check('条件2〜5 の確認だけを /process-change で足せる(適合性確認の記録は書き換えない)', ch.ok && JSON.parse(read('process.config.json')).seats.find((s) => s.role === 'dev-verifier').qualification.cases === 'docs/qualification/dev.md', ch.out.slice(-800));
    fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
    commit('chore: 条件2〜5 の確認');
    write('evidence/seeded-errors.json', JSON.stringify({ human: { seeded: 10, detected: 8, measuredAt: TODAY, method: '試験の固定値', blind: true }, ai: { seeded: 10, detected: 6, measuredAt: TODAY, method: '試験の固定値', blind: true } }));
    r = agg();
    check('AI の層: 条件2〜5 の確認(AI維持管理者の確認・席の責任者の承認・四半期内)があれば数える', typeof r.ev.assurance.detection.ai === 'object' && r.ev.assurance.detection.ai.detected === 6, JSON.stringify(r.ev.assurance.detection.ai));
    reset();
  }
  // ============================================================ 8. SG の判定記録の AI の利用の評価(IMPL-0068。Q11)
  const d0v = JSON.parse(read('process.config.json')).d0Version;
  write('docs/gates/sg1.md', gateRecord('SG-1 ステージ移行', 'S1', NAMES[1], d0v, g8Extra()));
  commit('docs: SG の判定記録(評価の節なし)');
  r = agg();
  check('SG の判定記録に「AI の利用の評価」の節が無い → 欠落', r.ev.gaps.some((g) => g.includes('sg1.md') && g.includes('「AI の利用の評価」の節がありません')), r.ev.gaps.join('\n'));
  write('docs/gates/sg1.md', gateRecord('SG-1 ステージ移行', 'S1', NAMES[1], d0v, g8Extra() + '\n## AI の利用の評価(適用: ステージ移行ゲート・第三者による棚卸し)\n\n| 欄 | 記載 |\n| --- | --- |\n| 評価の単位 | 案件 |\n| 下流の指標と比較の基準値 | 変更失敗率 5% / 基準値 8%(導入前の実測) |\n| 総費用の内訳 | |\n| 評価に用いなかった入力 | 自己申告の速度と利用量 |\n| 判定 | 継続 |\n| 縮小・停止の基準に当たる状態での継続 | 該当なし |\n'));
  commit('docs: SG の判定記録(総費用が空欄)');
  r = agg();
  check('「AI の利用の評価」の総費用の内訳が空欄 → 欠落、「該当なし」は記入として受け付ける', r.ev.gaps.some((g) => g.includes('sg1.md') && g.includes('空欄の欄があります(総費用の内訳)')), r.ev.gaps.join('\n'));
  reset();
}

// ================================================================ 9. リスク区分の下限と確定者(IMPL-0062。Q3・Q4)
{
  const W = workspace('u3');
  const { run, git, write, read, change } = W;
  git('reset', '-q', '--hard', 'base288');
  git('clean', '-qfd');
  git('switch', '-q', 'main');
  let ch = change({ kind: 'settings', summary: '区分の下限の規則を置く', settings: { riskFloor: { rules: [{ id: 'auth', paths: ['src/auth/**'], floor: 'R1', why: '認証・認可' }, { id: 'migrate', paths: ['db/migrations/**'], floor: 'R2', kinds: ['add', 'modify'], why: 'データの移行' }] } } });
  check('/process-change(settings)で区分の下限の規則を置ける(厳しくする向きは記名なしで即時)', ch.ok && JSON.parse(read('process.config.json')).riskFloor.rules.length === 2, ch.out);
  fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
  git('add', '-A');
  git('commit', '-q', '-m', 'chore: 区分の下限の規則 (#90)');
  git('tag', 'floor288');
  const body = (risk, extra = '', instr = NAMES[0]) => `## 検証方法と結果\n\nなし\n\n## 作成を指示した者\n\n${instr}\n\n## リスク区分\n\n${risk}\n${extra}\n## トレーラ\n\nSpec: setup\n`;
  const pr = (b) => {
    write('../pr-u3.json', JSON.stringify({ number: 91, title: 'feat', body: b, author: 'acct-1' }));
    const r = run('node', ['scripts/gate/check-pr.mjs', '--base', 'main', '--pr', '../pr-u3.json', '--json']);
    return { ...r, j: JSON.parse(r.out.slice(r.out.indexOf('{'))) };
  };
  git('switch', '-q', '-c', 'feat/auth');
  write('src/auth/login.js', 'export const login = () => true;\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'feat: login');
  let r = pr(body('R3'));
  check('区分の下限: src/auth/** を R3 と記載 → G-5 で失敗(下限 R1)', !r.ok && r.j.errors.some((e) => e.startsWith('区分の下限') && e.includes('下限 R1') && e.includes('auth')), r.j.errors.join('\n'));
  r = pr(body('R1'));
  check('確定者: R1 で「確定した者」が無い → 失敗', !r.ok && r.j.errors.some((e) => e.startsWith('リスク区分の確定者')), r.j.errors.join('\n'));
  r = pr(body('R1', `\n確定した者: ${NAMES[0]}\n`));
  check('確定者: 確定した者が作成を指示した者 → 失敗', !r.ok && r.j.errors.some((e) => e.includes('作成を指示した者である')), r.j.errors.join('\n'));
  r = pr(body('R1', '\n確定した者: Claude\n'));
  check('確定者: AI の名義 → 失敗', !r.ok && r.j.errors.some((e) => e.includes('AI の名義')), r.j.errors.join('\n'));
  r = pr(body('R1', `\n確定した者: ${NAMES[2]}\n`));
  check('確定者: 指示した者以外の名簿の人が確定 → 区分の検査は通る', !r.j.errors.some((e) => /区分の下限|確定者/.test(e)), r.j.errors.join('\n'));
  git('switch', '-q', 'main');
  git('switch', '-q', '-c', 'feat/mig');
  write('db/migrations/001.sql', 'create table x(id int);\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'feat: mig');
  r = pr(body('R3'));
  check('区分の下限: 変更の種類つきの規則(db/migrations の追加)→ 下限 R2', !r.ok && r.j.errors.some((e) => e.includes('下限 R2') && e.includes('migrate')), r.j.errors.join('\n'));
  git('switch', '-q', 'main');
  git('switch', '-q', '-c', 'feat/docs');
  write('docs/notes.md', '# メモ\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'docs: メモ');
  r = pr(body('R3'));
  check('区分の下限: 規則に当たらない変更は R3 で通る', !r.j.errors.some((e) => /区分の下限/.test(e)), r.j.errors.join('\n'));
  // 規則を変える PR は下限 R2、規則と製品のコードの同時変更は失敗
  git('switch', '-q', 'main');
  git('switch', '-q', '-c', 'chore/floor');
  ch = change({ kind: 'settings', summary: '規則を足す', settings: { riskFloor: { rules: [...JSON.parse(read('process.config.json')).riskFloor.rules, { id: 'pii', paths: ['src/pii/**'], floor: 'R1', why: '個人データ' }] } } });
  write('src/app.js', 'export const x = 1;\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'chore: 規則');
  r = pr(body('R3'));
  check('規則の変更: 下限 R2、製品のコードとの同時変更は失敗', !r.ok && r.j.errors.some((e) => e.includes('riskFloor の変更')) && r.j.errors.some((e) => e.includes('同じ PR で変わっています')), r.j.errors.join('\n'));
  // 規則を削る・下限を下げる変化点は、緩める向き(記名と理由を要する)
  git('switch', '-q', 'main');
  ch = change({ kind: 'settings', summary: '規則を削る', settings: { riskFloor: { rules: [{ id: 'auth', paths: ['src/auth/**'], floor: 'R2', why: '認証' }] } } });
  check('規則の下限を下げる・削る変化点は、記名が無ければ拒否(緩める向き)', !ch.ok && ch.out.includes('統制を緩める向き'), ch.out.slice(-600));
  git('switch', '-q', 'main');
  git('reset', '-q', '--hard', 'base288');
  git('clean', '-qfd');
}

// ================================================================ 10. 1名体制の確定者・AI の層の条件2〜5
{
  const { W, agg } = setup('u1', 1);
  const { run, git, write } = W;
  git('switch', '-q', '-c', 'feat/x');
  write('docs/notes.md', '# メモ\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'docs: メモ');
  write('../pr-u1.json', JSON.stringify({ number: 5, title: 'docs', body: '## 検証方法と結果\n\nなし\n\n## リスク区分\n\nR2\n\n## トレーラ\n\nSpec: setup\n', author: 'acct-1' }));
  const r = run('node', ['scripts/gate/check-pr.mjs', '--base', 'main', '--pr', '../pr-u1.json', '--json']);
  const j = JSON.parse(r.out.slice(r.out.indexOf('{')));
  check('1名体制: 確定者の無い R2 は失敗させず、確定していない区分として出す', !j.errors.some((e) => e.includes('確定者')) && j.notices.some((n) => n.includes('確定していないものとして扱い')), JSON.stringify(j.errors.concat(j.notices)));
  git('switch', '-q', 'main');
  // AI の層の条件2〜5(構成は /process-change だけが書くため、構成の写しを直接読む関数ではなく集約の値で見る)
  write('evidence/seeded-errors.json', JSON.stringify({ human: { seeded: 10, detected: 8, measuredAt: TODAY, method: '試験の固定値', blind: true }, ai: { seeded: 10, detected: 6, measuredAt: TODAY, method: '試験の固定値', blind: true } }));
  const ag = agg();
  check('AI の担い手の宣言が無い構成では、AI の層は「宣言なし」のまま(条件2〜5 は問わない)', String(ag.ev.assurance.detection.ai).includes('宣言なし'), String(ag.ev.assurance.detection.ai));
}

done();
