# #333 直し(1巡目)

作成日 2026-11-15。独立の突合 1巡目(`review-round1.md`。高3・中9・低5)に対する、議長の裁定のとおりの直し。template は `02a6aee`(bundle 06)と M-8 の1コミット(bundle 07)、本体は本コミット。push していない。`npm run check` の全量は流していない。

## 議長の変更の記録

- `decision.md` の「成果物には `retention-days: 90` を明示」を改めた(M-7)。明示しない。成果物はリポジトリの保持の設定に従う一時置きで、保管ではない。理由: 保持を 90 日より長くしているリポジトリで短縮になる。ADR-0135 の「採らなかった案」に行を足した

## 所見ごとの対応

| 所見 | 対応 | 直す前 → 直した後 |
| --- | --- | --- |
| H-1 | 直した | 前回の実行の成果物を取れないと `bash -e` が手順を終え、写しを読まなかった → 取得を `if gh run download …; then … else warning` で受け、`evidence-manifest.mjs previous` が写しを digest の一覧と照合して読む。一致しない写しは読まず理由を警告に出す。読める写しが無いときは見た場所と理由を警告と `evidence/previous-source.json` に出し、集約が `evidence.json` の `previousSource` と「前回なし(…)」に出す(M-3 も同時に解消) |
| H-2 | 直した | 欠落に数えることは文の関数とソースの正規表現でしか確かめていなかった → 集約を偽の gh で通しで動かす試験(`test-g5-missing.mjs`)。写しが success でも欠落に数え充足に数えないこと、ホスティングの成功は欠落にならないこと、failure は failure として数えること、書き分け3通りを確かめる。偽の gh を差せるよう、`gh()` に環境変数 `AGGREGATE_GH_FAKE` の継ぎ目を足した(未設定なら従来どおり gh。設計の変更ではなく試験の継ぎ目) |
| H-3 | 直した | 追加だけ・出荷の PR 以外・一式の存在を試験が確かめていなかった → verify の一式の検査を `evidence-manifest.mjs changes`(関数 `evidenceChangeProblems`)へ出し、ワークフローがそれを呼ぶ。出荷の PR に一式の置き場が無い・`evidence.json`/`manifest.json` を欠く場合も失敗にした(「写しの存在」をコードに足した)。手順の本文を取り出して git の一時リポジトリで動かす試験(`test-ship-evidence-steps.mjs`)と、関数の入出力の試験(`test-evidence-manifest.mjs`) |
| M-1 | 直した(表示) | 一覧は自己整合しか示さないことを、`evidence-manifest.mjs` の冒頭・ADR-0135 決定1・IMPL-0521 の note・ci-gates.md・PR 本文へ書いた。出荷の PR へ入る前の差し替えは検出しない・`ship-evidence-verify` は必須チェックではない、も書いた。再集約との突き合わせは足さない(裁定の範囲外) |
| M-2 | 直した | `--range`・`--target` の引数をやめ、置き場の `evidence.json` の `range`・`toCommit` から取る。取れなければ null |
| M-3 | H-1 と同時 | 読む前に置き場を verify し、不一致は警告で読まない。新しい側が壊れていれば古い側を読み、壊れていた側を警告に出す |
| M-4 | 直した | `dependency-diff` の取り込みを外した(両ジョブ)。ADR 決定4・注記・ci-gates.md に、push の実行には無いため取り込まないと書いた |
| M-5 | 直した | EV-0261 の「確かめたのは」を、実際に確かめた範囲(集約の通し、手順の本文の偽の gh による実行、公式の文書)へ書き直し、確かめていない点(実機、record-copy が読めなくても失敗しないことは文字列の確認まで)を書いた |
| M-6 | 直した | ADR-0135 決定2: 2点目を「準拠テンプレートが写すものの一覧。保管の対象に含めるかは採用者の規程による(既存の規定が挙げるのは…)」、3点目を「引き渡すときは digest の一覧を照合に使える。要否は本 ADR が求めない」へ。新しい義務を置かない側。IMPL-0243 の note も同趣旨 |
| M-7 | 直した | `retention-days: 90` をやめた。ワークフローの注記・ADR・ci-gates.md・IMPL-0521・impl-inventory/targets の文言を「設定に従う一時置き」へ。`workflowProblems` は、明示を問題として返す向きに反転した(試験も反転) |
| M-8 | 直した(template 07) | 事象4 の所見の文に「「検証方法と結果」の有無は今の本文で数えており、写しの本文では数えない」を足した |
| M-9 | 直した | IMPL-0246 の `test=` を、取り込みの手順の本文を動かす `test-ship-evidence-steps.mjs` へ移した(headSha 一致・不一致・view 失敗・license-scan 欠落でも coverage-result へ進む、を確認)。取り込みは license-scan の成否と独立にした。開示の文は `test-coverage-scope.mjs` が確かめるが、`test=` に含めないと note に書いた。state は `delivered`・`check=machine` のまま |
| L-1 | 直した | ship-evidence.yml の冒頭の注記に、今回足した手順も実機で未確認と書いた |
| L-2 | 直した | 写しの `conclusion` が null のとき文に状態(`status`)を出す。record-copy の jq は完了した check run を優先して選ぶ(完了が無ければ従来どおり)。 |
| L-3 | 直した | PR 本文の「複製 N 件」から一式のファイル数を外し、一式の行にファイル数を別に出す |
| L-4 | 直した | SRC-0747 に claims c2(公開 1〜90 日・非公開 1〜400 日。抜き書きは research-supplement.md 1 の表と同じ) |
| L-5 | 範囲外 | 今回の差分より前からの `${{ github.ref_name }}`(ship-evidence.yml の「出荷のブランチを push し…」の手順 `to="${{ github.ref_name }}"`)、`${{ inputs.from }}`(集約の手順の `format('--from {0}', …)`)のシェルへの直接展開。**既存の open の Issue へ足す候補**(議長が扱う) |

