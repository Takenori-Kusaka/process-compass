# 束 B26 後半 独立の突合 1巡目(U1〜U3 の全体)

- 日付: 2026-11-20
- 対象: template `31e783a..b26`(1ca7be2)、本体 `32a40205..HEAD`(b2eaf610)の `src/`・`scripts/`・`package.json`
- 読んだ順: 差分 → 条文とマーク → 書式(implementation-marking.md)→ ADR → 裁定(intake-2.md §1.1〜1.3・1.6・1.7、326-deliberation/b26-ruling-6-9.md)→ 実装の記録(impl2-a.md・impl2-b.md)
- 直していない。作業ツリーは、突合の後に template・本体とも空(壊して確かめた箇所はすべて戻した)

## 件数

| 重大度 | 件数 |
| --- | --- |
| 高 | 1 |
| 中 | 2 |
| 低 | 6 |

## 所見

### 高-1 部分一致の限界の開示が逆向きを落とし、関数のコメントが実態と食い違う(表示と実態の食い違い)

- 所在
  - template `scripts/gate/aggregate-evidence.mjs` の `declarationDrift` の JSDoc(差分で書き換えた段落)。「版の違いは、記録が宣言の一部分に当たらないときだけ検出する」
  - 本体 `src/content/docs/phase4-process-design/roles-responsibilities.md` の 3.13.5 の行。「記録が宣言の一部分に当たる場合(版を含まない記録、版の一部だけの記録、宣言の文字列に含まれる短い名)は通すため、版の違いを検出しない」
  - 同 IMPL-0023 の note、`human-ai-boundary.md` の IMPL-0177 の note の括弧(「記録が宣言の一部分に当たる場合は通す」)
- 根拠: 照合は `norm(c).includes(m) || m.includes(norm(c))` で、**宣言が記録の一部分に当たる場合も通す**。直す前の 3.13.5 は「名称だけの宣言では、版の違いを検出しない」と、この向きを開示していた。今回の書き換えでこの向きの開示が消えた。関数のコメントの「だけ」は偽になった
- 再現(関数を直接呼んだ。一時のスクリプト。作業ツリーの外)
  - 宣言 `claude-opus-4`・記録 `Claude Opus 4.5 <…>` → ずれ 0 件(版が違い、記録は宣言の一部分でない)
  - 宣言 `claude`・記録 `Claude Opus 4.5 <…>` → 0 件(既存の固定の試験もこれを通すと固定している)
  - 宣言 `claude-opus-4-5`・記録 `Claude Opus 4.6 <…>` → 1 件(どちらの一部分でもないときだけ検出する)
- 裁定との突合: b26-ruling-6-9 §2.1 項目7 は「3.13.5 の行・関数のコメント・IMPL-0023・0177 の note を実態に合わせる(編集)」。書き換えは片方の向きだけを足し、もう片方を消したため、実態から遠ざかった
- 直しの案(編集。判定は変えない): 2つの向きを併記する。例「記録が宣言の一部分に当たる場合(版を含まない記録、版の一部だけの記録、宣言の文字列に含まれる短い名)と、宣言が記録の一部分に当たる場合(名称だけの宣言、版の一部だけの宣言)は通すため、版の違いを検出しない。版の違いを検出するのは、どちらの一部分にも当たらないときだけである」。関数の JSDoc、3.13.5、IMPL-0023・0177 の note を同じ文にする。試験の固定に「宣言 claude-opus-4 は記録 Claude Opus 4.5 を通す」を足すと、文と挙動の対応が試験に残る

### 中-1 IMPL-0761 の試験が入口(集約)を通さず、結線を壊しても名指した試験が通る

