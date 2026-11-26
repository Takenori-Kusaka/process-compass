# #455 独立の突合 1巡目(全体)

- 日付: 2026-11-27。担当は実装を見ていない別の文脈。書いたのはこのファイルだけ(コード・本文は直していない。コミットしていない)
- 対象: 本体 0c0ebe5c、template 0186cd2・26d923d、`implementation.md`。#454 の未コミットの変更(template の check-pr.mjs・G-6.md・human-verify 等)は対象外
- 照らした裁定: `decision.md` R-1〜R-13(土台は `decision-draft.md`)

## 0. 結論

- 所見: 高 2・中 3・低 7
- 裁定と逆の文は無い。裁定に無い義務の追加・義務の意図しない減少も無い(基準9 を置かない・cooldown を課さない・記名の欄を足さない、のとおり)
- 高の2件は、どちらも**検証の欄(IMPL-1038)の表示と実態**。照会の欄(IMPL-1037)の読み取りは、実レジストリで正しく読めた

## 1. 実行で確かめたこと

| # | 確かめたこと | 結果 |
| --- | --- | --- |
| E-1 | 実レジストリ(registry.npmjs.org)の packument を読み取りだけで照会。`queryEntry` + `realFetchJson` をそのまま使い、lodash・semver・@sigstore/core・sigstore・typescript・@types/node の前後の版 | 6 件とも `queried`。`time[版]`・`time.created`・`_npmUser.name`・`dist.attestations`・`dist.signatures` を正しく読めた。scope つきの名前(`%2F`)も通る。大きい packument(@types/node)も 0.4 秒。attestation の真偽は semver・sigstore が true、lodash・typescript が false で実態どおり |
| E-2 | 最近の版の `_npmUser` の実データ(semver・npm・@sigstore/core・vite・eslint) | trusted publishing の版は、`_npmUser.name` が全パッケージ共通で `"GitHub Actions"`(`trustedPublisher.oidcConfigId` だけが違う)。同じ設定でも id の書式が版で揺れる(`oidc:d516…` → `d516…`)。所見 M-2 |
| E-3 | 一時ディレクトリで semver・lodash を install し `npm audit signatures`(npm 11.20.0) | 終了コード 0、`2 packages have verified registry signatures` / `1 package has a verified attestation`。`parseAuditSignatures` は passed |
| E-4 | 依存 0 件の package.json で `npm audit signatures` | 終了コード 1、`npm error found no installed dependencies to audit`。解析は `failed`・failedNames 0 件。所見 H-1 |
| E-5 | 解析に npm の文書の失敗の出力(`1 package has an invalid registry signature:` + `@npmcli/arborist@6.2.0 (…)`、CRLF)と、鍵の取得の不達(`EAI_AGAIN …/-/npm/v1/keys`)を与えた | 前者は名前を正しく取る。後者は `failed`・名前 0 件。所見 H-1・H-2 |
| E-6 | `diffNpmLock` に、版を変えず `resolved`(と integrity)だけを別のホストへ変えたロックファイルを与えた | entries 0 件。一覧の頭は「照会: 0 件中 0 件」「印の付いた行: 0 件」。生の差分の行にだけ出る。所見 M-1 |
| E-7 | `buildReport` に印の無い直接の依存 45 件 | 40 行を表示し、「表示の省略: 印の無い行 5 件」。直接の依存が表示から落ちる。所見 L-3 |
| E-8 | template の試験 | `test-dependency-diff.mjs` 32 件、`test-unregistered-name.mjs` 11 件、すべて通過 |
| E-9 | 本体の `lint:refs`・`lint:evidence`(334 件、期限到来 0)・`lint:scope`・`test:fields` | 通過 |
| E-10 | `lint:impl` | 作業ツリーでは「implementation-ledger.md が最新ではない」で落ちる。原因は #454 の template の未コミットの変更。HEAD(0c0ebe5c)と template 26d923d を `git archive` で一時の置き場へ出して流すと終了コード 0。#455 のコミットは台帳と整合している。**push の前に #454 と合わせて `impl:write` が要る** |
| E-11 | IMPL-E(未登録の名前で install が落ちる)の実レジストリでの再実行 | していない(実装の記録 §1 を採る)。結線の試験は通過 |

## 2. 所見

### 高

#### H-1 検証を実行できなかったことを「実施(失敗あり)」と表示する

