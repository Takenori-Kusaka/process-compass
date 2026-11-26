# trial-log: 手順に無かった作業(python / pit-in-trial-python-tmp、2026-11-26)

| 時刻(JST) | 操作 | 理由 |
| --- | --- | --- |
| 16:45 | main へ `gh repo create --private` 後、ローカルの既定ブランチ名が master だったため `git checkout -b main` で作り直した | 一時リポの前提(§2.2)の作成。手順外の準備 |
| 16:50 | ルールセットと旧来の保護(§2.2 の既存の状態)を置こうとして 403。既存の状態を再現できない | Free の private。計画 §10 Q1 の裁定 |
| 17:00 | 持ち込み PR #1 の後、ship-evidence-verify が `.github/gate-node-version does not exist` で失敗(PR のベースの main にまだ無い) | 持ち込みの1本目の PR は、ベース側にテンプレートの道具が無いため pull_request_target 系が必ず落ちる。手順書に記載なし |
| 17:05 | `answers.json` を手で作成(形は SKILL.md の例) | `/process-init` を対話でなく回答ファイルで実行 |
| 17:08 | `pyproject.toml` の dev extras へ pip-audit・pip-licenses を追加 | 初期化の出力「作らないが要るもの」の指示。既存の dev extras は pytest・pytest-cov・ruff のみ(EV-0170 の食い違い) |
| 17:10 | `cp templates/00-d0-governance.md docs/D-0-governance.md` と generate-profile の再実行 | 初期化の出力の「次のコマンド」 |
| 17:20 | 出荷の PR を作れなかった(ship-evidence が G-6 の承認欠落で失敗し、ship/ ブランチが出ない)。承認は別のアカウントが要り、計画 §10 Q2 で使わない | 計画 §4。マージ・承認の操作はしていない |
| 17:25 | 全 PR をルールセット無しでマージした(保護なし。403 のため止められない) | §10 Q1 |
