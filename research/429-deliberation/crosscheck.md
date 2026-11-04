# #429 の独立した突合

対象: 作業ツリーの未コミットの変更(process-compass 本体の diff、template の diff、未追跡の ADR-0107・ADR-0108、`template/.claude/hooks/guard-bash.mjs`、`template/scripts/gate/test-guard-bash.mjs`)。照らした基準: `research/429-deliberation/decision.md`(裁定)、既存の ADR(0035・0070・0083・0106)、第1章 1.10.2、第3章 3.4.2・3.5.3・3.13.1、第4章 G-6・「判定の成立」・「判定記録を基底ブランチへ入れる操作」、第5章 5.8.6。実装した者の説明は読んでいない。

実行して確かめたこと(2026-11-05):

- `node scripts/gate/test-guard-bash.mjs`(26 件一致)、`test-check-pr.mjs`、`test-material-attribution.mjs`(54 件一致)は通る
- `npm run lint:impl`・`lint:evidence`・`lint:refs`・`lint:scope`・`test:impl`・`test:template` は通る
- `node scripts/test-template-suite.mjs` は `test-g5-aggregate.mjs` だけが落ちた。原因は作業ツリーの `template/.github/workflows/gate-g5.yml` が CRLF であること(索引は LF。`git ls-files --eol` で `i/lf w/crlf`)。LF に直した複製では通る。CI(Linux)では起きない(所見 L-1)
- `scripts/regress/run.mjs` は Windows では gh の代役を呼べないため、WSL で LF に直した template の複製に対して実行した(結果は末尾の「回帰の試験」)
- フックの検出は、`hostingWriteOf` に命令文を渡す試験の外の 22 件で確かめた(所見 M-1・M-2 の根拠)

重大度: 高 = 本文の規定とテンプレートの手順・実装が逆を指す、または降りていない規定を降りたと表示している。中 = 主張が実装より広い、検出の穴、語彙・規定の曖昧さで読み手が誤る。低 = 古い注記・表記・局所の不整合。

---

## 高

