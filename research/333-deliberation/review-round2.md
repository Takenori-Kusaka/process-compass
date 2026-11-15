# #333 独立の突合(2巡目・直した差分だけ)

作成日 2026-11-15。直しを見ていない別の文脈で、1巡目の所見(`review-round1.md`)・直しの申告(`fix-round1.md`)・直した差分(本体 `b806e55` の `src/`、template `5199c68..126e643`)を突き合わせた。何も変更していない(コミットなし)。全体は見直していない。直しの担当の `mutate333.out` は読んでいない。

## 0. 確かめ方

- scratch: `C:/Users/kokor/AppData/Local/Temp/claude/9c454912284b4ac9/4ed090b1-58dc-4976-b9da-81b77286cf15/scratchpad/333-review2/`
  - `t/` は template main(126e643)の写し(`git archive`。git のリポジトリにしてある)。`t0/` は直す前(5199c68)の `ship-evidence.yml` と `evidence-manifest.mjs`
  - `tools/probe.mjs`: verify の手順「複製が記録用ブランチと一致することを検査する」の `run:` の本文を yml から取り出し、`bash -e` で動かす(試験とは別に書いた)。結果は `probe-new.out`・`probe-old.out`
  - `tools/mutate.mjs`(A1〜A6・A9・B1〜B9)・`tools/mutate2.mjs`(A8・C・D): 実装を1か所だけ壊して試験を流し、元へ戻す。結果は `mutate-A.out`・`mutate-B.out`・`mutate-2.out`(`mutate.mjs` は流した後に自分の置換で壊した。残りは `mutate2.mjs` で流した)
- node v26.13.0、Git Bash。基準の実行: `test-evidence-manifest` 27 件・`test-ship-evidence-steps` 21 件・`test-g5-missing` 18 件、すべて通過
- 本体: `lint:impl`・`lint:evidence`・`lint:refs` は exit 0
- 限界: 実機の GitHub では確かめていない。写しのファイルは CRLF(`git archive` が変換した)。壊すときは LF に揃えた。PATH に偽の gh を置く形の試験は、この端末(Windows)では動かせない(既存の試験も Windows では省く)ので、N-1 の「PATH で同じ試験が書ける」は読みによる。`npm run check` の全量は流していない

## 1. 1巡目の高3件

| 所見 | 判定 | 根拠 |
| --- | --- | --- |
| H-1 | 手順の経路は閉じた。ただし H2-2(レポートの添え書きが出ない)が残る | 下記 1.1 |
| H-2 | 閉じた | 下記 1.2 |
| H-3 | 試験の範囲は閉じた。ただし直しが H2-1(verify が黙って通る)を入れた | 下記 1.3 |

### 1.1 H-1

- 試験は実物の手順を動かしている。`test-ship-evidence-steps.mjs` L24・L40〜59 が `.github/workflows/ship-evidence.yml` を読み、`- name:` の行から `run: |` の本文を取り出して `bash -e` で動かす。手順を書き写した試験ではない。置き換えられない `${{ }}` は例外にする
- ワークフローを壊すと落ちる(`mutate-2.out`)

| 壊し方 | test-ship-evidence-steps | test-evidence-manifest |
| --- | --- | --- |
| C1 成果物の取得の失敗で手順が終わる(`if` で受けない) | 落ちる(2) | 通る |
| C2 取得に失敗しても写しを読まない | 落ちる(5) | 通る |
| C3 写しを一覧と照合せずに読む | 落ちる(1) | 落ちる(1) |
| C4 古い側の写しを読む | 落ちる(1) | 落ちる(1) |
| C5 読まなかった写しの警告を出さない | 落ちる(1) | 通る |
| C6 `previous-source.json` を書かない | 落ちる | 通る |
| C7 集約: 「前回なし」に見た場所を添えない | 通る | 通る(`test-g5-missing` も通る) |
| C8 集約: `evidence.json` に `previousSource` を出さない | 通る | 通る(同上) |

- 写しが無い・一致しない場合の出力(CLI を直接実行): 警告 `前回の証跡を読めません。成果物: 実行 77 から取得できず。写し: docs/evidence の置き場 1 件を見て、読めるものがありません(読まなかった理由: …)`、`previous-source.json` は `source: none` と `looked`
- C7 は、壊す前から出ていない → **H2-2**

