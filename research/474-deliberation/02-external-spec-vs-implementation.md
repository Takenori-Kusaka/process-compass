# #474 外部調査 2: 標準と、参照実装・適合試験・サンプルを別に持つ先例

- 確かめた日: 2026-11-28
- 問い: 標準(仕様)と、その参照実装・適合試験・サンプルを別に持つ先例はどうなっているか。標準が実装を抱えたことの害と益は何か
- 方法: 出典台帳(`research/sources/`)と `research/282-survey-2026-09/` に、参照実装・適合試験を扱う出典は無かった(grep で該当なし。SLSA の SRC-0415/0494/0688/0715 と NIST の SRC-0766 はあるが、本問の論点は含まない)。以後は Web の一次の出典で確かめた。出典の節・引用は WebFetch の抜き書きによる。**確かめられなかったものは「未確認」と書く**
- 注意: WebFetch は小型モデルの要約を介するため、引用は「原文に近い抜き書き」であり、台帳へ載せる前に原文で再照合が要る

## 1. 先例ごとの確認結果

### 1.1 IETF

- RFC 7942(Implementation Status)§1: 実装は「RFC として公開する要件ではない」。実装の利点として「仕様が理解できるものだと確かめられること」を挙げ、作業部会が "running code" を持つ文書へ相応の考慮を払えるようにするための任意の記録である。<https://www.rfc-editor.org/rfc/rfc7942>
- RFC 2026 §4.1.1: Proposed Standard では通常、実装も運用経験も要らない(IESG が中核の仕様では求めうる)。§4.1.2: Draft Standard は「異なるコードベースから作られた、独立で相互運用する実装が少なくとも2つ」と運用経験を要る。§4.1.3: Internet Standard は十分な実装と運用の成功を要る。<https://www.rfc-editor.org/rfc/rfc2026>
- RFC 6410 §1・§2.2: 段を3段から2段へ縮め、2つの層を1つにした。基準は「少なくとも2つの独立した相互運用する実装が広く展開されていること」。相互運用の報告書は不要とし、展開の事実で示す。<https://www.rfc-editor.org/rfc/rfc6410>
- RFC 7282 §1: "rough consensus and running code" は Dave Clark(1992)の言。「実装という現実の成果が、机上の設計より優先する」という含意。<https://www.rfc-editor.org/rfc/rfc7282>
- 要点: **入口(Proposed)では実装を求めず、成熟の段階(Draft/Internet Standard)で独立した複数の実装を求める**。実装の実在は成立の条件ではなく、昇格の条件である。「実装されないまま公開された仕様がある」ことを RFC 7942 自身が認めている

### 1.2 W3C

- W3C Process 2023-11-03 §6.3.2: 実装経験は「仕様が十分に明確であること」を示すために要る。見るのは「現行の仕様に独立した相互運用可能な実装があるか」「仕様の各機能が実装されているか、どう示すか」。§6.3.1: CR は実装経験を集める段。§6.3.7: 作業部会は、十分な実装経験をどう示すかを文書化しなければならない(CR の段では計画)。§6.3.9: PR へ進めるには、十分な実装経験を示さなければならない(チーム決定の例外を除く)。<https://www.w3.org/policies/process/20231103/>
- web-platform-tests: 「Web プラットフォーム群の、ブラウザ横断の試験集」。仕様の編集者と実装者が残した隙間を、利用者が余分な抽象で埋めずに済むようにするもの。<https://web-platform-tests.org/>(「仕様の変更に試験を添える要求」は当該ページでは確認できず、**未確認**)
- Web SQL Database(作業停止の事例): 「関心のある実装者がみな同じ SQL 基盤(SQLite)を使っている」ため行き詰まり、「標準化へ進むには複数の独立した実装が要る」と注記して止めた。<https://www.w3.org/TR/webdatabase/>

### 1.3 OpenAPI / JSON Schema