- 所在: `tailoring-guide.md` の IMPL-0761(`state=delivered check=machine test=template/scripts/gate/test-safety-record.mjs target=evidence-aggregation`)。試験の追加分(`// IMPL-0761:ng`・`:ok`)は `checkSafetyRecord` を直接呼ぶ
- 根拠: implementation-marking.md「規定が入口(コマンド・スキル)についてのものなら、関数を直接呼ぶ試験では足りない。入口を通す試験を名指す」。IMPL-0761 は G-7 の判定基準の規定で、降ろし先は集約(aggregate-evidence.mjs 3387 行の `checkSafetyRecord({ root: ROOT, config, day })`)。`test-safety-record.mjs` は集約を起動しない(`spawnSync`・`aggregate-evidence` の参照なし)
- 再現: 集約の呼び出しを `config: { ...config, gates: {} }` に一時的に書き換え(g7 の値を集約が渡さない状態)、`test-safety-record.mjs`(95 件一致)・`test-aggregate-records.mjs`(222 件一致)・`test-aggregate-wiring.mjs`(61 件通過)がすべて通った。戻した
- 補足: 同じ試験の形は既存の IMPL-1007 も同じ(集約の結線は B26 以前から在る)。実装の挙動は正しい(現物の集約は構成をそのまま渡す)。食い違うのは「試験が確かめていること」の範囲で、impl2-a.md の「入口を通す試験の足りない点は無い」は、この点で事実と合わない。lint:impl は要件1〜3 の機械の確かめだけなので通る
- 直しの案: 集約を作業ツリーの写しで起動する ng/ok を足す(構成 g7 の `safetyVerificationRecord: required`・D-0 の Q1 いいえ・CL1・記録なし → 記載の欠落に「安全関連部の検証の記録(基準7)」が出る。値が無い → 出ない)。`test-aggregate-drift.mjs` の `runWith` の型が使える

### 中-2 非 ASCII の名(日本語の名など)の共著者は、どの宣言とも一致したとみなされる(開示の欠け)

- 所在: `declarationDrift` の `norm`(`[^a-z0-9]` を除く)。3.13.5 の行と IMPL-0023 の note の「通す場合」の列挙
- 根拠: 名称の部分が英数字を持たない記録は `norm` が空文字になり、`m.includes('')` が真になる。差分の前からの挙動だが、今回の書き換えは「通す場合」を列挙する形になり、この場合が列挙に無い。「人の共著者を検出することがある」は残るが、日本語の名の人の共著者は検出しない
- 再現: 宣言 `claude-opus-4-5`・記録 `山田 太郎 <taro@example.com>` → 0 件。記録 `<x@y>`(名の無い記録)→ 0 件
- 直しの案: 判定を変えない(裁定の採らない案「部分一致を厳密一致やトークンの比較へ変える」に触れない)なら、開示に「名称の部分に英数字を持たない記録(日本語の名など)は、どの宣言とも一致したとみなす」を足す。空の正規化を不一致とする判定の変更は、軽の審議に掛ける

### 低-1 IMPL-0177 の note の「トレーラ Agent-Run の無いコミットは検出しない」が、0177 の検出の範囲と合わない

- 所在: `human-ai-boundary.md` IMPL-0177 の note
- 根拠: 0177 の警告(宣言に無い共著者)は `observedCoAuthors`(期間の全コミットの共著者。aggregate-evidence.mjs 5159 行)を照らし、Agent-Run の有無を見ない。Agent-Run を持たず共著者を持つコミットは検出する。検出しないのは「Co-Authored-By も Agent-Run も無いコミット」である
- 直しの案: 「Co-Authored-By の無いコミットは、Agent-Run を持つものだけを IMPL-1033 が警告し、Agent-Run も無いコミットは検出しない」とする

### 低-2 IMPL-0653 の note を直した文が、比べる意味を失っている(裁定の外の直し)

- 所在: `roles-responsibilities.md` IMPL-0653 の note。「IMPL-0771 は構成のゲートのキーと判定基準の存在を別の検査で運ぶ[束 B26 で降りた]。本マークとは向きが異なる」
- 根拠: 元の文は「規定の半分を別の検査が運ぶ0653 は delivered、経路の無い0771 は undelivered」という表示の向きの対比だった。0771 が delivered になったので、「向きが異なる」は成り立たない。事実の誤りではないが、読み手は何と何の向きかを読めない。IMPL-0933 の直しは現物(check-safety-record.mjs 227 行)と合う
- 直しの案: 0771 への言及を除く(対比の役が終わった)。または「(IMPL-0771 は束 B26 で降りた)」だけにする

### 低-3 IMPL-0761 の note の「7.3 の例外承認では受けない(ADR-0153 決定2)」の根拠の引き方

