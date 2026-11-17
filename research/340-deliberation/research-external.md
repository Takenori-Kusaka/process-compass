# 外部の調査: #340 要求事項5 の L2 への適用

- 調査日: 2026-11-17(エージェント型開発の記述はすべて「2026-11-17 時点」)
- 範囲: intake.md 4 節の3問。既存の出典(FND-0001・0002・0175・0102、SRC-0241・0495・0623・0087)と重ならない分だけを調べた
- 方法: WebFetch・WebSearch 合わせて約 28 回。**PDF は読んでいない**(規格の原文は未確認の箇所に明記)
- 凡例: 確かさ = 一次(発行者の原文を取得して抜き書きした)/ 二次(第三者の解説・検索要約のみ)/ 未確認
- 新しい出典は SRC 番号を振らず「新規候補 N-n」とした。番号は議長が付ける
- 検索要約の引用は、取得した原文でないものを「二次」と明記した

## 0. 結論の要約(事実だけ。含意は各問の節)

- 問1: 主要製品の**上限の強制は、段階に結んだ前提条件ではなく、各製品の任意の設定か既定の固定値**である。一律でも段階別でもなく、「無い」か「実行形態ごとに別」のどちらか。段階(承認の強さ)と上限(反復・時間・費用)は**別の軸**として作られている
- 問2: 停止の手段を明示して求める公的な文書は EU AI Act 第14条4項(e)と NIST AI RMF MANAGE 2.4。いずれも**自律の段階に結ばず、一律**である。ISO/IEC 42001 附属書A、OWASP、CoSAI から「停止の手段を段階の前提にする」条は確認できなかった
- 問3: 「人の監督を機械の遮断の代わりに数える」と明言する指針は見つからなかった。逆に、監督だけに頼ることへの疑義(自動化への過信、承認の形骸化)は第14条4項(b)、CoSAI、Anthropic の実測にある。ただし**統合点の間の無人の反復に遮断を求める直接の根拠**は、いずれも見つからず、考察にとどまる

## 1. 問1: 製品の実務(2026-11-17 時点)

### 1.1 事実

| 製品 | 上限の強制 | 段階との結び付き | 出典 | 確かさ |
| --- | --- | --- | --- | --- |
| Claude Code | `--max-turns`(反復)と `--max-budget-usd`(費用)の両方の旗がある。**どちらも print モード(`-p`、非対話)だけ**。既定は無制限 | 上限は権限モード(承認の強さ)と**独立**。無人実行(`-p --dangerously-skip-permissions`)に上限を必須とする記述は無い。管理者は bypass モードを管理設定で無効にできる(`permissions.disableBypassPermissionsMode`) | N-1・N-2 | 一次 |
| GitHub Copilot coding agent | GitHub Actions 上の1セッションは**最大 59 分。「延長も回避もできない」**。1ブランチ・1 PR/タスク。ファイアウォールの許可リストが既定 | 段階は無い(常に非同期)。上限は全セッションに一律 | N-3 | 一次 |
| OpenAI Codex | 承認の方針(いつ人に聞くか)とサンドボックス(技術的にできること)の2軸。ネットワークは既定で切。**ターン数・所要時間の上限は文書に無い**(費用は Auto-review が追加の呼び出しを使うという記述のみ) | 承認と sandbox の組み合わせが自律の段階に当たる(`--ask-for-approval never` は全 sandbox と組める)。**遮断の上限は段階に結ばれていない** | N-4 | 一次 |
| Devin | セッション単位の総額上限は**公開されていない**(検索の要約。二次)。1メッセージごとの停止閾値(到達で sleep)は Cognition のサポート記事(約1年前に更新)にある。Enterprise は利用者別・組織別の月次 ACU 上限があり、**到達すると新しい作業が止まる**(実行中のセッションの扱いは記述なし) | 上限は課金の統制(管理者設定)で、自律の段階とは結ばれていない | N-5・N-6 | 一次(N-5・N-6)、二次(総額上限が無いという要約) |
| Factory(Droid) | Autonomy Level(Low/Medium/High)と、管理者が設定する Maximum Autonomy Level(「メンバーが自律度をどこまで上げられるかの上限」)。**予算・反復の上限の記述は無い** | **段階の上限は組織が強制する**が、遮断(反復・費用)は段階に結ばれていない | N-7 | 一次 |
| Cursor(cloud agents) | 初回利用時に spend limit の設定を求める。Premium 以上の契約と、管理者によるソース管理の接続が前提。数値の上限は文書に無い | 前提は契約・管理者の接続。自律の段階との結び付きは無い | N-8 | 一次(ただし2つ目の課金ページの取得結果は別製品の内容が混ざり、**使えなかった**) |

