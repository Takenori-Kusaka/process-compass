# 束 B30 受付(2026-11-20)

束 B29 の続き。#356・#348・#441・#450 の残りを扱う。引き継ぎは `research/b29-deliberation/90-handoff.md`。

## 審議の重さ

- 4件とも束 B27 で「軽」と決め、裁定を終えている(`research/b27-deliberation/31-chair-356.md`・`31-chair-348-441-450.md`)。本束では審議をやり直さない。裁定の実装の残りと、独立の突合(2巡まで)を行う
- 所有者の方針(2026-11-16)の3つの問いは、裁定(`30-ruling-356.md` §1、`30-ruling-348-441-450.md` §1)が答えている。本束で新しい条項は足さない

## 待つもの

残りはどれも template の `scripts/gate/aggregate-evidence.mjs`・`config.mjs`・`check-pr.mjs` とその試験に掛かる。束 B28(U4a・U4b・U5)の push を指揮役が知らせるまで、これらを触らない。

## 単位の順(束 B28 の push の後。template を触るため直列)

| 単位 | 中身 | 裁定の所在 |
| --- | --- | --- |
| Z1 | #356 単位 Y の全部(IMPL-1011 の cause、IMPL-0191 の check-pr、IMPL-1003 の行、notice.md、README、`seeded-error-scan.mjs` の冒頭のコメント) | `30-ruling-356.md` §3.2、`51-chair-x-r1.md` #356 R1-3 |
| Z2 | IMPL-1006(method)。`autonomy.mjs` の stop の文と README へ「と決め方」を戻す。`config.mjs` のコメントの「発火しない」 | `30-ruling-348-441-450.md` §3.2 項2、`55-chair-y12-r1.md` 所見1 |
| Z3 | IMPL-0268(一発承認率) | 同 §3.2 項4 |
| Z4 | 集約の側: トレーラの読み方と移行の件数(項5)、IMPL-0645 の1行(項6)、欠陥の台帳の登録外の ID の表示 | 同 §3.2 項5・6、§1.6、`55-chair-y12-r1.md` 所見7 |
| Z5 | README の残り、本体のマークの改め(#356 §2.1・§2.2・§2.4・§2.5、#348 ほか §2.2〜§2.5)、台帳の再生成 | 同 §3.2 項7、`51-chair-x-r1.md` #348 R1-7 |

その後、独立の突合(1巡目は全体、2巡目は直した差分)、直し、push の準備(回帰の全量は1回)。

## 待つ間に済ませたこと

- #361 へ受け入れ条件3つをコメントで足した(裁定 §2.6 の2件分。<https://github.com/Takenori-Kusaka/process-compass/issues/361#issuecomment-7028484256>)。#452 へは寄せない
