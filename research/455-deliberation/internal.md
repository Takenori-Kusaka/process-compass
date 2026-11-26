# #455 内部調査(標準・準拠テンプレートの現状)

調査日: 2026-11-27。書き換えなし。「事実」はファイル:行で確認したもの、「推測」は確認していないもの。

## 1. 条文の所在と文言(事実)

ファイルは `src/content/docs/phase4-process-design/gate-criteria.md`(以下 GC)。

- G-5 の表: GC:742 付近の見出し「G-5 自動検証 CI」、表 GC:748〜757
  - 基準2(GC:751): 「静的解析・脆弱性スキャンの重大指摘 | Critical / High = 0 件(Medium 以下は台帳記録で通過可)」。既知の脆弱性の検査であり、実在・来歴は見ない
  - 基準5(GC:754): 「依存関係のライセンス検査 | 禁止ライセンスの検出 0 件。ライセンスを判定できない依存 0 件(台帳へ記録すれば通過可)」
  - 基準8(GC:757): 「依存関係の追加・更新の識別 | 追加・更新がある場合、その一覧が PR の記述に機械的に出力されている」
- 節「依存関係の追加(基準8)」GC:1259〜1270
  - GC:1261 「依存の追加は、差分の行数に対して影響が非対称です。1行の追加で、外部の任意のコードが実行対象へ入ります。逐行の読解では捕捉されにくく、規模を基準にした審査深度の調整とも整合しません」
  - GC:1263 「基準8が求めるのは、追加・更新の一覧を機械的に出力させることだけです。ライセンスの適合そのものは基準5で機械判定します。人間が確認するのは「その依存を追加する必要があるか」であり、ライセンスの読解ではありません。この確認は G-6 の判定に含めます」
  - GC:1265 IMPL-0550(delivered, check=manual)。合否は判定しない。「AI が追加した依存と人が追加した依存を区別しない」(GC:1267 付近)
  - GC:1267 IMPL-0551(gate-skill-g6)。G-6 の材料の集め方の項3
- G-6 の表 GC:1286〜、基準5(GC:1295): 「(依存の追加・更新を含む場合)追加の必要性を確認した | G-5 基準8の出力に対する確認の記載」
- G-7 基準8(GC:1555): 「知財潔白性の検査記録 | 依存関係のライセンス検査の結果、類似の検知の実施記録と結果、判定できなかった項目の台帳記録。欠落 0 件」
- 許可リストの救済 GC:1272〜1285(IMPL-0731、IMPL-0683)。ライセンス以外の依存の救済手続は無い(推測: ライセンス専用)

つまり、依存の実在・来歴・公開日・署名を見る基準は標準に存在しない(事実。下記3の grep でも該当条項なし)。Issue の「標準の現状」の記述は正しい。

## 2. 是正の起動と3条件(事実)

- 「是正の起動」の節: GC:911〜。起点は Sev1/2 の出荷後欠陥・欠陥注入の見逃し・統制の弱化の検知(GC:917〜919)
- 3条件の本文: GC:935〜939(「再発防止を、機械の検査で失敗させる形にするのは、次の3つをすべて満たす場合に限ります」。偽陽性が無い・開発者が修正できる・既存の違反を解消してある)
- G-5 の原則の文: GC:768 「合意済みのルールのうち、後掲「是正の起動」の3つの条件を満たすものを機械化して載せる」
- ADR-0073(`src/content/docs/adr/0073-corrective-action-by-impact-and-control-effectiveness.md`)決定2(同:34)、同:49。IMPL-0545(`implementation-ledger.md:710`)
- 先例の適用: ADR-0025(参照切れは落とす・乖離は落とさない。同:27・40)、ADR-0166(検査器の依存取得失敗は採用者に委ねた。同:26)

注意(事実): 3条件の本文は「再発防止を機械の検査で失敗させる形」の条件で、**新しい検査を足す義務の条件ではない**。起点も事後の影響(欠陥・見逃し)。#455 は事前の統制の新設なので、3条件はそのまま起動条件ではなく、「失敗させる形にしてよいか」の判定基準として使う形になる(推測)。

## 3. 依存・供給網に触れる既存の条項・ADR・マーク

### 最重要: ADR-0044 決定5 との突合(事実)

`src/content/docs/adr/0044-no-search-obligation-for-existing-parts.md`

