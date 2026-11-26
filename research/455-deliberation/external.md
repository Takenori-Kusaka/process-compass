# Issue #455 外部調査(2026-11-27、束 D1)

- 位置づけ: コアポリシーの調査段(外部)。条項は変えていない。含意は問いの形でのみ書く
- 確認日は全て 2026-11-27。一次=規格・法令・レジストリ運営者・論文の原文、二次=解説・ベンダー記事・報道
- 読みの水準: WebFetch(要約モデル経由)か WebSearch の要約。規格の逐語の照合はしていない箇所を明記した
- 既存台帳(research/282-survey-2026-09)から拾えたのは供給網では FND-0100(SLSA v1.2 は来歴と完全性が範囲、コード品質は範囲外。GitHub は attestation を「安全の保証ではなく、検証されなければ利益がない」とする。SRC-0415・0417)と、process-log の「正規の Sigstore provenance 付きで配布されたワーム」(CSA)の反証だけ。slopsquatting・Scorecard の依存系・npm/PyPI の普及率は台帳に無く、今回の調べが初出

## 1. 結論(先に)

1. **「実在」は決定可能。ただし判定の対象を絞る必要がある**。「レジストリに名前が無い(HTTP 404)」は、時点・レジストリ・名前空間を固定すれば偽陽性が実効的に無い。偽陽性の源は「社内レジストリ・git/URL 依存・workspace 内の別パッケージ」であり、検査の対象を「公開レジストリから解決される宣言済み依存」へ限れば閉じる
2. **「実在する」ことは安全を意味しない**。slopsquatting の本体は「幻覚された名前を攻撃者が先に登録する」ことなので、実在検査を通った時点で守れない。実在検査が守るのは「まだ誰も登録していない名前(=将来の攻撃面)」と「ビルドが落ちない代わりに別物を引く事故」だけ。**来歴検査が要る理由はここにある**
3. **来歴(provenance・署名)の普及は不完全で、必須にすると偽陽性が大きい**。PyPI は直近1年のアップロードの 17% が attestation 付き、npm の上位パッケージでも半数前後が trusted publishing 未使用(小標本)。「証明が無い」は決定可能だが「危険」の意味ではない
4. **業界の分担は「機械=存在・年齢・既知の脆弱性・署名の有無の検証」「人=新規依存の採否と、証明が無い・若い依存の例外の許可」**。年齢(cooldown)は機械の閾値として普及したが、閾値の根拠は「悪意ある版が検出・削除されるまでの時間(分〜時間が多数、xz は約5週間)」という観測であり、規格の値ではない
5. **規格・法令は「結果を求めて手段を指定しない」型**(SSDF PW.4.4、CRA 前文 34、ISO 27001 5.21)。条文へ書くなら結果と証跡まで。具体の閾値と道具は手引きへ、という所有者の方針(2026-11-16)と整合する

## 2. 論点 (a) 実在・来歴は決定可能な条件に落ちるか

### 2.1 Spracklen ほか(USENIX Security 2025)— 数値の正確な意味

- 一次: <https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen>、arXiv 2406.10279v3 <https://arxiv.org/abs/2406.10279v3>(確認 2026-11-27、本文 HTML を読んだ)。Distinguished Paper Award
- 設計: 16 の LLM、Python と JavaScript、約 57.6 万の生成コード。**照合は 2024-01-10 時点の PyPI・npm の全名簿**(名簿に無い名前=幻覚)。名簿が既に悪意ある名前を含みうるため、率は下限と著者が明記
- **19.7% の意味**: 推奨された全パッケージ参照 約 223 万のうち 440,445 件が幻覚、という**参照単位の比**(全モデル・全言語の合算)。ユニークな名前では 205,474 件。**論文要旨の数は 19.7% ではなく、商用モデル平均 5.2% 以上、オープンソースモデル平均 21.7%**。19.7% は本文と報道(The Register 等)に出る合算値。取得できた要旨には 19.7% が出ない(WebFetch の要約では当該語は未確認。本文 HTML 側で分母を確認)。Issue 本文が「19.7%」と書くなら、**モデル・言語で 5%台〜20%台に散ること**と**2024 年初の古い世代のモデル**であることを併記すべき
- 言語差: Python 15.8%、JavaScript 21.3%(平均)
- **反復性**: 同じ質問を 10 回繰り返して 43% の幻覚名が毎回現れ、39% は再現しない(58% が2回以上)。つまり攻撃者が予測して先取りできる名前が一定量ある。一方で6割近くは1回限りに近い
- 削除済みパッケージ由来は無視できる(PyPI の過去削除 12,871 件のうち幻覚に出たのは 133 件=0.17%)
- 緩和: 論文は複数の緩和策で幻覚が有意に減ると報告(要旨)。具体の削減率は未取得
- 限定: 2024 年初のモデルでの測定。2026-11 のエージェント(レジストリを検索するツールを持つ)での率は本調査で一次の数値を得られていない。**「いまの率は不明」と書くのが正確**

