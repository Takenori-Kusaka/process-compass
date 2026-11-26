あなたは process-compass の Issue を処理する作業役です。指揮役は Orca の coordinator(このタスクの発行元)です。
CLAUDE.md のコアポリシーと「担当(サブエージェント)の回し方」に従って処理します。
- 本スレッドは議長と取りまとめに徹する。段(受付と調査/会議体/実装/突合 2巡まで/直し/push の準備)ごとに、新しい担当を立てる
- 担当への指示の頭に、次の一文を書く: 「最後に1回だけ報告する。報告は5行以内。詳細は research/<番号>-deliberation/ に書く」
- 模型: 機械的な作業と実装は sonnet、議長の裁定の案と独立の突合は opus を明示する(担当の模型は opus か sonnet を明示する(Fable を使わない))
- 回帰の全量は push の前に1回だけ流す。条件は WSL・node 26・LF の写しで、通常と TZ=UTC の2通り。Windows の CRLF による偽の FAIL(test-g5-aggregate)は判定に使わない
- 1件を閉じるたびに node .claude/tools/token-usage.cjs で担当の記録を計測し、research/token-usage-2026-11.md へ1行を追記する
- 所有者にしか決められない点は、自分で決めずに orca orchestration ask で指揮役へ上げ、回答を待つ間は束の中の他の件を進める
- 責任者・承認者の欄へ AI の名義を書かない。人が書く欄を埋めない。Dependabot の PR に触れない
- push にフラグを付けない。main へ直接 push する(作業ツリーのブランチを origin/main へ載せて push)。テンプレートは pit-in-template の main へ push して submodule を進める
- CI の緑を確かめてから Issue を閉じ、閉じるコメントに変更の所在を書く
- 作業ツリーは消されることがある。コミットしていない成果を残さない。段が終わるたびにコミットする
- 束が終わったら、worker_done で1回だけ報告する。報告は5行以内で、番号ごとの結果・コミット・run・閉じたか・残った点
- 文脈が大きくなったら、そこで止め、残りを worker_done で報告して終える
- research/sweep-2026-11-12-triage.md は指揮役が書く。作業役は書き換えない(このファイルは main の作業ツリーにだけあり、未コミット。所在は E:/Github/process-compass/research/sweep-2026-11-12-triage.md)

- コミットのメッセージと PR の本文に、閉じない Issue の番号を close・fix・resolve の語と並べて書かない(#440 が自動で閉じた)
- 一時の worktree を消す前に、node_modules のリンク(junction)を外す(リンク先の中身が消える事故があった)
- 所有者の方針(2026-11-16): 準拠テンプレートは標準を体現し、連動させる(このテンプレートで始めれば準拠する)。ただし細かい定義を増やしてプロセスの柔軟性を失わない。受付と裁定で次の3つを問う。(1) 条文に書くのは満たすべき結果と残る証跡までで、手順は手引きへ回す (2) 珍しい構成や抜け道は、新しい条項を足さずに第7章の例外承認で受けられないか (3) 破られたとき誰が何を失うか。安全・取り消せない操作・適合の主張の信頼に響くものだけを細かく書く。テンプレートへの降ろし方は、機械の検査(決定可能な条件だけ)・様式の欄・手引きから選ぶ。採らないと決めた点は明記する
- 後継の Issue は既存の open の Issue へ寄せる。新規の起票は、寄せ先が無く実行で確かめた欠陥だけ
- 作業ツリーが消えていて、前の作業役のブランチを基点にしている。template の未 push のコミットは E:/Github/process-compass/tmp/bundles/ の bundle から取り込む

束 B33(template を触る。B31 の続き。基点は Takenori-Kusaka/b31): #445 の残り。
- B31 は Fable の上限で止まった。本体はブランチ Takenori-Kusaka/b31(b48e0dc3)、template は主リポジトリの template の submodule のブランチ wip/b31(5145d6b、origin/main より1先行。中身は U6・U7 の作業途中で、指揮役が上限の後にコミットした。未突合)。作業ツリーの template へ git fetch E:/Github/process-compass/template wip/b31 で取り込む
- 裁定は research/b31-deliberation/ruling-1.md(U6a〜c・U7・U8)。どこまで済んだかは同じフォルダの記録と、wip/b31 の差分で確かめる。作業途中のコミットは突合を経ていないので、実装の段から見直す
- 所有者の回答は research/sweep-2026-11-12-triage.md(E:/Github/process-compass/ の作業ツリー)§4 の 32・37・39・43・44
- もう1つの template の束 B32 が並行して動く(#356・#348・#441・#450。aggregate-evidence.mjs・config.mjs・check-pr.mjs)。B33 の U6c(aggregate-evidence.mjs)と U8(test-check-pr.mjs)は、B32 の push を指揮役が知らせてから。それ以外のファイルの一覧を着手の前に status で送る
- template の main への push と本体の push は、間を空けずに対で行う
- Issue を閉じる前に impl:issues が0件で、受け入れ条件を満たしていることを確かめる
番号: ADR は 0243・0245〜0249 を使う。EV・IMPL・SRC は push の直前に origin/main の最大の次へ付け直す。
回帰の全量を2つの写しで並行に流さない。回帰の全量を流す前に status で知らせ、指揮役の返事を待つ。文脈が大きくなったら、push を済ませてから区切って worker_done で報告する。
