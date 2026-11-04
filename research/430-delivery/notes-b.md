# #430 後半(AI の担い手の名義の申告と、名義の共有の扱い)の実装の記録

担当: 準拠テンプレート(template/)の実装担当のサブエージェント(後半)。前半(notes-a.md)の作業ツリーに積み上げる。コミット・push はしない。

## 着手時の状態

- template/ の作業ツリーは前半の変更を持つ(HEAD d8423fb + 前半の未コミットの変更)

## 設計の判断(実装の前に決めたこと)

- 名義の欄 `seats[].performerAccount`: `{ kind: 'dedicated', account: { login, id } }` / `{ kind: 'shared', person: '<名簿の id>' }` / 無記入(未申告)
- 名義の申告が意味を持つ席: 担い手を宣言した席(`performer` あり)と、名義を明示した席(`performerAccount` あり)。未申告(無記入)は、担い手を宣言した席に限って「その席の責任者と共有」と扱う(担い手のいない席に担い手の名義は無い)。共有を明示した席は、担い手の宣言の有無に依らず共有として扱う(安全側)
- 初期化の「自分たちのアカウント」は、名簿が空の時点の回答であり、person を書けない。`{ kind: 'shared' }`(person なし)を受け付け、その席の責任者と共有するものとして扱い、契約検査の注記で person の記入を促す(失敗にしない)

## 実装したこと

- config.mjs: 名義の読み取りと判定の関数群(`performerAccountOf`・`performerAccountStates`・`sharingPeople`・`sharingOf`・`sharingText`・`dedicatedSeatOf`・`performerAccountProblems`・`performerAccountEnvFinding`・`PERFORMER_ENV_SCOPE`・`PERFORMER_ACCOUNT_LABEL`)。`claimStatus` の離脱を申告から導く(担い手を宣言した席で専用でないもの + 共有を明示した席)。`configIntegrityProblems` が名義の契約の問題を出す。`performerKey` は変えていない(名義を識別に含めない)
- verify-gate-contract.mjs: 名義の契約検査(problems)と注記(共有の相手の未記入)、共有・未申告の列挙に無い離脱の注記
- check-pr.mjs: `approverFindings` が専用のアカウントの承認を数値の識別子で数えず(notCounted)、名義を共有する人の承認を数えて `sharedApprovals` に印を付ける(G-6 の注記・警告に件数と相手を出す)。例外承認・停止の解除の (A) の裏づけの注記を出す。PR 本文の作成を指示した者の @アカウントを `accountLookup`(GH のトークンがある実行は `gh api users/<login>`、--pr の JSON の `accountIds` は固定の値)で数値の識別子へ解決し、identifyAccount で照合。解決できないものは unresolved。結果は `result.instructorResolution`(mode・at・entries[token, login, id, at, error, result, person, why])と注記(report に出る)。トークンの無い実行は mode: 'login'(従来の名の解決)とその旨の注記
- material-attribution.mjs: `signerSharing`(記名者が名義を共有するか + 確認者を置けるか)、`attributionConfirmers`(対象の PR の先頭に対する、名義を共有していない人の承認)。`exceptionReviewBacking`・`stopReviewCandidates`・`introducedBacking` が、名義を共有する記名者の本人の操作だけでは数えず、名義を共有していない人の承認を要する。確認者を置けない体制では `selfAttested` + `sharedAccount` で受け付け、注記に「名義の共有を理由とする自己申告」
- aggregate-evidence.mjs: `independentConfirmation` が専用のアカウントの承認を数えず(AI・bot と同じ扱い。`dedicatedApprovals`)、名義を共有する人の PR の承認を `sharedApprovers` に印。保証の開示の `independence.performerAccounts`(席ごとの状態・名義を共有するアカウントの承認の件数・名義の共有に依る帰属の件数(帰属の確認 / 自己申告)・記録)と `changes.sharedAccountApprovals`・`sharedAccountChanges`・`dedicatedApprovalChanges`。`previous.performerAccounts` を併記。report の項目1 の表に3〜4行
- adoption-trial.mjs env-check: `gh api user` を引き、`performerAccountEnvFinding` で照合した所見を記録の `performerAccount`(checkedAt・api・seatsInEnvironment・status・detail・seats・scope・proposal)へ書き、出力する。所見であり 9 項目の確認済みの判定と終了コードに入れない。`--seat <ロール,…>` で、この環境で動く担い手の席を限る。導入前の検証の記録にも1行を写す
- generate-profile.mjs: `buildSeats` が `performerAccount` を引き継ぐ。初期化の回答 `performerAccount`(dedicated / { kind: 'shared' } / "undecided")を読み(知識ベースの設問ではないため answers から外す)、人確定に限らない席へ書く。初期化の名簿が空のため共有の person は拒否。設定済みの構成の再生成で回答の performerAccount を拒否。種別 performer の入力で `seats.<席>.performerAccount` を受け付け(他の種別は拒否、共有は person 必須、契約検査と同じ形の検査)、`diffConfig` が名義の差を変化点の行にし、専用 → 共有・未申告を緩める向き(`holderOnly`。`deciderProblems` が当該の席の責任者の記名に限る)、逆を厳しくする向きとする。適合性確認・即時通知には触れない。D-0 表5-2 に列「アカウントの数値の識別子」(アカウントの列はログイン名だけ)、表7 に列「担い手の名義(専用 / 共有 / 未申告)」(共有の相手は表5-2 の識別子)。#430 より前の生成区間(列なし)も一致として受け付け、/pit の再生成の勧めに出す(`before430`)。PROCESS-PROFILE.md に節「AI の担い手の名義」(共有・未申告なら列挙に無い離脱)。初期化の出力に `[名義]` の行
- 様式: templates/00-d0-governance.md の生成区間の雛形を再生成し、節1・節12 の説明を足した。標準の deliverable-templates.md の表5-2(列と欄の行)・表7(列と注記)を足した。src/data/template-fields.yaml に2欄を登録
- スキル: process-init/SKILL.md に「2b. AI の担い手の名義を聞く(全規模)」と回答ファイルの例、process-change/kinds/performer.md に「担い手の名義を変える」、reference/input.md・SKILL.md の索引
- 試験: test-performer-account.mjs(49 件。IMPL-0420・0421・0423・0427 の :ok/:ng)、test-loosening-decider.mjs に名義の変更の入口の場面(IMPL-0429 の :ok/:ng)、test-init-g5.mjs に名義の問いの場面(IMPL-0428 の :ok/:ng)、test-env-check.mjs に env-check の照合の場面(IMPL-0421。Windows では省かれる試験。WSL で通過)、test-roster-rules.mjs の名簿の列の数を 7 へ。gate-g5.yml に test-performer-account.mjs