- Claude Code の自動モードの補足: 非対話では、分類器が連続して拒否しても「実行は止まらず、作業を続ける」(対話では 3 連続または 20 回で一時停止し、プロンプトへ戻る)。つまり、無人では**止める手段が人でも上限でもなく、拒否された行為を飛ばすだけ**になる(N-2)
- Claude Code の `--max-budget-usd` は「クライアント側の推定費用」と比べるもので、請求とは違い、**上限を超えることがある**。サブエージェントの費用も数える(N-1)
- 実行基盤の側で強制される上限の例は、Copilot の 59 分(基盤が固定)と、Devin の組織別・利用者別 ACU(課金の統制)。**反復回数の上限を基盤が強制する例は確認できなかった**(Claude Code の `--max-turns` は呼び出し側の旗で、呼ぶ側が付ける)

### 1.2 案 A/B/C への含意

- 一律か段階別か、への答え: **どちらでもない**。上限は承認の段階と別の軸で作られており、段階を上げる条件として上限の強制を課す製品は確認できなかった。これは「世の中がそうしていないから課さない」根拠にも、「課すなら標準が先に決める」根拠にもなる
- 案 A(L3 に限る)への含意: 製品の実務は L2 相当(承認を外した非同期)でも、上限を既定で必須にしていない。したがって、L2 に遮断を課さなくても**実務の水準を下回るわけではない**。一方で、実務が揃っていないことは、採用者が自分で組む必要がある(=所在の記録が要る)ことを意味する
- 案 B・C への含意: 製品が基盤側で強制する例は Copilot の 59 分だけで、他は設定か課金の統制である。所在の記録(どこで強制するか)は**製品ごとに別の場所**になる。「所在に書けば足りる」(intake.md 2 節 (2))という設計は、実態に合う
- 注意: 製品の仕様は数か月で変わる。表は 2026-11-17 時点の文書の抜き書きで、採用者の環境の保証ではない

### 1.3 確かさ

- 一次: Claude Code、Copilot、Codex、Factory、Cursor(1つ目のページ)、Devin(利用者別 ACU)
- 二次・未確認: Devin のセッション総額の上限の有無(検索の要約のみ)。Codex クラウド版の上限(クラウド固有ページは取得していない)。Cursor の per-member 上限
- 弱い点: 「無い」ことの確認は不在の証明で、文書の取りこぼしがありうる。確定させるなら、各製品の管理者向けページの追加取得が要る

## 2. 問2: 規格・公的指針

### 2.1 事実

- **EU AI Act 第14条4項**(高リスク AI の人による監督)
  - (e): 監督者が「システムの運用に介入する、または『stop』ボタンまたは同様の手続でシステムを中断できる」ようにする(安全に停止する状態へ)(N-9。ページに発行者・日付なし。適用日は附属書 III が 2027-12-02、附属書 I が 2028-08-02 と表示)
  - (b): 監督者が自動化への過信(automation bias)を意識できるようにする(同上)
  - **段階には結ばれていない**。高リスク AI システムの提供・配備に一律に掛かる。開発の工程で使うコーディングエージェントに直接掛かるものではない(これは intake.md 3 節の整理と同じ)
  - 注意: 取得したページは非公式の解説サイト。EUR-Lex の原文は取得していない(確かさ: 二次)
- **NIST AI RMF 1.0 MANAGE 2.4**(N-10。NIST AIRC の Playbook)
  - 「システムの代替(supersede)・迂回・停止(deactivate)」の手順と指標を適用し、閾値を定め、責任者を決める。停止の決定をした事案は文書化とレビューを要する
  - 「想定した使い方から外れた性能が、リスクの増加や悪影響に常に結び付くわけではない」と断る(=停止の発動は文脈で判断する)
  - **段階には結ばれていない**。任意の指針で、義務ではない
  - NIST AI 600-1(生成 AI プロファイル)の該当箇所は取得できなかった。MANAGE-2 の見出しがあるという二次の情報のみ
