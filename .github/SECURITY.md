# セキュリティポリシー

## 対象

本リポジトリはドキュメント主体の静的サイト(GitHub Pages)です。セキュリティ上の関心対象は次のとおりです。

- 依存パッケージ(npm)の脆弱性
- GitHub Actions ワークフローの設定不備
- 公開サイト上の問題(意図しない情報の露出など)

対象バージョン: `main` ブランチ(公開サイトは常に main の最新)。

## 脆弱性の報告方法

**公開 Issue には書かないでください。** 次のいずれかで非公開に報告をお願いします。

1. GitHub の [Private Vulnerability Reporting](https://github.com/Takenori-Kusaka/process-compass/security/advisories/new)(推奨)
2. メール: takenori.kusaka@gmail.com

報告には、再現手順・影響範囲・可能であれば修正案を含めてください。原則7日以内に受領の返信をします。