## 作業の注意(後続へ)

- Windows の Python の open() は既定で CRLF を書く。.md を LF に戻した(templates/00-d0-governance.md・deliverable-templates.md・スキルの md)。test-discouraged-evidence は D-0 の雛形を LF 前提の正規表現で読む
- WSL の複製 /tmp/pc430 は、scratchpad の sync-wsl.sh(rsync と改行の LF 化)で作業ツリーから更新した
- 回帰: scripts/regress/suite/scenarios.mjs の場面「D-0 の節12 に委任の範囲が出る」の期待の行に、表7 の担い手の名義の列(未申告)を足した(意図は変えていない)

## 試験の結果

- 手元(Windows): gate-g5.yml の試験は test-g5-aggregate(CRLF。既知)と test-results(引数が要る)を除いてすべて通過(test-performer-account 49 件を含む)。`npm run test:template-suite` は test-g5-aggregate の失敗だけ。`npm run test:fields`・`npm run test:template`・`npm run lint:impl`(impl:write で台帳を再生成)通過。textlint(deliverable-templates.md)通過
- WSL: test-env-check(名義の照合の場面を含む)・test-g5-aggregate・test-performer-account・test-loosening-decider 通過。`node scripts/regress/run.mjs --kb keep` は 21 本のうち scenarios の 1 場面が落ち(上の列の追加)、期待を直して scenarios を再実行し通過。test-run.mjs 30 件通過

## 未実装・決めきれなかったこと

- 標準の実装マーク IMPL-0420〜0424・0426〜0429 の state は undelivered のまま(標準の文言を変えない制約)。delivered へ改める側で、note の「準拠テンプレートは名義の欄を持たない」等の限界の文と test= を直す必要がある(試験の目印: IMPL-0420・0421・0423・0427 は test-performer-account.mjs、IMPL-0421 は test-env-check.mjs にも、IMPL-0428 は test-init-g5.mjs、IMPL-0429 は test-loosening-decider.mjs)。IMPL-0422・0424 は試験の目印を置いていない(0422 は test-roster-rules の列の数と test-loosening-decider の表7 の確かめ、0424 は集約の本体の中で、端から端までの試験は無い)
- 保証の開示の項目1 の件数(名義を共有するアカウントの承認・名義の共有に依る帰属)を、集約の本体を流して確かめる試験は無い(independentConfirmation が本体の閉包の中にある)。数え方の規則は check-pr の approverFindings と同じ形で、そちらを試験した
- env-check から名簿の数値の識別子を提案する経路は、認証したアカウントのログイン名が名簿の識別子の無い要素に当たる場合の提案文だけ(構成は書き換えない)
- 1つの専用のアカウントを複数の席に書くこと(初期化の専用の回答は人確定でない全席へ同じアカウントを書く)を、契約検査は拒否しない。第3章 3.5.3 の表の条件3(担い手どうしの認証情報を分ける)との関係は確かめていない
- graphify update は実行していない(CI の自動更新に委ねる)

