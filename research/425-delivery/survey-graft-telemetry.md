# graft 0.12.1 の利用統計と外部通信(#425 の事実調査)

- 調査日: 2026-11-04
- 対象: npm `@nanonets/graft@0.12.1`(準拠テンプレートの `.claude/skills/graft/SKILL.md` と `README.md` が固定する版)
- 一次資料:
  - パッケージ本体: `npm pack @nanonets/graft@0.12.1 --ignore-scripts` で取得し、展開して読んだだけ(実行していない)。shasum `7bc068b9ca07ad4490884a917e352907a31194ee`、integrity `sha512-m/cst665Q/GavheL4AgRxf6LQmuRJ9pzE/l1UcZ4sFLzbRIeT3dhKRNVQ2FEYYJhx2rKE4p+8HNEUB8F3dK0tQ==`、gitHead `bef4828481b06035d17f6d44aab1c4452a35e777`
  - 上流リポジトリ: `trailhq/Graft` と、package.json の `repository` に書かれた `NanoNets/context-graph-engine` は、どちらも **`trailhq/Trail-Code` へ転送される**(`gh repo view` で確認)。タグ `v0.12.1` の `TELEMETRY.md` を読んだ
- 以下の `dist/...` はパッケージ内のパス、行番号は 0.12.1 の配布物の行番号

## 要約

| 問い | 結論(0.12.1) |
| --- | --- |
| 利用統計を既定で送るか | **送る(opt-out)**。鍵が配布物に焼き込まれており、DO_NOT_TRACK・CI・`telemetry disable` のどれも無ければ有効 |
| 送り先 | `https://events.nanonets.com/batch/`(Nanonets の PostHog 代理) |
| 送る項目 | 版・OS・CPU・Node の主版・実行面・乱数の端末 ID と repo ID・バケット化した件数・固定列挙値。コード・パス・シンボル・質問文は許可リストで落とす |
| 送る時点 | コマンド実行時は端末内の待ち行列へ追記するだけ。最大1日1回、切り離した子プロセスが一括送信 |
| 無効化 | `graft telemetry disable`(`~/.graft/telemetry.json` に `enabled:false`。端末単位・ユーザーのホーム単位)、`DO_NOT_TRACK`(`0`・空以外)、CI の環境変数 |
| LLM を使うコマンド | `build --deep` はファイルの**ソースコード本文**(1ファイル最大 24,000 字)とパスを、設定した LLM 提供者へ送る。`blast --name` はファイルパスとシンボル名を送る |
| telemetry 以外の外部通信 | **更新の確認**(1日1回、`npm view @nanonets/graft version`)。0.12.1 では DO_NOT_TRACK でも `telemetry disable` でも止まらない |
| `npx -y` 自体 | npm レジストリから本体と依存を取得。依存は版の範囲指定(`^`)で、lockfile・shrinkwrap が同梱されていない |

## 1. 利用統計を既定で送るか・送り先・項目・時点

### 確かめられたこと

- **既定で有効**: 判定は4つの関門で、どれも閉じていなければ送る。4つ目の利用者の選択は「設定されていなければ有効」と明記されている(`dist/telemetry/gate.js:5-16`、判定本体 `gate.js:40-53`)
  - 関門1 = 鍵の有無。配布物には PostHog の鍵が焼き込まれている(`dist/telemetry/key.js:20` の `BAKED_KEY = 'h0AAz0T8...'`)。ソースから自前でビルドした場合だけ空になる(`key.js:4-9`)。したがって npm から取得した 0.12.1 では関門1は開いている
  - 上流 README も「anonymous, opt-out」のバッジを掲げる(`README.md:16`)
- **送り先**: `https://events.nanonets.com`(`key.js:42`)、パス `/batch/`(`dist/telemetry/send.js:60`)。`fetch` で JSON を POST、8秒で打ち切り(`send.js:18`、`send.js:61-83`)。環境変数 `GRAFT_POSTHOG_KEY` / `GRAFT_POSTHOG_HOST` で鍵と送り先を実行時に差し替えられる(`key.js:43-48`)。TELEMETRY.md は送り先を「publish-time setting」と書くが、コードは実行時の環境変数でも上書きできる(文書と実装の小さな食い違い)
- **送る項目**(許可リスト。`dist/telemetry/contract.js`):
  - 全イベント共通: `app_version`, `os`, `arch`, `node_major`, `ci`, `agent_host`, `repo_id`(`contract.js:48-56`、値の生成 `dist/telemetry/track.js:41-57`)。加えて `distinct_id`(端末 ID)と `$process_person_profile: false`(`send.js:29-45`)、タイムスタンプ(`track.js:83`)
  - イベントと追加項目(`contract.js:30-46`)
    - `first_run`: なし(端末で初回)
    - `init_completed`: `agents`(選んだ連携先の ID の列)、`consent`
    - `build_completed`: `files_bucket`, `langs`, `mode`(fast/deep), `duration_bucket`, `incremental`
    - `build_failed`: `stage`, `code`(どちらも固定の列挙。エラーメッセージは送らない。`contract.js:70-116`)
    - `query`: `command`(`ask`/`grep`/`callers`/`skeleton`/`map`/`check`/`blast`/`viz` の8種のみ。`contract.js:62-64`)、`surface`(cli/mcp)、`hit`
    - `session_summary`: graft の読み取り回数・ソースの読み取り回数・節約トークン数の各バケット(`dist/telemetry/sessions.js:67-71`)
  - 許可リスト外のイベント・キー、文字列以外の値は落とす(`track.js:64-92`)。件数はバケット(`contract.js:122-179`)。言語名だけは外部から来る値なので、文字種と長さで濾す(`contract.js:197-202`)
