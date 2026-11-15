# #350・#349・#348・#340(事象2) 独立の突合(2巡目)への直し

裁定: `ruling-round2.md`。変えたのは template の `scripts/init/generate-profile.mjs` と `scripts/gate/test-check-delegation.mjs` だけ。本体の標準・台帳は触っていない(IMPL-0516 の note は「次の評価の日から」を既に書いており、D-0 の文と食い違わない。check-impl・check-template-drift・check-template-fields は通過)。

| 所見 | 対応 |
| --- | --- |
| 高-1 | `windowEffectiveFrom` の正規表現を `/^(\d{4})-(\d{2})-\d{2}$/` に直した(Edit で編集し、Grep で `\d` が残ることを確認)。窓 4(記録 2026-10-10)の構成で「2026-11-01 の評価から効く」と出ることを実行で確認 |
| 高-1 同じ形の落ちの検索 | `git -C template diff 6ccc4ab..rebuild-b1` の追加行を、`\d` `\s` `\w` を伴うバックスラッシュ抜けの形で検索した。該当は上の1箇所(767行目)だけ。他の一致は `d >= w.from` のような変数名・`Object.keys(..)` などの偽陽性 |
| 中-1 | 新しい `windowChange(config)` が履歴の最後の値と1つ前の値(無ければ既定)を返し、どちらかが既定より長いときだけ開示を出す。`windowPhrase` と `windowDeciderText` はこれで分岐する。文は日付に依らない(`renderAutonomyTable` は今日を取らない)。長くする向きは「最新 4か月、2026-11-01 の評価から。前の値(2か月)で数える」、短くする向き(4→2)は「最新 2か月、2026-11-01 の評価から。前の値(4か月)で数える」と書き分ける。履歴の無い `months` だけの旧い構成は既定として扱う(従来は months を直接読んでいた) |
| 低-1 | 開示で閉じた。足した試験の注記に「停止の残りは test-check-delegation の IMPL-0516:ng が覆う」と書いた |
| 低-2 | 直さない(裁定どおり) |
| 低-3 | 手戻り率の欄に「(差し戻し率と共通の観測の窓。同じ行の差し戻し率の欄を参照)」を足した |

## 試験(test-check-delegation.mjs、観測の窓の節の先頭)

長くした構成・短くした構成(4→2)・年をまたぐ構成(12 月記録は翌年 1 月 1 日)・既定の構成・手戻り率の欄の5場面。日付は履歴の固定の値で、実行日に依らない。

結果: test-check-delegation 一致(NG 0)、test-loosening-decider 通過、test-init-g5 146 件一致、test-aggregate-records 129 件一致。

## 裁定と違えた点

なし。履歴の無い旧い構成で `observationWindow.months` だけがある場合は、これまで長い窓として開示していたが、今回は履歴を正として開示しない(`observationWindowAt` が履歴だけを読む実態に合わせた)。