### 2.2 実例と対策の報告(二次中心)

| 事例 | 内容 | 水準 |
|---|---|---|
| huggingface-cli(2024 初) | Lasso Security の Lanyado が、モデルが繰り返し推奨する実在しない Python 名を発見し、自ら登録して到達数を測った。実害ではなく実証 | 二次(報道・ベンダー) |
| react-codeshift(npm) | Aikido の Eriksen が、jscodeshift と react-codemod の混成で幻覚された名前を観測。**先に研究者が登録した**ため攻撃にならなかった。AI 生成のスキル定義ファイル経由で 237 リポジトリへ広がったとの報告 | 二次(ベンダーのブログ) |
| unused-imports(npm) | 正規は eslint-plugin-unused-imports。Aikido は意図的な slopsquatting の可能性がある悪意ある実在のパッケージとする。npm は security hold 済み、2026-02 時点で週 233 ダウンロード | 二次(ベンダー) |
| CSA の調査ノート | 「実際に悪用された悪意あるパッケージが数万のダウンロードを集めた」との記述。個別のパッケージと結び付く根拠を確認できず | 二次、**未検証として扱う** |

- URL: <https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/>、<https://aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks>、<https://www.theregister.com/2025/04/12/ai_code_suggestions_sabotage_supply_chain/>(確認 2026-11-27、検索要約)
- 読み取り: **実世界の悪用の確定例は薄い**。論文の測定(一次)とベンダーの観測(二次)で、脅威の現実性は「実証済みだが、被害規模の一次記録は無い」。標準が書くなら E1〜E2 相当の根拠水準マーク(ADR-0026)が要る。「起きていない」とも「大規模に起きている」とも言えない
- 乗っ取り(アカウント・メンテナの侵害)は別の系統で、実例が厚い。dev.to 等の2026 春の解説は複数のインシデントを列挙するが二次。台帳側の process-log は「正規の Sigstore provenance 付きで配布されたワーム」(CSA)を記録済み。**provenance は乗っ取りを防がない**(CI が侵害されれば正規の証明が付く)

### 2.3 決定可能な条件の仕分け

| 条件 | 決定可能か | 偽陽性が実効的に無い条件 | 残る限界 |
|---|---|---|---|
| 宣言した依存の名前が公開レジストリに存在しない(404) | はい。値の存在検査 | 照合先のレジストリと名前空間を固定。社内レジストリ・scope・git/URL 依存・workspace 内部は対象外と明記 | 先に登録された悪意ある名前を通す。レジストリの一時障害は「未判定」とし通過にしない |
| 名前が既知の悪意ある版・security hold に該当(OSV の MAL- 系、npm の security holding) | はい。照会 | 照会先のデータベースの版を固定 | 未報告の悪意は拾えない |
| 公開からの日数が N 日未満(cooldown) | はい。タイムスタンプの比較 | 公開日時が取れる(レジストリ公開)依存のみ。git/URL は公開日時が無く対象外 | **N の根拠は規格に無い**。後述 |
| 初回公開から N 日未満の**パッケージ**(版でなく名前の年齢)| はい | 同上 | 新規の正規パッケージが全て引っ掛かる(偽陽性が多い)。slopsquatting は「新しい名前」が特徴なので情報量はあるが、閾値の根拠は未確認 |
| ダウンロード数が閾値未満 | はい(値の比較) | レジストリの統計の定義が揃うときのみ | 水増し可能。小さい正規パッケージを大量に誤検出。**採らないほうがよい条件**(根拠となる閾値の先例を確認できず) |
| 公開者(アカウント・組織)が前の版と異なる、メンテナの変更 | はい(差分) | レジストリが公開者の履歴を返すとき | 正規の交代も拾う。人の確認へ回す型 |
| provenance・署名の有無 | はい。`npm audit signatures`、PyPI attestations の照会 | 「有るなら検証が通る」を判定し、「無い」は未判定扱い | 「無い」が多数派。必須化は偽陽性が大きい(§3) |
| 署名者が期待したソースリポジトリ・ワークフローと一致 | はい(値の一致)。ただし期待値の登録が前提 | 期待値を採用者が宣言した依存のみ | 期待値の維持の運用が要る。provenance は「何処でビルドしたか」しか言わない |
| 「この依存は信頼できる・適切だ」 | **いいえ**。意味の判定 | — | G-6 の人の確認事項へ |

