# #330 準拠テンプレート T-1〜T-8 の実装の記録(束 B12)

日付: 2026-11-17。指示書: b12-03-ruling-proposal.md(末尾の「5. 議長の裁定」が優先)。

## template のコミット(origin/main の上、先行の b5bfc6d の上に積んだ)

| コミット | 内容 | bundle |
| --- | --- | --- |
| 6a7adf2 | T-8 | template-b12-330-01.bundle |
| fce8273 | T-1〜T-7 | template-b12-330-02.bundle |

先行のコミット(本体 9d33938d、template b5bfc6d)は書き換えていない。

## 変えたファイル(template)

- T-8: 新規 `scripts/gate/license-scan-record.mjs`(純関数 `buildLicenseScanRecord`)、`gate-g5.yml` の記録の段を差し替え、`aggregate-evidence.mjs` に `licenseScanStatus` を足し、4か所(欠落・項目4・G-7 基準8 の行・「記録」の節)を読み替え。新規 `test-license-scan.mjs`(27 件。contract へ結線)。
  - 議長の裁定のとおり、構成で選んだ未実施(コマンドが空・対象なし)は記載の欠落に数えない。欠落にするのは license-scan.json が無いときだけ。反転は `aggregate-evidence.mjs` の条件1つと `test-license-scan.mjs` の「欠落にしない」2件。
  - `licenseScanStatus` は `chosen`(構成で選んだ未実施か)も返す。基準8 の行は chosen のとき「なし(構成で選んだ未実施。記録の有無だけを見た)」と出す。
- T-1/T-2: 新規 `unrun-streak.mjs`(`unrunStreak`・`computeUnrunStreaks`・`isUnrunValue`・`streakText`)。項目6 の `unmeasuredStreak` は同じ関数への薄い包みにした(挙動は変えない)。`machineChecks.unrunStreaks` を足し、品質レポートの項目4 の6行に ` / 起点 の出荷から N 回連続` を添える。新規 `test-unrun-streak.mjs`(31 件。contract へ結線)。
- T-3: `adapter.mjs` 冒頭の注釈を、段ごとの扱い(任意は通す・必須は失敗・coverage は adapter が通し coverage-check.mjs が失敗)へ改めた。coverage は OPTIONAL から外していない。
- T-4: `test-adapter.mjs` に節5(IMPL-0992:ok/ng、終了コードの伝播)。66 件。
- T-5: `test-g5-aggregate.mjs` に、対象なしの項目4 の固定(4検査は「未実施(検査対象が存在しない)」、秘匿情報は出ない)。IMPL-0239 は undelivered のまま。
- T-7: `test-g5-aggregate.mjs` に setup-stack の install の段に continue-on-error が無いことの構文の検査。IMPL-0234 は undelivered のまま。
- T-6: `README.md` の「言語に依存しません」の節の後に小節。7アダプタの表(コマンドの文字列は写さない。正は adapters/*.json)。試験は足さない。

## 本体の変更

- `gate-criteria.md`: IMPL-0995・IMPL-0992・IMPL-0993 を delivered/machine(test= を template の試験に)。plan・issue・review を外した。IMPL-0239・IMPL-0234 の note を改めた(undelivered のまま)。IMPL-0046・IMPL-1009 の note から「空のコマンドでも記録ありと数える」を削り、EV-0293 の対象の文を直った旨へ改めた(識別子・期限は変えない)。
- `template-repository.md`: 括弧「現在の準拠テンプレートは実施(success)と記録し…」を削った。
- `src/data/impl-untraced.yaml`: 逆向きの追跡のため、`unrun-streak.mjs`(library)と `license-scan-record.mjs`(infra)を登録した。指示書に無いが、`lint:impl` の逆向きの追跡が新規ファイルを要求するため必要。
- `npm run impl:write`・`evidence:write`・`scope:write` で台帳を再生成。`template:kb` は規則データを変えていないため差分なし(生成物の source.commit だけが変わるので、template 側へは取り込まず元へ戻した)。
- 新しい IMPL・EV の番号は使っていない(既存の番号のみ)。

## 指示書と違えた点・対処

- 指示書 T-8 の「phaseStatus が `未実施` で始まる → 常に phaseStatus」を、構成の理由(コマンドが未設定 / 検査対象が存在しない)の場合に限った。集約が ip-clearance を合否に使っていない場合は、従来の文(記録はあるが…)を保つ(従来の文を変える試験・利用が無いが、記録の有無を添える文を失わないため)。
- ADR-0151 は書き換えていない。T-1〜T-8 の記録は本ファイルに置く(implementation.md への追記は議長が必要なら行う)。

## 試験の結果

- test-license-scan 27 件、test-unrun-streak 31 件、test-adapter 66 件、test-coverage-scope・test-aggregate-records・test-aggregate-drift は通過。
- test-g5-aggregate は 4 件が落ちる(「needs にあるジョブを消すと…」「continue-on-error を足す試験の目印がある」ほか)。先行の b5bfc6d を取り出して流しても同じ 4 件が落ちるため、CRLF による既知の偽の FAIL であり、今回の変更によるものではない。追加した項目(T-5・T-7)は通過。
- 本体 `npm run check`: 末尾の追記を参照。

## 採らなかったこと(再掲)

- coverage の OPTIONAL からの除外、継続期間の閾値・差し戻し、対象なしの記録の経路の新設、IMPL-0234・0239 の delivered 化。

## 本体 npm run check の結果(追記)

template の試験一式を含め、落ちたのは test-g5-aggregate.mjs(4 件)と test-discouraged-evidence.mjs(2 件。D-0 の表へ行を書き込む前提)の 2 本だけ。どちらも先行の b5bfc6d を取り出して流しても同じ件数が落ちる(Windows の CRLF による既知の偽の FAIL)。今回の変更によるものではない。