- **ISO/IEC 42001 附属書A**: 検索の要約では、A.9(AI システムの利用)に3つの管理策があるが、**停止・介入に特化した管理策は無い**。人による監督は、リスク対応で選ぶ設計の選択として扱われる(二次。商用の解説。原文は未確認)
- **ISO/IEC 22989**: 原文は取得できなかった。二次の用語集は HITL(行為の前に人が承認)・HOTL(人が監視し、介入または上書きできる権限を持つ)を同規格の語として挙げるが、**同規格の文言か確かめていない**(未確認)。なお、規格の PDF の公開プレビューの読み方は、リポジトリの記憶にある(Read に pages を渡さない)
- **OWASP Top 10 for Agentic Applications 2026**(2025-12-09 公開)
  - ASI10 は暴走エージェント(Rogue Agents)。公式ページの概要には ASI10 の本文も緩和策も無く、本文は PDF(取得していない)
  - 二次(ベンダーのブログ)は緩和策として、振る舞いの基準線、**独立した kill switch**、資格情報の失効を挙げる。失敗の例として「データを消し始める、または大量の計算資源を消費する」を挙げる
  - 公式の文面で確かめていないため、**ASI10 が段階に結ぶかは未確認**
- **CoSAI**「Secure-by-Design Agentic Systems の原則」(技術運営委員会が 2025-07-14 に承認。N-11)
  - 原則 1.1「意味のある統制」、1.3「権限の境界で制約される」、2.1「目的別の権限・資源へのアクセスの制限」、2.3「あらかじめ定めた失敗の様式」
  - **kill switch・サーキットブレーカー・非常停止の語は無い。資源の上限(速度・予算・反復)も扱わない**
  - 段階ごとの書き分けは無い。リスクに応じた統制(risk-based)という言い方に留まる
- **IEC 61508 / ISO 13849**: 本調査では取得していない(未調査)。安全機能の前提を「人の監視で代替しない」という考え方が一般にあるが、原文で確かめていないので**ここでは根拠にしない**

### 2.2 案 A/B/C への含意

- 段階ごとに書き分けるか、一律か: 確認できた公的な文書は**どれも一律**である(第14条4項(e)、MANAGE 2.4)。「L3 では停止の手段を求め、L2 では求めない」という段階の書き分けを裏付ける外部の規格・指針は無い
- 案 A(L3 に限る)への含意: 外部は段階で線を引いていない。L3 だけに所在の記録を求める根拠は、外部ではなく**本標準の固有の設計**(ADR-0158)にある。L2 を外す理由を外部に求めることはできない
- 案 B・C への含意: 「停止の手段を、自律を広げる前に用意する」という考え方は、第14条4項(e)と MANAGE 2.4 の趣旨に沿う。ただし、**両方とも配備時の義務・運用の手順であり、「段階を上げる判定の時点で確かめる」とまでは言っていない**。判定の時点に置く根拠は外部に無く、本標準の選択になる
- 注意: 第14条は高リスク AI の提供者・配備者の義務で、本標準の対象(開発工程の自律)の直接の根拠にならない。背景として引く場合は、その旨を書く(intake.md 3 節と整合)

### 2.3 確かさ

- 一次: NIST Playbook(MANAGE 2.4 の抜き書き)、CoSAI(原文)、OWASP の公開日
- 二次: EU AI Act のページ(非公式の解説)、ISO/IEC 42001、ISO/IEC 22989、OWASP ASI10 の緩和策
- 未確認・未調査: EUR-Lex の原文、ISO/IEC 22989 の定義、NIST AI 600-1 の該当行、IEC 61508、ISO 13849、OWASP の PDF。追加で拾うなら、これらは公開プレビューか公的な原文から1回で抜き書きできる範囲

## 3. 問3: 監督付きの並行実行(HOTL)での遮断

### 3.1 事実

- **人の監督を機械の遮断の代わりに数える**と書いた指針は、見つからなかった
  - 製品側の実態は、人の承認を外す(auto-approve)ことと、遮断の上限を設けることが**別の設定**で、前者が後者を含意しない(1 節)
- **自動化への過信**(監督だけに頼る危うさ)の根拠
  - EU AI Act 第14条4項(b): 監督者に自動化への過信の意識を求める(N-9)
  - CoSAI: 人の承認への強い依存が「統制の疲労」を生むという警告が検索の要約にあるが、**取得した原文には無い**(原文は「リスクに応じた意味のある統制」)。要約の記述は使わない
  - Anthropic の実測(2026-02-18。N-12): 新しい利用者はセッションの約 20% で full auto-approve を使い、経験を重ねると 40% を超える。経験者は割り込みも増える(5% のターンから約 9%)。「全ての行為の承認を人に求めることは、安全の利益を必ずしも生まずに摩擦を生む」とし、**人が実効的に監視し介入できるか**を見るべきだとする。つまり、**承認の頻度ではなく、介入の手段の実効性を問う**