- 所在: `tailoring-guide.md` IMPL-0761 の note(裁定 intake-2 §1.2 の方針の3問 (2) の写し)
- 根拠: ADR-0153 決定2 は 7.4 の表の対象(G-4・G-5 の判定、認証・認可・データ保全の検証)を実施しないまま進める用途を禁じる。F.7 の記録(G-7 基準7)はこの列挙に無い。第4章 G-7 の「基準7 の例外承認は、第7章 7.3 と ADR-0153 のとおり」は、実施した検証が基準を満たさない場合に 7.3 を用いることを妨げない読みを残す。実装は、基準7 の欠落を台帳の行で解く経路を持たない(集約が gaps へ直接積む)ので、挙動は note のとおり「受けない」で、標準より厳しい側にある
- 直しの案: 「集約は基準7 の欠落を例外承認の行で解かない(実装の選択。標準の扱いは 7.3 と ADR-0153 のとおり)」と、実装の事実と標準の根拠を分けて書く

### 低-4 `gateCodeOf` の正規化の外れ(逆引用符・中の空白・小文字の g・U+2010)と、置き場の値の扱い

- 所在: template `scripts/init/generate-profile.mjs` の `gateCodeOf`
- 再現(関数の本文を取り出して直接呼んだ)
  - `` `価値責任者の調整` `` → 逆引用符つきのまま。`価値責任者の 調整`・`g-4`・`G‐4`(U+2010)は、それぞれ別の code になる。決定の後に揺れた書き方で記録し直すと欠落が解けない(閉じる側に倒れる。偽の通過は出ない)
  - `<ゲート>`・`(未記入)` は値そのものが code になる。様式の置き場のまま残った2つの記録の一方が決定待ちの間、他方が決定の後にあると、欠落が解ける(開く側。置き場のままの記録は他の検査で落ちる見込みだが、この関数の中では止めない)
  - 確かめて問題の無かった点: 全角・前後の空白・強調(`**`・`_`)は同じ code。`G-4 再判定`・`G-4: 機能仕様承認`・`Ｇ－４` は `G-4`。`G-4` と `G-12`、`SG` と `SG-1` は別。空・空白だけ・`**` だけは null(解けない)。決定の前の記録し直し(区間の中)は解かない。日付だけの記録が決定の日と同じ日なら「後」に数えない(既存)
- 直しの案: 記入でない値(config.mjs の `isFilledValue` と同じ判定)は null にする。逆引用符も前後の除去に含める。どちらも軽の範囲

### 低-5 IMPL-1033 の ok の場面が「Agent-Run の無い実行」だけ

- 所在: `test-aggregate-drift.mjs` の `IMPL-1033:ok 通し(ok)`
- 根拠: 規定の適合の入力は「Agent-Run を持ち、版を含む共著者のコミット」である。通しの ng の実行(withRuns)にはこの形のコミット c が入っており、件数が1件ずつで c を数えないことは間接に確かめているが、ok の目印は、そもそも数える対象の無い実行に付いている
- 直しの案: Agent-Run と `Claude Opus 4.5 <…>` を持つコミットだけの実行で、警告の行が出ないことを ok の目印にする

### 低-6 行B の名称の部分の切り出しの境界

- 所在: `agentRunModelIdGaps` の `/<[^>]*>/g`
- 再現: `Claude <x1@y`(閉じの `>` を欠く記録)→ メールの数字で行B を通る。`Claude <1234+x@users.noreply.github.com>`(閉じあり)→ 行B に数える(正しい)。名に数字のある人(`Taro2`)、複数の共著者のどれか1つに数字 → 通る(開示のとおり)。Agent-Run が空の値 → 数えない(git がトレーラとして読まないため。開示の「Agent-Run の無いコミット」に含まれる)。トレーラの大文字小文字(`Co-authored-by`)→ 読む(通しの試験で確かめた)
- 直しの案: 閉じの無い `<` から後ろも除く(`/<[^>]*(>|$)/g`)。開示で足りるなら直さない

## 確かめて所見の無かった点

