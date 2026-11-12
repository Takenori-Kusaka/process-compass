# #320 事実の査読(fact)

- 役: publishing-hub の事実の査読。執筆したセッションとは別の文脈。原稿は編集していない
- 作業ツリー: `E:\Github\orca\workspace\publishing-hub-320`(ブランチ fix/320-overview-wording、下書き 3448a34)
- 指示書: `scripts/review/prompts/fact-review.md`。記録(`articles/pit-in-process-overview.review.yaml`)へは書き込まない。指示書の書式の YAML の断片をここに置く。取りまとめ役が `scripts/review/assemble.mjs` で写す
- 照合した標準の正本: process-compass b2 の作業ツリーの現在の本文(`src/content/docs/`)。第5章 5.4.5・5.4.6(`phase4-process-design/human-ai-boundary.md`)、第1章 1.4(`phase4-process-design/overview.md`)、`phase2-aidlc/summary.md`、ADR-0059・ADR-0066・ADR-0081・ADR-0088、第8章(`tailoring-guide.md`)

## 1. 正本 articles/pit-in-process-overview.md

```yaml
premortem: |
  (1) 置き換えた行「手戻り率が、組織の定めた基準を超えた」が、記事のどこでも定義されていない量を持ち込む。同じ表の差し戻し率と理解保持者には括弧の説明があるのに、手戻り率には無い。前回の読者役が「自動承認の比率」に出した「定義が無い」の指摘が、別の語へ移っただけになる。
  (2) #320 の2か所だけを直し、同じ表の残りの行が、前回の査読の後に変わった標準(ADR-0081 と 5.4.6 の改訂)とずれたまま残る。とくに「1名になった」は、標準が採らないと明記した書き方である。
  (3) 「組織上独立した検証」は、標準の 1.4 で3つの軸(指揮系統・資源・リリースの権限)による狭い定義を持つ語になった(ADR-0088)。記事は定義を書かないので、一般の「独立した検証」の言い換えとして読まれる。
fact_review:
  claims:
    - id: C01
      quote: "| 手戻り率が、組織の定めた基準を超えた | 1段階引き下げる |"
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: "| 手戻り率(タスクの単位で数え、行の帰属に依らない。算出の例は[運用メトリクス](/process-compass/phase6-operation/metrics/)を参照)が基準を超えた | 組織が定めた値 | 該当範囲を1段階引き下げる |"
      severity: 任意
      reason: 検知の状態・値の出どころ(組織が定める)・措置(1段階)は 5.4.6 の3行目と一致する。ADR-0081 決定2 が、この行の措置を「検討する」から自動の1段階の引き下げに改めた。ADR-0059 の決定(承認の比率を検知条件に置かない)とも合う。並びは標準の3行目だが、記事では1行目にある。表の中で順番の意味を述べていないので、事実の食い違いではない。定義が無い点は F02 に書く。
      rule: AGENTS-2.3-2
    - id: C02
      quote: 標準の調査は、組織上独立した検証を制度化してきた日本の品質保証文化には、むしろ追い風になりうるとみています
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase2-aidlc/summary.md
      source_quote: "**組織上独立した検証を制度化してきた日本の品質保証文化には、むしろ追い風になりうる**"
      severity: 任意
      reason: フェーズ2 のまとめの44行目と逐語で一致する(標準側は be2565c で「独立した第三者レビュー」から改めた)。ADR-0066 決定5 の「同じ組織の別部門(品質保証部門など)による検証は、「組織上独立した検証」と呼びます」に従う。出どころは標準本文ではなく調査のまとめであり、主語を「標準の調査は」にして区別している。定義の範囲については F03 に書く。
      rule: AGENTS-2.3-11
    - id: C03
      quote: "| AI が起因の重大事象が発生した | 1段階引き下げる |"
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: "| AI が起因となった Sev1 または Sev2 が発生した | 1件 | 該当範囲を1段階引き下げる |"
      severity: 任意
      reason: 「重大事象」は Sev1・Sev2 の要約。標準は出荷の後の事象に限ると定めるが、概要の粒度では落としてよい範囲と判断した。
      rule: AGENTS-2.3-2
    - id: C04
      quote: "| 差し戻し率が0%のまま推移した | 形骸化の疑いとして引き下げる |"
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: "| 独立レビューの差し戻し率が0%のまま推移した | 2か月継続 | 形骸化の疑いとして引き下げる |"
      severity: 任意
      reason: ""
      rule: AGENTS-2.3-2
    - id: C05
      quote: "| コア機能の理解保持者(他者へ問い合わせずに判断できる人)が1名になった | 該当機能を L1 へ引き下げる |"
      status: contradicts
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: "| コア機能の理解保持者数が1名以下になった | — | 該当機能を L1 へ引き下げる |"
      severity: 止める
      reason: 標準は「4行目の「1名以下」は…2名から0名へ一度で減った場合も発火させるため、「1名になった」の書き方を採りません。」と明記している。記事の書き方は、標準が採らないとした書き方そのもので、0名へ一度で減った場合を外して読ませる。前回の査読(2026-10-12)の時点では標準も「1名になった」だったので、そのときは食い違いではなかった。#320 の範囲の外だが、同じ表の行であり、置き換えた C01 の行と並んで読まれる。詳細は F01。
      rule: AGENTS-2.3-2
    - id: C06
      quote: 引き下げは判定を待ちません。検知した時点で自動に発火します。
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: 引き下げは判定を待たず、検知した時点で自動的に発火します。
      severity: 任意
      reason: ""
      rule: AGENTS-2.3-2
    - id: C07
      quote: 計測の基盤を持たない組織では、引き下げは発火しません。
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: 上表の検知は、いずれも常時の計測を前提とします。計測の基盤を持たない組織では、引き下げは発火しません。
      severity: 任意
      reason: 手戻り率は標準の第2区分(継続的な集計を要する)に入る。記事のこの文が、置き換えた行にも掛かる。
      rule: AGENTS-2.3-2
    - id: C08
      quote: 連続運用期間、差し戻し率(独立レビューで差し戻された変更の割合)、変更失敗率などの条件をすべて満たしたときに申請し、判定を受けます。
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/human-ai-boundary.md
      source_quote: "| 1 | 現在のレベルでの連続運用期間 | 3か月以上 |"
      severity: 任意
      reason: 5.4.5 の表の条件1〜3 と一致する。登録した変更種別では登録の判定が引き上げの判定を兼ね、根拠を連続運用期間に置かない。この例外は概要では落としてよい範囲と判断した。
      rule: AGENTS-2.3-2
    - id: C09
      quote: どの組み合わせでも外せない項目を、標準本文は9つ定めています。
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/phase4-process-design/tailoring-guide.md
      source_quote: どの組み合わせでも、次の9つは調整で外してはなりません
      severity: 任意
      reason: 前回の査読の後も数は9のまま。
      rule: AGENTS-2.3-2
    - id: C10
      quote: 稟議・決裁権限規程と、QA 部門が出荷判定を行う体制は変えません。
      status: supported
      source: https://github.com/Takenori-Kusaka/process-compass/blob/main/src/content/docs/adr/0066-shipping-approver-separation-and-development-line.md
      source_quote: 同じ組織の別部門(品質保証部門など)による検証は、「組織上独立した検証」と呼びます。
      severity: 任意
      reason: 直した文の直後の文。直した文が品質保証部門の検証を「組織上独立した検証」と呼ぶことと、この文の QA 部門の出荷判定は整合する。旧い文の「第三者レビュー」は、ADR-0066 決定5 と 1.4 では別の法人の者に限る語であり、同じ社内の QA 部門と並べると食い違っていた。この改訂で食い違いが解けた。
      rule: AGENTS-2.3-2
  findings:
    - id: F01
      quote: "| コア機能の理解保持者(他者へ問い合わせずに判断できる人)が1名になった | 該当機能を L1 へ引き下げる |"
      severity: 止める
      reason: C05 のとおり。標準の現在の行は「1名以下になった」で、「1名になった」を採らない理由まで本文に書いている。記事は #320 で同じ表の1行を標準の現在の行へ寄せたのに、この行は旧い標準の文言のまま残る。直すなら「1名以下になった」。#320 の範囲の外として扱うなら、process-compass の #320 か後継の Issue に、未対応として明記する。
      rule: AGENTS-2.3-2
    - id: F02
      quote: "| 手戻り率が、組織の定めた基準を超えた | 1段階引き下げる |"
      severity: 直す
      reason: 記事の中で「手戻り率」の定義が無い。同じ節では、差し戻し率に「(独立レビューで差し戻された変更の割合)」、理解保持者に「(他者へ問い合わせずに判断できる人)」と説明を付けている。手戻り率だけが説明なしになる。前回の読者役は、旧い行の「自動承認の比率」に「定義がない」と指摘した。今回の置き換えでも、同じ種類の指摘が手戻り率へ移るだけになる。標準の定義は「タスクの単位で数え、行の帰属に依らない」で、分子は「実装計画の状態を「やり直し」としたタスク」。標準は、第4章の「AI 生成行の短期書き換え率」と同じ名で呼ばないと定めている(ADR-0079)。説明が無いと、読者は行の書き換えの比率と読みうる。括弧で「(AI が実装したタスクのうち、やり直しになったものの割合)」の程度の説明を足すのがよい。この説明は 5.4.6 の分子の定義と ADR-0079 の「分子と分母は、AI が実装したタスクという同じ母集団で数えます」に支えられる。もう1点ある。「組織の定めた基準」の「基準」は、記事の第4節では G-5 の判定基準の意味で使っている。ここでは閾値の意味であり、語が揺れる。標準も「基準を超えた」と書くので誤りではない。軽い揺れとして併記する。
      rule: AGENTS-2.3-2
    - id: F03
      quote: 標準の調査は、組織上独立した検証を制度化してきた日本の品質保証文化には、むしろ追い風になりうるとみています
      severity: 任意
      reason: 「組織上独立した検証」は、標準の 1.4 で「作成の部門から指揮系統・資源(予算と人事評価)・リリースの権限の3つで独立した部門による検証」と定義した語になった(ADR-0088 で厳しくした)。記事はこの定義を書かないので、一般の言い回しとして読まれる。主張の出どころ(フェーズ2 のまとめ)が同じ語を使っているので、事実の誤りではない。定義を足すと、概要の Q&A としては重くなる。足さない判断もありうる。
      rule: AGENTS-2.3-2
    - id: F04
      quote: "| 手戻り率が、組織の定めた基準を超えた | 1段階引き下げる |"
      severity: 任意
      reason: 「問題なし」とする前に挙げた候補と、退けた理由。(a) 廃した言い回しの再出現。原稿に「自動承認」「第三者」「重複率」「引き下げを検討する」の語は無い。退けた。(b) 手戻り率の行の措置の語。ADR-0081 決定2 で「検討する」から自動の1段階に改めた。記事の「1段階引き下げる」は現在の措置と一致する。退けた。(c) 計測が降りていないこと。手戻り率は準拠テンプレートに降りていない(IMPL-0291、ADR-0081 の影響)。記事は第10節で準拠テンプレートを案内するが、テンプレートがこの検知を集計するとは書いていない。また、「計測の基盤を持たない組織では、引き下げは発火しません」が掛かる。正本に反する主張は無い。退けた。ただし、読者はテンプレートを使えばこの検知が働くと読みうる。この点は情報として残す。
      rule: ""
  not_checked:
    - 図 fig-ratchet.png・その他の画像の文字(今回の差分は本文の2行だけで、図は変わっていない。前回の査読の F04 の後の図の修正は見ていない)
    - 記事の第1〜6節・第8〜10節の主張のうち、C09 以外の主張を、前回の査読(2026-10-12)の後の標準の改訂と照らし直すこと。前回の記録の claims を前提にした
    - 外部リンク先(GitHub Pages の公開版)と、b2 の作業ツリーの本文との差分。照合は b2 の作業ツリーの本文で行った
    - lint/policies/expressions.json の全項目との照合(「1名になった」「手戻り率」「組織上独立」で該当なしを grep で確かめただけ)
```

