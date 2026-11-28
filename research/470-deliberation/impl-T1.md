# #470 実装 T1(template 1 本目: 規定 A と IMPL-1050〜1052)

## 変えたファイル(template 内。枝 d5-470、コミット f700fa9)

- `CLAUDE.md`(45 行の箇条を直し、直後に 2 行)
  - 45 行: 記録先を「PR の本文(PR を経ないときはコミットのメッセージ)」へ。退けた案がある選択と外部の制約に従った選択では理由も書く。所在か退けた案で示し、示せなければ推測。作成側の主張で判定の根拠に数えない(IMPL-1050)
  - 46・47 行: 裁定 1 章の常駐の指示の文案 2 行。「ADR を残す」と書いた(ADR 番号は書かない)
- `scripts/gate/claude-md-resident.json`
  - CR-015 の核を、45 行の新しい文へ置き換え。CR-120(46 行)・CR-121(47 行)を `--write-resident` で追加
- `.claude/skills/implement/SKILL.md` 手順3 の末尾の節
  - 記録先を PR の本文(Draft から選択のたびに書き足す。PR を経ないコミットはコミットのメッセージ)へ(IMPL-1052)
  - 裁定の文案 4 段落を、「人へ戻すのは…」の段落の直後に追加
- `.github/PULL_REQUEST_TEMPLATE.md` 「変更の概要」のコメント 1 つだけ(IMPL-1051 の注記)。欄・自己チェックは足していない

CRLF の 4 ファイルは、CRLF を保って書いた。

## 試験(template 内。Windows の Git Bash、node 26)

- `check-process-rules.mjs`: 通過(exit 0)
- `test-claude-md-resident.mjs`: すべて通過
- `test-template-copy.mjs`: 12/12 一致
- `test-context-refs.mjs`: すべて通過
- `test-adoption.mjs`: 123 件一致
- `test-init-g5.mjs`: exit 0
- `test-check-pr.mjs`: 300 秒の制限で打ち切り(exit 124)。出力にあった ok 行に失敗は無かった。Windows では完走しない。push 前の全量(WSL)で確かめる
- 本体 `scripts/test-template-fields.mjs`: 11 件一致
- 本体 `scripts/check-template-fields.mjs`: 本体の作業ツリーに node_modules が無く(`yaml` が解決できない)実行できなかった。`npm ci` はしていない。WSL の全量で確かめる必要がある

## 退避

`E:/Github/process-compass/tmp/470/template-d5-470.bundle`(`origin/main..d5-470`、1 コミット)

## 裁定の文案から変えた点

- 意味は変えていない。
- `CLAUDE.md` の既存の箇条(CR-015)を新しい文で置き換えたため、CR-015 の核を直接書き換えた。理由: 核の照合は「核が同じ節のいずれかの行に含まれるか」で、旧文が消えると落ちる。`--write-resident` は追加だけなので、置き換えは手で行った。裁定の 6 章「既存の箇条を直す」に沿う。
- SKILL.md の記録の段落に、「理由は作成側の主張で、独立レビュー(G-6)の判定の根拠に数えません」と「調べる手段を使えないときは止めず…最小限で作ります」を足した。規定 A の要求事項と同じ内容で、文案の重複を避けず明示した。
- SKILL.md の記録先の変更に、スカッシュで既定ブランチに残らない理由を 1 文足した(IMPL-1052 の note の趣旨)。
- PR 様式の注記は、IMPL-1051 の note の語(退けた案・従った制約の所在・作成側の主張・確定の後の訂正は追記・記録先の既定は PR の本文・AC-N)で書いた。

## 議長へ

- CLAUDE.md の 46 行は「ADR を残す」と書いた。裁定の文案どおり。採用者向けに ADR の語が通じる前提で、番号は引いていない。
- `check-template-fields` が未実行。本体の `npm run test:fields` は WSL か node_modules のある場所で流す必要がある。
- `test-check-pr.mjs` は Windows で 300 秒を超える。次の担当(規定 B)は check-pr を変えるので、試験の実行は WSL か、時間を長く取る。
- 本体側の IMPL-1050〜1052 の note に「束 D1」「現在は manual」が残る。本体の担当が delivered へ直す(6 章)。
- 本体の実装マーク IMPL-1050 は `check=presence(単位: 行)` へ移す想定。常駐の核は CR-015(IMPL-1050)・CR-120・CR-121(規定 A。IMPL-A)に分かれた。
