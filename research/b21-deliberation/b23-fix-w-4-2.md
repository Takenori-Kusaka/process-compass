# 束 B23 単位 W・4 の直し(2巡目の裁定 `b23-ruling-w-4-fix2.md` の実装の記録)

2026-11-19。template は F2-01(check-g1・試験・gate-entry.yml)と F2-02(template:kb)。bundle は `tmp/bundles/template-b23-F2-0N.bundle`。

## 直し

- **check-g1.mjs**: 立ち上げの順序の比べ方を、`g1.passed === true`(既存の `g1PassState`)で分けた。通過の記録が無いときだけ、作業ツリーの D-0・様式 09・企画書の最後のコミットの日付で比べ、逆なら失敗にする。通過の記録があるときは比べず、「G-1 の通過の後は立ち上げの順序を機械で比べない。判定し直すときは G-1 の判定者が確かめる」を notice で1行出す。`git show <版>:` で版の時点の D-0 を読む処理と、版が読めないときに失敗にする処理は消した。
- **gate-entry.yml**: `fetch-depth: 0` は残した。G-1 の時点の見積りの上書きの検査(判定した企画書の版を読む)と IMPL-0878 の PREVIOUS_BRIEF の `<ref>:<path>` が履歴を要するため。コメントを実態に合わせた。
- **IMPL-0884 の note**: `state=delivered check=machine` のまま、機械が失敗にするのは最初の G-1 だけ、通過の後と判定し直しは決定可能でないため機械で比べない(緩和でなく閉じ方の開示)、確かめる者は G-1 の判定者、と改めた。「条文に無い緩和」の語は使っていない。
- **開示で閉じた点(L2-2・L2-3)**: IMPL-0374 の note に、前の版の様式で記録した SG の後は算定できない旨を足した。IMPL-0614 の note に、delivered へ上げるときに `check=machine test=…` へ戻す旨を足した。L2-1 は論点が無くなったので書かない。

## 試験と変異(WSL node 26.13.1、通常・TZ=UTC)

- test-brief-estimates 34・test-project-id 5・test-brief-thresholds 50、すべて通過。
- 場面: ng(記録なし・逆)は既存の 2 本と、様式 09 が企画書より後の 1 本。ok(記録なし・順序どおり)は既存。ok(記録あり・様式 09 を承認し直し)と ok(記録あり・D-0 を承認し直し)は、失敗にならず表示の行が出ることまで確かめる。版を読めない・版の記録が無い場面は、処理を消したので外した。
- 変異(各1回、戻した): (1) の比較を無効にすると ng 3 本が落ちた。(2) の分岐を外すと ok 2 本が落ちた。通常・TZ=UTC とも同じ。

## 回帰(`--template-ref HEAD`、WSL の LF の写し)

- t288 87 場面・t288b 82 場面、落ち 0。
- cl-judgment 26・scenarios 186・stages 175・self-decision 131・verify-n 37・trial 35 場面、落ち 0。

## 本体の検査

impl:write(台帳を更新)、lint:impl・lint:evidence・lint:refs・lint:text・lint:scope・test:fields は通過。template:kb は複製元の記録だけが変わり、template F2-02 でコミット。

## 残った点

- 判定し直しの G-1 の順序の逆は機械で止まらない(裁定で、機械で閉じないと決めた点。G-1 の判定者が確かめる)。
- gate-entry.yml の実行は実物の GitHub で確かめていない。
- 独立の突合は2巡までのため、3巡目は行っていない。
