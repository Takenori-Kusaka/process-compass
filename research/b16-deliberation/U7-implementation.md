# U7 実装記録(常駐の指示と README)

template コミット 4468ec6(b16 の先頭 9634671 の上)。bundle: tmp/bundles/template-b16-U7.bundle。

| 件 | 降ろし先 | 内容 | マーク |
| --- | --- | --- | --- |
| IMPL-0835 | CLAUDE.md(判断の確定と委任) | 「AI の確認を通過したことを理由に人の確認の件数も範囲も減らさない。合否の条件に入れない」。G-6.md 手順11 は U1 で書いた分 | undelivered → delivered(target=gate-skill-g6) |
| IMPL-0974 | CLAUDE.md(同上) | 承認レビューの本文もその草案も AI の担い手が書かない。書き手の確認は採用者の内部監査の抜き取り | delivered(target を claude-md-resident へ) |
| IMPL-0975 | CLAUDE.md(受信箱とラベル) | ラベルが付いていても判定者は事実を自ら確かめる | delivered |
| IMPL-0598 | CLAUDE.md(同上の節) | 判断3・6(リスク区分の確定不能は協働、コア機能の理解の確認、安全の最終判断)と出荷判定者の停止権の範囲の2行 | delivered(target を config-delegation から変更) |
| IMPL-0593 | CLAUDE.md | 本番反映の承認は人の記名(不変条件2) | delivered(target を claude-md から変更) |
| IMPL-0646 | CLAUDE.md | 並行する実行主体ごとに作業ツリーを分ける | delivered |
| IMPL-0711 | CLAUDE.md(IMPL-0404 の行の直後) | 正解の草案を作る AI へ評価対象の出力を渡さない、等 | delivered |
| IMPL-0749 | CLAUDE.md | 軸C 高のコア機能の設計判断を AI 単独で行わない | delivered |
| IMPL-0907 | CLAUDE.md | 同じセッション・作業領域・認証情報の確認を数えない | delivered |
| IMPL-0918 | CLAUDE.md(一律で委譲できない領域) | AI が安全機能そのものを実現する場合は附属書Fの対象外 | delivered |
| IMPL-0971 | CLAUDE.md | 見積りの精度を根拠に確約範囲の上限を上げない | delivered |
| IMPL-0708 | 対象外(担当の指示に無い。mark は U6 で delivered にした(U6 の記録)) | - | 変更なし |
| C-4 | CLAUDE.md 受信箱の節の指示資産の行(CR-053) | 「追加・統合・削除」を「変更(追加・改修・統合・削除)」へ。json の CR-053 の核も同じコミットで更新 | - |
| C-14 | 変更なし | pickup の行(判定記録が無ければ判定者へ差し戻す)が既にある。handoff.md の遷移の行は CLAUDE.md の外(別の単位) | - |
| C-1 | 該当なし | README に「未達として保証の開示へ記録する」は無い(既に揃っている) | IMPL-0986 は adopter のまま |
| C-17 | 対象外 | 手続1・2 の写しは template に無い。adoption-trial.md に該当の手続の写しは無く、標準側の手引きを指す | IMPL-0195・0190 は adopter のまま |
| C-18 | README(委任の節の表の直後) | 強制は start を呼んだ単位だけで、既登録の種別は書き足す旨 | IMPL-0834 は B15 の側で undelivered のまま |
| C-19 | process-change/kinds/mode.md(委任の節) | 4点目(強制の手段の所在)を書く例を1行。様式に欄は置かない | IMPL-0983 は変更なし |

claude-md-resident.json は `--write-resident` で 12 件(CR-108〜CR-119)追加。CR-053 の核は手で新しい文へ置換(重複の CR-120 は除いた)。生成の区間は触れていない。

検査: test-claude-md-resident 通過、test-init-g5 164 件一致、check-process-rules 119 件、test-context-refs 通過、lint:impl・lint:refs・test:plan-issues・lint:skills 通過。

突合で見てほしい点: (1) C-18 の templates/05-handover.md には書かなかった(話題が理解保持者で、start の強制と無関係)。(2) 0598 の「機械で判定できないリスク区分」の行は既存の「委任の範囲に当たるかを自分で判定しない」と近い。(3) 0974 の行は既存の「承認・レビューをしない」行と一部重なる(本文と草案、書き手の確認の所在を足した)。(4) 0711 は 3.12.3 要求事項13 の語を使ったが、条文の原文との字句の照合は未実施。
