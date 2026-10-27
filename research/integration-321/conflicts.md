# #321 との統合: 内容の衝突と解決

work/289〜work/346 を `origin/main`(#321 と準拠テンプレートの #54・#58・#59 を含む)へ載せ替えたときの、内容の衝突と解決の記録です。生成物(実装マーク・根拠水準・適用範囲の台帳、`integrated.yaml`、知識ベースの複製)は手で併合せず、各コミットで再生成しました。`template` の gitlink は、書き換えた後の準拠テンプレートのコミットへ写しました。

方針は、両側の振る舞いを残すことです。テキストの衝突(併合の道具が示した衝突)の範囲では、両側の規定が矛盾する箇所は見つかりませんでした。テキストの衝突を生まない意味の衝突(別の行・節・ファイルに書かれた規定どうしの食い違い)は、この記録の範囲の外です。独立の突合 `crosscheck.md` が F-1〜F-6 などを挙げ、`decision.md` の裁定で直しました。ただし、統合のために作業者(AI)が判断した箇所があり、末尾の「人の確認を要する判断」に挙げます。

## 準拠テンプレート(`template/`)

### #289 判断記録の状態

- `scripts/gate/aggregate-evidence.mjs`(要約の JSON): main は `recordPrs` を足し、stack は `adrs` を `decisions {counts, problems}` に替えた。解決: main の `recordPrs` と stack の `decisions` を残す(`adrs` は stack に従って外す)
- 同(報告の行): main は判定記録の行(写し・G-6 の承認・ブランチの形)を広げ、stack は ADR の件数の行を判断記録の状態ごとの件数と不一致の行に替えた。解決: main の判定記録の行 + stack の2行

### #291 G-4 基準6・G-2 基準6・G-4 基準7

- `scripts/gate/next.mjs`: main は G-4 の待ちに記録用ブランチの `records` を渡し(`gateWait(config, 'g4', f, {}, records)`、#54)、stack は G-4 の待ちを明確化の段と `withG4Material(...)` で包んだ。解決: stack の構造に main の引数を渡す

### #294 基準値を既定ブランチから読む

- `scripts/gate/test-check-pr.mjs`: 両側が末尾に試験を足した(main: 変更要求の本文の形、stack: 積み重ねた PR の基準値)。解決: 両方を残す(main が先)

### #296 カバレッジの範囲・承認の失効・自己修正

- `aggregate-evidence.mjs` の `PR_FIELDS`: main は `statusCheckRollup` を読めないときの `PR_FIELDS_NO_ROLLUP` を導き、stack は `headRefOid` を足した。解決: main の構造に `headRefOid` を足す(代替の一覧にも入る)
- 同(PR の繰り返し): main は承認レビューの写しを中心に組み直し(`d = api ?? prRecordFromCopy(copy)` など)、stack は `headOid` を `independentConfirmation`・`lastReviewStates` へ渡した(マージした head への承認だけを数える)。解決: main の繰り返しに `headOid` を足す。gh の記録があれば `api.headRefOid`、無ければ写しの head(`headOfCopy`)
- 統合の修正(`scripts/gate/config.mjs` の `approvalBinding`): main の `reviewsOfCopy` は `commitId` を出すため、`review.commitId` も読む。これが無いと写しから起こした承認がすべて版を確かめられないものになり、数えられない。**振る舞いの注記**: `commit_id` の無い写しの承認は、main では数えられ、統合後は数えない。これは stack #296 の規則(G-6: 確かめられない版への承認は数えない)である
- `developerApproved(reviews, headOid)`: 両側の変更を合成
- `RECORD_PATHS`: main はこの一覧を前へ移して `docs/records/**` を足し、stack は `docs/self-heal-log.tsv`(後に `docs/self-heal/**`)を足した。解決: 古い位置は main に従って消し、stack の項目を main の移した一覧へ足す
- 報告の行: stack はカバレッジの行(範囲の文)、main は判定記録の行を変えた。解決: 両方
- `next.mjs`・`adoption-trial.mjs` の import: 両側の和

### #311 AI自律レベル

- `aggregate-evidence.mjs`: 両側が同じ場所に塊を足した(main: 項目1 の `recordsDisclosure`、stack: `autonomy`)。保証の開示のオブジェクトの鍵も同じ(`records` / `autonomy`)。解決: 両方

### #315 持ち込みの事前点検・env-check の4値

- `adoption-trial.mjs`: 冒頭の注記(stack の4値の説明 + main の記録用ブランチの所見の1文)、記録の節3(stack の4値の表示 + main の所見の行)、`latestPr`(main の宣言 + stack の `noRepo()`)、`allOk`(stack の「確認済みまたは対象外」+ main の `findings`)、記録の欄(main の `findings` と stack の `integrationId`、`note` は stack の文 + main の所見の1文)。いずれも両方を残す
- `aggregate-evidence.mjs`: main の `RECORD_PATHS` などの移動と、stack の `preInitDetail = { total }`(件数だけ)の両方。env-controls の行は stack の4値の文 + main の所見の行
- `org-assurance.mjs`: 両側が同じ場所に export を足した(main: `ENV_CHECK_FINDINGS` など、stack: `ENV_STATUS_TEXT` など)。両方を残し、継ぎ目の `}` と `/**` を戻した。`readEnvCheck` の代替は stack の `reason` と main の `findings`・`findingsText` の両方
- 統合の修正コミット(#315 の後): 事前点検の既知のワークフローに main の `record-copy.yml` を足し、期待する `.gitignore` の行を main の変更に合わせて `/evidence/` にし、main の所見の試験の固定値に #315 の項目の識別の鍵(`protected`・`path`・`blobSha`)を足した

### #314 の規約への対応(統合の修正コミット)

- `scripts/gate/test-records.mjs`: main の IMPL-0129(commit_id とマージ時の head の一致)を check=machine のまま保つため、「head の一致」「head の不一致」に違反と適合の目印(`IMPL-0129:ok`・`IMPL-0129:ng`)を付けた。試験の中身は変えない

### #316 裁定の反映

- `G-6.md`・`process-init/SKILL.md`・`README.md`: main は #54 の文(承認レビューの写し、CODEOWNERS の案、SG の行の記録用ブランチの注記)を足し、stack は語を改めた(5.8.5 の禁止事項の番号、「逸脱・列挙に無い離脱」)。解決: main の文に stack の語の変更を当てる

### #317 委託

- `.github/CODEOWNERS`: stack は強制層の節を書き換え(所有者、パスの追加、委託の同意の注記)、main は判定記録の置き場の節を足した。解決: stack の節、続けて main の節
- `next.mjs`: stack は `computeNext()` の前に `outsourcingReceiverNote()` を足し、main は `computeNext` の引数(`{fetch, network}`)と結果の欄(`records`)を変えた。解決: stack の関数、続けて main の `computeNext`

### #318 組織上の距離の段

- `.claude/skills/gate/gates/G-6.md`: main は規制業の行(承認レビューを機械が出す欄の出所とする)と安全性の記録の所在(`records/gates/`)を改め、stack は CL2 の評価者の行(組織上の距離の段)を改めた。各側が別の行を変えたため、行ごとに取った(main の1行目と3行目、stack の2行目)
- 作業の訂正: 最初の解決で衝突の目印を含むままコミットしたため、#318 の2コミットを行ごとの解決で作り直した。書き換えた後のどのコミットにも目印は残っていない

### #346 env-check の配備の統制

- `README.md`・`adoption-trial.mjs` の冒頭: stack の配備の事実の説明 + main の所見の1文
- `adoption-trial.mjs` の本体: stack が項目4〜6(`workflowPermissions`・`actionsApproval`・`environments`)を足し、main は所見の計算を「4.」の注記で足していた。stack の項目を先に置き、main の注記の番号を「7.」へ改めた(注記だけ)。§8 の Environment の項目の書き換えも、stack の塊 + main の所見の行
- 統合の修正コミット(#346 の後): main の所見の試験(`test-env-findings.mjs`)の確認済みの固定値に、#346 の3項目が要する識別の鍵を足した。判定の規則は変えない

## 本リポジトリ

### #289

- `src/data/impl-targets.yaml`: 両側が降ろし先を足した(main: `rulesets`、stack: `agent-settings` ほか)。両方
- `src/data/template-fields.yaml`: 両側が欄を足した(main: 機械が出す欄の提出日時・非同期コメントの期間、stack: G-3 の判定した判断記録)。両方

### #293 リポジトリ運営(CI・配布)

- `.github/workflows/publish-standard.yml`: stack はこのワークフローを `ci.yml` のジョブへ畳んで消し、main は Dependabot で action の版を上げていた(変更と削除の衝突)。解決: stack に従って消す。main の版の引き上げ(checkout・setup-node を v7 へ)は、stack の `ci.yml` の配布のジョブが既に同じ版を使っている。作業の訂正: 載せ替えの途中で一度 main の版を残してしまったため、#293 の最初のコミットから消し直した

### #294 確定した版の受け直し

- `phase5-implementation/qms-document-control.md`(保管期間の行): main は「規程の対象に、様式の判定記録と、レビューの写しを含める」を足し、stack は行を「保管期間の値は…到達できなければならない。CI 基盤の既定の保持を保管とみなさない…」へ書き換えた。解決: stack の文に main の文を挿入

### #296 カバレッジの範囲・承認の失効

- `phase4-process-design/adoption-guide.md`(要件 ⑦): main は記録する API の応答の識別を「PR の承認レビューの識別子、承認レビューの写しのファイルのパス」へ改め、stack は確かめる設定に「push で古い承認を無効にする設定」「コードオーナー(規制業・安全関連のルールセット)」を足した。解決: 合成

### #313 本標準の版・逸脱の閉じた列挙

- `qms-document-control.md`(G-7・G-8 の行): main は G-7 の操作を「判定記録を基底ブランチへ入れること。入れる操作に記名者以外の承認を課さない」へ改め、G-8 へ決断の記録の文を足した。stack は G-8 の同一人物の場合を「列挙に無い離脱として表示する(第1章 1.10.2)」へ改めた。解決: G-7 は main、G-8 は stack の区分 + main の文

### #314 実装マークの検査の強さ

- `phase4-process-design/gate-criteria.md`: main は IMPL-0107 の直後に IMPL-0129 を足し、stack は IMPL-0107 の注記に「確かめる者」を足した。解決: 両方

### #315 既存のリポジトリへの持ち込み

- `adoption-guide.md`(要件 ⑦): stack は確かめる項目を独立レビューの適用で分け、重なり・誤り・バイパスの主体と4値の記録を足した。解決: stack の文 + main の識別の列挙
- `src/data/impl-targets.yaml`: main の `rulesets` と stack の `adoption-preflight` の両方

### #316 フェーズ5・6 を参考の手引きに

- `adoption-guide.md`(要件 ⑥⑦): stack は要件の本文を第1章 1.10.1(`overview.md`)へ移し、表を参照に縮めた。解決: 表は stack。main の識別の列挙を移設先の `overview.md` 1.10.1 の該当行へ移した
- `gate-criteria.md`「成立に伴う事務」: main の行「記録の媒体」と「承認の操作そのもの」+ stack の参照先(第3章 3.5.5)
- `gate-criteria.md`「記録を書かないまま…」: main が直前に足した2節(EV-0111、IMPL-0124・IMPL-0125・IMPL-0128)を保ち、stack の語の置換(「逸脱」→「記録の欠落」)を当てた
- `phase5-implementation/label-mailbox.md`: stack は 4.5.3・4.6 の規範を第3章 3.5.5 へ移し、手引きに縮めた。main は 4.5.3 に「判定記録の媒体と置き場は、第4章と準拠テンプレートが定める。本仕様は定めない」を足し、図から `docs/gates/` を外していた。解決: label-mailbox は stack。main の文を移設先の `roles-responsibilities.md` 3.5.5 の要求事項4 へ移した
- `phase6-operation/process-audit.md`: main の抽出の条件2行と EV-0117 を保ち、stack の2つの変更(「列挙に無い離脱」、当事者に選ばせない規定の推奨化)を当てた
- `qms-document-control.md`・`template-repository.md`: stack の手引きの文体(「確認することを勧めます」「が要る」「に基づく」)に、main の文(「PR の承認も同じです」、規程の対象、`docs/gates/` は準拠テンプレートが決めた置き場)を挿入
- 統合の修正コミット: main の第4章「判定の成立」が保全の条件を「第5章 QMS 文書管理によります」と委ねていた。#316 の規則では手引きへ要求事項を委ねられない。条件の列挙(main が括弧に書いたもの)を第4章の要求として残し、第5章を「参照」で引く形に改めた
- `src/data/impl-inventory.yaml`: stack はフェーズ5・6 の節を棚卸しの母集団から外した。統合で登録したフェーズ5 の2節も同じく外した

### #318 組織上の距離の段

- `phase4-process-design/deliverable-templates.md`(G-6 の規制業の注記): main の注記(「承認レビューは機械が出す欄の出所になる…EV-0114」)+ stack の段の4行と安全性の評価の注記

### 統合の修正コミット(本リポジトリ)

| 位置 | 内容 |
| --- | --- |
| work/292 の末尾 | #292 の棚卸しの規約に従い、main が足した5節を登録簿へ登録 |
| work/294 の末尾 | G-2 の節の登録に、同じ節にある main の IMPL-0129 を挙げる |
| work/314 の末尾 | main の IMPL-0124〜IMPL-0129 を #314 の規約(確かめる者・plan・単位・試験の名指し)に合わせ、準拠テンプレートの記録のファイル4つを逆向きの追跡の除外へ登録。準拠テンプレートを目印のコミットへ進める |
| work/315 の末尾 | 準拠テンプレートを #315 の統合の修正へ進める |
| work/316 の末尾 | 第4章の保全の条件の委任を、手引きへの委任にならない形へ改める |
| work/346 の末尾 | 準拠テンプレートを #346 の統合の修正へ進める |

## 人の確認を要する判断

統合の作業者(AI)が、検査を通すために判断した箇所です。いずれも各ファイルの注記にその旨を書きました。

1. **棚卸しの区分(main の5節)**。`機械が出す欄と人が書く欄` と `判定記録を基底ブランチへ入れる操作` を marked、G-6 の `承認レビューを判定記録とする条件` を marked(条件2 は org-design、条件3・4 は G-2 の節への elsewhere)とした。`判定記録を基底ブランチへ入れる操作` の「遅くとも G-7 で入れる」「強制層を写しのために縮小しない」と、G-6 の条件4(承認者ごとの最後の状態)には、独立のマークが無い。marked の定義(節の規定のすべてにマークがある)を厳密には満たさないおそれがある。#321 の作成者による棚卸しのやり直しを要する
2. **IMPL-0124 の計画**。`plan=scheduled issue=360 review=2026-11` とした。#360(PR 単位の検査・ルールセットの欠け)へ寄せたのは統合の作業者の判断である。GitHub のルールセットがパス単位の免除を持たない制約は、準拠テンプレートでは解消できない可能性があり、`adopter` か条項の見直しが正しいかもしれない
3. **IMPL-0125〜IMPL-0128 の単位、IMPL-0129 の試験**。単位(欄・キー・行)と、IMPL-0129 の試験を `test-records.mjs`(写しの読み取りの段)とした選択。集約が G-2・G-4 のずれを欠落に数える段は、直接の試験が無い
4. **逆向きの追跡の除外**。`record-copy.yml` を足回り(infra)とした。写しの取り出し(IMPL-0126)を実際に運ぶのはこのワークフローであり、降ろし先として登録する方が正確かもしれない
5. **第4章の保全の条件**。main が第5章へ委ねていた条件を、第4章の要求として書き直した(列挙は main のまま)
6. **承認の数え方の変化**(準拠テンプレート #296)。`commit_id` を持たない写しの承認は、統合後は数えない
