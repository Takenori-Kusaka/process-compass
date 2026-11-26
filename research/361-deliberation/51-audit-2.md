# #361・#452 独立の突合 2巡目(束 B34、2026-11-26)

実装を見ていない別の文脈で、**直した差分だけ**を突き合わせた。対象: 本体 `git diff 9cb8f948..HEAD -- . ':!research'`(HEAD 2be7993f)、template `git -C template diff 616f039..bc4bad1`(4 コミット)。基準: `30-ruling.md` §4・§5(R-12〜R-19)と `50-audit-1.md`。`60-fix.md` は所在を知るためだけに使った。

件数: **高 1・中 1・低 4**。CLAUDE.md の規定(独立の突合は2巡まで)により、本巡の所見は根拠水準マークか undelivered の表示で開示して閉じる前提で書く。**直すべきものは H2-1 だけ**(表示と実態が食い違う「高」)。

## 1. 実行での確認

| 確認 | 結果 |
| --- | --- |
| WSL ubuntu・node 26.13.1・`git -c core.autocrlf=false archive bc4bad1` の LF の写し: test-ip-clearance-python(11)・test-discouraged-evidence(13)・test-env-check(72)・test-scaffold-todo(6)・test-template-copy(12)・test-base-judge-workflow(131)・test-ship-evidence-steps | すべて rc=0・NG=0 |
| R-14 の対: 写しの test-discouraged-evidence から LF への正規化の1行を外す | R-14 ok の2件が NG(直しの退行を検出する) |
| R-14 の再現: 616f039 の写しで `templates/00-d0-governance.md` だけを CRLF にする / LF のまま | CRLF は NG 4 件、LF は 10/10 通過(直し役の原因の特定と合う) |
| R-14 の直しの後: bc4bad1 の写しで同じファイルを CRLF にする | 13/13 通過 |
| R-17 の対: 写しの `mergePullRequestRules(r.value)` を、最初の規則だけを読む旧い式へ戻す | 「重なった pull_request の規則は、厳しい方で判定する」が NG |
| R-15 の対: 写しの `isSingleName` の先回りの1行を外す | MPL・PSF の2件が NG |
| R-15 の許可の側の探り(下の H2-1) | 旧い版で違反だった自由文 4 種が、新しい版で通過 |
| `impl:write`・`evidence:write` の再生成 | 台帳の差分なし(`git status` が空) |
| `lint:refs`・`test:fields`・`lint:impl`・`lint:evidence`(Windows) | すべて rc=0 |
| §4 の承認の記録 | `30-ruling.md` §4 末尾に「承認者の欄は空けたままにし、所有者が書くよう案内を残す(AI の名義で書かない)」が残る。直した差分(本体・template)の追加行に、承認者の欄への記入も AI の名義の記入も無い。template のコミットの `Co-Authored-By: Claude Sonnet 5.5` は担い手の識別のトレーラで、承認の欄ではない |

1巡目の所見の解消: H-1(版の比較・初期化の検査を取り除いた。generate-profile・test-scaffold-todo・gate-g5.yml の注・README・`40-impl.md` の R-6・D-7・D-9 の行が実態と合う)、M-1(ship-evidence の文が事実だけになった)、M-2(IMPL-0200 の note が「観測ではなく、根拠の水準に数えない」へ)、L-1〜L-4 は解消。M-3 は本文で開示したが、数の食い違いが残る(L2-1)。L-5 は IMPL-0354 の note に「シェルの関数を実行する試験は無い」と開示(裁定 R-13 の許す側)。

## 2. 所見

### H2-1 [高・直すべきもの] R-15 の直しが、許可に無いライセンスを含む自由文を通す(fail-open)。注と本文は「全体が許可の名に当たるときだけ」と書く

