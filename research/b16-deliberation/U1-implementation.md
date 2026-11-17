# 束 B16 U1(ゲートの手引き)の実装の記録

template のコミット: `10c86af`(bundle: `tmp/bundles/template-b16-U1.bundle`)。触れたファイルは `.claude/skills/gate/` の SKILL.md、gates/G-1・G-2・G-5・G-6・G-7・G-8・SG.md、reference/exception-paths.md だけ。

| 項目 | 降ろし先 | 内容 | マーク |
| --- | --- | --- | --- |
| IMPL-0534 | SKILL.md 判定の原則 項4 | 前提が崩れていても判定を停止せず、可視化して受容の決裁を求める | delivered |
| IMPL-0536 | SKILL.md 項7 | 工程ゲートは単独判定。非同期のコメント期間、判定会議は開かない | delivered |
| IMPL-0832 | SKILL.md 項8 | 判定当日の議題は未解決論点と高リスク事項に限る。target を committee-agenda から gate-skill へ変更 | delivered |
| IMPL-0745 | G-1.md 材料 項5 | PoC から MVP の切替で省略ゲートの復帰とコア指定のやり直しを照らす | delivered |
| IMPL-0740 | G-1.md 材料 項6 | 未達の宣言の3点(理由・代償措置・調達先)、調達先は未記入のまま表示、代償措置は解消に数えない | 変えない(03-debt-ledger の分は U2。U2 の後に delivered) |
| IMPL-0943 | G-2.md 基準1 | 異常系の基準か、異常条件が見つからない事実の記載の有無(当否は判定しない) | delivered |
| IMPL-0547 | G-5.md 落ちたとき 項9 | 秘匿情報の手順1〜3 | delivered |
| IMPL-0549 | G-5.md「判定者に求めないこと」、G-7.md 基準8 | 法的評価を判定者に求めない | delivered |
| IMPL-0576 | G-6.md 材料 項8 | 規範と代理指標 | delivered |
| IMPL-0650 | G-6.md 材料 項7 | 注意喚起部はパス1の前に開かない | delivered |
| IMPL-0652 | G-6.md 材料 項10 | 分離した AI の確認を unmet[] の代償措置として記録。解消に数えない | delivered |
| IMPL-0585 | G-6.md 材料 項9 | 帯域不足を理由に省略しない。target を config-delegation から gate-skill-g6 へ変更 | delivered |
| IMPL-0835 | G-6.md 材料 項11 | 通過を理由に人の確認を減らさず、合否条件に入れない。CLAUDE.md の分は U7 | 変えない(U7 の後) |
| IMPL-0974 | G-6.md 材料 項12 | AI は承認レビューの本文・草案を書かない。CLAUDE.md の分は U7 | 変えない(U7 の後) |
| IMPL-0975 | SKILL.md 項9 | ラベルが付いていても判定者は事実を自ら確かめる。CLAUDE.md の分は U7 | 変えない(U7 の後) |
| IMPL-0838 | G-7.md 判定記録 | 軸C 高の出荷判定へ限定的な抜き取り確認。範囲と件数は判定者が決め備考に書く | delivered |
| IMPL-0958 | G-7.md 判定記録 | 契約の類型は是正計画型と開示義務型を基本。比率指標を金銭措置の条件にしない | delivered |
| IMPL-0620 | SG.md 材料 項11 | 二者択一にしない、併置、丙で継続するときの同時変更、要求事項11 の受容を入力にしない | delivered |
| IMPL-0953 | SG.md 材料 項9 | AI が顧客を模した出力を実証に数えない | delivered |
| IMPL-0882 | SG.md 材料 項10 | 部門間移管の完了条件5つ。様式と検査はテンプレートに無い旨を明記。target を context-transfer-record(planned)から gate-skill へ変更 | delivered |
| C-2 | G-8.md「配備との順序」 | ホスティングの承認は成立に数えない、配備は判定記録の後、緊急の修正にも経路が無い | IMPL-0985 は adopter のまま(変えない) |
| C-3 | exception-paths.md | G-8 の配備の統制だけが構成の条件で例外承認の対象。台帳の対象は配備のワークフローの所在と配備先。前半は既に降りていた | IMPL-0603 は delivered のまま |
| C-9 | G-7.md 基準6 | 閾値の記録と、比率を合否に用いていないことの確認 | IMPL-0044 delivered |
| C-10 | G-7.md 基準7 | F.2 の回答と CL から適用を読み、F.7 の6項目を判定 | IMPL-0045 delivered(IMPL-1007 は B15) |
| C-11 | G-7.md 基準8 | ライセンス検査・実施記録4事項・区分「類似検知」。実施していない出荷は例外承認 | IMPL-0046 delivered。IMPL-1009・0548・1008 は変えない |
| C-12 | G-7.md | 変異の一覧の読解を求めない | IMPL-0560 delivered |
| C-16 | exception-paths.md | 期限切れで効力を失う、延長は新しい行、は既に降りていた(該当なし) | IMPL-0575 は delivered のまま |

## 検査

lint:impl・lint:refs・test:plan-issues・test:fields・lint:skills は終了コード 0。template の check-context-refs・test-context-refs・test-guard-write は通過。`impl:write` で台帳を再生成。作業ツリーに node_modules が無いため、検査の間だけ親リポジトリへの junction を張り、終わって外した。

## 突合で見てほしい点

- G-7.md の基準8 の (3) は、技術負債台帳の区分「類似検知」を引く。様式への区分の追加は U2(IMPL-0548)。U2 が入らなければ IMPL-0046 の delivered は先走りになる
- IMPL-0838 の「範囲と件数は判定者が決める」は、標準が件数を定めないことの読み。新しい義務のつもりは無い
- G-6.md 項10 の `unmet[]` の `compensation` は aggregate-evidence.mjs の読みから引いた(様式の欄ではない)
- IMPL-0882 は様式を足さず、判定者が移管記録の所在を判定記録に書く形にした。target を planned から実在の gate-skill へ変えたため、移管記録の置き場(context-transfer-record)は未実装のまま
- SKILL.md 項8 は「会議体の判定、事前レビュー期間を置く判定」と書いた。3.10 の適用範囲(3.10.1)と合うか確認してほしい