- **識別子**: 端末 ID = `randomUUID()` を `~/.graft/telemetry.json` に保存(`dist/telemetry/identity.js:26-28`、`identity.js:43-58`)。repo ID = `randomUUID()` を `<repo>/graft/.cache/telemetry-repo-id.json` に保存(`identity.js:68-79`)。マシン ID やリモート URL のハッシュではない
- **送らないと宣言している項目**(TELEMETRY.md「What is never sent」): ソースコード、ファイルパス、リポジトリ名・組織名・git remote・ブランチ名、シンボル名、グラフの中身、質問文・プロンプト・エージェントの出力、エラーメッセージ・スタックトレース、環境変数・API キー・モデル名・ホスト名・ユーザー名・メールアドレス。コード側の許可リストと突き合わせて、これらを運ぶキーは無い
- **IP**: TELEMETRY.md は「IP は国の推定にだけ使い、PostHog はイベントに IP を保持しない」と書く。HTTP の送信である以上、送信元 IP は受信側に届く
- **送る時点**:
  - CLI の各コマンドの前(`preAction`)に、初回の告知の表示 → `first_run` の記録 → 1日1回の送信の起動(`dist/cli.js:143-158`)。コマンドの後(`postAction`)に `query` を記録(`cli.js:165-170`)。`build` の成否で `build_completed` / `build_failed`(`cli.js:322`、`cli.js:340`、`cli.js:356-359`)。`init` の終わりに `init_completed`(`cli.js:802`)
  - MCP サーバーは起動時に送信を起動し(`dist/mcp/server.js:56`)、ツール呼び出しごとに `query` を記録(`server.js:110`)
  - Claude Code の session-start hook が終わったセッションを `session_summary` として待ち行列へ積む(`dist/claude/hooks.js:243`)。hook 自体は送信しない(`sessions.js:16-18`)
  - 記録はすべて `~/.graft/telemetry-queue.ndjson` への追記(`dist/telemetry/queue.js:35-50`、上限 256 KB `queue.js:33`)。送信は `~/.graft/telemetry.json` の `flushedAt` から24時間経過したときだけ、切り離した子プロセス `graft _telemetry-flush` が行う(`dist/telemetry/flush.js:22`、`flush.js:38-57`、`flush.js:72-83`)。5xx・通信失敗は待ち行列へ戻して再送する(`flush.js:66-70`)
- **初回の告知**: 端末で最初の CLI コマンドのとき、標準エラーへ2行の告知を出す(`dist/telemetry/notice.js:22-25`、`notice.js:31-43`)。**告知の前に送信が始まることはない**が、告知と同じコマンドの中で `first_run` は待ち行列へ積まれる(`cli.js:153-157`)。MCP サーバーは告知を出さない(`server.js:51-55`)
- **確認の手段**: `graft telemetry status`(状態・送り先・待ち件数)、`graft telemetry debug`(送る予定の本文をそのまま表示し、送らない)(`notice.js:46-89`)

### 確かめられなかったこと

- events.nanonets.com 側での保存期間・IP の扱い・第三者提供(受信側の運用は一次資料が TELEMETRY.md の記述だけ)
- 実際の通信の観測(実行していないため、パケットや `telemetry debug` の出力は取っていない)

## 2. 無効にする方法

### 確かめられたこと

- **`graft telemetry disable`**: `~/.graft/telemetry.json` に `{ enabled: false, noticeShownAt: ... }` を書く(`cli.js:200-204`、書き込み先 `identity.js:26-28`、`identity.js:34-41`)。置き場は `os.homedir()` 配下なので**ユーザーのホームごと(端末かつ OS ユーザー単位)**。リポジトリ単位ではない。SKILL.md の「端末単位で 1 回」はおおむね正しいが、正確には「OS ユーザーのホームごと」。別ユーザー・コンテナ・ホームの再作成では再び既定の有効に戻る
  - `graft telemetry enable` で戻せる(`cli.js:196-198`)。`graft init` の対話の選択肢でも同じ値を書く(`cli.js:738-760`)
  - 判定は記録・送信のたびに読み直す(`gate.js:17-19`)
