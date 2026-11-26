# #361・#452 直しの記録(束 B34、裁定 §5 R-12〜R-19、2026-11-26)

直し役。材料: `30-ruling.md` §5、`50-audit-1.md`、`trial/node-public-2/`、`trial/python-public-2/`。push はしていない。template の先頭 `bc4bad1`(origin/main 上に b34 の 10 コミット)。bundle: `E:/Github/process-compass/tmp/bundles/template-b34.bundle`。試験は WSL(ubuntu、node 26.13.1)。

## 1. 項目ごと

| 項目 | 結果 | 内容 |
| --- | --- | --- |
| R-12(H-1) | 直した | D-7 の go 行と runtimeVersion の版の比較、D-9 の既存 package.json の coverage の検査を取り除いた。go.mod の存在の検査と置き場・例、README の jest の例は残した。test-scaffold-todo は「版の比較・中身の検査をしない」を固定する形に改めた。gate-g5.yml の注と README の 1 文を合わせた。`40-impl.md` の R-6・D-7・D-9 の行を実態へ |
| R-13 M-1 | 直した | ship-evidence の失敗の文を事実だけにした(「基底に道具がある PR では、この理由は出ません」)。取り込み方の指示を削った |
| R-13 M-2 | 直した | IMPL-0200 の note を「文書の読みから導ける食い違いで、観測ではなく、根拠の水準に数えない」へ。句点を補った |
| R-13 M-3 | 直した | 本文(template-repository.md)に、原因を特定していない自己試験の失敗(node の CI の test-discouraged-evidence、負荷の下の test-ship-evidence-steps)を開示。EV-0169 の括弧も改めた |
| R-13 L-1 | 直した | 6 件の note に句点。台帳を再生成 |
| R-13 L-2 | 直した | 事前点検の巡を「4巡。独立の巡は3」へ |
| R-13 L-3 | 直した | プランの制約の文言を Pro だけにした(Team は観測していない)。IMPL-0316 の note に「Team の文言と文書の URL は観測していない。URL の照合は採っていない」。採らない案: 文書 URL の照合(観測した gh の出力に URL が無い) |
| R-13 L-4 | 直した | README の手順1を「方法がある」の形にし、事実と回避の例として書いた。義務に読ませない |
| R-13 L-5 | 開示に回した | シェルの関数を実行する試験は足さない(L-5 の案の「この束で足さないなら note に書く」の側)。IMPL-0354 の note に「やり直しのシェルの関数を実行する試験は無い」と書いた。次の巡か #361 で扱う |
| R-14 | 直した(原因を特定) | 原因: CRLF の複製で、test-discouraged-evidence の D-0 の表の正規表現(`\|\n`)が当たらない。WSL で、同じ複製の LF と CRLF を比べて 4 件の NG を再現した(LF は 0)。直し: 試験の入力を LF へ正規化。対の試験: CRLF の複製元でも書き込め・欠落の判定が変わらない(適合)、直す前の試験は CRLF で 4 件落ちる(違反)。**残る未特定**: node の試行の CI(ubuntu)で落ちた複製が CRLF でコミットされていたかは確かめていない。他の自己試験の CRLF への耐性も未確認。本文に開示 |
| R-15 | 直した | ip-clearance-python が、演算子・`;`・`,` を含まない単一の名前を、先に全体で対応表へ当てる。新しい試験 `test-ip-clearance-python.mjs`(適合 6・違反 5 を含む 11 件)を gate-g5.yml へ登録。直す前は MPL・PSF の 2 件が落ちることを確かめた。**既存の不具合(直していない)**: `;` を含む文字列は tokenize が無限に回り、プロセスが異常終了する(終了は失敗側。ただし試験の入力から外した) |
| R-16 | 直した(手引き) | README の手順1に、git archive の CRLF・`-c core.autocrlf=false`・`.githooks/commit-msg` の実行ビット・`git update-index --chmod=+x` を事実と回避として書いた。`.gitattributes` は触っていない。本文にも同じ事実を足した |
| R-17 | 直した | 原因: env-check が最初の pull_request の規則 1 つだけを読んでいた(応答は複数のルールセットの規則を並べて返す)。承認の数は最大、dismiss_stale・last_push・code_owner はどれかが true なら true として集約(応答の値だけで決まる条件)。対の試験を test-env-check に足した(重なりで先が緩く後が厳しい=確認済み、すべて緩い=不一致)。直す前の実装では前者が落ちることを確かめた |
| R-18 | 開示 | 本文の試行の事実に、checks-only の実の構成では直接の push と通った SHA の push が拒否され、必須を gate-g5-base だけにした変種では SHA の直接の push が受理された事実を書いた。`pull_request` の規則を足すかは重の審議の議題。裁定しない。#361 に議題として残す(コメントは議長の段) |
| R-19 | 開示 | 本文に、出荷が人の欄の空欄で ship-evidence に止められた(規定どおり)こと、出荷の成立は確かめられないことを書いた |
| §4 | 確認 | 統制の設定の変更の承認者の欄は、本体・template のどの差分にも書いていない(空)。template 自身には check-pr が掛からず(R-9)、記入する具体の欄が差分の中に無い。所有者が書く案内は `30-ruling.md` §4 に残る。AI の名義の記入なし |

## 2. 試験(WSL、node 26。template bc4bad1 の内容)

test-template-copy・test-scaffold-todo・test-base-judge-workflow・test-env-check(72 件)・test-ship-evidence-steps・test-discouraged-evidence(13 件)・test-ip-clearance-python(11 件)・test-adapter・test-edition-end・test-license-scan・test-agent-run-record は、すべて rc=0・NG=0。回帰の全量は流していない(議長が push の前に1回)。本体: `lint:impl`・`lint:evidence`・`lint:refs`・`test:fields` は問題なし。変更した 5 本文の textlint は違反なし。台帳(impl・evidence)を再生成した。

## 3. template のコミット(origin/main の上、新しい順)

1. bc4bad1 fix: 突合の所見を直す(R-12・R-13・R-16)
2. 77f3825 fix(gate): env-check の重なった pull_request の規則(R-17)
3. 0d62558 fix(gate): python のライセンス検査の自由文(R-15)
4. 6fc3f0c fix(gate): test-discouraged-evidence の CRLF(R-14)
5. 以前の 7 コミットは `40-impl.md` §7

## 4. 仮の番号

新しい番号は足していない。既存の仮番 EV-0349・EV-0350 のまま(origin/main の最大は EV-0348・IMPL-1036・SRC-0768)。

## 5. 残り(議長・次の段)

- 独立の突合の2巡目(直した差分だけ)
- 回帰の全量・`npm run check`・push の前の bundle の取り込み
- #361 へ寄せる件: R-14 の node の CI の原因、test-ship-evidence-steps の負荷の下の rc=1、D-2 の実機の未確認と D-17、L-5 の実行の試験、R-18 の議題、ip-clearance-python の tokenize の既存の不具合、ほか D-11・D-16・D-18