- OpenAPI Specification 3.1.0: 要件語(MUST 等)を BCP 14 に従わせる(§1.1)。仕様は「言語非依存の HTTP API の標準的な記述」であり、ツール(文書生成・コード生成・試験)は利用者として位置付く。ツールへの要求は §4.1「OAS 3.1 を支えるツールは 3.1.* の全版と互換であるべき(SHOULD)」など少数。**参照実装への言及は確認した範囲(冒頭〜§4.5)に無い**。<https://spec.openapis.org/oas/v3.1.0.html>
- JSON-Schema-Test-Suite: 実装者が自分の実装を試すための JSON の試験集。言語非依存で JSON パーサだけで足りる。試験を各言語・各枠組みへ変換するのは実装者の仕事。<https://github.com/json-schema-org/JSON-Schema-Test-Suite>(実装の一覧の掲載方法は確認できず**未確認**)

### 1.4 OpenTelemetry

- 仕様の原則: 仕様は「何を」に集中し、「どう」は非規範の言葉か補助の指針で書く。多くの言語・枠組みで実装できなければならない。「仕様の変更の前に、プロトタイプか実装を示すべき」。API/SDK の変更は、型付きオブジェクト指向・動的型付け・構造型(Go や Rust)の3つの系統での試作を目安にする。<https://opentelemetry.io/docs/specs/otel/specification-principles/>
- 別の検索結果では、プロジェクト運営の頁に「少なくとも2言語」との記述があり、基準が頁により違う。「合流の前提」として強制かは**未確認**(原則の文言は should で、助言の強さ)
- compliance matrix: 「各言語の実装が、どの機能を実装しているか」の表。言語ごとの列があり、`+`・`-`・`N/A`・空欄(不明)で示し、任意の機能は別の列で区別する。仕様と同じリポジトリにある。<https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md>(維持者は頁に書かれていない)

### 1.5 CNCF / Kubernetes と OCI

- cncf/k8s-conformance: 適合の確認は、Sonobuoy か Hydrophone で適合試験を実行し、出力(e2e.log・junit_01.xml を含む4ファイル)を PR で提出する。bot が自動検査し、CNCF が審査して認証する。リリースごとの試験の一覧がある。<https://github.com/cncf/k8s-conformance>
- OCI runtime-spec: 仕様は実装の開発者・フックの開発者向けの定めで、頁に適合の定義・試験の記述は無い。検証は別リポジトリ runtime-tools(node-tap、`RUNTIME=runc` で実行)。**runc が公式に「参照実装」と呼ばれているかは確認できなかった(未確認)**。<https://github.com/opencontainers/runtime-spec>、検索結果の runtime-tools の README

### 1.6 JCP と Jakarta EE

- JCP: 仕様・参照実装(RI。「実装可能であることの証明」の試作)・TCK(試験集)の3点を成果物とし、最終版の後は保守の主導者が3点の保守を担う。<https://jcp.org/en/resources/guide-tck>、JCP 2.8/2.11 の手続き文書(検索結果から。節は未確認)。CDI TCK の文書は、TCK と RI は互いに依存すると述べる(二次の出典)
- Jakarta EE: 「仕様の実装可能性を示すための単一の参照実装という概念は無い」。仕様の手続きは、少なくとも1つの互換の実装(CI)を求め、できるだけ多くを望む。証明は自己認証、つまり実装者が TCK を実行し結果を公開して、その正しさへ責任を負うこと。<https://blogs.eclipse.org/post/ivar-grimstad/compatible-implementations> / Jakarta EE FAQ は Java EE 8 の TCK が Oracle から寄贈され、互換試験の基礎であると述べる。<https://jakarta.ee/about/faq/>
- 実態(メーリングリストの要約): GlassFish は、任意機能をすべて持つ唯一の実装だったため事実上の参照であり続けた。TCK の検証にも GlassFish を使い、RI なしへ移行中という発言がある。**RI を廃した理由を一文で述べた一次の文書は見つからなかった(未確認)**。<https://www.eclipse.org/lists/jakartaee-platform-dev/msg01968.html> ほか
- 害の記録(TCK の使用許諾): Oracle は Apache Harmony へ TCK を「使用分野の制限(FOU)」なしでは許諾せず、ASF は2010-12-09 に JCP 執行委員会を辞任した。ASF の説明は、これが「TCK で試験され、仕様に適合し、Apache ライセンスの Java SE 実装」という目的を阻むというもの。<https://news.apache.org/?p=4424>、<https://blogsarchive.apache.org/foundation/entry/statement_by_the_asf_board>

