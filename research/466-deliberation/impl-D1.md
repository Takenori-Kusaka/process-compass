# 段 D1(template): S1 の承認をコア機能に触れる変更だけに掛ける — 実装の結果

- 日付: 2026-11-28。template のブランチ `d4-466`(段 C の e713818 の上に 2 コミット)。本体・参照は触っていない。push していない。ADR・Issue 番号・research への参照は template へ足していない

## 1. 変えた関数と要点(方式 β)

- `config.mjs` `approvalByCorePaths(config)`: 新設。G-6 適用・範囲 core-only・`review.requiredApprovals` が 0・CL0・規制業でない・承認者 1 名のときだけ真。`enforcedApprovalFindings` はこのとき要求を 0 とする
- `generate-profile.mjs`: S1・範囲 core-only・strict でない構成は、ルールセット `team-core`、`review.requiredApprovals` 0。`RULESET_RANK` に team-core(team の下)。PROFILE の表の「必須の承認数」に注記
- `.github/rulesets/team-core.json`: 新設。team.json と同じで承認数 0(PR 必須・古い承認の失効・必須チェック gate-g5 と gate-g5-base は残す)。README・スキル(process-init・process-change・G-6)・gate-g5-base.yml の注記を更新
- `check-pr.mjs` `approverFindings`: byPaths を足し、要求を「コア機能に触れる PR か未宣言なら counts.core、触れなければ 0」とする。検査8 の文に扱いを添え、`requireControlApproval`(gate-g5-base)かつ基底の構成が設定済みのときだけ、承認が足りない PR を error にする(pr-rules は警告のまま)
- `adoption-trial.mjs`: 期待する承認数 `want` は 0(記録の reviewerCount は承認者の数のまま)
- `aggregate-evidence.mjs`: 保証の開示の項目2 の「集約の数え方」の 2 行目を、この構成では §3 の文にする
- `material-attribution.mjs` `defaultBranchRulesetProblems`: 承認数 0 を問題に数える既存の検査から、team-core だけを「必須チェックに gate-g5-base があるとき」に限り除く(§6 の点 1)

## 2. 構成ごとの表(前 → 後)

| 構成 | ブランチ保護の必須の承認数 | gate-g5-base の挙動 |
| --- | --- | --- |
| S0(G-6 省略) | 0 → 0(ruleset なし) | 変更なし(承認を照らさない) |
| S1 範囲限定・標準品質 | 1(team)→ 0(team-core) | 前: 全 PR は保護が止める。後: 非コアは承認なしで通る。コア機能の PR は承認 1 名まで error、承認の後の再実行で通る。パス未宣言(当たる追跡ファイルが無い宣言を含む)は全 PR に 1 名 |
| S1 品質「高」 | 1 → 0 | 同上。コア機能と未宣言の PR は 2 名(coreReviewerCount) |
| S1 規制業(承認者 2 名) | 2(regulated) | 変更なし |
| S1 CL1 以上 | 1 以上 | 変更なし(範囲は all。team・safety・regulated のまま) |
| S2 | 1(team) | 変更なし |

## 3. 開示の文(保証の開示 項目2。新しい義務は足していない)

「ブランチ保護の必須の承認数は 0 で、承認はコア機能のパスに触れる PR にだけ、基底から読む判定(gate-g5-base)が必須にする(パスが未宣言なら全 PR。品質「高」ではコア機能に 2 名)。承認の後は gate-g5-base の最後の実行を再実行する。承認の取り下げでは再実行されないため、出荷の証跡の集約が最後の状態で照らす。事業ステージの宣言が実際の規模より低い(S2 の規模の組織が S1 と宣言し続ける)と、コア機能に触れない変更が取り込む前の独立の確認なしに入り、その件数が増える。機械ではステージの宣言の真偽を確かめられないため止められない(開示で受ける)」

## 4. 試験

