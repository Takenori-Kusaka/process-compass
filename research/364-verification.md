# #364 出典カード SRC-0650〜SRC-0669 の原文との照合

作業日: 2026-11-05。対象は #315 で登録した出典カードです。登録時は調査役が WebFetch(要約モデル経由)で読んだもので、`quote` が無く、`verification.status: partial` でした。

## 0. 前提の確かめ

- **件数は 13 件**。番号の範囲 SRC-0650〜SRC-0669 は 20 個ですが、カードがあるのは 0650・0651・0653・0656・0660〜0664・0666〜0669 の 13 件です。0652・0654・0655・0657〜0659・0665 は未登録の候補で、カードがありません(`research/315-deliberation/implementation.md` 3 行目・6 節・X-9)。照合の対象は 13 件です
- **Issue が引く識別子の誤り**。Issue は「EV-0156・EV-0157」「ADR-0084」と書いていますが、#315 の出典に依る根拠水準マークは **EV-0167(SRC-0666)と EV-0168(SRC-0663)**、決定の記録は **ADR-0085** です(implementation.md 案5・X-9、ADR-0085 の「外部の型」の表の後)。EV-0156・EV-0157 は ADR-0082(兼務の境界)のもので、本件と関係しません。以下は EV-0167・EV-0168・ADR-0085 と突き合わせます
- `research/371-deliberation/probe-371.md` には、本件の2つの主張(CODEOWNERS の置き場の順序、権限の無いトークンでの `bypass_actors` の欠落)を直接に確かめた観測はありません。E-7 は `require_code_owner_review` の効き方、E-8〜E-10 はルールセットの規則の可否です。代わりに、下の 2 の追加の観測を行いました

## 1. 手順

1. `node scripts/research-ledger.mjs verify --ids SRC-0650,…,SRC-0669` を実行した。13 件とも HTTP 200 で、`quote` が無いため全件 `needs-agent`
2. 原文を取得した(scratchpad。リポジトリには入れていない)。HTML は本文を抽出、CMMI の PDF は `pdftotext`、GitHub の Issue #3687 は `gh api`(本文とコメント)、safe-settings は `gh api` で README の生の本文
3. **目隠し抽出**: 主張の文を見せず、主張の答えを含まない中立の問い(例: 「権限によって GET の応答の `bypass_actors` がどう変わるか」)だけを渡した。検証役3名が、取得済みの原文テキストだけから逐語の抜粋を取った(リポジトリ・Web へは触れていない)。SRC-0663・SRC-0666 は先頭のバッチに置いた
4. `merge-verification` で反映した。機械の比較は 14 件 match、3 件 mismatch。mismatch はすべて、日本語の主張の「1つ」「3つ」「手順5」が英語の原文に数字として無いことによる偽の不一致だった
5. **裁定**: 出典を取りに行かない裁定役が、17 の主張すべてを目隠し抽出の原文と突き合わせた(機械の match は数値の一致しか見ないため、全件を裁定へ回した)。結果は consistent 7、corrected 10、inconsistent 0、unsupported 0。`merge-adjudication` で反映した(corrected は主張の文を原文に沿って書き直し、旧文は `agent.claims.*.adjudication.originalText` に残る)
6. 目隠し抽出の逐語の抜粋を `quote` へ写し(スクリプトで写した。手で書き写していない)、`verify` を再実行した。**17 の `quote` はすべて原文に `found`**。13 件とも `verification.status: verified`
7. 原文と食い違うカードの `summary` を改めた(SRC-0650・0664・0666・0667・0668)。`npm run lint:sources` は「問題なし」

`humanChecked` は false のままです。人の抽出検査は行っていません。`catalog.md` などの生成物は再生成していません(`node scripts/research-ledger.mjs index` で更新されます。生成物は本件で書き換えてよい範囲の外のため)。

## 2. 追加の観測(2026-11-05、読み取りだけ)

### O-1 権限の無い呼び出し元での `bypass_actors`(SRC-0663 の裏付け)

