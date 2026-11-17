# 束 B16 U1〜U3 突合2巡目の直し

- R2-H1: `template/profiles/{internal,oss,revenue}/templates/06-project-brief.md` へ、基底の追加分を反映した。各写しの固有の値・文は保った。
  - 3写し共通: 検証費用の行(7.7.1)、「安定性指標の閾値の記録事項」、「AI 利用量の上限」、「チーム単位の上限に到達したときの扱い」、節「G-1 で定めて記録する例外の統制」(3行)
  - revenue のみ: 稟議の出所の対応表と「本様式は、」の語。internal・oss は稟議の節と該当文を持たないため入れない(写しの型ごとの差分を保つ)
  - 写しと基底の行の一致を検査するかは議長の裁定に残す(本担当は検査を足していない)
- R2-M1: IMPL-0825 の note を「ステージ移行ゲートでは差し戻しを用いない旨は欄に書かれている(IMPL-1000)」へ直し、`npm run impl:write` で台帳を再生成した。
- 低3件(R2-L1・L2・L3)は直さない(review-U1-U3-round2.md で開示して閉じる)。
- 検査: test-brief-thresholds 50 passed、test-init-g5 通過、lint:impl 通過。
