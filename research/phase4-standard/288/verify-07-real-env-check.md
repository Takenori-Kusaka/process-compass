# 288 実環境での要件⑦(env-check)の読み取りの確認(2026-10-08)— 主担当の実走

模擬ではなく本物の GitHub に対して、導入前の検証の要件⑦(実環境の統制の確認)の読み取りが
実 API の形で動くかを確かめた。対象はオーナー自身の2リポジトリ。読み取りだけで、書き込みはしていない。

## 手順

- テンプレート最終版(pit-in-template `bcaf3da`)を `tmp/envcheck-real/` へ展開し、
  規制業の回答(`size-3-9 / growth / quality-regulated / cl1 / inhouse / gates-exist / ai-approved-only`)で初期化
- `node scripts/gate/adoption-trial.mjs env-check --by <氏名> --repo <owner/name>` を、
  本物の gh(認証済み)で実行

## 結果

| 対象 | ルールセット | PR のレビュー | gate-g5 の成果物 | 判定 |
| --- | --- | --- | --- | --- |
| Takenori-Kusaka/pit-in-template | 既定ブランチに効いているルールセットが無い(API は `[]`) | PR #52 のレビューが 0 件 | 実行 37650495125 の成果物に license-scan・test-results が無い | 3項目とも未確認(読めない) |
| Takenori-Kusaka/process-compass | 同上(`[]`) | PR #197 のレビューが 0 件 | gate-g5 のワークフローが無い | 3項目とも未確認(読めない) |

- 実 API(`repos/{owner}/{repo}/rules/branches/{branch}`、`pr list`、`pulls/{n}/reviews`、`run list`、`actions/runs/{id}/artifacts`)の応答を
  読み取り、例外や誤判定なく「未確認(読めない)」と理由を出した。記録 `env-check.json` を書き、確認済みの項目が無いため
  実環境の識別は「無し」と出た
- 「確認済み」に至る経路(ルールセットが適用され、承認のある PR と成果物のある実行が存在する環境)は、
  オーナーのリポジトリにその設定が無いため実環境では確かめていない。固定応答での確認(第7巡)にとどまる

## 位置づけ

- 6回目の判定(`verify-06-findings.md`)が「標準側の未確認」とした「実環境の API の形が env-check の期待と違う場合の挙動」のうち、
  **読み取りの経路**は実環境で確かめた。黙って確認済みに倒れる誤りは起きなかった
- 「確認済み」の経路の実環境での確認は、採用者の最初の導入前の検証に残る(採用者の作業)