- 所在: `template/scripts/gate/ip-clearance-python.mjs:114-123`(`isSingleName` と `evaluateSPDX` の先回り)。判定は同ファイル `mapClassifier`(44-59 行付近)の `includes` による部分一致。注の主張: 同 116 行「許可の側へ広げるのは、全体が許可の名に当たるときだけ」、`template/.github/workflows/gate-g5.yml:200`「許可に無い式は違反にする」、本文 `template-repository.md:263`「テンプレートの欠陥でした(直しました)」
- 根拠: `isSingleName` は大文字の `AND`・`OR`・`WITH` と `;`・`,` だけを除く。小文字の `and`・`with` を含む自由文は「単一の名前」として文字列の全体が `mapClassifier` へ渡り、`includes('mit license')`・`includes('apache license')`・`includes('apache software license')`・`includes('psf')` などの部分一致で許可の名へ写る。WSL で、許可 `mit;apache-2.0;bsd-3-clause;python-2.0;mpl-2.0` の下で終了コードを比べた(旧 616f039 / 新 bc4bad1):
  - `GPLv3 and MIT License`: 1 / **0**
  - `GPL-3.0 and Apache Software License`: 1 / **0**
  - `Proprietary (based on Apache License)`: 1 / **0**
  - `CC-BY-NC-4.0 with PSF parts`: 1 / **0**
  - (`GPL-3.0 And MIT` は `And` が 1 語目の後に来る形で、新旧とも 1)
  知財の検査が、直す前に止めていた違反を通すようになった。試験 `test-ip-clearance-python.mjs` の違反の側は大文字の `MIT AND GPL-3.0` だけで、この経路を見ていない。注と本文の「全体が許可の名に当たるときだけ」は実態(部分一致)と食い違う
- 直し方の案: 先回りの判定を、部分一致の `mapClassifier` でなく、**文字列の全体の完全一致**の対応表(観測した自由文 `Mozilla Public License 2.0 (MPL 2.0)`・`Python Software Foundation License` など、名を列挙)に限る。あわせて `isSingleName` の演算子の判定を大文字小文字を区別しない形にする。違反の対に `GPLv3 and MIT License`・`Proprietary (based on Apache License)` を足す。決定可能な条件(文字列の一致)で閉じるので、機械の検査のまま直せる

### M2-1 [中] R-14 の「特定できなければ README と本文に既知の不具合として開示」のうち、試行の CI の失敗の原因が未確認であることが README に無い

