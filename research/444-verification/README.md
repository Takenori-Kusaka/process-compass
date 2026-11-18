# #444 WSL2 の実機の確認の記録(段 I6)

実施日時: 2026-11-18 10:49〜10:55 UTC(日本時間 19:49〜19:55)。担当: 束 B20 の段 I6。

## 環境

| 項目 | 値 |
| --- | --- |
| 基盤 | WSL2、Ubuntu-24.04(`wsl -d Ubuntu-24.04`) |
| Claude Code | 2.1.314(導入済みのもの。Windows 側の 2.1.327 は入れていない) |
| node / git | v22.23.4 / 2.43.0 |
| 隔離の前提 | `/usr/bin/bwrap`・`/usr/bin/socat` が存在 |
| 作業場所 | Linux 側 `~/b20-verify/6c416e6/w/`(`/mnt/` の下を使わない) |
| template | コミット 6c416e66704c94ab7b6c897e2510373206e96e80(ローカルのブランチ b20)の写し。`git clone` で Linux 側へ作り、`.git` を除いて新しい git リポジトリへ写し、`@OWNER` を置換して初期化した |
| 初期化 | `generate-profile.mjs --answers <1〜2名・PoC・CL0 の回答> --stack node`。`guard.enabled` は真。生成された `.claude/settings.json` の `sandbox` は `enabled:true`・`allowUnsandboxedCommands:false`・`allowedDomains` が `registry.npmjs.org`・`github.com`・`api.github.com` |
| 実行の方法 | `claude -p`(ヘッドレス)。作業場所は信頼を受け入れていない(`~/.claude.json` を変えていない)ため、`permissions.allow` の 21 件は無視され、必要な許可は `--allowedTools` で与えた。SessionStart のフックと、隔離の設定は、信頼を受け入れていない状態でも効いた |
| 認証 | 導入済みの認証をそのまま使った。読み出し・複製・変更はしていない |

## 結果

| 確認 | 期待 | 結果 | 証跡(`raw/`) |
| --- | --- | --- | --- |
| T1 | `.claude/agent-runs/<id>.json` が 1 件でき、id・base・digest が一致 | 満たした。id は `--session-id` で固定した値と同一。base は `git rev-parse HEAD`(525db47d…)と一致。digest は `assetsDigest()`(01502cc0…)と一致 | `t1.txt`(「already in use」は 2 回目の呼び出し。記録は 1 回目で作られた) |
| T2 | コミットに `Agent-Run` が 1 度だけ、`Agent-Assets` が `assets <id>` の出力と一致。人のコミットには付かない | 満たした。トレーラ 1 組。`Agent-Assets` は `assets <id>` の出力と文字列で一致。人の端末のコミット(環境変数なし)には付かなかった | `t2.txt`、`t2b.txt` |
| T3 | 再開の後も同じ id、記録の `sha256sum` が前後で同一。再開の前に `CLAUDE.md` を変えても値が変わらない | 満たした。再開の前後の sha256 は b8c4875d…で同一。`CLAUDE.md` を変えた状態(digest は 693f4b94…に変化)でも、トレーラは記録の値(01502cc0…)のまま | `t3.txt` |
| T4 | 下位の担当の中のコミットの結果を事実として記録 | 下位の担当(Agent ツール)が `git commit` を実行した(副次の記録 `subagents/agent-*.jsonl` に命令が残る)。**SessionStart の記録は増えなかった**(前 2 件、後 3 件、増えたのは親の 1 件だけ)。コミットには**親の `Agent-Run`** と、親の記録の `Agent-Assets` が付いた | `t4.txt`、`t4-before.txt` |
| S1 | 隔離なしで全部書ける | 満たした。10 経路すべて書け、通信も 4 宛先とも 200 | `S1.txt` |
| S2 | 拒否された経路の一覧(ファイルの実在で確かめる) | 作業ディレクトリの内は書けた。外(`../`・ホーム)は EROFS、`.claude/settings.json`・`.claude/guard.json`・`scripts/gate`・`.github/workflows`・`.git/hooks` は EROFS、`.claude/settings.local.json` は EACCES で拒否。**`.githooks/` は書けた**。ファイルの実在・不在を `S2.txt` の末尾に記録した | `S2.txt` |
| S3 | 生成した deny の Edit と Write の 10 パスから、シェルで書けない(sha256 の前後が同一) | **満たした**。10 パスすべてで `Read-only file system`・rc=1・sha256 が前後で同一。対照(`sandbox.enabled:false`)では 10 パスすべてが書き換わった | `S3.txt`、`S3ctl.txt` |
| S4 | 許可した宛先だけに通信でき、example.com は拒否。隔離の外での実行の要求が拒否される | 満たした。3 宛先は 200、example.com は 403 の CONNECT 失敗(一度は 000)。`dangerouslyDisableSandbox: true` を要求しても、書き込み先は Read-only のままで、ファイルは作られなかった(`FILE ABSENT`) | `S4.txt`、`S2.txt` |
| 自身の手順 | 隔離のもとで、フックつきのコミット・`next.mjs`・`aggregate-evidence.mjs` が終了コード 0 | **一部だけ満たした**。コミットは 0 で、トレーラが付いた。`next.mjs` は 0。`aggregate-evidence.mjs` は **1**(記録の欠落 17 件。初期化の直後で、出荷の証跡が無いため)。隔離なしの実行と出力が一致する(差分 0 行)。拒否を示す語は出力に無い | `self.txt`、`self-aggregate-sandboxed.out`、`self-aggregate-plain.out` |
| Windows の観測 | Windows の 2.1.327 で警告と探りを記録 | **実施していない**(本段の範囲は 0207・1019・0506・0510。IMPL-0507 の note は変えていない) | - |

