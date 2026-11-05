# #379 独立の突合(実装 × 裁定 × 既存の決定)

- 実施: 2026-11-05。対象は未コミットの差分(本体・`template/`)と未追跡の新規ファイル(ADR-0109、`template/.gitattributes`・`.prettierignore`・`scripts/gate/test-records-history.mjs`・`fixtures/records/api/pr-14.rest.json`)
- 実装者の説明(`implementation-notes.md`)は読んでいない。成果物と裁定(`decision.md`)だけで判断した
- 実行して確かめたこと
  - 準拠テンプレートの試験(test-records-history・test-records・test-aggregate-records・test-check-delegation・test-roster-ids・test-check-pr・test-performer-account・test-next-records)を TZ=UTC・Asia/Tokyo・America/Los_Angeles で実行し、すべて通過
  - 履歴の走査を、一時のリポジトリで「中身を変えるマージコミット」に掛けた(所見 H-1)
  - `npm run check` は `test:template-suite` の test-g5-aggregate で停止(所見 L-6。#379 の原因ではない)。`test:regress` は Windows で gh の代役を呼べず実行できなかった(t288 の変更は手元で未確認)

重大度: 高 = 書き換え・先取りの経路が開いている、または正当な運用が恒久的に止まる。中 = 既存の決定・語彙との矛盾、裁定からの逸脱で信頼性に効くもの、開示・マークの過大な主張。低 = 表記・追跡性・局所の不整合。

---

## 高

### H-1 中身を変えるマージコミットで、成立した記録を検出されずに書き換えられる

- 所在: `template/scripts/gate/records.mjs:127`(`git log --reverse -M --name-status ... -- records/`)、`template/scripts/gate/records.mjs` の `classifyRecordsHistory`
- 根拠: `git log` は `--diff-merges`(`-m`・`--cc` など)を指定しない限り、マージコミットの差分を出さない。記録用ブランチのルールセットは non_fast_forward と deletion だけを持つため、先頭の上に積むマージコミットの push は通る。一時のリポジトリで、`records/reviews/pr-5.json` をマージの解決で書き換えたマージコミットを作り、`scanRecordsHistory`→`classifyRecordsHistory` に掛けた。結果は `{"rewrites":[],"premature":[],"additions":1}`(前回の先頭からの範囲では `additions:0`)で、書き換えを1件も出さない
- 帰結: 書き込みの権限を持つ者とジョブのトークンが、出荷の前の写しの状態・本文・レビューの有無を、走査に掛からずに変えられる。不変の欄の突合(IMPL-0435)は状態・本文の変化を所見に止める(H-2)ため、G-6 の承認と、宣言行による G-2・G-3・G-4 の判定を作れる。IMPL-0432 の「追加以外の変更を成立した記録の書き換えとして欠落に出す」は、この経路では成り立たない(4.の過大な主張にも当たる)

### H-2 マージ直後に置いた写しで、状態と本文を差し替えて G-6 を数えさせられる(先取りの三重の塞ぎの穴)

- 所在: `template/scripts/gate/aggregate-evidence.mjs:435`(状態の食い違いを所見に止める)、`:442`(ホスティングにあり写しに無いレビューを所見に止める)、`:1724`(欠落の無い写しから G-6 を数える)、`template/.github/workflows/record-copy.yml:178`・`:231`(比べる形 `shape` に state と body が無い)、`src/content/docs/phase4-process-design/gate-criteria.md:1122`
- 根拠: マージの後、record-copy.yml が写しを置く前(キューの待ちの数秒〜数分)に、書き込みの権限を持つ者が `records/reviews/pr-N.json` を置く。不変の欄(id・user.id・commit_id・submitted_at・merge_commit_sha・head_sha)はマージの後に API から写せる。この写しに対して、
  1. record-copy.yml は既にある写しと `shape` を比べ、一致するので「再実行」として成功で終える(state・body を比べない)。git push の経路で先に push されていれば、record-copy の push が非 fast-forward で失敗するだけで、置かれた写しが残る
  2. 履歴の走査は「追加」で、committer の時刻はマージの後であるため、マージより前に置かれた写しにも当たらない
  3. ホスティングとの突合は、状態の食い違い(写し APPROVED / 記録 COMMENTED)と本文の食い違いを所見に出すだけで、欠落にしない。マージより前に提出され写しに無いレビュー(例: 承認の後の CHANGES_REQUESTED を写しから落とす)も所見に止まる
- その結果、`copyCounted` が真になり、写しの APPROVED と宣言行が G-6 と判定に数えられる。ホスティングの側の正当な変化は「マージ後の編集」と「APPROVED→DISMISSED」に限られ、COMMENTED・CHANGES_REQUESTED→APPROVED や、マージより前の提出の欠けは、正当な変化として起こりえない。裁定 R-2 は「ホスティング側の変化(マージ後の編集・取り下げ)は所見」と書いており、変化の向きを問わず所見にしたのは裁定の文の外へ広げた実装である。実装者が「ホスティングにあり写しに無いレビューを所見に留めた」判断は、この経路を開くため妥当でない
- 補足: H-1 と組み合わせれば、時刻の窓も要らない

### H-3 書き換え・衝突・署名の無い書き込みを一度でも検出すると、以後の出荷が恒久的に止まる(例外承認の受け皿が実装に無い)

- 所在: `template/scripts/gate/aggregate-evidence.mjs:2627`(衝突の記録を記録用ブランチの全体から毎回欠落に数える)、`recordsHistoryGaps`(書き換え・署名の欠落)、`:5635`(欠落があれば G-7 を通過できない)、`src/content/docs/phase4-process-design/gate-criteria.md:169`、ADR-0109 決定1
- 根拠: 本文と ADR-0109 は「起きた書き換えは、例外承認でだけ受け入れる」と定める。集約の例外承認の対応づけは変更(PR)単位であり(`aggregate-evidence.mjs:2196`・`:3042`)、履歴の走査・衝突・署名の欠落に例外承認を対応づける経路が無い。欠落があると集約が失敗し、出荷の PR が作られず(または verify が落ち)、`docs/records/heads/` へ先頭を残せない。先頭が残らなければ次回も同じ範囲(最初のコミットから)を走査し、同じ欠落が出る。衝突の記録は範囲を問わず `ls-tree` の全体から数えるため、先頭を残せても消えない
- 正当な運用で起きる例
  - 人が誤字を直すために様式を1回変えた、#379 より前に採用者が記録用ブランチの記録を直していた(初回の出荷で最初のコミットから走査する)
  - CL2・規制業へ構成を変えた採用者の、変更より前の署名の無い record-copy の書き込み(初回の走査の範囲に入る)
  - 再実行の時点で承認者のアカウントが削除され、user.id が ghost の値へ変わった(record-copy が衝突を記録する)
- IMPL-0432・0437 の delivered は、標準が定める受け入れの経路(例外承認)を欠いたまま、検出だけを降ろしている

---

## 中

### M-1 出荷の PR の作成者の経路が、記録用ブランチへ誰が様式を足したかを確かめない(裁定 R-3 からの逸脱)

- 所在: `template/scripts/gate/aggregate-evidence.mjs:696`・`:724`(head が `ship/` の PR で github-actions[bot] のコミットを記名者以外のコミットに数えない)、`attributeBaseForm`(introduced が裏づけば added を見ない)、`gate-criteria.md:130`、ADR-0109 決定3・「反論されうる点」
- 根拠: 裁定 R-3 は「照らすのは置き場で様式を足したコミット」と定めた。実装と本文は、これに「様式の今の中身を基底ブランチへ入れた変更の作成者・承認者」を加え、出荷の PR では機械の複製のコミットを除外する。出荷の PR の中身は記録用ブランチの複製であり、記録用ブランチは書き込みの権限を持つ者とジョブのトークンが新しい様式を足せる(追加は走査で欠落にならない)。出荷判定者 X が出荷の PR を開けば、第三者が記録用ブランチへ足した「X 記名」の様式も、X の作成と他者の承認(帰属の確認)で裏づいたことになる。ADR-0109 の「作成者が裏づけるのは、作成者自身が記名者の様式だけ」は、その様式を X が書いたことを示さない。verify ジョブの一致の検査は、複製が弱い置き場と同じであることしか示さない
- `ship/` の判定は head のブランチ名だけで、ブランチ名は書き込みの権限を持つ者が付けられる。bot の名義はジョブのトークンで、どのワークフローからも出る(ADR-0090)
- 記名者本人の承認(approval)の経路は、記名者がその PR の上で認証された操作をするため、この問題に当たらない。問題は author の経路と bot の除外の組である

### M-2 差し戻しのレビューの帰属で、名義の共有(ADR-0107)を扱っていない

- 所在: `template/scripts/gate/autonomy.mjs:461`〜(`attributeRejection` のレビューの経路。`:475` の後に共有の確認が無い)、`gate-criteria.md:141`
- 根拠: 本 ADR は G-6 の差し戻しの記録を効力を持つ記録へ加えた。第4章(「記名者のアカウントを AI の担い手と共有する構成では…それだけでは帰属の裏づけに数えない」)と ADR-0107 決定3 は、効力を持つ記録について名義を共有するアカウントの操作を単独で数えない。様式の経路は `introducedBacking` を通るため共有を扱うが、レビューの経路は共有の申告(`signerSharing` 相当)を見ずに数える。名義を共有する独立レビュアのアカウントで担い手が差し戻しを出せば、0% の継続を切れる。IMPL-0440 の注記にも、この扱いの記載が無い

### M-3 差し戻しの書き手を「G-6 を判定する席の責任者」に限ると、承認の数え方と非対称になり、正当な差し戻しを落として引き下げを誤って発火させる(裁定に無い限定)

- 所在: `gate-criteria.md:141`、`template/scripts/gate/autonomy.mjs:443`・`:480`
- 根拠: 裁定 R-4 は「帰属を確かめられない差し戻しは数えない」とだけ定め、書き手を席の責任者に限っていない。G-6 の承認は、名簿の人で書き込みの関係を持つ独立した人なら数える(IMPL-0425)。独立レビュアの席に責任者以外の担い手(人)がいる体制では、その人の差し戻しを数えず、差し戻し率 0% の継続による引き下げ(第5章 5.4.6)が正当な差し戻しがあっても発火する。ADR-0109 の採らなかった案の行「正当な差し戻しがあっても 0% の継続で引き下げが発火する」と同じ欠点を、別の形で持ち込んでいる。加えて、本文は「席の責任者であり」と無条件に書くが、コードは席が無ければ限定しない(本文と実装の食い違い)

### M-4 ADR-0109 のステータス表が、置き換え・補う既存の決定を挙げきっていない

- 所在: `src/content/docs/adr/0109-records-detect-not-prevent.md:12`〜`:15`、`src/content/docs/adr/0070-gate-record-medium-and-field-sources.md:22`
- 根拠
  - ADR-0070 決定6「帰属の裏づけは記名者本人の操作(署名コミット、または記名者の承認レビュー)」を、決定3 で「ホスティングが検証した署名 + committer・author の照合」と「基底へ入れた変更の作成者」へ改めている。表と ADR-0070 の注記は決定5 だけを挙げる
  - ADR-0070 決定7「置き場の形(既定ブランチの外の記録用ブランチ、CI の成果物)」を、本文(`gate-criteria.md` の「CI の成果物は…置き場に当たらない」)が否定している。置き換えの記録が無い
  - ADR-0106 決定1 は効力を持つ記録を「列挙で閉じ」た表として決めた。本件はその表へ1行を足し(決定4)、1.4 の用語の定義も改めるが、ADR-0106 との関係(補う)を表に書いていない。ADR-0106 側にも参照が無い
  - ADR-0108 は M-5 のとおり
- CLAUDE.md の「採用済み ADR の本文は書き換えない。決定変更は新 ADR で置き換える」の運用では、どの決定を置き換えたかを新 ADR が列挙する必要がある

### M-5 名簿の識別子の提案を常にホスティングで照合する形は、ADR-0108 の移行の決定と EV-0223 の前提を変えるが、記録が無い

- 所在: `gate-criteria.md:84`・`:94`(EV-0223)、`template/scripts/gate/roster-ids.mjs`(`verify: ghUserId` を常に渡す)、`src/content/docs/adr/0108-roster-matched-by-numeric-account-id.md:28`
- 根拠: ADR-0108 は「現在のホスティングから数値を引く方法の対象は、写しで見つからない人だけ」とし、写しからの一括の移行を決めた。本件は写しの値を常に `gh api users/<login>` の現在の値で照合し、一致しなければ提案しない。改名した人は写しのログイン名で引けないため提案されず、ADR-0108 の「一度に済ませられる」移行が成り立たなくなる。EV-0223 の差し替え条件は今も「写しを正とする前提を見直す」と書き、本文の新しい文(写しの値だけを根拠に提案しない)と食い違う。ADR-0109 の表に ADR-0108 が無い
- 判断の向き(写しを正としない)は裁定 R-4 と整合する。欠けているのは決定の記録と EV の改め

### M-6 ADR-0109「網の外に残る経路」が、既定ブランチに触れない巻き戻しを書き落としている

- 所在: `src/content/docs/adr/0109-records-detect-not-prevent.md:97`〜`:99`、`gate-criteria.md` の EV-0224 の本文
- 根拠: 祖先関係の確認は「前回の出荷で残した先頭 P が今の先頭の祖先か」だけである。管理者(個人所有のリポジトリでは所有者)がルールセットを外し、P より後の未出荷のコミットだけを作り直して force push すると、P は新しい先頭の祖先のままで、作り直した写しは「追加」として走査を通る。既定ブランチの出荷の証跡を書き換える必要は無い。不変の欄の突合が残るが、状態・本文・レビューの欠けは H-2 のとおり所見に止まる。ADR-0109 は残余を「既定ブランチの出荷の証跡も書き換える操作」と書き、実際より狭く開示している。1〜2名の体制では、判定される側が所有者であることが多い
- 「最初の出荷より前に履歴を書き換えた場合も…検出できません」も、新しいコミットによる書き換えは最初のコミットからの走査で検出されるため、force push による書き換えに限る旨が要る(表記の精度)

### M-7 署名を要するかの判定が3か所で別の導出になっている

- 所在: `template/scripts/gate/aggregate-evidence.mjs:605`(欠落: 回答 q-quality・q-criticality)、`:3997`(開示の定型の文: `records.signed` → 環境変数 `RECORDS_SIGNED` → `config.ruleset` が safety・regulated)、`template/.github/workflows/record-copy.yml` の経路の判定(`records.signed` → リポジトリの変数。ruleset を見ない)、`template/.github/workflows/ship-evidence.yml` の集約の手順(`RECORDS_SIGNED` を環境へ渡していない)
- 根拠
  - `/process-init` は `records.signed` を書かないため、CL2・規制業の採用者が変数 `RECORDS_SIGNED` を設定しないと、record-copy.yml は署名の無い git push で書き、集約はそのすべてを「署名の無い書き込み」の欠落に数える(H-3 と重なり出荷が止まる)。この食い違いを案内する出力が無い
  - ruleset は reviewerCount ≥ 2 でも regulated になる(`generate-profile.mjs` の `strict`)。規制業でも CL2 でもない2名レビューの構成で、開示の文は「書き込みごとに署名を課します」と書くが、欠落の判定は署名を求めない
  - CI の集約は `RECORDS_SIGNED` を受け取らず、変数で署名を課した構成でも開示の文が「署名を課しません」になりうる
- IMPL-0439 の注記「構成の records.signed、変数 RECORDS_SIGNED、既定ブランチの ruleset が safety・regulated か否かで出し分け」は、CI で変数が届かない点で過大

### M-8 無料のプラン(ルールセットを使えない私有リポジトリ)で、要求と開示の文が実態と合わない

- 所在: `gate-criteria.md:165`、`template/scripts/gate/aggregate-evidence.mjs` の `recordsWriterStatement`、`template/.github/rulesets/README.md` の無料のプランの段落
- 根拠: 本文は置き場に「履歴の書き換えと削除を、ホスティングの規則で止める」を課すが、無料のプランでは満たせない。その場合の扱い(未達として出すか、列挙に無い離脱か)を本文が書いていない。定型の文は構成を問わず「置き場の規則(ルールセット)が止めるのは履歴の書き換えとブランチの削除であり」と書き、規則が適用されていない構成でも止めているように読める。開示の文は「良否の評価を含めない」定型だが、事実の記述として誤る

---

## 低

### L-1 コードのコメントが引く ADR-0109 の決定の番号がずれている

- 所在: `template/scripts/gate/records.mjs`(冒頭の注記「決定4」=帰属、「決定2」=走査、`CONFLICTS_DIR` の「決定5」)、`template/scripts/gate/aggregate-evidence.mjs`(`mergeRecordSources`「決定3」、`reconcileCopy`「決定3」、`recordsWriterStatement`「決定6」、`unbackedSignerForms`「決定4」)、`template/scripts/gate/autonomy.mjs`(`attributeRejection`「決定5」)、`template/scripts/gate/test-check-delegation.mjs`(「決定5」)
- 根拠: ADR-0109 の決定は1〜5 で、置き場=1、写しの正=2、帰属=3、先取りと差し戻し=4、開示=5。コメントは1つずつ大きい番号を引き、存在しない「決定6」もある。t288 の「決定3」(条件4)だけが合う。`lint:refs` は template のコメントを検査しないため検出されない

### L-2 IMPL-0438 は回帰の場面を持たず、条件4 の不成立の側の統合の確認が無い

- 所在: `gate-criteria.md` の IMPL-0438、`scripts/regress/suite/t288.mjs:266`〜`:270`
- 根拠: 注記が限界として自ら開示している。t288 は G-7 の記名者の承認を足して成立の側だけを通す(入力の直し)。自己申告の G-7・G-8 で条件4 が不成立になる場面は、関数の単体の試験だけである。t288 の直しは新しい規則に入力を合わせたもので、既存の決定を黙って変えたものではないと判断した。ただし、旧来の「署名の無い author の一致で成立」の場面が回帰から消えたことは、変更の記録(コメント)以外に残らない

### L-3 追記だけのフックの範囲が裁定より広く、AI が自分で作った草案も直せない

- 所在: `template/scripts/init/generate-profile.mjs:5705`〜`:5710`、`template/.claude/hooks/guard-write.mjs:113`
- 根拠: 裁定は「AI の担い手による置き場の既存ファイルの編集を拒否」とし、置き場は記録用ブランチを指す。実装は `docs/records/**`・`docs/gates/**`(基底ブランチ)へ広げた。成立した記録の保護としては向きが合うが、`/gate` の草案の文脈が新しい様式を作った後に機械が出す欄を埋め直す編集も拒否する(「新しいファイルは拒否しない」は最初の書き込みだけ)。また、フックは Write・Edit の道具だけに効き、Bash による編集(`sed -i`・リダイレクト)は止めない。IMPL-0442 の「AI の担い手による既にあるファイルの編集を拒否する」は、この範囲で過大。記録用ブランチを作業木の外(別の worktree)で扱うと `records/**` に当たらない。テンプレートの既定の `.claude/guard.json` は `/process-init` を実行するまでパターンを持たない

### L-4 ホスティングを読めない手元の集約で、写しのある PR の G-6 がすべて欠落になる

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1724` 付近、IMPL-0435 の注記
- 根拠: 裁定 R-2(照合できなかった写しで G-6 を数えない)どおりで、注記も開示している。手元の確認の実行で G-6 の欠落が大量に出るが、欠落の文は「照合できなかった」理由を各 PR に添えず、開示の表の notReconciled にだけ出る。誤検出ではないが、手元の利用者が原因を読み取りにくい

### L-5 マージより前の写しの判定が、ホスティングを引けないとき写し自身の merged_at に頼る

- 所在: `template/scripts/gate/aggregate-evidence.mjs:2634`
- 根拠: `mergedAtOf` は範囲の PR → ホスティング → 写しの `merged_at` の順に引く。範囲の外の PR 番号(存在しない番号を含む)では、判定される側が書いた値と、判定される側が設定できる committer の時刻を比べることになる。IMPL-0432 が「主の防御は突合」と限界を開示しているため、低とした

### L-6 `npm run check` が手元(Windows)で test-g5-aggregate により止まる

- 所在: `template/scripts/gate/test-g5-aggregate.mjs:63`・`:70`・`:86`、`template/.github/workflows/gate-g5.yml`
- 根拠: 作業木の gate-g5.yml が CRLF(`core.autocrlf=true`。索引は LF)で、試験の正規表現 `\n {2}…` が当たらず 4 件が NG。CI(Linux)では LF で取り出すため落ちない見込みで、#379 の差分が原因ではない。ただし `test:template-suite` で止まるため、手元では以降の `test:regress`・`build` を確かめられない。`test:regress` も Windows では gh の代役を呼べず実行できない(t288 の変更は CI でしか確かめられない)

### L-7 差分に #379 と無関係の未追跡ファイルがある

- 所在: `E:\Github\process-compass\.ignore`
- 根拠: graft の検索のための ripgrep の設定で、#379 の成果物ではない。同じコミットへ混ぜると変更の範囲が読みにくくなる

---

## 確かめて問題が無かったこと(要約)

- 裁定の各項目(R-1 の4条件・訂正の形・採らない明記・誤検出の対策、R-2 の欄の区分・ghost・存在しない PR 番号・基底を正とする向き、R-3 の「弱い裏づけ」の削除と条件4、R-4 の差し戻しの列挙への追加と向き、roster-ids、R-5 の ADR・EV-0185 の削除・EV-0224〜0227・IMPL の改め、範囲外の generate-profile.mjs のコメント)は、本文と実装のどこかに降りている。欠けは H-3(例外承認の受け皿)だけ
- 第1章 1.4 の用語の改めと第4章の表は一致する。第5章 5.4.6(`human-ai-boundary.md`)の分子の文は、帰属を確かめられない記録を数えない向き(引き下げの側)で第4章と整合する。「区分は記録の働きで決める」の文により、同じ差し戻しの記録が判定記録と効力を持つ記録を兼ねることの語の衝突は避けている
- EV-0185 は台帳から消え、ADR-0106 の本文に残る参照は採用済み ADR の不変の運用に従ったもので、ADR-0109 の表が置き換えを記録している
- 不変の欄の書き換え(commit_id・user.id・submitted_at)・写しにだけあるレビュー・PR を引けない写しは、試験と実装の両方で欠落・不算入になる。差し戻しの帰属は、ホスティングを読めない実行で何も数えず停止の側へ倒れる
- 試験は時刻を固定の UTC で作り、3つの時刻帯で同じ結果になった。record-copy.yml の時刻の比較は UTC の ISO の文字列どうしである
- 署名の検証は、手元の `%G?` を数えず、REST の `commit.verification.verified` と committer・author の数値の識別子で照らす(`introducedBacking` の PR を経ない経路)
