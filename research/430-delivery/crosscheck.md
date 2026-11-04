# #430 の独立の突合(crosscheck)

- 日付: 2026-11-05
- 対象: process-compass と template(pit-in-template)の未コミットの差分と未追跡の新規ファイル(`template/scripts/gate/roster-ids.mjs`・`test-roster-ids.mjs`・`test-performer-account.mjs`、`scripts/regress/lib/account-id.mjs`)
- 読んだ正本: 第3章 3.5.3「人と AI の担い手の名義」、第4章「アカウントと人の対応表」・G-6 の数え方・「判定記録を基底ブランチへ入れる操作」・保証の開示の項目1、第1章 1.10.2、ADR-0106・0107・0108、IMPL-0420〜0430 の note
- 読まなかったもの: `research/430-delivery/notes-*.md`(実装した者の説明)
- 実行して確かめたこと: template の試験 11 本(test-roster-ids・test-performer-account・test-material-attribution・test-check-pr・test-aggregate-records・test-next-records・test-roster-rules・test-check-delegation・test-loosening-decider・test-init-g5・test-env-check)は Windows で全件通過した。ただし test-env-check は Windows で全体を省く(下の C-1)。ルート側は `lint:impl`・`test:impl`・`test:fields`・`lint:refs` が通過した。`test:regress` と `npm run check` の全体は流していない
- 手元で組んだ実験(scratchpad。リポジトリには置いていない): 1名の体制で決定者本人のアカウントに識別子を足す変化点を `diffConfig`・`deciderProblems` に通した。名義を dedicated と申告した席で、env-check の照合が名簿の人に当たった構成を `claimStatus` に通した

重大度は「高」「中」「低」の3段階です。高は、規定や ADR の決定に反するもの、または統制が外れる経路を開くものです。中は、実装マークの主張が実際の挙動を超えるもの、または規定の要求が一部の経路で降りていないものです。低は、限られた条件でだけ起きるもの、または運用と表示の欠けです。

## 高

### H-1. 専用の申告が env-check の照合の結果に依らず「専用」として扱われる

- 所在: `template/scripts/gate/config.mjs:204`(claimStatus)、`config.mjs:833`(dedicatedSeatOf)、`config.mjs:781`(performerAccountOf)、`template/scripts/gate/adoption-trial.mjs:1872-1880`(env-check は所見を env-check.json へ書くだけ)
- 根拠: 第3章 3.5.3 要求事項5 は「照合で名簿の人に当たった担い手を、『専用』として扱ってはならない」と定める(roles-responsibilities.md:632)。ADR-0107 決定1 は「判定は能力で行います」とする。第1章 1.10.2 の2名の体制の条件は「申告と実行環境での照合で確かめている」である(overview.md:648)
- 実装: env-check の照合の結果(`performerAccount.status: mismatch`)は、記録(docs/adoption-trial/env-check.json)と導入前の検証の記録へ所見として出るだけです。`claimStatus`・`performerAccountStates`・`sharingOf`・`dedicatedSeatOf` は構成の `seats[].performerAccount` しか読みません。照合が「名簿の人に当たった」と出た席も、述べられる名の離脱に数えません。その人の G-6 の承認に印を付けず、効力を持つ記録に帰属の確認を求めません。照合をしていない専用の申告も、照合を経たものと同じに扱います
- 実験: dedicated と申告した席で `performerAccountEnvFinding` が mismatch を返す構成でも、`claimStatus(cfg).unlisted` は空でした
- 実装マークとの関係: IMPL-0421 は「所見であり、9項目の判定と終了コードには入れない」と書いており、所見の扱いそのものは正直に開示しています。ただし要求事項5 の全体(最後の文の「扱ってはならない」を含む)を delivered にしています。IMPL-0420 と IMPL-0430 は、申告だけで専用と数えることを限界に書いていません

### H-2. 共有・未申告から専用への切り替えを、記名なしで受け付ける。統制を外す向きの変更が、署名なしで通る

