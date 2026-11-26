# #361 node の public 2巡目の結果(束 B34、2026-11-26)

- リポ: `Takenori-Kusaka/pit-in-trial-node-pub-tmp`(public。作成済み、別アカウント ganbariquestsupport-lab を collaborator に招待し受諾)
- **本巡は議長の緊急の指示(マージコミットの作者・コミッターへの実アドレスの露出)により、持ち込みの PR #2 のマージの直後に打ち切った**。ルールセット・env-check・各項目は流していない。
- 合否の件数: **合 0 / 否 0 / 確かめられない・未実施 = 1巡目の記録のまま**(対象の項目は本巡で一つも観測していない)
- 観測できたこと(項目外の所見)

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| EV-0107(旧来の保護の下の持ち込み) | public では旧来の保護(必須チェック test・enforce_admins)を置けた(1巡目の private は 403)。持ち込みの PR #2 は gate-g5・gate-contract・ship-evidence-verify が赤でも、必須が test だけのため MERGEABLE(UNSTABLE)で取り込めた。開いていた PR #1(feat/wip)は CLEAN | 観測のみ | `trial-log.md` |
| F-10 | rebase マージのコミッターのメールが、マージしたアカウントの登録メール(実アドレス)になる。作者は noreply のまま。public では露出する | 否(安全上の所見) | `trial-log.md` |

## 後継に回すもの
public での再開には、マージの方式に依らずマージ操作のアカウントの実アドレスが載る問題の解消が先に要る。解消後に、1巡目で未確認の B-2・B-4a(ルールセットの下)・B-5・B-7・C-16・C-21・C-25・C-26・C-3・C-6a・C-19・C-20・C-4・C-5・C-6b と record-copy の連続マージの切り分けを流す。

## 削除の確認
`gh repo delete Takenori-Kusaka/pit-in-trial-node-pub-tmp --yes` の後、`gh repo view` の出力:

```
GraphQL: Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-node-pub-tmp'. (repository)
```
