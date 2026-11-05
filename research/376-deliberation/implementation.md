# #376 の実装の記録

裁定 `decision.md` のとおりに実装した。実施日: 2026-11-05。

## 1. 準拠テンプレート template/

### 変えたファイル

| ファイル | 変えたこと |
| --- | --- |
| `scripts/gate/config.mjs` | `ROW_KIND_LABEL`(行ごとの種類の表示名)、`directionLabel(entry)`(複合のラベル「緩める(任免を含む)」を返す)、`rowKindsProblems(entry, i)`(欄の検査)を足した。`configIntegrityProblems`(出荷の証跡の集約が使う)で欄を検査する。`DIRECTION_LABEL` と `SIGNED_DIRECTIONS` は変えていない |
| `scripts/init/generate-profile.mjs` | `diffConfig` が差分の行ごとに種類を付け、`rowKinds` を返す。`changeLogEntry` が `rowKinds` を持つ(渡された記録だけ)。`deciderProblems` を行ごとの照合(`deciderRowProblems`)と案内に分け、任免・名簿の表記の変更の行と緩める向きの行を両方含み、名簿のだれの記名でも全行の要件を満たせないときに限り `SPLIT_CHANGE_POINT_HINT` を足す。プロセス構成の要約の「体制の変化点の記録」と、決定を要しない変化点の表示を `directionLabel` に替えた。向きの導出(優先 loosen > appoint > arising > tighten > none)は変えていない |
| `scripts/gate/check-pr.mjs` | 検査6b の見出しを `directionLabel` に替えた |
| `scripts/gate/aggregate-evidence.mjs` | 決定の記名の見出しと、変化点の表の向きを `directionLabel` に替えた |
| `scripts/gate/verify-gate-contract.mjs` | 契約検査で `rowKindsProblems` を照らす |
| `scripts/gate/test-loosening-decider.mjs` | (b)(a) の拒否と案内(IMPL-0444:ng)、分けると通ること(IMPL-0444:ok)、行ごとの種類(IMPL-0445:ok)、数の合わない記録の検査(IMPL-0445:ng)、複合のラベルの試験を足した。日付は 2026-10-01(過去) |
| `scripts/vendor/tailoring-kb.json` | `npm run template:kb` の再生成(生成元のコミットの値だけ) |

`material-attribution.mjs`(帰属の照合)は変えていない。

### 決めた欄の形とその理由

- 欄: 変化点の記録 `changeLog[].rowKinds`。`diff` と同じ順・同じ数の文字列の配列
- 値: `appoint`(任免)・`loosen`(緩める)・`rename`(名簿の表記の変更)・`tighten`(厳しくする)・`arising`(未達の発生)・`none`(いずれにも当たらない)
  - `none` を置いた理由: 差分には、名簿への追加・回答の変更・担い手の宣言など、5つの種類のどれにも当たらない行がある。配列を `diff` と同じ数に保つには、その旨の値が要る。標準 3.13.4 記録7 にも「いずれにも当たらない行は、その旨」と書いた
  - 名簿の表記の変更のうち、初回の記入より前で記名を要しないもの(`renameItems` を空にする場合)は `none` とした。行の種類は記名の要件を表すため
  - 任命権者を名簿へ置く変更(`appointItems` の roster)は、名簿の行(追加・変更)を `appoint` とした
  - 規則の承認で有効になった委任の行(差分に無い緩める向きの項目)は、`diff` の行でないため `rowKinds` に現れない。向きは従来どおり `loosen` になる
- 付け方: `diffConfig` の中で、差分へ行を足した場所ごとに種類を印す(`mark`)。後から行の文言で照合する方法は採らなかった。名簿の行・任命権者の行のように、項目の文言と差分の行の文言が異なるためである
- 旧い記録: 欄を持たない。移行しない。`directionLabel` は欄の無い記録で従来の表示名を返す。`rowKindsProblems` は欄の無い記録を問わない
- 検査: 欄がある記録で、配列でない・`diff` と数が合わない・不明な値を含むものを問題にする(契約検査 `verify-gate-contract` と、集約の `configIntegrityProblems`)
- 複合のラベル: `direction === 'loosen'` で `rowKinds` が `appoint` を含むときだけ「緩める(任免を含む)」。名簿の表記の変更だけでは付けない(裁定 R-1 は「緩める行と任免の行」)

### 案内の文言

> この変化点のすべての行(任免・緩める・名簿の表記の変更)の要件を満たす記名者が、名簿にいません。1つの変化点の記名者は、すべての行の要件を満たす1人に限ります(標準 第3章 3.13.3)。変化点を分けて出します。決定者その人を替える変化点と、組織上の任命権者が記名する変化点には、緩める向きの行を入れません(緩める向きの行を生む任命は、後の変化点へ回します)。緩める向きの行は、新しい決定者が記名する後の変化点で決めます