- 所在: `template/scripts/init/generate-profile.mjs:1688`(rank。専用を 1、それ以外を 0 とし、0→1 を厳しくする向きに数える)、`template/.claude/skills/process-change/kinds/performer.md:61`、試験で決定として固定しているのは `template/scripts/gate/test-loosening-decider.mjs:202`
- 根拠: 専用と申告すると、次の統制がすべて外れます。(1) 列挙に無い離脱(述べられる名が適合の主張まで上がる)。(2) G-6 の承認の印。(3) 効力を持つ記録の、名義を共有していない人による帰属の確認(IMPL-0427)。契約検査が確かめるのは、名簿の login・id と重ならないことだけです。名簿に無い架空の `{login, id}` を書けば通ります。人の認証情報で動く AI の担い手が `/process-change` の種別 performer を実行すると、記名も理由も無いまま、自分の席を専用と申告できます。そのうえで記名者の名義で例外承認のレビューを出せば、帰属の確認なしで通ります。これは ADR-0106 と ADR-0107 決定3 が塞いだ経路(担い手が記名者の名義で例外承認のレビューを出し、その場で通す経路)を開き直すものです
- 判断: ADR-0107 決定4 が定めたのは「専用から共有への切り替えを緩める向きとする」ことだけで、逆向きの扱いは決めていません。実装は、逆向きを厳しくする向きとして記名不要にしました。統制への効果は逆で、これは緩める向きに当たります。採否を決めないまま、試験の材料(test-loosening-decider.mjs:202)で決定として固定しています

### H-3. 1名の体制では、名簿へ数値の識別子を入れる経路(/process-change 種別 accountable)が本人の記名を拒否する。名簿を直す手段が無い

- 所在: `template/scripts/init/generate-profile.mjs:1532`(決定者本人の行に self を立てる)、`generate-profile.mjs:2185`(self の行は、任命権者か本人以外の席の責任者の記名を要する)、手順の案内は `template/.claude/skills/process-change/kinds/accountable.md:45`
- 実験: 全席の責任者が同一の1名の構成で、`accounts: ['yamada']` を `[{login:'yamada', id:1001}]` へ変える差分を流しました。結果は「決定者本人の行の変更です。……本人の記名では確定できません(第3章 3.13.3)」で拒否されました
- 根拠: ADR-0108 決定5 は、照合の切り替えを名簿へ数値を入れる経路と同じ単位で降ろすとしています。理由は「経路より先に切り替えると、既存の採用者の承認がすべて同定できない側へ一度に落ち、名簿を直す手段が無いまま記録の欠落が出続ける」ためです。1名の体制には、この経路がありません。照合は移行期間を置かずに切り替わっています。そのため、識別子の無い1名の体制では次のことが起きます。宣言行による判定者本人のレビューを数えない(`gateJudgementsOfCopy` で judgeOk=false)。効力を持つ記録は、自己申告の経路でも帰属に数えない(`introducedBacking` の `isSigner` が login-only で偽を返し、`alone` の経路にも入らない)
- 回避の経路は、組織上の任命権者を名簿へ足してから記名させることだけです。accountable.md にもこの経路は書かれていません。test-material-attribution の 1名の場面(s1・s2)と回帰の suite は、名簿へ最初から識別子を書いて流しているため、この欠けを捕まえません

## 中