- **閾値 N の根拠(重要)**: cooldown の既定値は道具ごとに違う。npm `min-release-age`(npm 11.10 以降、単位は日、既定なし)、pnpm `minimumReleaseAge`(単位は分、pnpm 11 以降の既定 1440=1 日)、Yarn の `npmMinimalAgeGate`(既定 1 日)、Cargo・Bundler は既定 0。Dependabot は `cooldown`(例 default-days: 7、セキュリティ更新は免除)。単位が日・分・秒と揃っていない。出典: <https://socket.dev/glossary/dependency-cooldown>、<https://socket.dev/blog/npm-introduces-minimumreleaseage-and-bulk-oidc-configuration>(二次、確認 2026-11-27)
- 根拠の実体は観測: Woodruff が 10 件の供給網攻撃を調べ、8 件は悪意ある版が 1 週間未満で見つかった。axios 関連は 3 時間 26 分、Rust クレートは 86〜107 分、TanStack は 84 成果物を 6 分以内にベンダーが検出。**xz-utils は約 5 週間**で、どの実用的な cooldown も超える(二次、上記の同じ記事)。→ 「N=7」は経験的に多くを止めるが、**規格の根拠は無く、検出する主体が居る前提(「時計であって検出器ではない」)**。標準が数値を固定するなら根拠水準マークが要る。採用者の宣言値と、満たさない場合の例外承認で受ける型のほうが、閾値の先例と整合する
- cooldown の副作用: 緊急の修正が遅れる(免除の記録が要る)、lockfile に既にある版は窓を通らない、bot が再生成した lockfile で CI が落ちる(pnpm 11 と Dependabot の既知の不具合)、フォールバック方針だと古い版の yank を悪用できる。**偽陽性は「対象の絞り方」と「免除の記録」で管理する問題**

### 2.4 SLSA・Sigstore・Scorecard の位置づけ