## 判定と反映

| マーク | 判定 | 反映 |
| --- | --- | --- |
| IMPL-0207 | T1〜T3 を満たした | delivered / machine(`test-agent-run-record.mjs`)へ移した |
| IMPL-1019 | T1〜T3 を満たした。T4 は事実の記録 | delivered / machine へ移した |
| IMPL-0510 | S3 を満たした | delivered / manual へ移した |
| IMPL-0506 | S1・S2・S4 は満たした。自身の手順の「3 つとも終了コード 0」は、文言のままでは満たしていない | 議長の裁定(`chair-ruling-0506.md`、2026-11-18)で条件を「隔離のもとの終了コードと出力が、隔離なしの対照と一致する」へ改め、**delivered / manual へ移した**(段 I7)。条件は結果の後に改めた。記録のそろった案件での終了コード 0 は、隔離のもとでは確かめていない |

IMPL-0506 の論点(議長の裁定は `research/444-verification/chair-ruling-0506.md` にある。採った読み替えは次の段落のとおり。独立の突合の対象に含める): 手順の止める条件は文字どおりに適用した。`aggregate-evidence.mjs` の終了コード 1 は、隔離が原因ではなく(隔離なしの実行と出力が同一)、初期化の直後に出荷の証跡の集約が通らない設計どおりの結果である。条件を「隔離のもとの結果が、隔離なしの結果と同じ」に読み替えるなら、0506 は満たす。読み替えは裁定が決める。

## 気づいたこと(裁定に無い点)

- 下位の担当の中のコミットは親の `Agent-Run` を持つ。下位を区別して引き当てることはできない。EV-0319 の差し替え条件を、この事実に合わせて直した
- `.githooks/` は deny にも隔離の書き込みの拒否にも載らず、隔離のもとでも書ける。`commit-msg` の差し替えで `Agent-Run` を付けない経路が開く。ADR-0222 の申し送り(`.githooks/commit-msg` を deny に載せない)と同じ事実で、実機で確かめた
- `core.hooksPath` は、最初の SessionStart の後に `.githooks` になっていた。初期化の前後のどちらで設定されたかは、T2 の「前」の記録が最初の実行の後だったため、区別していない
- 実験の誤りを 2 件直して再実行した: S2 は前の S1 が作った `../outside.txt` を拾ったため、削除して再実行した。S3 の最初の版は `/tmp` への標準エラーの退避が隔離で拒否され、無効だった(書き込み先を変えて再実行)。無効だった実行の記録は残していない。また S3 の対照では、1 回目はエージェントが強制層への書き込みを自発的に断ったため、「実験用の使い捨ての場所である」旨を伝えて再実行した。隔離の設定は一度も緩めていない
- 信頼を受け入れていない作業場所の `-p` での確認であり、対話の起動は確かめていない
- 実在の認証情報・鍵・ホームの設定ファイルは読んでいない。隔離の確認で外へ出した通信は、許可した 3 宛先と example.com への `curl`(本文なし)だけである。ホームへの書き込みの探りは、使い捨てのディレクトリ(`~/b20-verify/`)の直下のみである

## 手順の再現

`raw/scripts/` に実行したスクリプトを置いた(`s3.sh` が初期化、`t1`〜`t4` が T1〜T4、`s12`・`s2only` が S1・S2、`s3re` が S3、`s4b` が S4、`s5`・`s6` が自身の手順)。Linux 側のパスは `~/b20-verify/6c416e6/`。

## 未確認(開示を保つ)

macOS・ネイティブ Linux・ネイティブ Windows(2.1.327 の観測を含む)は確かめていない。

## 議長の裁定(独立の突合 1巡目 R1-08。`research/448-deliberation/b20-round1-ruling.md` 5.3 節)

条件は結果を見た後に改めた。

| 条件 | 裁定 | 理由 |
| --- | --- | --- |
| T1〜T3 の「WSL2 と Windows で」 | Windows を条件から外し、WSL2 の実機の記録で受ける | 所有者の回答の問1 は WSL2 を実機の記録と定めた。ネイティブの Windows の T1〜T3 は未実施であり、EV-0319 の差し替え条件に「ネイティブの Windows」を足して開示した |
| T4 の期待「`unknown` と出る」 | 「`unknown` か、親の識別子と親の要約値」へ改める | 実機では親の値が付いた。版は親の実行から引けるので、外す対象にしない。下位の担当を親と区別できない限界は EV-0319 が開示している |