- **`DO_NOT_TRACK`**: `0` と空文字以外の値なら無効。利用者の設定より優先(`gate.js:9-11`、`gate.js:24-27`、`gate.js:43-44`)
- **CI**: `CI`(`0`・`false`・空以外)、`GITHUB_ACTIONS`, `GITLAB_CI`, `BUILDKITE`, `CIRCLECI`, `TEAMCITY_VERSION`, `JENKINS_URL`, `TF_BUILD`, `BUILD_NUMBER` のどれかがあれば無効(`gate.js:33-38`、`gate.js:45-46`)。**CI では既定で送らない**
- **graft 専用の無効化用の環境変数(`GRAFT_TELEMETRY` 等)は無い**。配布物が読む環境変数を列挙して確認した(`GRAFT_POSTHOG_KEY` / `GRAFT_POSTHOG_HOST` はあるが無効化の用途ではない)
- 副作用: CLI は起動時に `dotenv/config` を読み込む(`cli.js:7`)。作業ディレクトリの `.env` に `DO_NOT_TRACK` を書いても効く(同時に、`.env` の `GRAFT_API_KEY` 等も拾う。3. を参照)
- 無効にした場合、記録(`track.js:66`)・送信(`flush.js:40`、`flush.js:74`)・セッションの集計(`sessions.js:38`)・告知(`notice.js:33`)のすべてが止まる

### 確かめられなかったこと

- 無効化の前に積まれた待ち行列(`~/.graft/telemetry-queue.ndjson`)は消されない。無効の間は送られないが、`enable` に戻すと送られる(コードから読み取れる挙動。実行での確認はしていない)

## 3. LLM・API を使うコマンドで何をどこへ送るか

### 確かめられたこと

- **`build --deep`**: API キー(`GRAFT_API_KEY`、旧 `OPENROUTER_API_KEY`)が無ければ構造だけのビルドへ落ちる(`cli.js:286-297`)。キーがあれば
  - ファイル要約: 「`File: <パス>`」とファイルの**ソースコード本文**(最大 24,000 字で切る)を送る(`dist/ai/summarize.js:8-15`、`summarize.js:22-28`)
  - crux 要約: ソース本文を最大 18,000 字(`dist/ai/crux.js:31-33`、`crux.js:83-84`)
  - 概念の合成: ファイルパスと要約文の連結(`dist/ai/synthesize.js:52-57`、`synthesize.js:106-107`)
- **`blast --name`**: クラスタごとにファイルパス(最大10件)とシンボル名を送る(`dist/blast/name.js:62-70`、呼び出し `dist/blast/blast-cli.js:85-99`、オプション `cli.js:599`)
- **送り先**: 提供者は `GRAFT_PROVIDER`(既定 `openai`)、`GRAFT_BASE_URL`、`GRAFT_MODEL`(`dist/ai/providers.js:12-41`)。`openai` は OpenAI SDK、`anthropic` は Anthropic SDK を `baseURL` 付きで呼ぶ(`dist/ai/llm/factory.js:3-19`、`openai.js:76`、`anthropic.js:32`)。`GRAFT_BASE_URL` が無ければ各 SDK の既定の API ホスト。旧変数 `OPENROUTER_API_KEY` だけのときは `https://openrouter.ai/api/v1` へ送り、`X-Title: graft` を付ける(`providers.js:1`、`providers.js:21-27`)
- `dist/ai/llm/claude-cli.js` は配布物に含まれるが、0.12.1 ではどこからも import されていない(grep で確認)
- 準拠テンプレートの SKILL.md の記述「LLM も API キーも使わない(`build --deep` を除く)」には `blast --name` が漏れている

### 確かめられなかったこと

- 各 LLM 提供者側での送信データの保持・学習利用(提供者ごとの契約による)

## 4. telemetry 以外の外部通信

### 確かめられたこと

- **更新の確認**: `version` / `upgrade` / `_update-check` / `mcp` 以外の CLI コマンドの前に、`~/.graft/update-check.json` の `checkedAt` が24時間より古ければ、切り離した子プロセス `graft _update-check` を起動し、`npm view @nanonets/graft version` を実行する(`cli.js:137-149`、`dist/upkeep.js:56`、`upkeep.js:82-84`、`upkeep.js:98-132`、`dist/cli-meta.js:43-60`)。MCP サーバーも起動時に同じ確認を起動する(`server.js:46`、`dist/upkeep-run.js:50-52`)。hook は確認を起動しない(`hooks.js:240` の `background: false`)
  - **0.12.1 にはこの確認を止める手段が無い**。`telemetry disable` も `DO_NOT_TRACK` も `maybeRefreshInBackground` は見ていない(`upkeep.js:116-132` に関門が無い)
  - 上流でも報告済み: trailhq/Trail-Code#580「DO_NOT_TRACK=1 does not disable the background update check」(0.21.1 で報告、2026-10-22 クローズ)。修正 PR #651「honor DO_NOT_TRACK for update checks」が 2026-10-22 にマージ。0.12.1 には入っていない
  - `npm view` は利用者の npm 設定(レジストリ・プロキシ)に従う
