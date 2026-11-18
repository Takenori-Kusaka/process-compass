# 束 B19 実装の記録 01

作成 2026-11-18。担当: 実装。入力: `intake.md`、`ruling.md`(食い違いは裁定が優先)、`committee-opposition.md`。push はしていない。

## 変えたもの

template(2 コミット。bundle は `E:/Github/process-compass/tmp/bundles/template-b19-01.bundle`・`-02.bundle`。-02 は -01 を含む)

- `templates/00-d0-governance.md`: 節12 の生成区間の終わりの目印の直後に、太字の見出し(### にしない)で「AI を用いない実施の記録」の表と記入の手引き(O-10 の1文を含む)。節2 の H-4 の文を字面「節13 の YYYY-MM-DD の行」(「表8 の…」も可)へ改めた
- `templates/11-quality-assurance-policy.md`: 「確認の周期と後継」に頻度の行と、読める値の箇条(白名簿。O-1・O-9)
- `scripts/gate/org-assurance.mjs`: `parsePracticeInterval`(白名簿の全体一致)・`practiceDue`(月末を繰り越さない)・`aiFreePracticeState`・`aiFreePracticeTexts`、`readCycle` に `aiFree`・`aiFreeRaw`、`discouragedUnrecorded` の H-4 の照合(O-3: 決定した者と理由がともに埋まった記録が1件以上)、`discouragedText` に欠落の理由
- `scripts/gate/autonomy.mjs`: `l3ScopeIds`(id の配列だけ。O-8)。`scripts/init/generate-profile.mjs` の `renderAutonomyTable` がそれを使う(出力は不変。試験で固定)
- `scripts/gate/aggregate-evidence.mjs`: 項目7 の独立した塊「AI を用いない実施」。`gaps`・`cycleNotices`・組織継続の側の状態に入れない。「照らした基準日」を併記し、時計に落ちたときもその旨(O-2)。`config.mjs` は触っていない
- 試験: 新規 `scripts/gate/test-ai-free-practice.mjs`(58 件。IMPL-1020/1021/1022 の ng/ok、範囲と表の一致、生成の不変、集約の通し)。`test-roster-rules.mjs`(H-4 単体 8 件)・`test-discouraged-evidence.mjs`(H-4 通し 2 件)に IMPL-0298 の対。`.github/workflows/gate-g5.yml` に新試験の run(`|| true` 等なし)
- 手引き: `.claude/skills/pit/reference/handoff.md` に節「全社の統制の更新を受けるとき」(IMPL-1024。AI維持管理者の承認の文は削り、承認の経路は採用者の定めとした。O-6)。`.claude/skills/process-change/kinds/mode.md` に IMPL-1025 の箇条(条件2〜7 のそれぞれの結果を理由に書く。書式は例示。O-11)

本体

- `src/data/template-fields.yaml`: D-0 の表(3 列を1行の見出しで登録。O-4)・見出し、テンプレ11 の頻度の行
- `src/content/docs/phase4-process-design/*.md` の実装マーク: IMPL-1020・1023 を delivered presence、1021・1022 を delivered machine(test=test-ai-free-practice.mjs)、0978・1024・1025 を delivered manual(1025 は target=process-change-skill)、0298 の note に H-4、0070・0071・0777 の「降りていない」を直した(O-5)
- `src/data/impl-targets.yaml` の description 3 件・`impl-inventory.yaml` の note 3 件の「予定」「降りていない」を直した
- 台帳 `implementation-ledger.md` は `npm run impl:write` で再生成。EV・scope の台帳は変更なし

## 試験の結果(要約)

- template 側(CRLF の作業ツリーを LF にした写しで実行。Windows の CRLF による偽の FAIL を避けるため): test-ai-free-practice 58 件・test-discouraged-evidence 10 件・test-roster-rules 212 件・test-check-delegation 68 場面・test-aggregate-records 140 件・test-assurance-period 31 件・test-init-g5 164 件 すべて合格。check-d0 は構成が未設定で実施せず(通知のみ)
- 本体側: lint:impl(終了 0)・test:impl 56 件・test:fields 11 件・test:template 一致・lint:refs・lint:evidence(307 件)・lint:scope・impl:issues・test:plan-issues 22 件 合格。textlint 3 ファイル 指摘なし
- 全量の回帰(`npm run check`)は流していない

## 裁定から外れた点とその理由

- 裁定どおり、表は生成区間の直後に太字の見出しで置いた(初版は intake の「縮退の3列の前・###」で置き、2 コミット目で裁定に直した)。`template-fields` の `after` という欄は存在しないため、登録は見出し文字列と行の文字列だけ。読み側(org-assurance)の始点は `**AI を用いない実施の記録` で合わせた
- 表の読みは「層1 が無い案件(policy.present が偽)は重ねて出さない」「層1 に行が無い・空欄は空欄として出す」を採った(O-7 の裁定どおり)
- 「停止中の範囲は含める」は IMPL-1021 の note に書いた。IMPL-1022 の note には範囲の導き方は IMPL-1021 と同じと書くにとどめた(裁定の「両方に1文」を、参照で満たしたと読む。足りなければ1文足す)
- 新しい IMPL・EV は起こしていない

## 残り・申し送り

- 独立の突合(別の文脈。観点: 「予定」「降りていない」の食い違いの残り、表示の3か所の揃い、標準の様式と template の配置の差の開示)
- 標準 5.4.7 の「作る日」との差は note と項目7 の「照らした基準日」で開示した。標準の文は変えていない(採らない)
- template の push と本体の push は対で行う。template は detached HEAD のまま ed9599c(origin/main の上の 2 コミット)。ブランチは切っていない
- 作業物: `node_modules` に junction(`E:\Github\orca\workspace\process-compass\b19\node_modules` → `E:\Github\process-compass\node_modules`)を張った。後で外す(`cmd /c rmdir node_modules`)。template 側には張っていない。LF の写しは scratchpad の `tpl-lf`(消してよい)