`reviewer.fact_session_id`: `fact-zenn-20261112-320`

## 2. 派生物

3件とも本文は 3448a34 で変わっていない。直した2か所(自動承認の比率の行、第三者レビューの文)に当たる主張は、3件のどれにも無い。`grep` で「手戻り」「自動承認」「第三者」「組織上」「追い風」「1名」「理解保持」を探し、該当は無かった。

### 2.1 platforms/note/public/pit-in-process-overview.md

```yaml
fact_review:
  claims:
    - id: C01
      quote: AI の系統を変えても、独立の条件には数えません。独立は、人の単位で決めています。
      status: supported
      source: articles/pit-in-process-overview.md
      source_quote: 標準は、独立を人の単位で定義します。同じモデルを使う限り、エージェントを分けても事前学習の知識という共通の原因が残ります。モデルの系統を変えても、独立の条件には数えません。
      severity: 任意
      reason: 正本の改訂の範囲の外。新しい正本でも支えられる。
      rule: AGENTS-2.3-2
  findings:
    - id: F01
      quote: AI の系統を変えても、独立の条件には数えません。
      severity: 任意
      reason: 記録 platforms/note/public/pit-in-process-overview.review.yaml の canonical の正本の sha256 は d3acef62…(3448a34 の前の版)。正本が変わったので、R2(canonical[].sha256 の一致)で記録が古いと判定される。前回の指摘のうち、正本の改訂で結論が変わるものは無い(直した2か所に当たる主張が note に無いため)。
      rule: R2
  not_checked:
    - note の本文の全文の照合(直した2か所と、引き下げ・独立に関わる文だけを見た)
```

