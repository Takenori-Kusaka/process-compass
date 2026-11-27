# #467 push の準備(束 D4)

担当: push の準備の担当(議長が push する)。push・gh の書き込みはしていない。

## 直した所見(2 巡目の低 W-01・W-03・W-04)

- W-01: template の `generate-profile.mjs` で、人の確認の節を「代償措置つきの逸脱」の後(兼務禁止の節の前)へ移し、見出しを「G-6 が省略・未達の構成での人の確認」に改めた。試験(`test-roster-rules.mjs`)の見出しの語も合わせ、ADR-0271 の語も合わせた。221 件が一致
- W-03: `phase5-implementation/pr-workflow.md` の 103 行を「変更ごとの記録が無いことを、PROCESS-PROFILE の節で開示する」へ直した
- W-04: `fix-01.md` V-18 の行を「切り出し(併存時だけ段の判定を続ける)」へ直した
- W-02 は外部の書き込み(#464 へのコメント)のため直していない。push の後に所有者の許しを得て行う

## rebase

- `git rebase origin/main`(3dd96541。束 D3)。55 コミットを載せ直した。衝突は 3 コミット:
  - `evidence-ledger.md`・`implementation-ledger.md`: origin/main の側を採り、後で `evidence:write`・`impl:write`・`scope:write` で再生成
  - `human-ai-boundary.md`(5.8.2 の IMPL-1061 の周り): 束 D3 の IMPL-1061(evidence-aggregation)と本束の IMPL(pr-template)の両方を残した。2 度衝突したが、同じ解き方
- graphify-out は衝突しなかった(`graphify update` は流していない。CI が更新する)

## 番号の付け直し(束 D3 が EV-0367・IMPL-1061 まで使っていた)

| 旧(本束) | 新 |
| --- | --- |
| EV-0365 | EV-0368 |
| EV-0366 | EV-0369 |
| EV-0367 | EV-0370 |
| EV-0368 | EV-0371 |
| IMPL-1061(pr-template) | IMPL-1062 |

- ADR-0271 は origin/main(0270 まで)と重ならない。SRC は足していない
- 直した場所: ADR-0271・human-ai-boundary(5.8.2)・pr-workflow・impl-targets・impl-inventory(IMPL-1062 を足した)と台帳 2 件の再生成。差分の追加行だけを置換した(束 D3 の同番号の行は触れていない)
- research/ の記録の中の番号(旧番)は書き換えていない。この表が対応表である

## 回帰の全量(WSL ubuntu-24.04・node 26.13.1・clone の写し・template は d4-467 の先頭 c8d4e27・`npm ci`)

- 写しの注意: `cp` は全ファイルへ実行権限を付けるため、test-adoption の併合が add/add で衝突する(偽の FAIL。基点 af15a3b でも再現。#447 の先例)。権限を外し、索引が 100755 のものだけ戻して解消した
- 1 回目(通常・TZ=UTC): build が `starlight-links-validator` で落ちた(両方同じ)。原因は本束: ADR-0271 の関係の表の 4 リンク(ADR-0040・0070・0075・0106)の slug が実在しなかった。直し、「前提の表を残す」の行は ADR-0018(assumption-ledger)へ改めた。他の検査は通過
- 2 回目(直した後。全量): 通常 `npm run check` exit 0・FAIL 0・416 頁を build。`TZ=UTC` も exit 0・FAIL 0・416 頁。時計に依る偽の FAIL は出なかった
- 確かめていないこと: push 後の CI。Windows での regress(gh の代役が呼べない。先例のとおり WSL で確かめた)

## template と bundle

- template の先頭: `c8d4e27`(d4-467。直前は 88c2a76)。基点 af15a3b。template の origin/main は af15a3b のまま(d4-467 は fast-forward で入る)
- bundle: `tmp/d4-467-template.bundle`(`d4-467 ^af15a3b`)
- 本体の submodule の参照は c8d4e27

## push の手順

1. `git -C template push origin d4-467:main`
2. 続けて `git push origin HEAD:main`(フラグは付けない)

## 残った点

- W-02(#464 へ IMPL-1062 の旨のコメント)は push の後。所有者の許しが要る
- research/ の記録の旧番号(EV-0365〜0368・IMPL-1061)は上の表で読み替える
