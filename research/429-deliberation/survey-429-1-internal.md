# #429 内部調査 1: 担い手の認証情報の共有と、名簿の数値の識別子による照合

- 調査日: 2026-11-05
- 対象: `src/content/docs/`(標準・ADR)、`template/`(準拠テンプレート。submodule の作業ツリーの現状)、`research/`
- 位置づけ: 会議体の材料。採否はしない。行番号は調査時点のもの

## 0. 要点

1. 標準の認証情報の規定(3.5.1・3.5.3・1.10.2・ADR-0035/0082/0083)は、**レーン(席・ロール)ごとに認証情報を分けること**だけを扱う。**同じ席の人(責任者)と AI の担い手が1つの認証情報を共有すること**は、禁止も推奨も開示もしていない。「席ごとに認証情報を分けている」(overview.md:645)は、席の中で人と AI が共有する構成でも字面上は満たせる
2. G-6 の4条件・例外承認の (A)(B)・作成を指示した者の既定値は、「AI の操作は AI の名義(bot・AI を示す語)で現れる」ことを暗黙の前提にしている(gate-criteria.md:933・949)。担い手が人のアカウントで動くと、AI の承認・レビューが**人の承認として数えられる**経路が残る。標準でこれに触れるのは #380 で足した箇所(EV-0220、監査の観点28、ADR-0106)だけ
3. 担い手の識別(3.4.2)は「モデルの版・指示資産の版・権限の組」で、**担い手が動くアカウントを含まない**。構成の `performer` も `{model, instructions, permissions}` だけで、アカウントの欄が無い。D-0 表5-2・表7 にも無い。`/process-init` の8問にも問いが無い
4. テンプレートの中で前提が割れている。`gate/reference/recording.md:121-130` は認証情報の共有を**想定内の体制**として後退経路を用意する。`process-change/kinds/performer.md:39` は担い手ごとに**別のトークン**を発行する前提で書かれている
5. 名簿の照合: 第4章(gate-criteria.md:84)は「**リポジトリの外側で保守する**対応表に、ログイン名に加えて数値の識別子」を求める。テンプレートの名簿 `people[].accounts` は**リポジトリの中**(`process.config.json`)の**ログイン名の文字列**で、`findPersonByAccount` は `accountKey`(NFKC・小文字・先頭の @ を落とす)の一致で引く。**数値の識別子は、写し・PR の検査の入力・ホスティングの照会のいずれでも既に取れているのに、照合に1か所も使っていない**
6. gate-criteria.md:84 の要求(数値の識別子の対応表、リポジトリの外側)には**実装マークが無い**。降りていない規定として台帳に出ていない(ADR-0028・#222 の扱いに反する)。IMPL-0125(判定者の数値の識別子と席を出す)は delivered だが、識別子は表示するだけで、席への対応はログイン名で引いている

## 1. 標準の既存の規定(認証情報の共有)

### 1.1 共有を禁止・離脱として扱う箇所(すべてレーン/席の間の分離)

| 所在 | 内容 |
| --- | --- |
| `src/content/docs/phase4-process-design/roles-responsibilities.md:469-470` | 3.5.1 の理由1。ロールごとに認証情報(GitHub トークン等)を分けた場合に限り「作成者 ≠ 承認者」を機械的に強制できる。全ロールが同一の認証情報を共有する構成では成立しない。列挙に無い離脱として記録し、代償措置は定めない |
| `roles-responsibilities.md:512` | レーン = 作業領域・セッション・認証情報の組。同じレーンの2ロールは同じ認証情報から承認と記名が出るため、席の分離を記録から確かめられない |
| `roles-responsibilities.md:567・573-579` | 3.5.3 実行主体の文脈。分離の条件3「認証情報(トークン)」。満たせなければ権限の分離が成立せず、列挙に無い離脱 |
| `roles-responsibilities.md:600` | 成果物を起案した担い手と、判定の草案を作る担い手は、作業領域・セッション・認証情報を分ける(1名の体制でも) |
| `roles-responsibilities.md:628` / `overview.md:121` | 3.5.4・1.4 の「分離(文脈)」= 作業領域・セッション・認証情報が別 |
| `overview.md:134` | 1.4「配備の資格情報」の注記: 3.5.3 の「認証情報」は**実行主体の文脈を分ける単位としての、担い手の資格情報**を指す |
| `overview.md:627・636・645・650` | 1.10.2 列挙に無い離脱「実行主体の文脈の認証情報を、席ごとに分けられない構成」。2名の体制が主張に至る条件に「席ごとに認証情報を分けている」。許可(逸脱)に当たるかは別の Issue で審議中 |
| `adr/0035-separation-by-execution-context.md:57・74・84・116・118` | 文脈の分離の決定。認証情報を共有する場合は権限の分離が成立しないものとして扱う |
| `adr/0082-seat-combination-boundaries-and-lane-mapping.md:30` | レーンを共有すると G-6 の承認と G-7 の記名が同じ認証情報から出られ、保証の主張の成立条件4 が成り立たない |
| `adr/0083-standard-edition-end-of-application-and-deviation.md:114・120・128・174` | 認証情報を席ごとに分けない構成は列挙に無い離脱。ADR-0035 の「代償措置つきの逸脱」を代償措置の定めと読まない |
| `adr/0060-drafting-context-and-two-layer-independence.md:54` | 起案の文脈と判定の草案の文脈で認証情報を分ける |

**観察**: どれも「ロール A の文脈とロール B の文脈」の分離であり、主語は担い手(文脈)どうし。**席の責任者(人)本人の認証情報を、その席の AI の担い手が使う**構成は、3.5.3 の判定の単位(人 / 文脈)のどちらにも当たらない。人の単位では同じ人、文脈の単位では同じ席の作業なので、兼務禁止表の問題にならない。席ごとに分けていれば 1.10.2 の離脱にも当たらない。

### 1.2 共有を前提に受け止めている箇所(#380 で足したもの)

| 所在 | 内容 |
| --- | --- |
| `phase4-process-design/gate-criteria.md:152-156` | EV-0220。レビューを受け皿にする方式の前提に「認証情報を共有しないこと」を挙げる。差し替え条件に「AI の担い手が記名者の認証情報で動く構成の比率(#429)」。共有する構成では、本人か担い手かを機械が区別する手段は無い。テンプレートは権限設定と常駐の規則で塞ぐが、`gh api` 直の経路は止めていない |
| `gate-criteria.md:121` | 帰属の確認者を置けない体制(名簿に記名者以外がいない)では、記名者本人のアカウントの操作を受け付け、自己申告として開示する。**認証情報の共有の有無は条件にしていない** |
| `phase4-process-design/assurance-case.md:279` | 監査の観点28。「認証情報を共有する体制では、レビューの書き手が本人か担い手かを機械が区別できないため、記名者に操作の有無を聞き取る」 |
| `adr/0106-material-records-attributed-before-effect.md:88-90・94` | 共有する構成ではホスティングの記録で帰属を示す方式すべての前提が崩れる。アカウントの分離を構成の入力にするかは #429。名簿の照合のログイン名の問題も #429 |

### 1.3 黙っている箇所

| 所在 | 黙っていること |
| --- | --- |
| `roles-responsibilities.md:180・184・187` | 3.4.2 担い手の識別 = モデルの版・指示資産の版・権限の組。**担い手が動くアカウント(名義)を識別に含めない**。「権限の組」がアカウントを含むかは書いていない |
| `phase4-process-design/deliverable-templates.md:143-152・433-436` | D-0 表5-2 の欄。「リポジトリ上のアカウント」は1列で、**数値の識別子の欄が無い**。AI の担い手のアカウントは「載せない」(:434)だけで、どこに書くかの定めが無い |
| `deliverable-templates.md:443-446` | D-0 表7。担い手は「AI の担い手の識別(モデルの版・指示資産の版・権限の組)」で、**担い手のアカウントの欄が無い** |
| `deliverable-templates.md:494` / `roles-responsibilities.md:1904` | 変化点4「AI の担い手の識別の変更(… ツールと権限、実行基盤)」。担い手の名義の変更(専用アカウント ⇄ 本人の認証)を変化点として名指ししていない |
| `gate-criteria.md:933` | G-6 基準4。「変更の作成者が AI または bot である場合、リポジトリの上では、作成を指示した者は作成者ではありません」。**AI が人の名義で PR を開く構成を想定していない**(その場合は作成者 = 指示した人となり、ブランチ保護が自己承認を止める側に倒れる) |
| `gate-criteria.md:938-949` | 独立した人の確認の4条件と「AI と bot の名義による承認は数えない」。名義(語の一致・bot の型)で判定する。**AI の担い手が人のアカウントで出した承認は、人の承認として数える**。この穴は G-6 の節に書かれていない(EV-0220 は例外承認・停止の解除のレビューに限った記述) |
| `phase5-implementation/ci-gates.md:681` | 作成を指示した者の欄が未記入なら「PR の作成者(人のアカウントの場合)」と開発者の席の責任者を指示者とみなす。共有の構成では作成者のアカウントは常に人 |
| `phase4-process-design/human-ai-boundary.md:946-975` | 5.8.2 の記録。AI の関与はコミットのトレーラ Co-Authored-By(IMPL-0176・0177)で記録する。**レビュー・承認・PR の作成には AI の関与を残す欄が無い** |
| `human-ai-boundary.md:1069・1082・1087` | 5.8.6。認証情報・秘密情報への接触を実行時に拒否する。**エージェントが環境に既にある人の `gh` 認証を使って操作すること**が「接触」に当たるかは書いていない(IMPL-0199 は置き場の読み取りを ask にするだけ) |
| `gate-criteria.md:1230-1238` | 保証の開示の7項目。**認証情報の共有の有無を出す項目が無い**。出るのは自己申告の記録(項目1)だけ |
| `phase4-process-design/tailoring-guide.md` | 第8章。認証・アカウントに触れる行が無い(grep で CL2 の行の「認証」だけ)。軸による扱いの差も無い |
| `phase6-operation/process-audit.md:153` | 観点6。「1人が複数のアカウントを使っていないか」は見るが、**1つのアカウントを人と AI が使っていないか**は観点に無い(観点28 は効力を持つ記録に限る) |

## 2. 準拠テンプレートの、担い手と人のアカウントの区別

### 2.1 区別する仕組み

| 仕組み | 所在 | 中身 |
| --- | --- | --- |
| AI を示す語 | `template/scripts/gate/config.mjs:296-326` | `AI_NAME_RULES` と `aiNameReason`。名義の語の一致(AI・agent・bot・モデル名・提供者名・片仮名)。`account: true` で末尾の `[bot]` も見る |
| bot の型 | `record-copy.yml:82`(`user.type`)、`gate-g5.yml:338`(`is_bot: (.user.type == "Bot")`)、`material-attribution.mjs:39`、`aggregate-evidence.mjs:231-250` | ホスティングが返す型。GitHub App・`[bot]` は区別できる |
| 名簿に AI を書かない | `config.mjs:524-571`(`rosterProblems`) | 氏名とアカウントが AI を示す語に当たれば拒否。`performer` と同じ文字列も拒否(:539) |
| 語の衝突の上書き | `config.mjs:532-537・558-565・1934-1990`(`accountsConfirmed`・`confirmedAccounts`・`aiAccountCheck`) | 本人以外の記名の変化点の記録がある場合に限り、人のアカウントとして扱う。`[bot]` と `is_bot` は上書きしない(IMPL-0266) |
| 作成者のレビューを数えない | `material-attribution.mjs:71-73`(`reviewerCheck`) | 書き手が PR の作成者と同じアカウントなら数えない。理由の文に「作成者と記名者が同じアカウントでは、本人の操作か AI の操作かを区別できない」 |
| 担い手が宣言行のレビューを出さない | `template/scripts/init/generate-profile.mjs:5519-5528`(`standardReview` = `Bash(gh pr review:*)` を deny。guard の有効・無効の両方の分岐 :5591・:5618 に入る)、`template/CLAUDE.md:106` | IMPL-0417。`gh pr review` は宣言行の有無に依らず全部拒否。`gh api` で直接レビューを作る経路は止めない(:5524) |
| `aiNames` | `test-material-attribution.mjs:38・122`、`test-customer-voice.mjs:14`、`test-model-adoption.mjs:20` | **試験の fixture にだけ現れ、`config.mjs` は読まない**(実装の無い鍵) |

### 2.2 区別できない箇所

1. **担い手が人のアカウントで動く構成**。`aiNameReason` も `is_bot` も名義しか見ない。担い手が人の `gh` 認証で出した承認・レビュー・PR は、全経路(check-pr の検査8 `check-pr.mjs:684-697`、集約の G-6、`delegation.mjs:294`、material-attribution の (A)(B))で人の操作として数えられる
2. **作成者のレビューを数えない条件**(`material-attribution.mjs:72`)は、共有の構成で「AI が開いた PR に AI が本人の名義でレビューを出す」ことは止める。ただし作成者と別の人の認証で動く担い手(例: Review レーンの AI が独立レビュアの `gh` 認証で動く)は止めない
3. **`gh api` 直のレビューの作成**。権限設定の deny は `gh pr review` の前置きの一致だけ(`generate-profile.mjs:5524`)。`gh api repos/.../pulls/N/reviews -X POST` は止まらない。G-6 の承認(宣言行の無い承認)は常駐の規則の対象外(CLAUDE.md:106 は宣言行に限る)。**つまり AI の担い手が人の名義で G-6 の承認を出すことを、権限設定は `gh pr review` でだけ止め、常駐の規則は禁じていない**
4. **構成に担い手のアカウントの欄が無い**。`performerKey`(`config.mjs:282-284`)は `[model, instructions, permissions]`。担い手がどのアカウントで動くかを構成・D-0・`/process-init`(`template/.claude/skills/process-init/SKILL.md` の8問)のどこでも問わない
5. **前提の食い違い**。`template/.claude/skills/gate/reference/recording.md:88・121・125・130` は認証情報の共有を想定内の体制として後退経路(記録を先に入れる PR、記名者以外の人の帰属の確認、自己申告)を定める。一方、`template/.claude/skills/process-change/kinds/performer.md:39` は「交代した担い手のトークンを失効させ、新しい担い手へ別のトークンを発行する」と、担い手ごとに専用のトークンがある前提で書く

## 3. 名簿の照合: 第4章の要求とテンプレートの実装の差

### 3.1 要求

| 所在 | 要求 |
| --- | --- |
| `gate-criteria.md:84` | アカウントと人の対応表: **リポジトリの外側で保守する**対応表に、ログイン名に加えて**数値の識別子**を持つ。ログイン名だけの対応表では承認者を同定できたものとして扱わない(承認レビューを判定記録とする保全の条件の1つ) |
| `phase5-implementation/qms-document-control.md:45・55` | 理由: 退会したアカウントは匿名化され、ログイン名は一定期間の後に他人が取得できる |
| `phase5-implementation/ci-gates.md:243` | 対応表はリポジトリの外側で保守する。無ければ承認者の同定は成立しない |
| `gate-criteria.md:96・103`(IMPL-0125) | 機械が出す欄「判定者(アカウントの数値の識別子と名簿の席)」 |
| `adr/0070-gate-record-medium-and-field-sources.md:72・93・111` | 決定の出所。写しの最小の組に数値の識別子とログイン名 |

### 3.2 実装

- `template/scripts/gate/config.mjs:596-606` `accountKey` は文字列を NFKC・trim・先頭の @ を除去・小文字化。`findPersonByAccount` は `people[].accounts` の各要素の `accountKey` と一致する最初の人を返す。**数値を受け取る経路が無い**(数値を渡すと `accountKey` が空を返し null)
- `config.mjs:548-570` `rosterProblems` は `accounts` を「リポジトリ上のアカウント名」の文字列の配列として検査し、文字列でない値を拒否する(:553-555)。**今の契約検査では、名簿に数値やオブジェクトを書くと失敗する**
- 名簿の置き場は `process.config.json`(リポジトリの中)。第4章の「リポジトリの外側」と異なる。ただし `Edit(./process.config.json)` は担い手の権限設定で止めている(`generate-profile.mjs:5530-5535` の `standardCategoryAB`)。この差は標準・テンプレートのどちらにも書かれていない
- `accountKey` は `accountsConfirmed`・`changeLog[].accountConfirmations[].account`(`config.mjs:1940-1990`)・`resolveSigner`(:627-636)・記名の重なりの検査(:575-590)にも使う

`findPersonByAccount` の呼び出し元(試験を除く):

| 所在 | 用途 | 手元にある数値の識別子 |
| --- | --- | --- |
| `check-pr.mjs:469` | 例外承認の PR の作成者 | 無い。`PR_AUTHOR` はログイン名だけ(`gate-g5.yml:357`)。イベントには `github.event.pull_request.user.id` があるが渡していない |
| `check-pr.mjs:689・751` | G-6 の承認者の数(検査8)、変更要求 | **ある**。`gate-g5.yml:338` が `author: {login, id: .user.id, is_bot}` を渡す。`check-pr.mjs:672-679` は `login` を鍵に集計し `id` を捨てる |
| `check-pr.mjs:648・1054・1239` | 作成を指示した者(PR 本文の `@アカウント`)、委任の実施者、区分の確定者 | 無い(本文の文字列。原理上ログイン名) |
| `material-attribution.mjs:71`(`reviewerCheck`) | (A) レビューの書き手 | **ある**(上と同じ `PR_REVIEWS`、集約では写しの `user.id`)。`normalizeReviews`(:36-52)が `id` 以外のユーザーの識別子を落とす |
| `material-attribution.mjs:185・190-205`(`introducedBacking`) | (B) 記録を入れた PR の作成者・承認者・コミットの作成者、署名コミットの committer・author | **取れるのに捨てている**。`ghHosting`(:230-265)は REST の `pulls`・`reviews`・`commits` を引き、応答の `user.id`・`author.id`・`committer.id` を持つが、`login` だけを残す(:250-256) |
| `aggregate-evidence.mjs:401`(`gateJudgementsOfCopy`) | 判定のレビューの判定者 | **ある**。写しの `reviews[].user.id`(`records.mjs:265` が `userId` へ)。`machineFields`(:445)は `user.id N / @login → 氏名` と**並べて表示するだけ**で、対応はログイン名で引いている |
| `aggregate-evidence.mjs:1068・1082・1104-1119・1145-1146・1272・2767` | 名簿の時点の対応(IMPL-0094)、指示者、PR を経ないコミットの作者、G-6、委任 | 写し由来はある(`aggregate-evidence.mjs:250` が `author.id`)。PR を経ないコミットは git のメールだけ |
| `delegation.mjs:294` | 委任の事後の確認の承認者 | 呼び出し元のレビューの形に依る(`login` を鍵にした Map) |
| `next.mjs:301` | 名簿に無い判定者の注意 | **ある**(`next.mjs:230` が写しの `user.id` を `userId` へ) |
| `config.mjs:1983`(`aiAccountCheck`) | 語の衝突の上書きの照合 | 呼び出し側の login だけ |

### 3.3 数値の識別子が既に取れている所・使えていない所

| 経路 | 取れているか | 照合に使っているか |
| --- | --- | --- |
| 写し `record-copy.yml:24-26・66-67・82・129-131` | 取れている。作成者 `author{id,login}`、`reviews[].user{id,login,type}`。欠ければ写しを失敗させる | 使っていない |
| 出荷の複製の一致の検査 `ship-evidence.yml:31・369-370` | `user.id` を比べる鍵に含める | 一致の検査だけ。名簿との照合ではない |
| PR の検査 `gate-g5.yml:337-349・357` | レビューの `author.id` は取れている。PR の作成者は login だけ | 使っていない |
| ホスティングの照会 `material-attribution.mjs:230-265` | REST の応答に含まれる | 捨てている |
| 集約 `aggregate-evidence.mjs:242-250・445` / `records.mjs:255-265` / `next.mjs:230` | 写しから読んでいる | 表示だけ |
| 署名なしのコミット `records.mjs:73-77` | noreply のメール `<id>+<login>@users.noreply.github.com` の **id を正規表現で読み捨てている** | 使っていない |
| env-check `adoption-trial.mjs:1235-1345` | 採用者の実環境の `gh` で動く。bypass actor の `actor_id` は数値で記録する(:1279) | 名簿のログイン名を `gh api users/<login>` で数値へ解決する処理は無い |
| `gh pr view --json` を読む経路(集約の PR の記録、`is_bot`) | `author.id` は GraphQL のノード ID(数値でない)。数値は `databaseId` を明示して引く必要がある | — |

### 3.4 既存の採用者の名簿を壊さない移行の形の候補(材料。採否はしない)

| 案 | 形 | 長所 | 短所・突合が要る点 |
| --- | --- | --- | --- |
| M1 要素の型を混在させる | `accounts: ["yamada", {"login": "yamada", "id": 1234567}]` を両方受ける。`findPersonByAccount(config, {login, id})` で、名簿側に id があれば id で、無ければ login で照合 | 既存の文字列の名簿はそのまま通る | `rosterProblems:553` の拒否、`accountsConfirmed`・`changeLog.accountConfirmations`・`resolveSigner` の鍵の型、D-0 の生成区間(IMPL-0301)、`process-change/kinds/accountable.md:18・39・43` の様式を全部改める |
| M2 並行の欄 | `accountIds: {"yamada": 1234567}` を人ごとに足す | 型を変えない。差分が小さい | ログイン名と id の対がずれる(改名後に片方だけ直す)。照合の鍵が2つになる |
| M3 名簿を外へ出す | 対応表をリポジトリの外(組織の台帳・記録用ブランチ・組織の変数)へ置き、`process.config.json` には login だけ残す | 第4章 :84 の「リポジトリの外側」と一致する | CI と手元の `/pit` が外の表を読む経路が要る。読めないときの扱い(未確認として表示)を決める |
| M4 id の解決を機械にさせる | env-check または `/process-change` が `gh api users/<login>` で id を引き、名簿へ書く案を出す(人が記名して入れる) | 人が数値を手で写さない(5.8.2 の「人の転記に頼らない」と同型) | 改名済み・他人が取得済みのログイン名を解決すると、**別人の id を固定する**。解決した時点と確かめた者を記録に残す必要。名簿へ足すのは人(deliverable-templates.md:153)と整合させる |
| M5 照合の段階を表示する | id で照合できた承認と、login でしか照合できなかった承認を分けて数え、後者を保証の開示の項目1 に出す。期限を置いて login のみの照合を数えない段へ進める | 未達と省略の区別(ADR-0028)の型。既存の採用者を即時に壊さない | 第4章 :84 は login だけの対応表を「同定できたものとして扱わない」と書く。移行期間に数えることは、条項の文言と食い違う。厳しくする向きの変更の即時適用(ADR-0055 の型)との整合を決める |
| M6 写しの id で名簿の記載を検査する | 写し・PR の検査で、ホスティングの (login, id) と名簿の (login, id) が食い違えば所見(改名・他人の取得の疑い) | 名簿の記載の正しさの一部を機械で見られる(現状は監査の観点6 だけ) | 名簿に id が無い間は何も検出しない |

いずれの案でも残る点:

- 作成を指示した者・委任の実施者・区分の確定者は、PR 本文の `@アカウント` の文字列から引く(`check-pr.mjs:648・1054・1239`、`ci-gates.md:680`)。**原理上ログイン名で、数値にできない**。本文を書いた時点のログイン名が名簿の誰かへ対応すれば足りるとするか、決める必要がある
- 承認・判定の時点の名簿への対応(IMPL-0094、`gate-criteria.md:968`)は過去の構成の名簿を読む。過去の名簿には id が無い

### 3.5 関係する実装マーク

| IMPL | 状態 | 関係 |
| --- | --- | --- |
| (gate-criteria.md:84 の対応表) | **マーク無し** | 数値の識別子の対応表とリポジトリの外側の保守。降りていない規定として表示されていない |
| IMPL-0125 | delivered / presence | 「判定者の数値の識別子と席」を出す。数値は表示するが、席への対応はログイン名 |
| IMPL-0126・IMPL-0354 | delivered | 写しに数値の識別子とログイン名を含める。満たしている |
| IMPL-0094 | delivered / manual | 時点の名簿への対応。login で照合 |
| IMPL-0266 | delivered / machine | `accountsConfirmed` の確認。login で照合 |
| IMPL-0301 | delivered / presence | D-0 節1 の名簿の列(識別子・氏名・区分・アカウント)。数値の列なし |
| IMPL-0413・IMPL-0414 | delivered / machine | 効力を持つ記録の帰属。`findPersonByAccount`(login)に依る。material-attribution.mjs:14-15 が「名簿の照合はログイン名(#429)」「共有の構成では区別できない(#429)」と限界を書く |
| IMPL-0415 | undelivered(#428) | 層1・D-0・SG の帰属。降ろすときに同じ照合を使うはず |
| IMPL-0417 | delivered / presence | `gh pr review` の deny と常駐の規則。`gh api` 直は止めない |
| IMPL-0199 | delivered / manual | 認証情報の置き場の読み取りを ask。担い手が既存の `gh` 認証を使うことは対象外 |
| IMPL-0299 | undelivered / adopter | レーン(認証情報の組)の写像。構成にレーンの概念が無い |

## 4. 研究の下書きにある関係する知見

| 所在 | 内容 |
| --- | --- |
| `research/380-deliberation/survey-380-1-internal.md:146-148` | H-7【低】。既定の利用(Claude Code が本人の gh 認証で動く)では常に開示側に落ちる可能性が高い。`/process-init` の8問に問いがあるかは未確認だった(本調査で、無いことを確かめた) |
| `research/380-deliberation/council-02-field.md:25・62・91・213・216` | 現場の委員。認証情報の共有の下では、どの案でも「人が操作した」ことを示す手段が消える。H-7 は「直す」: `/process-init` に「AI の担い手は人と別の名義で動くか」を問う、または既定値を決め `/process-change` の変化点に加える。EV の差し替え条件に共有の構成の件数 |
| `research/380-deliberation/council-03-qa-audit.md:82・143・192` | 品質保証の委員。レビューの提出者は**数値の識別子**で名簿に対応づける(login は改名できる)。AI 専用アカウントに開かせ出荷判定者が承認する形は成り立つが、構成に問う手段が無い。H-7 は未決として記録し別 Issue |
| `research/380-deliberation/council-04-standards.md:82・112・136` | 規格の委員。専用アカウントは職務の分離の一般原則と SRC-0539 に整合するが、**義務にする根拠は無い**(1〜2名の負担、ホスティングの利用規約がプラットフォームごとに違う)。推奨と開示にとどめる |
| `research/380-deliberation/council-05-defender.md:79・94・97・130・177` | 擁護の委員。照合は数値の識別子と `people[].accounts` で。共有の体制では自己申告として開示(悪くはしない)。専用アカウントは「前提でなく選択肢」 |
| `research/380-deliberation/council-01-drafter.md:96・175・388-390` | 起草の委員。改善の経路は AI の担い手の別アカウント。構成の入力の追加は `/process-change` の種別と D-0 の生成区間に及ぶため別 Issue |
| `research/380-deliberation/decision.md:81-82` | 裁定。(i) 宣言行のレビューを出さないことを権限設定(ask)と常駐の規則で降ろす。(ii) アカウントの分離を構成の入力にするかは後継へ。名簿の照合のログイン名も後継へ |
| `research/380-deliberation/crosscheck.md:126` | 裁定は ask、実装は deny(強める向き)。IMPL-0417 は deny と書き、コードと一致 |
| `research/312-deliberation/council-02-field.md:86` | レーンの共有は認証情報の共有を意味し、人の単位の禁止を機械で強制する手段を手放す |
| `research/phase4-standard/321-decision.md:30・52・70`、`research/integration-321/decision.md:15` | 数値の識別子の対応表・写しの最小の組を第4章・第5章へ置いた経緯(#321) |
| `research/sources/SRC-0539.yaml`(ISACA、2026-09-15) | c2: 人の利用者と、エージェント実行基盤・ツール実行・運用者の ID を分ける(非人間 ID を職務分離の単位にする)。c4: 権限・提供者などの変化で再評価。知見 FND-0182(TH01)・FND-0276(TH12)・FND-0191(TH02)が引く |
| `research/sources/SRC-0248.yaml` | 低リスク PR に限り AI 承認を許した事例。非人間が作成した PR は人がマージ(作成者が人か非人間かを名義で区別できる前提) |
| `research/sources/SRC-0541.yaml` | ベンダーの解説(反証として採取)。準備者と承認者の ID が同じなら自己承認を拒否する(自己申告) |
| `research/282-survey-2026-09/findings.yaml` FND-0276 | 読めた内部統制の規準は、職務分離の担い手が人であることを条文上の要件にしていない(J-SOX・SOC 2・COSO) |

外部動向(2026-09 時点)の束に、「AI の担い手が人の認証情報で動く比率」や「専用アカウントの運用負担」を測った知見は見当たらない。EV-0220 の差し替え条件の値は未測定のまま。

## 5. 突合で注意が要る点(会議体への申し送り)

1. **「席ごとに認証情報を分ける」の主語**。1.10.2(overview.md:636・645)と ADR-0083 の離脱は席(レーン)の単位。人と AI の共有を同じ離脱に入れるなら、1.10.2 の表の行を広げる変更(厳しくする向き)になり、ほぼすべての1〜2名の採用者が離脱を持つ。別の扱い(構成の入力・開示)にするなら、1.10.2 との関係を書き分ける必要がある
2. **G-6 の承認への波及**。#380 の議論は効力を持つ記録に限っていた。共有の構成では G-6 の「独立した人の確認」(gate-criteria.md:938-949)も同じ前提で崩れる。範囲を効力を持つ記録に留めるか、G-6 まで広げるかを決める必要がある
3. **担い手の識別に名義を入れるか**。入れれば 3.4.2 の失効(識別の変化で失効)と変化点4 が名義の変更にも掛かる。入れなければ、名義を別の欄(D-0 表7 または表5-2 と別の表)に置く
4. **数値の識別子の要求と移行期間の文言**。gate-criteria.md:84 は login だけの対応表を「同定できたものとして扱わない」。現状のテンプレートはこれを満たしておらず、しかもマークが無い。移行の間をどう表示するか(未達として出す / 例外として数える)は、条項の文言との矛盾として先に決める必要がある
5. **「リポジトリの外側」**。名簿が `process.config.json` にある現状との差は、数値の識別子とは別の論点として残る
6. **テンプレート内の前提の食い違い**(recording.md と performer.md:39)は、どちらの決定でも直す対象になる
