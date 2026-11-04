# #430 前半(名簿の数値の識別子による照合)の実装の記録

担当: 準拠テンプレート(template/)の実装担当のサブエージェント。コミット・push はしない(作業ツリーに残す)。

## 着手時の状態

- template/ の作業ツリーは clean(HEAD d8423fb)
- gate-g5.yml の試験: test-g5-aggregate(CRLF)と test-results(引数が要る)を除き全通過

## 実装したこと

- config.mjs: `accounts` の要素に `{ login, id }` を許す。`accountKey`(両形から login の鍵)、`accountLoginOf`、`accountIdOf`、`numericAccountId`、`accountRefOf`(記録の書き手の { login, id }。レビューの id を書き手の識別子と取り違えない)、`identifyAccount`(id / mismatch / login-only / none の4分岐と candidate)、`identifyWhy`、`accountsWithoutId` を足した。`rosterProblems` は object の要素の login の有無・知らない欄・id が正の整数・名簿の中で id が重ならない・同じ login に別の id を書かないことを確かめる
- check-pr.mjs: `approverFindings`(レビュアを id で区別し identifyAccount で同定。数えない理由に「記録に数値の識別子が無い」等を出す。`accountFindings` を返す)、`changesRequestedFindings`、`exceptionFor` の作成者、`instructorTokensOf` の既定値(PR の作成者を id で同定。ログイン名だけなら対応づかない指示者に理由つきで入れる)、`prAuthorRef`、PR_AUTHOR_ID の読み取り。M6 の所見(ホスティングと名簿の食い違い・PR の作成者の識別子の欠け)を警告に出す
- gate-g5.yml: PR_AUTHOR_ID(github.event.pull_request.user.id)を渡す。test-roster-ids.mjs を試験の並びに足した
- material-attribution.mjs: `normalizeReviews` が書き手の accountId を持つ。`reviewerCheck` は identifyAccount で同定し、作成者との同一は id で比べる。`introducedBacking` は承認者 `{login,id}`・作成者 authorId・コミットの作成者 `{login,id}`・PR を経ないコミットの authorId/committerId を id で照合し、記名者のログイン名に当たったが数えなかったアカウントを why に出す。`approverAccounts` を足し、`ghHosting` は REST の user.id・author.id を捨てずに info に入れる
- aggregate-evidence.mjs: `lastReviewStates`・`approvalCountOfCopy` がレビュアを id で区別(値に login・id)。`judgeLoginsOf` が ids を返し、`gateJudgementsOfCopy` は identifyAccount で判定者を同定(ログイン名だけなら judgeOk=false と理由)。`machineFields` の作成者本人の判定を id で。`formAttribution` は承認者 `{login,id}` を id で記名者へ対応づける。本体: `identifyAt`(承認の時点の名簿。現在の名簿に当たらないときだけ当時の名簿)、PR の作成者を id で同定(`authorIdOf`: 写しの author.id → REST の pulls/<n> の user.id)、写しの無い PR は `gh api repos/<r>/pulls/<n>/reviews` を引いて使う(`restAccountsOf`。読めなければ gh pr view の reviews で、書き手は「記録に数値の識別子が無い」)、`g6.approverAccounts` を足し materialHosting・様式の帰属へ渡す。materialHosting はコミットの作成者の id を REST から引き直す。保証の開示に `independence.accountMatching`(識別子の無い名簿の要素・食い違い)と本文の段落を足した
- next.mjs: 写しの G-6 の承認を id で区別・同定。名簿に識別子の無いアカウントがあれば、案件の段階に「名簿に数値の識別子の無いアカウント」(roster-ids.mjs と /process-change accountable)を出す
- delegation.mjs / check-delegation.mjs: 開発者の席の責任者の承認を id で同定(REST の user.id を jq で取る)
- generate-profile.mjs: 名簿の表示を `login(#id)` にし(識別子を足すことはアカウントの表記の変更として rosterEdits に残り決定者の記名を要する)、`accountSetKey` は login の集合で比べる(識別子を足しても別の人への差し替えに数えない)。CODEOWNERS は login を使う
- adoption-trial.mjs: 合成する PR の作成者・レビューに名簿の id を付ける
- roster-ids.mjs(新規): 記録用ブランチの写しと docs/records/reviews/ から login→id を集めて提案。写しどうしの食い違い・写しと現在の値(--lookup)の食い違いは提案せず所見。名簿に id があるのに写しに同じ login の別 id が現れたら所見。`--json` は提案を当てた名簿の全体(/process-change accountable の people)を出す。名簿は書き換えない
- skills: process-change の kinds/accountable.md・headcount.md・reference/input.md の例を `{login,id}` にし、識別子と roster-ids.mjs の経路を書いた
- process-compass 側: src/data/impl-untraced.yaml に roster-ids.mjs(infra)を足し、`npm run impl:write` で台帳を再生成した(lint:impl の逆向きの追跡のため)

## 未実装・決めきれなかったこと

