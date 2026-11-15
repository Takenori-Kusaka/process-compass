# B5 束の push 準備の記録(2026-11-15)

- 載せた先の origin/main: 回帰の後に再度 fetch して、進んでいない(HEAD..origin/main = 0)
- push の対象: ブランチ Takenori-Kusaka/b5(#353 の本文・ADR-0134、#324 の実装マークの棚卸し・ADR-0140)。push はしていない
- template の参照: origin/main と同じ 1e12ad2(`git submodule update --init template`。template の中は変えていない)

## 載せ直し

- `git rebase origin/main`(本ブランチ 46 コミット)。衝突は次のとおり
  - `src/content/docs/community/implementation-ledger.md`(台帳): origin/main の側を採り、後で再生成した
  - `research/token-usage-2026-11.md`(束 B3 の消費の行): 両方の行を残した。束 B3 の行は旧版と数え直しの2行が並んだので、旧版(担当の内訳が Sonnet 16・Opus 12)を消し、数え直し(Sonnet 14・Opus 14)を残した
- 分からない衝突は無し

## 番号の対応表

- EV: 本ブランチの EV-0266〜0270 が、origin/main の #355 束3 の EV-0266〜0269 と重なった。本ブランチの新設を付け直した

| 旧 | 新 | 場所 |
|---|---|---|
| EV-0266 | EV-0270 | phase4 overview(併記の定め) |
| EV-0267 | EV-0271 | exception-escalation(失効の定め) |
| EV-0268 | EV-0272 | assurance-case(H.9) |
| EV-0269 | EV-0273 | implementation-marking(未登録の手引き 9 枚) |
| EV-0270 | EV-0274 | implementation-marking(区分の確かめ方) |

- 置換は、本ブランチが追加した行(origin/main との差分の `+` 行)に限った。origin/main の EV-0266〜0269 の言及は変えていない。49 箇所(本文・ADR-0134・ADR-0140・impl-inventory.yaml・research/353-deliberation・research/324-deliberation)
- 注意: research/324-deliberation/closing.md の「作業ツリーの言及の最大は EV-0269、次の EV-0270」は、当時の番号の記述が機械的に EV-0273・0274 に置き換わっている。付け直しの経緯はこの記録が正
- IMPL: 重ならない。origin/main の最大は IMPL-0524(台帳)。本ブランチは IMPL-0533〜0980(0677 は欠番)のまま。research/333-deliberation/push-prep.md に「IMPL-0533〜0572」の言及があるが、これは本ブランチの予定の記述で、使用の事実ではない
- ADR: 重ならない(origin/main は ADR-0136 まで。本ブランチは 0134・0140)
- SRC: 新設なし(origin/main は SRC-0747)

## 直したもの

- `src/data/impl-inventory.yaml`: 3.13.5(宣言と実態のずれの検出)の登録に、origin/main の #355 束3 が足した IMPL-0524 を加えた(登録簿の節の中のマークが挙がっていない、という lint:impl の指摘)
- 台帳の再生成: evidence:write・impl:write・scope:write

## template の参照が進んだことによる lint:impl への影響

- 降ろし先の実在・delivered/undelivered の食い違いは出なかった(lint:impl 合格)。上記 IMPL-0524 の登録漏れだけ

## 検査

- Windows: lint:ci・evidence・impl・scope・refs・provisions・sources・citations、impl:issues が合格(lint:text は WSL の check で確認)
- 回帰(WSL・node v26.13.1・`git -c core.autocrlf=false archive` の LF の写し。template は archive を展開して git init した写し):
  - `npm ci` 0
  - `npm run check` 通常 0
  - `TZ=UTC npm run check` 0
- 初回は template を git の管理外で展開し、test-template-suite が「git リポジトリでない」で落ちた(写しの作り方の問題で、コードは無関係)。template を git init して再実行し、通過した
- 偽の FAIL(CRLF・時計): 出なかった。CRLF の検出は PNG のみ
- 写しは消した

## 直さなかったもの

- なし(`impl:issues` も合格。b3 で出た issue=334 の付け替えは b5 の 3814302 / 04a73d4 で済んでいる)

## push できる状態か

- できる。template を先に push(1e12ad2 は origin/main と同じ参照のため不要の場合は省略)し、本体を push する前に fetch して origin/main が進んでいないことを確かめる