### 1.2 H-2(IMPL-0244)

`mutate-A.out`・`mutate-2.out`。note が言う機械の範囲は、壊すとすべて落ちる。

| 壊し方 | test-g5-missing |
| --- | --- |
| A1 写しの success で `g5` を success にする | 落ちる |
| A2 写しに結論がある PR を欠落に入れない | 落ちる |
| A3 集計(`gateG5.success`)だけ写しの success を数える | 落ちる |
| A4 found: false の書き分けをやめる | 落ちる(文の関数の場面だけ。通しの場面は通る。区別できない旨の文にも同じ語句があるため) |
| A5 found: true の書き分けをやめる | 落ちる |
| A6 ホスティングが成功の PR も欠落に入れる | 落ちる |
| A9 record-copy の `checks: read` を外す | 落ちる(文字列) |
| A8 record-copy が check run を読めないと `exit 1` する | **通る** |

A8 は note・ADR-0135「影響」・EV-0266 が「文字列の確認まで」と書いており、表示と実態は合う。

### 1.3 H-3(IMPL-0522)・M-9(IMPL-0246)

`mutate-B.out`・`mutate-2.out`。

| 壊し方 | steps | manifest |
| --- | --- | --- |
| B1 追加以外の変更を失敗にしない | 落ちる | 落ちる |
| B2 出荷の PR 以外の一式を失敗にしない | 落ちる | 落ちる |
| B3 出荷の PR に置き場が無くても失敗にしない | 落ちる | 落ちる |
| B4 `evidence.json`・`manifest.json` の欠けを失敗にしない | 落ちる | 通る |
| B5 digest の不一致を失敗にしない | 落ちる | 落ちる |
| B6 ワークフロー: `changes` の出力を fail にしない | 落ちる(5) | 通る |
| B7 ワークフロー: `changes` の呼び出しを注記にする | 落ちる(5) | 通る |
| B8 一式の `git add` を外す(文字列は注記に残す) | 通る | 通る |
| B9 一式を置き場へ写す輪を外す | 通る | 通る |
| D1・D2 headSha を比べない(evidence・verify) | 落ちる | — |
| D3・D4 license-scan の失敗で手順が終わる | 落ちる | — |
| D5 coverage-result を取り込まない | 落ちる | — |

B8 は note が「文字列の確認まで」と書く。B9 も同じ帰結(実際の PR では一式に `evidence.json` が無く verify が失敗する)で、note の言う範囲の内側。

## 2. 所見

### H2-1(高・統制の弱化。直しが入れた)verify の一式の検査が、PR の側の一覧の形で落ちると、黙って通る

- **事実**: `ship-evidence.yml` L489〜493。`ev_out=$(node … changes …) && ev_rc=0 || ev_rc=$?` の後、失敗にするのは `ev_rc -gt 1` と、標準出力の行だけ。node が例外で落ちると終了コードは 1、標準出力は空で、失敗が1件も立たない
- 例外は PR の側の内容で起こせる。`evidence-manifest.mjs` L93〜101(`verifyManifest`)は、`files` の要素が null のとき `f.path` で、`path` が置き場の中のディレクトリのとき `readFileSync` で落ちる
- 直しで、前半の輪(L441)は `docs/evidence/*` を飛ばすようになった。「追加以外の変更」の検出は `changes` だけが持つ。落ちると、同じ PR の中の変更・削除の検出も一緒に失われる
- **実行**(`probe-new.out`・`probe-old.out`。SHIP=true)

| 場面 | 直す前(5199c68) | 直した後(126e643) |
| --- | --- | --- |
| P2 基底の一式の `evidence.json` を変更(M)+ `{"files":[null]}` の一覧を持つ置き場を追加 | exit=1・fails=2(追加以外の変更・digest) | **exit=0・fails=0**(TypeError はログにだけ出る) |
| P3 基底の一式を削除(D)+ 一覧の `path` がディレクトリ | exit=1・fails=3 | **exit=0・fails=0** |
| P8 追加だけ + `{"files":[null]}` | exit=1・fails=1 | **exit=0・fails=0** |
| P1・P4・P5 変更・品質レポートの変更・改名だけ | 失敗 | 失敗(変わらない) |

  SHIP=false では、置き場の追加が「出荷の PR だけ」で先に失敗するため、同じ形でも失敗する(一覧を読む前に終わる)
