# 束 B16 push 2 の準備(前半): 載せ直しと番号

## 載せ直し
- template: b16 の先頭 9fb3dcda は origin/main(6fe1f202)の子孫。rebase 不要。bundle(origin/main..HEAD の 6 コミット)を `E:/Github/process-compass/tmp/bundles/template-b16-final.bundle` に退避
- 本体: origin/main(11 コミット先行)の上へ 18 コミットを rebase。衝突は `implementation-ledger.md` のみ(各コミットで発生)。upstream の版を採り、最後に `impl:write` で再生成。graphify-out の衝突は無し。submodule の参照は template の b16 先頭(9fb3dcda)のまま
- 再生成後の台帳の差分は 1 ファイル(implementation-ledger.md)。別コミットで置く

## 番号の付け直し
- EV・SRC・ADR: 本束で足したものは無し
- IMPL: 本束で新しく足した番号は無し(最大は origin/main・HEAD とも IMPL-1021)。付け直し不要

## 検査(Windows)
lint:impl・lint:refs・lint:scope・lint:evidence・lint:text・lint:provisions・test:fields・test:plan-issues・test:impl・lint:skills はすべて終了コード 0。回帰の全量は流していない。

## impl:issues(issue= に持つ降りていないマーク)
| Issue | 件数 | 備考 |
|---|---|---|
| 445 | 18 | IMPL-0801 0878 0567 0610 0979 0630 0136 0680 0681 0682 0972 0884 0930 0931 0836 0761 0763 0771 |
| 446 | 18 | IMPL-0594 0597 0599 1004 0636 0640 0643 0900 0651 0664 0709 0834 0980 0959 0840 0839 0767 0772 |
| 447 | 9 | IMPL-1020 1021 0683 0978 0883 0890 0827 0715 0718 |
| 448 | 11 | IMPL-1007 0919 0925 0927 0934 1015 1016 0759 0760 0764 0766 |
| 449 | 0 | 閉じてよい |
| 450 | 1 | IMPL-0645 |

出力は「issue= を open の Issue へ付け替える」の対処を示す。残る件が B16 の対象か対象外かの判定は議長に返す(列挙のみ)。
