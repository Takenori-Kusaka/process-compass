# 実装の記録: #348・#340 事象2・ADR の新設(decision.md §7.1 の手順3〜5)

実装日: 2026-11-12。#350・#349 は implementation-350-349.md。

## 変えた所在

### #348 手戻り率の算出(template コミット 054bd3f・c2ccacc)
- `scripts/gate/config.mjs`: `reworkBaselineAt`・`reworkBaselineInfo`・`reworkBaselineProblems`(構成の欄 `reworkBaseline = { percent, history[] }`。0〜100・既定値なし・効力日は観測の窓と同じ)。`configIntegrityProblems` に接続
- `scripts/gate/autonomy.mjs`: `readReworkRecords`(第1親の履歴のトレーラ。末尾の段落だけを `check-pr.mjs` の `lastParagraph` で読む。`specs/*/plan.md` の履歴の全版から「やり直し」を読む)、`planReworkTasks`、`specTrailersOf`。`autonomyState` に種別ごとの `rework`(母数・分子の内訳・基準値・状態)と停止(下限 30 件・基準値超過で downgrade)。評価の日 m では prevDay(m) 以前の記録だけで数える。`reworkText` を `/pit` の注記に出す。`REWORK_UNDELIVERED` は `REWORK_UNCOUNTED`(数えていない残り)へ改めた
- `scripts/gate/aggregate-evidence.mjs`: 保証の開示の項目3 に `reworkText` を出す
- `scripts/init/generate-profile.mjs`: settings の `reworkBaseline`(0〜100・percent 以外の欄を拒否・変えるときは向きを問わず記名と理由・AI 名義は拒否)、履歴への追記と再生成での保持、差分の向き(上げる・外す = 緩める)、D-0 の表の手戻り率の欄の文
- `/process-change` の `kinds/settings.md`・`reference/input.md`、`templates/07-implementation-plan.md`・`templates/00-d0-governance.md` の文言
- 試験: `test-check-delegation.mjs`(IMPL-0517 の目印つき。実 git の試験を含む)、`test-loosening-decider.mjs`

### 標準(本体)
- `human-ai-boundary.md` 5.4.6: IMPL-0291 を分割(新 IMPL-0517 delivered、IMPL-0291 は (b) 判定不能・未設定で止めるかのみ undelivered/scheduled、新 IMPL-0518 adopter)。IMPL-0287・0288 の note に手戻り率の表示を足した。分子の定義(:194)は変えていない
- `gate-criteria.md`: IMPL-0516 の note に手戻り率を足した。IMPL-0268 の note を IMPL-0517 に合わせ、`issue=441` へ付け替えた
- `deliverable-templates.md`、`phase5-implementation/template-repository.md`(2か所): 手戻り率の算出と残りの書き方
- `src/data/impl-inventory.yaml`: IMPL-0517・0518・0519 の登録と note
- `roles-responsibilities.md`: IMPL-0272 の note に強制の範囲、新 IMPL-0519(undelivered・adopter・decision=ADR-0129)
- `assurance-case.md`: 3.12.10 のロックの外の反復が降りていない旨を1行
- ADR-0129 を新設(`adr/0129-second-category-window-baseline-and-rework-rate-derivation.md`)
- `community/implementation-ledger.md` を `impl:write` で再生成。EV は足していない(EV-0258 は未使用)

### #340 事象2
標準だけ(上記のとおり)。template の変更なし。`template-repository.md:984` は既に載っているため変更なし。

## 試験と結果(関係するものだけ)
- `node template/scripts/gate/test-check-delegation.mjs`: 68 場面と付随の確認が全通過(NG 0)。手戻り率の追加 22 件前後(トレーラ 2 回・計画表の履歴・和の重複排除・母数 29 判定不能・未設定・超過・効力日・評価の日より後の記録・実 git)
- `node template/scripts/gate/test-loosening-decider.mjs`: 全通過(reworkBaseline の入口 4 件を追加)
- `npm run impl:write`・`evidence:write`・`check-impl.mjs`・`lint:refs`・`lint:scope`・`lint:provisions`・`lint:registry`・`lint:tone`・`lint:dekimasu`・`lint:citations`・`lint:stage-table`・`lint:skills`・`check-template-drift`・`check-template-fields`: exit 0。textlint(変えた md と ADR-0129): 指摘なし
- 全量の回帰・全量の `npm run check`・`lint:text`(全体の textlint)は流していない

## 仕様との差・申し送り
1. **IMPL 番号**: 0517(手戻り率の算出)・0518(書かれない再作成。adopter)・0519(ロックの外の反復。adopter)。ADR は 0128
2. **算出の時点**: 評価の日 m の分子は prevDay(m) 以前の記録で数える(現在の状態の表示も月初の評価の日に揃える)。月の途中の再作成は次の月の評価に入る。decision §4.2 は「毎月、差し戻し率と同じ評価の日に評価する」とのみ書き、記録の切り方は未規定だったため、遡らない原則(§7.4-2)に従って決めた
3. **既存の試験の期待を2か所書き換えた**: 「手戻り率は降りていない/集計していない」を確かめていた文言(IMPL-0291 の降りた部分そのもの)と、D-0 の表の手戻り率の欄の文言。fixture が固定する過去の決定(窓 2 など)は書き換えていない
4. **fixture の records に `rework` が無いとき**は「読めない」と表示し、止めない(差し戻し率の側が履歴の不在を止める)。`readAutonomyRecords` は種別がある構成で常に `rework` を読む
5. **トレーラの読み方**は `check-pr.mjs` の `lastParagraph` を import した(`next.mjs` の `doneTasks` は本文の全行を読む別の実装で、decision の「next.mjs と同じ形」と食い違う。末尾の段落だけを読む check-pr 側に合わせた。next.mjs の側の食い違いは本束で直していない)。循環 import は import で確かめた
6. **トレーラの再取り込みの数え方**: 第1親の履歴の全体(判定の日まで)で同じタスクを指すコミットが 2 つ以上。種別の範囲は母数(窓の中の変更)側でだけ見る。decision §4.2 の文言どおり
7. **トレーラ側で再作成があるのに計画表の履歴に「やり直し」が無いタスクの件数**(§4.5 案D の任意表示)は実装していない
8. **ADR-0081:149** の「手戻り率は降りていない」は採用済み ADR のため書き換えず、ADR-0129 の「ステータス」の表で部分的に改まると記録した
9. **template の作業ツリーは CRLF**。パッチは LF 正規化して当て、CRLF で書き戻した。bundle は `tmp/bundles/template-340-350-04.bundle`・`-05.bundle`(05 が最新で 04 を含む)
10. 独立の突合(§7.4)は未実施。次の段で、表示と実態(`reworkText` が数えていない残りを省いていないか)、IMPL-0268・0291 の note、効力日の遡りを確かめる