### H-1 3.5.3 要求事項4 の「記録用ブランチへの push」の拒否が無いのに、要求事項4 を delivered のマークだけで覆っている。テンプレートの手順は担い手が records へ push する体制を前提にしたまま

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:631`(要求事項4)、`:637-638`(IMPL-0418・0419)、`src/data/impl-inventory.yaml` の「人と AI の担い手の名義」の `要求事項4: ids [IMPL-0418, IMPL-0419]`、`template/.claude/skills/gate/reference/recording.md:88`、`template/CLAUDE.md:107`(CR-095)
- 根拠: 要求事項4 は「共有」と「未申告」の担い手に、承認・レビュー・マージ・**記録用ブランチへの push**・**ブランチ保護の変更**・認証情報の読み出しの拒否を求める。フックは `git push` を見ず(`git push origin records`・`git push origin HEAD:records` は通る。実行して確認)、権限設定にも records への push の拒否は無い(`.claude/settings.json` の deny は `git push --force`・`-f` だけ)。要求事項4 の行に付いたマークは2件とも delivered で、undelivered の部分を表示するマークが無い。台帳の上では要求事項4 が降りたと読める
- さらに `recording.md:88` は改めた後も「草案の文脈(AI の担い手)が push する体制(担い手の名義を共有する体制)では、記名が自己申告であることを集約が保証の開示へ出す」と書き、担い手が records へ push する運用を手順として残している。同じテンプレートの常駐の規則 CR-095 は「記録用ブランチへの push をしない」と定めており、手順書と常駐の規則が逆を指す。「担い手が push する体制」と「名義を共有する体制」を同一視している点も、3.5.3 要求事項2 の定義(能力で判定)と合わない
- 見立て: 誤っているのは実装マークとテンプレートの手順。本文の要求事項4 は裁定 R-5(承認・レビュー・マージ・記録の push のすべてへ広げる)どおり
- 重大度: 高

### H-2 テンプレートのスキルが、名義を共有する体制で「記名者本人が作成者または承認者となる PR」を帰属の裏づけとして案内し続けている

- 所在: `template/.claude/skills/gate/gates/G-5.md:29`、`template/.claude/skills/gate/SKILL.md:82`
- 根拠: 2 か所とも「対象が PR でない場合と認証情報を共有する体制では、記名者本人が作成者または承認者となる PR で基底ブランチへ先に入れる」と書く。改めた第4章(`gate-criteria.md:132`)は、名義を共有する構成で記名者のアカウントの操作(記録を入れた変更の作成と承認を含む)を、それだけでは帰属の裏づけに数えず、名義を共有していない人の帰属の確認を要するとした。`recording.md` の手順4 は改めたが、入口の 2 か所が古い前提(記名者の操作で足りる)のまま残る。語も「認証情報を共有する体制」のままで、3.5.3 の「名義」に揃っていない
- 見立て: 誤りはテンプレート側(裁定 R-2 の効力を持つ記録の扱いに反する)
- 重大度: 高

---

## 中

### M-1 フックの検出漏れ: シェルの構文の上の直接の起動を見逃す

- 所在: `template/.claude/hooks/guard-bash.mjs:22-49`(`segmentsOf`)、`:75`(読み飛ばす語)、`:78-80`
- 根拠: 次の形は、変数の展開でも担い手が書いたプログラムでもない直接の起動だが、すべて通った(`hostingWriteOf` を実行して確認)
  - 単独の `&` で区切った形 `gh pr list & gh pr merge 1`(`segmentsOf` は `&&` だけを区切る)
  - サブシェル `(gh pr merge 1)`、`if true; then gh pr merge 1; fi`(先頭の語が `(gh`・`then` になる)
  - ラッパー `timeout 30 gh pr merge 1`、`xargs -n1 gh pr merge`、`bash -c "gh pr merge 1"`(読み飛ばす語は `command`・`exec`・`env`・`sudo`・`nohup`・`time` だけ)
  - サブコマンドの前のフラグ `gh pr -R o/r merge 1`(`sub2` が `-R` になる)
  - `curl -d@body.json …`(`-d` の直後に値が続く形。正規表現は `=` か語の終わりを要する)、`curl --request=POST …`
  - GraphQL の mutation を `-F query=@m.graphql` や `--input q.json` で渡す形(mutation の語が命令文に現れない。権限設定の `ask` の `Bash(gh api graphql:*)` が前方一致で掛かる場合だけ止まる)
- IMPL-0418 の note と EV-0222 は、止めないものを「命令の組み立て・担い手が書いたプログラム」としか書いていない。上の形はそのどちらにも当たらないのに止まらない。試験(`test-guard-bash.mjs:21-51`)は単純な形だけを持つ。抑止の層である位置づけ自体は正しいが、止まらない範囲の記述が実際より狭い
- 重大度: 中

### M-2 認証情報の読み出しの拒否が `gh auth token` に限られる。5.8.6 の新しい段落が「接触」に数えた範囲を、テンプレートは降ろしておらず、未達の表示も無い

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md:1080`、`template/.claude/hooks/guard-bash.mjs:70,81`、`template/.claude/settings.json`(deny の `Bash(gh auth token:*)`)
- 根拠: 5.8.6 に足した段落は「与えた認証情報そのものの読み出し(トークンを表示する操作を含む)は、要求事項1 の接触に当たります」とする。要求事項1 は実行時の拒否を求め、拒否を実装していない実行基盤は 5.8.6 に適合しない(同節 :1084)。`gh auth status --show-token`・`gh auth status -t`・`echo $GH_TOKEN`・gh の設定ファイルの読み出しは通る(前二者は実行して確認)。この段落に実装マークは無く、IMPL-0418・0419 の note は `gh auth token` だけを挙げる。降りていない部分が台帳に出ない
- 逆向きの誤検出もある: フックは命令文の全体に `\bgh\s+auth\s+token\b` を当てるため、`git commit -m "docs: gh auth token を拒否する"` を拒否する(実行して確認)。試験には `gh pr merge` を含むコミットの文を通す例しか無い(`test-guard-bash.mjs:47`)
- 重大度: 中

### M-3 既存の settings.json を持ち込む採用者には、Bash のフックが登録されない。契約検査も登録の欠けを見ない

- 所在: `template/scripts/gate/config.mjs:2180-2183`(`TEMPLATE_HOOKS`)、`src/content/docs/phase4-process-design/roles-responsibilities.md:638`(IMPL-0419 の「Bash のフックを登録する」)
- 根拠: フックの登録の併合(`mergeHookRegistration`、`--merge-hooks`、`tailorGuardAndSettings` の戻り値)と契約検査(`hookRegistrationProblems`)は `TEMPLATE_HOOKS` の2件(guard-write と next.mjs)だけを扱う。guard-bash は雛形の `.claude/settings.json` にだけ書かれている。既存の settings.json を残す持ち込み(ADR-0085 決定2 が塞いだ経路)では、guard-bash の登録が黙って外れる。IMPL-0419 の「Bash のフックを登録する」は雛形の新規の採用に限って正しい
- 重大度: 中

### M-4 IMPL-0425 の主張(delivered・check=machine)が試験の範囲より広い。集約は数えない理由を出さない

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:90`(IMPL-0425)、`template/scripts/gate/test-check-pr.mjs:717-738`、`template/scripts/gate/aggregate-evidence.mjs:246,1399`、`:297-324`(`lastReviewStates`)
- 根拠: note は関係の照合を「G-6 の承認者の数、効力を持つ記録のレビュー、出荷の集約の承認」の3か所に掛けたとするが、試験は `approverFindings` の3件だけで、`material-attribution.mjs` の `reviewerCheck` と集約の `reviewsOfCopy`・API のレビューの置き換えを実行する試験は無い(`test-material-attribution.mjs`・`test-g5-aggregate.mjs` に `author_association` の材料が無い)
- 集約は、関係の無い承認の状態を `UNTRUSTED` に置き換えるだけで、`lastReviewStates` が状態の一覧に無い値として黙って読み飛ばす。数えなかった理由が G-6 の所見・保証の開示のどこにも出ず、出荷判定者には承認の不足としか見えない。PR の時点の検査は理由を出す(`check-pr.mjs:706-708`)ため、両者の出力が割れる
- 重大度: 中

### M-5 「書き込みの権限を持つ者の値(OWNER・MEMBER・COLLABORATOR)」は GitHub の値の意味と合わない。外部の確認者の承認を新たに落とす

- 所在: `src/content/docs/adr/0108-roster-matched-by-numeric-account-id.md:34-36`(決定4)、`template/scripts/gate/config.mjs:600-611`(`hasWriteAssociation` の注記)、IMPL-0425 の note
- 根拠: GitHub の `author_association` の MEMBER は所有する組織の構成員であることを、COLLABORATOR は招かれた協力者であることを示し、どちらも読み取りだけの権限で付く。値は書き込みの権限の有無を示さない。照合が数えない側へ倒す向き(NONE・CONTRIBUTOR などを数えない)は安全側だが、ADR と注記の「書き込みの権限を持つ者の値」「書き込みの権限を持たない関係」は過大な読み方である
- 帰結として、協力者に招いていない名簿の人の承認(公開リポジトリで 1名の体制が置く外部の確認者など。第4章 G-6 基準4 は 1名体制に外部の確認者を求める)は、名簿にあっても数えなくなる。この挙動の変化を、本文の規定・ADR-0108 の帰結・会議体の裁定のいずれも扱っていない
- 重大度: 中

### M-6 関係の照合(ADR-0108 決定4)が本文の規定に無い。実装マークだけが規定を持つ

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:84`(「アカウントと人の対応表」の条)と `:90`(IMPL-0425)
- 根拠: :84 の条は数値の識別子による照合を定めるが、書き手のリポジトリとの関係で承認を数えないことは書いていない。IMPL-0425(delivered)の note と ADR-0108 決定4 だけが、この数え方を持つ。G-6 の「承認を独立した人の確認に数える条件」(`:949` 以下の表と箇条)にも無い。採用者がテンプレートを使わずに本標準へ従う場合、この規則を読む場所が本文に無い。裁定 R-4 は F-4 を「欠陥として直す」としただけで、条項の形は決めていない
- 見立て: 本文に条を足すべきか、テンプレートの実装上の防御(本文の数値の識別子の要求の暫定の代替)と位置づけて note にその旨を書くべきかの決定が欠けている
- 重大度: 中

### M-7 F-5(作成を指示した者の黙った脱落)は G-6 の承認者の数だけを直し、PR の時点の他の照合は直っていない

- 所在: `template/scripts/gate/check-pr.mjs:1071`(例外承認の裏づけの `instructorIds`)、`:1082`(規模の確認の実施者)、`:1263`(リスク区分の確定した者)、IMPL-0425 の note「PR の時点の検査は、名簿に対応づかない作成を指示した者を黙って落とさず」
- 根拠: 3か所はいずれも `instructorsOf`(対応づいた者だけを返す)を使う。作成を指示した者を旧いログイン名(`@yamada-old`)で書いた PR では、指示した者本人のレビューが例外承認の裏づけに数えられ、本人がリスク区分の確定した者として通る。集約は対応づかない指示者を `exceptionMatch` へ渡して数えない(`aggregate-evidence.mjs:1825,1953,2065`)。裁定 R-4 が欠陥とした「PR の時点の検査と集約の割れ」が、効力を持つ記録(#380 が塞いだ経路)の側に残る
- check-pr の既定値(欄が未記入)は PR の作成者だけを指示者とし、集約は開発者の席の責任者も足す(`aggregate-evidence.mjs:1088-1094,1112`)。注記の「出荷の集約と同じ」は既定値の側では成り立たない(既存の差だが、本件の注記が一致を主張している)
- 重大度: 中

### M-8 「未申告」のとき、誰を「名義を共有する人」とするかが本文に無い

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:965`(G-6 の「名義を共有する人(第3章 3.5.3。未申告を含む)」)、`:132`(効力を持つ記録の「記名者のアカウントを AI の担い手と共有する構成(… 未申告を含む)」)、`:133`(「記名者以外で名義を共有していない人」)、IMPL-0427 の note(「無記入の担い手と共有する人」)
- 根拠: 3.5.3 要求事項2 は「共有」の申告に「誰のアカウントか」を書かせるが、「未申告」には人の指定が無い。未申告の担い手について、承認を開示に数える対象の人、帰属の確認者に当たらない人を、名簿の全員とするのか、席の責任者とするのかが定まらない。名簿の全員とすれば帰属の確認者が常にいなくなり、すべての効力を持つ記録が自己申告に落ちる。準拠テンプレートの採用者は名義の欄が無い(#430)ため、当面は全員が未申告に当たる
- 重大度: 中

### M-9 「名義」の語が、既存の「AI の名義」と別の意味で同じ条に並ぶ

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:624`(定義)、`gate-criteria.md:963-965`(「AI と bot の名義による承認は数えない」の次の行に「名義を『専用』と申告した」「名義を共有する人」)、`overview.md:628`
- 根拠: 既存の本文は「AI の名義」を、AI を示す語を含む名・アカウント(機械が語で見分ける対象)の意味で広く使う(gate-criteria.md だけで 13 か所)。新しい「担い手の名義」は、ホスティングが操作を誰のアカウントとして記録するかを指す。同じ箇条の中で、前者は「数えない」の対象、後者は「数えて開示」の対象であり、読み手が取り違えると数え方が逆になる。第1章 1.4 の用語に「名義」の定義は無い
- 重大度: 中

### M-10 裁定が #430 へ回した D-0 表5-2・表7 の列と `/process-init` の問いに、undelivered の表示が無い

- 所在: 裁定「降ろす順序」の #430 の列挙、`src/content/docs/phase4-process-design/deliverable-templates.md`(第6章 テンプレ0)、`roles-responsibilities.md:639`(IMPL-0420)
- 根拠: 裁定は「本文の要求事項は本件で置き、降りていない規定(undelivered)として表示する」とした。IMPL-0420 の note は `seats[].performerAccount` と契約検査だけを書き、D-0 の列と `/process-init` の問いを含まない。第6章の D-0 の様式(表5-2・表7)には名義の列が足されておらず、本文側にも置かれていない。名義の変更を反映する `/process-change` の経路(変化点4 に足した部分)も、マークの対象に無い
- 重大度: 中

### M-11 第1章 1.10.2 に足した離脱を、出荷の集約の「述べられる名」(IMPL-0308、delivered)が導かない

- 所在: `src/content/docs/phase4-process-design/overview.md:605`(IMPL-0308)、`:628`(足した行)
- 根拠: 足した行により、名義を申告していない構成は規模を問わず適用の表明までになる。準拠テンプレートには名義の欄が無く、全採用者が未申告に当たる。集約の `claim` は構成の `deviations[]` から名を導くため、従来どおり「適合の主張」を出し得る。IMPL-0420 の note(undelivered)が「共有・未申告を列挙に無い離脱として出すこと」を持つので台帳には出るが、IMPL-0308 の note は名を範囲の離脱から導くと主張したまま改められていない。出力の名が本文の帰結より強い期間が #430 まで続くことを、どちらの note も書いていない
- 重大度: 中

---

## 低

### L-1 作業ツリーの gate-g5.yml が CRLF になっている

- 所在: `template/.github/workflows/gate-g5.yml`(`git ls-files --eol` で `i/lf w/crlf`。CRLF 400 行)
- 根拠: 手元の `test-g5-aggregate.mjs` が、ワークフローの本文を `\n` で切り出す4件で落ちる。索引は LF で `core.autocrlf=true` のため、コミットすれば LF になり CI(Linux)では落ちない。手元で `npm run check` を通そうとすると落ちる
- 重大度: 低

### L-2 裁定 R-5 の「前方一致で表せる形(-X・--method)を deny」は権限設定に入っていない

- 所在: `template/.claude/settings.json`、`template/scripts/init/generate-profile.mjs:5526-5530`
- 根拠: deny に足したのは `gh auth token` だけで、書き込みの形の `gh api` はフックだけが受け持つ。`gh api -X POST …` の形は前方一致で書けるが、置いていない。フックが外れた場合(M-3)の後ろ盾が無い。裁定との差の理由は記録に無い
- 重大度: 低

### L-3 常駐の規則の「構成の後は拒否」は guard.enabled が偽の構成で成り立たない

- 所在: `template/CLAUDE.md:102`、`template/scripts/init/generate-profile.mjs:5549-5552,5586-5593`
- 根拠: `gh pr merge` の deny は `standardBash` にあり、guard.enabled が偽のときは外れて雛形の `ask` が残る。フックは guard.enabled に依らず止めるため実害は小さいが、権限設定の記述としては不正確
- 重大度: 低

### L-4 古い注記が残る

- `src/content/docs/phase4-process-design/gate-criteria.md:144`(IMPL-0417): 「gh api で直接レビューを作る経路は権限設定で止めない(読み取りと区別できない)」。本件でフックが書き込みの形を止めるようになった(起案の委員はこの note を改める案を出していた。`council-01-drafter.md:490`)
- `gate-criteria.md:140`(IMPL-0413): 「名簿の照合はログイン名(#429)」。後継は #430。関係の照合を足したことも書かれていない
- `template/scripts/gate/material-attribution.mjs:14`: 「数値の識別子での照合は process-compass #429」。後継は #430
- `template/scripts/init/generate-profile.mjs:5521-5523`: 「gh api で直接レビューを作る経路は止めない(読み取りの gh api と区別できない)」
- `template/scripts/gate/material-attribution.mjs:48-50`: `association` の行が `editedBy` の注記とその行の間に入り、注記が別の行に掛かって読める
- 重大度: 低

### L-5 第3章 3.4.2 要求事項7 の「(3.13.1 の変化点4)」が、名義の変更を含むようになった変化点4 と食い違って読める

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:186` と `:192`、`:1926`(3.13.1 の変化点4)
- 根拠: :186 は「担い手の識別が変わった時点で失効する(3.13.1 の変化点4)」とし、変化点4 全体が失効の契機と読める。変化点4 には失効させない名義の変更が加わった。:192 の段落が補うが、表の行の参照は狭めていない
- 重大度: 低

### L-6 G-6 の箇条の途中に根拠水準の囲みが入り、箇条が2つに割れる

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:961-987`
- 根拠: 「数える条件」の箇条(作成を指示した者の記録・AI と bot の名義・名義の専用・名義の共有)の後に IMPL と EV-0221・EV-0222 の囲みが入り、その後に同じ箇条の続き(AI を示す語を含むアカウント名の人、表5 の氏名の確認、語彙を狭めない)が別の箇条として描画される。囲みの後の3項目が数える条件の一部であることが見た目から読めない
- 重大度: 低

### L-7 IMPL-0422 が欠番になっている

- 所在: 台帳(`implementation-ledger.md`)は IMPL-0421 の次が IMPL-0423。`council-01-drafter.md:73` の起案では IMPL-0422 を権限設定に振っていた
- 根拠: 識別子を再利用しない規則には反しない。欠番の理由はどこにも書かれていない
- 重大度: 低

---

## 照らして食い違いの無かったもの

- 裁定 R-1(申告・能力・専用を課さない理由・1.10.2 の別の行・3.5.3 の小節)、R-2(G-6 は数えて開示、効力を持つ記録は名義を共有していない人の確認、既定値を変えない旨、recording.md の後退経路の改め)、R-3(識別に含めない・変化点4・失効させない)、R-4(要求の維持と全照合への拡大、移行期間を置かない、「リポジトリの外側」の改め、@アカウントの解決)は、本文・ADR-0107・ADR-0108 に反映されている
- #430 へ回した項目のうち、名簿の `{login, id}`・M4′・M6・`seats[].performerAccount`・契約検査・G-6 と集約の数え方・効力を持つ記録・保証の開示の項目1・env-check は、IMPL-0420・0421・0423・0424・0426・0427 が undelivered(plan=scheduled issue=430)で表示し、`lint:impl` の降りていない一覧に出る
- ADR-0106 の本文は書き換えていない。ADR-0107 は ADR-0035 と ADR-0106 決定3 を「補う」とし、ADR-0108 は ADR-0070 決定8 を「補う」とする。決定の置き換えは無い
- 第4章「判定の成立」の「名簿の変更を効力を持つ記録(D-0 の決定の記名)として扱う」は、ADR-0106 の列挙(D-0 の決定の記名)の中に収まり、列挙を広げていない
- 第5章 5.8.6 の段落は、名義の共有の使用を「接触」から外し、3.5.3 へ送る。要求事項1 の範囲を緩めるが、3.5.3 の要求事項4 が同じ操作の拒否を求めるため、規定の穴にはならない(ただし M-2)
- `instructorTokensOf` の既定値: 作成者が AI・bot の名(`[bot]` を含む)の場合は `aiNameBlocked` で対応づかない指示者に数えず、従来どおり指示者なしになる。作成者が名簿の外の人のアカウントの場合は対応づかない指示者になり承認を数えない(集約の既定値と同じ)。PR の時点の検査ではこれは警告であり、検査の合否は変えない
- `hasWriteAssociation` は値の無い材料で `null` を返し、呼び出し側は判定しない。`author_association` を持たない既存の写しと試験の材料は従来どおりに数える
- gate-g5.yml の `jq` と record-copy.yml の写しは `author_association` を渡し、集約の API のレビュー(`gh pr view --json reviews`)は `authorAssociation` を持つ。`hasWriteAssociation` は両方の綴りを読む

## 回帰の試験

WSL(node v22)で、LF に直した template の複製に対して `node scripts/regress/run.mjs --template <複製>` を実行した。21 の組(acquire・adjust・clock・matrix-sweep と sweep-1〜4・new・replay・s5-init-pr・scenarios・stages・t288・t288b・trial・tz・unit・v3・v3b・verify-n)の場面はすべて通り、落ちた場面は 0 件(`regress: すべて通った`)。`author_association` の欄を持たない材料は `hasWriteAssociation` が `null` を返して従来どおりに数え、作成を指示した者の欄は名簿の氏名(`NAMES[0]`)で書かれているため、新しい照合で崩れた場面は無い。`scripts/regress/test-run.mjs`(回帰の仕組みの自己試験)は Windows で gh の代役を呼べずに落ちるが、本件の変更に依らない(`run.mjs:196-201` が Windows の制約として明記)。

CI(Linux)で落ちる見込みの点は、本件の変更からは見つからなかった。手元で落ちるのは L-1(CRLF)と、Windows での test-run.mjs だけである。
