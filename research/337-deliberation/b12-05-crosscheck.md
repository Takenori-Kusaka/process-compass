# 束 B12 独立の突合(#337 項目1〜5 と #330 の残り)

日付: 2026-11-17。担当: 独立の突合(実装を見ていない別の文脈)。1巡目(差分だけを1回)。

- 見た差分: 本体 `git diff 35cd7c79..83ee21d7 -- . ':!research'`、template `git -C template diff e9f5590..HEAD`(b99335c・258cf41)
- 裁定: `research/337-deliberation/b12-03-ruling-proposal.md`(末尾の議長の裁定が優先)、ADR-0166 と `research/330-deliberation/b12-03-ruling-proposal.md` の T-5・T-7
- git の状態は変えていない。変異は scratchpad の `git archive` の写しで入れ、写しごと戻した(作業ツリーは clean のまま)

## 所見の一覧

| ID | 重大度 | 節 | 所見 |
| --- | --- | --- | --- |
| C-1 | 中 | #337 | IMPL-1001 は `plan=scheduled issue=337` のまま、note に「#337 の範囲外」と書いている。`npm run impl:issues -- --issue 337` が IMPL-1001 を挙げて終了コード 1 を返すので、#337 は閉じられない |
| C-2 | 中 | #337 項目1 | `briefCoverageBaseline` が最初の整数を読むので、自然な書き方で偽の失敗が出る |
| C-3 | 中 | #330 | ADR-0166 と IMPL-0239・0234 の「確かめる者: 採用者の G-5 の設定の責任者」は、本標準の語彙に無い役割 |
| C-4 | 低 | #337 項目1 | 本文 gate-criteria の「一致は、契約検査が確かめます」に限定が無い |
| C-5 | 低 | #337 項目1 | IMPL-0994 の note のうち、coverage-check の失敗と check-g1 の必須は `test=`(test-init-g5)の外で固定されている |
| C-6 | 低(編集) | #337 | IMPL-0262 の note の文が繋がっている(「…集約に出す基準値の行(カバレッジの基準値)も同じ様式に置き、G-1 の前の企画書で必須。(単位: 行)」) |
| C-7 | 低 | #337 項目1 | 由来の記録の無い旧い構成(coverageBaseline 無し)で、代償措置の 90 が coverageThreshold に入っている場合 |
| C-8 | 低(情報) | 観点5 | test-g5-aggregate の 4 件の NG は本差分によるものではない。CRLF での checkout が原因 |

## 観点ごとの確認

### (1) 裁定どおりか

- 項目1: 4 様式の行名の改めと行の追加、`BRIEF_BASELINE_ROW`・`briefCoverageBaseline`、check-g1 の必須の行(通過済みで行が無いときは飛ばす)、契約検査の比較(行なし・未記入は notes、読めない・不一致は problems、「基準値に含めません」)を確かめた。どれも指示書どおり。本文の2つの文と、IMPL-0994・0262 の改めも指示書どおり
- 項目2: coverage-check の `?? 80` を外し、失敗と理由を出すようにした。契約検査も problems にした。adapter.mjs は注だけを足した。どれも裁定どおり
- 項目3: calibration-register.md の1文は指示書の文言どおり。JSON と検査は変えていない
- 項目4: check-pr の文言、宣言の表の行(gaps に入れない)、IMPL-1001 を undelivered のまま残したことは、議長の裁定どおり。ただし C-1 がある
- 項目5: 未達の表の `ci-strict(compensationNote)` と `unmet[]` への写しを確かめた。IMPL-0346 の note もある
- 指示書と違えた点(b12-04 に記録)は、sealChangeLog の利用、guard.json を作業ツリーから読むこと、test= を複数書けないため note へ所在を書いたことの3つ。どれも裁定の趣旨を変えない。guard.json を作業ツリーから読む点は、集約が構成を読む版と揃っている
- #330 の残り: IMPL-0239・0234 は `plan=adopter decision=ADR-0166`。`issue=` と `review=` は外れている。`npm run impl:issues -- --issue 330` は 0 件を返す。T-5・T-7 の note の内容は保たれている

### (2) 表示と実態(試験を走らせて確かめた)

