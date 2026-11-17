# Issue #354 項目2 と #352 の template の直し: 実装の記録(2026-11-17)

指示の正本は `item2-decision-draft.md` の 4・5 章と、8章(議長の裁定)。

## 実装

- template(ブランチ b8-354。b8-356 の b780a76 の上): コミット dcc5c4a
  - `scripts/gate/config.mjs`: `sharedCredentialForbiddenPairs` を足し、`claimStatus` が `derived: 'performer-credential-shared'` を数える。禁止の組は、構成の `separations`(生成が書く。知識ベースの組 + 出荷判定者 × 事業決裁者 + 規模の組)から読む。`unit: 'context'` の規則は除く。`generate-profile.mjs` と共通の関数へ移す必要は無かった(構成が表を持つため)。`performerAccountProblems` は同じ id を申告した禁止の組に notes を1行出す(problems にはしない)
  - `scripts/gate/aggregate-evidence.mjs`: `claimForRange` に 3-2(a)。保持者が1名以下のコア機能、または層1 の記名者 = 事業決裁者を `unlistedDepartures` と `blockers` に足し、名を適用の表明へ下げる。引き継ぎ文書なし・節2 にコア機能の記載なし・層1 なしは、名を下げず `unverifiable` と blockers に「名は下げません。人が確かめます」を出す
  - `scripts/init/generate-profile.mjs`: B-1 を「A を採る場合」の文へ。B-2(`00-d0-governance.md` の 119・121 行、README の 446 行)の語を直した
- 本体: `overview.md` の IMPL-0521 を `delivered check=machine` へ、IMPL-1100(秘匿。issue=356)・IMPL-1101(認証情報の残り。issue=446)を新設(仮の番号。議長が付け直す)。`impl-inventory.yaml` を合わせた。ADR-0147 を新設した(欄を足さない決定、採らない案、1.10.2 と 3.5.3 の食い違いを #446 へ寄せること)。ADR の書式に人の欄は無く、承認者などは書いていない

## 試験

- `test-performer-account.mjs`(66 件): 禁止の組の同じ専用アカウント(i)、禁止でない組(ii)、異なる id(iii)、`unit: context`、separations なし
- `test-edition-end.mjs`(53 件): 保持者1名の引き継ぎ文書(iv)、層1 の記名者 = 事業決裁者(v)、記録なし(vi)
- 関係する試験を通した: test-init-g5・test-loosening-decider・test-material-attribution・test-material-records-more・test-records-history・test-roster-rules(186 件)・test-handover-items・test-aggregate-records・test-assurance-period
- 本体: lint:refs・lint:impl・lint:evidence・lint:scope・lint:provisions・lint:tone・lint:text・test:fields・test:template・test:impl・lint:registry、直した md への textlint

## 壊して確かめた場面

- 3-2(a) の判定を外す(`aggregate-evidence.mjs` を b780a76 の版へ戻す): test-edition-end の (iv)(v) が NG、(vi) は `unverifiable` が無く落ちた
- 3-2(b) の判定を外す(`config.mjs` を b780a76 の版へ戻す): test-performer-account の (i) の2件(離脱1件・適用の表明、注記)が NG
- 外した後は元へ戻し、通ることを確かめた

## 7章「確かめていないこと」の結果

- 離脱の一覧への追加は再現した。実装前の集約は、保持者1名の引き継ぎ文書でも `unlistedDepartures` が空だった(同じ出力の中で、保証の開示の表は 1名以下 と出す)。直した後は一覧に出て、blockers に「記録から数えた」が出る
- **名が「適合の主張」と出る状態は再現していない**。一時のリポジトリの集約は、別の記録の欠落(9〜14 件)が先に名を適用の表明へ下げた。名の食い違いは、欠落が0件の案件でだけ起きる。検査は離脱の一覧への追加で固定した
- `claimStatus` が規模の組まで含む表を得られるか: 得られた。構成の `separations` が書かれており、`config.mjs` に表を組み立てる関数を移す必要は無かった。ただし `separations` を持たない旧い構成では数えない(読めないときは数えない向き。試験あり)
- 範囲の終点のコミットの記録を読めるか: 読めない。`continuityState`・`readPolicy` は作業ツリーを読む。IMPL-0521 の note と ADR-0147 に書いた。未解決
- 既存の試験(名を固定する試験)は落ちなかった

## やり残し

- `generate-profile.mjs` の 1201・3744・4345 行、`verify-gate-contract.mjs` の 374 行に「代償措置は定められていない」の旧い語が残る(生成される D-0 の文を含む)。指示の B-2 の範囲外のため直していない
- 注記の「数えない」は、記録が無いときの確かめられない旨を、構成書(PROCESS-PROFILE.md)ではなく集約の出力にだけ出す
- IMPL-1100・IMPL-1101 の番号は仮。議長が push の前に付け直し、ADR-0147 の本文は番号を書かないので影響しない。overview.md の IMPL-0521 の note・`impl-inventory.yaml` には番号が残る
- #446 へ 1.10.2 と 3.5.3 の食い違いを寄せるコメントは、まだ投稿していない(議長の担当)
- 独立の突合へ渡す点: 7章の未確認(名の「適合の主張」の再現・終点のコミットの記録)と、2.3 の採らない案の理由の当否