- 所在: `template/scripts/gate/dependency-parse.mjs:173-183`(`parseAuditSignatures` が終了コード 0 以外をすべて `failed` にする)、`template/scripts/gate/dependency-diff.mjs:65-68`(`failed` を「実施(失敗あり。N 件の名前に…)」と出す)、`template/scripts/gate/dependency-provenance.mjs:97-102`
- 実態: `npm audit signatures` は、依存 0 件(E-4)、鍵の取得の不達(E-5)、私設レジストリだけの構成(鍵を出さないレジストリ。実行は未確認)でも終了コード 1 で終わる。このとき失敗の名前は 0 件で、一覧の頭は「検証: 実施(失敗あり。0 件の名前に「検証の失敗」)」になる
- 食い違い: 検証は行われていないのに「実施」と出し、改ざんの兆候の印(検証の失敗)が「あるが行が無い」状態を作る。条文(`gate-criteria.md` 基準8 の節「検証の結果」)と R-8 は、届かなかったことを「照会せず(理由)」として区別することを求めている。不達で「検証の失敗」と読ませるのは、EV-0353 が開示した偽陽性そのものを一覧に出すことになる
- 再現: `parseAuditSignatures('npm error code EAI_AGAIN\nnpm error request to https://registry.npmjs.org/-/npm/v1/keys failed', 1)` → `{status:'failed', failedNames:[]}`。これを `buildReport` の `verification` に渡す
- 直し方の案: 終了コード 0 以外で、失敗の節の見出し(`invalid registry signature`・`missing registry signature`・`invalid attestation` の類)が1つも無いときは `not-run`(実行できず。理由は出力の末尾)にする。`npm error` で始まる出力も同じ。試験に、依存 0 件と不達の出力の2件を足す

#### H-2 検証の結果を「種類で分けて書く」が降りていない(IMPL-1038 の note と挙動が食い違う)

- 所在: `gate-criteria.md:1279`(IMPL-1038 の note「npm audit signatures の結果を署名と来歴の証明の種類で書く」)、同じ節の箇条「検証の結果: 署名の検証と来歴の証明の検証を種類で分けて書き」、`decision.md` R-2「検証の種類(署名・来歴の証明・完全性)を欄に分けて書き」。実装は `dependency-parse.mjs:179-180`・`dependency-provenance.mjs:104`・`dependency-diff.mjs:66-67`・`:76`
- 実態: 解析は失敗の節の種類を区別せず、行の先頭の `名前@版` をすべて同じ集合へ入れる。`kinds` は「実行した検証の種類の一覧」の固定の文字列で、結果ではない。行には検証の結果の欄が無く(表の「署名・来歴の証明」の欄は packument の**有無**)、失敗の行は印「検証の失敗」だけで、署名の失敗か来歴の証明の失敗か欠落かが読めない
- 食い違い: delivered・check=machine の note が「種類で書く」と表示し、条文も種類で分けると書くが、どの種類が失敗したかは一覧のどこにも出ない
- 再現: 文書の出力の `invalid registry signature` の節と `invalid attestation` の節を1つずつ持つ出力を `parseAuditSignatures` に渡すと、`failedNames` に2つの名前が並ぶだけで、種類が残らない
- 直し方の案: 節の見出しで種類(署名の不正・署名の欠落・来歴の証明の不正)を持ち、名前 → 種類の対応を返す。行に「検証の結果」の欄を足すか、印を「検証の失敗(署名)」のように種類つきにする。試験に種類の取り分けを足す。実装を変えない場合は、IMPL-1038 の note と条文の「種類で分けて書き」を、実際に出しているもの(実行した種類の列挙と失敗の名前)に合わせる

### 中

#### M-1 版を変えずに解決元(resolved)だけを変えた更新が、一覧の行にも印にも出ない

- 所在: `template/scripts/gate/dependency-parse.mjs:77-78`(基底に同じ名前・同じ版があれば `continue`)
- 実態: ロックファイルの `resolved`(と integrity)を別のホストへ書き換え、版を据え置いた変更(ロックファイルの注入として知られる型)は entries に入らない。一覧の頭は「照会: 0 件中 0 件」「印の付いた行: 0 件」(E-6)。生の差分の行には出るが、G-6 基準5 は「印の付いた行を読む」と案内する
- 効き方: 条文は一覧の欄に「解決元」を置き、私設・ミラーへの解決元を「対象外」の印にすると書く。解決元の変化こそ、この欄が拾うべき更新だが、版が同じだと欄に届かない。裁定と逆ではないが、R-11 の「解決元を対象外として表示する」が、この筋では働かない
- 直し方の案: 基底と同じ名前・同じ版でも `resolved` のホストか integrity が変わった行を entries に入れ、印(例: 「解決元の変更」)を付ける。印の一覧(条文・ADR-0261 決定2・G-6.md・README)に足すかは議長の裁定。足さないなら、ADR-0261 か IMPL-1037 の note に「版を据え置いた解決元の変更は行にならない」と開示する