- 管理の権限の無い公開リポジトリ3件(`integrations/terraform-provider-github`・`cli/cli`・`github/docs`)のルールセット6件を `gh api repos/{r}/rulesets/{id}` で読んだ。`has("bypass_actors")` は **6件とも false**(`current_user_can_bypass` は `never`)
- 所有者(admin)として読んだ `Takenori-Kusaka/Filetto` のルールセット `records` は `"bypass_actors": []`(**空の配列が返る**)。同じリポジトリの `checks-only` は主体1件を返した
- 判定: 起票者の報告と一致する。ただし観測は公開リポジトリへの個人のトークンでの読み取りに限る(GitHub App のインストールのトークンは試していない)。GitHub の公式の文書には、この挙動の記述を見つけていない

### O-2 雛形の所有者 `@OWNER` の扱い(SRC-0666 の補足)

- `gh api repos/Takenori-Kusaka/pit-in-template/codeowners/errors` は、雛形の行 `* @OWNER` を `kind: "Unknown owner"`(「make sure @OWNER exists and has write access to the repository」)として返した。`@OWNER` は構文の誤りではなく「不明な所有者」として扱われる。なお `owner` という名前の組織のアカウントは GitHub に実在する(`gh api users/OWNER`)
- 原文の該当箇所(目隠し抽出の補足): "If you specify a user or team that doesn't exist or has insufficient access, a code owner will not be assigned."

### O-3 Evaluate の状態の可否(SRC-0667・SRC-0668 の補足)

- REST API の文書(`https://docs.github.com/en/rest/repos/rules`)の `enforcement` の欄: "evaluate allows admins to test rules before enforcing them. Admins can view insights on the Rule Insights page (`evaluate` is only available with GitHub Enterprise)."
- この文書は台帳に登録していません(本件で新しいカードを作らない)。登録するなら SRC-0670 からです

## 3. カードごとの結果

表の「裁定」は、登録時の主張の文に対するものです。corrected のカードは、主張の文を原文に沿って書き直しました。

### SRC-0663 terraform-provider-github #3687(先に実施)

- quote: "GitHub omits `bypass_actors` from `GET /repos/{owner}/{repo}/rulesets/{id}` when the caller cannot administer the ruleset. An admin caller gets `"bypass_actors": []` when the list is empty, so a missing key and an empty list mean different things."(Actual Behavior)
- 裁定: corrected。内容は原文にあるが、観察者は起票者(rriski)だけ。メンテナ(deiga)は "This is not a bug, this is how Terraform is supposed to work." と述べ、API の挙動を確認も否定もしていない。主張を「起票者の報告(再現手順つき)によれば」と限った
- O-1 の観測が起票者の報告と一致した

### SRC-0666 About code owners(先に実施)

- c1 quote: "If CODEOWNERS files exist in more than one of those locations, GitHub will search for them in that order and use the first one it finds."(CODEOWNERS file location)
- c1 裁定: corrected。順序と「最初に見つけたものを使う」は原文どおり。「1つ**だけ**が使われる(ほかは無視される)」という排他は明文に無い
- c2 quote: "If any line in your CODEOWNERS file contains invalid syntax, that line will be skipped. … A list of errors in a repository's CODEOWNERS file is also accessible via the API."(CODEOWNERS syntax。カードには省略の無い逐語を入れた)
- c2 裁定: consistent

### SRC-0667 組織のルールセットの作成(Enterprise Cloud の文書)

- quote: 状態の一覧(Active / Evaluate / Disabled)の3行
- 裁定: consistent(機械の mismatch は「3つ」による偽の不一致)
- 要約の誤り: 「Evaluate の状態が Enterprise Cloud の文書にしか現れない」は、SRC-0668 の頁にも現れるため原文と合わない。summary を改めた

### SRC-0668 リポジトリのルールセットの作成(無料版の文書)

- quote: "You can select any of the following enforcement statuses for your ruleset. Active: … Disabled: …"
- 裁定: corrected。状態の一覧は Active と Disabled だけだが、同じ頁の「Adding metadata restrictions」の節が "select the "Evaluate" enforcement status for your ruleset to test the effects of any metadata restrictions" と書く。頁の内部の不整合。登録時の要約「Evaluate は現れない」は誤り
- 登録時の要約は「明文の制限は見つけていない。推定」としていたが、O-3 の明文がある

