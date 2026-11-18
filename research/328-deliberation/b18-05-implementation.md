# #328 残り「外殻・内殻」: 実装の記録(束 B18)

- 適用元: b18-04-ruling.md の 3 の「変える行の確定一覧」(案 D')
- 実施日: 2026-11-18

## 適用した行

- 1、3〜24 は裁定どおりに適用した。前の文言が一意に当たることを確かめてから置き換えた
- 25(template の tailoring-kb.json)は手で直さず、`npm run template:kb` で再生成した
- 22〜24 の ADR の案内は、ステータス段落の後に空行を挟んで足した

## 適用できなかった行

- 2(lifecycle.md の図の代替文に「(マクロライフサイクル)」を添える)
  - 理由: 添えると代替文の一文が 160 文字になり、textlint の sentence-length(上限 150)が落ちる。添える前は 150 文字以内で通っていた
  - 試したこと: 句点で文を分ける、括弧を先頭の文へ移す、いずれも長さが変わらないか、助詞の重複(no-doubled-joshi)で落ちた。textlint の無効化コメントは `.textlintrc.json` にフィルタが無く効かない
  - 現状: 代替文は元のまま。図のラベルの読み方は 1(2.2 の本文の1文)だけが担う
  - 次の手: 代替文を短くする(例: 内側の説明を縮める)か、ルールの上限を見直すかの判断が要る。議長の裁定に委ねる

## 流した検査と結果

- `npm run template:kb`: 再生成した(55925 バイト)
- `npm run test:template`: 複製と一致
- `npm run test:engine`: 全シナリオ合格
- `npm run lint:text`: 違反なし(修正後)。途中で出た ADR-0118 の案内の「一つ」を「1つ」に直した
- `npm run lint:refs`: 合格
- `npm run lint:provisions`: 違反なし
- `npm run test:provisions`: 101/101 合格
- `npm run lint:scope`: 合格
- `npm run lint:impl`: 終了コード 0(降りていない IMPL-1019 などの既存の表示のみ)
- `npm run test:fields`: 合格
- 全量の `npm run check` は流していない(指示による。push の前に1回が要る)

## 残る「外殻」の確認

- src・scripts・template の grep で残るのは、裁定 3.6 の変えない行(lifecycle.md:27 の subgraph id、lifecycle.md の凡例の文、adr/0019・0078・0118 の本文、issue-index.tsv)と、22〜24 の案内、lifecycle.md の代替文(2 を適用していないため)

## コミット

- template(ブランチ b18-328): 3bb41f8。bundle は E:/Github/process-compass/tmp/bundles/template-b18-328-01.bundle。push していない
- 本体: b705d342(submodule の参照の更新を含む)
