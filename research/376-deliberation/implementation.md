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