- 同:37 slopsquatting(USENIX Security 2025、16モデル・576,000超、19.7% が実在せず、架空名の 43% が10回で再現)を既に引いている
- 同:63〜65 決定5 「slopsquatting への対処は、実装層の既存の検査へ降ろす。存在しないパッケージの参照は、依存関係の解決で失敗します。G-5 の既存の検査で捕まります。新しい条文を置きません」
- **#455 の指摘はこの決定5 の前提を直接突く**: 実在しない名前を攻撃者が先に登録した型では、解決は成功する。ADR-0044 は「実在しない名前」だけを見て「登録済みの悪性の名前」を見ていない(事実: 決定5 の文は未登録の場合だけを述べる)。矛盾でなく範囲の欠けとして扱える(推測)。決定5 を置き換えるなら新 ADR(採用済み ADR は書き換えない。CLAUDE.md)
- 同:32 xz-utils を「レビュー・SBOM・ライセンス監査のいずれでも止まらず」と記し、SBOM が万能でないことは ADR 側で既出
- EV-0029(`evidence-ledger.md:260`、見直し 2027-08): 決定1(探す義務なし)の根拠で、決定5 は EV の対象外(事実)
- #237 は ADR-0044 で閉じている。「作る前」の話で #455 とは別、という Issue の記述は妥当。ただし ADR-0044 決定5 が #455 の論点を既に判断していた点を Issue は言及していない

### その他

- ADR-0166(`adr/0166-adopter-decides-...md:26`): npm audit・license-checker・pip-audit の入力欠落時の挙動は道具の実装で、準拠テンプレートは保証しない。IMPL-0234(undelivered、plan=adopter、`implementation-ledger.md:97`)。「空の install とロックファイルだけで license-checker が空の一覧で通りうる」(依存が検査されないまま通る筋の開示)
- ADR-0151 / IMPL-0992・0995: 任意の検査(静的解析・依存監査・ライセンス・依存の導入)のコマンドが空なら未実施として通し、保証の開示 項目4 に出す
- ADR-0121(`adr/0121-all-product-stacks-in-g5.md:29・94`): Scorecard・SLSA は言語の網羅を見ないため依拠しないと判断済み(事実。採用者の検査の網羅は自前)
- ADR-0085(同:53): SLSA Source v1.2(SRC-0416)を「開始のリビジョンより前に主張しない」型の先例として引用
- ADR-0090(同:18・43・134〜137): 配布物の来歴の証明(artifact attestation)は配布の経路の話。依存の来歴ではない
- ADR-0157(同:32): 受け手側の来歴確認は手引き(guidance)。「条文は結果まで・手順は手引き」の先例に近い
- ADR-0047 / ADR-0058 / GC:2227: ロックファイルを行数算定から除外(依存の追加の大半がロックファイルの差分に載ることの示唆。推測)
- `deliverable-templates.md:1092`: 案件概要の指標「サプライチェーン耐性 | 重要な依存のうち健全性を確認した割合、単一保守者に依存する件数」(事実。測る指標としては既にあるが、ゲートの基準ではない)
- `deliverable-templates.md:2014`: エージェントの供給網の汚染(ASI04)の行
- `phase6-operation/incident-drill.md:44`: 訓練区分 B「脆弱性・供給網」
- `phase5-implementation/ci-gates.md:47`: `npm audit --audit-level=high` の例。`compute-strategy.md:116`: ロックファイルでの固定
- SBOM・provenance・slopsquatting・typosquatting を条文として持つ箇所は、ADR-0044 と上記以外に無い(grep: `slopsquat|typosquat|SBOM|sigstore` は ADR-0044 のみ。`provenance` は ADR 側の配布物の話)
- IMPL-0200(`human-ai-boundary.md:1336`、5.8.6 要求事項3、undelivered、plan=scheduled issue=452 review=2027-02)。5.8.6 は要求事項1〜3(実行時の拒否・書き込みとネットワークの既定拒否・秘匿情報)(`human-ai-boundary.md:1285〜`、1306 に「許可していない外部への通信」)。ADR-0086:173・ADR-0126:97・ADR-0222 が降りていないことを開示済み。**ネットワークの既定拒否が降りていないので、レジストリ以外の宛先へ出す経路を実行時に塞げない**(Issue の「undelivered」の指摘は事実)。ただしテンプレートの `.claude/settings.json` の `sandbox.network.allowedDomains` は存在し(`template/README.md:394〜397`)、宛先の追加は強制層の変更として承認される(事実)。レジストリ宛先は許可リストに入るので、実在確認の通信は通る(推測)
- EV マーク: 依存・供給網を対象にした EV は EV-0029 と EV-0293(未実施の表示)のみ(grep)。

## 4. テンプレート側の実装(事実)

