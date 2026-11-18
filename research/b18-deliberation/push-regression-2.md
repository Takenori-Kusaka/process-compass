# 束 B18 前半の直し(議長の裁定の決定1・2)と回帰の全量(担当の記録。push はしていない)

## 直しの差分の範囲
- template(b18-328): 0f5fdd6 が本体の直し。`roster-ids.mjs` の `codeownersProblems` が、名簿に対応づかない個人(メールの形を含む)を `problems` でなく `notices` で返す。`check-pr.mjs` の 7d が `result.notices` へ出す。失敗に残すのは置き字 @OWNER・所有者の無い行・チームだけの行・型に当たらない変更・3か所のどこにも無い構成。試験(`test-roster-ids.mjs`・`test-check-pr.mjs`)を改め、`IMPL-0211:ok` に「名簿に無い個人は通り、注意が出る」を足し、所有者の無い行を `IMPL-0211:ng` に足した。文言は README・process-init の SKILL・`verify-gate-contract.mjs`・`.github/CODEOWNERS` を「勧める」形へそろえた。
- 回帰で見つけた欠陥: CODEOWNERS が無いときの早期 return が `notices` を返さず、`co.notices.length` で落ちた(test-check-pr の途中で停止)。668d0a1 で直し、試験を足した。suite の fixture(scripts/regress/)は変えていない。
- 再生成: 961eaac(tailoring-kb の生成元 SHA の再生成)。作業ツリーの差分は片づいた。
- 本体: ADR-0200 決定6・帰結、roles-responsibilities.md の IMPL-0211 の note、pre-review-automation.md の標準の CODEOWNERS の構成例を改め、`impl:write` で台帳を再生成した。
- 載せ直し: 作業中に origin/main が dbd2c68f へ進んだ(graphify manifest と token-usage の記録だけ)。rebase は衝突なし。
- 検査: lint:impl・lint:refs・lint:text・test:fields・test:template は通過。bundle: `E:/Github/process-compass/tmp/bundles/template-b18-a-fix3.bundle`(verify 済み)。

## 回帰の全量(WSL・node 26.13.1・`git clone` による .git を持つ LF の写し。template は 668d0a1 を .git つきで配置)
| 条件 | 終了コード | 結果 |
|---|---|---|
| template の test-check-pr | 0 | 256 場面と付随の確認が一致 |
| 回帰スイート --kb keep(通常) | 0 | 29 本すべて exit 0。t288 も通った |
| 同 TZ=UTC | 0 | 同上 |
| npm run check(通常) | 0 | build 393 ページ(再実行後の値。下記) |
| TZ=UTC npm run check | 0 | 同上 |

- 1回目の `npm run check`(通常)は test:criteria で停止した。rebase の後で、tailoring-kb の生成元の版 dbd2c68f が履歴の祖先でなかったため(`npm run template:kb` の再生成が要る旨のメッセージ)。B18 の欠陥ではなく rebase の手順の漏れ。template:kb を再生成して template 961eaac・本体 9bdfb87b とし、`npm run check` の2通りを流し直して両方通った。
- 回帰スイート(通常・UTC)は template 668d0a1 に対して流した。961eaac との差は tailoring-kb.json の生成元 SHA の1行だけ(スイートは --kb keep)。
- Windows の CRLF による偽の FAIL は判定に使っていない。確かめていないこと: push 後の CI、Windows での regress・build。

## 先頭の SHA(この記録のコミットの前)
- 本体: 9bdfb87b1d8d888b13d92e233b8b3eea9870e29e
- template: 961eaac00e71ee196ddc89e5ea58391c4dec62ca

## 後始末
WSL の /tmp/pcb18・/tmp/pit-regress-*・/tmp/pcb18-*.log は残している。