#### M-2 trusted publishing の版では「公開者」が識別にならない(実データ)

- 所在: `template/scripts/gate/dependency-provenance.mjs:21-23`(`_npmUser.name`)、`dependency-parse.mjs:154`(公開者の変更の印)、条文の「公開者」の欄と印「公開者の変更」、ADR-0261 決定2・影響
- 実態(E-2): trusted publishing で公開した版は、`_npmUser.name` が全パッケージで `GitHub Actions`。(a) トークンの公開から trusted publishing へ移った正規の版で、印「公開者の変更」が付く(条文が既に「正規の交代も拾う」と開示している範囲)。(b) 逆に、trusted publishing の版どうしでは、公開に使ったリポジトリ・ワークフローが変わっても公開者は同じ `GitHub Actions` で、印が付かない。2026-11 時点で主要なパッケージ(semver・vite・@sigstore/core)が既にこの形
- 効き方: 一覧の「公開者」の欄が、乗っ取りの兆候として期待された情報量を、普及の進む公開の形で持たない。表示は嘘ではないが、ADR-0261 影響の「兆候(公開者の変更)を読み手へ出す」が、この形では成り立たない
- 直し方の案: `trustedPublisher` があるときは公開者に `GitHub Actions(trusted publishing)` と出し、来歴の証明の出所(attestation のリポジトリ)を欄に出すかを議長が決める。`oidcConfigId` の比較は書式が揺れる(E-2)ので、そのままの比較は偽陽性を作る。少なくとも IMPL-1037 の note と G-6.md に「trusted publishing の版どうしでは公開者の変更を拾わない」と開示する。EV-0351 の差し替え条件へ足すのも可

#### M-3 `lint:impl` が作業ツリーで落ちる(#454 の未コミットの変更との合流)

- 所在: `src/content/docs/community/implementation-ledger.md`
- 実態: #455 のコミットだけなら整合(E-10)。#454 の template の変更が入ると台帳が古くなる
- 直し方の案: 番号の付け直しの後、#454 と合わせて push の直前に `npm run impl:write` を1回流す(CLAUDE.md の「template と本体の push は対で」と同じ扱い)。#455 側の欠陥ではないが、押し出しの順で落ちるので記録する

### 低

- **L-1 「初出の名前」の定義が条文に無い**。実装は「基底のロックファイルに無い名前」(`dependency-parse.mjs:57-58`・`:92`)。条文の欄には「名前の初回公開日時」もあるため、「レジストリで新しく公開された名前」と読まれうる。所在: `gate-criteria.md` 基準8 の節「印は、初出の名前…」。案: 印の段落に「初出の名前は、基底の一覧に無かった名前」と1句足す(編集の指摘)
- **L-2 projectDir を直下以外にした構成で、検証が「未実施(依存を導入していない)」と誤った理由を出す**。`dependency-provenance.mjs:95-96` は直下の `node_modules` と直下の `npm` を見るが、setup-stack は projectDir で install する。状態は未実施で正しいが理由が実態と違う。案: projectDir を解決して、そこで `npm audit signatures` を流す。または理由を「直下に node_modules が無い」とする
- **L-3 印の無い直接の依存が、41 件目から表示から落ちる**(E-7)。G-6 基準5 は「直接の依存は全件」を読ませ、「表示の省略の行を含む」とするので条文上は JSON を読めば足りるが、ジョブの要約だけでは読めない。案: 直接の依存は印の有無に関わらず切らない(`UNMARKED_ROW_LIMIT` を推移的な依存にだけ当てる)
- **L-4 「表示の省略」は行の印にならず、頭の件数の行だけ**。条文(「印は、…表示の省略です。印の付いた行は G-6 基準5 の確認で読みます」)と、`MARK.OMITTED` が行に付かない実装の言い方が合わない。省いた行に印は付けようがないので、条文を「表示の省略は一覧の頭に件数で出す」と言い分ける(編集の指摘)
- **L-5 「依存の解決: 実施」は構成を見た表示で、実行の結果ではない**。`dependency-diff.mjs:32-37` はアダプタの install が空でないかだけを見る。同じジョブの setup-stack は `continue-on-error` なので、取得に失敗しても「実施」と出る(G-5 自体はほかのジョブで落ちる)。条文は「解決が走る構成か」と書いており食い違いではないが、語「実施」が実行を含意する。案: 「走る構成(install: npm ci)」と出すか、setup-stack の結果(`steps.*.outcome`)を渡す
- **L-6 ADR-0261 の影響の「実レジストリでの値の正しさは、応答を差し替えた試験でしか確かめていない」**(`0261-…md:55`)と IMPL-1037 の note の同じ文は、本突合の E-1 で読み取りの正しさを確かめたので、E-1・E-2 の結果(trusted publishing の公開者を含む)に置き換えられる。`test-unregistered-name.mjs:1` に仮の名前 `IMPL-E` が残る(番号の付け直しのときに直す)
- **L-7 手引きの置き場・保持**: 裁定 §6 の3「第5章の手引き」と案 §3.1(`ci-gates.md`)は降りておらず、手引きは template の README だけ。ADR-0044 のステータスの1文は「決定5 の「…」を、…に限り、…で扱う」で述語が欠け、先例(ADR-0009・0032 の「…が置き換えました(日付)」)の形と違う。基準8 の「記録の保持は「判定が指す記録の保管」による」は正しく引けているが、dependency-diff の一覧は出荷の証跡へ写されない(`ship-evidence.yml:149`)ので、保管は IMPL-0243(adopter)に依る。これは既存の開示で足りる