- 所在: `template/README.md:43`(手順1。「CRLF の複製では、自己試験 test-discouraged-evidence が…4 件が落ちた(この版で直した)」)。対比: 本文 `template-repository.md:275・277`(「node の試行の CI(ubuntu)で同じ4件が落ちたが、その複製がコミットされた改行は確かめていない」「node の試行の CI での原因は確かめていない」)
- 根拠: 裁定 R-14 の対象は「採用者のリポ(ubuntu の CI、LF の複製)で4試験 NG」であり、試行の記録 `trial/node-public-2/trial-log.md:13` は「LF の複製でも同じため、改行が原因ではない」と書く。直し役は CRLF を原因として再現した(本巡の WSL でも再現した)が、試行の CI が CRLF の内容を持っていたかは確かめていない(試行のリポジトリは削除済みで、本巡でも確かめられなかった)。本文は未確認を開示したが、採用者が読む README は「この版で直した」だけを書き、採用者の CI で同じ4件が落ちうることを示さない
- 直し方の案(開示で閉じる): README の同じ箇所に「試行の CI(ubuntu)で同じ 4 件が落ちた件は、その複製が CRLF だったかを確かめておらず、この直しで解消したかは未確認(process-compass #361)」の1文を足す。#361 へ寄せる件に含める

### L2-1 [低・編集] EV-0169 の追記の「原因を特定していない失敗が1件残ります」と、本文の列挙(2件)が食い違う

- 所在: `template-repository.md:253`(EV-0169 の本文)。対比: 同 277 行(node の CI の test-discouraged-evidence の原因が未確認、負荷の下の test-ship-evidence-steps の rc=1 が未特定)
- 直し方の案: 「原因を確かめていない失敗が残ります(#361)」のように件数を外すか、2件と書く

### L2-2 [低・既存] ip-clearance-python の字句の分割が、識別子に使えない文字で止まらない。式の後ろの語を読み捨てる

- 所在: `template/scripts/gate/ip-clearance-python.mjs` の `tokenize`(79-110 行付近)と `parseExpr` の呼び出し
- 根拠: 空白・括弧・識別子の文字以外(`;`・`,`・`/`・`:` など)で `i` が進まず、無限に回る。本巡で `Commercial license, not MIT License` は新旧とも 10 秒で打ち切り(終了コード 124)。`60-fix.md` は `;` だけを挙げ、`,` や `/` には触れていない。また、構文の解析は最初の式の後ろの語を読み捨てる(`MIT GPL-3.0` は MIT だけを見る)。どちらも直す前からの不具合で、本巡の差分が入れたものではない。止まらない経路は失敗の側(CI の時間切れ)に倒れるが、本文・README には開示が無い
- 直し方の案(開示で閉じる): #361 へ寄せる件の「tokenize の既存の不具合」に、`,`・`/` でも止まらないことと、後ろの語の読み捨てを足す。H2-1 を直すときに同じ関数を触るなら、同じ巡で直してよい(対の試験つき)

### L2-3 [低] R-14 の直しは試験の入力の正規化で、製品の側(集約)が CRLF の D-0 を読めるかは確かめていない

- 所在: `template/scripts/gate/test-discouraged-evidence.mjs:145-146`(D-0 を LF へ正規化してから `docs/D-0-governance.md` へ書く)
- 根拠: 試験の欠陥(様式の表への行の差し込みの正規表現が `\n` を前提にする)の直しとしては正しく、対も働く(§1)。ただし、Windows の採用者の作業ツリーで `docs/D-0-governance.md` が CRLF のとき、`aggregate-evidence.mjs` が非推奨の兼務の表を読めるかは、どの試験も見ていない。本文・README は「ほかの自己試験の CRLF への耐性は確かめていない」とだけ書き、製品の側に触れない
- 直し方の案(開示で閉じる): 本文の同じ行に「集約が CRLF の D-0 を読めるかも確かめていない」を足すか、#361 へ寄せる

### L2-4 [低・編集] R-18 の本文の「通った SHA」が何を通ったかを書かず、試行の限定を落としている

- 所在: `template-repository.md:280`(「通った SHA の push(gate-g5 が失敗している SHA)も拒否された」「変種では、通った SHA の直接の push が受理された」)
- 根拠: 試行の記録 `trial/node-public-2/results.md:31` では、この SHA は gate-g5-base と test を通り gate-g5 が失敗したもので、「実の gate-g5 が成功した SHA での受理は観測していない」の限定が付く。本文は「通った」の対象を書かず、括弧の「gate-g5 が失敗している」と読み合わせないと矛盾して読める。限定も落ちている
- 直し方の案: 「gate-g5-base を通り gate-g5 が失敗した SHA」と書き、「gate-g5 が成功した SHA での振る舞いは観測していない」を足す

## 3. 新しい義務・採らない案・表示と実態

| 観点 | 結果 |
| --- | --- |
| 新しい義務 | README 手順1(R-16)は「持ち込みに順序や手順を課すものではなく、観測した事実と回避の例」と書き、命令の形を取らない。ship-evidence の文(M-1)も事実だけ。新しい義務は見当たらない |
| 採らない案の混入 | D-7 の版の比較・D-9 の初期化の検査は取り除かれ、test-scaffold-todo が「しない」を固定する。文書の URL の照合(R-4)は IMPL-0316 の note に「採っていない」と開示。混入は見当たらない |
| 表示と実態 | H2-1(高)。ほかは開示の欠け(M2-1・L2-1・L2-3・L2-4)で、主張が実態を超えるものではない |
| R-17 | 応答の値だけで決まる集約(承認の数の最大、各設定のどれか)で、旧来の保護との重なりの判定(1b)と同じ規則。決定可能な条件で閉じている |
| §4 | 満たす(§1) |