- **表示との食い違い**: ADR-0135 決定1「出荷の PR の verify ジョブが、追加以外の変更…を失敗にし」「基底ブランチへ入った後の書き換えは、PR の verify(追加以外は失敗)が検出します」、IMPL-0522 の note「追加以外の変更が無いこと」。`ship/` で始まるブランチ名の PR なら、成立済みの一式を書き換えて verify を緑にできる。直す前は失敗していた(検出の範囲が狭まった)
- 試験は検出しない。違反側の場面に、一覧の形が壊れた入力が無い
- **直しの案**: (1) `verifyManifest` で要素の形を確かめる(`path` が文字列・置き場の内側・通常のファイル。外れは不一致として返す。1巡目 M-1 の「`path` は置き場の内側に限る」も同時に閉じる) (2) `evidenceChangeProblems` は `verifyManifest` を try で受け、例外を失敗の1件にする。`main` も例外を「検査を実行できません」の1行と終了コード 1 にする (3) ワークフローは、終了コードが 0 でなく出力が空のときを失敗にする(`ev_rc -ne 0` かつ `-z "$ev_out"`)。または、追加以外の検出を前半の輪へ戻し、`changes` に依らせない (4) `test-ship-evidence-steps.mjs` に P2 の場面を `IMPL-0522:ng` で足す

### H2-2(高・表示と実態)「前回なし」に見た場所と理由を添える、は品質レポートに出ない

- **表示**: ADR-0135 決定1「読める写しが無いときは、見た場所と理由を集約の出力(`previousSource`・「前回なし」の添え書き)に出し、黙って『前回なし』にしません」。`ship-evidence.yml` L160〜161 の注記「集約が evidence.json の previousSource とレポートの『前回なし』に出す」。`fix-round1.md` の H-1 の行も同じ
- **実態**: `aggregate-evidence.mjs` L3401 の `prevLabel` は添え書きを持つが、使うのは L3407・L3409 だけで、どちらも `prevA` があるとき(前回を読めたとき)にしか通らない。前回が無いときは L3404 が `NO_PREVIOUS`(「前回なし」)だけを返す。添え書きの文は、どの出力にも届かない
- **実行**: 写しの一覧を壊し、`previous --artifact failed --run 77` で `previous-source.json` を作ってから集約を動かした。`evidence.json` の `previousSource` は出る(`source: none`・`looked` に理由)。`quality-report.md`(「前回なし」47 か所)と `assurance-disclosure.external.md`(45 か所)に「成果物: 実行 77」は 0 件
- 試験は無い(C7・C8 を壊しても3本とも通る)
- **直しの案**: レポートの前回の値の節に、読み先の1行(成果物・写し・なしと理由)を出す。または `prev()` の `!prevA` の返り値を `prevLabel` にする(ただし 40 か所超に同じ長文が入るので、1行にまとめる方が読める)。`previousSource` と添え書きの試験を `test-g5-missing.mjs` の通しに足す。直さないなら、ADR と注記を「`evidence.json` の `previousSource` とワークフローの警告に出す。レポートの文は『前回なし』のまま」へ狭める

### N-1(中・議長の裁定が要る)裁定に無い継ぎ目 `AGGREGATE_GH_FAKE`

統制の弱化に当たるかは、ADR-0038 決定2 に従い、ここでは判断しない。事実と案を書く。

