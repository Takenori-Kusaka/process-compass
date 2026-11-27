# #467 準拠テンプレート側の実装の記録(2026-11-27。担当: template の実装)

- 入力: `ruling.md`(追補が最終。追加の指示で Y-6 を足し、新しい文に ADR 番号・research への参照を書かない制約)、`impl-precheck.md`
- 場所: template の中のブランチ `d4-467`(基点 af15a3b)。push していない。本体の側は変えていない(submodule の参照が進んだ表示だけが出る)。退避: `tmp/d4-467-template.bundle`(コミットのたびに更新)
- 実装した件: Y-2・Y-2b・Y-3・Y-5・Y-1 項目5・Y-4・Y-6・M-2・M-3・M-5・M-6・M-10・G-6(13 件)。採らない M-7・B-13・G-1 は触っていない。Y-7 は触っていない

## 件ごと

| 件 | 変えたファイルと要点 |
| --- | --- |
| Y-2 | `templates/01-feature-spec.md`: frontmatter の `approved_by`・`approved_at` と「## 承認」節を消した。`status:` は残した |
| Y-2b | `templates/06-project-brief.md` と、利用の型 3 つ `profiles/{internal,oss,revenue}/templates/06-project-brief.md`(裁定・確認の記録に無かった所在)の「承認(G-1)」節を消した |
| Y-3 | `templates/07-implementation-plan.md`: 節見出し「承認(G-4)」は残し、表を「承認の記録の所在」の 1 行にした |
| Y-5 | `.github/PULL_REQUEST_TEMPLATE.md` の項目 1〜3 を消し、観点を `.claude/skills/implement/SKILL.md` 手順3 に「3 つを自分で確かめる。PR の欄には書かない」として移した。開示: `scripts/init/generate-profile.mjs` の G-6 省略・未達の注記へ「G-6 を経ない変更には、独立した人の確認が無い。PR の自己チェックは、確かめた証拠に数えない」を足した |
| Y-1 項目5 | PR 様式の「閾値・除外設定を触っていない」を消した |
| Y-4 | PR 様式の「AI 関与範囲」は見出しを残し、人の 2 欄を「正本はトレーラ `Co-Authored-By`・`Agent-Run`(導出は未実装)」の 1 行にした。`.github/workflows/ship-evidence.yml` の生成文も同じ形にした |
| Y-6 | `implement/SKILL.md` 手順3: 段階3 は「比べる。生成結果を採った場合は作業上の選択の理由(退けた案)として残す(第5章 5.5.1)」にした。相違の有無の記録の義務を外した。段階1 の記述と「段階1 を経ずに段階2 へ進まない」は変えていない。段階3 の記録を読む・求める他の所在(様式・検査・試験)は template に無かった(grep「相違」「段階3」) |
| M-2 | `.claude/skills/gate/gates/G-1.md`: 出力の本文を、実行したコマンドと実行日時を添えて貼る形にした(草案を起こす文脈が行う。判定は人) |
| M-3 | `templates/10-assumption-ledger.md`: 6 行の「最終観測日」「観測した事象」を「(起案)立ち上げの時点。観測の期間なし」で起こし、注意の文を足した。充足状態は空のまま。`artifacts/10-assumption-ledger.md` の手順2 と `next.mjs` の案内文を合わせた |
| M-5 | `templates/07-implementation-plan.md`: 状態の列は残し、人が書くのは「やり直し」だけ、「着手」「完了」は `/pit` が出すと書いた。`next.mjs`: ブランチ名の前方一致を区切りつきにした(`taskBranchMatches`)。「不明」を足した(下記) |
| M-6 | `process-init/SKILL.md`: 数値 ID はスキルがログイン名から引いて示し、人が確かめる。改名・乗っ取りを受けていないかを人が確かめる一文を添えた。名義の種別の選択は人に残した |
| M-10 | D-0 の「従う本標準の版」を任意の生成区間 `d0-edition` にした(`generate-profile.mjs` の `D0_OPTIONAL_SECTIONS`・`renderD0Section`・`d0OptionalSectionProblems`、`check-d0.mjs`、`templates/00-d0-governance.md`)。出所は `standard.edition`。目印の無い旧い D-0 は失敗にせず注意。「層1 の版」の行は人が書く行のまま。`next.mjs` の案内文を合わせた |
| G-6 | `/process-change` の `accountable` に `seatsByPerson`(人ごとの席の列挙)を足した。`generate-profile.mjs` が検証の前に `seats.<席>.accountable` へ展開し、席ごとの入力との食い違い・同じ席を複数の人に書く・種別違いは拒否する。`reference/input.md`・`kinds/accountable.md` に書いた。構成・D-0 の席の表・兼務の開示は展開後から生成される |

## M-5「不明」の検出できる範囲

