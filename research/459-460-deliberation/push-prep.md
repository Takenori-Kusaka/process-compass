# push の準備(束 D2、#456〜#460)

- rebase: 不要。origin/main(4936a404)は HEAD の祖先で、HEAD の上に載せ直す差分がない(`git fetch` 後に確認)
- 番号: origin/main の先端が HEAD の祖先のため、本束の新番(EV-0351〜0358・IMPL-1037〜1052・SRC-0769〜0773・ADR-0264〜0267)は origin/main と重ならない。付け直しなし
- 回帰(WSL ubuntu-24.04・node 26.13.1・`git archive HEAD` の LF の写し・template は submodule の HEAD cfd4ff4 を `template/` へ展開・`npm ci`): `npm run check` を通常と `TZ=UTC` で各1回
  - **両方とも途中で落ちた。通過していない**。落ちた検査は `lint:dekimasu`(`scripts/check-dekimasu.mjs`)。これより前の検査は通過。これより後(test:dekimasu 以降の `lint:skills` 〜 `test:regress`・`build`)は、鎖が止まるため今回は未実行
  - 最初の失敗(2通りとも同じ。Windows の作業ツリーでも `node scripts/check-dekimasu.mjs` が exit 1 で再現する):
    ```
    文末の「できます/できる」の登録簿の検査: 1 件の問題
      - phase4-process-design/proposal-template.md:22: 文末の「できます/できる」が登録簿にありません。「得ずに試行を始めることもできます」。…
    ```
  - 原因の見立て: `src/content/docs/phase4-process-design/proposal-template.md` の22行目の「…得ずに試行を始めることもできます。」が `src/data/dekimasu-registry.yaml` に未登録(または許容でない文末)。直近の本束のコミット(13b42c6a など)でこの頁へ入った文と読める。直していない。議長の裁定を待つ
  - 補足: この WSL では `node -e "process.exit(1)"` の終了コードが 0 になる(環境の癖)。このため WSL の終了コードは使えず、落ちたかどうかはログの内容で判定した(ログは WSL の `~/d2w-normal.log`・`~/d2w-utc.log`)。Windows 側の `node scripts/check-dekimasu.mjs` は exit 1
- `npm run impl:issues`: issue= を持つ実装マーク 28件(番号 5件)。計画の Issue はすべて open。#456〜#460 の降りていない(state=undelivered)件数は 15 件。内訳は #457 が 3、#458 が 1、#460 が 11、#456・#459 は 0
- 先頭: 本ファイルのコミット(下の git log を参照)。その直前は fbc8b953

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

## 回帰の再実行(HEAD 26816cfd。fetch 後も origin/main は HEAD の祖先)

- 条件は前回と同じ(WSL ubuntu-24.04・node 26.13.1・git archive HEAD の LF の写し・template は submodule の HEAD cfd4ff4・npm ci)。通常と TZ=UTC で各1回
- **両方とも途中で落ちた。通過していない**。ログの末尾が build ではなく lint:dekimasu の失敗で、build まで進んでいない。落ちた検査は前回と同じ lint:dekimasu
- 最初の失敗(2通りとも同じ。ログは各 338 行):
  ```
  文末の「できます/できる」の登録簿の検査: 1 件の問題
    - phase4-process-design/proposal-template.md:22: 文末の「できます/できる」が登録簿にありません。「得ずに試行を始めることもできます」。許容なら「〜し…
  ```
- 26816cfd は附属書D の文だけを直し、proposal-template.md:22 には届いていない。直していない。議長の裁定を待つ
- ログは WSL の ~/d2w-normal.log・~/d2w-utc.log(終了コードは当てにならないためログの内容で判定)