### 1.7 POSIX / Open Group と Khronos

- Khronos: 規格ごとに Adopters Program を持つ。企業は合意書へ署名し料金を払う。適合試験(CTS)の原本を取得して自分の実装で実行し、結果を提出して作業部会の審査を受ける。通れば、規格の名称・ロゴを使える。<https://www.khronos.org/conformance/>
- POSIX / Open Group の適合試験: 規格の本文(Issue 7)の頁は枠組みのみで、適合の章を読めなかった。**未確認**(適合の認証プログラムの存在は記憶による記述になるため採らない)

### 1.8 プロセス・統制の側

- SLSA: 仕様は「段階的に採用できる指針」で、産業の合意で作る。仕様の頁は slsa-github-generator に触れない。<https://slsa.dev/spec/v1.0/about> 実装の例の slsa-github-generator は「SLSA Build Level 3 の来歴の生成・検証のための道具」だが、README は「用意した再利用ワークフローだけでは要件をすべて満たせない。来歴の配布と検証は扱わない」と明記し、さらに「もはや積極的には保守されていない」と述べて GitHub の artifact attestations を勧める。<https://github.com/slsa-framework/slsa-github-generator> 仕様は残り、実装は退いた(仕様と実装を別に持った益の実例)
- NIST SP 800-218(SSDF): 公式の頁と PDF 本文の確認に失敗した。検索結果の要約によれば、SP 800-218 は notional implementation example を「作業の実装を助けうる道具・プロセス・その他の方法の例」と定義し、例や例の組合せは必須でないとする。また実践・作業・実装例は「出発点」で、変更・調整してよいとする。**原文の確認は未了(未確認)**。<https://csrc.nist.gov/projects/SSDF>(検索結果経由)。なお2026-05 の NIST 発表で SSDF v1.2 草案が実装例を拡充するとの記述がある(<https://csrc.nist.gov/csrc/media/presentations/2026/ssdf-update-and-devsecops-project/20260520-ogata-ssdf-devsecops.pdf>、検索結果経由で未読)。なお NIST は、SSDF を DevSecOps の「実装例」として別のプロジェクトで示している(<https://pages.nist.gov/nccoe-devsecops/>)
- NIST SP 800-53 と OSCAL: 管理策の機械可読の版(OSCAL 版カタログ)を NIST が別リポジトリで配布する。出典台帳に SRC-0766 がある(IA-2 の抜粋)
- CIS Benchmarks: 「25 を超えるベンダー製品群への、規定的な構成の推奨」で、世界の専門家の合意による。評価の道具は CIS-CAT Pro Assessor が別にある(「ベンチマークへの適合を評価する」)。<https://www.cisecurity.org/cis-benchmarks>(SCAP 等の機械可読形式は当該頁で確認できず未確認)
- Scrum Guide 2020: Scrum は「意図して不完全」で、Scrum の理論を実装するのに要る部分だけを定める。利用者が集合知で補う。<https://www.scrumguides.org/scrum-guide.html>(検索結果の抜粋から)。批判: 不完全という枠付けは害だという論(Serious Scrum)、枠組みと呼べるか疑う論(TechTarget)。<https://medium.com/serious-scrum/the-disastrous-impact-of-framing-scrum-as-an-incomplete-framework-b8d4d45d990e>
- CMMI: SEI は「CMMI のモデルはプロセスではなく、有効なプロセスの特性を述べるもの」とし、評定の方法 SCAMPI を別に持つ。<https://www.sei.cmu.edu/library/the-scampi-appraisal-method-top-ten-misperceptions>(検索結果の要約から。原文の節は未確認)
- SAFe の「詳細な規定への批判」、RUP の「製品との結合の害」: **今回は出典を確かめられなかった(未確認)**。必要なら別の調査で行う