## 規定との食い違い・判断した点

- 初期化の「自分たちのアカウント」は名簿が空のため person を書けない。要求事項2「誰のアカウントかを名簿の識別子で書く」に対し、{ kind: 'shared' }(person なし)を受け付けて席の責任者を相手に補い、契約検査の注記で記入を促す(失敗にしない)。/process-change では person を必須にした
- 名義の申告が意味を持つ席を「担い手を宣言した席(performer)と、名義を書いた席」とした。担い手を宣言していない席の未申告は離脱に数えない(IMPL-0430 の既存の扱いと同じ)。共有を明示した席は担い手の宣言が無くても離脱に数える(安全側)。初期化の回答は人確定に限らない席へ書く(どの席の担い手が GitHub を操作するかを初期化では問わないため)
- 専用から共有への切り替えの記名を当該の席の責任者に限った(D-0 表1 の決定者では受け付けない)。ただし独立レビュアの席の責任者が外部の確認者の場合は、第3章 3.13.3 の「席の責任者の記名では受け付けない」を優先した(この組み合わせでは表1 の決定者の記名になる)。標準はこの衝突を定めていない
- 帰属の確認者の条件: 記名者が名義を共有する場合だけ、確認者を「名義を共有していない人」に限った。記名者が名義を共有しないときに、名義を共有する人が帰属の確認をした場合は従来どおり数える(標準の文は記名者の側の共有だけを定める)
- G-6 の判定記録(様式)の記名者が名義を共有する場合の印は付けていない。「名義を共有するアカウントの承認」をホスティングの承認(PR のレビュー)に限って数えた
- env-check は人(採用者)が自分の環境で実行する前提の道具で、要求事項5「担い手の実行環境で」とは一致しない場合がある。照合の範囲(実行した環境と時点)を出力と記録に書き、--seat で「この環境で動く担い手」の席を限れるようにした

## 突合の後の訂正(crosscheck.md の裁定による)