### SRC-0650 Copier: Updating a project

- c1 裁定: corrected。手で書き換えない規則と理由は原文どおり。ただしこの頁は回答ファイルが「テンプレートの版」を記録するとは書いていない(版の保存は SRC-0651 の vcs_ref の節)。誤認の向きは「変更後の回答が現在の案件を生んだ」と誤認する、である
- c2 裁定: consistent(更新の4段階と、衝突を人が見直すこと)
- 要約: 「更新の前提に作業木の清浄を置く」は利用者への指示("make sure git status shows it clean")であり、Copier が拒むとは書いていない。summary を改めた

### SRC-0651 Copier: Configuring a template

- c1 裁定: corrected。`version` は任意で、指定しなければ毎回の更新で走る。初回の複製で走らないことは原文どおり
- c2 裁定: corrected。`_min_copier_version` を下回れば中止しエラーを示すことは原文どおり。`_commit` の自動の保存には「Git で版管理されたテンプレートから」の条件があり、保存されるのはテンプレートの版(タグ等)

### SRC-0653 Renovate: Config Migration

- 裁定: consistent。要約の「旧い構成は無期限に動く」は原文では "If done right" の条件つき

### SRC-0656 ESLint: Bulk Suppressions

- 裁定: corrected。抑制は "error" として有効にした規則に限る。非ゼロの終了には `--pass-on-unpruned-suppressions` の例外がある

### SRC-0660 git-merge

- 裁定: consistent。既定の拒否、上書きのオプション、既定で有効にする設定変数が「存在せず追加もされない」ことが同じ箇所に逐語である

### SRC-0661 Kubernetes Deprecation Policy

- 裁定: corrected。原文は "no longer served 9 months or 3 minor releases after deprecation (whichever is longer)" で、提供の終わりを定める文。「長い方」「マイナーリリース」が欠けていた。往復の要件には「一部の版に存在しない REST 資源の全体」の例外がある

### SRC-0662 Terraform: State upgrade

- 裁定: consistent。`map[int64]resource.StateUpgrader`、該当の版が無ければエラー、中間の版を辿らないことが原文どおり

### SRC-0664 safe-settings README

- 裁定: corrected。dry-run と基底のブランチとの比較は原文どおり。定期の適用は `CRON` で設定する**任意の機能**で、乖離への対処に "could be a way" と書くだけ。summary を改めた

### SRC-0669 CMMI Adoption Guidance v4.0

- c1 裁定: consistent(Step 3。"A well-crafted business process is of little value if it is not used.")
- c2 裁定: corrected。原文は "typically" "often" "may be necessary" で、通例と必要になりうる場合として述べる。許容(「してよい」)ではない

## 4. 本文の判断との食い違い(本文・EV・テンプレートは直していない)

照合の結果、**ADR-0085・EV-0167・EV-0168・事前点検・env-check の判断を覆す食い違いはありません**。根拠の書き方と開示の文に、次の食い違いがあります。直すかどうかは、取り込みの前の議論に委ねます。

### D-1 Evaluate を前提にしない理由の書き方(SRC-0667・SRC-0668)

- 本文: `src/content/docs/phase5-implementation/template-repository.md` の env-check の節「ルールセットの Evaluate の状態(強制せずに観測する)を前提にしない。GitHub Enterprise Cloud の文書にしか現れず(SRC-0667)、無料版の作成の手順には Active と Disabled しか無いためである(SRC-0668)」
- 原文: 無料版の文書(SRC-0668)にも Evaluate は現れる(メタデータの制限の節)。「Enterprise Cloud の文書にしか現れず」は事実と合わない。一方、REST API の文書(O-3)が "evaluate is only available with GitHub Enterprise" と明記している
- 帰結: **判断(前提にしない)は保たれ、根拠はむしろ強くなる**。理由の文が誤った事実に立っている。O-3 の文書を台帳へ登録し、理由を「REST API の文書が Enterprise に限ると明記している」へ改める候補

