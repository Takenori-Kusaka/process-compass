# #339 template 項目 議長の裁定の案(軽、束 B12)

前の段: 起案 `b12-01-drafter.md`、反対 `b12-02-opponent.md`。2委員は骨格で一致し、差は反-1〜反-4。新しい義務・ADR の原則の変更・安全に当たる点は無いので軽のまま。template は 2f80544 を起点にする。

## 裁定

起案の骨格を採り、反-1〜反-4 を採る。

| 項目(Issue のコメント) | 採否 | 降ろし方 |
| --- | --- | --- |
| 次の一手・保証の開示・期間の開示 | 採る | (a) `reworkText` の末尾の1か所に付ける。4つの出口(次の一手の2枝・内部・外部・期間)が共有する |
| D-0 の表(renderAutonomyTable)と `REWORK_UNCOUNTED` の文言 | 採る | (a) 生成文の直し + 試験 |
| D-0 の様式 節12 | 採る | (c) 箇条の文(欄は足さない。照合の対象外) |
| 試験 | 採る | `test-check-delegation.mjs` に ok/ng の対(反-2 の置き方) |
| README | 採る | (c) 一文 |
| 外部の開示 | 同じ文を出す | 内外で文を分けない(反-3 の文言) |

## 実装の指示(template/。コミットのたびに bundle へ退避する)

### 1. `scripts/gate/config.mjs` — 判定を1つにする(反-1)

- `missingBasis`(2116)の detection の判定を、次の export する関数へ切り出し、`missingBasis` もこれを使う(挙動は変えない)

```js
/** 登録の根拠の detection のうち、記入のある検知条件のキー(登録の検査と表示が同じ判定を使う) */
export function detectionFilled(basis) {
  const d = basis?.detection;
  if (d === null || typeof d !== 'object' || Array.isArray(d)) return [];
  return CHANGE_TYPE_DETECTION.map(([k]) => k).filter((k) => typeof d[k] === 'string' && isFilledValue(d[k]));
}
```

- `missingBasis` の else 枝は「`CHANGE_TYPE_DETECTION` のうち `detectionFilled(basis)` に無いもの」を push する形にする

### 2. `scripts/gate/autonomy.mjs`

- import に `detectionFilled`・`CHANGE_TYPE_DETECTION` を足す(42 行の config.mjs の import)
- 226 行と 346 行の `out.types.push({...})` の両方に `detectionFilled: detectionFilled(t?.basis)` を足す
- `REWORK_UNCOUNTED` の下に次を足す

```js
export const DETECTION_UNVERIFIED = '記入の有無は機械が確かめた。内容は機械で確かめていない';
/** 登録の根拠の記入の表示。記入のある検知条件だけを名指す。内容の確認の結果を含まないことを内外とも同じ文で出す */
export function detectionBasisText(type) {
  const keys = type?.detectionFilled ?? [];
  if (!keys.length) return '';
  const names = CHANGE_TYPE_DETECTION.filter(([k]) => keys.includes(k)).map(([k, label]) => `${label} ${k}`).join('・');
  return `登録の根拠(basis.detection の算出の所在: ${names}): ${DETECTION_UNVERIFIED}。内容は登録する者が登録の時に判定する。適用中のレベルが計測する手段に裏づけられているかの確認は標準の内部監査の観点23 に委ね、この出力はその結果を含まない`;
}
```

- 既存の `reworkText` を `reworkTextBody`(export しない)へ改名し、新しい `reworkText(type)` は `body` と `detectionBasisText(type)` を「。」で繋ぐ(空なら `body` だけ)。`external` の引数は足さない
- `REWORK_UNCOUNTED` の2文目を「採用者が登録の根拠 basis.detection.reworkRate に書いた手段で補う。その手段の内容は機械で確かめていない(内部監査で確かめる)。」へ

### 3. `scripts/init/generate-profile.mjs`

- import(43 行)に `DETECTION_UNVERIFIED` を、config.mjs の import に `detectionFilled` を足す
- 3169-3171: `reworkMeasured` を `detectionFilled(t.basis).includes('reworkRate')` に変える(反-1。登録の検査と同じ判定)
- 3180: `${reworkAlgo}。残りは採用者の手段で補う(登録の根拠: ${cell(rework)}。${DETECTION_UNVERIFIED})`。未記入の枝(3181)と差し戻し率の欄は変えない

### 4. `templates/00-d0-governance.md` 385 行

末尾の「(標準 第5章 5.5.4)」の前に、である調で次を足す: 「準拠テンプレートは、次の一手・保証の開示(期間ごとの開示と外部向けの開示を含む)・下の表に、記入の有無は機械が確かめた旨と内容は機械で確かめていない旨を出す。適用中のレベルが計測する手段に裏づけられているかは、標準の内部監査(附属書H H.3 の観点23)が確かめる」。textlint を通す