- **PR 本文の @アカウント を検査の時点に数値へ解決して残す**(Issue #430 受け入れ条件3 の後段、IMPL-0426 の note の末尾)は実装していない。方針2 のとおり、人が書いた記載(PR 本文の @アカウント、記名・規模の確認の実施者、確定した者)は `findPersonByAccount`(ログイン名)で名の解決をしている。解決した値と時点を残す仕組み(どこへ残すか: PR の検査の出力・写し・集約の evidence.json)は決めていない
- コミットの Author(git のメタデータ)からの指示者の解決(aggregate-evidence の `commitInstructors`、records.mjs の `recordAttribution` の author-login)はログイン名のまま。ホスティングの記録ではなく git のコミットのメタデータ(自己申告)であるため対象外とした。noreply のメール(`<id>+<login>@users.noreply.github.com`)からは識別子を読めるが、使っていない
- `aiAccountCheck`(AI を示す語に当たるアカウントの上書き。accountsConfirmed)はログイン名で照合したまま。上書きは「AI の名義か」の判定で、名簿の人への同定は別に identifyAccount で行うため、上書きされても識別子の無い承認は数えない
- roster-ids.mjs の `--lookup` は、写しに現れないアカウントに加えて、写しに現れたアカウントの現在の値も引いて食い違いを確かめる(方針5 の「写しに現れない人だけ gh api で引く」と「写しの値と現在の値が異なれば提案せず所見に出す」を両立させる読み方)。--lookup が無いときは現在の値を確かめていない(出力に出していない。要検討: 出力に「現在の値は確かめていない」を出すか)
- env-check からの提案の経路(受け入れ条件2 の env-check)は範囲外として実装していない
- 写しの無い PR で REST の `pulls/<n>/reviews` を引く処理は `--paginate` の出力を JSON.parse する(material-attribution の ghHosting と同じ前提)。2ページを超えるレビューで配列が連結されると読めない(読めなければ gh pr view の reviews に戻り、識別子の無い承認として数えない側に倒れる)
- 集約の materialHosting は、出荷の範囲の PR でも、コミットの作成者の識別子を REST の `pulls/<n>/commits` から引き直す(gh pr view の commits[].authors[].id はノードの識別子)。gh を引けない手元の実行では、作成者の経路(記名者が作成した PR + 帰属の確認)の裏づけが成り立たなくなる

## 規定との食い違い

- IMPL-0426 の note「準拠テンプレートはログイン名の文字列で照合する」は、今回の実装で事実でなくなる(標準の側で state を delivered に改め、note の限界の文を直す必要がある)。material-attribution.mjs の冒頭の限界の注記は書き換えた
- IMPL-0429(roles-responsibilities.md:642)の note に「種別 accountable で名簿のアカウントを login と数値の識別子の対で書くこと」が含まれる。今回、accountable の経路で `{login,id}` を受け付けるようにした(kinds/accountable.md・generate-profile.mjs)。IMPL-0429 の残り(種別 performer)は範囲外のため、IMPL-0429 は部分的にしか降りていない
- 規定は「ログイン名だけで対応づけた者を、同定できたものとして扱わない」。判定者のレビュー(gateJudgementsOfCopy)では、従来「責任者のアカウントが名簿に無い」場合に judgeOk=null(数えたうえで注記)としていた。今回、責任者の名簿の要素が**ログイン名だけ**の場合は judgeOk=false(数えない)とした。アカウント自体が無い場合の null は従来のまま残した(ログイン名で対応づけているわけではないため)。この null の扱いが規定と整合するかは標準の側で確かめてほしい
- 「名簿の変更は、効力を持つ記録(D-0 の決定の記名)として、効力の前に帰属を裏づける」: 識別子を足す変更は rosterEdits(アカウントの表記の変更)として決定者の記名を要する既存の経路に乗る。効力の前の帰属の裏づけ(記名者本人の操作)は、この経路では確かめていない(既存の名簿の変更と同じ)

## 試験の材料の直し(意図は変えていない)

- template: test-check-pr・test-material-attribution・test-aggregate-records・test-next-records・test-check-delegation(と fixtures/delegation-eligible.json)の名簿を `{login,id}` にし、レビュー・ホスティングの代役・PR の作成者に同じ id を足した。test-aggregate-records の名簿の id は fixtures/records/reviews の写しの user.id に合わせた。test-aggregate-records に IMPL-0426:ng の場面(ログイン名だけ・識別子の異なる承認者は記名者本人の承認に数えない)を1件足した
- 新しい試験 scripts/gate/test-roster-ids.mjs(40 件。IMPL-0426:ok / :ng の目印つき)
- 回帰: scripts/regress/lib/account-id.mjs(新規。ログイン名から決まる識別子 `regressAccountId` と `rosterAccount`)。suite/lib.mjs が再輸出。lib/bin/gh(代役)は REST の応答(reviews-<n>.json・pulls-<sha>.json・commit-<sha>.json)に user.id を足し、`api repos/<r>/pulls/<n>/reviews` の材料が無ければ $MOCK_PRS/<n>.json の reviews を REST の形へ直して返し、`api repos/<r>/pulls/<n>` は作成者を返す。gh pr view の形には識別子を足さない。suite の名簿(lib288・matrix-sweep・new・s5-init-pr・scenarios・stages・t288・v3b・verify-n)を rosterAccount へ、t288・t288b の --pr の JSON に authorId、固定のホスティングの approvers に識別子を足した。scenarios の D-0 の名簿の表示の確かめを `login(#id)` の表示へ直した。unit.mjs(文字列の名簿の関数の試験)と scenarios の拒否の場面(bot・重複・配列でない)は文字列のまま

## 試験の結果

- 手元(Windows): gate-g5.yml の試験は test-g5-aggregate(CRLF。着手前と同じ 4 件の失敗)と test-results(引数が要る)を除いてすべて通過。`npm run test:template-suite` は test-g5-aggregate の失敗だけ。`npm run lint:impl` は通過(降りていない規定の表示のみ)、`npm run test:impl`・`test:template` 通過
- WSL の回帰: `node scripts/regress/run.mjs --kb keep` で 21 本すべて通過(最初の実行では stages・t288・t288b・s5-init-pr・verify-n が落ちた。名簿と代役の材料を直して通過)。`test-run.mjs` 30 件通過。`--kb rebuild`(既定)は WSL の複製に node_modules(github-slugger)を写していないため流していない(知識ベースは `npm run test:template` で一致を確認済み)