## 2. 害と益の記録(出典つき)

| # | 種別 | 事例 | 出典 |
|---|---|---|---|
| 1 | 単一実装が仕様の進展を止めた | Web SQL。実装者がみな SQLite を使い、独立した実装が無いため標準化が行き詰まった | W3C Web SQL 注記 |
| 2 | 実装できない・不完全な仕様(紙の標準) | ISO/IEC 29500(OOXML)。2007-08 の批判として「承認された版を実装した製品が無い」「不完全」との報告。EU の報告(2014)は、ECMA・Transitional・Strict の3版が互換でなく、他者が実装しにくいと論じる。**ODF 陣営・OSS 側の主張が多く、一方的である**。Microsoft は準拠の計画を述べた | <https://interoperable-europe.ec.europa.eu/community/osor/case/complex-singularity-versus-openness>、<https://www.itpro.com/176172/ooxml-standards-for-accepting-standards>(検索結果の要約。原文は未読) |
| 3 | 参照実装が事実上の標準になった | Jakarta EE の GlassFish。任意機能をすべて持つ唯一の実装で、TCK の検証にも使われ続けた(RI 廃止後も) | Eclipse メーリングリスト msg01968 ほか(要約。未読の原文あり) |
| 4 | 適合試験の許諾が互換性の広がりを阻んだ | JCP の TCK と Apache Harmony。使用分野の制限を理由に ASF が JCP を辞任した | ASF の声明(上記) |
| 5 | 実装の保守が止まり、仕様だけが残った | slsa-github-generator は積極的な保守を終え、SLSA の仕様は存続する | 同 README |
| 6 | 適合の表が仕様側にあり、実装の差が見える | OpenTelemetry の compliance matrix(空欄は「不明」) | 上記 |

「参照実装の保守が標準の改訂を遅らせた」「適合試験が無く互換性が崩れた」の2つは、**確かめられた一次の出典を今回は得られなかった(未確認)**。事例(3)と(5)は、前者が実装への依存、後者が実装の分離の益の記録である。

## 3. まとめ

### (a) 先例ごとの表

| 先例 | 仕様の置き場 | 実装の置き場 | 適合の確かめ方 | 実装の実在を成立の条件にするか |
|---|---|---|---|---|
| IETF | RFC | 各実装者(Implementation Status は任意の記録) | 独立した相互運用の実装(昇格時) | 入口では否。昇格では要(2つ以上) |
| W3C | Recommendation | ブラウザ各社 | CR で実装経験を集め、PR で示す。WPT | 勧告の前に要(例外はチーム決定) |
| OpenAPI | 仕様 | ツールの各提供者 | 確認した範囲では定めなし | 否(確認した範囲) |
| JSON Schema | 仕様 | 各言語の実装 | 公式の試験集を実装者が実行 | 未確認 |
| OpenTelemetry | specification リポジトリ | 言語ごとの SDK | compliance matrix(自己申告に近い) | 変更の前に試作を示す(助言) |
| Kubernetes / CNCF | 仕様+適合試験の一覧 | ベンダー | Sonobuoy 等の実行結果を PR で提出し、CNCF が認証 | 認証の条件であって仕様の成立の条件ではない |
| OCI | runtime-spec | runc 等(参照実装かは未確認) | 別リポジトリの検証試験 | 未確認 |
| JCP(従来) | 仕様 | RI | TCK | 要(RI と TCK を伴う) |
| Jakarta EE | 仕様 | 互換の実装(CI) | TCK の自己認証 | 要(CI が1つ以上)。RI は無し |
| Khronos | 規格 | 採用企業 | CTS の実行+審査+料金 | 商標の使用の条件であって、規格の成立の条件ではない |
| SLSA | 仕様 | slsa-github-generator など | 仕様側で来歴の検証を定め、検証は道具(slsa-verifier) | 否 |
| NIST SSDF | SP 800-218 | 実装例は規範でないとされる(原文は未確認) | なし | 否 |
| CIS | ベンチマーク | CIS-CAT 等 | 自動の評価ツール | 否 |
| Scrum | Scrum Guide | 各社・各チーム | なし | 否(意図して不完全) |
| CMMI | モデル | 各組織 | 評定の方法 SCAMPI(別) | 否 |