- **SLSA v1.2**(一次、<https://slsa.dev/spec/v1.2/build-track-basics>、<https://slsa.dev/spec/v1.2/source-requirements>、確認 2026-11-27、検索要約): Build L1=ビルドの来歴が存在(誤りと文書化)、L2=ホスト型のビルド基盤が生成した署名付き来歴(ビルド後の改ざん)、L3=強化されたビルド(ビルド中の改ざん)。Source track は L1=VCS と版の識別、L2=履歴の保存と Source Provenance、L3=技術統制の継続的な強制。**SLSA は成果物の生産者の側の要求であり、消費者が依存を採用するときの検査項目ではない**。消費者側は「来歴を検証する」まで。SLSA の来歴は slopsquatting(実在しない名前)を扱わない。FND-0100 のとおり、コード品質・安全は範囲外
- **npm provenance**(一次、<https://docs.npmjs.com/generating-provenance-statements>、確認 2026-11-27): GitHub Actions か GitLab CI のクラウドホスト型ランナーから `npm publish --provenance`(npm CLI 9.5.0 以上)。trusted publishing では自動で生成され長期トークンが不要。`npm audit signatures` はレジストリ署名と provenance の attestation を検証する。**公式が「悪意あるコードが無いことを意味しない。ソースとビルド手順へ結び付けるもの」と明記**
- **PyPI**(一次、<https://blog.pypi.org/posts/2025-12-31-pypi-2025-in-review>): Trusted Publishing は 5 万超のプロジェクト、直近1年のアップロードの 20% 超。attestation は直近1年のアップロードの 17%。trusted publishing + 正規の GitHub Action では attestation が既定で付く
- **OpenSSF Scorecard**(一次、<https://github.com/ossf/scorecard/blob/main/docs/checks.md>、確認 2026-11-27): 20 のチェック。依存・来歴に関わるのは Pinned-Dependencies、Signed-Releases(署名 8 点、SLSA provenance もあれば 10 点。**署名の検証はしない**)、Packaging、Maintained(90 日未満のプロジェクトは評価不能)、Vulnerabilities(OSV)、Dependency-Update-Tool(有効かだけ)、SBOM、Binary-Artifacts。Code-Review は変更が bot のみなら「結論なし」を返す。→ **Scorecard は 0〜10 の連続値で、合否の閾値は採用者が決める**。Scorecard の点を hard-fail にする先例は本調査では確認していない。台帳 FND-0193 も同旨(結論なしの先例はあるが、閾値未満を未判定と記録する単一の先例は無い)

## 3. 論点 (b) 普及率と必須化の偽陽性

| 項目 | 数値 | 出典・水準 |
|---|---|---|
| PyPI trusted publishing | 5 万超のプロジェクト。直近1年のアップロードの 20% 超 | 一次(PyPI 公式ブログ 2025-12-31) |
| PyPI attestation | 直近1年のアップロードの 17%。GA 時の上位 360 プロジェクトでは約 5%(2024-11 時点) | 一次(PyPI)、Sigstore ブログ(GA、時点は 2024-11〜2025) |
| npm trusted publishing の週次の導入 | 2025-07 の GA 前は週 20〜50 パッケージ、GA 後は週約 430(Shai-Hulud の後) | 二次(Aikido、ベンダー) |
| npm 上位パッケージ | 上位 27 のうち 13 が trusted publishing。上位 50 のうち attestation 付きは「ほぼ無い」 | 二次(個人・小ベンダーの標本調査)。標本小、方法が違う |
| npm 全体の provenance 率 | **一次の全体統計を確認できなかった** | 未確認。「不明」と書く |

- **必須化の偽陽性**: provenance が付かない理由の大半は悪意ではなく、(1) 対応するクラウド CI を使っていない(npm provenance はクラウドホスト型のランナーのみ)、(2) 古い版・メンテナンスが止まった依存、(3) trusted publishing 未設定。全依存へ「provenance 必須」を課すと、実害の無い依存の大多数が不合格になる。**現実的な型は「付いているなら検証する(`npm audit signatures` を通す)」「以前は付いていたのに今回の版で消えた(退行)」「採用者が宣言した重要な依存だけ必須」**。退行の検出は決定可能で偽陽性が小さい(Scorecard・SLSA のいずれの規定でもなく、ツール側の議論として確認した程度。先例は未確認)
- **検証が通ることの意味は限定的**: 正規の provenance 付きで悪意ある版が配られた事例(CSA が報告、台帳 process-log)。provenance は CI の侵害・メンテナの意図的な悪意を防がない

## 4. 論点 (c) 人と機械の分担(規格・法令・業界)

| 出典 | 求めていること | 機械/人の分担の読み | 水準 |
|---|---|---|---|
| NIST SP 800-218r1 ipd(SSDF v1.2、2025-12 草案、パブコメ 2026-01-30 まで。ローカルで PDF を抽出して確認) | PW.4.1 第三者の安全な部品を取得・維持。**PW.4.4: 取得した第三者部品が組織の定める要求を満たすことを生涯にわたり検証**。例: 既知の脆弱性の定期確認、ツールチェーンへの自動検出、部品が保守されており EOL でないことの確認。PW.4.2 の例 3: 部品ごとに SBOM 等の来歴情報を得て分析、例 8: **整合性・来歴を確認できないバイナリは、ソースの整合性・来歴を確認したうえでソースからビルド**。PS.3.2: 配布物の来歴データを収集・保護 | 要求は「組織が定める要求への適合の検証」で、**手段は例示**(notional)。人の承認は規定せず、承認リスト(例 5)と自動検出(PW.4 例 2)を並置 | 一次。**草案**(最終ではない) |
| EO 14028 → EO 14306(2025-06)→ OMB M-26-05(2026-01-23) | 連邦の請負業者へ自己証明書の提出を課した枠組みを撤回。SBOM は機関の裁量。SP 800-218 は代替として使える | 米国の義務は後退し、**自己証明の様式は廃された**。採用者の義務の根拠として EO 14028 を引くのは不可 | 二次(法律事務所 Crowell・DWT)。官報原文は未読 |
| EU CRA(規則 2024/2847) | 前文 34: 第三者部品は**相当な注意(due diligence)**を払う(CE マーク・定期的なセキュリティ更新・脆弱性データベースの照合の例)。前文 77: 脆弱な第三者部品を含まない、SBOM で文書化(公開義務は無い)。第 25 条: 13(5) の due diligence を補う自主的な保証制度を欧州委員会が設けうる。**報告義務(第 14 条)は 2026-09-11 から、他の大半は 2027-12-11 から** | 「相当な注意」は結果型で、**手段・閾値の規定なし**。人と機械の分担は規定しない | 前文・第 25 条は一次(EUR-Lex)。**第 13(5) 条と附属書 I 第 II 部(1) の本文は未読**(WebFetch が範囲外)。期日は二次(法律事務所・CSA) |
| ISO/IEC 27001:2022 附属書 A 5.19〜5.23、8.30 | 5.19 供給者関係、5.21 ICT サプライチェーン、5.22 供給者のサービスの監視・レビュー・変更管理、8.30 外部委託開発(外部開発を監視・検証) | 管理策は要求の型(「定め・実施・監視」)。**部品の実在や署名の検査は規定しない**。ISO 27036 を参照 | **規格本文は有償で未読**。二次(isms.online 等の要約)のみ。管理策名と旧版の対応のみ確認 |
| ISO/IEC 5230(OpenChain、ライセンス)・ISO/IEC 18974:2023(OpenChain Security Assurance) | 18974: オープンソースの既知の脆弱性(CVE・依存の警告)を確認するプログラム。SBOM(4.3.1)・セキュリティ保証(4.3.2)・遵守の完全性(4.4.1)。ISO/IEC 5230:2020 の素材から構築 | **プログラムの存在と手順の文書化を求める**型。個々の依存の来歴検査の閾値は無い | 目次・要約のみ(二次)。**本文の要求事項は未読** |
| SLSA・Sigstore | 生産者側の来歴。消費者は検証する | 検証は機械、期待値の宣言は人 | 一次 |

- **業界の実務(二次)**: 検査の分担は大きく3層。(1) **機械で止める**: 既知の悪意(OSV・Socket 等の検出)、署名・attestation の検証失敗、cooldown 未満、lockfile のハッシュ不一致。(2) **機械が一覧に出し人が決める**: 新規依存の追加(名前・公開者・年齢・provenance の有無を PR に添える)、公開者の変更、provenance の退行。(3) **人が決める**: 採用の適否・ライセンス・保守の見込み・例外(cooldown の免除、provenance の無い依存の許可)。ツール(Dependabot・Socket・deps.dev・Snyk)は(1)と(2)を提供し、(3)を代行する製品は確認できなかった。**この3層は本調査者(エージェント)の整理で、単一の規格が定義した分類ではない**(未確認)
- **一次に当たれなかった点**: Socket・deps.dev・OSV が「何を決定可能な条件として hard-fail にするか」の一次文書。Socket は悪意ある挙動の検出(静的・動的)を売りにしており、新規・低ダウンロードを単独の判定にするとは確認できなかった。deps.dev・OSV は照会(データ)であって、合否の判定は利用者側

## 5. 議論の材料(問いの形)

1. G-5 基準 8 を「宣言した依存が公開レジストリに実在し、既知の悪意の一覧(OSV MAL-、security hold)に無い」まで拡張するのは、実効的な偽陽性が無く、是正の起動の3条件を満たすか。対象の絞り方(公開レジストリの宣言依存)を条文へ書くか手引きへ置くか
2. 「若い・公開者が変わった・provenance が退行した」は決定可能だが、正規の変更も拾う。一覧に出して G-6 基準 5 の確認事項にする型(止めない)で十分か
3. cooldown を標準が数値で定めるか(根拠は観測で規格に無い)。採用者の宣言値と免除の記録だけを求める型にして、数値の目安は根拠水準マーク付きの手引きへ置くか
4. 実在検査は「先に登録された悪意ある名前」を通す。標準は「実在検査で通った」ことを安全の保証と誤読させない記述(限定)を要するか。**限定を規範と別の段落へ置かない**(#226)
5. 破られたとき誰が何を失うか(所有者の方針 3): 利用者の端末・認証情報・データ。provenance・実在検査のどちらも、CI の侵害・メンテナの意図的な悪意は防がない。残余リスクを開示する
6. 規格の語彙との突合: SSDF PW.4.4 の「組織が定める要求への適合の検証」、CRA の due diligence は、採用者が自ら定めた基準の検証証跡を求める型。本標準が基準を固定するか、採用者の宣言へ委ねるか

## 6. 採らない・扱わない(明記)

- ダウンロード数の閾値を決定可能な条件として使う案は、根拠となる先例を確認できず、水増しと小規模の正規パッケージの誤検出がある。**採る根拠が無い**
- provenance を全依存へ必須にする案は、普及率(PyPI 17%・npm は一次の全体統計なし)から偽陽性が大きい
- EO 14028 を採用者の義務の根拠として引くことはしない(2025-06〜2026-01 で自己証明の枠組みが撤回)
- 19.7% を「LLM が推奨するパッケージの 2 割は幻覚」と単純化して書かない(§2.1)

## 7. 未確認・限界

- ISO/IEC 27001・27002・5230・18974 の本文(有償)。規格のプレビュー・要約のみ。条項の規範の引用が要る場合は公開プレビューを指定ページで読む必要がある
- CRA 第 13(5) 条と附属書 I の本文
- npm 全体の provenance 率、2026-11 のエージェント環境での幻覚率の一次の数値
- Socket・deps.dev・OSV の判定条件の一次文書
- 本調査の WebFetch・WebSearch は要約モデル経由で、逐語の照合はしていない(台帳の readLevel は section か secondary 相当)

## SRC 候補(research/sources/ の書式。台帳には書いていない。番号は仮)

```yaml
# SRC-TBD-1
status: included
url: https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen
canonicalUrl: arxiv:2406.10279
ids: {arxiv: "2406.10279"}
orgType: academic
sourceType: paper-peer
published: 2025-08   # USENIX Security 2025。arXiv v1 は 2024-06
accessed: 2026-11-27
access: open
readLevel: full       # arXiv v3 の HTML 本文
themes: [TH10]
claims:
  - 参照単位の幻覚率 19.7%(440,445 / 約 223 万)、ユニーク名 205,474。要旨は商用 5.2% 以上・OSS 21.7%
  - 43% の幻覚名が 10 回の反復で毎回出現(反復性)
  volatility: fast
  reviewBy: 2027-03
# SRC-TBD-2
url: https://blog.pypi.org/posts/2025-12-31-pypi-2025-in-review
orgType: nonprofit
sourceType: vendor-official   # レジストリ運営者の一次
published: 2025-12-31
accessed: 2026-11-27
readLevel: section
claims: [trusted publishing 5 万超・アップロードの 20% 超、attestation 17%、マルウェア報告の 92% を 24 時間以内に処理]
selfReported: true
# SRC-TBD-3
url: https://docs.npmjs.com/generating-provenance-statements
orgType: vendor
sourceType: vendor-official
accessed: 2026-11-27
readLevel: section
claims: [npm provenance の要件(クラウド CI、CLI 9.5.0 以上)。悪意あるコードの不在を意味しないと明記]
# SRC-TBD-4
url: https://github.com/ossf/scorecard/blob/main/docs/checks.md
orgType: nonprofit
sourceType: repo
accessed: 2026-11-27
readLevel: section
claims: [20 のチェック。Signed-Releases は署名を検証せず存在のみ。Maintained は 90 日未満を評価しない]
# SRC-TBD-5
url: https://csrc.nist.gov/pubs/sp/800/218/r1/ipd
orgType: government
sourceType: standard   # 草案
published: 2025-12-17
accessed: 2026-11-27
readLevel: section    # PDF を pdftotext で抽出し PW.4・PS.3 の該当箇所を読んだ
claims: [PW.4.4 は組織の定める要求への適合の検証。PW.4.2 例 8 は来歴を確認できない成果物をソースからビルド]
# SRC-TBD-6
url: https://socket.dev/glossary/dependency-cooldown
orgType: vendor
sourceType: vendor-official
accessed: 2026-11-27
readLevel: section
selfReported: true
claims: [cooldown の既定値は npm なし・pnpm 11 は 1 日・Cargo は 0。悪意ある版の生存時間は分〜時間、xz-utils は約 5 週間]
# SRC-TBD-7
url: https://slsa.dev/spec/v1.2/build-track-basics
orgType: standards-body
sourceType: standard
accessed: 2026-11-27
readLevel: snippet    # 検索要約のみ。知見の根拠にするなら本文を読み直す
# SRC-TBD-8
url: https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/
orgType: nonprofit
sourceType: industry-report
published: 2026-04-19
accessed: 2026-11-27
readLevel: snippet    # 数万ダウンロードの記述は未検証
# SRC-TBD-9
url: https://www.crowell.com/en/insights/client-alerts/software-de-simplified-trump-administration-rescinds-standardized-secure-software-development-attestation-requirements
orgType: consultancy
sourceType: news
accessed: 2026-11-27
readLevel: snippet    # EO 14306・OMB M-26-05 の二次。官報原文で確認が要る
```
