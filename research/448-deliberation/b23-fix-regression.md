# 束 B23 push の前の回帰 3 本の直し(担当の記録)

## 直し
1. lint:text — ADR-0221 決定の項目5 の 290 字の 1 文を、入れ子の箇条書き 6 行へ分けた。条件(語「基準7」か「安全関連部の検証の記録」、G-7 以外のゲート名が付く出現と後ろに数字が続く出現を数えない、機械は語の有無と直前のゲート名だけ、文の意味は人が確かめる)は落としていない。
2. build — ADR-0217 のスラッグを実在の `0153-safety-judgment-and-ship-prohibitions-outside-exception-approval` へ直した。ADR-0216〜0222 の他の誤りは無い(ADR-0222 のリンクは正しい)。
3. test:regress — fixture 側を直した。検査の規則(cl-judgment.mjs)は緩めていない。ADR-0221 の決定が正で、規則が決定より広く落としてはいない。
   - `scripts/regress/suite/lib.mjs` の clRecord が「構成要素ごとの判定」の表を「システム全体 / 判定した区分 / 最悪の帰結」の 1 行で埋める。
   - 同 workspace().write: F.2 の回答を様式のまま(仮)から実の回答へ改めると節12 の生成区間が連動して食い違うため、検査の指示どおり `generate-profile.mjs --answers process.config.json` で区間を作り直す(ADR-0171 決定2)。
   - `cl-judgment.mjs`: F.2 を「はい」にする場面で構成の回答 q-f2-q1 を `f2q1-yes` に揃える(IMPL-1016。食い違いは別の記録の不備になる)。
   - `acquire.mjs`: 判定の記録だけで落ちることを確かめる絞り込みに「構成要素ごとの判定」の表の語を足し、期待値の改め(changed)に ADR-0221 を記録した。

## 結果(WSL の LF の写し・node 26)
- test:regress: 通常、TZ=UTC とも全場面が通った。
- stages の 136 件の未実行は、D-0 の検査が前段で落ちた二次的な結果だった。直した後は stages 175 場面すべて実行され、落ちは 0。
- 注意: Windows の CRLF の作業ツリーを写すと、fixture の文字列置換が空振りして偽の失敗(r3・t288・trial)が出る。写しは LF に直して流す。
- Windows の node では test-run.mjs が `--regress-probe` で落ちる(環境差。直す対象の外)。
- lint:text・build(Windows)・lint:impl・lint:evidence・lint:refs・lint:tone・lint:scope は通過。impl:write・evidence:write・scope:write の差分は無かった。

## template
変更なし(bundle・template:kb の更新は不要)。