### D-2 EV-0168 の開示の文が古くなった(SRC-0663)

- 本文: EV-0168 の本文「SRC-0663 は二次情報です。要約を経て読んだもので、原文との照合をしていません。ネットワークの届く環境で照合するまで、権限の無いトークンで `bypass_actors` の鍵が欠ける挙動は確かめた事実として扱いません」。ADR-0085 の「外部の型」の表の後の段落も同じ趣旨
- 原文: 起票者の報告として原文に実在する(照合済み)。O-1 で、権限の無い読み取りで鍵が欠け、admin の読み取りで空の配列が返ることを観測した
- 帰結: env-check の判断(鍵が無ければ「未確認(権限不足で読めない)」、空の配列と区別する)は**支えられる**。開示の文は改める対象。ただし、(1) 原文は起票者1名の報告で、メンテナ・GitHub の公式の確認は無い、(2) O-1 は個人のトークンでの読み取りで、GitHub App のトークンを試していない。根拠の水準を上げるときはこの2点を開示に残す必要がある
- 付記: `template/scripts/gate/adoption-trial.mjs` の理由の文「admin の権限でしか返らない」は、O-1 と原文に合う

### D-3 EV-0167 の開示の文と、「だけ」「黙って」の語(SRC-0666)

- 本文: EV-0167 の本文「`CODEOWNERS` の挙動の出典(SRC-0666)は二次情報です。要約を経て読んだもので、原文との照合をしていません」は古くなった。template-repository.md の事前点検の表「GitHub は最初の1か所だけを使い、不正な行を飛ばす(SRC-0666)。失敗ではなく無効化として現れる」
- 原文: "use the first one it finds"。ほかの置き場を無視するとの明文は無い(「最初のものを使う」から読み取れる範囲)。`@OWNER` は構文の誤りではなく、"a user or team that doesn't exist or has insufficient access" に当たり、"a code owner will not be assigned"。O-2 で、codeowners/errors API が `Unknown owner` として返すことを観測した
- 帰結: **事前点検で止める判断は保たれる**(PR は失敗せず、所有者が割り当てられないまま進む)。ただし、`template/scripts/gate/preflight.mjs` の告げる文「不正な所有者の行は黙って飛ばされ」「ほかは黙って無効になる」は、原文より強い。`@OWNER` は「不正な構文の行」ではなく「不明な所有者」であり、誤りは画面と API に出る(PR の失敗としては出ない)。「黙って」を「失敗を出さずに」へ寄せる候補
- 付記(採否は未決): env-check や契約検査が codeowners/errors API を読めば、`@OWNER` 以外の不明な所有者も機械で拾える。本件では提案に留める

### D-4 定期の全同期の型(SRC-0664)

- 本文: EV-0168 の本文「定期の全同期で乖離を是正する型(SRC-0664)」、ADR-0085 の表「定期の全同期 | safe-settings(SRC-0664)| 採らない」
- 原文: 定期の適用は `CRON` で設定する任意の機能で、乖離への対処に「なりうる」と書くだけ
- 帰結: 採らない判断に影響しない。「是正する型」は「設定すれば定期に適用する型」と書くのが原文に近い

### D-5 Copier の型の書き方(SRC-0650・SRC-0651)

- 本文: template-repository.md「跨いだ版の移行だけを走らせ未知の版で止める型は Copier(SRC-0651)」「生成時の版を記録して手で書き換えない型も Copier(SRC-0650)」
- 原文: Copier が止めるのは「道具の版がテンプレートの求める最低の版を下回るとき」で、構成の形式の未知の版を拒む規則ではない(類比としては成り立つ)。版の記録(`_commit`)は SRC-0651 の vcs_ref の節にあり、SRC-0650 は手で書き換えない規則だけを持つ
- 帰結: 判断に影響しない。出典の割り当て(版の記録は SRC-0651)を正す候補

### 食い違いの無かったもの

