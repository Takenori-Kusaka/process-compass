# #379 外部調査: 記録ブランチへの書き込みの限定・追記専用の記録・改ざんの検出

- 調査日: 2026-11-05(全出典の確認日。以下「確認日」は省略時すべて 2026-11-05)
- 前提: GitHub 上の専用ブランチに、承認レビューの写しと判定記録を機械と人が追記する。ルールセットは履歴の書き換え(force push)と削除だけを止めており、書き込み権限を持つ者とジョブのトークンは、新しいコミットで既存ファイルを変更・追記できる
- 読み方: 各項目に **[確認]**(一次資料の本文で確かめた)/**[要約経由]**(WebFetch の要約モデルを通して読んだ。逐語の照合はしていない)/**[二次]**(第三者の解説・Issue)/**[推測]**(本調査の推論。検証していない)を付ける
- 注意: WebFetch は要約モデルを経由するため、引用とした文も一字一句の照合は済んでいない。条文として使う前に原典を目視すること

## 0. 結論の要旨

1. GitHub のルールセットで「特定ブランチへの push を bypass 主体だけに限る」ことは可能(`update` 規則 = Restrict updates)。bypass 主体の型は `Integration`(GitHub App)・`RepositoryRole`・`Team`・`DeployKey`・`User`・`OrganizationAdmin` で、個人所有リポジトリで使えないと明記されたのは `OrganizationAdmin` だけ **[確認]**。ただし **GITHUB_TOKEN はリポジトリ内のどのワークフローにも同じ App(GitHub Actions)の名義で出る**ため、「特定のワークフローだけ」に限る手段にはならない **[確認+推測]**
2. 「特定のワークフローだけが書ける」を実現する現実の手段は、専用 GitHub App を bypass に入れ、その秘密鍵を **environment secret** に置き、environment の deployment branch 制限と required reviewers で鍵を取り出せるジョブを絞る組み合わせ **[推測(各部品は確認済み)]**
3. 「Restrict file paths」は push rulesets の規則で、**private / internal リポジトリにしか適用できない**(public では使えない)**[確認]**。「Restrict who can push」(旧ブランチ保護)は組織所有のリポジトリ向けで、個人所有での可否は文書に記載なし **[確認(記載なし)]**
4. どの GitHub 側の制御も、リポジトリの admin(個人所有なら所有者)がルールセット自体を書き換えられる点は塞げない。改ざんの「防止」は GitHub の外(WORM ストレージ・透明性ログ・外部へのハッシュの記録)に置かない限り成立せず、Git 内でできるのは「検出」まで **[推測]**
5. Git の author/committer は任意に設定でき、git の文書自身が「認証に影響しない」と書いている **[確認]**。署名の無いコミットの author 一致は、人の帰属の裏づけにならない

---

## 1. GitHub で書き込みを特定のアクターに限る手段

### 1.1 ルールセットの規則(2026-11 時点)

| 規則 | 内容 | 根拠 |
| --- | --- | --- |
| Restrict updates(`update`) | 「only users with bypass permissions can push to branches or tags whose name matches the pattern」。パラメータ `update_allows_fetch_and_merge`(上流からの取り込みを許す)が必須 | **[要約経由]** S1, S3 |
| Restrict creations / deletions | 作成・削除を bypass 主体に限る | **[要約経由]** S1 |
| Block force pushes(`non_fast_forward`) | 前提の現状設定 | S3 の規則 enum |
| Require signed commits(`required_signatures`) | 「contributors and bots can only push commits that have been signed and verified」。vigilant mode 下の "Partially verified" も許される | **[要約経由]** S1, S2 |
| Restrict file paths(`file_path_restriction`) | 指定パスを変更するコミットの push を拒否。fnmatch(`File::FNM_PATHNAME`)。**push ruleset の規則で、private / internal リポジトリとその fork network にだけ作れる** | **[要約経由]** S1, S4, S5 |
| commit_author_email_pattern / committer_email_pattern | メールアドレスの文字列パターンを検査する規則。**名義の真正性は検査しない**(文字列なので任意に設定できる。§4) | 規則 enum は **[確認]** S3、評価は **[推測]** |

- 規則 enum は REST API 文書で 25 種を確認した(`creation`, `update`, `deletion`, `required_linear_history`, `merge_queue`, `required_deployments`, `required_signatures`, `pull_request`, `required_status_checks`, `non_fast_forward`, `commit_message_pattern`, `commit_author_email_pattern`, `committer_email_pattern`, `branch_name_pattern`, `tag_name_pattern`, `workflows`, `code_scanning`, `code_quality`, `code_coverage`, `copilot_code_review`, `license_compliance_scanning`, `file_path_restriction`, `max_file_path_length`, `file_extension_restriction`, `max_file_size`)**[要約経由]** S3
- push rules の GA は 2024-09-10。Team プランの private リポジトリと fork、Enterprise Cloud の internal リポジトリ **[要約経由]** S5。2026-11 時点で public への拡大を示す文書は見つからなかった(見つからなかったことの確認であり、無いことの証明ではない)
- ルールセットと旧ブランチ保護は重ねて適用され、該当する全規則が強制される(「all applicable rules are enforced」)**[要約経由]** S6
- ルールセットの評価結果は Rule Insights に、通過と bypass の両方が残る(actor・期間で絞れる)**[要約経由]** S7。保存期間は文書に記載なし

### 1.2 bypass の主体と個人所有リポジトリ

- REST の `bypass_actors.actor_type` は `Integration` / `OrganizationAdmin` / `RepositoryRole` / `Team` / `DeployKey` / `User`。`bypass_mode` は `always`(既定)/ `pull_request` / `exempt` **[要約経由]** S3
- 文書は「OrganizationAdmin is not applicable for personal repositories.」と書く **[要約経由]** S3。他の型について個人所有での不可は書かれていない。**個人所有リポジトリで GitHub App(Integration)を bypass に入れられるかは、文書上は否定されていないが、実機で未確認 [推測]**
- 個人ユーザーを bypass に直接入れる機能は 2026-05-07 の changelog で追加(リポジトリ単位のルールセット)**[要約経由]** S8。対象の所有形態・プランは記載なし
- 旧ブランチ保護の文書は「Actors may only be added to bypass lists when the repository belongs to an organization.」と書く **[要約経由]** S2。これは旧ブランチ保護の bypass 一覧の話で、ルールセットの bypass と混同しないこと
- ルールセットでは admin であること自体は bypass にならない(bypass 一覧に載った主体だけが通る)という報告がある **[二次]** S9。旧ブランチ保護では admin は既定で除外され、「Do not allow bypassing the above settings」で初めて admin にも掛かる **[要約経由]** S2
- `pull_request` モードでも、bypass 主体は要件を満たさない PR を merge できるという報告 **[二次]** S9

### 1.3 旧ブランチ保護「Restrict who can push to matching branches」

- 対象: GitHub Free の組織が所有する public リポジトリ、Team / Enterprise Cloud の組織が所有する全リポジトリ **[要約経由]** S2。**個人所有リポジトリでの可否は記載なし**。押せる主体は write 権限を持つ user / team / installed GitHub App。「People and apps with admin permissions to a repository are always able to push」**[要約経由]** S2

### 1.4 GITHUB_TOKEN と GitHub App のインストールトークン

| 観点 | GITHUB_TOKEN | 専用 GitHub App のインストールトークン |
| --- | --- | --- |
| 正体 | 「a GitHub App installation access token」。Actions を有効にした時点で GitHub が入れる App の名義 **[要約経由]** S10 | 自組織・自分が作った App の名義 **[要約経由]** S11 |
| 寿命 | ジョブ終了時、または最大 6 時間(GitHub ホストランナー)**[要約経由]** S10 | 1 時間 **[要約経由]** S11 |
| 範囲 | ワークフローを含むリポジトリに限る。権限は `permissions:` で絞る **[要約経由]** S10 | `repositories` / `permissions` で発行時に絞れる **[要約経由]** S11 |
| 他ワークフローの起動 | 原則起動しない(`workflow_dispatch` 等は例外)**[要約経由]** S10 | 起動する **[推測(S10 の「App トークンか PAT を使え」の記述から)]** |
| ワークフロー単位の区別 | **できない**。どのワークフロー・どのブランチのジョブでも同じ名義 **[推測]** | 鍵の置き場で区別できる(下記)**[推測]** |

- GitHub Actions の App(Integration ID 15368 とされる)を bypass に入れる例・入らないという報告が混在する **[二次]** S12, S13。公式文書で 15368 と bypass の可否は確認できなかった。**GITHUB_TOKEN を bypass に入れると、書き込み権限を持つ者が別ブランチに置いたワークフローのジョブも同じ名義で通る [推測]**。これは前提の弱点(書き込み権限者とトークンが書ける)を解消しない
- 専用 App 方式で、App 鍵を誰が使えるかを絞る部品:
  - environment secret は「only available to workflow jobs that use the environment」かつ「can only access these secrets after any configured rules (for example, required reviewers) pass」**[要約経由]** S14
  - deployment branches and tags で environment を使えるブランチ・タグを限定、required reviewers、prevent self-review、wait timer **[要約経由]** S14
  - 可否: GitHub Free の個人は public リポジトリでだけ environment を設定できる。Pro の個人・Team の組織は private でも可。個人所有では所有者だけが設定できる **[要約経由]** S14
  - **残る穴 [推測]**: 書き込み権限者が main 等の許可ブランチのワークフローを書き換えられるなら鍵を取り出せる。許可ブランチ自体の保護(PR 必須・レビュー必須)と `.github/workflows` の変更の制限(ルールセットの `workflows` 規則や CODEOWNERS)とで閉じる必要がある
- 署名との関係: App・bot が API で作ったコミットは、作成要求が App として認証され、author・committer・署名を独自指定しない場合に GitHub が署名し verified になる **[要約経由]** S15。ランナー上の `git commit` → `git push` は署名されないため、`required_signatures` を課すと拒否される **[推測]**

### 1.5 所有形態ごとの可否(まとめ)

| 手段 | 個人所有 public(Free) | 個人所有 private | 組織所有 |
| --- | --- | --- | --- |
| ルールセット(update / non_fast_forward / required_signatures) | 可と考えられる **[推測]**(about-rulesets は Team/Enterprise を挙げるのみで、Free・Pro の記述は要約経由では取れなかった) | Pro 以上が要るという報告 **[二次]** S9 | 可 |
| bypass に App / DeployKey / User | 文書上の否定は OrganizationAdmin だけ **[要約経由]** S3。実機未確認 | 同左 | 可 |
| Restrict file paths(push ruleset) | **不可**(private / internal 限定)**[要約経由]** S1, S5 | Team 以上の組織でないと不可と読める **[要約経由]** S5。個人 Pro の可否は未確認 | Team(private)/ Enterprise Cloud(internal) |
| Restrict who can push(旧保護) | 記載なし → 不可と推定 **[推測]** | 同左 | 可 |
| environment の required reviewers・branch 制限 | 可 **[要約経由]** S14 | Pro 以上 | 可 |

**プロジェクトの実リポジトリの現状**: `gh api` で Takenori-Kusaka/process-compass(個人所有・public)、pit-in-template、pit-crew、zenn-content のルールセットを読んだところ、いずれも 0 件だった(2026-11-05 時点)。前提に書かれたルールセットは、利用者側リポジトリの想定と読める **[確認(自リポジトリ API)]**

---

## 2. 追記専用の記録・改ざんの検出の実務

### 2.1 WORM ストレージ

- AWS S3 Object Lock: WORM モデル。compliance mode では root を含む誰も保持期間中に上書き・削除できず、モードの変更・期間の短縮もできない。期限前に消す唯一の方法は AWS アカウントの削除。governance mode は `s3:BypassGovernanceRetention` を持つ者が外せる。legal hold は期限なし。SEC 17a-4・CFTC・FINRA の環境向けに Cohasset Associates の評価を受けた **[確認(本文を取得)]** S16
- 含意 **[推測]**: 「書き込み権限者が既存を変更できない」を保証できるのは、管理者でも外せない compliance mode のような層。Git ホスティングの権限設定は、admin が設定を変えられる時点で governance mode 相当にとどまる

### 2.2 透明性ログ(Sigstore / Rekor)

- Rekor は「an immutable, tamper-resistant ledger of metadata generated within a software project's supply chain」。監査者が一貫性を検査することで「the log remains append-only and entries are never mutated or removed」を確かめる。包含証明の照会、自分の識別子の監視ができる。公開インスタンスは可用性 SLO 99.5% **[要約経由]** S17
- Purdue University がログの監視(追記専用の確認)を運用 **[要約経由]** S18
- Rekor v2 の状況・保存期間・エントリの削除可否は、今回の取得範囲では確認できなかった

### 2.3 in-toto attestation と SLSA

- in-toto attestation は Envelope / Statement / Predicate(/ Bundle)の層。Statement の `_type` は `https://in-toto.io/Statement/v1`。Predicate は型ごとのスキーマを持つ任意のメタデータで、定義の手続きがある **[要約経由]** S19
- 登録済み predicate(一覧の表示範囲): `cyclonedx`, `link`, `provenance`, `reference`, `release`, `runtime-trace`, `scai`, `spdx`, `svr`, `test-result`, `vsa`, `vuln` 等。**レビューの承認そのものを表す predicate は表示範囲に無かった**(一覧は途中で切れており、無いことの証明ではない)**[要約経由]** S20
- SLSA provenance: predicateType `https://slsa.dev/provenance/v1`。`buildDefinition` と `runDetails`(`builder.id`)。ビルドの来歴であり、ソースは `resolvedDependencies` の一例として出るだけ。現行版は v1.2 **[要約経由]** S21
- SLSA v1.2 Source track **[要約経由]** S22:
  - L2「Branch history is continuous, immutable, and retained」。git では `git push --force` を禁じる技術的制御が要る
  - L3 名前付き参照への組織の技術的制御の強制、L4 保護ブランチへの全変更に 2 名の信頼された者のレビュー
  - Source Provenance は「MUST be created contemporaneously with the branch being updated」。Source VSA を発行する
  - SCS は行為者の識別・認証手段を持たねばならず(MUST)、活動は認証された識別子へ帰属させるべき(SHOULD)
  - 含意 **[推測]**: 前提の「force push と削除だけを止める」は L2 の継続性・不変性(参照の巻き戻し禁止)に相当する。**既存ファイルの内容を新しいコミットで書き換えることは L2 でも禁じられていない**(履歴は残るため)。「内容の追記専用」は SLSA Source track の要求ではない

### 2.4 GitHub artifact attestation(actions/attest-build-provenance)

- 「unfalsifiable provenance and integrity guarantees」を作り、成果物とワークフローを結ぶ。単体で SLSA v1.0 Build L2、再利用可能ワークフローで L3。public リポジトリは Sigstore Public Good Instance を使い、公開の不変な透明性ログへ書く。private は GitHub の Sigstore インスタンスで **透明性ログが無い**。「not a guarantee that an artifact is secure」**[要約経由]** S23
- actions/attest-build-provenance は v4 から `actions/attest` の薄いラッパーで、新規は `actions/attest` を使えとされる。private / internal で使うには GitHub Enterprise Cloud が要る **[要約経由]** S24
- 含意 **[推測]**: 判定記録ファイルのダイジェストを subject にして attest すれば、「どのワークフロー実行がこの内容を作ったか」を記録ブランチの外(GitHub の attestations API・public なら Rekor)に残せる。個人所有の private リポジトリでは使えない

### 2.5 Git の記録で改ざんを検出する方法

| 方法 | 検出できるもの | 検出できないもの | 根拠 |
| --- | --- | --- | --- |
| コミットのハッシュの連鎖 | 内容の破損・既知のハッシュとの不一致。「Object names can be signed and third parties can trust the hash to address the signed object and all objects it references」 | 誰が書いたか。正規の新コミットでの変更(履歴に残るが、変更自体は止めない) | **[要約経由]** S25 |
| SHA-1 の強度 | Git 2.13.0 以降は SHAttered に耐える強化 SHA-1。ただし「SHA-1 is still weak」。SHA-256 形式は存在するが、プロトコルが対応するまで公開サーバでの利用は「strongly discouraged」 | — | **[要約経由]** S25 |
| GitHub の署名の検証 | push 時に検証記録をコミットに保存し、「can't be edited」。鍵が後に失効しても verified は維持 | 署名者が正当な承認者か(鍵の持ち主と名簿の照合は別) | **[要約経由]** S15 |
| required_signatures | 署名・検証されたコミットだけを受け付ける | 同上 | **[要約経由]** S1 |
| gitsign(Sigstore keyless) | OIDC の識別子に結んだ短命証明書で署名し、Rekor に記録。`gitsign verify --certificate-identity ... --certificate-oidc-issuer ...` で識別子まで検証 | GitHub 上では Unverified 表示(Sigstore の CA が GitHub の信頼ルートに無い・証明書が短命のため)。公開 Rekor に email 等が載る | **[要約経由]** S26 |
| 外部へのハッシュの記録 | ブランチ先頭のコミットハッシュを外部(RFC 3161 TSA・透明性ログ・WORM)へ定期記録すれば、その時点以降の巻き戻し・差し替えを検出できる。RFC 3161 は「proof that a datum existed before a particular time」 | 記録の間隔より短い区間の改ざん | RFC は **[要約経由]** S27、方式は **[推測]** |
| GitHub の activity view | direct push・force push・ブランチの作成・削除を、認証済みユーザーに結んで表示 | 保存期間・個人所有での可否は記載なし | **[要約経由]** S28 |

- 含意 **[推測]**: 前提の構成(force push と削除の禁止)では、既存ファイルの変更は「新しいコミット」として必ず履歴に残る。したがって**検出は可能、防止は不可能**。検出を成立させるには「過去のコミットのファイルと、現在のファイルの差分を機械が検査する」(追記以外の差分があれば失敗させる)ことと、その検査自体が書き換えられない場所で走ることが要る

---

## 3. 規格・指針(記録の完全性)

### 3.1 21 CFR Part 11 **[確認(eCFR の本文を取得)]** S29

- 11.10 柱書: closed system の利用者は、電子記録の「authenticity, integrity, and, when appropriate, the confidentiality」を確保し、署名者が記録を本物でないと容易に否認できないようにする手順・管理を用いる
- 11.10(a): システムのバリデーションによる「the ability to discern invalid or altered records」
- 11.10(c): 保存期間を通じた正確・迅速な取り出しのための記録の保護
- 11.10(d): システムへのアクセスを権限ある個人に限る
- 11.10(e): 「secure, computer-generated, time-stamped audit trails」で、電子記録を作成・変更・削除する操作者の入力と行為の日時を独立に記録する。「Record changes shall not obscure previously recorded information.」監査証跡は対象記録と同じ期間以上保存する
- 11.10(g): 権限の検査(権限ある個人だけがシステムを使い、電子署名し、…)
- 11.10(j): 個人に説明責任を負わせる書面の方針
- 11.3(b)(4) closed system / (b)(9) open system の定義、11.30 open system の追加管理、11.50(a) 署名の表示(署名者・日時・意味)、11.70 署名と記録の結合
- FDA の 2003 年ガイダンス「Part 11, Electronic Records; Electronic Signatures — Scope and Application」: 11.10(e) の監査証跡と 11.10(a) のバリデーションの特定要件に enforcement discretion を表明。一方でアクセス制限・権限検査・電子署名などその他の規定と、predicate rule は執行するとしている **[要約経由]** S30
- 含意 **[推測]**: 11.10(e) の「変更が以前の記録を覆い隠さない」は、Git の「新コミットで変更しても履歴に残る」と形の上では合う。ただし「computer-generated」「独立に記録」は、記録者が自分で書けるファイルではなく、システムが自動で付ける証跡を指すと読むのが自然

### 3.2 NIST SP 800-53 Rev. 5 **[確認(NIST の OSCAL カタログ JSON 5.2.0 を取得して抽出)]** S31

- **AU-9 Protection of Audit Information**: a. 監査情報と監査ログ機能を、権限の無いアクセス・変更・削除から保護する。b. 権限の無いアクセス・変更・削除を検知したら [組織が定める者] に通知する
  - AU-9(1) Hardware Write-once Media / AU-9(2) Store on Separate Physical Systems or Components / **AU-9(3) Cryptographic Protection**(監査情報の完全性を暗号で保護。指針は非対称鍵による署名付きハッシュを例示)/ AU-9(4) Access by Subset of Privileged Users / **AU-9(5) Dual Authorization** / AU-9(6) Read-only Access / AU-9(7) Store on Component with Different Operating System
- **AU-10 Non-repudiation**: 個人(または個人の代わりに動くプロセス)が [組織が定める行為] を行ったことの反論できない証拠を提供する。指針は「approving information」を対象の行為に含める
  - AU-10(1) Association of Identities / AU-10(2) Validate Binding of Information Producer Identity / **AU-10(3) Chain of Custody**(レビュー・リリースした情報について、確立した保管の連鎖の中でレビュー者・リリース者の資格情報を維持する)/ **AU-10(4) Validate Binding of Information Reviewer Identity** / AU-10(5) Digital Signatures は **withdrawn(SI-7 に統合)**
- 含意 **[推測]**: AU-9(2)(別システムへの保存)と AU-9(1)(書き込み一回媒体)は、「監査対象と同じ場所に、監査対象の書き手が書ける記録を置く」構成を想定外とする方向の強化。AU-10(4) は承認レビューの写しに直結する(レビュー者の識別子と情報の結合の検証)

### 3.3 ISO/IEC 27001:2022 附属書A **[原典の該当箇所は読めていない]**

- iTeh の公開プレビュー(ISO/IEC 27001:2022、S32)は目次と 6.1.3 付近までで、**7.5.3 と附属書A の本文は含まない**。ISO/IEC 27002:2022(仏語版プレビュー)の目次で、管理策の題名「8.15 Journalisation(Logging)」「5.33 Protection des enregistrements(Protection of records)」「8.17 Synchronisation des horloges」の存在だけを確認した **[確認(目次のみ)]** S33
- 8.15 の内容(ログの生成・保存・保護・分析)は二次資料による **[二次]** S34。8.15 が 2013 年版の 12.4.1〜12.4.3(ログの保護を含む)を統合したという記述も二次 **[二次]** S34
- 本文の文言はここに書かない(推測で書かないため)

### 3.4 ISO 9001:2015 7.5.3(文書化した情報の管理)**[原典は読めていない]**

- 本調査では一次資料を取得できなかった。プロジェクトの出典台帳には既に二次資料 SRC-0692(7.5.3 が、文書化した情報が必要なときに入手でき、完全性の喪失から保護され、版の管理を含む変更の管理を受けることを求める、という解説)と、JIS Q 9001 のプレビュー取得失敗の記録 SRC-0648 がある **[二次]**
- 条番号 7.5.3 は ISO/IEC 27001:2022 プレビューの目次に「7.5.3 Control of documented information」として現れる(27001 側の同名の条)**[確認(目次のみ)]** S32。ISO 9001 側の細分(7.5.3.1 / 7.5.3.2)の文言は未確認
- ISO 9001:2026 の改訂版の扱いは今回は調べていない(台帳に SRC-0542 の二次資料あり)

---

## 4. 署名の無いコミットの author 一致を人の帰属の裏づけにしてよいか

**結論: してはならない、と判断できる材料が揃っている。**

- Git: author・committer は環境変数 `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` / `GIT_COMMITTER_*`、設定 `user.name` / `user.email` から取られ、`--author` で上書きできる。「This name has no effect on authentication」**[要約経由(逐語として返った)]** S35
- GitHub: 「Git allows you to set the author of your changes and the identity of the committer」。だから署名で信頼を与える、と説明している **[要約経由]** S36
- GitHub の verified の意味 **[要約経由]** S15, S36:
  - Verified = 署名があり、検証に成功した(vigilant mode の下では committer が唯一の vigilant mode 有効の author であることも含む)
  - Partially verified = 署名はあるが、author(committer と別人で vigilant mode 有効)の同意を保証しない
  - Unverified = 署名が検証できない。vigilant mode を有効にした者の名義の署名なしコミットも Unverified
  - vigilant mode は既定で無効。**無効の利用者の名義を騙った署名なしコミットには、何の表示も付かない**(表示が付くのは vigilant mode を有効にした本人の名義だけ)**[推測(S36 の「unsigned commits … marked Unverified」が vigilant mode 有効時の記述であることから)]**
  - verified は「GitHub アカウントに登録された鍵で署名された」ことの表示で、その人が承認者として正当か(名簿・権限)は別の照合 **[推測]**
- push した者(認証された主体)と commit の author は別物。GitHub の activity view は push を認証済みユーザーに結ぶ **[要約経由]** S28。人の帰属に使えるのは、(1) 検証された署名、(2) GitHub が認証した操作の記録(PR のレビュー API が返す reviewer、activity view・監査ログの actor)であって、commit の author 文字列ではない **[推測]**
- SLSA Source track も、活動を「authenticated identities」へ帰属させることを求める(SHOULD)**[要約経由]** S22
- NIST AU-10(4) は、レビュー者の識別子と情報の結合を検証することを求める **[確認]** S31。author 文字列の一致は「結合の検証」にあたらない **[推測]**

---

## 5. 設計上の論点(会議体への申し送り。いずれも推測)

1. 前提の構成で「承認レビューの写し」を記録ブランチに置く場合、写しの真正性は写しのファイルからではなく、GitHub が認証した一次記録(PR レビューの API 応答)との再照合で確かめる設計にしないと、書き込み権限者が写しを書き換えた場合に区別できない
2. 「機械だけが書く」を求めるなら、GITHUB_TOKEN ではなく専用 App + environment 秘密鍵 + `update` 規則の bypass + `required_signatures`(API 経由のコミットで GitHub 署名)の組み合わせが候補。個人所有で App の bypass が通るかは実機検証が要る
3. 「人も追記する」場合、人の追記は署名(vigilant mode 推奨)か PR 経由に限らないと、帰属が author 文字列に落ちる
4. 追記専用(既存ファイルの変更禁止)は GitHub の規則では表現できない(`file_path_restriction` はパス単位の全面禁止で、public では使えない)。機械の検査で「追加以外の差分」を失敗させ、その検査を保護されたワークフローで走らせる形になる
5. 管理者(個人所有では所有者)はルールセットを外せる。これを残余リスクとして開示するか、外部記録(public なら attestation→Rekor、あるいは WORM)で補うかを決める必要がある

---

## 出典(確認日はすべて 2026-11-05)

| ID | 出典 | URL | 読み方 |
| --- | --- | --- | --- |
| S1 | GitHub Docs: Available rules for rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets | 要約経由 |
| S2 | GitHub Docs: About protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches | 要約経由 |
| S3 | GitHub REST: Repository rules | https://docs.github.com/en/rest/repos/rules | 要約経由 |
| S4 | GitHub Docs: Creating rulesets for a repository | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository | 要約経由 |
| S5 | GitHub Changelog 2024-09-10: Push rules are now generally available | https://github.blog/changelog/2024-09-10-push-rules-are-now-generally-available-and-updates-to-custom-properties/ | 検索結果の要約経由 |
| S6 | GitHub Docs: About rulesets | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | 要約経由 |
| S7 | GitHub Docs: Managing rulesets for a repository | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository | 要約経由 |
| S8 | GitHub Changelog 2026-05-07: Repository rulesets: User bypass and branch renaming | https://github.blog/changelog/2026-05-07-repository-rulesets-user-bypass-and-branch-renaming/ | 要約経由 |
| S9 | olillevik/shield-up Issue #4(第三者) | https://github.com/olillevik/shield-up/issues/4 | 二次 |
| S10 | GitHub Docs: GITHUB_TOKEN | https://docs.github.com/en/actions/concepts/security/github_token | 要約経由 |
| S11 | GitHub Docs: Generating an installation access token for a GitHub App | https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app | 要約経由 |
| S12 | community Discussion #136531 | https://github.com/orgs/community/discussions/136531 | 二次(検索結果) |
| S13 | shakenfist/development Issue #215 | https://github.com/shakenfist/development/issues/215 | 二次(検索結果) |
| S14 | GitHub Docs: Managing environments for deployment | https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment | 要約経由 |
| S15 | GitHub Docs: About commit signature verification | https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification | 要約経由 |
| S16 | AWS: Locking objects with Object Lock | https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html | 本文取得 |
| S17 | Sigstore: Rekor overview | https://docs.sigstore.dev/logging/overview/ | 要約経由 |
| S18 | Sigstore FAQ | https://docs.sigstore.dev/about/faq/ | 要約経由 |
| S19 | in-toto attestation spec | https://github.com/in-toto/attestation/blob/main/spec/README.md | 要約経由 |
| S20 | in-toto attestation predicates | https://github.com/in-toto/attestation/tree/main/spec/predicates | 要約経由(一覧は途中まで) |
| S21 | SLSA v1.1 Provenance(v1.2 が現行と明記) | https://slsa.dev/spec/v1.1/provenance | 要約経由 |
| S22 | SLSA v1.2 Source requirements | https://slsa.dev/spec/v1.2/source-requirements | 要約経由 |
| S23 | GitHub Docs: Artifact attestations | https://docs.github.com/en/actions/concepts/security/artifact-attestations | 要約経由 |
| S24 | actions/attest-build-provenance | https://github.com/actions/attest-build-provenance | 要約経由 |
| S25 | Git: hash-function-transition | https://git-scm.com/docs/hash-function-transition | 要約経由 |
| S26 | sigstore/gitsign README | https://github.com/sigstore/gitsign | 要約経由 |
| S27 | RFC 3161 Time-Stamp Protocol | https://www.rfc-editor.org/rfc/rfc3161 | 要約経由 |
| S28 | GitHub Docs: Using the activity view | https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/using-the-activity-view-to-see-changes-to-a-repository | 要約経由 |
| S29 | eCFR 21 CFR Part 11 | https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11 (取得は https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-21?part=11 ) | 本文取得(要約経由で抽出) |
| S30 | FDA Guidance: Part 11 Scope and Application(2003-09) | https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application | 要約経由 |
| S31 | NIST SP 800-53 Rev.5 OSCAL catalog(version 5.2.0) | https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json | 本文取得(JSON から機械抽出) |
| S32 | ISO/IEC 27001:2022 iTeh プレビュー | https://cdn.standards.iteh.ai/samples/82875/4d4c8d99950c4b39aaa39cf5cb9a0bf3/ISO-IEC-27001-2022.pdf | 本文取得(目次〜6.1.3 のみ) |
| S33 | ISO/IEC 27002:2022(F) iTeh プレビュー | https://standards.iteh.ai/catalog/standards/sist/1fc38e10-624f-4e18-a0a8-5c3283e61a1a/iso-iec-27002-2022 | 本文取得(目次のみ)。同一セッションの作業領域に既に取得されていた PDF を読んだ |
| S34 | ISMS.online: ISO 27001:2022 Annex A 8.15 Logging(第三者) | https://www.isms.online/iso-27001/annex-a-2022/8-15-logging-2022/ | 二次(検索結果) |
| S35 | Git: git-commit | https://git-scm.com/docs/git-commit | 要約経由 |
| S36 | GitHub Docs: Displaying verification statuses for all of your commits | https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits | 要約経由 |

## 未確認として残したこと

- 個人所有リポジトリで、ルールセットの bypass に GitHub App(Integration)・GitHub Actions(GITHUB_TOKEN)を入れて `update` 規則を通せるか(実機検証が要る。使い捨てのリポジトリで試す)
- ルールセットが個人所有 public(Free)/ private(Pro)で使える範囲の公式の記述(about-rulesets の要約からは Free・Pro の記述が取れなかった)
- Rule Insights・activity view の保存期間
- Rekor v2 の状況、公開 Rekor のエントリの削除可否
- ISO 9001:2015 7.5.3、ISO/IEC 27001:2022 附属書A 5.33・8.15 の本文
- FDA の 2024 年以降の電子記録関連ガイダンス(臨床試験の Q&A 等)