- 名簿のだれかが全行の要件を満たすとき(記名者を替えれば通るとき)は出さない。分けることを勧める場面を、満たす者がいない場合に限るため(裁定 R-2)

## 2. 標準の本文

| ファイル | 変えたこと |
| --- | --- |
| `src/content/docs/phase4-process-design/roles-responsibilities.md` | 3.13.3 の任免の表の後の箇条に2つ(全行の要件を満たす1人、分け方)を足した。IMPL-0444 と EV-0228 を付けた。3.13.4 の記録に7(変更の行ごとの種類)を足し、IMPL-0445 を付けた |
| `src/content/docs/phase5-implementation/template-repository.md` | 「向きの扱い」の箇条に、要約であること・優先の順・複合のラベル・要件を行ごとに照らすこと・`rowKinds` を足した |
| `src/content/docs/adr/0110-mixed-change-point-direction-and-signer.md` | 新設。決定1〜4、採らなかった案、ADR-0088 決定5 との関係、ADR-0087 の誤記 |
| `src/content/docs/adr/0089-regression-suite-under-version-control.md` | ステータスの節に、#376 の印を ADR-0110 決定1 で解いた旨を足した(本文は変えていない) |
| 台帳 | `npm run evidence:write`・`impl:write`・`scope:write`(変更なし)を実行した |

## 3. 回帰スイート scripts/regress/