- `template/.github/workflows/gate-g5.yml`
  - `audit` ジョブ: `adapter.mjs run audit`(:327)
  - `ip-clearance` ジョブ: `adapter.mjs run licenses`(:377)、`license-scan-record.mjs`(:200 付近に python の許可名の補正)
  - `dependency-diff` ジョブ(:498〜519): `if: github.event_name == 'pull_request'`。`node scripts/gate/dependency-diff.mjs --base origin/<base>`、`evidence/dependency-diff.json` をアップロード
- `template/scripts/gate/dependency-diff.mjs`(81行): マニフェストの差分行を `git diff --unified=0` で抜き出すだけ。**名前・版の解析も、レジストリの照会も、ネットワーク呼び出しもしない**。合否なし。出力は PR の記述ではなくジョブサマリ(`GITHUB_STEP_SUMMARY`)と `evidence/dependency-diff.md` と(推測を含む: 標準の「PR の記述に出力」は、実装ではジョブサマリである)
- `template/scripts/gate/config.mjs:2383〜` `DEPENDENCY_MANIFESTS`(package.json・各ロックファイル・requirements.txt・pyproject.toml・poetry.lock・uv.lock ほか)
- アダプタ `template/adapters/{node,python,python-poetry,python-uv,go,none,undetermined}.json`: node は `npm audit`(:11)・`license-checker-rseidelsohn`(:12)。python 系は `pip-audit`。install の段は `setup-stack`
- `template/scripts/gate/license-allowlist.mjs`・`license-scan-record.mjs`・`ip-clearance-python.mjs`: 許可リストと実施記録
- 集約: `aggregate-evidence.mjs:1489`(dependency-diff.json を読む)・`:4627`(`dependencyDiff: 実施 / 記録なし`)・`:6780`(保証の開示 項目4 の行)。実在・来歴の項目は無い
- G-6 側: `template/.claude/skills/gate/gates/G-6.md:13`(dependency-diff の一覧を見て必要性を確かめる)。`template/.github/PULL_REQUEST_TEMPLATE.md` に依存の欄は無い(grep の範囲では「設定・ツールのみの PR は Spec: setup」の記述のみ)
- 試験: `test-adapter.mjs`・`test-license-scan.mjs`。dependency-diff の専用試験は未確認(推測: ファイル名に test-dependency が無い)

### 追加の検査を足すなら(推測。実装は審議の後)

- 実在・公開日・署名の照会は、`dependency-diff.mjs` の拡張(名前の解析とレジストリの照会を足す)か、新しいジョブ・スクリプトのどちらか。前者は「合否を判定しない」IMPL-0550 の性格(一覧)を変える。IMPL-0550 のマークの note の更新が要る
- 新しい合否の検査にするなら、`gate-g5.yml` へジョブ追加、`g5-aggregate.mjs`・`aggregate-evidence.mjs`(保証の開示 項目4)、アダプタ(スタック別: node/python/go で照会の道具が違う。ADR-0121 の全スタック網羅の原則)、`test-*.mjs`、`check-ci-wiring`(標準側)の結線が連動する
- ネットワーク照会は、gate の CI に新しい外部依存(レジストリ API の可用性)を持ち込む。レジストリ不達の扱い(失敗・未実施)は ADR-0151 の型が先例

## 5. 第7章で受けられるか(第7章 = `exception-escalation.md`)

- 7.3 の要求事項(`exception-escalation.md:26〜34`): 5項目(記名の承認・満たさない基準と理由・影響と対処・回収の期限と責任者・継続報告)。対象は「ゲートの判定基準を満たさないまま次工程へ進める場合」。ただし同 7.3 後段(:60 付近)で、対象は「ゲートの判定基準と、本標準の条項が本節を名指して定めた事項に限る」(事実)
- 帰結(推測): 新しい基準を作らず例外承認だけで受ける案は成り立たない。例外承認は「既存の基準を満たさない」ときの受け皿で、基準が無いものは満たさないことにならない。受けるなら基準(G-5 基準8 の拡張か G-6 基準5 の観点)を先に置く必要がある
- 許可リスト救済(GC:1272〜1285)の型が「基準に合わない依存の例外」の最も近い先例(ライセンス用。期限付き暫定許可・法務の所管。ADR-0222 が構成の欄で受ける形に整理)

## 6. 書式の正本

