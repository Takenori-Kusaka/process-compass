# B28 push の準備(3回目。担当の記録)

## 1. U5 2巡目の直し(ruling-u5-fix2.md)
- M2-1: 開示で閉じた。IMPL-0630 の note(`src/content/docs/phase4-process-design/exception-escalation.md`)と template README の項(下記 22)を「空の書き換えは通過の記録に数えない。既存の通過の記録を複製・改名した新しいファイルは機械が見分けず、新しい記録として数えうる。中身は G-6 の判定者が確かめる(manual)」へ改めた。check-pr.mjs の挙動は変えていない。
- 返された点: note と README に「ステージ移行ゲートの通過と同じ PR にある 7.9.4 の行は、増やす前の枠と旧いステージの累計で数える(集約も同じ行を旧いステージに数える)」を1文足した。
- 低1: test-check-pr.mjs に「基底の企画書に枠の行が無く、同じ PR が枠 1 を初めて置いて 7.9.4 の行を足すときは head の枠で拒む」の場面を足した(基底の企画書を一時的に枠なしにして戻す。main に2コミット増える)。外すと落ちることを確かめた(結果は下記 4)。
- 低2: README の「取り込みで新しく落ちる PR」を、枠を超える 7.9.4 の決裁を含む PR と、新しいステージ移行ゲートの通過の記録なしに枠を増やす PR にした。
- 低3: 見出しの「3d.」を「3(続き).」にした。3b・3c を名指す参照が template の複数の file(aggregate-evidence.mjs・material-attribution.mjs・workflow 等)と本体の台帳にあり、a〜c を付け直すと波及するので、並び(3 → 3(続き) → 3a → 3b → 3c)を保つ編集にとどめた。

## 2. 載せ直し
- 退避: 本体・template とも tag `b28-pre-rebase-3`。
- 基点: 本体 origin/main = 911bca5b、template origin/main = 785998d。
- template: 衝突は README.md だけ(5コミットで再発)。**手で混ぜた箇所**: B29 が項17〜20 を足したため、途中のコミットの README の変更は origin/main 側を取って落とし、最後の1コミット(`docs: 載せ直しで README の更新時の運用ルールを項21・22 へ付け直す`)で本束の2項を足した。**途中のコミットの README には本束の項は無い**(最終の先頭では揃う)。衝突の目印は途中のコミットにも残っていない(`git log -G` で確認)。
- 本体: 衝突は research/token-usage-2026-11.md(両方の行を残した)、implementation-ledger.md(origin/main 側を取り `impl:write` で再生成)、template の参照(載せ直した後の先頭へ)。graphify-out は `git diff origin/main..HEAD --stat -- graphify-out` が空。
- 触っていない(B29 のもの): autonomy.mjs・org-assurance.mjs とその試験、00-d0-governance.md、generate-profile.mjs、test-loosening-decider.mjs、input.md、delegation-eligible.json。`git diff origin/main..b28` に現れない。

## 3. 番号
origin/main の最大: IMPL-1035・EV-0345・ADR-0250・SRC は本束で新設なし。本束が新設した IMPL-1036・EV-0346・ADR-0244 は origin/main に存在せず、**付け直しなし**。ADR の一覧は autogenerate で、adr/index.md に個別の ADR の列挙は無い(0244 も 0250 も載っていない)。

| 変更 | 内容 |
| --- | --- |
| README の項 | 本束の2項を 19・20 から **21・22** へ(B29 が 17〜20 を足した)。本体・template・research の本文に「README 第N項」を引く文は無い(research の旧記録の「第17項」「第19項」「第20項」は当時の番号)。現在の対応: IMPL-1029 ほか(R1 の段 mutation)= 項21、IMPL-0630 ほか(7.9.5 の枠)= 項22 |

`npm run template:kb` を再生成し、template にコミットした。生成元の版の自己参照は e226edd9 から b9ff0f41(載せ直し後の祖先)に変わった。

## 4. 検査(Windows 側。回帰の全量は流していない)
- 本体: lint:refs・lint:sources・lint:evidence・lint:impl・lint:scope・test:criteria・test:fields・test:impl・test:plan-issues・test:ci-wiring は exit 0。impl:issues は 22件(番号 7件)、すべて open。textlint(template/README.md・exception-escalation.md)指摘なし。
- template(LF の複製。git を init してコミット。複製の中に出力を置くと test-adoption が落ちるので外へ置く): test-adapter 140・test-g5-aggregate 61・test-init-g5・test-aggregate-wiring 全65・test-aggregate-records 223・test-exception-expiry 91/91・test-adoption 123 通過。test-check-pr は載せ直し前の先頭で 288 場面通過(新しい場面を含む)。載せ直し後の先頭(LF の複製)でも 288 場面通過、NG 0。
- 低1の陰性の確認: `quotaOfBrief(briefAtBase) !== null ? briefAtBase : (briefAtHead ?? '')` を `briefAtBase ?? ''` にした複製では test-check-pr が 1 件だけ落ちた(新しい場面。他は通る)ので、場面は外すと落ちる。

## 5. bundle
template-b28-14.bundle(載せ直し前・直しのコミット後)、template-b28-15・16.bundle(載せ直し後)。本体は main-b28-04.bundle。