- SRC-0660(共通の祖先の無い履歴の併合の拒否): 事前点検の「告げる」の根拠どおり
- SRC-0662(版ごとの直接の変換、未知の版はエラー): ADR-0085 決定5 の型どおり
- SRC-0653・SRC-0656・SRC-0661(採らない判断の比較の対象): corrected の精度の差は、採らない判断に影響しない
- SRC-0669(現状を写して差を特定し、使われているかを確かめる。段階の展開は採らない): ADR-0085 決定1 どおり。c2 は「してよい」ではなく「通例・必要になりうる」だが、採らない判断に影響しない

## 5. 本文への反映(2026-11-05)

照合の結果に沿って、根拠の書き方と開示の文を改めました。判断(止める・告げるの分け方、4値、Evaluate を前提にしない、定期の全同期を採らない)は変えていません。

| 食い違い | 反映した所在 | 内容 |
| --- | --- | --- |
| D-1 | `phase5-implementation/template-repository.md` の env-check の節と「採らないと決めたこと」の表。出典カード SRC-0725(新規) | 理由を「REST API の文書が Evaluate を GitHub Enterprise に限ると明記している(SRC-0725)」へ改めた。Evaluate が SRC-0667・SRC-0668 の両方に現れ、どちらもプランの限定を書かないことを併記した。前提にしない判断はそのまま |
| D-2 | 同頁の EV-0168 の本文 | 「二次情報で照合していない」を、#364 で照合したことへ改めた。挙動は起票者1名の報告で、メンテナは確認も否定もしていないこと、GitHub の公式の文書に記述を見つけていないこと、O-1 の観測(個人のトークン、6件)と GitHub App のトークンを試していないことを開示した。根拠の水準は E1 のまま |
| D-3 | 同頁の事前点検の表と EV-0167 の本文。準拠テンプレートの `scripts/gate/preflight.mjs`・`scripts/gate/verify-gate-contract.mjs` | 開示の文を照合済みへ改め、「最初に見つけたものを使う」の範囲と、`@OWNER` が不明な所有者に当たることを書いた。告げる文の「黙って飛ばされ」「黙って無効になる」を、「不明な所有者として扱われ、コードオーナーが割り当てられない。誤りは画面と API に出るが、PR の失敗としては出ない」「決まった順に探して最初に見つけた1つを使い、ほかは使われない」へ改めた(pit-in-template 355e3f0) |
| D-4 | 同頁の EV-0168 の本文 | 「定期の全同期で乖離を是正する型」を「設定すれば定期に設定を適用し直す型(任意の機能で、乖離への対処に「なりうる」と書くだけ)」へ改めた |
| D-5 | 同頁の EV-0171 の本文 | Copier が止めるのは道具の版であり、構成の形式の未知の版を拒む規則ではない(類比)と書いた。版の記録を SRC-0651、手で書き換えない規則を SRC-0650 へ割り当て直した |

- **ADR-0085 の本文は書き換えていません**。採用済みの ADR の本文を書き換えない規則(`adr/index.md` の運用ルール4)によります。同 ADR の「外部の型」の表と後の段落、事実の表、「採らないと決めたこと」の Evaluate の行は、登録時の書き方のまま残ります。判断を覆す食い違いが無いため、置き換えの ADR は起こしていません。正しい書き方は、上の頁と出典カードが持ちます
- SRC-0725 は、O-3 の文書(`https://docs.github.com/en/rest/repos/rules`)を登録したものです(2 節の「登録するなら SRC-0670 から」は、台帳の最大番号が SRC-0724 だったため SRC-0725 とした)。quote は機械の検証で原文に `found`。目隠し抽出と裁定は経ていません
- 検査: `npm run evidence:write`(変更なし)、`npm run lint:sources`、`lint:text`、`lint:provisions`、`npm run check` の各段は通過。例外は2つで、`test-g5-aggregate`(手元の Windows で落ちる既知のもの)と、`test:regress`(Windows では gh の代役を `execFileSync('gh')` から呼べず、走らせる前の確認で止まる)。`build` は通過
