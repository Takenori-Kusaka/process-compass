# #319 決定を固定する回帰の fixture を、リポジトリの検査へ入れる

- 出どころ: #302〜#310 の審議(`research/302-310-deliberation/decision.md`「議題に無く、会議体が見つけた論点」、`implementation-A.md` 3、`implementation-C.md` 3)。品質保証 A 5節 6、擁護者 A 5節 (1)
- 見つかったこと(Issue の本文):
  - 過去の決定を固定する回帰スイートが `tmp/fix288-tpl2/suite/` にあり、`.gitignore`(`tmp/`)の対象で、履歴にも CI にも入っていない。#302〜#310 では担当が複製で流し、fixture を複製の中で直した(`tmp/302-310/implA/suite-A`)。元のスイートは古いままで、いま流すと落ちる
  - `unit.mjs` は古い複製を絶対パス(`tmp/impl288-tpl/tpl/`)で読む。いまのテンプレートを試験しない
  - scenarios の 1 件(「過去の記録は変わらず、未記入の通知が無くなる」)と replay の 15 件は、変更の前から落ちている。原因は未調査(`tmp/fix288-tpl2/reg10/` でも同じ件数)
  - `BASIS` を使うほかのスイート(r3 の `scen*.mjs` など)は流していない
  - 「採らない」と決めた文を `template/` で検索する手順が反映の作業に無い。廃した言い回しの登録簿(当時 20 句)はその一部を担う
- 決めること: どの場面をリポジトリの試験へ移すか / 前から落ちている 16 件の原因 / 時計に依存する場面の扱い
- **新しい事実(議長が確かめた)**: クラウドの作業環境には `tmp/` が無い(`.gitignore`)。スイートは利用者の端末(`E:\Github\process-compass\tmp\`)にだけ残っていた。議長がフォルダの許可を得て読み出し、作業用に `tmp/legacy/`(git の外)と `/mnt/project-files/backup/legacy-suite-319/` へ置いた。消えうる場所にあるという擁護者の懸念が、実際に起きかけていた
  - `tmp/legacy/fix288-tpl2/suite/`: 元のスイート(23 本 + `w/` の json)。`runsuite.sh`・`runall2.sh`・`mockgh.mjs`・`fakebin/gh`・`sync.sh`・`patch-*.cjs`・ログ
  - `tmp/legacy/302-310/implA/`: 組A が直した複製 `suite-A/`(差分のあるファイルだけ: fresh.sh・lib.mjs・unit.mjs・v3.mjs)、`fix-suite.py`(直しの手順)、`tpl2-setup.sh`、`tpl2-base/`
  - `tmp/legacy/302-310/implC/tpl2-new/suite/`: 組C が直した `fresh.sh`・`lib.mjs`(BASIS)・`unit.mjs`(相対パス)
  - `tmp/legacy/fix288-r3/`: r3 の `scen.mjs`・`scen2.mjs`・`scen3.mjs`・`setup.mjs`・`trial.mjs`・`mockgh.mjs`
- 既にリポジトリにある試験: `scripts/test-tailoring-engine.mjs`、`template/scripts/gate/test-*.mjs`(gate-g5.yml が列挙)、`npm run check`(`package.json` が正本)
