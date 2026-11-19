# #326 項目9 b・c ほかの実機の確認(2026-11-19)

## 手順

- 所有者の許し(2026-11-19)のもと、private の一時リポジトリ `Takenori-Kusaka/pit-in-trial-b26-tmp` を作り、確認の後に削除した。secrets は登録していない。リポジトリの変数 FAILJOB だけを使った(同リポジトリ内。削除とともに消えた)。作業は scratchpad の clone だけで行い、本体と template/ は変えていない
- **A** は縮約版の gate-g5.yml で観測した。構造(ジョブ名・`needs`・`if`・`if: always()` の集約)は template の gate-g5.yml と同じで、各ジョブの中身だけを `sh check.sh <ジョブ名> <FAILJOB>`(名前が FAILJOB と一致すれば exit 1)に置き換えた。理由: 実物の `contract`・`pr-rules` は名簿・記録用ブランチ・多数の試験を要し、集約の式の観測と無関係な失敗が混ざるため。式の意味(skipped・failure・success の扱い)は GitHub が与える `needs.*.result` で決まるので、縮約でも観測の対象は同じである。**実物の全ジョブでの通しは行っていない**
- 同じ `needs` を持つ集約を2つ並べた: `gate-g5`(現行の手順の本文そのまま)と `gate-g5-cand`(候補)。1回の run で現行と候補を同時に観測した
- **B・C** は template の実物(`gate-entry.yml`・`flow-observation.yml` とスクリプト一式)を、ブランチ `tpl`(のち既定ブランチ)に載せて流した。ほかの workflow は消した。変更は PREVIOUS_BRIEF の環境変数の付与、浅い取得の対照ジョブ g1-shallow の追加、`--now` の付与(下記)だけ

## 候補の式(gate-g5-cand の手順の全文)

```yaml
  gate-g5-cand:
    name: gate-g5-cand
    runs-on: ubuntu-latest
    needs: [config, contract, test, static-analysis, spec-lint, context-format, ip-clearance, secret-scan, pr-rules]
    if: always()
    steps:
      - name: 全検査の結果を突合する
        env:
          CONFIGURED: ${{ needs.config.outputs.configured }}
          EVENT: ${{ github.event_name }}
          R_CONTRACT: ${{ needs.contract.result }}
          R_TEST: ${{ needs.test.result }}
          R_STATIC: ${{ needs.static-analysis.result }}
          R_SPEC: ${{ needs.spec-lint.result }}
          R_CTX: ${{ needs.context-format.result }}
          R_IP: ${{ needs.ip-clearance.result }}
          R_SECRET: ${{ needs.secret-scan.result }}
          R_PR: ${{ needs.pr-rules.result }}
          ANY_BAD: ${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}
        run: |
          echo "configured: $CONFIGURED event: $EVENT"
          echo "contract=$R_CONTRACT test=$R_TEST static-analysis=$R_STATIC spec-lint=$R_SPEC context-format=$R_CTX ip-clearance=$R_IP secret-scan=$R_SECRET pr-rules=$R_PR"
          if [ "$ANY_BAD" = "true" ]; then
            echo "::error::G-5 は通過していません"
            exit 1
          fi
          if [ "$CONFIGURED" != "true" ]; then
            echo "::warning::プロセス構成が未設定のため、検査を実施していません。/process-init を実行してください"
            exit 0
          fi
          bad=0
          for pair in "contract:$R_CONTRACT" "test:$R_TEST" "static-analysis:$R_STATIC" "spec-lint:$R_SPEC" "context-format:$R_CTX" "ip-clearance:$R_IP" "secret-scan:$R_SECRET" "pr-rules:$R_PR"; do
            job="${pair%%:*}"; res="${pair#*:}"
            [ "$res" = "success" ] && continue
            # pr-rules は PR のときだけ走る。PR 以外の契機の skipped は正当
            if [ "$job" = "pr-rules" ] && [ "$EVENT" != "pull_request" ] && [ "$res" = "skipped" ]; then continue; fi
            echo "::error::構成が設定済みなのに、検査 $job の結果が $res です(success でない)"
            bad=1
          done
          if [ "$bad" = "1" ]; then exit 1; fi
          echo "::notice::G-5 通過"
```

