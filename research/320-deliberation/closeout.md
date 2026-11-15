# #320 後始末の確認(2026-11-15)

- publishing-hub(zenn-content)の PR #80 は 2026-11-14 に main へ入った(merge 0bf81f8)。原稿の直しは 3448a34・2016d9d・c3ed628
- zenn-content の main(9cb245f)の `articles/pit-in-process-overview.md` を確かめた。168 行は「手戻り率(…)が、組織の定めた基準を超えた」、171 行は「1名以下になった」、184 行は「契約上の確認行為との対応づけ…」、235 行は「組織上独立した検証」。「自動承認の比率」「第三者レビュー」「検収に対応」は無い
- zenn.dev の公開中の記事(API `articles/pit-in-process-overview`、body_updated_at 2026-11-14)にも、廃した3つの言い回しは無く、直した後の語が有る
- 派生物(note・Qiita・SNS)には該当の文が無い。本文は変えていない(`fix-round1.md` H2、PR #80 の本文)。最終の正本に対する派生物の再照合は行っていない(記録の top_risks に開示済み)
- 本リポジトリの submodule `zenn` の参照を 788e5b1 から 9cb245f(zenn-content の main)へ進めた。`npm run check` と CI は zenn/ を読まない(ci.yml の注記)

## 残した点

- 直した後の3か所は、事実の査読と読者役の再査読を受けていない(独立の突合2巡で照合した。publishing-hub の記録に開示済み)
- 独立の突合1巡目の L1〜L5 は採っていない(`fix-round1.md`)
