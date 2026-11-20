# B28 push の準備(2回目。担当の記録)

## 1. 2巡目の直し(ruling-fix2.md)
- L2-1: template の `.claude/skills/process-change/kinds/settings.md` の mutation の行を「R1 の変更(PR と push)、案件の条件に当たる構成、R1 かを判定できないとき(手動の実行を含む)に走り、R2・R3 の PR・push では走らせず注意で通る」へ。
- L2-2: IMPL-0930(safety-verification.md)・IMPL-0763(tailoring-guide.md)の note に test-aggregate-wiring・test-init-g5 と段のジョブの結線を足した。
- M2-1 の開示: IMPL-1029(assurance-case.md)の note に、変更の一覧は `changeListBetween` で、check-pr 自身の2か所は同じ作り方の別の実装であり一致を固定する試験は無い(U5 で寄せる)と足した。check-pr.mjs は触っていない。

## 2. 載せ直し
- 退避: 本体・template とも tag `b28-pre-rebase-2`(載せ直しの前)。
- template: origin/main(45a7162)へ rebase。衝突は `README.md` の1か所。
  - **手で混ぜた箇所**: B29 が「### 17」「### 18」を足していたため、本束の「### 17. process-compass #445…」は両方を残して **「### 19」へ付け直した**。節番号を引く文は本体・template の本文には無い(research の旧記録の「README 第17項」は、現在の第19項を指す。記録は書き換えない)。
  - 載せ直しの途中のコミット 1 つ(e02e7ae)は、衝突の目印が残ったまま通った。後続の `fix(docs): 載せ直しで衝突した README の節番号を 19 へ付け直す` で解消している。履歴は潰さない。
- 本体: origin/main(518a1fb9)へ rebase。衝突は台帳(implementation-ledger・evidence-ledger)と template の参照だけ。台帳は origin/main 側を取って再生成、参照は載せ直した後の template の先頭へ。
- graphify-out: `git diff origin/main..HEAD --stat -- graphify-out` は空。
- 触っていない(B29 の側): template の scripts/gate/autonomy.mjs・org-assurance.mjs とその試験、templates/00-d0-governance.md。

## 3. 番号の付け直し
origin/main の最大: IMPL-1035・EV-0345・SRC-0796(本束は SRC を新設していない)。ADR は 0250 まで(0243〜0249 のうち既存は無し)。

| 旧 | 新 | 所在 |
| --- | --- | --- |
| IMPL-1035(R2 の週次) | **IMPL-1036** | assurance-case.md のマーク、ADR-0244 決定8、src/data/impl-inventory.yaml(附属書H の節の ids) |
| EV-0345(増分実行の所要時間と費用) | **EV-0346** | assurance-case.md の暫定マーク、ADR-0244 |
| ADR-0244 | 変えない | origin/main に同番号なし。ADR の一覧は autogenerate で index.md に列挙はない |
| IMPL-1033・1034 | 変えない | push 済み |

- origin/main の IMPL-1035(human-ai-boundary.md。seeded-error)・EV-0345(seeded-error-safety.md)・ADR-0250 は B29 のもので触っていない。
- research/b28-deliberation/ の旧記録(impl-u4a・review-1・review-2・ruling-fix1)にある旧番号は当時の記録として残す。上の表が対応表。
- `npm run template:kb` を再生成し template にコミット。生成元の版の自己参照は、載せ直しで消えた旧 wip の版(21e717c1)から、載せ直し後の祖先のコミット(本体の e226edd9)に変わる。祖先の試験(test:criteria)は通過。

## 4. 検査(Windows 側。回帰の全量は流していない)
- 本体: lint:refs・lint:sources・lint:evidence(326件、期限到来 0)・lint:impl(降りていない表示のみ)・lint:scope・test:criteria・test:fields・test:impl(56)・test:plan-issues(22)・test:ci-wiring(38)通過。impl:issues は 25件(番号 7件)、すべて open。textlint(変えた md)指摘なし。
- template(LF の複製。git を init して実行): test-adapter 140・test-g5-aggregate 61・test-init-g5 188・test-aggregate-wiring 64・test-adoption 123 通過。test-check-pr 270 場面通過。

## 5. bundle
template-b28-09〜11.bundle(origin/main..b28)。本体は main-b28-03.bundle。
