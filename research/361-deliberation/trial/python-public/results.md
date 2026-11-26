# #361 python 2巡目(public)の結果 — 途中で中断(2026-11-26)

中断の理由: GitHub のスカッシュのマージは、コミットの作者を PR の作成者のアカウントの登録メール(実アドレス)にする。PR #1 のスカッシュで、public の main に所有者の実アドレスのコミットが1件載った(自分のコミットは trial-bot の noreply で作っていた)。アカウントのメール設定は触れないので、以後のスカッシュも同じになる。議長の指示(実アドレスを載せない)に従い、一時リポを削除して止めた。再開には、所有者が GitHub のメールの非公開設定を有効にするか、スカッシュ以外で取り込む許しが要る。

## 観測できた項目

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| P1(B-3a 補) | public では既存のルールセット(承認1・必須 pytest)と旧来の保護(必須 lint・管理者にも適用)を置けた(1巡目の private は 403)。作成者の `gh pr merge` は「base branch policy prohibits the merge」で拒否。別のアカウントの承認の後にマージできた。必須でない ship-evidence-verify が失敗でも(UNSTABLE)マージされた | 合 | rs1.txt、prot1.txt、merge-refusal-pr1.txt、pr1-checks.txt |
| B-3a | 事前点検 1回目: 止める3(CODEOWNERS 2か所・@OWNER・資産一覧)・告げる6。CLAUDE.md の連結後は目印の欠落は出ない。直し後 止める0 | 合 | preflight-1-before.txt、preflight-2-after-fix.txt、adoption-inventory.md |
| B-1 | 持ち込み PR #1 は ship-evidence-verify が落ちる(1巡目と同じ。ベース側に道具が無い) | 合(再現) | pr1-checks.txt |
| EV-0170 | 初期化の出力が pip-audit・pip-licenses を「作るもの」と列挙(1巡目と同じ)。PR #2 を開いたところで中断。ip-clearance の違反の中身は調べられなかった | 確かめられない(1巡目の否は再現のみ) | init-output.txt |
| B-2・B-4a・B-7・C-17・C-27・C-6a・C-4・C-5・C-6b・C-1・P10 | 未実施 | 確かめられない | — |

件数: 合 3 / 否 0 / 確かめられない 多数(上記)。

## 削除

```
GraphQL: Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-python-pub-tmp'. (repository)
GraphQL: Could not resolve to a Repository with the name 'ganbariquestsupport-lab/pit-in-trial-python-pub-tmp'. (repository)
```
フォークは作っていない。