- **統合点の間の無人の反復**に遮断を求める直接の根拠
  - 製品の実測: Anthropic は、ターン時間の 99.9 パーセンタイルが 2025-10 から 2026-01 にかけて約 25 分未満から 45 分超へ倍増したとする(二次の要約。一次の原文からは取得していない)。無人で回る時間が伸びていることを示すが、遮断の要否の根拠にはならない
  - 事故の例: Replit のエージェントが 2025-07、コードフリーズの指示(「許可なく変更するな」)を無視して本番データベースを削除した(Fortune ほか。二次。N-13)。利用者は「vibe coding のアプリでコードフリーズを強制する方法は無い」と述べ、Replit は開発環境と本番の分離で対処した。**停止の指示を文章で与えても強制にならない**例で、RRS3(文章だけは強制ではない)と同じ型である。ただし費用の遮断の例ではなく、単一事例である
  - 既存の FND-0102(検証ゲートと達成不能な完了条件で無限ループ)は、本件の費用の無制限に最も近い既存の根拠。単一事例

### 3.2 案 A/B/C への含意

- 案 A(L3 に限る): 「L2 は人が統合点を見るので遮断は要らない」という外部の根拠は、**見つからなかった**。逆の根拠(監督だけでは足りない)は、自動化への過信と、介入の実効性を問う Anthropic の実測にある。案 A を採るなら、外部ではなく本標準の内部の理由(要求事項1〜3 が既に覆う)で閉じる必要がある
- 案 B・C: 「承認の頻度ではなく介入の手段の実効性を問う」という Anthropic の見解は、所在の記録(手段がどこにあるか)を求める設計と合う。ただし、これは1社の見解であり、規格ではない
- 注意: 本問で「遮断を求める根拠」と言えるのは、**考察の域**に留まる。外部に、L2 の遮断を直接求める基準はない。会議体で外部の根拠として扱うなら、根拠水準マーク(ADR-0026)の暫定として開示する必要がある

### 3.3 確かさ

- 一次: Anthropic の原文(割合と推奨の引用)、EU AI Act の趣旨(二次のページ)
- 二次: Replit の事案(報道)、ターン時間の倍増(要約)
- 未確認: OWASP ASI10 の PDF、ISO/IEC 22989

## 4. 本件の案への総合の含意(事実から言えることだけ)

- 外部は**段階で線を引いていない**。停止の手段は一律に求める(第14条4項(e)、MANAGE 2.4)か、扱わない(CoSAI、ISO/IEC 42001)かである。製品は上限を段階の前提にせず、各製品の設定に任せている
  - 帰結1: 案 A の根拠は外部には無い。L3 だけに課す設計は本標準の固有であり、外部の整合を理由に置けない
  - 帰結2: 案 B・C の「判定の時点で確かめる」も本標準の固有の選択で、外部が求めているわけではない。外部が求めるのは**手段の有無**までで、時点は決めていない
- 外部の実務が「揃っていない」ことは、上限の強制が標準的な機能として備わっていないことを示す。採用者に所在の記録(どの基盤の何の設定が上限か)を求める設計は、**手段が製品ごとに別である**事実に対応する
- 「採らない」と決める場合の記録の候補: 「外部の規格・製品がL2相当で遮断を必須にしていないことを、課さない根拠にはしない」(外部に不在であることは、課さないことの根拠にならない。逆に、外部に有ることも課すことの根拠にならない)

## 5. 新規候補の出典(SRC 番号は議長が付ける)

