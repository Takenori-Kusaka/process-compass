# #334 push の準備(担当の記録。push はしていない)

## 状態

- 本体: HEAD は origin/main(6bd840f)の子孫。`git fetch` の結果、origin/main に新しいコミットは無かった(rebase は不要)
- template: main = 3d9da56。pit-in-template の origin/main の 4 コミット先。origin/main は進んでいない(rebase は不要)。参照は本体のコミットに入っている(`git diff HEAD --submodule` は改行だけの tailoring-kb.json のみ。コミットしていない)

## 番号の付け直し

- 無し。IMPL-0520 は 1 か所、EV-0260 は 1 か所だけにある。重複(IMPL-0001・0002)は #334 以前からの複数参照で、#334 の変更ではない

## 回帰(WSL・node 26.13.1・LF の写し。`git -c core.autocrlf=false archive` から作成。本体の HEAD と template の 3d9da56)

- 通常: `npm run check` 合格(終了コード 0、FAIL 0、build 360 ページ)
- `TZ=UTC`: `npm run check` 合格(終了コード 0、build 360 ページ)
- 時計依存の偽の FAIL は出なかった

## Windows の node での `npm run check`

- test:template-suite で test-discouraged-evidence と test-g5-aggregate の 2 本が落ちた(以降は未実行)。Windows 作業ツリーが CRLF のためで、#357 の記録にある既知の偽の FAIL(origin/main でも落ちる)。同じ 2 本は LF の写しで合格した。#334 の変更が原因ではない見立て
- Windows の node で通った範囲(lint 群・test:engine・test:template 等)は失敗無し

## 議長が打つ push

template を先に、本体を後に。push の前に両方で `git fetch` し、origin/main が進んでいないことを確かめる。
