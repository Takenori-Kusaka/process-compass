# #438 実装の記録

- 日付: 2026-11-11
- 入力: `decision.md`(議長の裁定。軽)、`survey-438.md`、`council-01-drafter.md`、`council-02-opponent.md`
- ADR: ADR-0118(main の最大値 ADR-0117 を確かめてから振った)

## 1. 理由の無い除外の印の欠陥(裁定3)

- 判定を `scripts/lib/exempt-marks.mjs` へまとめた。`markReason(line, name)` は印の後ろから HTML コメントの閉じ(`-->`)か行末までを理由として取り、空なら無効とする
  - `check-tone.mjs:40` の `TONE_OK = /<!--\s*tone-ok:/` を `hasToneOk` に替えた。HTML コメントの中の印だけを数える点は元のまま
  - `check-provisions.mjs:78` の `hasMark` を共通の関数に替えた。同じ関数を `provision-ok` も使うため、`<!-- provision-ok: -->` も無効になる(同じ欠陥であり、分けて残す理由が無い)
  - 元の正規表現の `[::]` は ASCII のコロンが2つで、全角のコロンを受けていなかった。新しい判定も ASCII のコロンだけを受ける(挙動を広げない)
- 試験 `scripts/test-provisions.mjs`(`npm run test:provisions`)を足し、`npm run check` の `lint:provisions` の直後へ入れた
- **直す前のコードで落ちることの確認**: 試験の写しを、直す前の2行(`check-provisions.mjs:78` と `check-tone.mjs:40` をそのまま写した `old-marks.mjs`)に向けて実行した(スクラッチパッド `p438-old/`)。結果は 22 件中 16 件の合格。落ちたのは次の5件(と、区画を足す前の登録簿の1件)
  - 理由の無い tone-ok は除外しない
  - 理由が空白だけの tone-ok は除外しない
  - 理由の無い retired-ok(HTML コメント)は除外しない。閉じの - を理由に数えない
  - 理由の無い provision-ok は除外しない
  - 理由の無い variant-ok は除外しない
  - 「理由の無い retired-ok(行末のコメント)」は直す前も通った。反対の委員の表の3行目(`x # retired-ok:` は除外されない)と一致する
- 既存の本文・規則データ・準拠テンプレートに、理由の無い印は無かった(`grep` で確認)。修正で新たに落ちる行は無い

## 2. 異表記の区画(裁定2・4)

- `src/data/provision-forms.yaml` に `variantForms` を足した。項目は `variant`(正規表現)・`correct`・`by`・`specs`(`hit`・`miss`)
- 登録は ADR-0027 の名称の4項目だけ(裁定4)

| 項目 | 異表記 | hit | miss |
| --- | --- | --- | --- |
| 使わない語 | `統合プロセス` | 2 | 3(「ピットイン方式参照モデル」、「統合するプロセス」、ゲートの状態の「統合」) |
| 通称 | `ピット[・･ 　]+イン` | 2 | 2 |
| 英語表記 | `\b(?:Pit[- _]?[Ii]n\|PIT[ _]?IN\|PIT-[Ii]n\|pit ?in)\b` | 5 | 4(`PIT-IN`、`pit-in-template`、`<!-- pit-in:g6-test-coverage -->`、`pitino`) |
| 正式名称 | `AI` の後の空白・全角の `ＡＩ`・「ソフトウエア」 | 3 | 2(正表記、附属書G の「AI 協調型開発に固有です」) |

- 英語の小文字の `pit-in` は、準拠テンプレートの識別子(`pit-in-template`、`pit-in:g6-test-coverage`、一時ディレクトリの接頭辞、`pit-in-bot`)に多数あり、ADR-0027 がリポジトリ名として定めた表記である。対象の外とし、`miss` で固定した
- 検査15(異表記)は `retiredScan` と同じ置き場を探す。除外の印は `variant-ok: 理由`。検査16(異表記の登録)は自己試験・正規表現・`by` の ADR の実在を確かめ、合わない項目を検査15 に使わない
- 既存の本文の違反: **0 件**(341 ファイル)。直す箇所も除外も要らなかった
- 端から端の確認: 一時の頁(`src/content/docs/community/zz-tmp-438.md`。確認の後に消した)に、異表記・理由の無い `variant-ok`・理由のある `variant-ok`・理由の無い `retired-ok`・理由の無い `tone-ok` を置いて実行した。理由のある行だけが除外され、ほかはすべて検出された

## 3. 文書(裁定2)

- 第1章 1.7.4: 異表記の検出、自己試験、名称だけを登録していること、理由の無い印を無効とすることを足し、ADR-0118 を引いた
- `community/provision-forms.md`: 検査の表に15・16、登録簿の表に `variantForms`、節「異表記の登録」、除外の印の表に `variant-ok` と理由の無い印の扱いを足した

## 4. ADR-0118(裁定1・5・6)

- 道具の選定(日本語に Vale を入れない)、異表記の区画、除外の印の修正、登録は決定のある語だけ、英語の検査は `locales.en` を足すときに選び直す(Vale を候補に含める)
- 採らない案は裁定の表の5案に、委員が挙げた「`lint:tone` を Vale へ移す」「異表記を `retiredPhrases` に混ぜる」「英語の頁が無いうちに英語のスタイルを配備」を足し、provision-forms.md「却下した案ごとに、残す形を決める」に従って残す形の列を置いた
- 反対の委員の案 E(形態素解析)は、裁定に無いため ADR に書いていない

## 5. 台帳と知識ベース

- `npm run evidence:write`・`impl:write`・`scope:write`: 差分なし
- `npm run template:kb`: 差分は `source.commit` の1行だけ(本体の中身は変わらない)。`npm run test:template` は、この1行を戻した状態で「一致しています」。中身の差分が無いので、template への複製・push と submodule の更新は行わなかった

## 6. 行わなかったこと

- 裁定4 の「用語の一覧の決め方を #328 へ論点として足す」コメントは、本実装では書いていない(GitHub への書き込みは呼び出し側の判断に委ねる)

## 7. 確かめたこと

`package.json` の `check` の段を1つずつ実行した(Windows、2026-11-11)。

- 通過: lint:ci・lint:text・lint:tone・lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・test:provisions・lint:dekimasu・test:dekimasu・lint:skills・lint:figures・brand:check・lint:sources・lint:citations・test:citations・test:edition・lint:registry・test:registry・test:engine・lint:stage-table・test:impl・test:ci-wiring・test:template・test:fields・test:criteria・build
- 落ちた(Windows で落ちる既知の2段。本件の変更は準拠テンプレートと回帰の試験に触れていない)
  - test:template-suite: `scripts/gate/test-g5-aggregate.mjs` が終了コード 1
  - test:regress: `AssertionError: unknown flag: --regress-probe`
