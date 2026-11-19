# 束 B27 — #356 議長の裁定の案(2026-11-20)

担当: 議長の裁定の案。実装はしていない。入力は `10-intake-356.md`(起案)と `20-opponent-356.md`(反対の委員。割れた点 A〜F)。作業ツリーは本体 f26b76ee、template 31e783a。回帰の全量は流していない。条文・ADR・template の実物で確かめた箇所は、各項の「確かめたこと」に書く。

## 0. 結論の要約

| # | 点 | 裁定 |
| --- | --- | --- |
| A | 1011 のマークの閉じ方 | 反対の委員の案を採る。`check=machine` のまま、機械が閉じるのは cause と person の整合と出力から人を外すことだけで、cause の真偽(5.6.3 の区分の判別)は人が判断することを note に書く。同時に当たる事案は2件に分けて記録する(手引き)。旧い記録の数の名は `causeless` とする |
| B | 0191 の保護ブランチの判定 | 反対の委員の案を採る。対象は既定ブランチ宛の PR に限る。判定は**参照の名**で行い(SHA で比べない)、ruleset の include は読まない |
| C | 直接の push の欠けの表示の置き場 | 反対の委員の案を採る。preflight は変えない(B26 の裁定 §3.9 と同じ)。env-check の ruleset の項目の詳細に出し、保証の開示の項目4 には既存の経路で写る。実機で確かめていない前提に暫定 EV を付け、#361 へ寄せる |
| D | 0191 の(i)(iii)の扱い | **マークを分ける**。IMPL-0191 は(ii)取り込みの前の拒否だけにして `delivered check=machine`。(i)標識を欠いた注入をしない・(iii)演習用のブランチで標識の失われる書き換えをしないは、新しいマーク(`plan=adopter`)にして、委ねる理由を ADR-0250(仮番号)に記録する |
| E | PR の失敗の文 | 反対の委員の案を採る。`FALSE_POSITIVE_HINT` を使わない。PR 用の文の定数を `seeded-error-scan.mjs` に別に置く |
| F | 1003 の行の文言 | 反対の委員の案を採る。IMPL-1004 の行の文型に揃え、「数えない。人が確かめる」と当たる条件と帰結(適用の表明まで)を書く。確かめる材料(保証の開示の項目6 の測定した見つける者と、人の名簿)を note と行に書く |