### (b) 分け方の型

1. **型 A: 仕様のみ+独立の実装の存在を昇格の条件にする(IETF・W3C)**
   - 益: 「実装できない規定」を、複数の独立した実装で検出する。実装が1つに偏る害(Web SQL)も、独立性の条件で防ぐ
   - 害: 昇格が遅い。仕様が実装の寄せ集めに引かれる。実装が現れない仕様は成熟できず、段階の途中に長く留まる(RFC 7942 は、実装なしの公開を認める)
2. **型 B: 仕様+適合試験を分離し、認証は別の組織(Khronos・CNCF・Jakarta EE の TCK)**
   - 益: 「実装した」という申告を、試験の結果で確かめられる。実装を抱えずに互換を保てる
   - 害: 試験が仕様の意味を事実上決める。試験の使用許諾が閉じると互換が広がらない(Harmony)。試験は決定可能な条件しか見ない
3. **型 C: 仕様+参照実装+試験の3点を一体で持つ(従来の JCP)**
   - 益: 規定が実装できることを、仕様の作成中に示せる
   - 害: 参照実装が事実上の標準になる(GlassFish)。3点の保守が最終版の後も保守の主導者へ集中する。Jakarta EE は RI の概念を外し CI+TCK へ移った(理由の一次文書は未確認)
4. **型 D: 仕様+自己申告の適合の表(OpenTelemetry)**
   - 益: 軽い。差が見える(空欄が不明を示す)
   - 害: 表の正しさは申告者に依る。変更の前の試作の要求は、確認できた限り助言の強さ
5. **型 E: 指針としての枠組み。実装は例・道具として別(Scrum・SSDF・CIS・SLSA・CMMI)**
   - 益: 採用者が自分の文脈へ合わせられる。実装が退いても仕様が残る(slsa-github-generator)
   - 害: 「不完全」の批判(Scrum)。適合の確かめ方が、別の評定の方法(SCAMPI)・検査の道具(CIS-CAT)に依る。別の方法が無い先例(Scrum・SSDF)では、「従った」の判定が人の解釈に残る

### (c) 本件への含意: 実装の実在を検査の条件から外すとき、先例は「実装できない規定」を何で防いでいるか

先例を見る限り、**実装を標準の中に持つ型 C は少数で、外へ出した型でも「実装できない規定」を防ぐ手立てを別に持つ**。手立ては次の4つに分かれる。

1. **昇格の関門に独立した複数の実装を置く**(IETF の Draft/Internet Standard、W3C の CR→PR)。入口には置かない。実装の「数」と「独立」を条件にするのが要点で、1つの実装(自分の参照実装)では足りない
2. **変更の前に試作を示させる**(OpenTelemetry。ただし助言の強さ)
3. **適合試験を別の組織・別のリポジトリが持ち、通った実装だけが名称を使える**(Khronos・CNCF・Jakarta EE)。試験が仕様の曖昧さを実行の場面で露わにする
4. **仕様の側へ実装の状況の表を置く**(OpenTelemetry の compliance matrix)

標準が実装の実在を自分の検査の条件から外すなら、先例から言えるのは次の点である。