- **事実**
  - `aggregate-evidence.mjs` L1041〜1043。環境変数があれば、`gh()` は `node <その場所> <引数>` を動かす。出力(`evidence.json`・レポート)には、差し替えた旨が出ない
  - この変更の前に集約が読む環境変数は `GITHUB_REPOSITORY`・`GITHUB_STEP_SUMMARY` だけだった(入力の出所を差し替えるものは無い)
  - 継ぎ目が掛かるのは `gh()` の1か所。`gh --version`(L1758)と、取り込んだ `check-pr.mjs` の `ghUserLookup`(L1697 で呼ぶ)は実物の gh を呼ぶ。試験では偽と実物が混ざる(1巡目が「実物の gh が o/r へ問い合わせた」と記録した形)
  - 既存の流儀は PATH。`test-material-records-more.mjs` L383〜450・`test-tailoring-declaration.mjs` L127〜204 は、`#!/usr/bin/env node` の `gh` を一時の置き場へ書き、PATH の先頭に置いて同じ `aggregate-evidence.mjs` を通しで動かす(Windows では省き、CI の Linux で確かめる)。`test-env-check.mjs`・`test-ship-evidence-steps.mjs` も PATH。製品のスクリプトの中に試験用の分岐を持つものは、この継ぎ目だけ(`adoption-trial.mjs` の模擬は、試行用の複製の中に置く別の経路)
  - CI での設定の経路: `ship-evidence.yml` に `GITHUB_ENV`・`GITHUB_PATH` への書き込みは無い。手順の `env:` は `GH_TOKEN`・`GITHUB_REPOSITORY`・`FROM`・`TO` など。PR の本文から取る `from`・`to` は値として渡り、環境変数の名にはならない。verify は基底ブランチを checkout する。PR から届く入力で継ぎ目を設定する経路は見つからない
  - 未設定であることを機械は確かめていない(ワークフロー・契約検査・試験のいずれにも無い)
- **PATH との比較**: 環境を設定できる者は PATH でも同じ差し替えができるので、Actions の上の攻撃の面は増えない(読み)。増えるのは、(a) 統制のコードの中に名前の付いた差し替え口が常設されること (b) 手元の実行(採用者が自分で集約を流す場面)で、残った環境変数が黙って効くこと (c) 差し替えが一部の gh にしか掛からないこと
- **直しの案(継ぎ目を外す)**: `test-g5-missing.mjs` の通しを既存の流儀へ揃える。偽の gh を `#!/usr/bin/env node` の `gh` として一時の置き場へ書き(mode 0o755)、`PATH` の先頭に置き、`process.platform === 'win32'` では通しの5場面を省く(文の関数の場面は残る)。`aggregate-evidence.mjs` L1041〜1043 は元の1行へ戻す。代償: Windows の手元では通しが動かない(CI が確かめる。1.2 の表は継ぎ目のある版で確かめた)
- **残す場合の案**: `GITHUB_ACTIONS` があるとき継ぎ目を無視する。使ったときは `evidence.json` とレポートに「gh を差し替えた実行」と出し、欠落に数える。`gh --version` と `ghUserLookup` も同じ継ぎ目へ通す

### N-2(中・表示)一式の無い出荷の PR は verify が失敗する。移行の扱いが文書に無い

- **実行**: P6(SHIP=true・品質レポートだけを足す PR。この変更より前の ship-evidence が作った出荷のブランチの形)は、直す前 exit=0、直した後 exit=1(`出荷の PR に証跡の一式…がありません(一式の欠け)`)。P1・P4・P5 でも同じ1件が上乗せされる
- 当たる場面: (a) テンプレートを更新した時点で開いたままの出荷の PR (b) 取り込み済みの旧い出荷の PR を `verify_pr` で再検査する場合 (c) `ship/` で始まるブランチ名の、出荷でない PR
- 集約は失敗しない。置き場が無いときの `previous` は警告と `source: none` で終わる(1.1)。過去の出荷に一式が無くても、集約と evidence ジョブは通る
- `fix-round1.md` は「note へ書いた」とするが、IMPL-0522 の note・ADR-0135・README・ワークフローの注記に、旧い出荷の PR の扱いは無い(grep)
- **直しの案**: ADR-0135「影響」と `ship-evidence.yml` の verify の注記に「この変更より前に作った出荷のブランチは、一式を持たないため verify が失敗する。ship-evidence を再実行して出荷のブランチを作り直す。取り込み済みの旧い出荷の PR の再検査は失敗する(`ship-evidence-verify` は必須チェックではない)」を足す

