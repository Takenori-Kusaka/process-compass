# #470 実装 T2(template 2 本目: 決め事の範囲と規定 B)

IMPL-1080 の試験の所在: `template/scripts/gate/test-loosening-decider.mjs`
IMPL-1081 の試験の所在: `template/scripts/gate/test-check-pr.mjs`
IMPL-1082 の試験の所在: `template/scripts/gate/test-direct-commit-rules.mjs`(いずれも目印 `IMPL-NNNN:ng` / `:ok` を別の行に置いた)

## template のコミット(枝 d5-470)

- afd0ae7 仕事 1: 決め事を先に人へ上げる範囲
- 259b705 仕事 1 の修正: 常駐の核から、照合が除くバッククォートを除いた(WSL の `test-init-g5` で CR-122 が照合に合わず発覚)
- 921962d 仕事 2: 規定 B

退避: `E:/Github/process-compass/tmp/470/template-d5-470.bundle`(コミットのたびに更新。`origin/main..d5-470`)。

## 仕事 1(afd0ae7)

- `CLAUDE.md`: 規定 A の 2 行の直後に 2 行(裁定 6.1 の文案どおり)
- `scripts/gate/claude-md-resident.json`: CR-122・CR-123 を追加(核は 1 行全文。impl-T1 の方式)
- `.claude/skills/implement/SKILL.md` 手順3: 規定 A の段落の直後(手順4 の前)に 1 段落(6.2)
- `.claude/skills/task-breakdown/SKILL.md` 手順2 の末尾に 1 文(6.3。入れた)

## 仕事 2(921962d)

- `scripts/init/generate-profile.mjs`
  - 受け付ける鍵の一覧と、保持する鍵の一覧へ `choiceReviewExclusions` を追加
  - 形の検証(`decisionRules` の直後。id 重複・paths 非空配列・kinds 列挙・why。**未知の鍵は規則の中も外も拒否**)
  - 緩める向きの差分(`decisionRules` の差分の直後。向きは逆: 置く・パスを足す・kinds の絞りを外す/広げる=緩める。削る・パスを外す・絞る=強める)
- `scripts/gate/check-pr.mjs`: 区分の下限の節で `choiceReviewExclusions` の変更に下限 R2、製品のコードとの同時変更を失敗(`decisionRules` と同じ形。ヘッダのコメントに 7d)
- `scripts/gate/aggregate-evidence.mjs`
  - `parseNameStatus`・`choiceReviewOf`(`g6ScopeOf` の直後)。規則は変更の親の版の構成から読み、`decisionRuleHits` を使い回す
  - PR(`choiceReview`)と PR を経ないコミット(`d.choiceReview`)に当たりを持たせ、`tailoring` へ 1 行(保証の開示の項目2)。規則が無い構成では何も出さない。合否・欠落には数えない
  - 規則と製品のコードの同時変更の照合に `choiceReviewExclusions` を追加(PR を経ないコミット)
- `.claude/skills/gate/gates/G-6.md`: 手順 14 を追加(外れるのは選択の記録を読むことだけ。基準1〜6・基準5・人へ戻す3つ・判断記録と G-3 は外れない。CL1 以上・規制業・R1 には当たらない)
- `.claude/skills/process-change/kinds/settings.md`: 鍵の行を追加
- generate-profile・config.mjs・process.config.json に既定は置いていない(config.mjs は変更なし)

## 足した試験の場面

- `scripts/gate/test-loosening-decider.mjs`(IMPL-1080): 未知の鍵(規則の中・外)の拒否 / 形の違う規則の拒否 / 置く変化点が記名なしで拒否・ありで受け付け / ほかの変化点で失わない / パスを足すのは拒否 / 種類を絞るのは記名なしで可 / 絞りを外すのは拒否 / 削るのは記名なしで可
- `scripts/gate/test-check-pr.mjs`(IMPL-1081): 規則を置く PR の下限 R2 / R2 の記載なら規則だけの変更は通る / 規則と製品のコードの同時変更は失敗 / 規則に触れない PR は下限を上げない
- `scripts/gate/test-direct-commit-rules.mjs`(IMPL-1082): 外した件数と範囲の件数 / R1(記載)の除外 / 区分の下限の規則で R1 に当たる変更の除外 / CL1 で当てていない / 規制業で当てていない / 規則なしで何も出ない / 品質レポートに載る / 欠落に数えない / 同時変更の欠落

## 流した試験(WSL・node 26。template を写しへ複製)

- test-direct-commit-rules: 20 件一致
- test-loosening-decider: すべて通過
- test-check-pr: 342 場面一致(目印の追加後も)
- check-process-rules / test-claude-md-resident / test-template-copy / test-context-refs / test-deferred-review(164)/ test-adoption(123): 通過
- test-init-g5: 208 件一致(259b705 の後)

## 裁定から変えた点

- 集約の「範囲の変更の件数」は、出荷の範囲の PR(記録だけの PR を除く)と PR を経ない製品のコミットの総数。R1 の件数は「規則のパスに触れた R1 の変更」(全 R1 ではない)。R1 の判定は、記載の区分が R1、または親の版の区分の下限の規則が R1。確定した区分は記載の区分で代用した(確定者の有無は見ていない)
- CL1 以上・規制業の判定は、親の版か HEAD の構成のどちらかが該当すれば「当てていない」。集約全体にそのとき 1 行(件数なし)
- kinds の空配列は拒否(`decisionRules` は受け付けて全種別扱い)
- 未知の鍵の拒否は `decisionRules` より厳しい(新しい鍵だけ)
- G-6.md の追記は新しい手順 14(末尾)。既存の番号を動かさないため

## 降ろせなかった経路

- 初期化の対話(process-init)は規則を書かない。規則は変化点 `/process-change`(種別 settings)の鍵と `generate-profile.mjs --change` だけ。`/process-change` の SKILL 本文・`process-init` には文を足していない(settings.md の表だけ)
- PR 様式(PULL_REQUEST_TEMPLATE)には何も足していない(裁定どおり)

## 議長へ

- 既存の場面は書き換えていない。追加だけ
- 集約の件数の分母の定義(上)と、確定した区分の代用は裁定にない定め。本体の文言と合わせる必要がある
- Windows の Git Bash の heredoc で `\\` が壊れる事故が 2 回あった(NUL 混入を修復済み。aggregate-evidence に NUL は残っていない)
