# #320 編集の段(publishing-hub の下書きと査読の準備)

作業場所: E:\Github\orca\workspace\publishing-hub-320 (ブランチ fix/320-overview-wording)。push と PR は未実施。

## 直した箇所(articles/pit-in-process-overview.md の2か所)

1. 168行の表「自動承認の比率が急上昇した | 1段階引き下げる」を「手戻り率が、組織の定めた基準を超えた | 1段階引き下げる」へ。正本: 標準 human-ai-boundary.md 5.4.6 の3行目(措置は「該当範囲を1段階引き下げる」)。ADR-0059(決定1)で自動承認の比率を廃し、ADR-0081 で残る比率が差し戻し率・手戻り率になった。行の削除でなく置き換えにしたのは、標準の表が4行を保つため。査読で「手戻り率」の語が記事に足された意味になるかを確かめること(記事に手戻り率の定義は無い)。
2. 235行「独立した第三者レビューを制度化してきた」を「組織上独立した検証を制度化してきた」へ。正本: phase2-aidlc/summary.md 44行が同じ文を「組織上独立した検証」と書く。ADR-0066 決定5で「第三者レビュー」は別の法人で利害を持たない者の検証に限られた。

記事全体の grep: ほかに「第三者」「自動承認」「承認比率の急上昇」は無い。

## 派生物

platforms/note/public、platforms/qiita/public、social/posts の pit-in-process-overview には該当文が無い(grep 済み)。直していない。ただし正本が変わったので、3つの派生物の査読記録は R2(正本が記録の後に変わった)で止まる。派生物の主張の照合のやり直しが要る。docs/records/reviews/ の過去の版にだけ旧文がある(履歴なので直さない)。zenn.dev の公開版の WebFetch は未実施(今回は作業ツリーでの確認まで)。

## check の結果

`npm run check`: review 段だけ失敗(9件)。textlint など他の13段は合格。
- articles/pit-in-process-overview.review.yaml: R2(記録 b2de875、現在 ecfbbd7)、R4 が C11・C12・C18・C67・F04(fixed_in_sha256 が現在と不一致)
- 派生物3件(note・qiita・social): R2(正本が変わった)
正常な停止。査読の記録を取り直すと解ける。

## コミット

3448a34(fix(articles): ...)。push していない。

## 査読の入力(pack の出力)

- 作業場所: E:\Github\orca\workspace\publishing-hub-320\.tmp\review\zenn--pit-in-process-overview\
  - cold.txt(読者役に渡す唯一のファイル)、brief.json、previous.md(直前の版)
- 原稿のハッシュ ecfbbd7f87faac34e477fadeef891204111c70b93269dc43141785e6869df181 / reviewed_commit 3448a34
- 版のスナップショット(未追跡): docs/records/reviews/zenn--pit-in-process-overview/ecfbbd7.json と ecfbbd7.txt。記録と一緒にコミットする
- 指示書: E:\Github\orca\workspace\publishing-hub-320\scripts\review\prompts\fact-review.md(事実の査読)、cold-read.md(読者役)
- 記録の書き先: articles/pit-in-process-overview.review.yaml(別セッションが premortem・fact_review・cold_read を書く。執筆者は書かない)
