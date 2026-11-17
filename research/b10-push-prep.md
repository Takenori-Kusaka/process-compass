# 束 B10 の push の準備の記録(2026-11-17)

## rebase
- 基点: origin/main 5895b377。61 コミットを載せ直した
- 衝突 12 件
  - research/token-usage-2026-11.md 1 件(B9 計測の cherry-pick)。両方の行を残した
  - src/content/docs/community/implementation-ledger.md 11 件。origin/main 側を採り、後で `npm run impl:write` で再生成した

## 番号
- ADR 0151・0153・0154・0155・0156 は origin/main で未使用(origin/main の最大は 0142)。変更なし
- EV: origin/main の最大は EV-0288。このブランチは EV-0289〜0297 で、すでに次から連番。変更なし
- IMPL: origin/main の最大は IMPL-0988。このブランチは IMPL-0989〜0999 で、すでに次から連番。変更なし
- SRC: origin/main の最大は SRC-0749。このブランチは SRC-0790〜0796(間が空いていた)。次の置換表で付け直した

| 旧 | 新 |
|---|---|
| SRC-0790 | SRC-0750 |
| SRC-0791 | SRC-0751 |
| SRC-0792 | SRC-0752 |
| SRC-0793 | SRC-0753 |
| SRC-0794 | SRC-0754 |
| SRC-0795 | SRC-0755 |
| SRC-0796 | SRC-0756 |

- 新旧の範囲が重ならないため、一時の印は不要だった
- ファイル名(research/sources/)と中身の参照(research/327-・440-deliberation、phase4-process-design の 2 ファイル)を置換した
- research/440-deliberation の「SRC-0752〜0796 は仮番号」は、終端を 0756 へ置換した(始端 0752 は審議時の仮の値のまま。実際の新規出典は 0750〜0756)

## 再生成
- `npm run sources:index`(catalog.md と research/282-survey-2026-09/ の索引)・`evidence:write`(変更なし)・`impl:write`・`scope:write`(変更なし)
- `template:kb`: src/data/tailoring/ は origin/main から変更なし。不要

## 検査
- 通過: lint:evidence・lint:refs・lint:scope・lint:sources・lint:provisions・lint:registry・test:provisions・test:registry・test:criteria
- 失敗 1 件: lint:impl。IMPL-0048(origin/main 自身の記述)の試験 `template/scripts/gate/test-assurance-period.mjs` がこの作業ツリーの template/ に無い。作業ツリーの template/ は 1e12ad2 で、origin/main の参照 8839c80 は手元に無い。このブランチの変更が原因ではない。参照どおりの template を取得すれば解消する見込み(未確認)

## 2回目(2026-11-17)

- origin/main の先頭は 9625626d(B8 の IMPL-0989〜0991・EV-0289〜0291 を含む)。62 コミットを rebase した。
- 衝突: 台帳(evidence-ledger.md)は origin/main 側を採って再生成した。本文は deliverable-templates.md の1箇所だけ。origin/main 側は IMPL-0821 の実装マークを `plan=adopter decision=ADR-0139` へ書き換え、B10 側(#440)は同マークを閉じて削除していた。B10 側を採った(IMPL-0821 は ADR-0156 の決定で閉じる)。lint:impl は通過しており、食い違いは出ていない。
- template: `git submodule update template` で b780a76 に合わせた。B10 のコミットでは参照を変えていない。
- 置換表(B10 側の追加行だけを置き換え。origin/main 側の定義は不変)

| 種別 | 旧 | 新 |
|---|---|---|
| EV | EV-0289〜0297 | EV-0292〜0300(+3) |
| IMPL | IMPL-0989〜0999 | IMPL-0992〜1002(+3) |
| ADR | 0151・0153〜0156 | 変更なし(origin/main の最大は 0142) |
| SRC | SRC-0750〜0756 | 変更なし(origin/main の最大は SRC-0749) |

- 上の「1回目」以前の記述にある EV-0289〜0297・IMPL-0989〜0999 は旧番号である。research/327・330・337・440-deliberation/ と impl-inventory.yaml は新番号へ置き換えた。
- 台帳(evidence・implementation・scope)と出典の索引を再生成した。
- 検査(lint:evidence・impl・refs・scope・sources・provisions・registry、test:provisions・registry・criteria、impl:issues)はすべて通過。`npm run check` の全量は流していない。

## 回帰(2回目・2026-11-17、HEAD 2eef0ad2)

- 環境: WSL・node v26.13.1。`git archive` の LF の写し。template は b780a76 を展開して git init。`npm ci` 0。
- `npm run check` 通常 exit 1、`TZ=UTC npm run check` exit 1(同じ箇所で止まる)。
- 失敗: `test:template`(`scripts/check-template-drift.mjs`)。`template/templates/trial-checklist.md` が、標準 `phase4-process-design/tailoring-guide.md` の新しい項目「廃止・置換する既存の承認・様式と、新設する判定の差し引きが負であることを確認した…」を持たず、旧項目「導入後の判定件数が、置換前を上回らないことを確認した」が標準に無い、という乖離。
- 原因(変更の欠陥): #327 が標準の項目を書き換えた(IMPL-1002 は `state=undelivered`)が、template の参照が b780a76 のままで、複製側の trial-checklist.md が追随していない。写しの作り方・時計・CRLF による偽の FAIL ではない。
- 直し方の候補(未実施): template 側で trial-checklist.md を更新して PR にし参照を進める。または、複製の検査が template の参照に依る旨の除外を設ける。どちらを採るかは議長の裁定。
- これより後ろの検査(lint:ci〜test:template より後の連鎖)は実行されていない。直した後に再実行が要る。
- 写しは消した。

## 回帰(3回目・2026-11-17、HEAD 83efe29e)

- 環境: WSL・node v26.13.1。Windows の git で `git archive`(LF)した tar を WSL へ展開(WSL の git は worktree を読めないため)。template は b780a76 を展開して git init。`npm ci` 0。
- `npm run check` 通常 exit 0、`TZ=UTC npm run check` exit 0。失敗なし。2回目で止まった `test:template` の乖離は、#327 の項目を元の文へ戻したコミット(83efe29e)で解消し、その後ろの連鎖も最後まで通った。
- 写しは消した。
