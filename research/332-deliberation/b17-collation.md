# #332 の受け入れ条件と残りの突合(束 B17、2026-11-18)

対象: Issue #332(OPEN)の本文の受け入れ条件1件と、コメント1件(2026-11-17 の途中報告)の残り4点。

## 表

| 項目 | 判定 | 所在・根拠 |
|---|---|---|
| 受け入れ条件: 論点1(受け取り側が生成元を確かめる手段)と論点2(1名の体制の検査の段)それぞれに、調査・会議体・突合を経た裁定がある | 満たした | ADR-0157(`src/content/docs/adr/0157-recipient-origin-check-is-guidance-and-kb-source-limited-to-main-history.md`)。手引き `community/standard-editions.md` L70〜86。compute-strategy の1段落。コミット 26e0b14b、e1489176、445d9f5e。審議の記録は本ディレクトリの intake・opinion-*・decision・review-round1/2・fix-round1/2 |
| 残り1【高】: 同梱の知識ベースの `source.commit`(59425d2e…)が標準のどのブランチからも到達できない。template:kb の流し直し | 満たした(データ) | 準拠テンプレート main(9fb3dcda)の `scripts/vendor/tailoring-kb.json` は `source.commit` = 5241b937。`git merge-base --is-ancestor 5241b937 origin/main` は成功 |
| 残り1【高】の後半: 配る側の検査(`source.commit` が `HEAD` の祖先であること。`check-gate-criteria.mjs`)を再生成と同時に入れる | 残り | 実装 ebf209a0(`scripts/check-gate-criteria.mjs`、`scripts/lib/inputs.mjs`、`scripts/test-kb-ancestry.mjs`、package.json)はブランチ Takenori-Kusaka/b15 にだけあり、`origin/main` の祖先でも本ブランチ(b17)の祖先でもない(未 push)。`origin/main` の check-gate-criteria.mjs・package.json に祖先の検査は無い。したがって手引き L86 の「配る側の検査は未実装(降りていない)」が現時点でも事実。template の機械の検査ではなく、標準側の検査の取り込み待ち |
| 残り2(任意): テンプレート README の版の節に手引きへのリンクを1行 | 要確認 | 任意項目。template main の README に `standard-editions` の語は見つからない(未実施)。足さないと決めた記録も見当たらない。議長が「足す」か「足さない」を裁定して記録すること |
| 残り3: 1.10.2「配布物のコミットの識別」とテンプレートの「標準のコミット」(`source.commit`)の語の食い違い | 残り(先送りと明記) | コメントで「本件では直さず先送り」。寄せ先の Issue の記録は無く、open の別 Issue でも該当作業は確かめられなかった(`gh issue list` の検索で #332 以外に該当なし)。先送りの置き場が無い点が要確認 |
| 残り4: 契約検査に受け取り側の確認を入れない | 満たした(採らないと決めた) | ADR-0157 決定1・3、コメントの「採らないと決めた点」。作業は不要 |
| コメントの「採らないと決めた点」(受け取り側の確認を義務にしない、attestation を課さない、番号の突き合わせ・経路変更は候補のまま、1名の体制の列を足さない) | 満たした(開示済み) | ADR-0157、ADR-0090 決定8 の一部置き換え |
| EV-0301(根拠水準マーク) | 満たした | コメントと実装記録に台帳 287 件の再生成の記録。マークの実在は ledger で再確認していない(下の要確認) |

## 結論

残りあり。ただし #332 の受け入れ条件(裁定)自体は満たしている。残りは次の2点で、いずれも template の機械の検査ではなく、標準側の `check-gate-criteria.mjs` の祖先の検査(ebf209a0)を main へ取り込むことと、細目の裁定である。

1. 祖先の検査 ebf209a0 の取り込み(b15 の push 待ち)。取り込めば ADR-0157 決定3 と手引き L86 の「未実装」の開示を更新する必要がある。取り込み後に閉じてよい
2. 任意項目(残り2)の裁定と、先送り項目(残り3)の置き場

## 要確認

- 残り3の寄せ先が無い。別 Issue へ寄せるか、#332 を閉じる際に「課さないと決めた」「先送り」と明記するかを議長が決める
- 残り2は template の README を直接確認していない(`gh api` で `standard-editions` の語が無いことのみ確認)
- EV-0301 の台帳での実在は確かめていない
- template main の知識ベースは 5241b937 で作られており、`src/data/tailoring` は現 `origin/main` と差がある。ADR-0157 の決定3 が求めるのは祖先であることだけなので、問題ではないが、乖離は `npm run check` の対象であり別に追う