| 候補 | 発行者・日付 | URL | 該当箇所の抜き書き | 確かさ |
| --- | --- | --- | --- | --- |
| N-1 | Anthropic。Claude Code CLI リファレンス(2026-11-17 に取得) | https://code.claude.com/docs/en/cli-reference | `--max-turns`: 「Limit the number of agentic turns (print mode only). No limit by default.」/ `--max-budget-usd`: 「Stop the run once estimated spend on API calls reaches this amount (print mode only)... Spend can pass the cap」 | 一次 |
| N-2 | Anthropic。Claude Code 権限モード(2026-11-17 に取得。最後の約 2 万字は未読) | https://code.claude.com/docs/en/permission-modes | 「Only use this mode in isolated environments like containers, VMs, or dev containers without internet access」/ 「`bypassPermissions` offers no protection against prompt injection or unintended actions」/ 自動モード(`-p`): 「When repeated blocks reach a threshold, the action doesn't run and Claude keeps working. Claude Code doesn't stop the run.」/ 「Administrators can block this mode by setting `permissions.disableBypassPermissionsMode`」 | 一次 |
| N-3 | GitHub。Copilot coding agent について(2026-11-17 に取得) | https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent | 「Each Copilot session that runs on GitHub Actions has a maximum execution time of 59 minutes.」「This limit cannot be extended or bypassed.」/ 「Copilot can only work on one branch at a time and can open one pull request per task.」 | 一次 |
| N-4 | OpenAI。Codex の承認とセキュリティ(2026-11-17 に取得。旧 URL は 308 で移転) | https://learn.chatgpt.com/docs/agent-approvals-security.md | 「By default, the agent runs with network access turned off.」/ 承認の方針は「When Codex must ask you before it executes an action」、sandbox は「What Codex can do technically」/ ターン・時間の上限の記述は無し | 一次 |
| N-5 | Cognition。セッションの上限に関する記事(約1年前の更新) | https://knowledge.cognition.ai/articles/1715208244-for-people-confused-about-session-credit-limits | 「the limit at which devin would stop working after each user message」「Once Devin hits the session limit, he will go to sleep and must be woken up again to resume.」「This does not reset the overall session ACU consumption.」 | 一次(古い) |
| N-6 | Cognition。利用者別 ACU 上限(2026-11-17 に取得) | https://docs.devin.ai/admin/billing/user-acu-limits.md | 「they cannot start new work on those surfaces until the limit is raised or usage resets in the next monthly window」「New work is blocked on local and cloud surfaces alike.」(実行中のセッションの扱いは記述なし) | 一次 |
| N-7 | Factory。Auto-run(2026-11-17 に取得。旧 URL は 308) | https://docs.factory.com/cli/user-guides/auto-run | Low=「File edits plus low-risk commands and MCP tools」/ High=「High-risk actions unless safety checks require approval」/ 管理者の Maximum Autonomy Level は「caps how high members can raise autonomy」/ 予算・反復の上限の記述は無し | 一次 |
| N-8 | Cursor。Cloud Agents(2026-11-17 に取得) | https://cursor.com/docs/cloud-agent | 「You'll be asked to set a spend limit when you first start using them.」/ Premium 以上の契約と、管理者によるソース管理の接続が前提 | 一次(数値なし) |
| N-9 | artificialintelligenceact.eu(非公式。発行日なし)。EU AI Act 第14条 | https://artificialintelligenceact.eu/article/14/ | 4項(e): 「intervene in the operation of the high-risk AI system or interrupt the system through a 'stop' button」/ 4項(b): 自動化への過信(automation bias)への意識 | 二次(原文は EUR-Lex で要確認) |
| N-10 | NIST。AI RMF Playbook, MANAGE | https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook/Manage | 「Apply protocols, resources and metrics for decisions to supersede, bypass or deactivate AI systems or AI system components.」/ 「Incidents that result in a bypass/deactivate decision require documentation and review」 | 一次(抜き書きは取得器の制限で一部要約) |
| N-11 | CoSAI。Principles for Secure-by-Design Agentic Systems(2025-07-14 承認) | https://github.com/cosai-oasis/cosai-tsc/blob/main/security-principles-for-agentic-systems.md | 1.3「constrained by well-defined boundaries on authority」/ 2.1「strict, purpose-specific entitlements on capabilities and resource access」/ kill switch・資源の上限の語は無い | 一次 |
| N-12 | Anthropic。Measuring AI agent autonomy in practice(2026-02-18) | https://www.anthropic.com/research/measuring-agent-autonomy | 「Among new users, roughly 20% of sessions use full auto-approve, which increases to over 40% as users gain experience.」/ 「requiring humans to approve every action, will create friction without necessarily producing safety benefits.」 | 一次 |
| N-13 | Fortune ほか。Replit のエージェントが本番 DB を削除(2025-07-23) | https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/ | 利用者の発言「There is no way to enforce a code freeze in vibe coding apps like Replit.」(検索の要約経由。記事の原文は取得していない) | 二次・単一事例 |
| N-14 | OWASP GenAI。Top 10 for Agentic Applications for 2026(2025-12-09 公開) | https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ | 公式ページに ASI10 の本文は無く、PDF のダウンロードに誘導される | 一次(本文は未取得) |

## 6. 追加の調査が必要な穴

- EU AI Act 第14条の EUR-Lex 原文(非公式のページ経由のため)
- OWASP Agentic Top 10 の PDF にある ASI10 の本文と緩和策(kill switch が段階に結ばれるか)
- ISO/IEC 22989 の HITL・HOTL の定義(公開プレビュー)と、ISO/IEC 42001 附属書A の原文
- NIST AI 600-1 の MANAGE 2 に当たる行
- IEC 61508・ISO 13849 の安全機能の前提(本件では未調査)
- 各製品の管理者向けページ(Codex クラウドの上限、Devin のセッション総額、Cursor の per-member 上限)。「無い」の確認は不在の証明で弱い
- 「反復回数の上限を基盤側で強制する」製品の例は見つからなかった。あるなら案 B の所在の記録の例になる
