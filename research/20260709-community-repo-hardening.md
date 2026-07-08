# .github コミュニティ標準・サイト品質ゲートの整備 — リサーチ結果(2026-07-09)

Issue: #68 / 検証方法: deep-research 第2弾(5アングル → 21ソース → 100クレーム抽出 → 上位25件を3票制検証、24件 confirmed・反証0。出典は docs.github.com と docs.astro.build が中心)

## 確定した事実(公式ドキュメントで逐語確認済み)

### コミュニティヘルスファイル

- GitHub が公式サポートするデフォルトファイル: CODE_OF_CONDUCT.md / CONTRIBUTING.md / FUNDING.yml / GOVERNANCE.md / Issue・PR テンプレート(config.yml 含む)/ SECURITY.md / SUPPORT.md / Discussion カテゴリフォーム
- Community Standards チェックリストは README・CODE_OF_CONDUCT・LICENSE・CONTRIBUTING 等の存在を「サポートされた場所」で検査する
- SECURITY.md の必須要素は「サポート対象バージョン」と「報告方法」の2点
- CODEOWNERS は .github/ → ルート → docs/ の順で最初の1つだけが有効。PR が開かれると該当オーナーが自動でレビュアー指名される(ドラフト PR は対象外)

### ソロ → 複数人移行

- ルールセット(rulesets)は従来のブランチ保護より透明性が高く、read 権限者もアクティブなルールを閲覧できる → 公開 OSS では貢献者がルールを事前把握できる利点
- 「Require review from Code Owners」はオーナーのうち1名の承認で要件を満たす

### サイト品質・SEO

- starlight-links-validator: Starlight ビルドに統合して内部リンクのみ検証(外部リンクは対象外)
- lychee-action: 外部リンク検査の定番。cron 定期実行 + Create Issue From File で自動起票する監視型運用が README の第一例(PR ブロック型ではない)
- @astrojs/sitemap は `site` 設定が前提(設定済み)。発見性向上には robots.txt に `Sitemap:` 行を書くのが公式推奨

## 導入 / 見送りの判断

| 項目 | 判断 | 理由 |
| --- | --- | --- |
| CONTRIBUTING.md(ルート) | ✅ 導入 | Community Standards 必須項目。Issue 駆動・check・執筆規約への導線 |
| CODE_OF_CONDUCT.md(ルート) | ✅ 導入 | Contributor Covenant v2.1 ベースの日本語版。連絡先明記 |
| .github/SECURITY.md | ✅ 導入 | Private Vulnerability Reporting も API で有効化済み |
| .github/SUPPORT.md | ✅ 導入 | Discussions / Issues への振り分け表 |
| .github/CODEOWNERS | ✅ 導入 | PR フロー移行の事前準備(`* @Takenori-Kusaka`) |
| starlight-links-validator | ✅ 導入 | ビルド時に内部リンク検証(check に統合) |
| lychee 週次ワークフロー | ✅ 導入 | 外部リンク切れを週次で検査し Issue 自動起票 |
| robots.txt + Sitemap 行 | ✅ 導入 | public/robots.txt |
| README 英語概要 | ✅ 導入 | バイリンガルの入口(本文は日本語主体を維持) |
| PR フロー移行チェックリスト | ✅ 文書化 | ルールセット有効化は移行時に実施(今は main 直 push 運用のため) |
| GOVERNANCE.md | ❌ 見送り | ソロ期に統治文書は過剰。複数メンテナー化で再検討 |
| FUNDING.yml | ❌ 見送り | 資金募集の予定なし |
| stale bot | ❌ 見送り | フィードバック歓迎方針と相反(古い Issue の自動クローズは意見を捨てる行為) |
| markdownlint | ❌ 見送り | textlint と役割重複。書式は Prettier 系の必要が出たら再検討 |
| Lighthouse CI / a11y 検査 | ⏸ 保留 | Starlight 自体が高スコア設計。ツール化(M7)の段階で導入検討 |
| Google Search Console | ⏸ ユーザー作業 | 所有権確認が必要なため手動。robots.txt / sitemap は準備済み |

## 併せて実施したアップグレード

- starlight-links-validator の peer 要件に合わせ、Astro 5 → 7 / Starlight 0.34 → 0.41 へ更新(npm 脆弱性 4件 → 0件)
- 破壊的変更対応: sidebar の autogenerate グループを v0.39 以降の `items` 形式へ移行

## 出典(主要)

- https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories
- https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file
- https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
- https://github.com/HiDeoo/starlight-links-validator / https://github.com/lycheeverse/lychee-action
- https://docs.astro.build/en/guides/integrations-guide/sitemap/
