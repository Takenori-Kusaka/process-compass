# b2 束の push 準備(2026-11-12)

## 直し
- R2-1: SRC-0491 を `node scripts/research-ledger.mjs verify --ids SRC-0491` で流し直した。機械が c1〜c6 を found と確かめ、`mech.checkedAt` は 2026-11-12 に改まった。手で書いた found は残していない。`accessed` を 2026-11-12 に改め、`verification.note` に「2026-11-12 に PDF の pdftotext 出力と照合(人の確認)」を書いた。verify が c4 の note を「2026-11-12 に」で切ったので、元の文へ戻した
- R2-2: assurance-case.md H.10 の対応表を「二次資料(SRC-0736)が伝える…二次資料による記述であり、確かめていない(EV-0257 の範囲)」に直した
- 検査: lint:sources・lint:citations・lint:evidence・textlint は通った

## 取り込みの準備
- `git fetch origin` の結果、origin/main に新しいコミットは無かった(rebase は不要)。付け替えは無い(ADR-0128・EV-0257/0258・SRC-0731〜0737 は重ならない)

## 回帰(WSL・node 26.13.1・LF の写し)
- push してよい HEAD: 907eb1f8bf074430fd804a75c19f62020e7c0bc8(このファイルのコミットを除く)
- 通常: `npm run check` 合格(終了コード 0、build 359 ページ)
- `TZ=UTC`: `npm run check` 合格(終了コード 0)
- 1回目の写しは `cp -r /mnt/e/...` で全ファイルが 755 になり、test-adoption.mjs(git merge の add/add 衝突)が落ちた。ファイルのモードの食い違いによる環境の偽の FAIL。WSL 内の git clone で写し直すと通った。この束の変更とは無関係
