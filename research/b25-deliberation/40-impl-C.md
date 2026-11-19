# 束 B25 単位 C の実装記録(IMPL-0772・0651・0709・0900)

template のコミット(ブランチ b25。起点 origin/main = 6711635。push していない)と bundle:

| コミット | 内容 | bundle |
| --- | --- | --- |
| f680119 | 0772・0651(契約検査・構成書の照合) | tmp/bundles/template-b25-C-01.bundle |
| a015167 | 0709(check-pr) | tmp/bundles/template-b25-C-02.bundle |
| c6d928e | 0900(G-7 の手引き)と README の移行の注意 | tmp/bundles/template-b25-C-03.bundle |

## IMPL-0772(delivered / machine / target=config-deviations)

- 変えた所: `scripts/init/generate-profile.mjs` に `derivedGateStates(answers)`(buildConfig と同じ導出。g4・g5 の省略不可を含む)。`scripts/gate/verify-gate-contract.mjs` の 2.5 節の直後に照合を追加(unmet[] か deviations[] の宣言が無い「導出より弱い状態」を失敗にする)。序列は required > simplified > omitted = merged-into-gN。unmet は既存の整合の検査が扱うので飛ばす
- 試験: `test-adoption.mjs` に 5 場面(導出どおり ok / simplified 宣言なし ng / omitted 宣言なし ng / deviations あり ok / 導出と同じ ok)
- 結果: 持ち込みの試験 74 件が期待と一致
- 外して落ちる確認: 照合を `weaker = false` にすると ng の 2 場面が NG になった(一時の写しで確認)
- 新しいマーク行: `IMPL-0772 target=config-deviations state=delivered check=machine test=template/scripts/gate/test-adoption.mjs`。note は「確かめる者: プロセス内部監査(パラメータの弱めと宣言の理由の妥当性)」を含む

## IMPL-0651(delivered / machine / target=process-profile)

- 変えた所: `generate-profile.mjs` に `profileMdProblems(config, text)`(renderProfileMd を構成から再生成して全文を正規化(CRLF・前後空白)のうえ比較。最初の食い違いの行を出す)。`check-process-rules.mjs` が CLAUDE.md の区間の検査の後に呼ぶ。未設定の構成は照らさない
- 非決定の値: 生成日時は `config.generatedAt` から出るため、区間から外す必要は無かった。全体を比較している(ロール・判定ゲート・引き渡し先の行に絞っていない)。1名・3名の構成の通しで一致を確認した
- 試験: `test-init-g5.mjs` に 4 場面(生成直後 ok / ロールの表を書き換え ng / D-0 の版の追随が古い ng / 戻して ok)
- 結果: 初期化の試験 180 件が期待と一致(1名・3名の両方)。test-edition-end 87 件・test-roster-rules 213 件・test-aggregate-wiring 61 件・test-delegation-wiring 27 件・test-loosening-decider・test-name-confirmation-timing・test-claude-md-resident も通過
- 外して落ちる確認: `profileMdProblems` を常に空にすると ng の 2 場面が 1名・3名とも NG になった
- 新しいマーク行: `IMPL-0651 target=process-profile state=delivered check=machine test=template/scripts/gate/test-init-g5.mjs`

## IMPL-0709(delivered / machine / target=pr-checks)

- 変えた所: `scripts/gate/check-pr.mjs` に `baselineShrinkProblems`(answers.json の cases[].id の削除・ファイル削除を検出。同じ PR の `docs/exit-rehearsal.json` の `baselineScope.at` が基底より後の実在の日、`approvedBy` が記入済みでなければ問題)。analyzePr の 7c2 で errors に出す。`isRealDay` を config.mjs から取り込み
- 試験: `test-check-pr.mjs` に 5 場面(承認なし ng / 承認日同じ ng / ファイルごと削除 ng / 承認を改めた ok / 事例を足す ok)
- 結果: PR の検査の試験 270 場面が期待と一致
- 外して落ちる確認: 関数を空にすると ng の 3 場面が NG になった
- 新しいマーク行: `IMPL-0709 target=pr-checks state=delivered check=machine test=template/scripts/gate/test-check-pr.mjs`(note に「識別の削除だけ。中身の弱めは確かめない。確かめる者: 技術判断者」)

## IMPL-0900(delivered / manual / target=gate-skill-g7)

- 変えた所: `template/.claude/skills/gate/gates/G-7.md` の「判定記録の書き方」に 1 項目を追加(判定者本人が支援への関与を確かめる。関与していれば他チーム・外部へ移すか、様式 04 の節「支援と判定の兼務」を書く。兼務を独立性の確保として書かない)。`src/data/impl-targets.yaml` に `gate-skill-g7` を追加(`gate-skill-g6` に倣う)
- 新しいマーク行: `IMPL-0900 target=gate-skill-g7 state=delivered check=manual`。確かめる者は「当該の出荷判定の判定者本人と、適合性監査の抜き取り(手引きを読んだ。実行して確かめていない)」
- 試験: 無し(manual)

## 本体の確認

`npm run impl:write` 後に `npm run lint:impl` が通った(実装マーク 1017 件、降りていない規定 123 件、エラー無し)。台帳 `implementation-ledger.md` が再生成されて差分に出ている。本体はコミットしていない(議長がコミットする)。変えた本体のファイル: tailoring-guide.md(0772 の行)、roles-responsibilities.md(0900・0651・0709 の行)、impl-targets.yaml、implementation-ledger.md(再生成)。

## 裁定どおりに作れなかった点

1. 0772 の「導出の版は構成が記録した KB の版で行う」: 構成は知識ベースの版を記録していない(`template.commit` はテンプレートのコミットで、知識ベースの内容を再現できない)。取り込んだテンプレートの知識ベースで導出する。知識ベースの更新で導出が強まった案件は、再導出か宣言まで止まる。note と README に開示した
2. 0772 で omitted・merged-into-gN の宣言は表せない: deviations は実施(required・simplified)を前提とするため、導出より弱い omitted は宣言の経路が無く常に失敗する。禁止事項6 を守る向きで、緩めない
3. 0709: `id` を持たない事例の削除は検出できない(決定可能な識別が無い)。承認した者が技術判断者本人かはここでは見ず、集約(org-assurance)に委ねる。note に開示した

## 移行の注意

template の README「テンプレート更新時の既存案件への影響と運用ルール」に §14 を追加した(CHANGELOG は template に無い)。取り込み後に止まりうる構成: 導出より弱いゲートを宣言なしで持つ案件、PROCESS-PROFILE.md を手で編集した案件・テンプレート更新で生成内容が変わった案件(要 `/process-change` の再生成)。

## 未確認の点

- 実際の GitHub 上の PR での 0709 の動作(フィクスチャの git 履歴の試験のみ)
- 回帰の全量は流していない(議長の push 前の全量に委ねる)。test-init-g5 は node 26(WSL)で、test-adoption・test-check-pr は git archive の写しで流した
- 0651 の全文比較は、テンプレートの更新で renderProfileMd の出力が変わるたびに採用者の再生成を要する(README に開示)。ロール・ゲート・引き渡し先の行だけに絞る案は、非決定の値が無かったため採らなかった
- template の `scripts/vendor/tailoring-kb.json` の M(CRLF の差)はコミットに入れていない