| ファイル | 変えたこと |
| --- | --- |
| `expected/matrix-sweep.json` | 2名 mvp・growth cl0 の `knownFailure`(#376)を外し、期待の向きを `loosen` へ改めた。`changed` に `{ by: "ADR-0110 決定1", on: "2026-11-05", from: 元の値 }` を足した。`_note` を改めた。観測は向きの値(`loosen`)で比べるため、表示のラベルは期待値に入らない |
| `expected/scenes/matrix-sweep.txt` | 印の場面「2名 mvp cl0: 向き」「2名 growth cl0: 向き」を外した(印を外すと場面が出ないため) |
| `suite/mixed-change-point.mjs` | 新設。(b)(a) を分けずに出すと拒否され、拒否の理由に案内が出る場面と、分けると通る場面。入力は probe の S2・S3・追加1 と同じ |
| `expected/scenes/mixed-change-point.txt` | `--write-scenes` で書き出した(23 場面) |

## 4. 試験の結果

- 準拠テンプレートの試験一式(scripts/gate/test-*.mjs と verify-gate-contract。Windows): test-g5-aggregate.mjs(CRLF による既知の失敗)を除いてすべて通過。test-loosening-decider.mjs は新しい場面を含めてすべて通過
- 回帰スイート(WSL、--kb keep): 通常の時刻帯で全 24 本が通過(mixed-change-point 23 場面、matrix-sweep 31 場面、印は scenarios の 3 だけ)。TZ=UTC でも全本が通過
- 本体の npm run check の各段(Windows で個別に実行。test:regress は上の WSL で実行): 落ちたのは test:template-suite(test-g5-aggregate.mjs の CRLF。既知)だけ。lint:provisions が第5章の追記の文末「とする」を手引きの頁の要求として拒否したため「である」へ改め、通過を確かめた。lint:text は通過
- 準拠テンプレートのコミット: 3e0a5d8(pit-in-template の main へ push 済み)

## 突合の指摘への対応

入力: `crosscheck.md`(F-1〜F-9)。F-1 は指摘なし。F-9 は確認の不足(下の試験の結果で WSL の実行を記録した)。

| 指摘 | 対応 | 変えたファイル |
| --- | --- | --- |
| F-2 記録7 が D-0 表8 に欄を持たない | 直した。第6章 表8 に列「変更の行ごとの種類」と注記(種類ごとの行の数を書いてよい。欄を置く前の行は書き足さない)を足した。準拠テンプレートの D-0 様式の節13 と生成区間に同じ列を足し、種類ごとの行の数(例: 任免 3 / 緩める 1 / 厳しくする 3)を出す。欄の無い旧い記録は「—」。列を置く前の生成区間は `before376` の形として一致に数え、/pit が再生成を勧める(#430 の `before430` と同じ扱い)。`template-fields.yaml` に必須欄として登録した(test:fields 通過) | `deliverable-templates.md`、`src/data/template-fields.yaml`、`template/templates/00-d0-governance.md`、`template/scripts/init/generate-profile.mjs`(renderD0Section・d0SectionProblems・d0LegacyOnlySections)、`template/scripts/gate/config.mjs`(rowKindsSummary) |
| F-3 規則の承認で有効になった委任の行が rowKinds に出ない | 実行で再現した(v3 の s5 から、委任の席に規則 DR-002 を足して承認だけの変化点を出すと、向き loosen・rowKinds `["none"]`)。直した。ruleActivated で、差分の承認の行(`委任の規則 ID: AI維持管理者の承認 `)の種類を loosen にする。行が無ければ行と種類を足す。あわせて検査に、向きが loosen なのに loosen の行が無い記録と、向きが appoint なのに任免・名簿の表記の変更の行が無い記録を問題にする整合を足した。回帰の試験 v3 に場面を4つ足して固定した | `generate-profile.mjs`、`config.mjs`(rowKindsProblems)、`scripts/regress/suite/v3.mjs`、`expected/scenes/v3.txt` |
| F-4 記録7 の例示が狭い | 直した。「5つの種類で区分しない行(回答の変更、名簿への追加、氏名・アカウントの確認、委任の規則の承認など)は、その旨。種類で区分しない行の記名の要件は、各行の規定による」とした。ADR-0110 決定3 にも同じ範囲と「実装で補った」旨を書いた(公開の前の改めとしてステータスの節に記録) | `roles-responsibilities.md`、`adr/0110-...md` |
| F-5 分けても通らない組にも案内が出る | 直した。案内の条件に「緩める向きの行を除けば、名簿のだれかの記名で通る」を足した。文言を、任免・名簿の表記の変更のどちらにも当たる形(先の変化点に緩める行を入れない。緩める行は後の変化点で、その行を決定できる者が記名する)へ改めた。抑止の側の試験を2つ足した(全行を満たす者がいるが記名者が違う場合、任命権者のいない体制で任免の段を記名できる者がいない場合) | `generate-profile.mjs`、`test-loosening-decider.mjs`、`suite/mixed-change-point.mjs`(照合の語)、第5章・ADR-0110 決定2・IMPL-0444 の注記 |
| F-6 IMPL-0445:ng が契約検査の入口を通さない | 直した。一時の置き場の構成で rowKinds を1件削る・欄を消す(封印を付け直す)形にし、`verify-gate-contract.mjs` を実行して問題が出ることを IMPL-0445:ng とした。揃った記録で問題が出ないことも確かめる。関数の試験は印を外して残した | `test-loosening-decider.mjs` |
| F-7 第3章が名簿の表記の変更の要件を第5章へ預ける | 一部だけ直した。リンク先を第5章「向きの扱い」の表の行「人の名簿の表記の変更」と特定し、「参照」の形にした(lint:provisions は、第3章の要件の内容を手引きの頁へ委ねる形を拒否する)。**要件そのものを第3章へ上げることは本件でしない**。名簿の表記の変更の記名の要件(決定者本人の行は任命権者か本人以外の席の責任者)は #376 の論点の外の条項の新設で、コアポリシーにより調査と会議体を経ずに置かない。後継の Issue #433 で審議する | `roles-responsibilities.md` |
| F-8 旧い記録を欄の有無で見分ける | 直した。`rowKindsLogProblems(changeLog)` を置き、最初に rowKinds を持つ記録より前を旧い記録として問わず、それより後の記録(init・migrate・intake を除く)が欄を欠けば問題にする。版の記録を新たに持たせる形は採らなかった。並びの位置で足り、移行も要らないため。契約検査と集約の両方がこの関数を使う | `config.mjs`、`verify-gate-contract.mjs`、第5章・ADR-0110 決定3・IMPL-0445 の注記 |

注意: 3e0a5d8 の版で、規則の承認だけの変化点を記録した構成は、F-3 の整合の検査で問題として出る(rowKinds に loosen が無い)。3e0a5d8 の公開から本修正までは同じ日の数時間であり、移行は置かない。

### 試験の結果(突合の後)

- 準拠テンプレートの試験一式(Windows): test-g5-aggregate.mjs(CRLF。既知)を除いてすべて通過。test-loosening-decider.mjs は突合の場面(案内を出さない2場面、D-0 の欄、契約検査の入口の IMPL-0445:ng)を含めてすべて通過
- 回帰スイート(WSL、--kb keep): 通常と TZ=UTC の両方で全 24 本が通過。v3 は 106 場面(F-3 の4場面を足した)、mixed-change-point は 23 場面、matrix-sweep は 31 場面
- 本体の npm run check の各段(Windows): 落ちたのは test:template-suite(同じ CRLF の既知の失敗)だけ。lint:text・lint:provisions・test:fields・lint:impl は通過
- 準拠テンプレートのコミット(突合の後): e0422fd(pit-in-template の main へ push 済み)
