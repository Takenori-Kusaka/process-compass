# 束 B33(B31 の続き)U6c・U8 の実装の記録

実装 2026-11-26。template のブランチ `wip/b33`、コミット 4701087(push しない。`E:/Github/process-compass/template` の `refs/heads/wip/b33` へ退避済み)。本体は Takenori-Kusaka/b33 のコミット(この記録と同じ)。裁定 `ruling-1.md` §1.1・§1.5、`ruling-4-audit-2.md` に従った。

## 変えた挙動

- **U6c(集約)**: `exception-expiry.mjs` に `mutationBreachPrOf(t)`(対象が `G-5 PR-<番号>` の完全一致なら番号、でなければ null)を足し、`mutationBreachExceptionFor`(段)と集約が同じ読みを使う。`unjudgedGateExceptions` は行に `content` が渡され、対象が `G-5 PR-<番号>` で内容の先頭が印のときだけ G-5 の行を欠落にしない。**内容が渡されないときは subject の形だけでは判定せず欠落**(ruling-1 §1.1)。`aggregate-evidence.mjs` は `gateExceptionRows` に `content` を足し、同じ関数で見分けた行に、範囲の PR の写し(`prByNumber`)の material(レビュー・作成者・マージ時の先頭)と作成を指示した者を渡して (A) を数える。写しが範囲に無いときは (B) だけで読み、帰属の欠落の理由に「対象の PR の写しが出荷の範囲に無い」を足す。作成を指示した者が名簿に対応づかないときは欠落(段と同じ)。印の無い行・`G-5 P-001` などは従来どおり常に欠落。
- **U8**: `test-check-pr.mjs` に1場面(`ci.mutationThreshold` だけを変える PR は同時変更の失敗にならず、`thresholds.changed` に `process.config.json(ci)`)。check-pr.mjs は変えていない。
- **本体**: IMPL-0931・1029 を delivered・machine(test= は 0931 が test-exception-expiry.mjs、1029 が test-adapter.mjs。plan・issue・review を外し、note を現在形へ)。IMPL-0996 の note(閾値割れの行を除き常に、集約が同じ関数で見分ける)。IMPL-0763・0930 の note の「IMPL-0931 が追う」を「束 U6c で降ろした」へ。ADR-0243 決定5・影響の節を現在形へ。README 項23 の「取り込みの前後の差」を集約の側の記述へ改め、手引き exception-paths.md の対象の表に1文。台帳(impl・evidence・scope)を再生成。
- **突合2巡目の低**: 低2 ADR-0243 の ADR-0115 との突合の項を audit-2 の列挙に揃えた(偽れる材料4つと、基底から読むのは誤りの防止で改ざんの防止でない)。低3 README・手引きの「受けないもの」に基底の構成・台帳を取り出せない場合を足した。低1 は直さず、ADR-0243 の同じ項・README 項23 に1文で開示した(基底の台帳の「無い/読めない」は `cat-file -e` で分け、「読めない」の分岐は試験で固定していない。「無い」側へ倒れても全行が (A) を要し、受ける側への抜け道にならない)。

## 試験(template の LF の写しを WSL の node 26 で実行)

- test-exception-expiry 123/123(U6c の関数の場面5件・Linux の集約の場面5件を新規。集約は模擬の gh と docs/records/reviews の写しで、Windows では省かれる)、test-check-pr 300 場面(U8 の1場面を足した)、test-g5-aggregate 61、test-aggregate-wiring 65、test-adapter 232、test-material-attribution 58、test-aggregate-records 223、test-push-trigger 27、test-init-g5 208、test-context-refs・test-handover-items・test-enforcement-inventory 通過。
- 本体: lint:impl・lint:evidence・lint:refs・test:fields・lint:scope 終了 0、textlint(ADR-0243 ほか4ファイル)違反なし、`npm run impl:issues` に 445 は出ない。

## 陰性の確認

- 集約の照合で印の判定を外す(`unjudgedGateExceptions` の skip を消す): 4件が落ちた(集約の ok 1・関数の ok 2・G-5 P-001 の1)。
- 集約が material を渡さない(帰属を (B) だけにする): 集約の ok 1件が落ちた(宣言行のレビューで数える場面)。
- check-pr の対象のキーの並びから `ci` を外した写し: 3件が落ちた(U8 の場面、既存の「構成のカバレッジの下限と製品のコードを同じ PR で変える」、IMPL-0836:ng のミューテーション閾値)。

## 議長へ返す点

1. 集約の (A) は写し(docs/records/reviews)のレビューで数え、写しの本文の編集者 `edited_by` を要する。REST だけの PR(写し無し)では (A) が数えられず (B) へ落ちる。止める側に倒れるが、採用者の実環境で写しが取れているかは確かめていない(EV-0347 の範囲に含めてよいか)。
2. 集約は (A) が満たされなくても (B)(台帳の行を入れた PR の作成者・承認者が記名者)で帰属を数える(ledgerRowUnbacked の既存の挙動を保った)。段は (A) だけを受ける。段が受けない行を集約が (B) で通すことはあるが、その PR は gate-g5 が失敗で、段の側が止める。この非対称を許容してよいか。
3. Linux 専用の集約の場面は Windows で省かれる(既存の同じ形の場面と同じ)。CI の Linux で確かめる。
4. EV の番号・ADR-0243 の番号は変えていない。EV-0347・0348 は push の直前に付け直す(rebase-1 のとおり)。

## 未確認

- 実際の GitHub 上の応答・権限(EV-0347・0348)。WSL では test-g5-missing と test-adoption が `git init` の失敗(環境)で走らなかった(変更と無関係。Windows 側の通しは未実施)。回帰の全量は流していない。独立の突合(U6c・U8 の1巡目)は未実施。
