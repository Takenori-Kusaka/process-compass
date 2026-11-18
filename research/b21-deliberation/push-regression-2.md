# 束 B21 push 前の回帰の通し直し(2回目)。ファイルは直していない・commit/push していない

## 条件
- WSL・node v26.13.1(PATH 明示)。写し: WSL の ~/b21-regress/(ext4、autocrlf=false の clone を bundle から作成、LF)。
- 本体 95079007ee035a34fe2bff134de03966b95651fd、template 392ff937b1d9ef5d019093f10172cec3ce77f412。どちらも作業ツリー清潔(流す前後とも git status 空)。pit-crew 未初期化。node_modules は前の写しから複写。
- 前の写しは ~/b21-regress-old-90032 に退避。

## コマンドと結果(順に実行、並行なし)
1. `npm run check`(TZ 未設定): exit 0。ログ ~/b21-check-n2.log
2. `TZ=UTC npm run check`: exit 0。ログ ~/b21-check-u2.log
- 両方とも lint:ci 〜 test:template-suite 〜 test:regress 〜 build(393 ページ)まで最後まで通過。
- test:template-suite: 一覧に新規5本が入り各 ok(test-review-queue・test-flow-observation・test-pre-review・test-review-order・test-enforcement-inventory)。"ok" 行は両方とも 286 行。
- test:regress: 落ちた場面 0 のみ(両条件。0 以外の行なし)。
- ログ中の FAIL 類の文字列は、検査名の文言(always()/failure() の条件4)と URL のみ。実際の失敗なし。

## 落ちたもの
なし。前回の唯一の失敗(test:template-suite の結線漏れ5本)は解消。CRLF 由来・時計依存の偽の FAIL も出ていない。切り分け不要。

## 確かめていないこと
push 後の CI、Windows での実行、pit-crew を含む検査。
## 判定
push してよい(WSL・node 26 の条件で、通常・UTC とも check が exit 0)。

この回の後、本体のマークと台帳だけを直した(template は 392ff93 のまま)。直しの後は関係する検査だけを流した。