### M2-1(中・表示)`retention-days` の明示をやめた後の、古い文が2か所に残る

- `template/.claude/skills/gate/gates/G-7.md` L52「成果物 `ship-evidence` は保持の日数を明示した一時置きで、保管ではない」
- `src/data/impl-inventory.yaml` L586「成果物は保持の日数を明示した一時置きとする」(`fix-round1.md` M-7 は impl-inventory を直したと書くが、`b806e55` はこのファイルを変えていない)
- 一致している箇所: ADR-0135 決定1・採らなかった案、ci-gates.md L811、IMPL-0522 の note、impl-targets.yaml L458、`ship-evidence.yml` L204〜206、`workflowProblems`(明示を問題として返す。試験あり)。「一時置きで保管ではない」はどこも同じ
- 90 という値: `ship-evidence` に関しては、既定の説明(「既定(90 日)」)と採らなかった案にだけ残る。`ai-review.yml` L165 の `retention-days: 90` は別の成果物(ADR-0126)で、今回の範囲外
- **直しの案**: 2か所を「保持の日数を明示せずリポジトリの設定に従う一時置き」へ改める

### M2-2(中・M-6 の残り)template の2か所に、引き渡しを採用者に求めると読める文が残る

- `template/README.md` L138「期間とリポジトリの外の保管は採用者が定め、digest の一覧を使って引き渡す」
- `template/.claude/skills/gate/gates/G-7.md` L52「保管期間の値と、リポジトリの外の保管への引き渡しは採用者が定める(digest の一覧を使う)」
- ADR-0135 決定2・IMPL-0243 の note・ci-gates.md L814・PR 本文(`ship-evidence.yml` L309)は直っている(「照合に使える」「本 ADR が求めない」)。上の2か所は今回の差分より前の文で、直しが届いていない
- **直しの案**: 「保管期間の値は採用者が定める。リポジトリの外へ引き渡すときは、digest の一覧を照合に使える」へ揃える

### M2-3(中・表示)EV-0266 の「実装を1か所ずつ壊して落ちることを確かめました」が、範囲より広い

- ci-gates.md の EV-0266 の末尾。確かめていない点に挙げるのは、実機と record-copy(A8)だけ
- 壊しても落ちないのは A8 のほかに、B8(一式の `git add`)・B9(一式を写す輪)・C7・C8(集約の `previousSource` と添え書き)。H2-1 の形(一覧の形の壊れ)も試験に無い
- 「前回の証跡の写しからの読み」「実行の headSha の照合」「verify の一式の検査(追加以外・出荷の PR 以外・一式の欠け・digest)」「読めない G-5 の欠落への計上と書き分け」は、記述のとおり確かめている(1.1〜1.3)
- **直しの案**: H2-1・H2-2 を直した後、「壊して落ちることを確かめた範囲」を列挙に改め、確かめていない点に `git add` と(直さないなら)集約の `previousSource` を足す

### M2-4(中・表示)ci-gates.md の同じ頁に、前回の証跡の読み先が2通りある

- L811「前回の証跡は、成果物を取れないとき、基底ブランチの写しを digest の一覧と照合して読み…」
- L928「前回の出荷の値は、ワークフローが取り込んだ前回の成果物(`evidence/previous/evidence.json`)から取る。取得できない場合は『前回なし』を出力する」(1巡目 H-1 の直しの案(3)が挙げた行。変わっていない)。`ship-evidence.yml` L157〜158 の古い注記「取得できない場合(初回、成果物の保存期間の経過)は『前回なし』と出力される」も残る
- **直しの案**: L928 と注記を、写しからの読みに合わせる

### L2-1(低)IMPL-0522 の `test=` が指す試験は、note が言う「手順の本文を偽の gh で動かす」試験ではない

`test=template/scripts/gate/test-evidence-manifest.mjs`。手順を動かすのは `test-ship-evidence-steps.mjs`(目印 `IMPL-0522:ng`・`:ok` を持つ。CI では両方走る)。C1・C2・C5・C6・B4・B6・B7 は後者だけが検出する。IMPL-0246 の note のように、試験の名を note に書く。

