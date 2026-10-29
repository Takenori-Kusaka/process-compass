# 調査: リポジトリ運営(CI・配布)の現状の突合 — Issue #293(#276・#277・#280・#281・#260 の残り)

- 調査日: 2026-10-23
- 位置づけ: コアポリシー「取り込みの前に議論する」の**調査**段階(内部の突合)。採否は決めていない。推しは書いていない。標準本文・ADR・テンプレート・ワークフローは編集していない
- 入力: `research/293-deliberation/issues-context.md`、`research/phase4-standard/issue-triage-2026-10-08.md`(#260 L475-500、#280・#281 の突合)、Issue #260・#299 の本文(GitHub MCP で取得)、PR #322 のブランチ `origin/claude/project-thread-s3yzz7`
- 比べた版: 作業ツリー(ブランチ `work/293`。#289〜#292 の未マージの変更を含む)と `origin/main`(取得時点 46b056f、その後 b5f4815・18b9bd5 へ進んだ)。行番号は断りの無い限り作業ツリー
- 外部の材料: GitHub Docs(WebFetch。取得日 2026-10-23)。2026-09 の外部調査の束(`research/282-survey-2026-09/by-issue.md`)には #276・#277・#280・#281・#260 の項が無い

## 0. 要約(10 行)

1. **#276**: `npm run check` は作業ツリーで 18 本、`origin/main` で 17 本(差は `test:impl`)。`origin/main` の `ci.yml` は PR だけを契機に `lint:text`・`build` の 2 本しか走らせず、main への push では何も検査しない。作業ツリー(#292)の `ci.yml` は PR・main への push・手動で、template のサブモジュールを取得して `npm run check` を 1 回呼ぶ。**検査の一覧を `ci.yml` に書き写す形ではなくなったため、一覧の正本は `package.json` の `check` 1 か所になる**
2. 検査を列挙する、または CI と同じだと主張する箇所は 8 か所あり、どれも `check` と一致しない(`CLAUDE.md` L60 は 7 本、README L66・CONTRIBUTING L18・PR テンプレート L11・`project-management.md` L57・L66 は「textlint + ビルド」)。標準の本文側にも本リポジトリの主張が 2 か所ある(`ci-gates.md` L281「どれか1つでも失敗すると `npm run check` が落ちます」、`git-strategy.md` L147「ソロ期は main 直 push + CI 必須」)。後者は `origin/main` では成り立っていない
3. `deploy.yml`・`publish-standard.yml` は `ci.yml` と独立に main への push で走る。**検査が落ちてもサイトの公開と配布ブランチへの書き出しは止まらない**。`graphify-update.yml` は main へ `[skip ci]` のコミットを積む
4. **#277**: サブモジュールが無い環境で、黙って通る検査が 2 つある。`check-gate-criteria.mjs` の 3 方向目(L141 `if (fs.existsSync(KB))`。出力は KB を見たときと同じ「(一致)」)と、`check-provisions.mjs` の廃した言い回しの探索(`template/` は空のディレクトリとして存在するため「検査できなかった置き場」に数えない)。`origin/main` を取り出した作業ツリー(サブモジュール無し)で実行して確かめた。ほかの 4 本は「飛ばします」と出して終了コード 0、`check-impl.mjs` は失敗する
5. `publish-standard.yml` は KB を `dist-standard/tailoring-kb.json` へ生成するが、配る前に検査しない。`check-gate-criteria.mjs` は KB の場所が固定で、別の場所の KB を検査する引数を持たない。現在の `dist/standard`(生成元 b5f4815)は判定基準 43 件・8 ゲートすべて `criteriaComplete: false` で、`origin/main` の第4章(43 件)と一致している
6. 標準側の 1 文の案「検査の対象が存在しないとき、検査を通過として扱いません」は、**字面のままだと第4章 G-5「検査対象が存在しない場合の扱い」(L509「『対象なし』として証跡へ記録したうえで通過させます」、ADR-0033 決定2)と衝突する**。衝突しないのは「記録を残さずに通過として扱わない」と読む場合で、それは ADR-0033 決定2・5・6 が既に定めている。#277 の事象は「対象が存在しない」ではなく「検査器が読む先が手元に無い」で、G-5 の「対象なし」とは別の事象である
7. **#280**: `compute-strategy.md` は 4 段の置き場と「軽い検査ほど手前」の原則(L26)まで。段の中の順序、手元の通過の意味、検査定義の鮮度は書かれていない。手元の通過が公式判定でないことは、テンプレート側の `g5-local.mjs` L15 にあり、標準側は「CI と同じ範囲を手元で確かめられます」(`template-repository.md` L90)と限界(L749・L763)だけである。フェーズ5 の文書は規定・参考の種別を定めていない(第1章 L298)
8. **#281**: `publish-standard.yml` は `workflow_dispatch` を受け、`environment:` も ref の確認も持たず、`contents: write` で `dist/standard` へ `--force` する。リポジトリのルールセットは空(`gh api .../rulesets` が `[]`)、`dist/standard` は保護されていない(`.protected: false`)。GitHub Docs によれば、`workflow_dispatch` の `GITHUB_REF` は起動を受けたブランチで、走るのはそのブランチ上のワークフローのファイルである。**存在しない Environment を参照すると、保護規則も秘密情報も無い Environment が作られる**
9. 標準側で「配布ブランチ・手動起動の起動元」に触れる文は無い。`git-strategy.md` は既定ブランチのルールセットとタスクブランチの `--force-with-lease`(L44)まで、`ci-gates.md`「デプロイゲート」(L877-880)は G-8 を Environments の承認で実装できると書くだけで、Deployment branches・無料プランの非公開リポジトリで承認者を置けないこと・自動作成に触れない
10. **#260**: #260 の 9 URL のうち 8 URL は PR #322 の `.lycheeignore` にある。**aistandardshub.org の 1 URL(調査メモ 2 か所)は無い**。2026-10-18 の週次(#299)の 4xx に現れておらず、現在は 4xx でない可能性が高い(この環境からは到達できず確かめていない)。#260 は 2026-10-08 に not_planned で閉じている

## 1. 現状(突合)

### 1.1 #276 — 検査の一覧と CI

#### 1.1.1 `npm run check` の中身(`package.json`)

作業ツリーの `check`(18 本。左から順に実行し、最初の失敗で止まる):

| # | スクリプト | 実体 | template を読むか |
| --- | --- | --- | --- |
| 1 | `lint:text` | textlint(docs と README) | いいえ |
| 2 | `lint:tone` | `scripts/check-tone.mjs` | いいえ |
| 3 | `lint:evidence` | `scripts/check-evidence.mjs` | いいえ |
| 4 | `lint:impl` | `scripts/check-impl.mjs`(`IMPL_BASE_REF` で基点と比べる) | はい。無ければ失敗 |
| 5 | `lint:scope` | `scripts/check-scope.mjs` | いいえ(確かめた範囲) |
| 6 | `lint:refs` | `scripts/check-section-refs.mjs` | いいえ |
| 7 | `lint:provisions` | `scripts/check-provisions.mjs` | 一部(廃した言い回しの探索の置き場に `template` を含む) |
| 8 | `lint:skills` | `scripts/check-skill-provisions.mjs` | はい。無ければ飛ばす |
| 9 | `lint:figures` | `scripts/check-figures-svg.mjs` | いいえ |
| 10 | `brand:check` | `scripts/brand-sync.mjs --check` | いいえ |
| 11 | `lint:sources` | `scripts/research-ledger.mjs lint` | いいえ |
| 12 | `lint:registry` | `scripts/check-recalibration-registry.mjs` | はい。無ければ飛ばす |
| 13 | `test:engine` | `scripts/test-tailoring-engine.mjs` | いいえ |
| 14 | `test:impl` | `scripts/test-check-impl.mjs` | **作業ツリーだけ**(`origin/main` に無い) |
| 15 | `test:template` | `scripts/check-template-drift.mjs` | はい。無ければ飛ばす |
| 16 | `test:fields` | `scripts/check-template-fields.mjs` | はい。無ければ方向2 を飛ばす |
| 17 | `test:criteria` | `scripts/check-gate-criteria.mjs` | はい。無ければ 3 方向目を黙って飛ばす(1.2) |
| 18 | `build` | `astro build`(`starlight-links-validator` による内部リンクの検査、`src/content.config.ts` の Zod スキーマ) | いいえ |

- `check` に入っていない検査系のスクリプト: `evidence:write`・`impl:write`・`scope:write`・`criteria:write`(書き戻し)、`sources:index`、`template:kb`、`brand:sync`。外部リンク(lychee)は `link-check.yml` の週次だけ
- `origin/main` の `check` は 17 本(上の表から `test:impl` を除く)

#### 1.1.2 ワークフローと契機

| ファイル | 契機 | 実行するもの | 備考 |
| --- | --- | --- | --- |
| `ci.yml`(作業ツリー) | `pull_request`、`push`(main)、`workflow_dispatch` | checkout(`fetch-depth: 0`)→ `git submodule update --init --recursive template` → `npm ci` → `npm run check`(`IMPL_BASE_REF` を契機ごとに渡す。L35) | L14-15「zenn/ は検査が読まないため取得しない(Issue #292 突合 X-7)」 |
| `ci.yml`(`origin/main`) | `pull_request`、`workflow_dispatch` | `npm ci` → `npm run lint:text` → `npm run build` | main への push では走らない。サブモジュールを取得しない |
| `deploy.yml` | `push`(main)、`workflow_dispatch` | `withastro/action@v6` でビルド → `actions/deploy-pages@v5`(Environment `github-pages`) | `ci.yml` に依存しない(`needs` は同じファイル内の build だけ) |
| `publish-standard.yml` | `push`(main。`src/content/docs/**`・`src/data/**`・`scripts/build-template-kb.mjs` の変更時)、`workflow_dispatch` | `npm ci` → `build-template-kb.mjs --out dist-standard/tailoring-kb.json` → 本文のコピー・`VERSION.md` の生成 → `git push --force` で `dist/standard` | 1.4 で詳述 |
| `evidence-review.yml` | `schedule`(毎月1日 00:00 UTC)、`workflow_dispatch` | `check-evidence.mjs --expired` → 期限切れがあれば Issue の起票・追記 | L5「npm run check は期限では失敗させない」 |
| `graphify-update.yml` | `push`(main。`graphify-out/**` を除く) | `graphify update .` → `[skip ci]` のコミットを main へ push(`contents: write`) | `[skip ci]` は push を契機とするワークフロー(`ci.yml`・`deploy.yml`・`publish-standard.yml`)をそのコミットで起動しない |
| `link-check.yml` | `schedule`(毎週日曜 21:00 UTC = 月曜 06:00 JST)、`workflow_dispatch` | lychee(docs・README・research)。4xx が 1 件以上なら Issue を起票・更新 | 5xx・接続失敗は起票しない(L48-53) |

#### 1.1.3 検査を列挙する箇所・CI と同じと主張する箇所(逐語)

| # | 所在 | 記述 | `check` との関係 |
| --- | --- | --- | --- |
| e1 | `CLAUDE.md` L60 | 「`npm run check` — textlint + トーン + 根拠水準 + 節番号の参照 + エンジンテスト + 複製の検査 + ビルド(push 前に必ず通ること。PR では CI (`ci.yml`) が同じチェックを実行)」 | 7 本を列挙。18 本と一致しない。「CI が同じチェック」は `origin/main` では偽、作業ツリーでは真 |
| e2 | `CLAUDE.md` L46 | 「乖離は `npm run check` が検出する」 | template が無い環境では飛ばす(1.2) |
| e3 | `README.md` L66 | 「npm run check    # textlint(日本語校正) + ビルド検証」 | 2 本 |
| e4 | `CONTRIBUTING.md` L18・L24 | 「npm run check    # textlint(日本語校正)+ ビルド検証」「`npm run check` が通ること(PR では CI が同じチェックを実行します)」 | 2 本。CI の主張は e1 と同じ |
| e5 | `.github/PULL_REQUEST_TEMPLATE.md` L11 | 「- [ ] `npm run check`(textlint + build)が通る」 | 2 本 |
| e6 | `src/content/docs/community/project-management.md` L50・L57・L66 | 「`npm run check` が通り」(DoD)、「`npm run check`(textlint + ビルド)が通る」、「3. CI(textlint + ビルド)を required status check に指定する」 | 2 本。L66 は PR フロー移行の手順 |
| e7 | `src/content/docs/phase5-implementation/ci-gates.md` L280-282(`origin/main` L262) | 「本サイト自体がこの構成の実例です。日本語文書は textlint、内部リンクはビルド時検証、プロセスデータは Zod スキーマで検査され、どれか1つでも失敗すると `npm run check` が落ちます。」 | 3 種を例示。偽ではないが、CI で落ちるとは書いていない |
| e8 | `src/content/docs/phase5-implementation/git-strategy.md` L146-148 | 「本サイトのリポジトリ自体が「ソロ期は main 直 push + CI 必須、コントリビューター参加でルールセット有効化」という段階導入の実例です」 | `origin/main` では main への push で CI が走らない。作業ツリーでも push の後に走るだけで、「必須」(止める)ではない。ルールセットは 0 件 |
| e9 | `src/content/docs/phase5-implementation/compute-strategy.md` L26・L104 | 「本サイトの textlint フックが実例」「プッシュ前検査のコマンド統一(例: npm run check)」 | 例示 |

- 一覧の正本を 1 か所に置く仕組み、または一覧と `ci.yml` を突合する検査は無い。作業ツリーの `ci.yml` は `npm run check` を呼ぶため、`check` の中身が変わっても `ci.yml` は追随する。食い違いが残るのは e1〜e6 の**説明文の側**である
- テンプレート側には `verify-gate-contract.mjs` が構成 ⇄ CI ⇄ ブランチ保護を検査する仕組みがある(本 Issue の対象外。issues-context)

#### 1.1.4 CI で `npm run check` を走らせる前提

- pit-in-template は公開リポジトリ(`gh api repos/Takenori-Kusaka/pit-in-template` → `private: false`)。`git ls-remote` で認証なしに取得できた。トークンは要らない
- 作業ツリーが指す template の版は b1c8b4b。pit-in-template の `origin/claude/process-compass-292` にだけ含まれ、template の main には未マージ(`git -C template branch -r --contains`)。そのブランチが消えると、サブモジュールの取得で CI が落ちる可能性がある(GitHub がブランチから到達できないコミットの取得を許すかは確かめていない)
- `research/292-deliberation/implementation.md` L255-262(7.2): 新しい複製で template だけを取得し `npm run check` が終了コード 0。外部通信・秘密情報・`gh` を使う検査は無い
- 所要時間は測っていない(5 章)

### 1.2 #277 — 配布物の検査と、対象が無いときの扱い

#### 1.2.1 対象が無いときの各検査の振る舞い

`origin/main` を取り出した作業ツリー(サブモジュール無し。`template/` は空のディレクトリ)で実行して確かめた(2026-10-23)。

| 検査 | 条件 | 出力 | 結果 |
| --- | --- | --- | --- |
| `check-gate-criteria.mjs` L137-161 | `template/scripts/vendor/tailoring-kb.json` が無い | 「判定基準の複製: 8ゲート / 43件(一致)」 | **通過。KB を見た場合と出力が同じ**(L174)。3 方向目を実施しなかったことが出力に残らない |
| `check-provisions.mjs` L178-186・L203-208 | 置き場 `template` が空のディレクトリ | 「規定の表現形式: 違反なし(… 104 ファイルで検査)」 | **通過。`existsSync` が真のため「検査できなかった置き場」に数えない**。サブモジュールがある作業ツリーでは 268 ファイル(本文の差を含むため単純比較はできない) |
| `check-template-drift.mjs` L20-24 | `template/process.config.json` が無い | 「template/ が未初期化のため、複製の検査を飛ばします」 | 終了コード 0。飛ばしたことは出る |
| `check-skill-provisions.mjs` L36-40 | `template/.claude/skills` が無い | 「…スキルの文の検査を飛ばします」 | 同上 |
| `check-recalibration-registry.mjs` L17-20 | 登録簿の JSON が無い | 「…登録簿の整合の検査を飛ばします」 | 同上 |
| `check-template-fields.mjs` L30・L73-75 | `template/process.config.json` が無い | 「…テンプレート側の検査を飛ばします」「必須欄の検査: 12様式 / 158欄」 | 方向1 だけ実施して終了コード 0 |
| `check-impl.mjs` L165-168 | `generate-profile.mjs` が無い | 「template/ が初期化されていないため、降ろし先を確認できません」 | **失敗(終了コード 1)** |
| `check-figures-svg.mjs` L24-25 | `src/assets/figures` が無い | 何も出さない | 正本側のディレクトリ。サブモジュールとは無関係 |
| `research-ledger.mjs` L105・L113・L118 | 台帳のディレクトリ・ファイルが無い | 空の配列として扱う | 同上 |

- 「飛ばした」を出力する前例は 4 本(drift・skills・registry・fields)。終了コードはどれも 0 で、CI の結果の一覧からは区別できない
- `check-template-drift.mjs` L9-10 は飛ばす理由を「クローン直後に npm run check が失敗する構成にしないため」と書く。一方 `check-impl.mjs` は同じ状況で失敗させており、**同じ `npm run check` の中で方針が 2 つある**(`origin/main` では、サブモジュール無しの `npm run check` は `lint:impl` で落ちる)

#### 1.2.2 生成器と配布の経路

- `scripts/build-template-kb.mjs` L1-11: 出力先の既定は `template/scripts/vendor/tailoring-kb.json`、`--out <path>` で変えられる。L245-248 `defaultOut()` は `template` のディレクトリが在れば(空でも)サブモジュール側を選ぶ
- 同 L233-240: `source.commit` は `git rev-parse HEAD`、取れなければ `'unknown'`。`check-gate-criteria.mjs` L150 は `!kb.source?.commit` だけを見るため、`'unknown'` は通る
- `check-template-drift.mjs` L43-57: サブモジュール側の KB を `buildKb()` の出力と比べる(`source.commit` は比較から外す。#301)。比べる先はサブモジュール側だけで、`dist-standard/` は見ない
- `check-gate-criteria.mjs` L140: KB の場所は定数で、引数で別の KB を検査する手段は無い(引数は `--write` だけ)
- `publish-standard.yml` L41-42・L79-93: `build-template-kb.mjs --out dist-standard/tailoring-kb.json` で生成し、検査せずに `--force` で push する。サブモジュールは取得しない(生成器は `src/data/` と本文だけを読むため、生成には不要)
- 現在の `dist/standard`(コミット f63ad4f、2026-10-23 13:40 UTC、生成元 b5f4815、run 15): `tailoring-kb.json` の判定基準 43 件、`source.commit` あり、8 ゲートとも `criteriaComplete: false`。`origin/main` の第4章は 43 件で一致。作業ツリーは 44 件

#### 1.2.3 ADR-0052(逐語)

- 決定1(L43-47): 「正本と複製の一致だけでなく、**配布物の中身が正本と一致すること**を検査します。」「**配布した知識ベースが運ぶ判定基準の総数が、第4章の表の総数と一致すること**を検査します。」
- 決定2(L49-53): 「配布物に**生成元のコミット**を書きます。」「**受け取り側が「自分の複製が正本のどの時点のものか」を知る手段は、これしかありません**。」
- 決定3(L55-61): 降りていないことを示す欄(`criteriaComplete`)を配布物へ持たせ、検査する
- 帰結(L80-83): 「`npm run check` が、配布物の判定基準の件数と生成元の版を検査する」「配布項目を増やすたびに、対応する検査を足す必要がある」
- EV-0038(E2、見直し 2027-02): 件数の一致で通過した誤配が 1 件でも出れば内容の突合が要る
- ADR-0052 のコンテキスト(L18-22)が扱った「配布物」は、テンプレートへ複製する KB(`template/scripts/vendor/`)である。`publish-standard.yml` は同じ 2026-08-14 に追加された(0cbb0e9)が、ADR-0052 は `dist/standard` に触れていない。**帰結の「`npm run check` が検査する」は、テンプレートの KB については成り立ち(サブモジュールがある場合)、`dist/standard` については成り立たない**

#### 1.2.4 標準側の「対象なし」の既存の規範(逐語)

| # | 所在 | 記述 |
| --- | --- | --- |
| n1 | `gate-criteria.md` L509 | 「検査の対象が存在しない基準は、「対象なし」として証跡へ記録したうえで通過させます。**通過の根拠は、検査の結果が0件であったことではなく、対象が存在しない事実を記録したことです**。0件の合格として残すと、実施していない検査を実施したという記録が残ります。」 |
| n2 | 同 L511-520 | 基準ごとの可否の表。基準6・7 は「**認めない**」、基準4 は「用いない」 |
| n3 | 同 L524-528 | 記録の項目: 基準の識別・対象が存在しない理由・判定の時刻 |
| n4 | 同 L530 | 「**実装が存在する段階で、この扱いを用いてはなりません**。テストコードがあるにもかかわらず0件で通過する経路を作らないためです。」 |
| n5 | 同 L532-540 | 「「対象なし」は、未達および省略のいずれとも異なります。」「「対象なし」をこの2区分へ加えません。G-5 の証跡が持つ属性として扱います。」 |
| n6 | 同 L421 | 「検査の対象が存在しない基準の「対象なし」(後掲)は、検査を外すことではありません。」 |
| n7 | 同 L755 | G-7 基準5 の突合で「対象なし」の記録を記録の欠落と区別する |
| n8 | `ci-gates.md` L866(`origin/main` L848) | 「カバレッジの測定対象が0行のとき、追跡しているファイルに製品のコード(…)が無ければ「対象なし」として通す。」 |
| n9 | `ci-gates.md` L865 | 「曖昧語検査(spec-lint)は、機能仕様の置き場(`specs/F-NNN/`)だけを見る。機能仕様を別の場所へ置く運用では、検査が働かない。」(検査器が見ない場所の開示) |
| n10 | ADR-0033 決定2・5・6・7 | 記録したうえで通過・記録の項目・実装がある段階で用いない・未達と省略から区別 |
| n11 | ADR-0028 | 未達(目的を達成する構成を示せていない)と省略(規則により適用しない)の区別 |
| n12 | `template/scripts/gate/g5-local.mjs` L33-38・L117-118 | `status: 'skip'` と理由を結果の表へ残す。依存の取得の失敗で実施できない検査は失敗に数える |

- 案の文「検査の対象が存在しないとき、検査を通過として扱いません」は、n1 の「通過させます」と字面で逆である。両立させるには、(i)「記録なしに」を補う(n1・n10 の再言になる)、(ii) 適用の範囲を「検査器が読む先(入力)が実行環境に無い」場合に限る(G-5 の「対象なし」は案件に対象そのものが無い場合)、のいずれかが要る
- (ii) の区別は標準の中に語として無い。n9 は「検査が働かない」場所の開示で、近いが規範ではない

### 1.3 #280 — 手元の検査と CI の境界

#### 1.3.1 標準が既に書いていること(逐語)

| # | 所在 | 記述 |
| --- | --- | --- |
| l1 | `compute-strategy.md` L10-24 | 4 段(保存時・プッシュ前・PR・定期)の表。PR の段の狙いは「ゲートとしての公式判定(記録が残る)」 |
| l2 | 同 L26 | 「原則は「**軽い検査ほど手前(ローカル)で、公式判定と重い検査だけをクラウドで**」です。」 |
| l3 | 同 L108 | 「「ローカルで通れば CI でも通る」を保証できるほど、クラウド実行の無駄が減ります。設定はすべてリポジトリにコミットして共有し、個人環境の差で検査結果が変わる状態を避けます。」 |
| l4 | 同 L30-36 | CI のコスト最適化(キャッシュ・差分実行・並列度・セルフホスト・タイムアウト)。並列度は「最も遅いジョブ」を基準に |
| l5 | `template-repository.md` L90 | 「G-5 は `node scripts/gate/g5-local.mjs` で、CI と同じ範囲を手元で確かめられます。」 |
| l6 | 同 L749 | 「手元の検査だけでは、過去の記録ごと書き換える改ざんを検出しない。」(issues-context の「L702-703」は行がずれ、現在はここ) |
| l7 | 同 L763 | 「確かめたのは、手元で `g5-local.mjs` が、1名と3名の初期化の直後(…)に全検査を通ることまでである」 |
| l8 | 同 L712 | 「PR での該当の判定は、基底ブランチのコードと構成で行います。」 |
| l9 | `ci-gates.md` L94 | 「CI と手元で同じ範囲を見るよう、手元の既定の範囲を CI と同じにする」 |
| l10 | `ci-gates.md` L141・L143・L148 | 区分の下限・停止の申し立て・生成物の判定を**基底ブランチの**構成・記録で行う |

- テンプレート側: `g5-local.mjs` L15「手元の結果は CI の結果の代わりにならない。マージを止めるのは CI の必須チェック gate-g5 である。」、L104 の表題「CI と同じ範囲。マージを止めるのは CI の gate-g5」。`template/README.md` L70-74「個々の検査を手で選ぶと、CI より狭い範囲を見て「0件」と誤ることがあります。」(issues-context の「L60」は現在 L70)
- **「手元の通過は公式判定ではない」は、標準側には l1 の表の「公式判定」の語と l2 の原則として間接にしかない**。規範の文としては無い
- **段の中の順序**: 標準・テンプレートに規定は無い(「fail-fast」「安い順」「実行順」を検索して 0 件)。`gate-g5.yml` の各ジョブは `config` だけを `needs` にとり並列、最後の集約ジョブが全ジョブを待つ。本リポジトリの `check` は `&&` の直列で、最初の失敗で止まる(先頭は `lint:text`、末尾は `build`)
- **検査定義の鮮度**: `verify-gate-contract.mjs` L14-18・L152-190 の `--base` は `process.config.json`(構成)を基底と比べる。検査スクリプト・テンプレート・読み込み先の更新を比べる仕組みは無い。PR 上では l8・l10 のとおり一部の判定を基底のコードで行い、`delegation.yml` は `pull_request_target`(基底のワークフロー)で動く。これは「PR 側で検査を弱める」ことへの対策で、#280 の「手元が古い検査定義で走る」とは向きが逆である
- 本リポジトリの `check-impl.mjs` は `IMPL_BASE_REF` で基点の登録簿と比べ、比べられなければ「比べなかったこと」を出力する(L71-73、`ci.yml` L29-35)。検査の**データ**の基点比較の前例である

#### 1.3.2 規範の置き場と制約

- フェーズ5 の文書は本文 8 章と附属書の外にあり、本文に従属し、規定・参考の種別を定めていない(`phase4-process-design/overview.md` L291・L298)。`compute-strategy.md` は `provision-forms.yaml` の登録簿にない(`check-provisions.mjs` の文末の検査が掛からない)
- 規範を本文へ置くなら第4章 G-5(判定の場所・集約。L417・L421)、第5章、第8章 のいずれか。実装マーク(IMPL)で `g5-local.mjs` に接続するなら、降ろし先は `src/data/impl-targets.yaml` に登録したものに限られる(CLAUDE.md)
- 制約となる決定:
  - ADR-0074 決定1(検査装置の総量に上限を置かない)・決定2(判定基準を実装する検査が集約に入っていることを機械で確かめる)・決定3(強制層の検査の追加・削除・統合は AI維持管理者が承認)。手元の事前停止(`pre-ready` 相当)をテンプレートの強制層へ足すなら決定3 の承認に乗る
  - 第4章 G-5「是正の起動」(L425 以下)・ADR-0073 決定2: 機械の検査で失敗させるのは、実効的な偽陽性が無い・修正できる・既存の違反を解消済み、の 3 条件を満たす場合に限る。「検査定義が基底で動いたら止める」を失敗させる検査にするなら、この 3 条件の判定が要る
  - ADR-0074 決定6(追加の凍結を課さない)
  - 「検査定義が動いたときだけ止める」の根拠はがんばりクエストの 1 件(issue-triage、FND-0264 の「pre-ready の落ち回数は測定不能」)。入れるなら EV マーク

### 1.4 #281 — 配布ブランチと手動起動

#### 1.4.1 `publish-standard.yml` の現状(逐語)

- L11-18: `push`(main、パス限定)と `workflow_dispatch`
- L20-21: `permissions: contents: write`
- L27-31: `environment:` も `if: github.ref == 'refs/heads/main'` も無い
- L56: 「- コミット: \`${GITHUB_SHA}\`」。L59「**本ブランチは配布物です。正本は上記リポジトリの \`main\` です。**」
- L91-93: `git push -q --force "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" HEAD:refs/heads/dist/standard`
- 初版(0cbb0e9、2026-08-14)から変更なし
- 本ワークフローは標準の本文・テンプレートのどこからも参照されていない(`dist/standard`・`publish-standard` を `src/` と `template/` で検索して 0 件)

#### 1.4.2 リポジトリの設定(読める範囲)

- `gh api repos/Takenori-Kusaka/process-compass/rulesets` → `[]`(ルールセット 0 件)
- `gh api .../branches/dist%2Fstandard --jq .protected` → `false`
- Environments の一覧は、この環境のプロキシが API を拒否して読めなかった。`deploy.yml` は `github-pages` を使う

#### 1.4.3 標準側の関係する文(逐語)

| # | 所在 | 記述 |
| --- | --- | --- |
| d1 | `git-strategy.md` L44 | 「ブランチが main から遅れたら **rebase で追従**する(…)。ブランチは1タスク=1人(+AI)の専有なので、履歴書き換えの危険はない。push は `--force-with-lease` を使う」 |
| d2 | 同 L62-79 | 既定ブランチ(`~DEFAULT_BRANCH`)へのルールセットの例。`non_fast_forward` を含む。既定ブランチ以外は対象にしない |
| d3 | 同 L138 | 1名体制: 「ルールセットなし・main 直 push 可。ただし CI(G-5相当)は最初から必須。」 |
| d4 | `ci-gates.md` L877-880「デプロイゲート」 | 「リリース決裁(G-8)は GitHub Environments の approval(環境保護ルール)で実装できる。`production` 環境に事業決裁者を required reviewer として設定すれば、決裁の記録も自動で残る」 |
| d5 | `ci-gates.md` L142 | 統制の設定(`.github/workflows/**`・`.github/rulesets/**` ほか)を変える PR に「統制の設定の陰性の確認」を求める |
| d6 | `qms-document-control.md` L25-26 | 「\| 配付・アクセス・利用可能性 \| 公開サイトのビルドと権限設定 \| 公開されたページ \|」「\| 変更の管理(版の識別を含む) \| 版管理の履歴と、公開ページへ出力した版の識別子 \|」 |
| d7 | 同 L41 | G-8 の承認は「実行環境の承認操作」で、「当該者が承認者として登録されている」ことを成立の条件にする |
| d8 | 同 L43 | 「成立の条件を満たさない操作は、**承認の記録として扱いません**。」 |
| d9 | 同 L99 | 版の識別は「この出力を手で書いてはなりません」 |
| d10 | `risk-catalog.md` L99・L101 | 「CI が壊れ検証が止まる」「配備の自動化の不備による操作の誤り」(受け止めは「PR ワークフロー、hotfix でも PR を経る規定」) |
| d11 | ADR-0052 決定2 | 配布物に生成元のコミットを書く(1.2.3) |

- 配布ブランチ(既定ブランチ以外へ機械が force push する置き場)、手動起動の起動元、Environment の Deployment branches、無料プランの非公開リポジトリで承認者を置けないことは、いずれも標準に無い
- d6 は QMS の「配付」を公開サイトで受ける。案件が submodule として取り込む `dist/standard` は、d6 の表の行に現れない
- 標準側の 1 節を置く根拠は publishing-hub の 1 件(issues-context)。置くなら EV マーク

#### 1.4.4 ワークフローだけで強制できること・設定が要ること

| 手段 | 置き場 | 起動元ブランチでファイルを書き換えた場合 |
| --- | --- | --- |
| ジョブ先頭の ref の確認(`if: github.ref == 'refs/heads/main'`) | ワークフローのファイル | **効かない**。`workflow_dispatch` は起動を受けたブランチ上のファイルで走る(2 章)。そのブランチで確認を消せば通る |
| `environment:` の指定 | ワークフローのファイル | 指定そのものを消せば Environment を経ない |
| Environment の Deployment branches(main に限る)・required reviewers・管理者のバイパス禁止 | リポジトリの設定(Environment) | `environment:` を残す限り効く。消されると効かない |
| 存在しない Environment 名の指定 | — | 保護規則の無い Environment が自動で作られ、素通しになる(2 章) |
| `dist/standard` へのルールセット(更新の制限・force push の禁止) | リポジトリの設定(ルールセット) | ファイルの書き換えでは外せない。ただし正規の配布も `GITHUB_TOKEN` で force push しており、バイパスの許可の設計が要る(確かめていない。5 章) |
| `contents: write` を持つ他のワークフロー(`graphify-update.yml`) | — | 同じトークンの権限で `dist/standard` へも書ける |

- 「ワークフローの変更だけでは完結しない」(issues-context)は上表と整合する。ファイルの外で止めるのはリポジトリの設定(Environment・ルールセット)で、その設定は管理者の操作を要する

### 1.5 #260 — 9 URL と PR #322 の `.lycheeignore`

#260(2026-08-23 起票、2026-10-08 not_planned で閉鎖)の 4xx は 9 URL(10 件)。PR #322(`df6e48c`、未マージ。Closes #299)の `.lycheeignore` と照合した。

| # | URL(#260 の本文) | #260 の状態 | PR #322 の `.lycheeignore` | #299(2026-10-18)の検出 |
| --- | --- | --- | --- | --- |
| 1 | `https://www.faa.gov/.../redac-sas-201503-gsn-community-standard-v1.pdf` | 404 | あり(到達できるもの) | 404 |
| 2 | `https://handbook.gitlab.com/handbook/company/culture/all-remote/asynchronous/` | 404 | あり(到達できるもの) | 404 |
| 3 | `https://arxiv.org/pdf/2511.15755` | 404 | あり(到達できるもの) | 404 |
| 4 | `https://www.foundernest.com/insights/why-most-innovation-projects-never-scale-and-how-to-fix-it` | 404 | あり(消失・移転) | 404 |
| 5 | `https://aistandardshub.org/ai-standards/artificial-intelligence-functional-safety-and-ai-systems-iso-iec-tr-54692024/`(`122-safety-risk-assessment.md` L218、`123-safety-verification.md` L119) | 404 ×2 | **無し** | **現れない** |
| 6 | `https://www.claudedirectory.org/blog/claude-code-permissions-guide` | 402 | あり(消失・移転) | 402 |
| 7 | `https://www.simula.no/publications/survey-characteristics-projects-success-delivering-client-benefits` | 404 | あり(到達できるもの) | 404 |
| 8 | `https://dev.to/opscanopy/one-cve-four-ignore-files-unifying-trivy-grype-snyk-and-osv-scanner-4m57` | 404 | あり(消失・移転) | 404 |
| 9 | `https://digital.gov/resources/requirements-for-achieving-efficiency-transparency-and-innovation-through-reusable-and-open-source-software/` | 404 | あり(到達できるもの) | 404 |

- 9 URL 中 8 URL は登録済み。#5 は 2 つの調査メモに残り、`.lycheeignore` に無い。#299 の 4xx に現れないので、現在の週次では起票の条件に当たっていない
- #260 の 307(`blog.codecentric.de`)は、PR #322 が `--accept` に 307 を足して許容した
- #260 の 502(atlassian)・500(servicenow)は 5xx で、`link-check.yml` L52-53 の方針で起票の対象外

## 2. 世の中がどうなっているか(GitHub の仕様。取得日 2026-10-23)

| # | 出典 | 内容 |
| --- | --- | --- |
| w1 | GitHub Docs「Managing environments for deployment」(docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) | 「Running a workflow that references an environment that does not exist will create an environment with the referenced name.」(逐語)。同じ段落の残り(要約): Pages のビルドが作る場合を除き、作られた Environment は保護規則も秘密情報も持たない。ワークフローを編集できる者は誰でもこの方法で Environment を作れるが、設定できるのは管理者だけ |
| w2 | 同 | 「Prevent self-review」(起動した本人の承認を防ぐ)、「Allow administrators to bypass configured protection rules」の解除で管理者のバイパスを禁じられる |
| w3 | 同 | 無料・Pro・Team のプランでは、待機時間・required reviewers は公開リポジトリだけ。非公開リポジトリで Environment・Deployment branches を使うには有料プラン |
| w4 | GitHub Docs「Deployments and environments」(docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) | Deployment branches and tags の選択肢は「No restriction」「Protected branches only」「Selected branches and tags」の 3 つ。規則はワークフロー実行の `GITHUB_REF` と照合される |
| w5 | GitHub Docs「Events that trigger workflows」`workflow_dispatch` | `GITHUB_SHA`「Last commit on the `GITHUB_REF` branch or tag」、`GITHUB_REF`「Branch or tag that received dispatch」、「This event will only trigger a workflow run if the workflow file exists on the default branch.」 |
| w6 | GitHub Docs「Deploying with GitHub Actions」 | 「You need to create an environment before you can use it in a workflow.」(前提条件の節。w1 と並べると、作っていなければ自動作成で素通しになる) |

- w5 から: 既定ブランチにファイルがあれば、任意のブランチを指定して手動起動でき、走るのはそのブランチのファイル・そのブランチの先頭コミットである。`VERSION.md` の `${GITHUB_SHA}` は main 以外のコミットを指しうる(issues-context の指摘と一致)
- 本リポジトリ(公開)は w3 の制限を受けない。案件のリポジトリ(非公開・無料)では required reviewers を置けない。テンプレート README L115 はルールセットについて同じ型の制限を開示している

## 3. 選択肢

### 論点1(#276)一覧を 1 か所に置き、CI と一致させる形

| 案 | 内容 | 現状との関係 |
| --- | --- | --- |
| 1-A | 正本は `package.json` の `check`。説明の側(e1〜e6)は個々の検査を列挙せず、「`npm run check` の中身は `package.json` が正本」とだけ書く | 作業ツリーの `ci.yml` が `npm run check` を呼ぶので、`ci.yml` 側の一覧は不要になる |
| 1-B | 1-A に加え、`ci.yml` が `npm run check` を呼ぶことを機械で確かめる(例: `check` の中に、`ci.yml` の手順に `npm run check` があることを確かめる検査を置く) | テンプレートの `verify-gate-contract.mjs`(構成 ⇄ CI)と同じ型。対象はこのリポジトリだけ |
| 1-C | 一覧を文書(`project-management.md` か CLAUDE.md)に表で持ち、`check` との突合を検査する | 一覧が第 3 の正本になる(ADR-0052 の却下理由「一覧そのものが第3の正本になる」と同じ型) |
| 1-D | 説明の側の列挙を直すだけで、検査は置かない | e1〜e6 は再び古くなりうる(10-08 から 7 本以上増えた) |
| 1-E | `deploy.yml`・`publish-standard.yml` を `ci.yml` の成功に従わせる(`workflow_run`、または同じワークフロー内で `needs`) | 受入条件の範囲の外。検査が落ちたまま公開・配布される現状(1.1.2)を問うなら要る |

- e7・e8(標準本文の「本サイト」の注記)の扱いは別の選択: (a) 現状に合わせて直す、(b) 注記を外す、(c) そのまま。e8 は `origin/main` で事実と異なり、作業ツリーでも「必須」と言えない

### 論点2(#277)配布物を配る前に検査する形

| 案 | 内容 |
| --- | --- |
| 2-A | `check-gate-criteria.mjs` に KB の場所を渡す引数を足し、`publish-standard.yml` の生成の直後(push の前)に `dist-standard/tailoring-kb.json` を検査する。落ちたら配らない |
| 2-B | 2-A に加え、`publish-standard.yml` で `npm run check` 全体を走らせる(サブモジュールの取得が要る) |
| 2-C | `publish-standard.yml` を `ci.yml` の成功の後にだけ走らせ、配布物の検査は 2-A だけにする |
| 2-D | 配布物の検査を置かず、`dist/standard` の現物を週次で検査する(事後の検出) |

### 論点3(#277)対象・入力が無いときの検査の振る舞い

| 案 | 内容 |
| --- | --- |
| 3-A | 3 方向目の黙った通過だけを直す: KB が無ければ「飛ばした」と出力する(drift ほか 4 本と同じ形) |
| 3-B | サブモジュールが無いときは `npm run check` 全体を失敗させる(`check-impl.mjs` の現在の振る舞いに揃える)。手元のクローン直後に落ちる |
| 3-C | 「飛ばした」を出すだけでなく、CI(環境変数 `CI`)では飛ばしを失敗にする。手元では飛ばし、CI では止める |
| 3-D | `check-provisions.mjs` の置き場の扱いを「空のディレクトリ」も検査できなかった置き場に数える形へ直す |
| 3-E | 現状維持(飛ばす理由「クローン直後に失敗させない」を保つ) |

### 論点4(#277)標準側の 1 文

| 案 | 内容 | 既存との関係 |
| --- | --- | --- |
| 4-A | 案の文をそのまま置く | n1・ADR-0033 決定2 と字面で衝突する。採るなら ADR-0033 の置き換えになる |
| 4-B | 「検査器が読む先が実行環境に無いことを、検査の通過として扱わない。実施しなかったことを結果に出す」と、G-5 の「対象なし」(案件に対象が無い)と区別して置く | 新しい区別を足す。置き場は第4章 G-5「検査対象が存在しない場合の扱い」の隣か、`ci-gates.md` |
| 4-C | 標準側には足さず、n1 の「記録したうえで」と n4 で足りるとする。本リポジトリの検査は 3 の案で直す | 「課さないと決めた」と明記が要る |
| 4-D | `g5-local.mjs` の `skip` と理由(n12)を標準側の規範として書き、実装マークで接続する | 論点6 と重なる |

### 論点5(#280)段の中の順序・検査定義の鮮度

| 案 | 内容 |
| --- | --- |
| 5-A | `compute-strategy.md` に「段の中は安く落ちる検査から並べる」を書く(参考の記述として) |
| 5-B | 5-A を規範として本文(第4章 G-5 か第5章)へ置く |
| 5-C | 「手元で走らせる検査の定義(検査スクリプト・テンプレート・読み込み先)が基底で更新されていれば、実行の前に止める」を規律として書き、実装は案件ごととする。根拠は 1 件のため EV マーク |
| 5-D | 5-C をテンプレートの `g5-local.mjs` に実装する(基底との差分を `scripts/gate/**` などで見る)。強制層の追加として ADR-0074 決定3 の承認に乗る。失敗させるなら G-5「是正の起動」の 3 条件を満たすかの判定が要る |
| 5-E | どれも課さない(順序は運用の最適化で標準の事項でない、鮮度は CI が基底で判定するので足りる)と明記する |

### 論点6(#280)「手元の通過は公式判定ではない」を標準側へ

| 案 | 内容 |
| --- | --- |
| 6-A | `compute-strategy.md` の表と原則に、手元の通過はゲートの判定ではないことを 1 文で書き、IMPL で `g5-local.mjs` に接続する |
| 6-B | 第4章 G-5 に「判定の場所」として書く(手元の結果は G-5 の証跡にならない) |
| 6-C | 現状(l1 の表の「公式判定」、テンプレート側の明記)で足りるとする |

### 論点7(#281)配布ブランチ・手動起動

| 案 | 内容 |
| --- | --- |
| 7-A | ワークフローだけ: ジョブ先頭の ref の確認と `environment:` の指定を足す。ファイルの書き換えで外せることを文書に書く |
| 7-B | 7-A に加え、リポジトリの設定で Environment を作り、Deployment branches を main に限る(利用者の操作が要る)。Environment の作成を先に行う(w1 の自動作成を避ける) |
| 7-C | 7-B に加え、`dist/standard` にルールセット(更新の制限)を置き、正規の配布だけを通す |
| 7-D | `workflow_dispatch` を外し、push(main)だけで配る |
| 7-E | 標準側に 1 節(`ci-gates.md`「デプロイゲート」か `risk-catalog.md`)を置く: 既定ブランチ以外へ機械が書く置き場は、ワークフローのファイルの外(Environment・ルールセット)で止める。根拠 1 件のため EV マーク |
| 7-F | 標準側には置かない(本リポジトリの運営の問題として閉じる)と明記する |

- `ci-gates.md` d4 に、Environment を参照する前に作ること(w1)・無料の非公開リポジトリで承認者を置けないこと(w3)を書くかは、7-E とは別に決められる

### 論点8(#260)残り 1 URL

| 案 | 内容 |
| --- | --- |
| 8-A | aistandardshub の URL を確かめ、到達できれば何もしない |
| 8-B | 予防として `.lycheeignore` に足す(4xx でない URL を除外する) |
| 8-C | 何もしない(週次が 4xx を出したときに扱う) |

## 4. 会議体への問い

1. 検査の一覧の正本を `package.json` の `check` とし、説明の側では列挙しない(1-A)ことで「1 か所」と言えるか。`ci.yml` が `npm run check` を呼ぶことの機械の確認(1-B)は要るか
2. 標準本文の「本サイト」の注記(e7・e8)は、本標準の規範ではなく本リポジトリの事実である。事実と食い違うときに直すか外すか。外すなら「実例」として示す価値をどう見るか
3. 公開(`deploy.yml`)と配布(`publish-standard.yml`)が検査の成否と独立している(1.1.2)ことを、#293 の範囲で扱うか
4. 「対象が無い」(G-5 の「対象なし」。案件に対象が存在しない)と「検査器の入力が実行環境に無い」(サブモジュール未取得)を、標準の語として区別するか。区別しないなら案の文(4-A)は ADR-0033 と衝突するが、どちらが誤りか
5. 同じ `npm run check` の中で、サブモジュールが無いときに「飛ばす」(4 本)・「黙って通す」(2 本)・「失敗させる」(1 本)が並んでいる。どれに揃えるか。手元のクローン直後と CI で振る舞いを分けるか(3-C)
6. ADR-0052 の帰結「`npm run check` が配布物を検査する」は、`dist/standard` も対象に含むと読むか。含むなら、ADR-0052 の範囲の明確化は新 ADR を要するか
7. 段の中の順序と検査定義の鮮度は、標準の事項か、案件の運用の最適化か。標準の事項なら、フェーズ5(種別未定)と本文のどちらに置くか
8. 「検査定義が動いたときだけ止める」を書くなら、根拠 1 件(測定不能を含む)で EV マークを付けて置くか、置かないと明記するか
9. 配布ブランチを守る手段のうち、ファイルの外の手段(Environment・ルールセット)は利用者の操作を要する。本リポジトリでの設定を受入条件に含めるか、文書で「止まらない経路」を開示するに留めるか
10. 配布ブランチ・手動起動の扱いを標準側に置くか(7-E / 7-F)。置くなら、Environment の自動作成(w1)とプランの制限(w3)を開示に含めるか

## 5. 確認できなかったこと

- `npm run check` の所要時間(CI・手元とも測っていない)
- Environments の一覧(本リポジトリの `github-pages` 以外の有無、保護規則)。`gh api .../environments` がこの環境のプロキシで拒否された
- ルールセットで `dist/standard` の更新を制限した場合に、`GITHUB_TOKEN`(github-actions)をバイパスの対象にできるか、どう指定するか。GitHub Docs を読んでいない
- w1 の段落のうち「保護規則も秘密情報も持たない」「設定は管理者だけ」は、WebFetch の要約経由で逐語を得ていない(逐語は自動作成の 1 文だけ)
- サブモジュールの指すコミットがブランチの削除で到達できなくなったとき、`git submodule update` が GitHub から取得できるか
- aistandardshub.org の URL の現在の状態(この環境のプロキシが接続を拒否した)
- `check-scope.mjs`・`check-section-refs.mjs`・`check-evidence.mjs`・`check-tone.mjs` が template を読まないことは `existsSync` の検索の範囲で確かめただけで、全文は読んでいない
- `graphify-update.yml` の `[skip ci]` のコミットが、作業ツリーの `ci.yml`(push の契機)を実際に起動しないことは、GitHub の仕様として読んだだけで、実行の記録は見ていない
