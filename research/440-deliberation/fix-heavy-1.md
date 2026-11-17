# Issue #440 重の独立の突合(1巡目)の所見の直し(2026-11-17)

裁定は `chair-on-crosscheck-heavy-1.md`。全14件を直した。裁定から外れた点はない。新しい EV・IMPL・ADR の番号は付けていない。

| # | 直した所在 |
| --- | --- |
| M-1 | `src/data/provision-forms.yaml` に `confirmedSafetyProhibitions`(確かめた安全の禁止の文)を新設し3句を登録(F.5 の故障挿入の禁止、F.5 の例外承認の対象外、RRS3 を低減後 SR に数えない禁止)。`scripts/lib/frame-checks.mjs` の `prohibitionPresenceProblems`(句が注意の枠の外の本文にあること)、`scripts/check-provisions.mjs`(結線)。`scripts/test-provisions.mjs` に単体の試験5件と、本文から句を消す変異試験3件(消すと本体が非 0 になる。65 → 74 件、全合格)。ADR-0155 決定1 に記述、`community/provision-forms.md` に行を足した。意味と、禁止が守られることは確かめない(manual のまま) |
| M-2 | 表示を実態に合わせた。検査は `ledgerKey` が overview.md の全文にあることだけを見る、と `provision-forms.yaml` のコメント、`frame-checks.mjs` の説明と問題の文、`check-provisions.mjs` の先頭の説明、`community/provision-forms.md` の検査12 と登録簿の行、`test-provisions.mjs` の試験名に書いた。1.7.2 のマークの表の行は見ない |
| M-3 | `gate-criteria.md` P-9b の「この数値は、原典と照合されていません。」を消した |
| M-4 | `deliverable-templates.md` 判定における対比の第3文を SRC-0794 の c1・c2 に沿って改めた(結論は変わらない)。第2文(易しい課題/難しい課題)は出典を結べないので残し、EV-0295 に「出典に結べていない」と書いた。EV-0295 に抄録の水準で読んだことも足した |
| M-5 | `overview.md` の枠を「IEC 62304 … は医療機器ソフトウェアを対象とする規格です。本標準は、これを汎用の開発標準として引用しません。」に改めた。EV-0297 の差し替え条件に、数えは今回の直しの後から始めると足した |
| M-6 | `overview.md` 1.7.2 の段落に、要求・禁止の形の文の範囲(述語が本標準を適用する者の行為で、文末が 1.7.1 の表の要求・禁止の形。事実と因果の文は対象の外)を足した。ADR-0156 決定2 にも同じ範囲を足した。新しい義務はない |
| M-7 | `src/data/impl-inventory.yaml` の節「市場規模を書かせない理由」の注記から「審議中」を除き、表明である旨と、#324 の裁定 T9 を重の裁定 5.6 が置き換えた理由(IMPL-0799 は presence で確かめ続ける)を書いた。区分は変えていない |
| L-1 | `adr/0132-*.md` のステータスの節を「一部置き換え(→ ADR-0156 の決定1・決定2)」の語彙にそろえた(本文は不変) |
| L-2 | `adr/0155-*.md` のコンテキストの「当てた。」を「当てました。」へ |
| L-3 | `implementation-heavy.md` に7章を足し、枠の数え(18+2=20、変更後 17)を書いた |
| L-4 | 例外承認の対象外の文は RRS3 に足さない。ADR-0155 決定2 に、低減後 SR はゲートの判定基準の項目でなく 7.3 で外れる経路が無く、決定9 が受けると書いた。存在は M-1 の登録で確かめる |
| L-5 | `deliverable-templates.md` P-9c の「この ID は、出典の公式文書とは照合されていません。」を、裏づけが記録に無いので消した |
| L-6 | `overview.md` 1.7.2 の注意の枠の項に「`:::tip` と `:::warning` も同じ」を足した |
| L-7 | `tailoring-guide.md` の枠を「調整表は、実組織への適用フィードバックで更新されることがあります。」に改めた |

## 検査

`lint:evidence`・`lint:impl`・`lint:refs`・`lint:scope`・`lint:provisions`・`lint:dekimasu`・`lint:tone`・`lint:citations` は exit 0。`test:provisions` は 74/74。触った docs の textlint は違反 0。台帳(evidence・impl・scope)は再生成して差分なし。`test:regress` と全量の `npm run check` は流していない。

## 2巡目が見る差分

登録簿(`confirmedSafetyProhibitions`)と `prohibitionPresenceProblems` の実装・試験、overview.md 1.7.2 の2文(範囲と tip・warning)と枠、ADR-0132・0155・0156 の編集、`deliverable-templates.md` の2か所。