- 先例で「実装が無くても成り立つ」のは、**入口の段階(Proposed Standard、OpenAPI、Scrum、SSDF)**。一方、**成熟・認証・名称の使用の段階では、実装または試験の実在が条件**になっている。外すこと自体は先例がある。外したまま、その段の関門を置かないことに先例は見当たらなかった
- 実装を外した型 E の先例(Scrum・SSDF)は「不完全は意図」と明言し、**規定の側を結果の記述に絞って**実装できない規定を避けている。結果の記述に絞らない規定を実装なしで置く先例は、確認した範囲で無かった
- 本件で「実装の実在」を機械の検査から外すなら、先例に倣う代替の手立ては、少なくとも次のいずれかになる。(i) 実装(テンプレートや試行の事例)を別のリポジトリに持たせ、標準の改訂ごとに通す適合試験・試行を関門にする(型 B)、(ii) 複数の独立した採用の事例を、改訂の昇格の条件にする(型 A)、(iii) 実装の状況の表を標準側に置く(型 D)、(iv) 規定を結果の記述に絞る(型 E)。**いずれも採るかは本調査の範囲外**(会議体の議題)
- 注意すべき害の側: 実装を1つだけ持つと、その実装が事実上の標準になる(GlassFish)。独立の採用が1つしか無い状態は Web SQL の行き詰まりに似る。本件のテンプレートは「単一の実装」にあたるため、型 C の害と型 A の「独立」の論点が最も近い

## 出典の追記(新しい出典。台帳 SRC への登録は未実施。確かめた日はすべて 2026-11-28)

| 仮の名 | URL | 抜き書き(要約) |
|---|---|---|
| N1 | https://www.rfc-editor.org/rfc/rfc7942 | §1 実装は RFC の要件でない。running code を持つ文書へ相応の考慮 |
| N2 | https://www.rfc-editor.org/rfc/rfc2026 | §4.1.1〜4.1.3 実装・運用経験の要件の段階 |
| N3 | https://www.rfc-editor.org/rfc/rfc6410 | §2.2 2つの独立した相互運用の実装 |
| N4 | https://www.rfc-editor.org/rfc/rfc7282 | §1 rough consensus and running code(Dave Clark, 1992) |
| N5 | https://www.w3.org/policies/process/20231103/ | §6.3.1・6.3.2・6.3.7・6.3.9 実装経験 |
| N6 | https://www.w3.org/TR/webdatabase/ | Web SQL の停止の注記(同じ SQLite) |
| N7 | https://web-platform-tests.org/ | WPT の位置付け |
| N8 | https://spec.openapis.org/oas/v3.1.0.html | §1.1・§4.1 の要件語・ツール |
| N9 | https://github.com/json-schema-org/JSON-Schema-Test-Suite | 実装者向けの試験集 |
| N10 | https://opentelemetry.io/docs/specs/otel/specification-principles/ | 仕様の変更の前の試作 |
| N11 | https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md | 言語ごとの実装の表 |
| N12 | https://github.com/cncf/k8s-conformance | 適合の提出の流れ |
| N13 | https://blogs.eclipse.org/post/ivar-grimstad/compatible-implementations | RI を持たず CI+TCK の自己認証 |
| N14 | https://jakarta.ee/about/faq/ | Java EE 8 の TCK の寄贈 |
| N15 | https://news.apache.org/?p=4424 | ASF の JCP 辞任(TCK の許諾) |
| N16 | https://www.khronos.org/conformance/ | Adopters Program |
| N17 | https://github.com/slsa-framework/slsa-github-generator | 実装の限界と保守の終了 |
| N18 | https://www.scrumguides.org/scrum-guide.html | 意図して不完全(検索結果の抜粋) |
| N19 | https://www.cisecurity.org/cis-benchmarks | 規定的な推奨と CIS-CAT |

読めなかった・確かめられなかった: NIST SP 800-218 の PDF 本文(PDF は圧縮のため読めず)、POSIX の適合の章、OCI の runc の位置付け、JCP 手続き文書の節、Jakarta の RI 廃止の理由、SAFe・RUP。
