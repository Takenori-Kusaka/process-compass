# 束 B20 実装 I5 の報告

- 範囲: light の 1 節(対立 2・対立 4)、8 節 U10(0683・0883・0890・0827)、U11(0207 → 1019 → 0743 → 0828)、9 節 U12(0506 → 0510 → 0200)。ADR-0222
- template のコミット(ブランチ b20): 0683、0883・0890・0827、U11(実行の記録)、U12(隔離)、ワークフローへの試験の登録。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I5-01.bundle` 〜 `-05.bundle`(連番の最後が最新)
- template と本体は push していない

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| 0683 | `effectiveAllowedLicenses(config, day)` を新設(期限の日は有効、翌日から外れる。欠けた行は入れない)。`adapter.mjs` だけが呼んで `PIT_IN_ALLOWED_LICENSES` へ渡す。`generate-profile.mjs` が設定の検査で `license`・`expires`(実在の日付)・`approvedBy`・`reason` の欠けを拒否し、構成の `ci.provisionalLicenses` を再生成で引き継ぎ、追加を「緩める向き」の差分に出す。保証の開示 項目5 に有効な許可と期限・期限切れ・欠けを出す。`kinds/settings.md` に書き方を足した。Python の `ip-clearance-python.mjs` は暫定の許可を読まない(止める側に倒れる) | `license-allowlist.mjs`・`adapter.mjs`・`generate-profile.mjs`・`aggregate-evidence.mjs`・`settings.md` |
| 0883 | `check-g1.mjs` が企画書の `project_id` と構成の `projectId` の一致、`context/projects/<案件ID>.md` の実在を確かめる。ファイルの不在は G-1 の前なら失敗、通過済みなら注意。不一致は通過済みでも失敗 | `check-g1.mjs`・`test-project-id.mjs` |
| 0890・0827 | process-change の種別 `accountable` に「交代の前に、理解保持者の数を確かめる」、種別 `outage` に切り替え後の品質の確認(下回る・読めないなら `handling: stop`)を足した | `kinds/accountable.md`・`kinds/outage.md` |
| 0207 | `.githooks/commit-msg`(環境変数 `CLAUDE_CODE_SESSION_ID` があるときだけ `git interpret-trailers --if-exists doNothing` で足す)、`agent-run-record.mjs record`(SessionStart。`core.hooksPath` は未設定のときだけ `.githooks`)、`settings.json` の SessionStart に登録、`.gitattributes` で `.githooks/*` を LF に固定 | `.githooks/commit-msg`・`agent-run-record.mjs`・`.claude/settings.json` |
| 1019 | 記録(`.claude/agent-runs/<id>.json`)に HEAD・要約値・`assets`・`user-scope` を書く。再開は書き換えない。指示資産のパスだけで `dirty` を判定。記録なしは `unknown(no-run-record)`、読めないは `unknown(unreadable-run-record)` | 同上 |
| 0743 | 集約が AI の印(Co-Authored-By または Agent-Run)のあるコミットを 5 区分(clean・dirty・unknown・no-trailer・pre-hook)に分け、件数と外す対象の一覧を項目7 に出す。導入の境は `.githooks/commit-msg` を入れたコミットの祖先かで決める。外す手順は gate スキルの「版を特定できない実行の出力を、監査の抽出から外す」 | `aggregate-evidence.mjs`・`agent-run-record.mjs`・`gate/SKILL.md` |
| 0828 | 切り替えの期間の件数と、期間内の AI の印のあるコミットの一覧(20 件まで) | 同上 |
| 0506・0510 | 生成が `sandbox.enabled:true`・`allowUnsandboxedCommands:false`・`network.allowedDomains`(`registry.npmjs.org`・`github.com`・`api.github.com`)を置く。採用者が足した宛先は再生成しても残す。テンプレートの `settings.json` にも同じ値を置いた。`test-init-g5.mjs` が隔離の値と生成後の deny の全パス(10 行)を固定する(**値の存在だけ。効くことは確かめない**)。README に手引き(WSL2 だけ確認済み、ネイティブの Windows では効かない、macOS・ネイティブ Linux は未確認) | `generate-profile.mjs`・`.claude/settings.json`・`test-init-g5.mjs`・`README.md` |
| 0200 | `undelivered` のまま `issue=452` へ付け替え、note に「実測の材料が無い」を書いた | `human-ai-boundary.md` |
| ADR | ADR-0222 | `src/content/docs/adr/0222-b20-run-record-isolation-and-provisional-license.md` |
| 本体 | マーク 11 件(0683・0883・0890・0827・0828・0743 を delivered、0207・1019・0506・0510・0200 は undelivered のまま note を更新)、`impl-targets.yaml`(`ip-allowlist-operation`・`agent-run-record` を `template-file` へ)、`impl-inventory.yaml` の note 3 か所、`agent-trace-control.md` の 1 行、`issue-index.tsv`(`issues:snapshot`) | 各ファイル |

## ng が実装の前に実際に落ちることの確認(machine の件。実行した)

- 0683: 恒久の一覧だけを返す仮の `license-allowlist.mjs` と、`adapter.mjs` の結線だけを先に置き、`node scripts/gate/test-adapter.mjs` を実行した。9 件が NG(`IMPL-0683:ng` 7 件、`IMPL-0683:ok` 2 件)。内訳は、期限の翌日に外れる・4 欄の欠け(4 件)・実在しない日付・期限切れの許可が検査器へ渡る・期限内の許可が渡らない・期限の日まで入る。本体を入れて 79/79 通過
- 0883: `check-g1.mjs` を触る前に `node scripts/gate/test-project-id.mjs` を実行した。4/5 件が NG(不一致を拒む・G-1 の前の不在を拒む・通過済みの不在は注意・通過済みの不一致を拒む)。実装後は 5/5
- 0207・1019: `agent-run-record.mjs` と `.githooks/commit-msg` が無い状態で `node scripts/gate/test-agent-run-record.mjs` を実行した。トレーラが付かない・記録が書かれないため、13 件が NG(`IMPL-0207:ok/ng`・`IMPL-1019:ok/ng`。人のコミットに付かない 1 件だけは自明に通る)。この時点で試験は `core.hooksPath` の節の前に異常終了した。実装後は 16/16(実物のフックを一時の git リポジトリで走らせる)
- 0828・1019・0743 の入力(集約): 集約を実装前の版(`git show HEAD:scripts/gate/aggregate-evidence.mjs`)に差し替えて `node scripts/gate/test-aggregate-records.mjs` を実行した。新しい 4 件がすべて NG(切り替えの一覧・人のコミットを入れない・5 区分の件数・外す対象の一覧)。実装版に戻して 195/195(既存の 191 + 新しい 4)。**この試験は、集約の出力を実装の後に書いたあとで、実装前の版に戻して落ちることを確かめた**(試験を先に書いたわけではない)
- 0506: `node scripts/gate/test-init-g5.mjs` を、生成を直す前に実行した。隔離の 3 項目 × 2 構成の 6 件が NG(`IMPL-0506`)。生成後 172/172
- 0510: deny の全パスの項目は、生成を直す前から通る(deny の全パスは既存の実装)。0510 は `manual` のため ng の試験を課さない。隔離の値の項目は 0506 と共通
- 0890・0827・0743(外す手順)・0200: `manual` または `undelivered` のため ng の試験は無い。手順の実在は `lint:impl` で確かめた

## 試験の結果

- template: `test-adapter` 79、`test-project-id` 5、`test-agent-run-record` 16、`test-aggregate-records` 195、`test-init-g5` 172、`test-brief-thresholds` 50、`test-brief-estimates` 13、`test-guard-write` 63、`test-guard-bash` 69、`test-direct-commit-rules` 11、`test-base-judge-workflow` 127、`test-adoption` 69、`test-check-delegation` 68、`test-aggregate-drift` 25、`test-next-records` 88、`test-roster-rules` 212、`test-cl-judgment` 108、`test-safety-record` 66、`test-exception-expiry` 65、`test-license-scan` 27 が通過。`test-check-pr` は NG が 0 件。`test-env-check` は Windows では省かれる
- 本体: `lint:impl`・`lint:evidence`・`lint:refs`・`lint:provisions`・`lint:tone`・`lint:scope`・`lint:registry`・`lint:skills`・`test:fields`・`test:impl`・`test:plan-issues`・`test:criteria` が通過。ADR-0222 と `agent-trace-control.md` は textlint 通過
- 既存の試験の見本の変更: `test-adapter.mjs` の代役の道具が `PIT_IN_ALLOWED_LICENSES` も印へ書く。`preflight.mjs` の `TEMPLATE_TOP` へ `.githooks` を足した(足さないと初期化が「テンプレートの配置の外のファイル」を既存の統制の資産と数えて止まった)。`check-pr.mjs` の `NON_PRODUCT` と `config.mjs` の `NEVER_DELEGATED` へ `.githooks/**` を足した(足さないと `coverage-check` が `commit-msg` を製品のコードと数えた)

## 使った番号

- ADR-0222
- EV・IMPL は新設なし。EV-0318 は本文を変えていない(I6 が実機の記録で更新する)

## 裁定と合わない点・判断した点

- 裁定の 0200 は「undelivered / manual / plan=scheduled / issue=452」。そのとおりにした
- 0743 を `delivered` にしたが、前提の 1019 は `undelivered` のまま(I6 が移す)。0743 の note に「トレーラの付与と版の記録の実機の確認は未了」と開示した。0828 も同じ
- 裁定は SessionStart のフックの識別子を `CLAUDE_CODE_SESSION_ID` と読めるが、SessionStart の標準入力の `session_id` を優先して読み、環境変数を補助にした(フックの入力の形は実機で確かめていない。I6 の T1 で確かめる)
- 裁定の「`core.hooksPath` は未設定のときだけ `.githooks`」は、SessionStart の記録の中で行う(別に初期化では行わない)。初期化の前でも SessionStart が走れば設定される
- 0883 の `projectId` が空のときは検査しない(テンプレートの既定は `P-000`。構成が設定済みになれば値がある)。`P-000` のままだと `context/projects/P-000.md` を求める
- 集約が AI の印とするのは `Co-Authored-By` の有無（人の共著者も含む）または `Agent-Run`。人の共著者を AI の印と区別しない。開示の文に「AI の印」と書き、機械が判別できないと書いた
- `go-licenses` の許可の指定は `--allowed_licenses`（カンマ区切り）と読んだ。**実機で確かめていない**。ADR-0222 と 0683 の note に開示した。#447 へのコメントは、報告を受けた指揮役が行う
- `.githooks/commit-msg` を権限設定の Edit の deny/ask に載せていない（生成の標準の deny の一覧を変えるため、この段では避けた）。ADR-0222 の影響に申し送りとして書いた

## 確かめなかったこと

- `go-licenses` の実機の動作、`.githooks/commit-msg` の Windows 以外の `sh` での動作（一時のリポジトリの試験は Windows の Git Bash で実行した）
- SessionStart が Claude Code の実機で走ること、標準入力の `session_id` の形、下位の担当で走ること(I6)
- 隔離が効くこと(I6)
- 回帰の全量(`npm run check`・template の全試験)。`graphify update .`

## 残った点

- IMPL-0207・1019・0506・0510 の state の移行は I6(WSL2 の実機の確認の後)
- README の「確認の手順は research の本体側の記録を参照」という文は、template の読み手が research を持たない。I6 が `research/444-verification/` の置き場を作った後で、文を直す
- `#444` を閉じるコメント: 「IMPL-0200 の実測は済んでいない。#452 へ移した」を書く(指揮役が行う)
- EV 番号の採番（push の前）

## I6 が実機の確認に使う手順

担い手は短命な担当(`sonnet`)。**エージェントの報告を根拠にしない**。ファイルの実在と、要約値・内容の前後比較で確かめる(5.8.6 要求事項8)。確認を通すために設定を緩めない。

**環境**: `wsl -d Ubuntu-24.04`(Claude Code 2.1.314、node v22、git 2.43)。作業場所は Linux 側 `~/b20-verify/<template のコミット>/`(`/mnt/` の下を使わない)。template の写しは `git -C template bundle` か `git clone` で Linux 側へ作る。初期化は `node scripts/init/generate-profile.mjs` で回答を与えて行い、`guard.enabled` が真であることを `.claude/guard.json` で確かめる。

**記録の所在**: `research/444-verification/README.md`(環境・版・手順・期待・結果・証跡の所在の表)と `research/444-verification/raw/`(出力の生の記録。秘匿情報を除く)。探りの材料は `research/441-443-444-deliberation/probe-444/`(`probe.mjs`・`probe3.mjs`・`net.sh`・`hook-dump.mjs`・`commit-msg`・`settings-*.json`)と `src/content/docs/phase5-implementation/agent-trace-control.md` の「隔離と拒否が効くことを確かめる手順(例)」(S1〜S4)。

| 確認 | 実行するもの | 「確認とする」条件(ファイルで確かめる) | 移すマーク |
| --- | --- | --- | --- |
| T1 | WSL2 の作業場所で `claude -p "..."` 等でセッションを開始する(実行の識別子を固定できる場合は `--session-id <UUID>` を使う)。開始後に `.claude/agent-runs/` を列挙する | `.claude/agent-runs/<id>.json` が 1 件でき、`id` が Claude Code の識別子(フックの入力の `session_id` と環境変数 `CLAUDE_CODE_SESSION_ID`)と一致する。`base` が `git rev-parse HEAD` と一致し、`digest` が `node -e "import('./scripts/gate/agent-run-record.mjs').then(m=>console.log(m.assetsDigest()))"` と一致する。raw に `ls`・`cat`・上の出力を残す | 0207・1019 |
| T2 | 同じセッションでエージェントにコミットさせる(Bash の `git commit`) | `git log -1 --format=%B` に `Agent-Run: <T1 の id>` が 1 度だけあり、`Agent-Assets:` の値が `node scripts/gate/agent-run-record.mjs assets <id>` の出力と一致する。人の端末のコミット(環境変数なし)には付かない。raw にコミットの本文を残す | 0207・1019 |
| T3 | `claude --resume <id>` で再開してコミットさせる | 再開の後も `Agent-Run:` が同じ id で、`.claude/agent-runs/<id>.json` の内容が再開の前と同一(`sha256sum` の前後比較)。再開の前に `CLAUDE.md` を変えても記録の値が変わらない | 0207・1019 |
| T4 | 下位の担当(Task/サブエージェント)を起動し、その中でコミットさせる | SessionStart が下位で走ったか(`.claude/agent-runs/` に新しい記録が増えたか)を記録する。走らなくても、そのコミットの `Agent-Assets:` が `unknown(no-run-record)` か親の記録の値で出ること。どちらでも結果を表に書く（合否ではなく事実の記録） | 0207・1019 の note |
| S1・S2 | 隔離なし(`sandbox.enabled:false`)と、生成された設定(`sandbox.enabled:true`・`allowUnsandboxedCommands:false`)で、同じ書き込みの探り(`probe.mjs`)を流す | S1 では全部書ける(対照)。S2 では拒否された経路の一覧がファイルの実在・不在で出る。拒否はエージェントの報告でなくファイルで確かめる | 0506 |
| S3 | **生成した設定の deny の全パス**(`.claude/settings.json` の `permissions.deny` のうち `Edit(` と `Write(` の 10 行)について、各パスへシェル(Bash の `echo x > <path>`)から書く | 10 パスすべてで書けない(ファイルが変わらない。`sha256sum` の前後が同一)。1 つでも書ければ 0510 は移さない | 0510 |
| S4 | `network.allowedDomains` の 3 宛先と、含まれない宛先(例 `example.com`)へ `net.sh` で通信する。`allowUnsandboxedCommands:false` のもとで、隔離の外での実行(`dangerouslyDisableSandbox`)を要求させる | 許可した宛先だけに通信でき、許可していない宛先は拒否される。隔離の外での実行の要求が拒否される（実行の記録のファイルで確かめる） | 0506 |
| 自身の手順 | 隔離のもとで、フックつきのコミット、`node scripts/gate/next.mjs`、`node scripts/gate/aggregate-evidence.mjs` を実行する | 3 つとも終了コード 0 で動く。動かなければ、拒否された経路を表に書き、宛先の既定を直すか、0506 を移さない | 0506 |
| Windows の観測 | Windows の Claude Code 2.1.327 で隔離を有効にし、起動時の警告と書き込みの探りの結果を記録する | 警告の有無と、書けた経路の一覧を表に書く | IMPL-0507 の note |

**止める条件**: いずれかが満たされないときは、該当のマークを `undelivered` のまま残し、指揮役へ戻して議長が裁定する。確認を通すために設定を緩めない。

**確認の後の反映**(I6 が行う):

1. 満たしたマークだけ、`undelivered` を `delivered` / `manual`(0506・0510)または `machine`(0207・1019。`test=template/scripts/gate/test-agent-run-record.mjs`)へ移す。`plan`・`issue`・`review`・「降りたとしない理由」の文を外し、note に確認の日付と環境（WSL2、Claude Code の版）を書く
2. `npm run impl:write`
3. EV-0318・EV-0319 を実機の記録で更新し（macOS・ネイティブ Linux は未確認のまま開示）、`agent-trace-control.md` の 40 行目と 118 行目の「まだ降りていません」を直す
4. `npm run evidence:write`
5. README の文（「確認の手順は research の本体側」）を直す

**macOS・ネイティブ Linux**: 実機が無いため、確認の手順（上の表）と EV-0318 の開示で受ける。未確認を確認済みと書かない。採用者の AI維持管理者が自分の基盤で S1〜S4 を行う。
