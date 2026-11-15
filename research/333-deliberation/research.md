# #333 調査(内部の確認と実行での確認。結論は出さない)

確認日 2026-11-15。template は 1e30869。

## 1. 規定と実装マークの所在

- 決定: `research/294-deliberation/decision.md` の K-7(L18・L91 以降)、7章 別 Issue 1
- 本文の正本: `src/content/docs/phase4-process-design/gate-criteria.md` L241「判定記録と、出荷の証跡(G-7 の集約の出力)が指す記録は、組織が定める保管期間のあいだ、到達できなければなりません」。CI 既定の保持を保管とみなさない旨は同ページと ADR-0078 決定4
- 従属の記述: `phase5-implementation/ci-gates.md` L802〜(GitHub の保持の事実、2026-10-23 時点)、`phase5-implementation/qms-document-control.md` L168
- 実装マーク(gate-criteria.md L245・L247、台帳 `src/data/impl-inventory.yaml` L582〜585、いずれも state=undelivered、issue=333、review=2027-04)
  - IMPL-0243 target=ship-evidence-workflow: 出荷の証跡を到達できる置き場に残す
  - IMPL-0244 target=evidence-aggregation: 保持切れで読めない PR の G-5 を、必須チェックを経ていないことと区別して出す

## 2. Issue の4つの事象の確認

| # | 主張 | 確認 | 所見 |
| --- | --- | --- | --- |
| 1 | 証跡が成果物にだけあり、retention-days 未指定、evidence/ は gitignore | 一部が誤り | `ship-evidence.yml` L164〜174 の upload-artifact(name: ship-evidence)は retention-days 無し(確認。ai-review.yml L165 は 90 を明示)。.gitignore L24 `/evidence/` も確認。ただし出荷の PR が品質レポートを `docs/evidence/<日付>-<範囲>.md` へ `git add -f` でコミットし(L208〜229)、基底ブランチに残る(`/evidence/` はルート直下のみで docs/evidence/ は無視されない)。成果物にだけ残るのは evidence.json と assurance-disclosure.external.md(外へ渡す版)、ship-pr-url.txt。レポートが指す元の記録(gate-g5 の test-results・license-scan・coverage-result などの成果物、PR のレビュー、check-runs)は別の置き場で、そちらの保持が問題 |
| 2 | 履歴の保持切れで G-7 の集約が G-5 を誤示 | 読みで確認 | aggregate-evidence.mjs L1293〜1311 は rollup を読めない場合に rollup 抜きで取り直す(過去の通し実行の発見)。L2011 は rollup 無しなら `g5FromCheckRuns(headSha)`。それも無ければ g5='unknown' となり L2964 が「gate-g5 の結果の記録がありません(必須チェックを経ずにマージされた可能性…)」と出す。保持切れと未経由を区別する分岐は無い。実機での保持切れは未再現(2026 年 10 月以降の古い PR が要る)。試験は未実行 |
| 3 | coverage の結果を取り込まず開示が常に未測定 | 確認(コード) | gate-g5.yml L256〜260 が `coverage-result` 成果物を上げる。ship-evidence.yml L125〜145 が取り込むのは license-scan と test-results だけ。集約 L1117 は `evidence/coverage-result.json` が無ければ未測定。ship-evidence の他の箇所に coverage-result の取り込みは無い(grep で全件確認)。「常に」かは、ship-evidence が checkout 内に coverage-result.json を作る経路がなく、ほぼ常に。実機では未確認 |
| 4 | 検証の文の写しと改変の検出 | 現状未実装 | record-copy.yml は承認レビューの写しだけ(pr・merge_commit_sha・head_sha・author・レビューの id・本文など)。PR 本文は prRecordFromCopy が写しの題名・本文を読む箇所(L314)があるが、「検証方法と結果」の改変検出としては使っていない。PR 本文はマージ後も編集できる |

## 3. 既存の保管の先行例(テンプレート内)

- 記録用ブランチ `records`(record-copy.yml): 履歴の書き換えと削除を規則で止めた同一リポジトリのブランチ。GITHUB_TOKEN の push が通ると 2026-10-23 に実機確認済み。書き込みの権限者の追記までは防げず、集約が履歴の走査とホスティングとの突合で検出する(ADR-0109)
- 出荷の PR(ship-evidence.yml (b)(c)): 品質レポートと複製を基底ブランチへ入れる。通しの実行は 2026-10-23 時点で未確認と明記