### M-1. 出荷の集約が、作成を指示した者の @アカウントをログイン名で名簿へ対応づけている

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1174`(`resolvePerson` は `findPersonByAccount`)。呼び出しは同ファイルの instructorsOf
- 根拠: 第4章「アカウントと人の対応表」(gate-criteria.md:84)と ADR-0108 決定1 は、照合の対象に作成を指示した者を含め、「作成を指示した者をアカウントで書いた場合は、検査の時点に数値の識別子へ解決し、解決した値と時点を残す」と定めています。check-pr は、トークンのある実行で `gh api users/<login>` を引いて解決します。集約(G-7)は、トークンがあってもログイン名のままです。PR の検査が残した解決の結果(`instructorResolution`)も読みません
- 実装マークとの関係: IMPL-0426 の note は、限界として「コミットの Author からの指示者の解決など、git のメタデータ由来の照合」と「トークンの無い手元の実行」だけを挙げています。集約の @アカウントがログイン名のままであることは書かれていません。過大な主張です

### M-2. IMPL-0423 は出荷の集約の数え方まで delivered と書くが、試験は PR の時点の検査だけを流す

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:988`(IMPL-0423。test=test-performer-account.mjs)、集約の本体は `aggregate-evidence.mjs` の `independentConfirmation`(`if (isMain)` の内側にあり、試験から呼べない)
- 根拠: test-performer-account.mjs が流すのは `approverFindings`(check-pr)だけです。集約の dedicatedApprovals・sharedApprovers、IMPL-0427 の集約側(ledgerRowUnbacked・解除の記録の `noteShared`)、保証の開示の行(IMPL-0424)を通しで流す試験はありません。回帰の suite にも performerAccount を使う場面はありません(grep で確認)。IMPL-0424 が check=presence で「試験は無い」と明記しているのに対し、IMPL-0423 と IMPL-0427 は check=machine のまま、集約の側も確かめたように読めます

### M-3. roster-ids.mjs の提案が、リポジトリとの関係(author_association)を持たない書き手の観測を除かない

- 所在: `template/scripts/gate/roster-ids.mjs:28-38`(observationsOfCopy)、`roster-ids.mjs:79`・`roster-ids.mjs:95`(--lookup)
- 根拠: ADR-0108 決定4 と IMPL-0425 は、書き込みの関係を持たない書き手のレビューを、名簿の人の操作として数えません。roster-ids は、写しの reviews[].user をすべて観測に入れます。写しには author_association が残っているのに、それを見ません。名簿の人の改名の後に他人が旧名を取り、公開リポジトリの PR へコメントのレビューを残した場合を考えます。本人が写しに一度も現れていなければ、識別子が1つだけ観測されるため、他人の識別子を提案します。--lookup の照合も、現在の値が他人のものなので一致し、防ぎません。名簿へ入れるのは人ですが、提案の文には観測の関係が出ないため、人が確かめる手がかりもありません

### M-4. 名簿から外した人が在籍中に行った承認(移行の前)を、数える手段が無い

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1142-1150`(identifyAt。現在の名簿に当たらなければ、承認の時点の名簿を引く)
- 根拠: G-6 の条件1(gate-criteria.md:986)は「表5 から外した人が在籍中に行った承認……は数え」ると定めています。承認の時点の構成は #430 より前の文字列の名簿なので、`login-only` になって数えません。外した人の行は現在の名簿に無いため、識別子を足して直すこともできません。移行期間を置かない決定(EV-0223)の帰結ですが、ADR-0108 の帰結にも EV-0223 の差し替え条件にも書かれていません。出力にはこの件は「名簿に数値の識別子が無い」としか出ず、直せない欠けであることが読み手に分かりません

## 低

### L-1. 集約の例外承認のレビューの照合で、PR の作成者をログイン名だけで除外している

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1646`(`author: material.author` は gh pr view の現在のログイン名。`material.authorId` を渡していない)
- 根拠: `sameAccount` は、片方に識別子が無いとログイン名で比べます。写しのレビューは承認の時点のログイン名を持ち、作成者は現在のログイン名です。作成者が改名していると、作成者本人の宣言行のレビューを作成者として除外しません。規定(gate-criteria.md:130)は「対象の PR の作成者のアカウントと異なるもの」に限っています。check-pr 側は `prAuthorRef` で識別子を渡しているため、この問題は起きません

### L-2. check-pr で、作成を指示した者を @ を付けないログイン名で書くと、識別子へ解決しない

- 所在: `template/scripts/gate/check-pr.mjs:712`(`resolveSigner` は内部で `findPersonByAccount` を引き、ログイン名でも当てる)
- 根拠: 規定は「アカウントで書いた場合」の解決を求めています。@ の有無は条件にありません。多くは安全側(指示した者として除外する側)に倒れますが、ログイン名だけの照合が残ります

### L-3. 未申告の席、または相手を書かない共有の席で、席の責任者が未記入だと、名義を共有する人がいなくなる

