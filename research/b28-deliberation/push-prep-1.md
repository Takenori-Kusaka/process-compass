# B28 push の準備(1回目。担当の記録)

## 載せ直し
- 退避: 本体に tag b28-pre-rebase(rebase 前の c6b714ec)。
- template: submodule を初期化。取得元に d455cb2 が無いため bundle template-b26b-06 から ブランチ b28 を作成。origin/main は 31e783a のまま(fetch で確認)で、載せ直しは不要。先頭 d455cb2(未 push 6コミット)。
- 本体: origin/main(6329c888。graphify の自動更新だけ)へ 18コミットを rebase。衝突なし。graphify-out・台帳の衝突は起きず、再生成もしていない。

## 番号
- origin/main の最大: EV-0344・IMPL-1032・SRC-0768。ADR は新設なし。
- このブランチの新設: IMPL-1033・IMPL-1034(main の最大 1032 の次で連続)。衝突・欠番なし。付け直しは無い。

## template:kb
- 差は生成元の版の自己参照だけ(48e7ffd9 → 996868e4)。push-prep の前回の記載のとおり、コミット済みの 48e7ffd9 は HEAD の祖先で test:criteria が通るため、コミットせず差は破棄した。template の先頭は d455cb2 のまま。

## 流した検査(Windows 側・npm ci 後。回帰の全量は流していない)
lint:refs・lint:sources・lint:evidence(324件、期限到来 0)・lint:impl(降りていない scheduled の表示のみ)・lint:scope・test:criteria・test:fields・test:impl(56)・test:plan-issues(22)・test:ci-wiring(38): すべて通過。
impl:issues: 26件(番号 7件)、すべて open の Issue。

## bundle
- template: template-b28-01.bundle(origin/main..b28)
- 本体: main-b28-01.bundle(origin/main..HEAD。この記録のコミットの前)

## 状態
作業ツリーは本体・template とも空。push 可(template を先に、続けて本体)。