要点: 現行の「failure・cancelled があれば失敗」「未設定なら警告で通す」を先に残し、そのあとに、設定済みのときだけ「contract・test・static-analysis・spec-lint・context-format・ip-clearance・secret-scan・pr-rules が success」を求める。pr-rules は PR 以外の契機で skipped なら許す。expression の `contains(...)` は env へ出して、シェルへ式を展開しない。実装時は、ジョブの一覧を `g5-aggregate.mjs` の `G5_CRITERION_JOBS`・`G5_RULE_JOBS` から導く(値の一致を `aggregateFindings` で確かめる)ことになる。`config` は基準を実装しないので対象に入れていない(失敗は ANY_BAD が受ける)。

## A の観測

| # | 場面(PR / 契機) | run | ジョブの結果 | gate-g5(現行) | gate-g5-cand(候補) |
| --- | --- | --- | --- | --- | --- |
| 1 | 何も壊さない(PR #1) | 44526010588 | 全ジョブ success | success | success |
| 2 | test の `if: false`(PR #2) | 44526170644 | test=skipped、他 success | **success(欠陥の再現)** | failure |
| 3 | static-analysis の `if: github.event_name == 'never'`(PR #3) | 44526542849 | static-analysis=skipped、他 success | **success(欠陥の再現)** | failure |
| 4 | secret-scan を失敗させる(PR #4。FAILJOB=secret-scan) | 44526652464 | secret-scan=failure、他 success | failure | failure |
| 5 | 構成が未設定(`configured: false`。PR #5) | 44526888129 | config=success、test・static-analysis・ip-clearance・secret-scan・pr-rules=skipped、spec-lint・context-format・contract=success | success(警告) | success(警告)。現行と同じ扱い |
| 6 | 既定でない `pushtest` への push(契機 push) | 44526890423 | pr-rules=skipped、他 success | success | success。pr-rules の skipped で落ちない |
| 7 | 4 の失敗したジョブだけの再実行(変数 FAILJOB を none にして `gh run rerun --failed`。attempt 2) | 44526652464 | secret-scan=success へ | success | success。集約は新しい結果を見た |

7 の補足: 再実行では失敗したジョブとその依存(両方の集約)だけが再度走り、集約は secret-scan の新しい結果(success)で再評価された。skipped のジョブは再実行の対象外で、結果は前回のまま持ち越される(2 のような skipped の run を再実行しても skipped のまま)。この点は未観測(下記)。

結論:

- **欠陥は実機で再現した**: 基準を実装するジョブが skipped でも、現行の集約は success になる(2・3)。項目9 b・c の指摘は事実である
- **候補の式は、正当な実行(1・5・6・7)を落とさず、skipped の基準(2・3)を落とす**。failure は現行と同じく失敗(4)。未設定と push の扱いも保たれた
- 限界(実装時に note へ書く): 同じ PR が集約の定義も書き換えられる。`if: false` を足す PR が候補の式も消せば通る。守るのはうっかり(式の誤り)で、悪意は `.github/workflows/**` の変更の承認(ADR-0115)が受ける

## B gate-entry.yml(PR #6・#7。run 44527193830・44527208229)

- 条件: template の g1-check ジョブ(`fetch-depth: 0`)と、対照として同じ手順で取得を浅くした g1-shallow(両者に PREVIOUS_BRIEF=`origin/tpl:docs/project-brief.md` を与えた。実物の workflow はこの環境変数を与えない。採用者が与える作法)
- 前案件と同一の欄: **g1-check は `前案件の企画書(origin/tpl:docs/project-brief.md)と同一です` の警告を、同一の4欄(対応する戦略目標・対応が成立しなくなる条件・現在の代替手段・その代替手段が使われ続ける条件)に出した**(b-same)。見積りの値を変えた b-diff では、変えた2欄(戦略目標・代替手段)に警告が出ず、同じままの2欄にだけ出た
- g1-shallow(浅い取得)は `PREVIOUS_BRIEF(…)を読めないため、前案件の記述との同一の確認をしていません` の警告になった。**`fetch-depth: 0` が実物で効いている**(履歴の `<ref>:<path>` を読める)
- **指示の前提と異なる点**: 同一は**警告であり失敗ではない**(コードのコメントも「同一を承認可否に使いません」)。実物でも警告で、ジョブの失敗は別の未記入の欄・project_id の不一致・記録用ブランチ records が無いことによる(最小の fixture にしたための失敗で、観測の対象外)
- 立ち上げの順序(IMPL-0884)の「逆」の失敗は観測できなかった。記録用ブランチ records が無く、G-1 の通過の状態が決められない段で失敗が先に出たため(最初の G-1 の fixture に records を足していない)。ここは unit の試験(test-brief-estimates.mjs)だけが根拠

## C IMPL-0283 の契機(flow-observation.yml。run 44527308802 ほか)

- 契機は `schedule` と `workflow_dispatch`。後者で流せた(入力 dry-run、既定 true)。schedule は待てない
- 企画書の「滞留と判定する経過時間: 3日」を既定ブランチから読み、dry-run で `閾値は G-1 で合意した値(3日 = 3 日)。85パーセンタイル: 算定できない(0 件、最小 10 件)`。標本が 0 件でも合意値で動く。通知 0 件(着手から数分で、3 日に満たない)
- 経過時間は作れないため、一時のリポジトリの workflow だけに `--now 2026-11-23T12:00:00Z`(スクリプトの既存の引数。約4日後)を足し、dry-run=false で流した。結果: Issue #8(ラベル state:in-progress)に、記名つきの通知のコメントが **GITHUB_TOKEN で付いた**(`issues: write` の権限で足りた)。本文は「着手(2026-11-19T12:48:23Z)から 4 日が経ち、G-1 で合意した値(…: 3 日)を超えました」。マーカー `<!-- pit-in:flow-observation issue=8 -->` つき
- 注意の出力: 価値責任者のログイン名を解決できない(名簿の席が空)ため、担当者だけを記名する。担当者(assignee)も無いので記名は無い。名簿を整えた実物では未観測
- 未観測: コメントが2回目の実行で重ならないこと(マーカーの照合)。ラベル state:in-progress の付与の履歴による着手の取得は働いたが、PR による着手(cross-referenced)は流していない

## D IMPL-0497(events)

- Issue #8 にラベル state:needs-platform を付けて外した。`gh api repos/{owner}/{repo}/issues/events` は、`labeled`(12:49:33Z)と `unlabeled`(12:49:37Z)の両方を、`label.name` と `issue.number` つきで返した
- template の `needsPlatformNumbers`(adoption-trial.mjs。実物の gh を渡して呼んだ)は `[8]` を返した。外した後でも「付けた履歴のある番号」を読める。IMPL-0497 の前提は実物で成り立った
- 未観測: 100 件を超える events のページング(`--paginate --slurp`)

## 観測できなかった点

- A: 実物の全ジョブ(contract・pr-rules・setup-stack ほか)を載せた通し。縮約版の式の観測であり、実物の gate-g5.yml での各ジョブの skipped の出方(例 pr-rules が config の未設定で skipped になる経路)は 5 で再現した範囲に限る
- A: skipped のジョブを含む run の「失敗したジョブだけの再実行」の挙動
- A: `workflow_call` 経由の push(gate-g5-push.yml)。直接の push で代えた。呼ばれた側の `github.event_name` が push になることは template のコメントが述べ、候補の式はそれに依る
- B: 立ち上げの順序の逆の失敗、records ブランチがある場合
- C: 価値責任者・担当者の記名、通知の重複防止、PR による着手の取得

## 削除の確認

- `gh repo delete Takenori-Kusaka/pit-in-trial-b26-tmp --yes` の後、`gh repo view Takenori-Kusaka/pit-in-trial-b26-tmp` は `Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-b26-tmp'` を返した。削除済み