- 根拠水準マーク(ADR-0026): `src/content/docs/community/evidence-marking.md`。書式 `:::caution[暫定 EV-NNNN / 見直し YYYY-MM]`。台帳は `npm run evidence:write`、`community/evidence-ledger.md` は自動生成
- 実装マーク: `src/content/docs/community/implementation-marking.md`。書式 `<!-- impl IMPL-NNNN target=... state=... check=... note="..." -->`。降ろし先は `src/data/impl-targets.yaml`。`npm run impl:write`。降りていない規定は `state=undelivered` と `plan=`
- 適用範囲: `community/scope-marking.md`(見出しへ併記)。語の規約: `community/provision-forms.md`(規定文に逃げ道の句を使わない等)
- 受付の番号: ADR は 0261〜0263、EV・IMPL・SRC は push 直前に付け直す(intake.md)

## 7. research/282-survey-2026-09 の知見(事実)

`by-issue.md` に #455 の節は無い(2026-09-24 時点より後の Issue)。関連する FND:

- **FND-0100**(`findings.yaml:1589`、E1、SRC-0415・0416・0417・0459、by-issue #269 支持 / #271 限定)。SLSA v1.2 は来歴と完全性が範囲でコード品質は範囲外。GitHub の artifact attestation は「安全の保証ではなく、検証されなければ利益がない」。**note(:1602)**: CSA が正しく attested された悪性パッケージ(Mini Shai-Hulud)を分析し、有効な attestation はパイプラインと ID を確認するだけで、メンテナが書いたコードの処理までは確認できないとして、provenance 検証を「必要だが不十分な統制」とした(SRC-0459)。#455 の「来歴(署名・来歴の証明)」を機械の条件にする案への直接の反証材料
- **FND-0045**(`findings.yaml:709`、E2、SRC-0364・0295 ほか)。スキル・エージェント設定経由の供給網の実害。3,984スキルの監査で 13.4%(534件)に重大な問題。npm の keyv・cacheable 系の乗っ取りは `.claude/settings.json` に SessionStart フックを仕込み、リポジトリを開くだけで実行される設計(SRC-0295)。乗っ取られた部品の実例(Issue の「乗っ取られた部品」に対応)。note 欄の内容が別知見(Inozemtseva)の記述に見え、対応が正しいか要確認(推測)
- **FND-0175**(`findings.yaml:2789`、E1、SRC-0495・0496)。OWASP Agentic Top 10 2026 の ASI04 供給網、AST10(スキルの署名・ハッシュ固定・目録)
- SRC-0574(OpenSSF Scorecard チェックの文書)は FND-0193(SonarQube、`findings.yaml:3077`)で参照されているのみ。Scorecard を依存の評価に使う知見としては無い
- SRC-0719(NIST SP 800-204D、供給網のセキュリティを DevSecOps の CI/CD へ統合する戦略)は ADR-0115 が引用済み。FND への紐付けは未確認
- 他の関連 SRC(出典のみ): SRC-0340(LLM 供給網の更新の統治)・0688(SLSA の脅威と緩和、作業草案)・0715(SLSA v1.0 Build)・0494(SLSA の段階と版)
- **未収載(事実)**: slopsquatting(Spracklen ほか、USENIX Security 2025)、typosquatting、Sigstore の資料、npm provenance の資料、パッケージのレジストリの照会(公開日・ダウンロード数)の資料は、`research/sources/*.yaml` に Spracklen・slopsquat の文字列が無い。ADR-0044 は本文で引くが出典台帳に SRC が無い可能性がある(要確認: SRC-ID が ADR 本文に見当たらないことは確認。台帳側の別名の可能性は残る)。外部調査(external.md)で一次文献を抽出して SRC 化する必要がある

## 8. 審議への示唆(推測)

1. 条文の置き所の候補は G-5 基準8 の拡張(一覧に「新規か・登録日・公開者の変化」を機械で添える)と G-6 基準5 の観点追加。第7章は受け皿にならない(5)
2. 決定可能な条件は「レジストリに存在する・公開から N 日経過・版の公開者の変化・ロックファイルのハッシュの一致」まで。署名・来歴は FND-0100 の note のとおり必要だが不十分で、有無の条件は一部のエコシステムに限られる(npm provenance は公開者の任意。python・go は別機構。推測)。ADR-0121 の全スタックの網羅原則との緊張
3. 「N 日」の値は実証が無い(根拠水準マークの対象。推測)
4. ADR-0044 決定5 の前提(実在しなければ解決で失敗)の範囲を、新 ADR で明示する必要がある
5. ネットワークの既定拒否(IMPL-0200)が undelivered のため、実行時にレジストリ以外へ出る経路は塞がれていない。#455 の統制はその代替にならない(責務が別)