- 足した: `test-control-approval.mjs`(+25: 構成の判定 6、S1 の非コア・コアで承認まで止まる・別人の承認で通る・本人/要約なし/取り下げは通らない・pr-rules は警告・未宣言と空振り宣言で全 PR・品質「高」2 名と非コア・S2・CL1(手書き 0 も)・規制業)/`test-roster-rules.mjs`(+11: 各構成の ruleset・承認数、team-core.json の同一性、enforcedApprovalFindings)/`test-material-attribution.mjs`(+3)
- 決定の置き換えに伴う期待の変更: `test-tailoring-declaration.mjs`(項目2 の理由の文: 承認数がパスで分けられない → 0 で gate-g5-base が掛ける)/`test-loosening-decider.mjs`(D-0 の行の種類「厳しくする 4 → 3」: S1 は承認数 0 のままで 0 → 1 の行が出ない)/`test-base-judge-workflow.mjs`(ルールセット一覧に team-core)
- 段 A の穴の塞ぎに伴う fixture の直し(別コミット): `test-roster-conditions.mjs`(判定記録を足すコミットを判定者の名義にする。制限の行の抜き出しを行頭で絞る)。段 A 以降に落ちていた 2 場面(c8d4e27 では通る)の原因は段 A の変更
- 流した結果(Windows・node 26。全量は流していない): test-check-pr 372 ok・NG 0/control-approval 73/roster-rules 232/roster-conditions 77/material-attribution 61/tailoring-declaration 16/loosening-decider 通過/base-judge 133/roster 系 aggregate-wiring 65・drift 46・records 226・assurance-period 31・check-delegation 83・env-findings 23・trial-checklist 28
- **test-adoption**: Windows 123 通過。WSL(node 22・24・26)は 4〜5 件目で `git merge -X theirs` の add/add 衝突で停止する。**c8d4e27 の素の版でも同じ**(WSL の git 2.43 の環境差。段 A〜C・この段に依らない)
- **test-init-g5**: WSL node 26・24 で 207/208。落ちる 1 件は「テストが 0 件の段階で npm test が通る」(`node --test` の glob が 0 件でエラー。node 24 以降の挙動)。段 A〜C・この段に依らない(環境)

## 5. 段 F1 で実機で確かめる項目(動くとは書いていない。template の文に注記は置いていない)

1. ルールセット team-core(`required_approving_review_count: 0` + `require_last_push_approval: true` + 必須チェック gate-g5・gate-g5-base)を GitHub が受け付けるか
2. 非コアの PR が承認なしでマージできるか(承認数 0 と必須の gate-g5-base 成功の組み合わせ)
3. コア機能の PR が gate-g5-base の失敗で止まり、別人の承認(挙動要約つき)の後の再実行で通るか。承認後に push すると承認が失効して再び止まるか
4. パス未宣言で全 PR が止まること、品質「高」で 2 名を照らすこと(PR_REVIEWS の取得を含む)
5. 動かなければ 2 版の案 D(S1 も全 PR に承認 1・team)へ戻す: 2 コミットを戻せばよい(`approvalByCorePaths` 以降の分岐は 0 を前提としているため、generate-profile の ruleset の 3 行を team に戻すだけでも足りる)

## 6. 議長が決める点

1. **IMPL-0416(`defaultBranchRulesetProblems`)との突合**: 既存の検査は「PR を課すルールセットで承認数 0 を置かない(パス条件で足し戻す構成を既定にしない)」とする。方式 β はまさにこの構成を既定にする。試験を通すため team-core に限る例外(gate-g5-base が必須チェックにあるときだけ)を足した。標準側の IMPL-0416 の文・根拠と矛盾するため、E1 で標準の文を直すか、例外を採らないか(案 D)を決めてほしい
2. `team-core` という名前と、ruleset を null にせず新ファイルにした点(null だと verify-gate-contract・集約が G-6 有効で ruleset 未指定を問題にするため)
3. 規制業・承認者 2 名の S1 は現行どおり(承認 2・regulated)。所有者の決定の対象外と読んだ

## 7. 段 E1 へ渡すこと

- 表の値: §2。「CL0・標準以上の品質・承認者 1 名」の条件を表に書く。S1 の R1(非コア)は例外承認(集約が照らす)で、取り込む前の承認は要らない
- IMPL(IMPL-0471 に当たる開示)の note の実態: 承認数 0 は構成の値で、承認はパスで掛ける。再実行が要る・取り下げでは再実行されない・ステージ宣言の真偽は機械で閉じない(manual)。実機の確認(§5)が済むまでは state=undelivered
- 本文の `5.4.2` 周りと、第8章 軸B の表の S1 の行に「ブランチ保護の承認数 0」の記述の更新が要る(「承認数はパスで分けられない」は偽になった)。IMPL-0416 の文(§6 点 1)

## 8. template のコミット

- 42fc8ac test(records): 判定記録を足すコミットの名義を判定者に揃える
- 40bf76e feat(review): S1 の承認をコア機能に触れる変更だけに掛ける
- bundle: `tmp/466-tpl-D1-2.bundle`(c8d4e27..d4-466。D1-1 は作成の失敗で無く、-2 が 2 コミットを含む)