### L2-2(低)`test-g5-missing.mjs` の通しは、git の作業ツリーの外では落ちる

L65 が `git ls-files` で写す。`git archive` の写し(git の管理外)では一覧が空になり、`git init` の失敗で試験が例外終了した(最初の基準の実行で観測。写しを git のリポジトリにして通過)。CI は checkout の中なので当たらない。`--others` により、追跡していないファイルも写る。

### L2-3(低)基底ブランチに形の壊れた一覧が1つあると、`previous` が落ち、読める写しも読まない

`{"files":[null]}` の置き場と適合の置き場を並べて `previous` を実行すると、TypeError で終了コード 1、`previous-source.json` は出ない。手順は `continue-on-error` で進み、集約は `previousSource: null` の「前回なし」になる。H2-1 の直しの案(1)で同時に閉じる。

### L2-4(低)ADR-0135 決定2 の前置き「採用者に求めることは次の3点です」が、直した後の箇条と合わない

2点目は「知る。…採用者の規程による」、3点目は「使える。…本 ADR が求めない」で、求めているのは1点目だけ。「採用者が定めること(1点)と、使えるもの(2点)」のように分ける。

## 3. 確かめて所見なし

- **H-1・H-2・H-3 の試験の強さ**: 1.1〜1.3 の表のとおり(H2-1・H2-2 を除く)
- **verify の一式の検査の移設(検出の範囲)**: 一覧の形が適合のとき、移す前後で結果は同じか、広い。変更(M)・削除(D)・改名(R100)・品質レポート(`docs/evidence/*.md`)の変更は、SHIP の真偽に依らず失敗する(P1・P4・P5)。出荷の PR 以外の追加は失敗(P7・P8 の SHIP=false)。適合の追加は通る(P7)。狭まるのは H2-1 の形だけ
- **M-6(本体)**: ADR-0135 決定2、IMPL-0243 の note、ci-gates.md L814 に、採用者への新しい義務と読める文は無い。構成のキー・保管日数の入力は足されていない
- **既存の決定**: ADR-0109 決定2(写しの値で充足に数えない。A1〜A3 が落ちる)・ADR-0084 決定1(`machine` は試験を名指す。IMPL-0244・0246・0521 とも実在の試験)と矛盾しない。ADR-0038 は N-1 の扱いに従った
- **権限**: 今回の差分で `permissions:` は変わっていない(record-copy は 1巡目で見た `checks: read` のまま。ship-evidence は変更なし)
- **シェルへの展開**: 足した行の `${{ }}` は `github.repository`・`github.run_id` だけ。PR の題名・本文・ブランチ名の展開は増えていない。`inputs.json` は jq から `printf` へ替わった(値は gh が返す実行の識別とコミットの識別。エスケープはしない)
- **dependency-diff(M-4)**: 両ジョブと一式の写す対象から外れ、ADR 決定4・注記・ci-gates.md が一致。試験が取り込まないことを確かめる(D5 の場面)
- **M-2**: 一覧の `range`・`target` は `evidence.json` から取る(D6 が落ちる。読めなければ null の場面あり)
- **M-8・L-1・L-2・L-3**: 文とワークフローの差分に、申告どおり入っている(読み)

## 4. 内訳と判定

| 重大度 | 件数 | 所見 |
| --- | --- | --- |
| 高 | 2 | H2-1(verify が黙って通る。直しが入れた統制の弱化)・H2-2(「前回なし」の添え書きがレポートに出ない) |
| 中 | 6 | N-1(継ぎ目。議長の裁定)・N-2(旧い出荷の PR の移行)・M2-1・M2-2・M2-3・M2-4 |
| 低 | 4 | L2-1〜L2-4 |

**このまま push してよいか: 不可**。高が2件ある。H2-1 は直す前より検出が狭まっており、表示(ADR-0135 決定1・IMPL-0522)とも食い違う。H2-2 は実装を直すか、ADR と注記を実態へ狭める。どちらも「表示と実態が食い違う高」に当たり、巡の数に関わらず直す対象。N-1 は議長が採否を決める。中の文言(M2-1・M2-2・M2-4)は同じ直しで閉じられる。