### 2.2 platforms/qiita/public/pit-in-process-overview.md

```yaml
fact_review:
  claims:
    - id: C01
      quote: 標準は、この承認を独立した確認に数えません。出荷判定(G-7)で差し戻します。
      status: supported
      source: articles/pit-in-process-overview.md
      source_quote: そこで2つ目の層として、出荷の証跡を集約するときに、この承認を独立した確認に数えません。出荷判定(G-7)で差し戻します。
      severity: 任意
      reason: 正本の改訂の範囲の外。
      rule: AGENTS-2.3-2
  findings:
    - id: F01
      quote: 標準は、この承認を独立した確認に数えません。
      severity: 任意
      reason: 記録の canonical の正本の sha256 が d3acef62…(旧版)のままで、R2 で古いと判定される。Qiita は自律レベルの引き下げと Q&A の追い風の文を扱っていない。前回の指摘で影響を受けるものは無い。
      rule: R2
  not_checked:
    - Qiita の本文の全文の照合と、テンプレートの実装からの抜粋の逐語性
```

### 2.3 social/posts/pit-in-process-overview.yaml

```yaml
fact_review:
  claims:
    - id: C01
      quote: AI に起因する重大事象の発生などを計測が検知すると、自動に下がります。
      status: supported
      source: articles/pit-in-process-overview.md
      source_quote: "| AI が起因の重大事象が発生した | 1段階引き下げる |"
      severity: 任意
      reason: 「など」は、検知条件の列挙を1つで代表させている。正本の改訂で検知条件の1行が「自動承認の比率」から「手戻り率」に変わった。それでも「など」が指す範囲は、新しい正本の表に含まれる。前回の記録の C(「AI が起因の」の限定を戻す指摘)は、新しい正本でも成り立つ。
      rule: AGENTS-2.3-2
    - id: C02
      quote: 差し戻し率(独立レビューで差し戻された変更の割合)が0%のまま続いたら、順調ではなく形骸化の疑いとして扱います。
      status: supported
      source: articles/pit-in-process-overview.md
      source_quote: "| 差し戻し率が0%のまま推移した | 形骸化の疑いとして引き下げる |"
      severity: 任意
      reason: ""
      rule: AGENTS-2.3-2
  findings:
    - id: F01
      quote: AI に起因する重大事象の発生などを計測が検知すると、自動に下がります。
      severity: 任意
      reason: 記録の canonical の正本の sha256 が d3acef62…(旧版)のままで、R2 で古いと判定される。前回の指摘は「AI が起因の」の限定についてで、正本の改訂で結論は変わらない。
      rule: R2
  not_checked:
    - 投稿の画像の alt と、正本の図の対応(図は変わっていない)
    - 媒体ごとの文字数と social.json の検査
```

## 3. 判定のまとめ

| 原稿 | 止める | 直す | 任意(情報) | 上位の指摘 |
| --- | --- | --- | --- | --- |
| 正本(Zenn 概要) | 1 | 1 | 2(F03・F04) | F01 理解保持者の行が「1名になった」のまま(標準は「1名以下」で、「1名になった」を採らないと明記)。F02 手戻り率が記事で未定義 |
| note | 0 | 0 | 1 | 記録の正本の sha256 が旧版(R2) |
| Qiita | 0 | 0 | 1 | 同上 |
| SNS | 0 | 0 | 1 | 同上。主張は新しい正本でも支えられる |

直した2か所は、どちらも標準の現在の本文に支えられる。手戻り率の行は 5.4.6 の3行目(ADR-0059・ADR-0081)、追い風の文は phase2-aidlc/summary.md の逐語(ADR-0066 決定5)に当たる。旧い文の「第三者レビュー」は、直後の「QA 部門」と食い違っていた。この改訂でその食い違いは解けた。