- 重へ上げる点: **なし**。A〜F のどれも、採用者への新しい義務・ADR の原則の変更・安全の変更に当たらない(§1 の各項の「重さ」)
- ADR: **要る(1件、ADR-0250 仮番号)**。D の分割で `plan=adopter` を新設するため(#356 の受け入れ条件1 が ADR の記録を求める)。B・C の決定もあとから変えにくいので同じ ADR に載せる
- 後継: 実機の確認(C の暫定 EV)を #361 へ寄せる。#452(IMPL-0200 の実測)へ寄せるものは無い(§2.5)

## 1. 割れた点ごとの裁定

### A. IMPL-1011 のマークの閉じ方

- **裁定**: `state=delivered check=machine`。note に次の3つを必ず書く
  1. 機械が閉じるのは、(a) 発動の記録に `cause`(`"7.9.1-1"` / `"7.9.1-2"`)があること、(b) 1 なら person が無く、2 なら person が名簿にあること、(c) 集約の出力(変更の行・evidence.json・保証の開示)に対象の人を出さないこと、の3つである
  2. cause の真偽、つまり事案が 7.9.1 の1 と2 のどちらに当たるかは、5.6.3 の区分の判別による人の判断で、機械は確かめない。判別する者は 7.9.6 の表のとおり品質保証の機能である
  3. 1 と2 が同時に当たる事案は、発動を識別子の別な2件に分けて記録する(手引き notice.md)
- **理由**
  - 反対の委員の指摘(cause は自己申告であり、2 の事案を 1 と書けば person の欠けを機械は検出できない)は正しい。起案の採らない案「person の有無から種別を推す」との差は「書き忘れ」と「書き分けの誤り」の差に縮まる。それでも cause を足す方が信頼性で勝つ。書き分けの誤りは、記録した者が区分を明示的に書いた事実として記録に残り、5.6.3 の照合で後から追える。person の有無から推す形では、欠けが記録者の判断だったのかが記録に残らない
  - 「統制の閉じ方を裁定で決める」の物差しでは、値の一致(cause と person の整合)は機械に、区分の判別(自由な事案の意味)は人に置く。check は機械の部分に付け、人の部分は note で開示する。IMPL-0047 の note が「拾えない経路」を開示する形と同じで、表示と実態は食い違わない
  - 区分の判別の正しさは新しい義務でない(7.9.6 の表が既に品質保証の機能を記録する者・判別する者と定める)。新しい確かめる者は置かない
  - 方針の問い(3): 破られたとき失うのは、見逃した個人(個人の記録・表示)。cause の自己申告で破れる穴は、意図的な違反を見逃しと書く方向にだけ開く。その向きの誤りでは person が出力に出ないため、個人の表示の害は増えない。失うのは 5.6.3 の照合の材料で、これは人の手続の側の損失として note に書く
- **cause を単一の値にする**: 反対の委員の案を採る。cause を配列にすると定義が増える。条文は発動の識別子を単位にしている(7.9.6「発動では、識別子・範囲…」)ので、事案ごとに識別子を分ければ足りる。同じ範囲に2件の制限が重なることは、2名の計数(範囲で数える。IMPL-0118)に影響しない
- **旧い記録の数の名**: `causeless` とする。既存の `legacy`(範囲の無い旧い発動)と別の概念であることを、試験の fixture で固定する(§3.2 Y-1 の試験 8・9)
- **出力の経路の確かめ**: 反対の委員の求めた grep を行った。`restrictionState` の利用は `aggregate-evidence.mjs` 2123(範囲の照合)・2232(変更の行)・4248(evidence.json)と `config.mjs` の中だけで、`next.mjs`・`org-assurance.mjs`・`verify-gate-contract.mjs` は restriction の person を読まない。`generate-profile.mjs:1628` は記録(changeLog)へ restriction を写すだけで、出力ではない。記録の欄に person を持つのは 7.9.6 の「照合のためだけに記録する」に合う
- **person の定義の文の改め**: ADR-0161 決定5 の範囲である(決定5 が「7.9.1 の2 による発動だけ対象の人を加える」と決めた)。試験の見出しと config.mjs のコメントに ADR-0161 決定5 を引く
- **採らない案**
  - `check=manual` にする: 決定可能な整合(値の一致・存在)を人に回すことになり、標準と逆の記録(1 の発動に人を書く)を入口で止められない
  - cause を配列にする: 定義が増える。識別子を分ければ足りる
  - 確かめる者として出荷判定者や内部監査を新たに名指す: 新しい義務になる。7.9.6 の表の品質保証の機能で足りる
  - person の有無から種別を推す(起案と同じく採らない): 2 の記録で person が欠けたことを検出できず、記録者の判断も記録に残らない
  - 旧い記録で person を持つものを失敗にする(起案と同じく採らない): 既存の構成を割り、changeLog の改変を誘う
- **重さ**: 軽のまま。記録の欄の追加は 7.9.6 が既に区別を求める項目を決定可能にするだけで、新しい義務でない

### B. IMPL-0191 の保護ブランチの判定

- **裁定**: 標識の検査の対象は、**PR の基底が既定ブランチ(`--policy-base`)と同じ名の参照である PR** に限る。比べるのは参照の名(`origin/` と `refs/remotes/origin/`・`refs/heads/` を外した名)で、SHA で比べない。`--policy-base` を渡さない実行(手元)は検査をせず、notice に「既定ブランチを渡していないため、標識の取り込み前の検査をしていない」を出す
- **理由**
  - 同梱の ruleset で `~DEFAULT_BRANCH` を include するのは checks-only・team・regulated・safety の4つで、records 系は `refs/heads/records`(判定記録の置き場。本番のブランチでない)。include の解釈を check-pr に足すと、records 宛の PR で誤って走る(反対の委員が実物で確かめた)
  - 演習のコミットを本番へ運ぶ PR は、途中に演習用ブランチを挟んでも、最後に既定ブランチ宛の PR になる。`mergeBase..HEADREF` はその PR の全コミットを持つので、既定ブランチ宛に限っても取りこぼしは増えない
  - **SHA で比べない理由(本裁定で足した点)**: 既定ブランチの先端から切ったばかりの演習用ブランチは、既定ブランチと同じ SHA を指す。SHA で比べると、その演習用ブランチ宛の PR を既定ブランチ宛と取り違え、見つける者の面に標識の失敗を出す(秘匿を崩す)。名で比べれば取り違えない
  - `gate-g5.yml:510` と `gate-g5-base.yml:148` は、どちらも `--policy-base "origin/${DEFAULT_BRANCH}"` と `--base "origin/${BASE_REF}"` を渡している(確かめた)。workflow の変更は要らない
  - 宣言(リポジトリの JSON)と実機の適用の食い違い(起案の論点2)は、B では問題にならない。判定に ruleset を読まないため
- **リリースブランチ**: 本番のブランチに数えない(採らないと決めた)。準拠テンプレートは本番のブランチを既定ブランチとして作られており(ship-evidence の経路・ruleset の include)、条文は「本番のブランチ」の定義を置いていない。定義を足すことは細かい定義を増やす。採用者がリリースブランチを持つなら、第7章の例外承認で受けるのでなく、採用者の強制層の変更(check-pr の判定の拡張)として扱う。この旨を ADR-0250 の採らない案に書く
- **採らない案**
  - ruleset の include を読む(起案の案): records 宛で誤って走る。include の glob の解釈を増やす
  - SHA の一致で既定ブランチ宛とみなす: 上記のとおり、切ったばかりの演習用ブランチを取り違える
  - 演習用ブランチ宛も止める(起案と同じく採らない): 秘匿を崩す
  - 手元の実行で `--base` を既定ブランチとみなす: 手元の基底が既定ブランチとは限らない。止めずに「検査をしていない」と出す方が表示と実態が合う
- **重さ**: 軽のまま。止める範囲を既定ブランチ宛へ限るのは、ADR-0161 の表(保護ブランチ宛の PR)を具体化するだけで、緩める向きの原則の変更でない。records 宛は本番の取り込み先でない

### C. 直接の push の欠けの表示の置き場

- **裁定**
  - `preflight.mjs` は変えない(B26 の裁定 `research/b26-deliberation/intake-1.md` §3.9、`ruling-1.md` で採られた)
  - `adoption-trial.mjs env-check` の ruleset の項目(`items.ruleset`)で、効いている規則に `pull_request` が無いとき、**状態を変えずに**詳細の文の末尾へ次を足す。「pull_request の規則が無い: 既定ブランチへの直接の push を禁じていない。標識を含むコミットの取り込み前の拒否(第5章 5.6.2 第2層)は PR の経路だけで働き、直接の push の経路では欠ける。出荷の時点は走査が止める(IMPL-0047)」。G-6 の有効・無効に依らず足す。G-6 が有効で既に「不一致」の場合も、同じ文を不一致の理由の後へ足す
  - 保証の開示へは、既存の経路で写る。`org-assurance.mjs` の `readEnvCheck` の `summary` は、全体が確認済みのとき全項目の `detail` を `(…)` で並べ、`aggregate-evidence.mjs` の項目4「実環境の統制の確認」が `envControls` として写す(1620〜1628 行・4560 行を読んで確かめた)。aggregate-evidence.mjs と org-assurance.mjs は触らない
  - 全体が未確認のときの summary は確認済みでない項目だけを出すため、ruleset の項目が確認済みで他が未確認なら、この文は保証の開示に出ない。そのとき読み手は「未確認」を読み、env-check の記録の節3(`adoption-trial.mjs` 1129 行付近。全項目の詳細を出す)には文が出る。この限りを IMPL-0191 の note に書く
  - 直接の push の経路が実在するか(checks-only で、演習用ブランチ宛の PR で gate-g5・gate-g5-base を通した SHA を、既定ブランチへ直接 push できるか)は、実機で確かめていない。`gate-g5.yml` は `pull_request` を基底の絞りなしで起動する(17〜22 行)ので、演習用ブランチ宛の PR でも必須チェックの check run がその SHA に付く。GitHub の必須チェックは push されるコミットに成功した check run を求めるので、経路は在りうる。ただし実機の挙動は未確認であり、**暫定 EV**(新しい番号)で開示し、#361 で確かめる
- **理由**
  - preflight は手元のファイルだけを読む初期化の点検で、ルールセットはまだ適用されていないのが普通。宣言の JSON を読んで「欠けている」と言い切ると、実機の適用を見ない表示になる
  - **B26 の裁定の前提の誤り(突合で見つけた点)**: B26 intake §2.4 は「env-check が既に `pull_request` の欠けを不一致として出す(1635〜1639 行)」と書いた。実物では `if (g6Active)` の内側だけで(1639 行)、checks-only を使う G-6 無効の構成では何も出さない。**B26 の決定(preflight を変えない)は正しく、前提の事実が欠けていた**。本裁定の adoption-trial の変更で前提を満たす。B26 の記録は書き換えない(本ファイルに記録する)
  - 状態を「不一致」にしない理由: checks-only は構成が `pull_request` を求めない選択であり、構成との不一致でない。不一致にすると env-check の全体が確認済みにならず、構成の選択肢を実質的に奪う
  - 置き場を1か所(env-check の項目)に寄せ、保証の開示はその値を写すだけにする。反対の委員の言う「定義の置き場が3か所に分かれる」を避ける
- **採らない案**
  - preflight に表示を足す(起案の案・B21 の案): 宣言の JSON だけを読み、実機を見ない。B26 の裁定が既に採らないと決めた
  - 直接の push の欠けを失敗または不一致にする(起案と同じく採らない): 構成の選択肢を奪う
  - checks-only の ruleset に承認0名の `pull_request` の規則を足して直接の push を塞ぐ: 1名の体制を含む checks-only の採用者すべてに、変更を PR で入れる運用を課す。採用者への新しい義務であり、本件(軽)で決めない。#361 の実機の確認で経路が実在したとき、重の審議の題として #361 へ申し送る
  - aggregate-evidence.mjs に別の行を足す: env-check の項目の値と二重になり、食い違うたびに突合が要る
- **重さ**: 軽のまま。表示(止めない)であり、新しい義務でない

### D. IMPL-0191 の(i)(iii)の扱い

- **裁定**: マークを分ける
  - IMPL-0191 は「標識を含むコミットの、本番のブランチへの取り込みを、取り込みの前に拒否する」(ii)だけを持ち、Y で `delivered check=machine` にする
  - 新しいマーク IMPL-NNNN(実装の時点の次の空き番号。2026-11-20 の台帳の最大は IMPL-1032)を、同じ箇所(human-ai-boundary.md の IMPL-0191 の直後)に置く。持つのは (i)「標識を欠いた注入をしない(識別子と期限を、コミットとともに履歴に残る形で付ける)」と (iii)「演習用のブランチで、標識の失われる履歴の書き換えをしない」。`state=undelivered check=manual plan=adopter decision=ADR-0250 target=seeded-error-isolation`
  - 委ねる理由と採用者に求めることは ADR-0250(仮番号)に書く。ADR-0161 の「採用者に求めること」の表と同じ形にする
- **理由**
  - (i)(iii)は機械で閉じない。標識を付け忘れた注入は、どの層の走査にも当たらない(フェーズ5 seeded-error-safety.md 50 行「標識のない注入は、以降のどの層でも検出できない」)。演習用ブランチで書き換えて標識を落とした履歴は、PR の検査も出荷の走査も見つけられない。PR のブランチの書き換えで標識を落とせば(ii)の検査を通る(反対の委員の 2.6)
  - 破られたとき失うもの(方針の問い3): 注入した欠陥が本番へ入り、取り消せない。安全と取り消せない操作に響くので、閉じていない部分を台帳に**降りていない規定として表示し続ける**形にする。note の開示だけでは、台帳の state・check の欄が第2層の全体を閉じたように読める
  - 演習の運用(注入する者の操作・演習用ブランチの設定)は採用者が行い、template に運ぶ仕組みが無い。IMPL-0190(第1層)・IMPL-0169 と同じ理由で adopter にする
  - ADR-0161 の表(IMPL-0191 は「降りたら delivered・machine」)と矛盾しない。ADR-0161 は(ii)の機械の止めを降ろすと決めたもので、(i)(iii)の帰属は決めていない。採用済み ADR の本文は書き換えず、新しい ADR-0250 で(i)(iii)の帰属を決める
- **採らない案**
  - note で開示して `check=machine` 1つにする(起案の案・反対の委員の選択肢の1つ): 台帳の state・check の欄が(i)(iii)を閉じたように読める。取り消せない流出に関わる統制で、表示と実態を合わせる方を採る
  - (i)(iii)を IMPL-0190 の note へ足す: 0190 は第1層のマークで、範囲が混ざる。ADR-0161 の表の 0190 の「採用者に求めること」とも合わなくなる
  - (i)を機械で閉じる(注入の記録と標識の突合): 運用中の注入の記録(台帳)はリポジトリの外にあり、出荷の経路に入力が無い(ADR-0161 の採らない案「外の台帳を主の方式にする」と同じ理由)
- **重さ**: 軽のまま。(i)(iii)の義務は 5.6.2 第2層に既にある。adopter は template が降ろさないことの開示で、新しい義務でない。ADR は受け入れ条件1 の記録のために作る

### E. PR の失敗の文

- **裁定**: `FALSE_POSITIVE_HINT` を使わない。`seeded-error-scan.mjs` に `PR_MARKER_HINT` を export で置く(X)。文は次のとおり
  - 「注入したコミットは既定ブランチへ取り込みません(第5章 5.6.2 第2層。第7章の例外承認では受けない)。説明のために語を書いたコミットなら、PR のブランチでその行を本文から外します。注入したコミットの標識は外しません(演習の変更は演習用のブランチで閉じる)」
  - 失敗の文はコミットの短い SHA と標識の名 `Seeded-Error:` だけを出し、本文と識別子(`SE-…`)を出さない
- **理由**: 出荷の走査は、本番の履歴に入った後で直す手段が無いため例外承認を案内する。PR の時点は PR のブランチで文を直せるため、例外承認を案内しない。同じ標識に違う案内を出すのは、直す手段の有無で分かれる正しい差であり、文を分けて揃える。標識の検出の正規表現は `hasMarker` 1か所に残す
- **採らない案**: `FALSE_POSITIVE_HINT` を流用する(例外承認を案内し、裁定と矛盾する)。PR に例外承認の経路を置く(直す手段がある段階で例外を置く理由が無い)
- **重さ**: 軽(文言)

### F. IMPL-1003 の行の文言

- **裁定**: `aggregate-evidence.mjs` の 6735 行(IMPL-1004 の行)の直前か直後に、常に1行出す。文は次のとおり(IMPL-1004 の行の文型に揃える)
  - 「述べられる名が数えない欠陥注入の秘匿の不成立(第1章 1.10.2。IMPL-1003。人が確かめる): 1〜2名の体制で、注入する者と見つける者を分けられない場合に当たる。当たれば、この範囲で述べられるのは適用の表明まで(列挙に無い離脱)。機械は数えない(測定の記録の blind の値によらない。ADR-0147)。確かめる材料は、項目6 の測定した見つける者と人の名簿」
  - 外へ渡す形(`external`)でも同じ文を出す(人の名を含まない)
- **理由**
  - 起案の「適合の主張を述べられない」は、当たるかに関わらず常に出る行で帰結を言い切り、当たらない体制(3名以上)でも誤って読める。条文(overview.md の表の前文)は「これらがある範囲で述べられるのは、適用の表明までです」と条件つきで書く。条件と帰結を両方書けば、条文と一致する
  - 確かめる手段の無い manual にしない(反対の委員の 3)。材料は既にある。保証の開示の項目6 は測定した見つける者を併記する(assurance-case.md 600 行)。注入した者は注入の記録(リポジトリの外。注入した者だけが持つ)にあり、照らすのは出荷判定者の判断である。D-0 に欄を足さない(ADR-0040。起案の採らない案を保つ)
- **論点4(1004 の adopter との不揃い)**: 不揃いは理由の違いによる正しい差である。1004 は確かめる証跡(個別の認証の記録)が template の外にある(ADR-0225 決定8)。1003 は template が表示を出し、材料(項目6 と名簿)が template の出力にある。note にこの差を1文で書く
- **採らない案**: 起案の文(帰結を無条件に言い切る)。「3名以上では行を出さない」(体制の人数の判定を足すと、2名で分けられる体制などの判断を機械が代わる。1004 の行も体制の規模によらず出る)。1003 を adopter にする(起案と同じく採らない)。D-0 に欄を足す(起案と同じく採らない)
- **重さ**: 軽(文言と開示)

## 2. マークごとの最終の形

マークの文は1行で書く(下では読みやすさのため note を引用で示す)。`issue=`・`plan=`・`review=` の扱いは各項に書く。

### 2.1 IMPL-1011(exception-escalation.md:859)— Y で改める

- `target=evidence-aggregation state=delivered check=machine test=template/scripts/gate/test-roster-conditions.mjs`。`plan=`・`issue=356`・`review=` を外す
- note の案:

> 7.9.6 のうち、7.9.1 の1 による発動の記録に見逃した者を含めず、対象の人を 7.9.1 の2 による発動に限ること。準拠テンプレートの制限の記録(種別 notice の event: restriction)は、根拠の区分 cause("7.9.1-1" か "7.9.1-2")を必須にし、1 の発動に対象の人(person)を書けず、2 の発動には人の名簿の person を必須にする(変化点の入口で拒否する。ADR-0161 決定5 が ADR-0127 決定5 の person 必須を置き換えた)。集約の出力(制限に触れた変更の行・evidence.json の制限・保証の開示)には、どの発動でも対象の人を出さない。person は記録の欄に持つだけで、5.6.3 の措置との照合のためだけに使う。機械が確かめるのは cause と person の整合と、出力に人を出さないことだけである。事案が 7.9.1 の1 と2 のどちらに当たるか(cause の真偽)は 5.6.3 の区分の判別による人の判断で、判別する者は 7.9.6 の表のとおり品質保証の機能である(機械は確かめない。意図的な違反を 1 と書けば照合の材料が欠け、機械は検出しない)。1 と2 が同時に当たる事案は、識別子の別な2件に分けて記録する(手引き notice.md)。cause の無い旧い発動は拒否せず、範囲の照合を続け、件数を保証の開示に出す(対象の人は出さない)。集約の2名の計数は範囲で行っており変えない(IMPL-0118)

### 2.2 IMPL-0191(human-ai-boundary.md:921)— X で note を(ii)へ絞り、Y で delivered にする

- X の時点: `state=undelivered check=manual plan=scheduled issue=356 review=2027-03` のまま。note から(i)(iii)を外し、「(i)(iii)は IMPL-NNNN(採用者)」を足す。直接の push の表示の文を「env-check の ruleset の項目が表示する(adoption-trial.mjs)」に改める(B26 §3.9 の申し送りどおり)
- Y の時点: `target=pr-checks state=delivered check=machine test=template/scripts/gate/test-check-pr.mjs`。`plan=`・`issue=356`・`review=` を外す
- Y の note の案:

> 第2層のうち、標識を含むコミットの、本番のブランチへの取り込みを、取り込みの前に拒否すること。準拠テンプレートの PR の検査(check-pr.mjs。gate-g5 と gate-g5-base の両方)は、PR の基底が既定ブランチ(--policy-base)と同じ名の参照のとき、基底との分岐点から PR の先頭までの全コミットの本文に、標識 Seeded-Error: の行(IMPL-0047 と同じ判定の関数)があれば失敗させる。基底の判定は参照の名で行い、SHA で比べない(既定ブランチの先端から切った演習用ブランチを取り違えない)。演習用ブランチなど既定ブランチ以外を基底とする PR は対象にしない(見つける者の面に標識を出さない)。--policy-base を渡さない手元の実行は検査をせず、その旨を出す。失敗の文はコミットの短い SHA だけを出し、本文と識別子を出さず、第7章の例外承認を案内しない(PR のブランチで文を直せるため。出荷の走査が例外承認を受けるのは直す手段が無いため)。本番のブランチは既定ブランチに限り、リリースブランチを数えない(ADR-0250)。PR の検査が拾えないもの: 既定ブランチへの直接の push(ルールセットに pull_request の規則が無い構成で欠ける。env-check の ruleset の項目の詳細が表示し、全体が確認済みのときは保証の開示の項目4 にも写る。経路の実在は実機で確かめていない。EV-NNNN)、PR のブランチの書き換えで標識を落とした履歴、標識を欠いた注入(これらは IMPL-NNNN。採用者)。出荷の時点は IMPL-0047・0192 が止める。標識を見つける者の面から外す方法は手引き(フェーズ5)。秘匿の成り立たない層は未測定(ADR-0161)

### 2.3 IMPL-NNNN(新設。human-ai-boundary.md の IMPL-0191 の直後)— X で足す

- `target=seeded-error-isolation state=undelivered check=manual plan=adopter decision=ADR-0250`。`issue=` を付けない
- note の案:

> 第2層のうち、注入したコミットに機械が読める標識(識別子と期限)をコミットとともに履歴に残る形で付け、標識を欠いた注入をしないこと、演習用のブランチで標識の失われる履歴の書き換えをしないこと。運用中の継続の注入の操作は採用者が行い、準拠テンプレートに運ぶ仕組みが無い。標識を欠いた注入と、書き換えで標識を落とした履歴は、取り込みの前の拒否(IMPL-0191)も出荷の走査(IMPL-0047)も見つけない。採用者に求めること・委ねる理由は ADR-0250。確かめる者: 採用者の品質保証の担当(演習の記録と演習用ブランチの設定を読む。IMPL-0190 と同じ)

### 2.4 IMPL-1003(overview.md:720)— Y で改める

- `target=evidence-aggregation state=delivered check=manual`。`plan=`・`issue=356`・`review=` を外す
- note の案:

> 欠陥注入の時期と箇所の秘匿の不成立(1〜2名の体制で注入する者と見つける者を分けられない)を、述べられる名は数えない。構造の判断であり、測定の記録の blind: false は1回の測定、理由は自由な文のため、機械の検査にしない(ADR-0147)。準拠テンプレートは、構成書の注記(述べられる名が適用の表明でないとき)と、保証の開示の節5 の常に出す1行で、数えない項目として人が確かめる旨と、当たる条件・帰結(適用の表明まで)を出す。確かめる材料は、保証の開示の項目6 の測定した見つける者と人の名簿で、注入した者は注入の記録(リポジトリの外)にある。IMPL-1004 が adopter であるのは確かめる証跡が template の外にあるためで、1003 は材料が template の出力にある点で異なる。確かめる者: 適合の主張を述べる者(出荷判定者。保証の開示を読むとき)

### 2.5 関連のマーク(Y で改める)

- **IMPL-0118**(exception-escalation.md:791): note の「範囲(paths)・対象の人・根拠・記録した者を必須にし」を「範囲(paths)・根拠の区分(cause)・根拠・記録した者を必須にし、対象の人は 7.9.1 の2 の発動に限って必須にし(IMPL-1011)」へ改める。末尾の「7.9.1 の1 の発動で対象の人を記録しない扱いは IMPL-1011 が追う(準拠テンプレートは対象の人を必須にしている。ADR-0161)」を「7.9.1 の1 の発動で対象の人を記録しない扱いは IMPL-1011」へ改める。state・check は変えない
- **IMPL-0190**(human-ai-boundary.md:920): 「IMPL-0191 が取り込みの前に止める(降りていない。降りるまでは出荷の時点の IMPL-0047・0192 だけが止める)」を「IMPL-0191 が既定ブランチ宛の PR で取り込みの前に止める」へ改める
- **IMPL-0047・0192**: 変えない(例外承認の案内は出荷の走査の正しい扱い。E)
- ADR-0139 の表(75 行)と ADR-0161 の本文: 採用済みの ADR で書き換えない

### 2.6 issue= の扱いと寄せ先

- Y の後、`issue=356` を持つマークは0件になる。`npm run impl:issues -- --issue 356` が0件を返すことを、#356 を閉じる前に確かめる(閉じる前に計画のマークを確かめる)
- 新設の IMPL-NNNN は `plan=adopter`(issue= を持たない)
- **#361 へ寄せる**(コメントで足す。新規の起票はしない)。足す受け入れ条件の案:
  - [ ] checks-only の構成で、演習用ブランチ宛の PR で gate-g5 と gate-g5-base を通した、標識を含むコミットの SHA を、既定ブランチへ直接 push できるかを実機で確かめ、EV-NNNN(直接の push の経路)の差し替え条件を判定している
  - [ ] 経路が実在した場合、checks-only の ruleset に `pull_request` の規則を足すか(採用者への新しい義務。重の審議)を議題に上げている
- **#452 へ寄せるものは無い**: #452 は IMPL-0200(書き込みの既定の拒否)の実測で、本件の残り(実機の push の経路)と材料も時期も重ならない

## 3. 実装の指示

### 3.0 単位の分け方(指示の物差しからの差分)

- 指示の単位 X の一覧のうち、**`test-roster-conditions.mjs` と `.claude/skills/process-change/kinds/notice.md` は Y へ移す**。理由: test-roster-conditions.mjs は `config.mjs` を import して `restrictionInputProblems` を試す(16〜34 行)。config.mjs を変えずに試験だけ直すと試験が倒れる。notice.md を先に cause つきへ改めると、手引きが入口の検査(cause を拒否する)と逆を案内し、表示と実態が食い違う。ファイルが B26 と重ならなくても、意味が Y のファイルに依る
- 指示の一覧に無いが、**X に `scripts/gate/test-env-check.mjs` と `scripts/gate/test-seeded-error-scan.mjs` を足す**(adoption-trial.mjs と seeded-error-scan.mjs の試験。gate-g5.yml 235・238 行で結線済み)。実装の担当は、着手の前に B26 の変更の一覧(`research/b26-deliberation/impl-a.md`・`impl-b.md`・`fix-*.md`)にこの2つが無いことを確かめる。あれば Y へ移す
- `preflight.mjs`・`next.mjs` は**変えない**(C の裁定。next.mjs は env-check の不一致と所見を既に出し、本件の表示は状態を変えないので、next.mjs の注記の条件に掛からない)
- 本体のマークを delivered にするのは Y だけ。X の本体の変更は、ADR-0250・新設のマーク・EV のマーク・IMPL-0191 の note の絞りに限る

### 3.1 単位 X(今すぐ触れるファイル)

#### template

1. `scripts/gate/seeded-error-scan.mjs`
   - `export const PR_MARKER_HINT = '…'`(E の文)を `FALSE_POSITIVE_HINT` の下に足す
   - `export function markerCommitsInRange(cwd, spec)` を足す。`git log --format=%x1e%H%x1f%B <spec>` を読み、`hasMarker` に当たるコミットの SHA の配列を返す。読めなければ `null`。浅い clone の検査は持たせない(呼ぶ側が決める)。`scan()` の 92〜100 行はこの関数を使う形へ置き換える(挙動は変えない)
   - 冒頭のコメントに「PR の検査(check-pr.mjs)が同じ判定を import する」を1行足す
2. `scripts/gate/test-seeded-error-scan.mjs`
   - 既存の試験はすべて通る(期待: 変化なし)
   - 足す: ok `markerCommitsInRange` が標識の行のあるコミットだけの SHA を返す(3コミット中2番目だけ)。ng 相当 読めない範囲で `null` を返す
3. `scripts/gate/adoption-trial.mjs`(ruleset の項目。1636〜1661 行)
   - `const prGap = !pr ? '<C の文>' : null` を作り、確認済みの detail(`confirmedWith('ruleset', …)`)と不一致の detail の両方の末尾へ、`prGap` があれば `。` で続けて足す。状態は変えない。空の一覧(1632 行。既に不一致)にも同じ文を足す
   - 冒頭のコメントの env-check の説明に「pull_request の規則が無い構成は、状態を変えずに直接の push の欠けを詳細に出す(process-compass #356)」を足す
4. `scripts/gate/test-env-check.mjs`(360〜368 行の塊の隣)
   - ok(表示あり): G-6 無効・必須チェックだけ(`RULES_CHECKS`) → `status === 'confirmed'` かつ detail に `直接の push` と `5.6.2 第2層` を含む
   - ok(表示なし): `pull_request` の規則を含む応答 → detail に `直接の push` を含まない
   - ng: G-6 有効・`pull_request` なし → `status === 'mismatch'` で、detail に `pull_request の規則が無い` と `直接の push` の両方を含む
   - 期待: 既存の試験はすべて通る(364 行の正規表現が detail の末尾の追加で崩れないことを確かめる)
5. `README.md`
   - 更新の節を1つ足す(番号は実装の時点の最後の節の次。2026-11-20 は「16.」が最後)。題は「process-compass #356 の更新(IMPL-0191・1011・1003)を取り込むとき」。X では次の1項目だけを書く: 「env-check のルールセットの項目が、`pull_request` の規則の無い構成で、既定ブランチへの直接の push が取り込み前の拒否に乗らないことを詳細に出します。状態は変えません」
   - 「ルールセットを使えない場合」(131 行)は変えない

#### 本体

6. `src/content/docs/adr/0250-<slug>.md`(仮番号。番号の付け直しは指揮役)。題の案「欠陥注入の第2層の、標識の付与と演習用ブランチの書き換えの禁止を採用者に委ね、取り込み前の拒否を既定ブランチ宛の PR に限る」。決定:
   - 決定1: 第2層の(i)(iii)を IMPL-NNNN(adopter)に分ける。委ねる理由と採用者に求めることの表(ADR-0161 の表の形)。確かめる者は採用者の品質保証の担当
   - 決定2: 取り込み前の拒否(IMPL-0191)の対象は、既定ブランチと同じ名の参照を基底とする PR。リリースブランチを数えない
   - 決定3: 直接の push の欠けは止めず、env-check の ruleset の項目で表示する(preflight に置かない。B26 §3.9 を保つ)。経路の実在は EV-NNNN、#361 で確かめる
   - 採らなかった案: §1 の B・C・D の採らない案(ruleset の include を読む、SHA で比べる、preflight に置く、checks-only に pull_request の規則を足す、note だけで開示する、0190 の note へ足す、(i)を機械で閉じる)
   - 関連: ADR-0161・ADR-0139・ADR-0147・ADR-0084 決定4
   - frontmatter の title・description、textlint を通す
7. `src/content/docs/phase4-process-design/human-ai-boundary.md`
   - IMPL-0191 の note を §2.2 の X の時点の形へ(state 等は変えない)
   - IMPL-0191 の直後に IMPL-NNNN(§2.3)を足す
8. `src/content/docs/phase5-implementation/seeded-error-safety.md`(標識の節。50〜53 行の箇条書きの後)
   - `:::caution[暫定 EV-NNNN / 見直し 2027-05]` を足す。文の案: 「ルールセットに `pull_request` の規則が無い構成(準拠テンプレートの checks-only)では、演習用ブランチ宛の PR で必須チェックを通したコミットを、既定ブランチへ直接 push できる経路が在りうると見ています。準拠テンプレートは、この構成を env-check で表示し、止めません。実機では確かめていません(#361)。」番号は台帳の最大(2026-11-20 は EV-0344)の次の空き。書式は `community/evidence-marking.md`
9. 再生成: `npm run impl:write`、`npm run evidence:write`。確かめ: `npm run lint:refs`、textlint、`npm run impl:issues -- --issue 356`(X の時点は3件のまま)
10. 関係する試験だけ流す: template の `test-seeded-error-scan.mjs`・`test-env-check.mjs`・`test-env-findings.mjs`・`test-adoption.mjs`

### 3.2 単位 Y(B26 の push の後)

#### template

1. `scripts/gate/config.mjs`(1011)
   - `restrictionInputProblems`: 発動の `allowed` に `cause` を足す。`cause` が `"7.9.1-1"` / `"7.9.1-2"` でなければ問題「restriction.cause(根拠の区分。標準 第7章 7.9.1 の1 は "7.9.1-1"、2 は "7.9.1-2")を書きます」。1 で `person` があれば問題「7.9.1 の1(見逃しの反復)による発動に、対象の人(person)を書きません(7.9.6。見逃しは範囲で数え、人で数えない)」。2 で person が無いか名簿に無ければ、現行の文の定義を「restriction.person(7.9.1 の2 の区分の対象の人。5.6.3 の措置との照合のためだけに記録する)」へ改めて問題にする。`shape` の例の文も cause つきの2つの形へ改める
   - `restrictionState`: active・released の要素に `person` を持たせない(`cause` を持たせる。無ければ `null`)。`causeless`(active のうち cause の無い発動の件数)を返す。`legacy` は今のまま。関数のコメントに両者の違いと ADR-0161 決定5 を書く
2. `scripts/gate/aggregate-evidence.mjs`
   - 2232 行: 「。対象 ${r.person ?? '不明'}」を外す
   - 4248 行の `restrictions`: active が person を持たないことで evidence.json から人が外れる。`causeless` を載せる
   - 制限の表示(6394 行付近): `causeless` が1以上なら「根拠の区分(cause)の無い旧い発動 N 件。範囲の照合は続ける。対象の人は表示しない」を足す
   - 6735 行の隣に IMPL-1003 の行(F の文)。外へ渡す形でも同じ
3. `scripts/gate/check-pr.mjs`(0191)
   - `analyzePr` の mergeBase を得た後で、`policyBase` が無ければ notice「既定ブランチ(--policy-base)を渡していないため、標識を含むコミットの取り込み前の検査(第5章 5.6.2 第2層)をしていない」。あれば `base` と `policyBase` の名を正規化して比べ、同じなら `markerCommitsInRange(root, `${mergeBase}..${HEADREF}`)` を呼ぶ。`null` なら errors「PR のコミットを読めない」。当たった SHA ごとに errors「コミット <12桁> の本文に標識 Seeded-Error: の行があります。<PR_MARKER_HINT>」
   - import は `./seeded-error-scan.mjs` の `markerCommitsInRange`・`PR_MARKER_HINT`・`MARKER`
4. `scripts/gate/test-check-pr.mjs`(一時のリポジトリで main と drill を作る既存の作法に合わせる)
   - ng1: 基底 = 既定ブランチ、1コミットの本文に `Seeded-Error: SE-1` → errors に短い SHA を含み、`SE-1` を含まず、`例外承認で受ける` を含まない
   - ng2: 行頭に空白 `  Seeded-Error:` → 失敗
   - ng3: CRLF の本文 → 失敗
   - ng4: 3コミットのうち2番目だけ → 2番目の SHA だけを挙げる
   - ok1: 標識の無いコミット → 標識の errors なし
   - ok2: 基底 = drill(既定ブランチと別の名)で標識あり → 標識の errors なし
   - ok3: drill を既定ブランチの先端から切り(同じ SHA)、drill 宛で標識あり → 標識の errors なし(名で比べる)
   - ok4: `> Seeded-Error:`・行の途中の語・`Seeded-Error :` → 当たらない
   - ok5: 既定ブランチの履歴に古い標識のコミットがあり、PR のブランチへ既定ブランチを取り込んだ(マージコミット) → 当たらない
   - ok6: `--policy-base` なし → errors なし、notice に「検査をしていない」
   - 期待: 既存の試験はすべて通る(fixture に `Seeded-Error:` の本文は無い。起案 §1.2 の確認)
5. `scripts/gate/test-roster-conditions.mjs`(1011。意味が config.mjs に依るため Y)
   - 共用の `R` を cause つきに改める(人を持つ形は `cause: '7.9.1-2'`)。旧い形を読む試験(restrictionState)は、cause の無い fixture を別に置く。見出しに ADR-0161 決定5 を引く
   - 足す: ng cause 1 + person あり / ng cause 2 + person なし / ng cause 2 + 名簿に無い person / ng cause なし / ng cause の値が他("7.9.1-3")/ ok cause 1・person なし / ok cause 2・名簿の person / ok restrictionState の active に `person` の鍵が無い / ok cause の無い旧い記録で `causeless === 1`・`legacy === 0` / ok 範囲の無い旧い通知で `legacy === 1`・`causeless === 0`
   - 期待: 既存の 61 件は R の直しの後にすべて通る。227〜246 行の入口の試験も cause つきで通る
6. `scripts/gate/test-aggregate-records.mjs`
   - ok: cause 2・person「名簿 丁」の制限に触れる変更の行に「名簿 丁」が出ない。evidence.json の `independence.restrictions.active[]` に `person` の鍵が無い
   - ok: cause の無い旧い記録で、開示に「根拠の区分(cause)の無い旧い発動 1 件」が出る
   - ok: 開示に `IMPL-1003` の行が出る(内部と外へ渡す形の両方。文字列の存在。合否の試験ではない)
7. `scripts/gate/test-edition-end.mjs:197` の制限の fixture(cause なし・person あり): 入口を通らず changeLog に置く形なら変えない(旧い記録として causeless に数えられ、既存の期待は崩れない見込み)。崩れたら fixture に cause '7.9.1-2' を足す。ファイルが B26 と重なるかを確かめる
8. `.claude/skills/process-change/kinds/notice.md`(40〜46 行)
   - 本文を「範囲(`paths`)・根拠の区分(`cause`)・根拠となった測定結果の所在(`basis`)・記録した者(`recordedBy`)を必ず書きます。対象の人(`person`)は、7.9.1 の2(意図的な違反)による発動だけに書き、5.6.3 の措置との照合のためだけに使います。7.9.1 の1(見逃しの反復)による発動には書きません」へ
   - 例を2つにする(cause 1・person なし / cause 2・person あり)
   - 1 と2 が同時に当たる事案は、識別子の別な2件に分けて記録する旨を1文
   - cause の判別は品質保証の機能の判断で、機械は整合だけを確かめる旨を1文
9. `generate-profile.mjs`: 変えない見込み(restriction を丸ごと写す。1628 行)。cause が通ることを入口の試験(5)で確かめる
10. `README.md` の X で足した節へ、2項目を足す: (a)「**新しく止める検査**: 既定ブランチ宛の PR のコミットの本文に `Seeded-Error:` の行があると、check-pr.mjs が失敗させます(IMPL-0191。強制層の変更)。説明のために語を書いたコミットは、PR のブランチで本文から外します」(b)「承認権限の一時制限の発動に `cause` が要ります。7.9.1 の1 の発動には `person` を書けません。cause の無い旧い記録は拒否せず、件数を保証の開示に出します(IMPL-1011)」

#### 本体

11. IMPL-1011・0191・1003 を §2.1・§2.2(Y)・§2.4 の形へ。IMPL-0118・0190 を §2.5 のとおり
12. `npm run impl:write`。`npm run impl:issues -- --issue 356` が**0件**であること
13. 関係する試験: template の `test-check-pr.mjs`・`test-roster-conditions.mjs`・`test-aggregate-records.mjs`・`test-edition-end.mjs`・`test-seeded-error-scan.mjs`。回帰の全量は push の前に1回(`npm run check`)
14. 強制層の変更としての扱い(受け入れ条件2): check-pr.mjs の新しい失敗は G-5 の強制層を厳しくする変更である。ルールセットの JSON とワークフローは変えない。README の更新の節に「強制層の変更」と明記する(10 の a)

## 4. 既存の決定との突合

| 突き合わせた決定 | 結果 | 対処 |
| --- | --- | --- |
| ADR-0161 決定5(7.9.1 の2 だけ対象の人) | 矛盾なし。A は決定5 の実装 | person の定義の文の改めは決定5 の範囲と明記 |
| ADR-0161 の表(1011「降りたら machine」、0191「降りたら delivered・machine」) | 矛盾なし。0191 は(ii)だけで delivered・machine。(i)(iii)は ADR-0161 が決めていない | (i)(iii)の帰属を ADR-0250 で決める。ADR-0161 は書き換えない |
| ADR-0161 の採らない案「第2層を取り込みの前または出荷の前へ緩める」 | 矛盾なし。直接の push を止めないのは、PR の経路の拒否を出荷へ代えることではない(取り込みの前の拒否は PR の経路で働く) | ADR-0250 決定3 に、止めない理由(構成の選択肢)と EV を書く |
| ADR-0127 決定5(person 必須) | ADR-0161 決定5 で一部置き換え済み | fixture の見出しに ADR-0161 決定5 を引く |
| ADR-0147(1003 を機械で数えない) | 矛盾なし | — |
| ADR-0225 決定8(1004 を adopter) | 矛盾なし。1003 と理由が違う | note に差を1文 |
| ADR-0040(様式に欄を足さない) | 矛盾なし。D-0 に欄を足さない | — |
| ADR-0139(第3層・第4層) | 矛盾なし。IMPL-0047 の例外承認の案内を保ち、PR の文を分ける | ADR-0139 の表は書き換えない |
| B21 の議長の裁定(ruling-deferred-draft §3.4: 保護ブランチ宛、preflight と開示で表示) | **ありと対処**。preflight の表示は B26 §3.9 が後から採らないと決めた。保護ブランチは既定ブランチに具体化 | 後の決定(B26)と本裁定を採る。B21 の記録は書き換えない |
| B26 の裁定 §3.9(preflight を変えない。env-check が既に表示する) | **前提の事実に誤り**。env-check は G-6 が有効なときだけ pull_request の欠けを出す(adoption-trial.mjs 1639 行) | 決定は保つ。X の adoption-trial の変更で前提を満たす。B26 の記録は書き換えず、本ファイルに記録 |
| suite の fixture(test-roster-conditions の R、test-check-pr、test-env-check 364 行、test-edition-end 197 行) | R は ADR-0127 決定5 を固定しており、ADR-0161 決定5 により改める。他は崩れない見込み | §3.1 4、§3.2 5・7 |
| 条文 5.6.2 第2層(human-ai-boundary.md 911 行)・7.9.6(exception-escalation.md の表)・1.10.2 の表(overview.md 709 行) | 矛盾なし。条文は変えない | — |
| 執筆規約(根拠水準マーク、実装マーク、適用範囲) | EV を1件足す。新しい適用範囲の注記は無い | `evidence:write`・`impl:write` |

## 5. 受け入れ条件との対応

#356 の本文(`gh issue view 356`)の受け入れ条件は2つ。本文の表の実装マークのうち、本件の時点で `issue=356` を持つのは IMPL-1011・0191・1003 の3件だけである(起案 §0。ほかは ADR-0139・ADR-0161 などで既に delivered か adopter)。

| 受け入れ条件 | 対応 |
| --- | --- |
| 各規定を準拠テンプレートへ降ろして `state=delivered` にするか、降ろさない理由を ADR に記録して `plan=adopter` へ改めている | IMPL-1011(Y、machine)、IMPL-0191(Y、machine。(ii)だけ)、IMPL-1003(Y、manual)を delivered。第2層の(i)(iii)は IMPL-NNNN(X、adopter)に分け、理由を ADR-0250(X)に記録。Y の後に `impl:issues --issue 356` が0件 |
| 隔離の4層を降ろすときは、ルールセットと CI の変更を強制層の変更として扱っている | ルールセットの JSON とワークフローは変えない。check-pr.mjs の新しい失敗(G-5 の検査)を強制層を厳しくする変更として README の更新の節に明記(Y-10)。直接の push の欠けを塞ぐルールセットの変更(checks-only に pull_request の規則)は採用者への新しい義務のため本件で行わず、#361 へ申し送る |
| (本文の表の旧いマーク)IMPL-0047・0163・0184・0185・0186・0155・0158・0162・0187・0188・0189・0154・0157・0190 | 本件の範囲外(既に降りたか adopter。`issue=356` を持たない)。Epic の記録のため、閉じるときのコメントにこの旨を1行書く |