- 出す条件: 計画の状態の列が「完了」で、既定ブランチにトレーラ `Spec: F-NNN / Task-N` を持つコミットが無いタスク。段階は `取り込みの状態が不明(Task-N)`(kind: undetermined)
- 検出できないもの: 状態の列に「完了」が書かれていない、トレーラ無しの取り込み。未取り込みと区別する材料(squash の本文に識別子が無い)が git の履歴に無い。様式の注記に「表の状態が『完了』のときに限り」と書いた
- よって「トレーラ無しの取り込みは必ず不明と出す」は実装できていない。一部だけの実装(旧い計画の記入を拾う)。ブランチが merge 済みかで見る案は、作ったばかりで差分の無いブランチを誤って拾うため採らなかった

## 試験(template の中。数は関係する試験のみ。回帰の全量は流していない)

| 試験 | 結果 |
| --- | --- |
| test-spec-lint / test-plan-trace / test-next-records / test-roster-rules / test-roster-ids / test-roster-conditions / test-init-g5 | 全通過(plan-trace は 39 件。4 件を足した) |
| test-loosening-decider | 全通過(席の列挙の場面 5 件を足した) |
| test-edition-end | 103 件通過(生成区間 4 件を足した。実行に約 8 分) |
| test-brief-thresholds / test-brief-estimates / test-ship-evidence-steps / test-handover-items | 通過 |
| test-check-pr / test-spec-recheck | 実行が長い(10 分超)。結果は末尾の「追記」 |

- 期待値を直した試験: 無し(決定に伴って落ちた試験は無かった)。regress(`scripts/regress/`)は本体の側にあり、grep では様式の承認節・状態の文言を固定していなかった(様式を写す行は表の行だけ)。全量は別の担当が流す
- 時計に依る試験の偽の失敗: 出なかった
- 動かせなかった範囲: Windows の Git Bash の node 26 で上の試験は動いた。本体の `npm run` 系(lint:impl・test:fields)は本体の担当

## 見送り・裁定と違う形にした点

- M-5 の「不明」: 上のとおり部分実装
- M-10: 版の一致の検査(構成と D-0 の行の値の一致)は新しく足していない。生成区間にしたため、区間の値が構成と違えば `check-d0` が問題にする(既存の任意の区間の仕組み)
- Y-4: 導出は未実装のまま(裁定どおり)。実装マークは本体の側

## 本体の側の担当へ渡すこと

- `src/data/template-fields.yaml`: t1 の extra「承認」(`kind: structure`)、t6 の extra「承認(G-1)」を消す。t7 の「承認(G-4)」は見出しを残したので行は残し、`reason` の「判定者・判定日」の語だけ「承認の記録の所在の 1 行」に直す。標準の様式 6 の利用の型の側の検査があれば、profiles の 06 も同じ
- `pr-workflow.md`(例の PR の AI 関与範囲、70・104・115 行付近): 「トレーラが正本」の 1 行に合わせ、導出の実装マーク(`state=undelivered`)を足す。`impl-targets.yaml` の pr-template の description に降ろし先を足す。PR 様式のチェックリスト項目 1〜3・5 を挙げた所は直す
- 第4章「実装作業における順序」と IMPL-0819: 段階3 の記録の義務を外す(Y-6)。template の `implement/SKILL.md` の文と合わせる(段階1 は残す)
- impl の note: G-1.md の M-2、process-init の M-6、`d0-edition` の生成区間(M-10)、`seatsByPerson`(G-6)、`taskBranchMatches`・`unknownDoneTasks`(M-5)を降ろし先にする規定があれば note を合わせる。`npm run impl:write`・`evidence:write`・`scope:write` で台帳を再生成する
- kb の再生成(`npm run template:kb`): 規則データは変えていないので不要の見込み。ただし `generate-profile.mjs` の注記の文を変えたので、本体側の複製との乖離検査(`npm run check`)で確かめる
- 採用者の既存の D-0・計画への影響: 旧い D-0 は目印が無くても落ちない(注意)。既存の PR 様式・様式 01/06/07 の承認欄を持つ採用者は、そのまま使える(読む機構が無い)

## template のコミット(ブランチ d4-467)

- a2d4f79 仕様・企画書・計画の承認の写しの欄をやめる(Y-2・Y-2b・Y-3)
- 93ed66c PR の自己チェックと AI 関与範囲の人の欄をやめ、実装の方針の相違の記録の義務を外す(Y-5・Y-1・Y-4・Y-6)
- 4bdccf8 G-1 の出力の貼り方、AI の担い手の識別子の引き当て、席の責任者の人ごとの入力(M-2・M-6・G-6)
- 7ac9da1 前提の台帳の初期値とタスク状態の導出(M-3・M-5)
- 5050756 D-0 の従う本標準の版を構成から生成する区間にする(M-10)
- e68d92b 利用の型の企画書から承認の写しの節をやめる(Y-2b の追補)

追記: test-check-pr(exit 0)・test-spec-recheck(103 件)も通過した。