## 4. 置き場の候補

| 案 | 内容 | 長所 | 短所 | 機械で閉じる範囲 |
| --- | --- | --- | --- | --- |
| A | リポジトリへのコミット(`records` ブランチへ証跡一式を追記。または出荷の PR で docs/evidence/ に一式を置く) | 版管理・履歴・ルールセット(削除・書き換え禁止)が使える。保持が CI 設定に依らない。既存の records・出荷の PR と同じ形で、集約が読む経路も既にある。リポジトリが残る限り到達できる | バイナリ・大きい成果物でリポジトリが膨らむ。書き込み権限者は新しいコミットで改変できる(履歴には残る)。リポジトリの外の保管期間(組織の文書管理規程)との対応は採用者の確認が残る | 機械で閉じる: ファイルの存在・記録された digest と内容の一致・追記のみ(既存の上書き無し)・保管先に指す先が実在すること。閉じない: 改ざんの防止、保管期間の値の妥当性(manual) |
| B | リリースの資産(GitHub Release の assets) | 成果物と違い 90 日で消えない。出荷の単位と結びつく。タグに固定できる | 作成者や権限者が資産を差し替え・削除できる(不変リリースの設定が要る。設定の有無は 5 節で確認)。出荷の単位以外の証跡(gate-g5 の都度の記録)は対象外。リリースを使わない採用者がいる | 存在・digest の一致。不変の設定は採用者の設定(adopter) |
| C | 成果物 + retention-days の明示(上限まで) | 変更が小さく、既存の経路が変わらない(ただし小ささは理由にしない) | 上限(公開 90 日、非公開 400 日)があり、組織の保管期間が超えれば期限切れは避けられない。設定は遡らない。保持切れは削除と区別して扱う必要。保管とみなせるかは採用者の期間次第 | retention-days が明示されること(構文)と、値が構成の保管期間以下でないこと。期間が足りるかは manual |
| D | 外部の保管への引き渡しを採用者に委ねる(adopter) | 組織の文書管理(WORM ストレージ、DMS 等)に直接つなげる。標準の「組織が定める保管期間」と整合 | 標準は新しい義務を採用者に課す(重の審議が要る)。テンプレート側は降ろし口(フック・出力の固定名)しか提供できない。引き渡しの実行は機械で検証できない | 引き渡す対象の列挙と digest の出力まで機械。実際の保管と期間は adopter(根拠水準マークで開示) |
| E | 署名つき attestation(GitHub Artifact Attestations) | 来歴の署名が付き、改変検出に強い | 保持と到達性の問題を解かない(署名は成果物と別の保管)。プラン・可視性の条件がある(5 節で確認する範囲) | 検証コマンドの実行は決定可能。到達性は別 |

案は排他でない(例: A で保管、E で改変検出を補う)。

## 5. GitHub の保持の事実(公式ドキュメントで確認する範囲)

本担当の環境では外部の取得を行っていない。既に ci-gates.md L802〜(2026-10-23 時点)が次を記述している: 成果物とログの既定 90 日、公開 1〜90 日・非公開 1〜400 日、設定は遡らない、チェックの履歴は 2026-10-01 以降設定の保持に従う。リリースの資産の不変設定、attestation の保持・提供条件、リポジトリ内のコミットの削除条件は未確認。会議体の前に、公式ドキュメントの URL と確認日 2026-11-15 を追記する必要がある(下記のうち、リリースの不変設定・attestation・保持の最新が対象)。

## 6. 議長への論点

1. 保管するのは何か: (ア)出荷の品質レポート(既にコミットされる) (イ)evidence.json・外へ渡す開示 (ウ)レポートが指す元の記録(test-results・license-scan・coverage-result・check-runs の結果) のどれか。Issue は(イ)(ウ)を前提にしているが、(ア)は済んでいる
2. IMPL-0244(保持切れの誤診)は、保管の置き場とは独立に直せる: g5 の無記録を「保持切れの可能性(PR のマージ日が保持期間の外)」と「経由していない可能性」に分けて出す。決定可能な条件(マージ日と保持の設定の比較)で閉じる
3. coverage の取り込みは配線の欠け(軽の編集または回帰)
4. 検証の文の改変検出は、写しの対象に PR 本文を加える案。ADR-0109 の突合の拡張で、record-copy の写しの欄の追加を伴う
5. 不変性は機械で閉じない。manual か adopter の開示にする
