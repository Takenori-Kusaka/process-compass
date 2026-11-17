# #339 template 項目の降ろし方(起案、軽、束 B12)

前提: `05-template-items.md`、`04-ruling.md` 末尾の訂正。template は 2f80544(2026-11-17 時点)。コミットしない。

## 確かめたこと(実在の所在)

| 項目 | 実在 |
| --- | --- |
| 次の一手 | 生成部は `template/scripts/gate/next.mjs` の `autonomyNotes()`(1375-1382)。`autonomyNoteLines()`(autonomy.mjs 920-940)を呼ぶ。名前 next-role / next-intake の関数は無い。`/pit` の注記(result.notes。1130)が出口 |
| 保証の開示・期間 | `aggregate-evidence.mjs` 6121-6130 の「AI自律レベル」。`reworkText(t)` を種別ごとに出す。`renderAssurance(external)`(5716)を内部(6432)・外部(6651)・期間(`--period-from`。5515 が前置きを足すだけ)が共有する。期間専用の別の列挙箇所は無い |
| 文言の源 | `autonomy.mjs` `reworkText`(447-462、3つの return、全部 `REWORK_UNCOUNTED` で終わる)と `REWORK_UNCOUNTED`(59-63) |
| D-0 の表 | `scripts/init/generate-profile.mjs` `renderAutonomyTable` 3152。3180 行が `残りは採用者の手段で補う(登録の根拠: ${cell(rework)})`。未記入は 3181 の「未計測」(表示を出さない側) |
| D-0 の様式 節12 | `template/templates/00-d0-governance.md` 338 行「12. 担い手と運用形態」、385 行の箇条「変更種別の登録には、登録の根拠を3点書く」。すでに「機械が確かめるのは検知条件ごとの記入の有無だけであり、内容は登録する者が判定する」を持つ。登録拒否の文(`config.mjs` 2166)も同旨 |
| 照合 | `src/data/template-fields.yaml` が照らすのは見出し・表の列名だけ(「## 表7: 担い手と運用形態」等)。385 行の箇条は欄ではなく照合の対象外。`scripts/check-template-drift.mjs` も箇条の文言は検査しない。よって節12 の文の追加は双方向照合に触れない |
| 記入の有無の判定 | `config.mjs` `missingBasis`(2116)、`isFilledValue`。autonomyState の種別(autonomy.mjs 226・346 の `out.types.push`)は **basis を持たない**。表示のためにここへ持たせる必要がある |
| README | `template/README.md` 192 行(delegation の欄)と 494-500 行(登録の前提の表、`basis.detection` は 498)。観点23 を template は持たない(附属書は降ろさない)ので、標準の語で引く |

## 3問での選択(項目ごと)

1. 結果と証跡まで: 表示は「記入の有無は機械が確かめた。内容は機械で確かめていない」の1文だけ。手順・新しい義務を書かない
2. 例外承認で受けられないか: 受ける対象が無い。新しい条項でなく、既存の検査の範囲の開示である
3. 破られたときの損失: 適合の主張の信頼(記入があるだけで裏づけられていると誤読される)。ゆえに表示は機械の出力へ入れる(a)。説明は手引き(c)

| 項目 | 降ろし方 |
| --- | --- |
| 次の一手・保証の開示・期間の開示 | (a) 機械の出力 + 試験。1か所(`reworkText` の末尾)で4つの出口を同時に覆う |
| D-0 の表(generate-profile) | (a) 生成文の直し + 試験 |
| D-0 節12 の箇条 | (b)/(c) 様式の文。欄ではなく、検査は無し |
| README | (c) 手引き。一文 |
| 採らないこと | 内容の機械検査・確認の記名欄・抜き取りの新設(04-ruling の案 B〜G)。D-0 の節12 へ新しい欄を足さない |

## 実装の案(そのまま作業できる粒度)

### 1. autonomy.mjs

(a) 種別に記入の有無を持たせる。ループ頭(`const registeredAt` の次)で

```js
const detectionFilled = {
  rejectionRate: isFilledValue(t?.basis?.detection?.rejectionRate),
  reworkRate: isFilledValue(t?.basis?.detection?.reworkRate),
};
```

226 行と 346 行の `out.types.push({ ... })` の両方へ `detectionFilled` を足す(`isFilledValue` は import 済み。42 行)。

(b) 定数と関数を足す(`REWORK_UNCOUNTED` の下)。

```js
export const DETECTION_UNVERIFIED = '記入の有無は機械が確かめた。内容は機械で確かめていない';
export function detectionBasisText(type) {
  const f = type?.detectionFilled;
  const names = [f?.rejectionRate && 'rejectionRate', f?.reworkRate && 'reworkRate'].filter(Boolean);
  if (!names.length) return '';
  return `登録の根拠 basis.detection.${names.join('・')}: ${DETECTION_UNVERIFIED}(内容は登録する者が登録の時に判定する。適用中のレベルが計測する手段に裏づけられているかは、標準の内部監査の観点23 が確かめる)`;
}
```

(c) 既存の `reworkText` を `reworkTextBody` に改名(export しない)し、新しい `reworkText` を

```js
export function reworkText(type) {
  const body = reworkTextBody(type);
  const d = detectionBasisText(type);
  return d ? `${body}。${d}` : body;
}
```

これで `autonomyNoteLines`(次の一手の2枝)・`aggregate-evidence.mjs` 6129(内部・外部・期間)が変更なしで表示を出す。信頼性の向上とは称さない(文言に「確かめた」は有無までとだけ書く)。

(d) `REWORK_UNCOUNTED` の2文目を同じ趣旨に直す。現行「採用者が登録の根拠 basis.detection.reworkRate に書いた手段で補い、内部監査で確かめる。」を

「採用者が登録の根拠 basis.detection.reworkRate に書いた手段で補う。その手段の内容は機械で確かめていない(内部監査で確かめる)。」

へ。重複を避けるため `detectionBasisText` の括弧は上の案のままでよい(両方が並んでも矛盾しない)。

### 2. generate-profile.mjs 3180 行

```js
? `${reworkAlgo}。残りは採用者の手段で補う(登録の根拠: ${cell(rework)}。${DETECTION_UNVERIFIED})`
```

`DETECTION_UNVERIFIED` は autonomy.mjs から import(generate-profile.mjs が autonomy.mjs を import 済みか確かめる。無ければ `autonomyCap` の import 元に足す。循環があれば同じ文字列を直書きし、試験で両者の一致を確かめる)。未記入の分岐(3181)には出さない。

### 3. 00-d0-governance.md 385 行

末尾の「(標準 第5章 5.5.4)」の前に次を足す。「内容は機械で確かめていない。準拠テンプレートは、次の一手・保証の開示(期間ごとの開示を含む)・下の表に、記入の有無は機械が確かめた旨と、内容は機械で確かめていない旨を出す。適用中のレベルが計測する手段に裏づけられているかは、標準の内部監査(附属書H H.3 の観点23)が確かめる」。同じ行の末尾(手戻り率の箇条)の「(採用者の手段で補う)」は変えない。textlint(箇条は体言止め/である調)を通す。D-0 の生成区間(PROCESS-PROFILE.md の節12 の表)はコードから出るので別編集は無い。

### 4. README.md

498 行(`basis.detection` の行)の説明文末に1文を足す、または 494-500 の表の直後に1文。文言案:

「機械が確かめるのは登録の根拠の記入の有無までです。内容は、登録する者が登録の時に判定します。適用中のレベルが計測する手段に裏づけられているかは、標準の内部監査の観点23(附属書H H.3)が確かめます。次の一手・保証の開示・D-0 の表には、内容は機械で確かめていない旨が出ます。」

席の責任者は担い手に含めない(04-ruling 訂正)。AI を主語にしない。

### 5. 試験(`scripts/gate/test-check-delegation.mjs`。新しい試験ファイルは作らない)

既存の型(`check(名前, 真偽)`、`base()` / `mk()`、`autonomyState(cfg, records)`)で、521-524 行の近くに足す。目印は試験の行に置く(IMPL-0983:ok / IMPL-0983:ng を別の行に)。

- ok(適合): `base()` の種別(rejectionRate・reworkRate とも記入あり)で次の4つが `DETECTION_UNVERIFIED` を含む: `reworkText(t)`、`autonomyNoteLines(state)` の連結(停止なしの枝)、停止ありの枝(`mk({ doubles: 7 })`)、`renderAutonomyTable(cfg).join('\n')`。あわせて、`aggregate-evidence.mjs` の本文に `reworkText(t)` を保証の開示の行で呼ぶ箇所が実在することを文字列で確かめる(期間・外部は `renderAssurance` 共有。これは期間の実走ではない。下の限界)
- ng(違反側): reworkRate だけを `delete` した構成(269-272 行と同じ作り方)で、(i) `renderAutonomyTable` が `DETECTION_UNVERIFIED` を含まない(「未計測」で L1)、(ii) `reworkText` が `reworkRate` を名指しせず、rejectionRate だけ名指す、(iii) 構成の検証(既存の 74-75 行の `登録の根拠の detection の検知条件が1つ欠ける`、条件2 で拒否)が引き続き拒否する。拒否の確認は既存行の参照で足りるが、IMPL-0983:ng の目印は(i)の行に付ける
- 文言: `REWORK_UNCOUNTED` が「内容は機械で確かめていない」を含む
- 走らせ方: `cd template && TZ=UTC node scripts/gate/test-check-delegation.mjs`(node 26.13.0 で現状 68 場面が全部通ることを確認済み。末尾の「期待と一致しました」で判定)。`test-assurance-period.mjs` は足場に changeTypes が無く、表示の実走は届かないので、変えない。CI は `.github/workflows/gate-g5.yml:99` と `g5-local.mjs:59` が結線済み(新しい結線は不要)

限界(開示する): 期間の出力での実走は試験しない(出口は共有の関数で、文字列の結線だけ確かめる)。表示の文言が内容の確認を促す効果は未検証(EV-0279 が開示済み)。

### 6. 本文側の IMPL-0983 の変え方(議長の作業、template の取り込みの後)

`src/content/docs/phase4-process-design/human-ai-boundary.md` 521 行を

```
<!-- impl IMPL-0983 target=autonomy-derivation state=delivered check=machine test=template/scripts/gate/test-check-delegation.mjs note="登録の根拠の記入が「内容は機械で確かめていない」ことの表示。次の一手・期間ごとの保証の開示・D-0 の節12 の表に出す。README の一文と D-0 の様式 節12 の文は手引きで、機械の検査ではない。信頼性の向上とは称さない(誤読を減らす表示である)" -->
```

へ(`plan`・`issue`・`review` と「確かめる者:」を外す)。README の一文は機械で閉じないが、`check=machine` は表示の機械の部分に限ると note に書いたので足りる。続けて `npm run impl:write` で台帳(`community/implementation-ledger.md`)を再生成し、`npm run check`。template のコミットは bundle へ退避してから、submodule の参照を進める。Issue #339 を閉じる前に `npm run impl:issues -- --issue 339` が 0 件であることを確かめる。`src/data/impl-inventory.yaml` 3239・3240 行の note は IMPL-0983 を「記入の内容は機械で確かめていない旨の表示」と指すので、変更不要。

## 残る判断(議長へ)

- `reworkText` 内に入れる(1か所で4出口)案を採った。代わりに autonomyNoteLines と保証の開示の双方へ別々に足す案は、片方の落ちを生むため不採用
- 外部へ渡す開示(`assurance-disclosure.external.md`)にも同じ文が出る。内容を外へ出さない文なので支障は無いと見るが、独立の突合で確認を請う
- 差し戻し率の欄(D-0 の表)は basis を表示していないので、その欄には足さない(足すと新しい表示の義務になる)
