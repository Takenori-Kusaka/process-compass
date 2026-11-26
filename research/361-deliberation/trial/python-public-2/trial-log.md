# trial-log(python public 3巡目、2026-11-26、template 616f039)

| 時刻(UTC) | 操作 | 理由・所見 |
| --- | --- | --- |
| 10:19 | 持ち込みの複製を README の例どおり `git -C template archive HEAD \| tar -x` で行った | 複製のファイルが CRLF で入った(template の submodule は core.autocrlf=true。git archive は作業ツリーの変換を適用する)。ファイル数 317、CR を含むのは 00-d0-governance.md(625 行)など |
| 10:20 | 持ち込み PR #1 の gate-contract が失敗(test-discouraged-evidence の 4 NG。「D-0 の記録の表へ行を書き込めた」) | **新しい欠陥 N-1(README の手順の穴)**: 試験の正規表現は `\|\n` を前提とし、CRLF では表の空行に当たらない。複製の元が CRLF だと、直した版でも gate-contract が落ちる。再現: core.autocrlf=true の clone で `git -C template archive HEAD \| tar -x -C X` し、X で `node scripts/gate/test-discouraged-evidence.mjs`(4 NG)。`git -c core.autocrlf=false -C template archive HEAD` で複製すると 0 NG。D-1 の原因の「未特定」は、少なくともこの環境では CRLF と確定 |
| 10:25 | `git -c core.autocrlf=false ... archive` で複製し直し、LF 版を同じ PR へ追加コミット | 上の対処。README は「`git -c core.autocrlf=false -C template archive <コミット>`」とすべき |
| 10:20 | 持ち込み PR #1 の ship-evidence-verify が失敗(基底に `.github/gate-node-version` が無い) | 既知の D-4(再現)。基底に道具が無い最初の PR で必ず落ちる |
| 10:30 | LF にした後の PR #1 の gate-contract が test-agent-run-record で 12/34 NG(ubuntu)。手元(Windows)では 34/34 | **新しい欠陥 N-3(手順の穴)**: template の `.githooks/commit-msg` は mode 100755 だが、Windows で tar 展開し `git add` すると 100644 で入る。Linux の CI ではフックが走らず、Agent-Run・Agent-Assets のトレーラが付かない。再現: Windows で複製→push→CI。直し: `git update-index --chmod=+x .githooks/commit-msg`。README の手順に無い |
| 10:30 | PR #1 の `.github/dependabot.yml` の検査(GitHub の dependabot)が FAILURE | **所見 N-2**: 雛形の package-ecosystem が npm(python のリポに package.json 無し)。ファイル内に「npm 以外は差し替える」とあるが、持ち込みの手順・事前点検は告げない。詳細の文言は dependabot-api の画面のみで取れず |
| 10:41 | 初期化の PR #2 で ip-clearance が「ライセンス違反 2件」(certifi=MPL-2.0、defusedxml=PSF)で失敗 | **新しい欠陥 N-5**: 許可リストに MPL-2.0・Python-2.0 は有る。`ip-clearance-python.mjs` が pip-licenses の自由文(`Mozilla Public License 2.0 (MPL 2.0)`・`Python Software Foundation License`)を SPDX 式として語に分割し、`mapClassifier` の対応表に届く前に不許可と判定する。再現は ip-clearance-repro.txt(9 例中 2 例が FAIL)。依存は合成アプリではなく、テンプレートが dev に要求する pip-audit の間接依存。テンプレートの欠陥であって合成アプリの性質ではない |
| 10:48 | team.json の適用後の env-check が「ルールセットの適用」を不一致(dismiss_stale・last push 無効)と読んだ | **新しい欠陥 N-6**: 既存ルールセット(その2つが false)と team(true)が重なる。API は規則を別々に返し、実効は GitHub が厳しい方を採る。PR #3 で内容の変更を push すると承認は DISMISSED(実効は有効)。env-check は重なりを集約せず偽の不一致を出す。ただし空コミットでは失効しない(GitHub の挙動) |
| 10:50 | team の適用後、gate-g5 が赤(d0-check・g1-check・ip-clearance。人の欄は埋めない)のため PR #3 は承認があっても BLOCKED。main へマージできない | 意図どおり。以後の検査は基底 `trial-target`(別のルールセット)で行った |
| 10:52 | フォークの clone から新ブランチを push すると、workflow を変えていない場合でも、OAuth の workflow scope が無いと拒否された(probe.yml を足した場合。scope は足さない) | probe は基底ブランチ trial-target に置き、フォーク PR の pull_request の定義として走らせた |