通常の実行(template の作業ツリー): test-coverage-scope 75・test-brief-thresholds 47・test-init-g5 164・test-tailoring-declaration 16・test-check-pr 218・test-roster-rules 186・test-adoption 69 が通過した。写しでは test-adapter・test-edition-end・test-loosening-decider・test-name-confirmation-timing・test-stack-coverage も通過した。本体の lint:impl・lint:evidence・lint:refs も通過した。

変異(写しで1件ずつ入れて戻した)。どれも、対応する試験が NG を出して検出した。

| 変異 | 検出した試験 | NG |
| --- | --- | --- |
| 契約検査の基準値の比較を `false` にする | test-init-g5(IMPL-0994 の test=) | 4(1名・3名 × 食い違い/90) |
| 契約検査の「threshold 無し」の problems を外す | test-init-g5 | 2 |
| coverage-check を `?? 80` に戻す | test-coverage-scope | 1 |
| check-g1 の REQUIRED_ROWS から基準値の行を外す | test-brief-thresholds | 3 |
| check-g1 の「通過済みで行なしは飛ばす」を外す | test-brief-thresholds | 1 |
| 未達の表の compensationNote の添えを外す | test-tailoring-declaration | 1 |
| 上限未設定の宣言の行を出さない | test-tailoring-declaration | 2 |
| 上限未設定を gaps にも入れる | test-tailoring-declaration | 2(「欠落に数えない」「件数は変わらない」) |

- IMPL-0994 の `test=template/scripts/gate/test-init-g5.mjs` は実在する。`IMPL-0994:ok`/`:ng` の場面は、違反を入れると NG になる。delivered の表示は実態と合っている
- C-4: 本文の「企画書で定めた基準値と構成の基準値の一致は、契約検査が確かめます」には限定が無い。実態では、行が無い・未記入のときは通知だけで比べない。G-1 を通過済みで行が無い企画書では、check-g1 も黙って飛ばす。契約検査は「確かめていません」の通知を出すので、確かめたと読める出力は無い。IMPL-0994 の note も限定を開示している。本文に「(企画書の行が記入されている場合)」を足すのが望ましい。表示と実態の食い違いの「高」には当たらない
- C-5: note の「構成に ci.coverageThreshold が無ければ coverage-check …が失敗させ」は test-coverage-scope が、「G-1 の前は check-g1 が必須にする」は test-brief-thresholds が固定している。どちらも test= には無い。IMPL-0246 に倣い「test= には含めない」と書くか、所在を note に書くとよい

### (3) 新たに失敗にした条件の決定可能性と、不当に落とさないか

- 構成に coverageThreshold が無い場合: 決定可能(型と範囲)。生成器は初期化の時点から値を書く(template の `process.config.json:23` は 80。generate-profile.mjs:946-966 の全経路で coverageThreshold を決める)。値の無い構成は手で消した場合に限られる。既存の試験の fixture で落ちたものは無い(上の試験群がすべて通過)
- 企画書の行と構成の不一致: 行が新設なので、既存の採用者の企画書には行が無い。その場合は通知だけで、落ちない。較正では generate-profile.mjs:5614 が coverageBaseline を較正の値へ揃えるので、較正の構成は偽の失敗を出さない。profiles の4様式はすべて行を持ち、test-brief-thresholds が固定している
- **C-2(中)**: 比較の値の読み方は決定可能だが、`(\d{1,3})\s*%?` は最初の整数を拾う。実行で確かめた結果:
  - 「G-5 を強める構成のため 90%」→ 5(不一致で失敗)
  - 「2026-11 に較正 85%」→ 202 → null(「読み取れません」で失敗)
  - 「85.5%」→ 85(構成が 85 なら通る。85.5 なら 85 と 85.5 の不一致で失敗)

  様式の説明の文が「G-5」「90%」を含むので、最初の例は自然に書かれうる。出力に読んだ値が出るので原因は追える。ただし偽の失敗である。直す案は、`%` の直前の数を先に読み(`/(\d{1,3}(?:\.\d+)?)\s*%/`)、無ければ数だけの記載を読むこと。小数は読めないとして problems にするか、構成と同じ数で比べる。試験に「G-5 を含む記載」の場面を足す