## ワークフローのシェルの確認(H-1)

- URL: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax(`jobs.<job_id>.steps[*].shell`)。確認日 2026-11-15
- 内容: `shell` を指定しない `run` は、非 Windows で `bash -e {0}`。`shell: bash` と明示したときは `bash --noprofile --norc -eo pipefail {0}` で、別のコマンド。失敗するコマンドで手順は終わる(`-e`)ので、失敗は `if`・`||` で明示して受ける。試験も `bash -e` で動かす
- 取得にはページの先頭 100000 字のみを読んだ(該当の表は範囲内)

## 流した試験

- `test-evidence-manifest`・`test-ship-evidence-steps`(新規 21 件)・`test-g5-missing`(集約の通し 5 場面を追加)・`test-aggregate-records`(135)・`test-records-history`(44)・`test-base-judge-workflow`(127)・`test-coverage-scope`(68)・`test-records`(93)・`test-next-records`(88): すべて通過(node 26.13、Git Bash。`test-g5-aggregate` は流していない。作業ツリーの CRLF で 4/23 が落ちると突合が確認済み)
- 本体: `impl:write`・`evidence:write`・`lint:impl`・`lint:refs`・`lint:evidence`・`lint:scope`・`lint:sources`・textlint(ADR-0135・ci-gates.md・gate-criteria.md): 通過

## 実装を壊すと試験が落ちること(H-2・H-3)

`scratchpad/mutate333.mjs` で、実装を1か所だけ壊して試験を流し、元へ戻した(結果は同ディレクトリ `mutate333.out`)。

| 壊し方 | 落ちる試験 |
| --- | --- |
| 写しの success で g5 を充足に数える(別の行に足す) | test-g5-missing(落ちる) |
| 写しに結論がある PR を欠落に入れない | test-g5-missing(落ちる) |
| 書き分けをやめる | test-g5-missing(落ちる) |
| `gaps.push` を外す | test-g5-missing(落ちる) |
| headSha を読むが比べない | test-ship-evidence-steps(落ちる) |
| verify の `changes` の呼び出しを外す | test-ship-evidence-steps・test-evidence-manifest(落ちる) |
| 前回の証跡の写しからの読みを外す | test-ship-evidence-steps(落ちる) |
| 成果物の取得失敗で手順が終わる | test-ship-evidence-steps(落ちる) |
| 追加以外の変更・出荷の PR 以外・一式の欠け・digest の不一致を失敗にしない(4通り) | test-evidence-manifest・test-ship-evidence-steps(落ちる) |
| 一式を `git add` しない | 試験は落ちない(後述)。文字列の確認(`workflowProblems`)を足した。実際の PR で一式が無ければ verify が失敗にする(「一式の欠け」の試験で確認) |
| record-copy が check run を読めないと手順が失敗する(`exit 1`) | **落ちない**(`jq` が無く手順を動かせなかった。静的な正規表現のまま)。IMPL-0244 の note に「確かめない」と書いた |

## 確かめていない点(note へ書いた)

- record-copy が check run を読めなくても失敗しないこと(文字列の確認まで)
- ワークフローの一式の `git add`(verify の「一式の欠け」で間接に閉じる)
- 実機の GitHub での挙動(EV-0261)
- 出荷の PR は一式を欠くと verify が失敗する。この規則の追加により、一式の欠けた旧い出荷の PR を再検査すると失敗する(裁定の「写しの存在をコードに足す」の帰結)

## 裁定に無い設計の変更の有無

- 継ぎ目 `AGGREGATE_GH_FAKE`(試験用。未設定なら従来どおり)を足した。必要だと判断した。議長の確認を求める
- verify の検査を、ワークフローの `case` から関数・CLI(`changes`)へ移した。H-3 の直しの案(1)のとおり。`evidence-manifest.mjs verify` はワークフローから呼ばなくなったが、CLI には残した
