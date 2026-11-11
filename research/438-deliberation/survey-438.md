# #438 調査: Vale の導入の検討(用語・トーンの統制)

- 調査日: 2026-11-11
- 審議の重さ: 軽(本リポジトリの検査の道具の選定。標準の条項ではない)。内部の調査と実行での確認を1本で行った
- 位置づけ: 会議体(起案・反対)の材料。採否はしない。行番号は調査時点のもの
- 実行の場所: スクラッチパッド `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\770ecf3d-4ce9-4896-b267-c7e0a80da58f\scratchpad\p438\`(Vale のバイナリ・試験の設定・prh の試験)。リポジトリは書き換えていない(この文書を除く)

## 0. 要点

1. 用語・トーンの統制は、既に**3つの検査**で機械化されている。`lint:tone`(#108 の成果。4分類 24 語の正規表現)、`lint:provisions`(廃した言い回し 70 句・升の語 7・地の文の語 1・値の語 1 を、公開ドキュメントに加えて規則データと準拠テンプレートの .yaml/.mjs/.json まで探す)、`lint:dekimasu`(文末の「できます」の登録簿)。加えて textlint(preset-ja-technical-writing)が日本語の文法を見る。prh の辞書は無い
2. **#108 は Vale を検討して見送っている**(`research/phase4-standard/108-tone-guardrail.md` §2.2)。理由は「検査経路の二重化」「日本語の語の検出は正規表現になり、Node のスクリプトで足りる」「依存を増やさない」。#438 の本文は、この見送りに触れていない
3. 実行で確かめた結果、**Vale 3.26.0 の Vocab(accept/reject)は、既定のままでは日本語の語を1つも検出しない**。既定の語の型 `(?m)\b(?:%s)\b` の `\b` が、日本語の文字の間に立たないためである(公式文書 WordTemplate が「規則は何にも当たらない」と明記)。`.vale.ini` の `WordTemplate` を変えるか、独自の規則に `nonword: true` を付ければ当たる。そうすると、Vale の検出は**部分文字列の正規表現の照合**になり、`check-tone.mjs` と同じ方式・同じ誤検出になる
4. #438 が挙げる公式用語(外殻・内殻・RACI・不変条件・ピットイン)は、第1章 1.4 の用語の定義(約 98 語)に**1つも無い**。「#108 等で整理された公式用語」の一覧は、存在しない。廃した語の一覧(拒否の側)はあるが、採る語の一覧(受け入れの側)は無い。Vocab の accept は日本語では大文字・小文字の別が無く、効きが小さい
5. 準拠テンプレートは textlint も tone の検査も持たない。どの案でも、**採用者に新しい義務は生じない**。標準の第1章 1.7.4 は `npm run check` の検査を列挙しているので、検査を足す・移すなら 1.7.4 の記述との整合が要る

## 1. 今の用語・トーンの統制(全数)

### 1.1 `npm run check` の段のうち、文言を見るもの

`package.json` の `check` の段から、文言・語彙を見るものを抜いた。

| 段 | 本体 | 見るもの | 範囲 | 実行時間(手元) |
| --- | --- | --- | --- | --- |
| `lint:text` | textlint + `textlint-rule-preset-ja-technical-writing` | 日本語の文法・文の長さ・漢字の連続・読点の数ほか | `src/content/docs/**/*.md(x)`、`README.md` | 約 90 秒 |
| `lint:tone` | `scripts/check-tone.mjs`(105 行) | 内部資料への言及・主観的な強調・断定を避ける口語・未完成の痕跡(4分類、24 語の正規表現) | `src/content/docs/**/*.md(x)`。コードブロックと HTML コメントを除く。行末の `<!-- tone-ok: 理由 -->` で除外 | 約 0.8 秒 |
| `lint:provisions` | `scripts/check-provisions.mjs`(418 行) | 検査1〜13。用語に関わるのは 3(表の升の語)、6(廃した言い回し)、13(廃した言い回しの由来)と、廃した値の語 | 6 は `src/content/docs`・`src/data`・`template` の .md/.mdx/.yaml/.yml/.mjs/.json。`retired-ok: 理由` で除外 | 約 1.3 秒 |
| `lint:dekimasu` / `test:dekimasu` | `scripts/check-dekimasu.mjs`・`scripts/lib/dekimasu.mjs` | 規定の文書の文末の「できます/できる」が、区分つきで登録簿にあるか | 規定の文書 17 頁 | 約 0.8 秒 |
| `lint:skills` | `scripts/check-skill-provisions.mjs` | スキルの文の規定(本件の範囲外。参考) | — | — |

保存時のフック(`.claude/settings.json` → `.claude/hooks/textlint-on-save.mjs`)が、docs 配下の編集のたびに textlint を走らせる。

### 1.2 `.textlintrc.json`

- `preset-ja-technical-writing` だけ。`sentence-length` 150、`max-comma` 5、`max-kanji-continuous-len` 6(許す語 8)、`ja-no-mixed-period` の許す記号、`no-exclamation-question-mark` と `ja-no-weak-phrase` を切る
- **prh の辞書は無い**。`textlint-rule-prh` は依存にも無い(`devDependencies` は `starlight-links-validator`・`textlint`・`textlint-rule-preset-ja-technical-writing`・`yaml` だけ)

### 1.3 #108 の成果の機械化の所在

- `scripts/check-tone.mjs` の `RULES`(4分類)。運用の頁は `src/content/docs/community/style-guide-tone.md`(禁止語の表と、`tone-ok` の注記の規則)。調査メモは `research/phase4-standard/108-tone-guardrail.md`
- `tone-ok` の注記は、2026-11-11 時点で docs 全体に 10 行(うち 4 行は style-guide-tone.md の禁止語の表そのもの)
- #108 の後、語彙の統制は `src/data/provision-forms.yaml` の登録簿へ育っている。廃した言い回しは句・廃した日・廃した決定(ADR)・代わりに書くことの4つ組で登録し、検査13 が「廃した決定の ADR が実在するか」まで確かめる。Vocab の reject.txt は語の列だけで、この4つ組を持たない

### 1.4 公式用語・非公式用語の一覧の所在

| 種類 | 所在 | 機械の検査 |
| --- | --- | --- |
| 採る語(定義) | 第1章 1.4 用語の定義(`phase4-process-design/overview.md:92` 以降、約 98 語) | 無い。表記ゆれ(異表記)の一覧も無い |
| 名称 | ADR-0027(通称「ピットイン方式(PIT-IN)」、正式名称、「統合プロセス」を使わない) | 無い。「統合プロセス」は ADR の3頁(歴史の記録)にしか現れず、今は検査が無くても残っていない |
| 使わない語(トーン) | `check-tone.mjs` の `RULES` | `lint:tone` |
| 廃した言い回し・升の語・値の語 | `provision-forms.yaml` | `lint:provisions` |
| 許容の「できます」 | `dekimasu-registry.yaml` | `lint:dekimasu` |
| 採用者の機能仕様の曖昧語 | 第4章 G-2 基準2 の表(準拠テンプレート `spec-lint.mjs` が降ろす) | 採用者側の検査。本件とは別物 |

#438 が公式用語として挙げる5語を docs で数えた。ピットイン 31 頁、外殻 7 頁、RACI 9 頁、不変条件 6 頁、内殻 1 頁に現れるが、1.4 の用語の定義にはどれも無い。「公式用語の一覧を Vocab へ写す」作業の前に、**一覧そのものを決める作業**が要る。これは道具の選定ではなく、用語の決定である。

## 2. Vale の日本語の扱い

### 2.1 公式の文書(2026-11-11 閲覧)

- Vocab(https://docs.vale.sh/keys/vocabularies): 項目は大文字・小文字を区別する正規表現。`accept.txt` は置換の規則 `Vale.Terms` に入り、`BasedOnStyles` の全規則の例外にもなる。`reject.txt` は存在の規則 `Vale.Avoid` に入る。日本語・CJK への言及は無い
- WordTemplate(https://docs.vale.sh/keys/wordtemplate): 既定は `(?m)\b(?:%s)\b`。語の文字(数字・ラテン文字・下線)の外の文字体系では「語の境界が立たないので、規則は何にも当たらない」。中国語の例を挙げている。`.vale.ini` の大域の設定で、読み込む全スタイルの語の型の規則に掛かる。規則ごとには `nonword: true` か `raw` を使う
- existence(https://docs.vale.sh/checks/existence): `tokens` は `\b` で囲まれる。`nonword: true` で外れる
- 日本語の分かち書き・形態素解析の機能は、文書に見当たらない。#108 の調査(2026-08-05)の「Vale は日本語の形態素解析を前提としない」と一致する

### 2.2 実行での確認

公式の GitHub Releases から `vale_3.26.0_Windows_64-bit.zip`(2026-10-31 公開)を取得し、checksums.txt の SHA-256(`c42f4b41…7d1ec2`)の一致を確かめて、スクラッチパッドで展開した。システムへは入れていない。

**試験1: Vocab を既定のまま**(reject に 音声メモ・めっちゃ・統合プロセス・TODO・仮置き・ピット・イン・`[Pp]itin`、accept に ピットイン方式・PIT-IN・外殻・内殻)

| 期待 | 結果 |
| --- | --- |
| 日本語の reject 5 語(本文に計6回) | **0 件**。1つも当たらない |
| `TODO`(前後が空白) | 当たる |
| `Pitin`・`pitin`(英文) | 当たる |

**試験2: `.vale.ini` に `WordTemplate = (?m)(?:%s)`** — 日本語の reject はすべて当たる。ただし大域の設定なので、英語の語も部分文字列で当たるようになる(`pitin` が `pitino` の中でも当たる)。英語展開に備えるという目的と衝突する

**試験3: 独自の規則 `PC.Tone`(existence、`nonword: true`)に `check-tone.mjs` の4つの正規表現をそのまま写し、docs の全体(md 204・mdx 1)へ掛けた**

- 検出 16 件。15 件は `style-guide-tone.md` の禁止語の表、1 件は `deliverable-templates.md:704`。**16 件とも `tone-ok` の注記のある行**で、`check-tone.mjs` が除外している行だった。検出の集合は `check-tone.mjs` と同じで、差は除外の仕組みだけ
- 実行時間 約 0.5 秒(`check-tone.mjs` は約 0.8 秒)
- コードブロック・HTML コメントは除外された(`check-tone.mjs` と同じ)。MDX の JSX の中の文も見た(`<Card>` の中の TODO・めっちゃを検出)

**試験4: そのほか**

| 確かめたこと | 結果 |
| --- | --- |
| 行末の `<!-- tone-ok: 理由 -->` | Vale は解さない。除外には `<!-- vale PC.Tone = NO -->` 〜 `<!-- vale PC.Tone = YES -->` の対が要る。**理由の記入を強制できない**(`tone-ok` は理由の無い印を無効とする規約。`style-guide-tone.md:38`) |
| 部分文字列の誤検出 | 「使っ**たぶん**だけ」が `たぶん` に当たる。`check-tone.mjs` も同じ正規表現なので同じく当たる。どちらも語の境界を知らない |
| 表の升の範囲(`scope: table.cell`) | 当たる(升の「省略可」を検出)。`lint:provisions` の検査3 に相当することは書ける |
| 文の範囲(`scope: sentence`) | 「。」で区切られた(133 文字の文を検出し、続く短い文は別の文として扱った)。ただし textlint の `sentence-length` と重なる |
| `Vale.Terms`(accept の大文字・小文字) | 英文の `pit-in`・`Pit-In` に「`PIT-IN` を使う」と出た。日本語の語には大文字・小文字が無く、accept は実質何もしない |
| 組み込みの `Vale` スタイル(`Vale.Spelling`)を docs 全体へ | 128 件。すべて日本語の文の中の英字(`gh` 27、`Hs` 8、`Sev` 4、`textlint`・`SIer` 各3 ほか)。使うなら accept への大量の登録か、Spelling を切ることになる |
| `lint:provisions` の検査6 の範囲(.yaml・.mjs・.json の全文) | Vale はソースコードではコメントだけを見る。規則データと準拠テンプレートの .yaml/.json の値の中の廃した句は、Vale では探せない(未実行。公式文書の Formats の記述による推定) |

### 2.3 比較のための textlint-rule-prh の試験

スクラッチパッドに `textlint@15.8.0`・`textlint-rule-prh@6.1.1` を入れて試した。

- 「統合プロセス → 本標準」「ピット・イン方式 → ピットイン方式」「`/\bpit-?in\b/i` → PIT-IN」がすべて当たり、`--fix` で直せる。日本語と英語を1つの辞書で扱えた
- prh は「期待する表記 ← 誤った表記」の対の書式で、**置き換え先の無い禁止**(めっちゃ・TODO)には向かない。表記ゆれの統一(異表記 → 正表記)の道具である
- 辞書の項目ごとに `specs`(入力と期待の対)を書け、辞書を読み込むときに自己試験する

## 3. 案ごとの比較

| 観点 | A: Vale の導入 | B1: textlint の prh を足す | B2: 既存の lint:tone・provision-forms を強める | C: 手動 | D: Vale を英語のロケールにだけ使う(英語版ができたとき) |
| --- | --- | --- | --- | --- | --- |
| 日本語の検出率 | Vocab の既定では 0。`nonword` の独自規則なら `check-tone.mjs` と同じ(試験3) | 異表記の対は検出できる。置き換え先の無い禁止は不得手 | 今と同じ(正規表現の照合)。対象を足せば上がる | すり抜ける(#108 の起票の経緯) | 日本語は対象外 |
| 誤検出 | `check-tone.mjs` と同じ(部分文字列)。組み込みスタイルを使うと英字の綴りで 128 件 | 正規表現の書き方による。`specs` で項目ごとに固定できる | 今と同じ | — | 英語では語の境界が効き、少ない |
| 除外の規律 | `vale off/on` の対。理由を強制できない | textlint のフィルタ(`textlint-filter-rule-comments`)。理由は強制できない | `tone-ok: 理由`・`retired-ok: 理由`。理由の無い印を無効にできる | — | — |
| 登録の情報 | reject.txt は語の列だけ。廃した日・決定・代わりの書き方を持てない | 期待の表記と `specs` | 句・廃した日・廃した決定(ADR の実在を検査13 が確かめる)・代わりに書くこと | — | — |
| 探せる範囲 | 文書。コードはコメントだけ | 文書(textlint の対象) | docs・規則データ・準拠テンプレートの全文(検査6) | — | 英語の文書 |
| 保守 | Go のバイナリ、`.vale.ini`、`styles/`、CI の取得の段が増える。正規表現は YAML へ移るだけ | npm の依存1つと辞書1枚 | 既存のスクリプトと登録簿。新しい依存は無い | 人の注意 | 英語版ができるまで何も増えない |
| CI の時間 | 実行 約 0.5 秒 + バイナリの取得。CI の全体(10〜15 分)に比べて無視できる | textlint の実行(約 90 秒)に含まれる | 約 0.8〜1.3 秒(今と同じ) | 0 | — |
| 英語展開への効き | 英語では強い(既成のスタイル: Google・Microsoft ほか)。ただし今、英語の頁は無い(`astro.config.mjs` は `locales.en` を足せる構造を保つだけ) | 英語の表記ゆれにも効く(試験 2.3) | 英語の禁止語を別に定義する必要がある(#108 調査 §4 が既に予告) | — | 英語版ができた時点で判断できる |
| 二重の検査 | `lint:tone` と重なる。移すなら `lint:tone` を廃し、第1章 1.7.4・style-guide-tone.md の記述を改める | textlint の中に収まる | 無い | — | 日本語とは重ならない |

### 3.1 #438 の主張と、確かめた事実の食い違い

| #438 の主張 | 確かめた事実 |
| --- | --- |
| Vocab の accept/reject で公式用語を宣言的に統制できる | 日本語では既定で効かない(§2.2 試験1)。効かせると、正規表現の照合で `check-tone.mjs` と同じになる |
| #108 等で整理された公式用語・非公式用語を機械ルール化する | 非公式用語の機械ルール化は #108 で済んでいる。公式用語(採る語・異表記)の一覧は無い(§1.4) |
| 多言語展開でも同一基盤で拡張できる | 英語では当たる。日本語は「同一基盤」でも語の境界の扱いが別になる(大域の WordTemplate を変えると英語の境界が壊れる。§2.2 試験2) |
| B(prh)は保守・多言語・PR の注記で Vale に劣る | prh は日英の表記ゆれを1つの辞書で扱え、`specs` の自己試験を持つ(§2.3)。PR の注記はどちらも reviewdog 等で出せる(未実行) |
| 過去に #108 のような大規模一括是正が必要になった | #108 の調査では、違反は1件だけだった(`108-tone-guardrail.md` §1。「主眼は一括置換ではなく再発防止」) |
| #108 の経緯 | #108 は Vale を検討して見送った(§2.2 の3つの理由)。#438 はこの判断に触れていない |

### 3.2 案の外で、会議体に渡す論点

- 今の空白は「採る語・異表記の一覧が無いこと」である。これを埋めるなら、先に用語の決定(1.4 へ載せるか、異表記をどこで正とするか)が要る。道具はその後に選べる
- 異表記の検査を足す場合、置き場の候補は2つある。`provision-forms.yaml` に「異表記 → 正表記」の区画を足す(検査13 と同じく決定の実在を確かめられる)か、prh の辞書を足すか
- `lint:tone` を Vale へ移すと、検出の集合は変わらず、`tone-ok: 理由` の規律(理由の無い除外を認めない)を失う

## 4. 標準(準拠テンプレート)への影響

- 準拠テンプレート(`template/`)は textlint・`check-tone`・Vale のいずれも持たない(`grep` で確認)。本件のどの案も、テンプレートの複製・規則データ(`src/data/tailoring/`)を変えない。**採用者に新しい義務は生じない**
- 本標準の第1章 1.7(記述の原則)の「特定の製品名・組織内の口頭文脈に依存する表現は用いない」は、本標準そのものの書き方の規定で、採用者への要求ではない
- ただし第1章 1.7.4(検査と、その限界)は、`npm run check` が何を検出するかを列挙している。検査を足す・移す・廃するときは、1.7.4 と `community/style-guide-tone.md`・`community/provision-forms.md` の記述を合わせて改める必要がある
- 採用者側の語の検査(第4章 G-2 基準2 の曖昧語、`spec-lint.mjs`)は別の仕組みで、本件と混ぜない
- 審議の重さを「重」へ上げる事由(安全・法令・採用者への新しい義務・ADR の原則の変更)は、調査の範囲では見当たらない。ただし #108 の見送り(Vale を採らない)を覆す場合、それは #108 の調査メモの判断であって ADR ではない(Vale に関する ADR は無い)

## 5. 出典

- Vale Vocabularies: https://docs.vale.sh/keys/vocabularies(2026-11-11 閲覧)
- Vale WordTemplate: https://docs.vale.sh/keys/wordtemplate(同)
- Vale existence: https://docs.vale.sh/checks/existence(同)
- Vale v3.26.0 リリース: https://github.com/errata-ai/vale/releases/tag/v3.26.0(2026-10-31 公開。同日取得)
- textlint-rule-prh 6.1.1(npm。2026-11-11 取得)
- 内部: `research/phase4-standard/108-tone-guardrail.md`、`scripts/check-tone.mjs`、`scripts/check-provisions.mjs`、`src/data/provision-forms.yaml`、`src/content/docs/community/style-guide-tone.md`、`src/content/docs/community/provision-forms.md`、`src/content/docs/phase4-process-design/overview.md`(1.4・1.7・1.7.4)