- C-7(低): 由来の記録の無い旧い構成(coverageOrigin も coverageBaseline も無い)で、代償措置の 90 が coverageThreshold に入っている場合。契約検査は threshold(90)と比べる。様式は「90 は基準値に含めない」と書くので、企画書に 80 と書くと落ちる。行は新設なので、採用者が自ら記入するまでは起きない。出力の文も原因を示す。由来の不明な値はそのまま効かせる(ADR-0085)ので、比べる相手を threshold にすること自体は正しい。様式か出力の文に「由来の記録の無い構成では構成の値をそのまま書く」と添える余地がある
- check-g1: G-1 を通過済みの企画書で行が無ければ飛ばし、行があって説明のままなら失敗にする。後者は、採用者が行を写して空のまま置いた場合だけに起きる。範囲の行と同じ扱いで、不当ではない

## #330 の残り(ADR-0166・IMPL-0239・0234)

### (4) ADR-0166 と implementation-marking.md・ADR-0151・ADR-0084 の突合

- implementation-marking.md の adopter の要件: `decision=` は必須で、ADR-0166 を指している。理由と採用者に求めることは ADR の決定に書いてある(ADR-0084 より後の adopter は決定の ADR に記録する、の規則どおり)。規定は課したまま。`impl-no-adopter.yaml` の節には当たらない(ADR の記載と b12-08 の確認のとおり。lint:impl も通過)。矛盾は無い
- ADR-0084 決定4: ADR-0166 は「補い、置き換えない」と書く。採用済みの表を書き換えない規則に合う
- ADR-0151: 決定1(構成で選んだ未実施は失敗にしない)・決定3(課さないこと)と矛盾しない。ADR-0166 の決定3 は、入力の欠落による未実施(本文 gate-criteria「未実施の検査として失敗に数えなければなりません」、ADR-0077 の範囲)が検査器の実装に依る残りを、採用者に委ねる。本文に既にある義務であり、新しい義務ではない
- **C-3(中)**: 「採用者の G-5 の設定の責任者」は、本標準の役割の語彙(第3章)に無い。repo の中でも ADR-0166 と IMPL-0239・0234 だけが使う。adopter のマークで確かめる者が定まらないと、委ねた統制の担い手が読めない。IMPL-0312 に倣い「技術判断者」(G-5 の集約の定義を読む者)へ改めることを勧める。強制層の組み込みを担う者とするなら「AI維持管理者」にする。ADR は採用済みになると書き換えられないので、push の前に直すこと

### (5) test-g5-aggregate の失敗の切り分け

- template の作業ツリー(HEAD 258cf41)で 4/30 が NG: 「needs にあるジョブを消す」「continue-on-error を足す試験の目印」「continue-on-error のジョブ」「集約ジョブ gate-g5 が無い」
- `git archive e9f5590`(本差分の前)の写しでも、同じ 4 件が NG になった。**本差分によるものではない**
- 原因: `core.autocrlf=true` で `.github/workflows/gate-g5.yml` が CRLF で checkout される。試験の置換の正規表現(`\n {2}secret-scan:\n` など)が `\r\n` に当たらず、目印が働かない。HEAD の写しでワークフローの yml を LF に変えると、30/30 が通過した
- 扱い: CI(Linux、LF)では起きない。直すなら試験の側で、読んだ直後に `\r\n` を `\n` へ揃える(template の別の Issue へ寄せる)。本件の阻害要因ではない

## 推奨の直し(1巡目)

1. C-1: IMPL-1001 の `issue=` を open の Issue へ付け替える(寄せ先へ受け入れ条件の案をコメントで足す)。または、数えないことを決めたのなら、ADR で決めて `plan=adopter` へ移すか、条項の側を改める。範囲外と書いたまま #337 を予定の Issue として表示し続けない
2. C-2: 基準値の読み方を `%` の直前の数を優先する形へ改め、試験の場面を足す
3. C-3: ADR-0166 と IMPL-0239・0234 の「確かめる者」を、既存の役割名へ改める(push の前)
4. C-4〜C-7: 本文の限定、note の試験の所在、IMPL-0262 の句点、旧い構成の案内。編集の水準