- H-1(直した): env-check の照合の結果を名義の数え方が読む。記録の置き場は env-check の記録(docs/adoption-trial/env-check.json)の `performerAccountBySeat`(席ごとの最後の照合。`--seat` を付けた照合だけを書き、前の記録の他の席の照合は残す。checkedAt・checkedBy・account・person・status・照合の時点の申告 declared)。鮮度は既存の env-check の記録と同じく作業ツリーの記録をそのまま読み、期限を置かない。config.mjs の `performerEnvRecord`(構成の `performerEnvCheck` があればそれを使う。試験用)と `performerAccountOf(config, seat, { env })`。照合で名簿の人に当たった席は申告が専用でも shared(その人)として扱い(claimStatus の離脱・sharingOf による G-6 の印・効力を持つ記録の帰属の確認)、`env.override` を立てる。専用の申告は、申告と同じアカウントの照合が confirmed のときだけ `envConfirmed`。claimStatus は確認の無い専用を「AI の担い手の名義の照合が無い」(derived: performer-account-unverified)の離脱に数える。名義の数え方(dedicatedSeatOf の承認の除外)は申告だけで読む(専用と申告したアカウントの承認は、照合の結果に依らず数えない)。D-0 の生成区間と変化点の差分は申告だけ(declaredPerformerAccountOf)で読む(env の記録で D-0 の一致が崩れないように)。契約検査の注記・PROCESS-PROFILE.md・保証の開示の項目1 に照合の状態を出す。試験: test-performer-account(照合の上書き・未確認の離脱・申告の変更後の失効)、test-material-attribution の IMPL-0430 の場面を照合ありへ改めた、test-env-check(席ごとの記録)
- H-2(直した): 専用と共有・未申告のあいだの切り替えは、どちらの向きも当該の席の責任者の記名と理由を要する(diffConfig の `crossing`)。**ADR-0107 が定めていない逆向き(共有・未申告 → 専用)を、記名を要する側に倒した**。変化点の向きは loosen として記録される。test-loosening-decider の場面を改めた(記名なし・表1 の決定者の記名を拒否、席の責任者の記名で受理)。performer.md を改めた
- H-3(直した): 1名の体制で、決定者本人の行の既存のログイン名に数値の識別子を足すだけの変化点(ログイン名の集合が同じ、既存の識別子を変えない、氏名を変えない)を本人の記名で受け付ける。rosterEdits に `selfIdAddition: true`、差分の行と変化点の記録の表示に「本人の記名による数値の識別子の追加。1名の体制」。accountable.md に書いた。試験: test-roster-ids(受理・記録・ログイン名の変更は拒否・2名以上は拒否)
- M-1(直した): 集約の作成を指示した者のアカウントの記載を、repo を引ける実行では gh api users/<login> で解決し identifyAccount で照合する(check-pr と同じ `resolveInstructorToken`・`ghUserLookup`)。引けない実行は名の解決のまま、保証の開示の名簿の照合の段落に出す。`accountMatching.instructorResolution`。回帰の gh の代役に `api users/<login>` を足した
- M-2(直した): 回帰に performer-account.mjs(13 場面)を足した。集約の本体を流し、名義を共有する人の承認の印・専用のアカウントの承認の除外・項目1 の件数と席の状態・名義を共有する記名者の台帳の行(帰属の確認ありは数え、本人の承認だけは数えない)を確かめる。expected/scenes/performer-account.txt を書き出した。足せなかった部分: 停止の解除の記録(解除の記録の noteShared)と、自己申告(確認者を置けない体制)の集約の通しは置いていない(関数の単体の試験だけ)
- M-3(直した): roster-ids.mjs は、author_association が書き込みの権限を持たない書き手のレビューを提案の根拠にしない。値の無い古い写しは読み、件数を出力に注記する。試験: test-roster-ids
- M-4(直した): identifyAt が、承認の時点の名簿にだけある人(現在の名簿に行が無い)の login-only を `formerUnfixable` として印を付け、保証の開示の名簿の照合の段落に「名簿から外した人の、照合の切り替え(#430)より前の承認 N 件を数えていない。直す手段が無い」を出す
- L-1(直した): 集約の例外承認のレビューの照合に、PR の作成者を { login, id } で渡す
- L-2(直した): check-pr・集約で、@ の無いログイン名(名簿の氏名・id に当たらず、名簿のアカウントに当たるもの)もアカウントの記載として識別子で解決する(`resolveInstructorToken`)
- L-3(直した): 未申告の席・相手の無い共有の席で席の責任者が未記入なら、契約検査の注記と保証の開示(「名義を共有する人が分からない」)に出す
- L-6(直した): env-check で --seat を省いた照合は status `notSpecified`(「どの席の担い手の環境かを指定していない」)だけを出し、席ごとの照合を記録しない(performerAccountBySeat を更新しない)
- C-3(直した): config.mjs に `parsePagedJson`(文字列の中を除いて最上位の JSON の値に切り分け、配列を連結して戻す)。集約の gh(--paginate のとき)と material-attribution の ghHosting が使う。引数は変えていない(代役と試験の鍵を保つ)
- L-4(残した): 初期化の回答は人確定に限らないすべての席へ名義を書く。統制は厳しい側に倒れ、IMPL-0428 の note と挙動が一致する。どの席の担い手が GitHub を操作するかを初期化では問わないため
- L-5(残した): 専用のアカウントが作成した PR の既定値の指示者が対応づかない。ADR-0107 決定3(作成を指示した者の既定値を変えない)のとおりで、#430 より前と同じ挙動
- L-7(残した): 契約検査は識別子の無い名簿のアカウントを注記しない。/pit・check-pr・集約の3か所に出ており、契約検査の合否に足す根拠が無い
- L-8(残した): 名簿と名義を書き換える経路の記名は名前の一致に頼る。IMPL-0415(#428)で降ろす未達であり、台帳に出ている。H-2 の訂正で署名の要らない経路は塞いだ
- C-1(残した): test-env-check は Windows で全体を省く。WSL で通過を確かめた(CI は Linux)
- C-2(残した): 未追跡の新規ファイルのコミットと submodule の参照の順序は、コミットする側の手順(この作業はコミットしない)
- 回帰の代役の所見(残した): 代役はログイン名から識別子を決めるため、照合がログイン名へ戻る後退を suite は検出しない。食い違いの場面はテンプレートの単体の試験(test-roster-ids・test-check-pr・test-aggregate-records)が持つ

### 訂正の後の試験の結果

- 手元(Windows): gate-g5.yml の試験は既知の2件を除いて通過(test-performer-account 60 件、test-roster-ids 47 件)。`npm run test:template-suite` は test-g5-aggregate だけ落ちる(既知)。`npm run test:fields` 通過。`npm run impl:write` の後に `npm run lint:impl` 通過
- WSL: test-env-check・test-g5-aggregate・test-performer-account 通過。`node scripts/regress/run.mjs --kb keep` は 22 本(21 本 + performer-account)すべて通過。test-run.mjs 30 件通過
- 作業の注意: Windows の Python へ heredoc で日本語を渡すときは `python3 -X utf8` を使う(既定では標準入力を cp932 で読み、置換が一致しない)
