# B18 の B15 上への rebase(1回目)

## 結果

- 本体: origin/main = bb421d43(B15 の取り込み後、作業中にさらに進んだ)の上へ 18 コミット。
- template: origin/main = 9ab110b の上へ 4 コミット(b18-328 の先頭 172bfa3)。
- bundle: `E:/Github/process-compass/tmp/bundles/template-b18-rebased-01.bundle`(verify 済み)。

## 衝突と解き方

### template

- `scripts/vendor/tailoring-kb.json`: 5 コミット中 2 回衝突。upstream 側を取って続け、最後に本体で `npm run template:kb` を流し、再生成の差分を 172bfa3 でコミットした。
- #328 の 5 コミットのうち 2 つは rebase で内容が upstream に既にあり、消えた(残ったのは #445 の 2、#325 の 1、再生成の 1)。

### 本体

- `template`(submodule の参照): 複数のコミットで衝突。そのつど b18-328 の先頭を指す形で `git add template` した。
- `src/content/docs/community/evidence-ledger.md`・`implementation-ledger.md`: ours(upstream)を取って続け、最後に `impl:write`・`evidence:write`・`scope:write` で再生成した。
- graphify-out: 衝突しなかった。
- 衝突マーカーの残りは無し。

## 番号の重なり

- **EV-0322 が重複**: `phase4-process-design/human-ai-boundary.md:358`(B15 側)と `adr/0200-b18-first-group-adopter-record-conventions.md:48`(B18 側)。`lint:evidence` が失敗する。付け直しは push の直前に別の担当が行う。
- IMPL の重複は `lint:impl` に出ていない。

## 検査

| 検査 | 結果 |
|---|---|
| test:template | 通過 |
| test:engine | 通過 |
| lint:impl | 通過(降りていない IMPL-1023〜1025 は表示のみ) |
| lint:refs | 失敗の表示なし(出力末尾は通過) |
| lint:evidence | **失敗**: EV-0322 の重複のみ |
| test:fields | 通過(11 件一致) |
| template の test-check-pr(239 場面、約 3.5 分) | 通過 |
| template の test-roster-ids・test-roster-rules | 通過 |
| template の test-roster-conditions | 未確認(120 秒で背景へ移り、結果を読んでいない) |

## 先頭の SHA

- 本体: この記録のコミットで確定する(直前は 816863e7 の後ろ)。`git rev-parse HEAD` を参照。
- template: 172bfa3