- 所在: `template/scripts/gate/config.mjs:781-794`
- 根拠: 要求事項1 は、未申告を「その席の責任者と名義を共有するものとして扱う」と定めます。責任者が空なら `person: null` になり、印も帰属の確認も誰にも掛かりません。述べられる名では離脱に数えるため、主張は上がりません。表示は「共有の相手が分からない」です

### L-4. 初期化の回答は、人確定に限らないすべての席へ名義を書く

- 所在: `template/scripts/init/generate-profile.mjs:4490`
- 根拠: 「自分たちのアカウント」と答えると、担い手を宣言していない席(独立レビュアなど)にも shared を書きます。その席の責任者がすべて「名義を共有する人」になり、その人たちの承認の印と、効力を持つ記録の帰属の確認の要求が広がります。統制は厳しい側に倒れますが、開示の件数が実態より膨らみます。IMPL-0428 の note は「人確定に限らない席」と書いており、挙動と一致しています

### L-5. 専用のアカウントが作成した PR の、作成を指示した者の既定値を「対応づかない指示者」にする

- 所在: `template/scripts/gate/check-pr.mjs:692`、`aggregate-evidence.mjs` の instructorsOf(作成者を identifyAccount で引き、how=none なら unresolved)
- 根拠: AI を示す語を含まない専用のアカウント(機械のユーザー)が欄の無い PR を作ると、作成者は unresolved に入ります。その PR の G-6 の承認は、すべて「判定できない」になります。名義の申告(dedicatedSeatOf)は使っていません。#430 より前と同じ挙動で、後退ではありません。ADR-0107 決定3 は「作成を指示した者の既定値は変えない」としているので、規定違反でもありません。専用を選んだ採用者が最初に当たる詰まりになります

### L-6. env-check は、--seat を省くと名義を申告した全席を「この環境で動く担い手」として照合する

- 所在: `template/scripts/gate/config.mjs:849`、`adoption-trial.mjs:1871`
- 根拠: 手順は、人が自分の環境で `--by <氏名>` を付けて実行する形です。--seat を省くと、人のアカウントが専用の席には「一致しない」と出ます。共有と申告した席には、担い手の環境を見ていないのに「一致する」と出ます。範囲の注記(scope)は出力と記録の両方に書かれており、IMPL-0421 の note とも一致します。ただし既定値が誤読を誘います

### L-7. 契約検査(verify-gate-contract)は、識別子の無い名簿のアカウントを注記しない

- 所在: `template/scripts/gate/verify-gate-contract.mjs:555-565`
- 根拠: 既存の採用者への影響が出るのは、`/pit`(next.mjs の段階「名簿に数値の識別子の無いアカウント」)、check-pr の数えない理由と警告、集約の accountMatching の3か所です。契約検査と PROCESS-PROFILE.md には出ません。影響は出力から追えます。契約検査の通過だけを見る運用では気づけません

### L-8. 名簿と名義を書き換える経路は、名前の記名に頼っている(IMPL-0415 が未達)