- **`graft version` / `graft upgrade`**: 実行時に npm レジストリへ問い合わせる(`cli-meta.js:43-60`、`cli-meta.js:130`)
- **`graft viz`**: `http://127.0.0.1:<port>` のローカルサーバー(`dist/viz/serve.js:117`)。外部ではない
- 配布物の JS で外部 URL へ `fetch` するのは `send.js:68` の1か所だけ。他の外部通信は LLM SDK と `npm view`(grep で確認)
- **既知の不具合(子プロセスの暴走)**: `~/.graft` に書けない環境(サンドボックス)では、時刻の記録に失敗しても子プロセスを起動するため、`_update-check` と `_telemetry-flush` が繰り返し起動される。trailhq/Trail-Code#374(0.18.0、未解決)、PR #346(0.16.0 で観測、未マージ)。0.12.1 のコードにも同じ構造がある(`upkeep.js:120-128`、`flush.js:46-51`。`_telemetry-flush` は `UPKEEP_SKIP` に入っておらず、子プロセス自身も `preAction` を通る `cli.js:137`)

### 確かめられなかったこと

- 0.12.1 で #374 / #346 の暴走が実際に再現するか(実行していない)

## 5. `npx -y` で取得すること自体の外部通信

### 確かめられたこと

- `npx -y @nanonets/graft@0.12.1` は、npm キャッシュに無ければ npm レジストリ(既定 `https://registry.npmjs.org/`)から本体の tarball と依存を取得する(tarball の URL `https://registry.npmjs.org/@nanonets/graft/-/graft-0.12.1.tgz`)
- **本体の版は固定されるが、依存は固定されない**: 依存は `^` の範囲指定(`package.json` の `dependencies`。例 `@anthropic-ai/sdk ^0.116.0`, `openai ^6.45.0`, `tree-sitter ^0.21.1` ほか)で、パッケージに lockfile・`npm-shrinkwrap.json` が無い(展開物は `dist`, `scripts`, `README.md`, `LICENSE`, `package.json` のみ)。取得の時点で範囲内の最新版が入る(例: 2026-11-04 時点で `openai` は 6.49.0 に解決)
- **install script が走る**: 本体の `postinstall`(`scripts/postinstall.mjs`。案内文を表示するだけ。CI では即終了)と、tree-sitter 系の依存の `install: node-gyp-build`(`npm view` で確認。`tree-sitter@0.21.1`, `tree-sitter-typescript@0.23.2`, `tree-sitter-python@0.21.0`, `tree-sitter-go@0.23.4`, `tree-sitter-java@0.23.5`, `tree-sitter-php@0.23.4`)
- 上流 README は「ネットワーク呼び出しは、設定した LLM 要求・毎日の npm の版確認・1回の一括の利用統計の送信だけ」と書く(`README.md:240`)

### 確かめられなかったこと

- `node-gyp-build` が同梱の prebuild で済むか、ソースビルドへ落ちて Node のヘッダーを外部(nodejs.org 等)から取得するか(依存を展開していない。OS・CPU・Node の版に依存する)
- npm 自体の更新通知(update-notifier)が `npx` 実行時に走るか(npm の設定 `update-notifier` に依存)

## テンプレートの記述との突き合わせ(参考)

- SKILL.md の「匿名の利用統計を止めるなら `telemetry disable`(端末単位で 1 回)」は、既定で有効であることと止め方としては正しい。ただし次の点が書かれていない
  - 既定で送信が有効(opt-out)であり、初回の CLI コマンドで告知と同時に記録が始まる
  - `DO_NOT_TRACK` でも止まる。CI では既定で止まる
  - 更新の確認(`npm view`)は 0.12.1 ではどの方法でも止まらない
  - `blast --name` も `GRAFT_API_KEY` があれば LLM へパスとシンボル名を送る。`dotenv` により作業ディレクトリの `.env` の `GRAFT_API_KEY` を拾う
  - 設定はリポジトリではなく OS ユーザーのホーム(`~/.graft/`)に置かれる。repo ID は `<repo>/graft/.cache/` に置かれる
- 準拠テンプレートの SKILL.md が `trailhq/Graft#323` を引くが、リポジトリは現在 `trailhq/Trail-Code` へ転送される(#323 自体は未解決のまま存在)
