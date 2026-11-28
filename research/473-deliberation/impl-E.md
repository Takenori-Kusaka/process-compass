# 段 E 実装記録(準拠テンプレート)

template ブランチ `d6-473`、コミット 84b4a86d74e5e7a8dccb4e8d914adafe4676afee(1 コミットに #1〜#6)。退避: `E:/Github/process-compass/tmp/473/template-d6-473-1.bundle`。push していない。

## 直した箇所(文と note だけ。挙動は変えない)

| # | 箇所 | 結果 |
| --- | --- | --- |
| 1 | `scripts/gate/verify-gate-contract.mjs` の canApprove・requiredCheck の拒否の理由 | 済(拒否は保つ) |
| 2 | `CLAUDE.md:116`、`claude-md-resident.json:641` に「準備物で AI のレビューで取り込むと決めた範囲を除く」を足した | 済。:118・:126・「承認と記録しない」は触れない |
| 3 | `.claude/skills/gate/gates/G-6.md` の :20(H.4 条件4 の文)と :24 | 済。:53 は保つ。行番号は目安と異なり、規格の文のある行を grep で選んだ。:11・:76 は該当文でなく触れていない |
| 4 | `.github/workflows/ai-review.yml:6` の注記 | 済。continue-on-error・必須にしない形は保つ |
| 5 | `templates/00-d0-governance.md:512` | 済。「承認として扱いません」は保つ |
| 6 | `CLAUDE.md:46`、`claude-md-resident.json:681`、`implement/SKILL.md:72` | 済。:48・:80 は触れない |

## fixture・試験を変えた箇所

無し。`test-claude-md-resident.mjs:65, 159` の変異の対象(「承認と記録しない」)の文は変えていないため、合わせる必要が無かった。#2 の「減らさない」文と #6 の文を固定する試験は無い。

## 試験の結果

- test-claude-md-resident: 通過
- test-base-judge-workflow: 133/133
- test-deferred-review: 139 件通過(集約の模擬 gh の場面は Windows では省略。変更の影響外)
- verify-gate-contract の専用の試験: 無い(拒否の文を固定する試験は見つからない)
- test-adapter: 120 秒を超え背景実行に回した。流した結果は読んでいない(verify-gate-contract を呼ぶ他の試験: test-adoption・test-edition-end・test-init-g5・test-loosening-decider も未実行)
- 本体 `npm run test:fields`: 通過。`test:impl`・`lint:refs`: 通過

## 本体側で要る直し(本体は直していない)

- `npm run test:template`: 「知識ベースが複製元の YAML と一致しません」。template の文ではなく規則データ側の乖離で、今回の直しに由来しない。`npm run template:kb` が要る可能性(段 F で確認)
- `npm run lint:impl`・`lint:scope`: 台帳が最新でない。別の担当の src の編集に由来。段 F で `impl:write`・`scope:write`
- IMPL-1078(presence。681 の行)は文が変わったので、本体の実装マークの presence の対象文が旧文のままなら段 F で確かめる(lint:impl は台帳の古さで止まるので、再生成後に再確認)

## 残った点

- 足したくなった検査・鍵・スキル・欄は無い
- 上記の未実行の試験(test-adapter ほか)を push の前の全量で確かめる