- 所在: `template/.claude/skills/process-change/kinds/accountable.md:45`(「エージェントの判断で識別子を書き足さない」は指示だけ)
- 根拠: roster-ids.mjs と env-check は構成を書き換えません。この点は確かめました。構成を直接編集した場合は、changeLog の要約値の連鎖(configDigest)が検出します。一方、`/process-change` が受け付ける decidedBy は名前の一致だけで照合されます。AI の担い手が人の名前を書けば通ります。ADR-0108 決定3 はこれを IMPL-0415(#428、undelivered)で降ろすとしており、台帳に未達として出ています。新しい欠陥ではありません。H-2 と組み合わさると、署名すら要らない経路になります

## 既存の決定と試験の材料(確かめること 4)

- `scripts/regress/suite/*.mjs` の差分は、名簿の要素を `rosterAccount(login)`(`{login, id}`)へ置き換えたものと、D-0 の期待文に新しい列(未申告・`(#id)`)を足したものだけです。拒否と受理の期待、K 番号の決定は変えていません(scenarios.mjs:225-232 の「アカウントを足す」の記名の期待も、そのまま残っています)
- `template/scripts/gate/test-*.mjs` の差分も、名簿と記録の材料へ識別子を足したものです。期待を変えたのは次の3つで、いずれも #430 の決定に沿っています。test-aggregate-records の a9(大文字小文字を問わないログイン名の照合 → 識別子の照合)、a10 の追加(ログイン名だけ・識別子の食い違いは数えない)、test-roster-rules の列の数(6 → 7)
- 黙って決定を変えたと読めるのは、H-2(共有→専用を厳しくする向きとし、記名を要しない)の1件です。test-loosening-decider.mjs:202 で新しく固定しています
- 低: 回帰の代役 `scripts/regress/lib/bin/gh:12` は、識別子の無い REST の書き手に、ログイン名から決まる識別子(`regressAccountId`)を自動で足します。名簿も同じ関数で識別子を作るため、suite の中では「ログイン名が一致すれば識別子も一致する」が成り立ちます。照合がログイン名へ戻る後退があっても、suite は検出しません。食い違い(mismatch)の場面も suite には置けません

## CI(Linux)で落ちうる点(確かめること 5)

- C-1(低): `template/scripts/gate/test-env-check.mjs:139` は Windows で試験の全体を省きます。そのため、新しく足した名義の照合の場面(IMPL-0421 の試験)は、手元では一度も流れていません。論理は scratchpad で `performerAccountEnvFinding` を直接呼んで確かめ、期待(「名簿 乙」・confirmed・unconfirmed)と一致しました。env-check の全体(9項目と終了コード)が、post-build で performer を書き足した構成で動くかは、Linux で流すまで分かりません
- C-2(低): 未追跡の新規ファイル(`scripts/regress/lib/account-id.mjs`、template の `roster-ids.mjs`・`test-roster-ids.mjs`・`test-performer-account.mjs`)をコミットし忘れると、CI が落ちます。代役の gh は account-id.mjs を import し、gate-g5.yml は2つの試験を実行するためです。ルートの `src/data/template-fields.yaml` は、テンプレートの様式に新しい列を求めます。pit-in-template へ先に push し、submodule の参照を進めないと、ルートの `npm run check`(test:fields・test:template)が落ちます
- C-3(低・要確認): `aggregate-evidence.mjs` の restAccountsOf は `gh api --paginate repos/<r>/pulls/<n>/reviews` を `--jq` なしで JSON.parse します。gh の版によっては、複数の頁の配列を連結して出力し、JSON として読めません。読めなければ、gh pr view の識別子の無いレビューへ戻り、その PR の承認を数えない側に倒れます。material-attribution の ghHosting にも、前からある同じ形があります。30 件を超えるレビューを持つ PR で起きます
- `npm run test:regress` と `npm run check` の全体は、この突合では流していません

## 確かめて問題が無かった点

- identifyAccount の分岐(id の一致と改名・mismatch・名簿に id が無い・記録に id が無い・none)は規定どおりです。ログイン名だけの一致は、どの呼び出し側でも person を返しません
- 契約検査の id(正の整数・重複・同じ login に別の id)と、performerAccount(kind・正の整数の id・名簿との login と id の重なり・shared の person の実在・知らない欄)
- G-6: dedicated のアカウントの承認を識別子で数えない(check-pr・集約)。名義を共有する人の承認は数えて印を付け、印は PR のレビューの承認に限る
- 効力を持つ記録: 名義を共有する記名者の、レビュー・作成・承認・署名コミットだけでは帰属に数えない。名義を共有していない人の承認を要し、その人がいない体制では自己申告として区別する(material-attribution の3つの関数)
- 名義の変更は種別 performer に限る。専用から共有・未申告へは、当該の席の責任者の記名を要する。名義は performerKey に含めず、適合性確認を失効させない
- PR の作成者の識別子(PR_AUTHOR_ID)、写しの author.id、REST のレビューの user.id、check-delegation の id を、それぞれの照合へ渡している
- D-0 表5-2・表7 の列を生成区間で埋め、#430 より前の生成区間も一致として受け付ける
- ADR-0107 の帰結(85-87 行)は、IMPL-0420〜0429 を undelivered と書いたままです。採用済みの ADR は書き換えない運用のため、所見にはしません