- **安全の記録の適用**(check-safety-record.mjs): 構成の値が `required` のときだけ和として足す。Q1 いいえ・CL1・値なし/`none`/`optional`/`null`/`true`/`'Required'`/配列 → 適用外のまま(文字列の完全一致)。Q1 はい・CL2 以上は値に依らず適用。Q1 または区分を読めない → 適用。`buildConfig` は規則 r-e-cl2 の値を `gates.g7.params.safetyVerificationRecord` に置く(generate-profile.mjs 833 行、KB の `g-ship` → `g7`)。純関数の `required` は真偽値だけを受ける(呼び出し側が変換する)
- **契約検査の知識ベースに無いゲートのキー**: KB の gates は8つ(G-1〜G-8。SG は gates に無い)。template の `process.config.json` のキーは g1〜g8。profiles に構成は無い。試験の fixture・本体のコードに g1〜g8 以外のゲートのキーを持つ構成は見つからなかった。旧い形式からの移行でキーを付け替える処理も見つからなかった。偽の失敗の経路は見つからない。なお、手で足したキーは既存の「変化点の記録を経ずに書き換えられています」でも落ちる(新しい検査は理由を名指す側の守り)
- **本体の check-gate-criteria**: 現在の知識ベースで通る(8ゲート / 45件)。知識ベースへ GATE_IDS に無いゲートを足すと・判定基準を空にすると落ちる(試験が `--kb` の写しで入口を通して確かめる。写しは gitignore の `tmp/`)。`test:criteria` は `npm run check` に入っている
- **IMPL-0954 の集約の側**: aggregate-evidence.mjs と config.mjs に、ゲート欄の値が未知であることを欠落に数える処理は見つからなかった(読みによる。実行では確かめていない)。test= が /pit の側の試験で、集約の側の試験を note で名指す形は、裁定 intake-2 §1.1 のとおり
- **D-0 節5 の引用の範囲**: 第4章「2つの時刻を分ける」(gate-criteria.md 2440 行)は実在する。文は IMPL-0979 の note の読みと合う。`npm run test:fields` は通る
- **触ってはならないファイル**: config.mjs・check-pr.mjs・gate-g5.yml・g5-aggregate.mjs は、template・本体のどちらの差分にも無い
- **細かい定義**: 新しい欄・印・語は足していない。`knownGateKeys` は既存の写像 `GATE_BY_KEY` のキーを出すだけ

## 壊して落ちることの確かめ(すべて戻した)

| 壊した箇所 | 結果 |
| --- | --- |
| verify-gate-contract.mjs の知識ベースに無いキーの判定を無効化 | test-adoption.mjs が 2 件落ちる |
| aggregate-evidence.mjs の `modelIdGapLines(...)` の `warn` の行を除く | test-aggregate-drift.mjs が 3 件落ちる |
| aggregate-evidence.mjs の `modelIdGaps: agentRunModelIdGaps([])` | test-aggregate-drift.mjs が 4 件落ちる |
| generate-profile.mjs の `gateCodeOf` を旧い `?? null` に戻す | test-loosening-decider.mjs の関数の ok と入口の ok の2件が落ちる |
| aggregate-evidence.mjs の `checkSafetyRecord` へ渡す構成から gates を除く | **どの試験も落ちない**(中-1) |
| 本体 check-gate-criteria.mjs の GATE_IDS の判定を無効化 | test-gate-criteria-yaml.mjs が落ちる |

## 流した試験

- template: test-loosening-decider(すべて通過)・test-safety-record(95 件一致)・test-adoption(123 件一致)・test-next-records(142 件一致)・test-aggregate-drift(43 件一致)・test-aggregate-records(222 件一致)・test-aggregate-wiring(61 件通過)
- 本体: `node --test scripts/test-gate-criteria-yaml.mjs`(1 件通過)・`node scripts/check-gate-criteria.mjs`(終了コード 0)・`npm run -s lint:impl`(終了コード 0)・`npm run -s test:fields`(通過)・`npm run -s lint:refs`(通過)
- `npm run -s impl:issues`: issue= を持つマーク 26 件、すべて open の Issue。**#326 に残るマーク 0 件、#443 に残るマーク 0 件**。IMPL-0145・IMPL-1034 は #361(#361 は 12 件)

## 2巡目へ渡す点

- 高-1 を直した差分(JSDoc・3.13.5・IMPL-0023・0177 の文)と、中-1 の試験を足した場合はその試験の入口の結線だけを見る