### 5. `README.md` 494-500 の表の直後に一文

「機械が確かめるのは登録の根拠の記入の有無までです。内容は、登録する者が登録の時に判定します。適用中のレベルが計測する手段に裏づけられているかは、標準の内部監査の観点23(附属書H H.3)が確かめます。次の一手・保証の開示(外部向けを含む)・D-0 の表には、内容は機械で確かめていない旨が出ます。」(AI を主語にしない。席の責任者を担い手に含めない)

### 6. 試験 `scripts/gate/test-check-delegation.mjs`(新しいファイルは作らない)

521-524 行の近くに足す。import に `DETECTION_UNVERIFIED`・`detectionBasisText` を足す。

- `// IMPL-0983:ok` の行: `base()` の構成で、`reworkText(tOf(base()))`、`autonomyNoteLines` の停止なしの枝と停止ありの枝(`mk({ doubles: 7 })`)、`renderAutonomyTable(base().config)` の4つが `DETECTION_UNVERIFIED` と「この出力はその結果を含まない」(表は前者だけ)を含み、`reworkText` が `REWORK_UNCOUNTED` も含む
- `// IMPL-0983:ng` の行(別の行): reworkRate を `delete` した構成で、(i) `judgeDelegatedMerge` が条件2 で拒否し、(ii) `reworkText` が reworkRate を名指さない、(iii) `renderAutonomyTable` が `DETECTION_UNVERIFIED` を含まない、を1つの check で確かめる
- 判定の一致: reworkRate を数値 `1` にした構成で、`judgeDelegatedMerge` が条件2 で拒否し、かつ `renderAutonomyTable` が「未計測」と出す(反-1 の回帰)
- 文言: `REWORK_UNCOUNTED` が「内容は機械で確かめていない」を含む。`aggregate-evidence.mjs` の本文に `reworkText(t)` を保証の開示の行で呼ぶ箇所があることを文字列で確かめる
- 走らせ方: `cd template && TZ=UTC node scripts/gate/test-check-delegation.mjs`(node 26)。登録の検査を直接試す試験はこのファイルだけ(74-75 行。`missingBasis` を切り出しても挙動が変わらないことはここで確かめる)。あわせて `test-assurance-period.mjs` を流す。CI の結線は既存(`gate-g5.yml:99`)

限界(開示する): 期間ごとの出力の実走は試験しない(共有の関数と文字列の結線だけ)。表示が内容の確認を促す効果は未検証(EV-0279)。

## 本文側(議長。template の取り込みの後)

`human-ai-boundary.md` 521 行の IMPL-0983 を次へ。`plan`・`issue`・`review`・「確かめる者:」を外す。

```
<!-- impl IMPL-0983 target=autonomy-derivation state=delivered check=machine test=template/scripts/gate/test-check-delegation.mjs note="登録の根拠の記入が「内容は機械で確かめていない」ことの表示。次の一手・期間ごとの保証の開示(外部向けを含む)・D-0 の節12 の表に、記入の有無は機械が確かめた旨(登録の検査と同じ判定)と、内容は機械で確かめていない旨・内部監査の結果を含まない旨を出す。README の一文と D-0 の様式 節12 の文は手引きで、機械の検査ではない。信頼性の向上とは称さない(誤読を減らす表示である)" -->
```

続けて `npm run impl:write`、`npm run check`、`npm run impl:issues -- --issue 339` が 0 件であることを確かめてから Issue を閉じる。`impl-inventory.yaml` 3239-3240 は変えない。

## 採らない案

| 案 | 理由 |
| --- | --- |
| 次の一手と保証の開示へ別々に足す | 片方の落ちを生む |
| 外部の開示では文を出さない・別の文にする | 外の読者だけが誤読し得る。文は内容を出さない。分けると片方の落ちを生む |
| `isFilledValue` だけで表示の判定をする(起案) | 登録の検査(文字列であること)と判定がずれ、「機械が確かめた」が実態と食い違う |
| 未記入で表示が出ないことに `:ng` を付ける(起案) | `:ng` は違反の入力の検出に付ける規約。検出は登録の拒否である |
| 差し戻し率の欄・節12 へ新しい欄を足す | 新しい表示・記入の義務になる。差し戻し率は準拠テンプレートが集計し、記入の内容に依らない |
| 内容の機械検査・確認の記名欄・抜き取りの新設 | 04-ruling の案 B〜G のとおり |

## 所有者へ上げる点

無し。
