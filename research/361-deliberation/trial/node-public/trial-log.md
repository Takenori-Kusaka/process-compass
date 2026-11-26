# trial-log (手順に無かった作業。node public、2026-11-26 JST)
- 作成: `gh repo create Takenori-Kusaka/pit-in-trial-node-pub-tmp --public`。リポ単位の git 設定は user.name "pit-in trial"、user.email noreply。以後の clone の email は `<id>+Takenori-Kusaka@users.noreply.github.com` に改めた(議長の補足)。
- 議長の緊急の指示で、マージの方式を rebase だけに設定(allow_squash_merge=false・allow_merge_commit=false)。squash の実測(C-27)は本リポで行わない。
- 確認(push 前): `git log --all --format='%ae %ce'` の全コミットの作者・コミッターは noreply のみ(実アドレス 0 件)。リモートの commits API の作者・コミッターも noreply のみ。
- 持ち込みの重なり4件(CODEOWNERS・.gitignore・CLAUDE.md・README)は1巡目と同じ形で合成。資産一覧の確定者・扱いは「試行の代記(人の判定ではない)」。
- 持ち込みの PR #2(`Spec: setup`)は、旧来の保護(必須チェック test のみ)の下で gate-g5・gate-contract・ship-evidence-verify が赤のまま mergeStateStatus=UNSTABLE・MERGEABLE だった。議長の指示どおり `gh pr merge --rebase` だけを使い、直後に確認した。
- **停止**: rebase のマージで作られたコミット 4bbc624 は、作者が noreply だったが、**コミッターのメールが所有者の登録メール(実アドレス)になり、public の main に載った**(`gh api repos/<r>/commits/<sha> --jq .commit.committer.email`)。議長の指示(2)に従い、それ以上進めずに記録を書き、リポを削除した。
- 所見: GitHub の rebase マージは、コミッターを「マージ操作をしたユーザーの登録メール」にする(squash は作者をそうする。python の観測)。noreply を使う設定(アカウントの「Keep my email addresses private」と「Block command line pushes that expose my email」)は、Web・API 経由のマージには効かなかった。public の一時リポでは、squash・merge commit・rebase のどの方式でも、PR をマージするアカウントの実アドレスが載る。マージをしないか、リポの作成者の公開メールを noreply にする(アカウント設定。本試行の許しの外)か、実アドレスを持たない別アカウントでマージする必要がある。
