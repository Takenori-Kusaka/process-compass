# 束 B15 の回帰の全量で落ちた3本の原因と直し

対象: 本体 bd5d8fd3 の回帰の全量(WSL・node 26・LF)で、acquire・s5-init-pr・t288 が落ちた。
前の版 9fb3dcd では3本とも通る。template の版ごとに `--template-ref <版> --kb keep` で流して原因のコミットを特定した。

| 本 | 落ちた場面 | 原因のコミット | 原因 |
| --- | --- | --- | --- |
| acquire | 1(全検査) | 73e34a8(IMPL-0278、順 3) | 名簿が空の検出の条件が「d0Version を取得済み」だけで、D-0 の版を取得した直後(名簿を変化点で取り込む前)から出る。実装の誤り(検出が早すぎる) |
| s5-init-pr | 1 | 03fb7fb(IMPL-0987、T-7) | gh の代役が `actions/runs?head_sha=` に応答せず、起動の事象を読めない扱いで未確認になる。代役の不足 |
| t288 | 6 | 03fb7fb(IMPL-0987、T-7) | 同上 |

## 直し

1. 代役の不足(s5-init-pr・t288): `scripts/regress/lib/bin/gh` に `repos/<r>/actions/runs?head_sha=<sha>` の応答を足した。
   本物の GitHub は PR を評価した起動の実行に `event: pull_request` を付けて返す。代役も、gh pr view の材料の head が一致し、rollup に gate-g5 がある PR について、同じ形の実行を返す。
   場面が手動の起動などを与えるときは `runs-<sha>.json` をそのまま返す。決定の固定ではないため、期待は変えていない。
2. 実装の誤り(acquire): `headcountProblems`(template の `scripts/gate/config.mjs`)に、変更履歴に init 以外の変化点が1つ以上あることを条件に足した。
   名簿は D-0 表5-2 の記入後に /process-change で取り込むため、版の取得の直後に名簿が空であるのは初期化の途中の正常な状態である。intake.md 順 3 の注意(名簿を取り込む時点より前に出ない・初期化の経路を止めない)に沿う。
   変化点が受け付けられた後も名簿が空なら出す。
   試験(`test-roster-rules.mjs`): 適合の入力(版を取得しただけの段は出さない)を足し、違反の入力の fixture には変化点を持たせた。
3. IMPL-0278 の note(`tailoring-guide.md`)に、版の取得だけの段は止めない旨を足し、`npm run impl:write` で台帳を再生成した。

## 限界(開示)

- 版を取得した後に変化点を一度も経ない構成は、名簿が空でも契約検査では出ない。その間は「人の名簿が未記入」の警告と、出荷判定の集約が未記入の席を欠落にする検査が働く。
  H-2 を「D-0 の作成済み」だけで出す当初の条件より、検出の開始が遅い。

## 確認

WSL の写しで3本を単独に流し直して全場面が通った。test-g5-missing・test-aggregate-records・test-roster-rules・test-init-g5 も通った。
