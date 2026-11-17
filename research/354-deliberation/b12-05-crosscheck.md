# 束 B12 独立の突合(1巡。差分だけ)

対象: 本体 `git diff 81ce1642..53e996e3`、template `git -C template diff origin/main..HEAD`(eec8ac0・41554ad)。裁定: `b12-03-ruling-proposal.md`、`../327-deliberation/b12-T8-02-review.md`。2026-11-17。

実行で確かめたこと: `node template/scripts/gate/test-edition-end.mjs` 76 件通過。`lint:impl`・`lint:refs` 終了コード 0。`check-template-drift.mjs` 一致。`lint:evidence` 287 件。textlint(ADR-0165・変更した4頁) 違反なし。

## #354(IMPL-0120・0309・0986・T-2・ADR-0165)

### 中-1 試験の名が、確かめていないことを確かめたと読ませる(表示と実態)

`test-edition-end.mjs` の次の2つは、名と中身が合わない。

- 「集約の値の行: claim.statementFacts の欠落の件数は、名を下げる欠落の一覧と同じ数」: 実際の判定は `typeof gapCount === 'number'` と `Array.isArray(unmet)` だけ。`gaps.length` との一致は見ていない。`gapCount: gaps.length + 1` に改めても通る
- `IMPL-0120:ok`「作業中の版でコミットがあれば先頭12字が出て」: `abcdef123456` は入力の `editionLabel` に試験自身が書いたもの。`statementFactsLine` は commit を出力に足さない(`kbCommit` は「識別なし」の判定にだけ使う)。実際の経路では `editionLabel(config, kbSource)` が commit を入れるので出力は正しい。ただし、この試験は正しさを確かめていない

あわせて、品質レポートの行(`aggregate-evidence.mjs` 6193〜6198 行。`external` で離脱を件数だけにする分岐を含む)を通す試験は無い。IMPL-0120 の note は「品質レポートの1行で出す」を `check=machine` の内容として書いている。

直し方の案: 1つ目は `c3.statementFacts.gapCount` を、同じ実行の欠落の件数(名を下げた理由の件数など、出力から取れる値)と比べる。取れないなら名を「型を確かめる」へ改める。2つ目は `editionLabel` に commit を含めない入力で `kbCommit` だけを与えたときの期待を決めるか、名を「識別なしの注記が出ない」に絞る。報告の行と `external` の分岐は、試験を足すか、note から機械の内容として外す。値そのものは正しいため「高」にはしない。

### 中-2 ADR-0165 のコンテキストが ADR-0083 決定2 を誤って要約している

ADR-0165 は「ADR-0083 決定2 は『再開の経路は持たない』と記録したが、採用者に求めることを書いていない」と書く。ADR-0083 決定2(74 行)は「同じ案件で再開したら、件数は最初の開始から数え、空白の期間は記録の欠落とします(EV-0161)」と既に定めている。欠けていたのは、テンプレートが降ろさないことを採用者に委ねる記録(ADR-0084 決定4・implementation-marking.md 134 行の `decision=` の要件)である。決定2 の中身は ADR-0083 の再掲で、新しい義務ではない。矛盾ではないが、読み手は ADR-0165 が初めて求めたと読む。

直し方の案: 「ADR-0083 決定2 は再開の数え方を定めたが、準拠テンプレートが降ろさない理由と採用者に委ねることを記録していない」へ改め、決定2 に「数え方は ADR-0083 決定2 のとおり」と添える。

### 低-1 ADR-0165 決定1 の「表明は責任者の名義で述べるため(ADR-0083)」の出典

ADR-0083・ADR-0068 に「名義」「責任者」の語は無い。根拠の所在を示す節(1.10.2 か附属書H H.8 など)を指すか、出典を外す。

### 低-2 IMPL-0120 の2つ目の `:ng` は違反の入力でない

「未達1件・欠落2件・一覧の値が出る」は、値の出力の確認であり違反の検出ではない(implementation-marking.md 88 行)。1つ目の `:ng`(作業中の版で commit なし → 注記)が対を満たすので、検査の要件は満たす。目印を外すか ok の側へ改める。

### 確かめて問題が無かった点

- 裁定どおり: 3マークの state・plan・decision・note が裁定の文と一致。README 460 行・659 行、`generate-profile.mjs` 3654 行、固定の文(`STATEMENT_FACTS_NOTE`)、config.mjs の注記の改め。`adr/index.md` は一覧を持たない(0164 も無い)ので更新なしで妥当。`exceptionsRef` の入力は省かれたが、出力は「次の行(IMPL-0573)」を固定で指すので影響なし
- ng/ok の対: `statementFactsLine` から「識別なし」の注記か「無し」の補いを消すと、1つ目の ng と2つ目の ok が落ちる(読みで確認。改変しての実行はしていない)
- ADR-0147 決定1: 理由(甘い側の欄が記録の示す離脱を隠す。53 行)と ADR-0165 決定3 の理由が合う。ADR-0090 決定6・ADR-0141 決定4・5 の引用も実在し内容が合う
- ADR-0084 決定4: G-8 の節は `impl-no-adopter.yaml` に無く(第3段の `impl-decision-sections.yaml` にだけある)、`adopter` にできる。理由と求めることは ADR-0165 の決定に書かれており、134 行の要件を満たす
- 外へ出す形: `external` では列挙に無い離脱を件数だけにする。列挙する逸脱(閉じた列挙の識別と条項)と版の表示に人の名は入らない。ADR・README に保持者の名や手元の所在は無い(手元の bundle の所在は research の記録にだけある)

## #327 T8(IMPL-1002)

所見なし。

- 3か所の文が審議の文と一致。`check-template-drift.mjs` の `items: true` は項目の文を両方向で比べ(186〜192 行)、一致を出した。note の「両方向で確かめる」「意味は機械が確かめない」「enablement.md の写しは比べない」は実態どおり
- `check=presence` と `単位: 行` は implementation-marking.md 92〜94 行に合う
- 条件1(README 節12 を必須で)・条件2(enablement の写しの注記)を満たす