## 3. 裁定の項目ごとの突合

| 裁定 | 降りたか | 備考 |
| --- | --- | --- |
| R-1 A2・状態行・限定を同じ行に | 降りた | 基準8 の行・ADR-0261 決定1・`resolutionState`。L-5 |
| R-2 基準9 を置かない・種類を欄に分ける・完全性を来歴と数えない | 一部 | 基準9 なし・完全性の文はあり。**種類で分ける部分は H-2**。不達の扱いは H-1 |
| R-3 欄 + G-6 | 降りた | E-1 で値の読み取りを確認。M-2 |
| R-4 ダウンロード数を扱わない | 降りた | 欄に無い |
| R-5 閾値を定めない1文・理由の統一・README の雛形 | 降りた | 本文・README・ADR・EV-0352 の理由は「規格にも観測にも定まらない」でそろう |
| R-6 C2・印の対象・上限なし・適用範囲を行の中に | 降りた | G-6 基準5 の行・G-6.md・integrated.yaml・tailoring-kb。L-1・L-3・L-4 |
| R-7 5.8.5 の型にそろえ manual・EV-D | 降りた | IMPL-1040 check=manual、EV-0354 |
| R-8 照会の状態行・G-6.md の1文 | 降りた | 照会の側は正しい。検証の側は H-1 |
| R-9 PR から辿れる記録・既存の保持の規定を引く | 降りた | 「判定が指す記録の保管」(`gate-criteria.md:245`)を引いた。新しい条文なし。L-7 |
| R-10 省略の件数・入力を切らない | 降りた | 試験あり。L-3 |
| R-11 node だけ delivered・python・go は undelivered・ロックファイル無しと対象外の表示 | 降りた | IMPL-1039 undelivered plan=adopter。M-1 は解決元の変化の筋 |
| R-12 ADR-0261・ADR-0044 のステータスの1文 | 降りた | L-7(文の形) |
| R-13 MAL- を主張しない | 降りた | 本文・README |

## 4. 実装の担当が外した点の評価

- アダプタの `integrity` コマンドを足さず `npm audit signatures` を直接呼ぶ: 基準9 を置かないので、アダプタの契約を広げないことは裁定の結果を損なわない。ただし直接呼ぶ実装で H-1・L-2 が出た
- `ci.dependencyRegistries` を足さず、ホストで私設・ミラーを「対象外」と判定: R-11 の「対象外として表示」を満たす。照会できる私設レジストリを使う採用者は全行が「対象外」の印になり、G-6 で全行を読むことになるが、読ませない行は作らない。損なわない

## 5. 所有者の方針

- 記名・氏名・日付の欄は足していない。G-6.md は「承認レビューの本文へ書く」で、本人の承認の記録による
- 箇条書きは である調・体言止め、本文は ですます調。ADR-0261 の決定の項は である調(ADR の決定の書き方の先例どおり)
