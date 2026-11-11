# 外部の調査(#358 重の審議。S-1〜S-5・E・F の材料)

- 調査日・取得日: すべて 2026-11-12
- 表記: [確認] は一次資料(提供者の文書・規格の公開ページ・ソース)を読んで確かめた事実。[確認: 範囲] は読んだ範囲を限る。[未確認] は記憶または二次資料(検索結果の要約・ベンダーのブログ)だけの事項。[推論] は資料からの推論
- 背景: `decision.md` §2(S-1〜S-8)、`survey.md` §1 B・D・E・F と §3(P1〜P6)
- `survey.md` §3 で確かめた Claude Code の sandbox・権限の順序・フックの入力・MCP・個人用ファイル・成果物の保持(P1〜P6)は繰り返さない。本書はその外側(他の提供者・業界の道具・規格)を扱う
- **本書は調査であり、条項の提案ではない**。採否は会議体と議長が決める

---

## 1. 指示ファイルの機械の検査(S-1)

### 1.1 業界の道具

| 道具 | 出典 | 検査の対象 | 判定の方式 |
| --- | --- | --- | --- |
| instrlint 0.2.4 | https://cdn.jsdelivr.net/npm/instrlint@0.2.4/README.md | 「死んだ規則」(設定ファイルが既に強制している規則)・矛盾・重複・古い参照。Claude Code・Codex・Cursor のファイル | [確認: README] 死んだ規則は**キーワードの型**(`OVERLAP_PATTERNS`、約 20 型。JS/TS と C# だけ)で設定ファイルの項目へ当てる決定的な照合。矛盾・古い参照の検出の方式は README に記載が無い。**確信の低い発見だけを LLM(ホストのモデル)に判定させる任意の段**(`--verify`)があり、結果に印(✓/❓)を付けて区別する。誤検出の率の記載は無い |
| ctxlint(@ctxlint/ctxlint 等) | 検索結果(https://www.pkgstats.com/pkg:@ctxlint/ctxlint) | 存在しないファイルの参照・動かない build のコマンド・前回のコミットからの乖離(`diff`)。`--fail-on-stale` で pre-commit に入れる | [未確認] 本文を読んでいない。参照の実在の照合で、決定的と推定 [推論] |
| agents-doctor | https://forum.cursor.com/t/built-a-small-cli-to-detect-agents-md-drift-missing-commands-dead-paths-conflicting-nested-files/159582 | 存在しないコマンド・死んだパス・入れ子の AGENTS.md どうしの食い違い | [未確認] 検索の要約だけ |
| agent-context-lint・AgentLint 等 | 検索結果(pkgstats・lablab.ai) | 古さ・壊れたパスに加え、トークン量・曖昧な指示・**矛盾**の「意味の品質」 | [未確認] 方式は読んでいない。個人の小規模な事業で、保守の状況も確かめていない |

- [確認: 上記の範囲] 業界の道具が決定的に検査できているのは、(a) 分量(トークン・行)、(b) **参照の実在**(パス・コマンド・ファイル)、(c) 設定ファイルと重なる規則の**型の照合**、の3種である。いずれも「コードベースから導出できる内容でないか」「既存の記述と矛盾しないか」を一般に判定するものではない
- [確認: instrlint の README] 自然言語の矛盾・重複の判定に LLM を使う道具は、**LLM の判定を決定的な検出と分けて印を付ける**形を取る
- [推論] 3.11.5 の3点のうち、「総分量」は (a) で、「導出できる内容」は (b)(c) の近似(木の図・依存の一覧の形の検出、参照の照合)でしか機械にできない。近似で検出しなかったことは、導出できない内容であることを示さない(`survey.md` §1 B の判定可能性と整合)
- [未確認] 提供者(Anthropic・OpenAI・GitHub・Cursor)が、指示ファイルの矛盾・陳腐化を機械で検査するよう推奨する一次資料は、今回の範囲では見つけていない。提供者の文書は「簡潔に保つ」「定期に見直す」の運用の推奨に留まると記憶する

### 1.2 規格で「機械の検査」と呼べる条件

- IEC 61508-3 7.4.4(オフラインの支援ツール)
  - [未確認: 二次資料] TÜV SÜD の講演資料(https://www.tuvsud.com/-/jssmedia/global/pdf-files/webinar-presentations/tuev-sued_webinar_2018-01-16_finding-the-right-software-tools-for-functional-safety-projects.pdf)と AbsInt(https://www.AbsInt.com/qualificaiton/iec.htm)の要約による。IEC 61508-4 3.2.11 の分類: **T1** は実行コードへ寄与する出力を作らない(テキストエディタ)、**T2** は欠陥を見逃しうるが実行コードに誤りを直接は作らない(試験の生成器・**静的解析**・カバレッジの道具)、**T3** は実行コードへ寄与する(コード生成器・コンパイラ)
  - [未確認: 二次資料] T2・T3 の道具には、**挙動を定める仕様と使用上の制約**が要り、信頼の根拠は「使用の実績」または「道具の妥当性確認」による。新しい版ごとに資格を確かめる
  - [推論] 指示ファイルの検査器は T2 に当たる(見逃しうるが成果物へ誤りを入れない)。T2 の考え方では、検査器が「何を検出し、何を見逃すか」を仕様として書くことが前提となる。LLM の判定は出力が実行ごとに変わりうるため、版を固定しても挙動の仕様と妥当性確認の記録を作りにくい
  - [確認: iTeh のカタログの表示 https://standards.iteh.ai/catalog/standards/clc/b61de6f3-c982-47a1-bcfe-894c14bfbb7f/pren-iec-61508-3-2025] 第3版の原案(prEN IEC 61508-3:2025)が出ている。条番号が 2010 年版と変わりうる。[未確認] 原案に支援ツールの使用の信頼に関する附属書(Annex H)があるという二次資料の記載
- NIST AI RMF・NIST AI 600-1
  - [未確認: 二次資料 https://www.myctrl.tools/frameworks/nist-ai-600-1/family/measure-2] MEASURE 2.1 は試験の集合・指標・**TEVV に使った道具の詳細の文書化**を、MEASURE 2.13 は TEVV の指標と過程の**有効性の評価と文書化**を求める
  - [未確認] LLM を判定者とする評価(LLM-as-a-judge)を名指しで扱う NIST の本文は見つけていない。実務の記事は「高リスクの出荷では判定者ではなく判断の補助として扱う」とする(nhimg.org の FAQ。二次資料)
- ISO/IEC 42001・ISO/IEC/IEEE 12207
  - [未確認] 42001 附属書 A は AI システムの検証・妥当性確認と記録を管理策に置くと記憶する。指示資産のような AI の利用側の設定の検査を名指しする箇所は記憶に無い。本文は読んでいない
  - [未確認] 12207:2017 の構成管理の過程(6.3.5)は、構成品目の識別・変更の統制・状態の記録・**構成の評価(監査)**を成果とすると記憶する。検査を自動で行うことの条件は定めない
- [推論] 規格の側は「自動で行うこと」より、**検査の手段の能力(何を見逃すか)を定め、記録し、資格づける**ことを求める。非決定的な判定を「検査」の名で通すこと自体を禁じる文言は見つけていないが、T2 の資格づけ・TEVV の有効性の文書化のいずれも、判定の再現性と見逃しの性質を記録することを前提にしている

---

## 2. 書き込みの範囲の限定(S-2・S-3)

### 2.1 提供者の実装

#### OpenAI Codex(CLI・IDE・デスクトップ)

- 出典: https://learn.chatgpt.com/docs/sandboxing (旧 developers.openai.com/codex/concepts/sandboxing)、https://learn.chatgpt.com/docs/llms-full.txt (先頭 10 万字)
- [確認] 3つのモード: `read-only`・`workspace-write`・`danger-full-access`
- [確認] workspace は**現在のディレクトリと `/tmp` 等の一時の置き場**。`sandbox_workspace_write.writable_roots` で置き場を足す
- [確認] 書き込める根の内側でも **`.git`・`.codex`・`.agents` を再帰的に読み取り専用**にする
- [確認] `workspace-write` の既定はネットワーク無効。`network_access = true` で有効
- [確認] macOS は Seatbelt、Linux・WSL2 は bubblewrap、ネイティブの Windows は独自の隔離(MXC。旧方式 `elevated`・`unelevated`)
- [確認] 隔離は「組み込みのファイルの操作だけでなく、起動したコマンドにも掛かる」。`apply_patch` の扱いの明記は読んだ範囲に無い
- タスク単位の許可パス: 無い [確認: 読んだ範囲]。最も近いのは設定の書き込める根・コマンドの接頭辞の規則・承認の範囲(一度・セッション中)

#### GitHub Copilot cloud agent(旧 coding agent)

- 出典: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations
- [確認] **ブランチ単位**: 新しい `copilot/` ブランチだけ、既存の PR から起動されたときはその PR のブランチだけへ push できる。ブランチの保護と必須の検査に従う
- [確認] `git push` 等を直接実行できず、単純な push だけを行う
- [確認] 自分の PR を Ready・承認・マージできず、依頼した人も承認できない。起動できるのは書き込み権を持つ人だけ
- [確認] インターネットへの接続はファイアウォールで限る
- タスク単位の許可パス: 無い。**ファイルの単位の書き込みの制限の記載は無い** [確認: 当該ページの範囲]

#### Claude Code(`survey.md` P1・P2 に無い設定)

- 出典: https://code.claude.com/docs/en/settings (例外の表)、https://code.claude.com/docs/en/settings-reference (索引の行。本文は先頭 10 万字だけ読んだ)
- [確認] `permissions.blockWritesOutsideWorkingDirectories`: Write・Edit・NotebookEdit を**作業ディレクトリの外へは、すべての権限のモードで拒否**する(v2.1.314 以降)。索引の記述は Bash に触れない
- [確認] `permissions.blockReadsOutsideWorkingDirectories`(v2.1.257 以降)
- [確認] `permissions.denyInsteadOfPrompting`: 確認を待つ道具の呼び出しを**拒否に変える**(v2.1.319 以降。利用者または管理の設定だけで効く)
- [確認] 上の3つは、下位の範囲の厳しい値を管理の設定より優先する例外の表に載る
- タスク単位の許可パス: 無い。単位は作業ディレクトリ(`additionalDirectories` で足す)

#### Claude Code の dev container

- 出典: https://code.claude.com/docs/en/devcontainer
- [確認] コマンドはコンテナの中で動くが、**bind mount した作業の置き場のファイルはどれも変更でき、ホストに直接現れる**
- [確認] 参照の `init-firewall.sh` が外向きの通信を許可する宛先に限る(`NET_ADMIN`・`NET_RAW` を要する)
- [確認] 「`--dangerously-skip-permissions` では、悪意のある案件がコンテナ内で参照できるもの(`~/.claude` の資格情報を含む)の持ち出しを防がない」「信頼できるリポジトリでだけ使う」
- [確認] Dockerfile に置いた管理の設定は、リポジトリへの書き込み権を持つ人が外せる
- タスク単位の許可パス: 無い

#### Cursor・Devin 等

- [未確認] 今回は一次資料を読んでいない

#### まとめ

- [確認: 上記の範囲] 既定の拒否と許可リストを持つ実装はある。ただし単位は**作業ディレクトリ(Codex の workspace、Claude Code の working directories)・ブランチ(Copilot)・コンテナ(dev container)**で、**タスクの対象のパスに限る実装は、読んだ提供者のどれにも無い**
- [確認] 作業ディレクトリの内側で版管理の内部(`.git`)や道具自身の設定(`.codex`・`.agents`)を読み取り専用にする実装(Codex)はある。強制層の置き場を読み取り専用にする guard-write(IMPL-0198)と同じ型である [推論]
- [推論] タスク単位の範囲は、どの提供者でも「作業ツリーを分ける(git worktree・コンテナ・クラウドの使い捨ての環境)」と「ブランチ・PR の単位でホスティング側が push を限る」の組で近似している。タスクの境界は環境の境界と同じになり、パスの許可リストにはならない
- Windows の扱い: Codex はネイティブの Windows に独自の隔離を持つ [確認]。Claude Code の sandbox はネイティブの Windows で隔離しない(`survey.md` P1)。提供者により異なる

### 2.2 最小権限の記述

- NIST SP 800-53 Rev.5 AC-6 [確認: https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-6/ の転載] 利用者と**利用者のために動くプロセス**に、割り当てられた組織の任務に必要なアクセスだけを許す。強化の項に AC-6(1) セキュリティ機能へのアクセスの認可、AC-6(2)、AC-6(9) 特権の機能の使用の記録、AC-6(10) 非特権の利用者による特権の機能の実行の禁止
- OWASP Top 10 for LLM Applications 2025 LLM06 Excessive Agency [確認: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/]
  - 原因は3つ: 過剰な機能・**過剰な権限**・過剰な自律
  - 対策: 下流の識別子の権限を最小にする/利用者の文脈で最小の範囲で実行する/影響の大きい操作に人の承認を置く/**許可の判断を LLM に頼らず下流の仕組みで強制する(完全な仲介)**。記録・監視・流量の制限は防止ではなく被害の抑制
- OWASP Top 10 for Agentic Applications 2026 [確認: 公開日 2025-12-09 のみ https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/]。[未確認: 二次資料] ASI02 道具の誤用・ASI03 識別子と権限の濫用を挙げ、中核の原則を **least agency(安全で範囲を限った仕事に要る最小の自律)**とする
- OWASP Agentic AI – Threats and Mitigations v1.0(2025-02-17)[確認: 表題と日付だけ https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/]。脅威の一覧は読んでいない [未確認]
- [推論] 規格・指針は「任務(タスク)に必要な範囲」を最小権限の基準に置くが、粒度(ファイルのパスか、環境か)を定めない。LLM06 の「下流で強制する」は、指示文や確認(ask)ではなく、エージェントの外の仕組みでの拒否を求める読み方と整合する

---

## 3. 実行の識別子と指示資産の版の記録(S-5・E)

| 実務 | 出典 | 記録する内容 | 結びつけ方 |
| --- | --- | --- | --- |
| GitHub Copilot cloud agent | https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations | [確認] エージェントのコミットの**メッセージにセッションのログへのリンク**を入れる(レビューと監査のため)。コミットの作者は Copilot、依頼した人を共著者にする。コミットは署名され Verified になる。セッションのログと監査ログの事象は管理者が見られる | ホスティング側がコミットのメッセージへ入れる |
| Claude Code(クラウド・Remote Control) | https://code.claude.com/docs/en/settings-reference (索引の行) | [確認] `attribution.commit`・`attribution.pr` でコミットの trailer と PR の帰属の行を変える・隠す。`attribution.sessionUrl` は**クラウドと Remote Control のコミットから claude.ai のセッションのリンクを省く**設定(つまり既定では入る) | 道具がコミットへ trailer を入れる |
| 同上の利用者の反応 | 検索結果(claudeissues.com の #66504・#72557・#91546 等) | [未確認: 二次資料] `Claude-Session: https://claude.ai/code/session_<id>` の trailer が既定で入ることに、非公開のセッションの URL が履歴へ漏れるとの苦情と、設定で止まらない回帰の報告がある | — |
| Agent Trace v0.1.0(RFC、2026-01、Cursor) | https://agent-trace.dev/ 、https://github.com/cursor/agent-trace | [確認] 記録の項目: `vcs.revision`(コミットの SHA)・`tool.name/version`・ファイルごとの `conversations`(`url`・`contributor`(human・ai・mixed・unknown と `model_id`)・行の範囲・任意の内容のハッシュ)・`related`(セッション・プロンプトの URL)。**置き場を定めない**(ローカルのファイル・git notes・データベース等を例示)。**指示ファイルやプロンプトの版の欄は無い**(`related` に URL を置ける程度) | 記録の側からコミットを指す |
| git の trailer | https://git-scm.com/docs/git-interpret-trailers | [確認] `key: value` の行をメッセージの末尾へ置く。`git interpret-trailers --trailer` と `commit-msg` フック(メッセージのファイルを書き換える)で自動で足せる。`trailer.<alias>.cmd` で値を計算できる。`git log --pretty='%(trailers:key=…)'` で読み出す | コミットに埋める |
| SLSA v1.0 provenance | https://slsa.dev/spec/v1.0/provenance | [確認] `runDetails.metadata.invocationId` は「この build の起動を識別し、関連するログを探すのに役立つ」「大域で一意であるべき(SHOULD)」。`externalParameters`(外から与えた入力。下流で検証する)と `resolvedDependencies`(build 時の依存)を分ける。保持の期間は定めない | 成果物に署名つきの来歴を付ける |
| GitHub artifact attestation | https://docs.github.com/en/actions/concepts/security/artifact-attestations | [確認] 署名つきの来歴にワークフロー・リポジトリ・組織・環境・コミットの SHA・起動の事象を記録する。公開のリポジトリは Sigstore の公共の基盤と**公開の不変の透明性ログ**、非公開は GitHub の Sigstore(透明性ログ無し)。単独で SLSA Build L2、再利用のワークフローで隔離すれば L3。**保持の期間の記載は無い** | 成果物に来歴を付ける |

- [確認: 上記の範囲] 実行の識別子をコミットへ結びつける実務は、**提供者がコミットのメッセージ(trailer・リンク)へ入れる形**(Copilot・Claude Code のクラウド)が既にある。利用者のフックで入力を書き換えて足す形の一次資料の実務は見つけていない
- [確認] 指示資産の版(参照した CLAUDE.md 等のコミット)をコミットごとに記録する欄は、Agent Trace・提供者の trailer のどちらにも無い
- [推論] 指示資産は版管理の中にあるため、**コミットの SHA と識別子が残れば、その時点の指示資産の版は履歴から導ける**(作業ツリーの未コミットの変更・利用者の範囲の指示 `~/.claude` を除く)。導けない部分は利用者の範囲と未コミットの状態で、ここが記録の欠けになる
- [推論] trailer の自動の付与には、非公開の URL・識別子が公開の履歴へ出る問題が付随する(上の苦情)。識別子の値の公開の可否は案件ごとに異なる
- [推論] SLSA の `invocationId` と `externalParameters` の分け方は、「実行の識別子」と「外から与えた入力(指示資産)」を分けて記録する型の先例になる

---

## 4. 既定ブランチ以外への取り込みを止める実務(S-4。簡単に)

- GitHub のルールセット [確認: 検索結果に引かれた docs.github.com の「Available rules for rulesets」の記載] **Restrict updates**: 型に合うブランチへ push できるのは bypass の権限を持つ人だけ。**Restrict creations**: 同じく作成を限る(Enterprise Cloud のページは削除の制限として書き、版の間で記述が食い違う)。型は fnmatch で `*` は `/` を越えない。fork は上流のルールセットを継がない
- Copilot cloud agent は、資格情報の側で push を1本のブランチに限り、`git push` を直接実行させない [確認 §2.1]。**ホスティング側が資格情報の範囲で止める**形である
- Codex は書き込める根の中でも `.git` を読み取り専用にする [確認 §2.1]。ローカルの `git merge` / `git commit` は隔離の中では失敗し、承認で隔離の外へ出す必要がある [推論: `.git` が書けないため]
- [推論] エージェント側の権限の規則で `git merge`・`git push` の引数の形を拒否する方法は、Bash の文字列の照合で迂回しうる(`survey.md` P2 の `curl` と同じ性質)。確実な止め方は、資格情報の範囲(Copilot)・`.git` の読み取り専用(Codex)・ホスティングのルールセット(Restrict updates)のいずれかで、いずれも採用者の設定またはホスティングの機能に依る。ADR-0124 が拒否の設定を課さないとした判断と、外部の実務は矛盾しない(課さない場合でも、止める手段の所在を示す材料にはなる)

---

## 5. CI の記録を保持の期限を超えて残す実務(F)

- GitHub Actions の成果物・ログ [確認: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/remove-workflow-artifacts] 既定 90 日、リポジトリ・組織・エンタープライズで変えられる。`actions/upload-artifact` で個別に指定できる。上限(公開 90 日・非公開 400 日)は `survey.md` P6
- GitHub の監査ログ [確認: https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization] 組織の監査ログは**直近 180 日**。外部への streaming は当該ページに記載が無い [未確認: Enterprise Cloud の機能と記憶]
- artifact attestation [確認 §3] 公開のリポジトリでは公開の不変の透明性ログへ書かれる。ただし**保持の期間の記載は無く**、来歴(誰がどの定義で作ったか)を残すもので、成果物の中身(inputs.json)を残すものではない [推論]
- 監査の証跡の保持の期間の規格の例
  - PCI DSS v4.0.1 要件 10.5.1 [未確認: 二次資料(https://withpci.pages.dev/requirements/10/10.5/10.5.1 、https://learn.microsoft.com/en-ca/entra/standards/pci-requirement-10)が要件の文言を転載] 監査ログの履歴を**少なくとも 12 か月**保持し、**直近 3 か月は直ちに分析に使える**状態に置く。審査は方針の確認・設定と実ログの抜き取り・聞き取りで行う
  - NIST SP 800-53 AU-11(監査記録の保持)[未確認] 保持の期間を組織が定める変数として置くと記憶する
- [推論] 業界の実務は「ホスティングの保持に頼らず、外部の保管(オブジェクトの保管庫・SIEM・アーカイブ)へ運び、取り出せることを試す」形を取る(PCI の二次資料は「保管の lifecycle の設定だけでなく、実際の取り出しを試す」を勧める)。本件の「記録用ブランチへ運ぶ」(f1)はこの型の一種で、運ぶ経路の実機の確認が要るという `decision.md` L-6 と整合する
- [推論] 保持の期間を抜き取りの周期(四半期)に合わせる考え方は、PCI の「直近の期間は直ちに使える」の型と同じである。期間の値そのものは規格から直接は導けない

---

## 会議体への材料(論点ごとに3行以内)

- **S-1**: 業界の道具が決定的に検査できるのは分量・参照の実在・設定と重なる規則の型の照合で、矛盾・導出できる内容は LLM の判定か近似に留まる。LLM を使う道具は判定に印を付けて決定的な検出と分ける。規格(IEC 61508 の T2、NIST の TEVV)は検査の手段の能力と見逃しの性質の記録を前提にしている
- **S-2**: 既定の拒否・許可リストの実装は作業ディレクトリ・ブランチ・コンテナの単位にあり、**タスクの対象のパスに限る実装は提供者に見当たらない**。最小権限(AC-6・LLM06)は「任務に必要な範囲」を求めるが粒度を定めず、LLM06 は許可の判断をエージェントの外で強制することを求める
- **S-3**: 隔離の掛かる範囲は提供者で異なる(Codex はファイルの操作にも掛かり、ネイティブの Windows に独自の隔離を持つ。Claude Code の sandbox はシェルだけでネイティブの Windows で効かない)。Claude Code に作業ディレクトリの外への Write・Edit の拒否と、確認を拒否へ変える設定(v2.1.314・2.1.319 以降)が加わった。dev container は作業の置き場の書き込みを限らない
- **S-4**: 確実な止め方は資格情報の範囲(Copilot)・`.git` の読み取り専用(Codex)・ホスティングのルールセット(Restrict updates)で、いずれも採用者の設定またはホスティングの機能。Bash の文字列の拒否は迂回しうる。ADR-0124 と外部の実務は矛盾しない
- **S-5・E**: 実行の識別子は提供者がコミットのメッセージへ入れる実務がある(Copilot のセッションのリンク、Claude Code のクラウドの `Claude-Session`)。利用者のフックで入力を書き換える一次資料の実務は見つけていない。指示資産の版の欄はどの実務にも無く、コミットの SHA から導けない部分(利用者の範囲・未コミット)が欠けになる。識別子の公開の問題が付随する
- **F**: ホスティングの保持(成果物 90/400 日・監査ログ 180 日)を超える保持は、外部の保管へ運ぶのが実務で、取り出せることの確認が求められる。attestation は来歴を残すが中身と保持の期間を保証しない。PCI DSS 10.5.1 は 12 か月・直近 3 か月の即時の利用の例(二次資料)
