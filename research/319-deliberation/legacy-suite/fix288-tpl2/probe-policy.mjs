import fs from 'node:fs';
import { pathToFileURL } from 'node:url'; const { readPolicy } = await import(pathToFileURL(process.cwd() + '/scripts/gate/org-assurance.mjs').href);
const cfg = JSON.parse(fs.readFileSync('process.config.json','utf8'));
const text = `# 品質保証の方針と受容の基準

| 項目 | 値 |
| --- | --- |
| 版 | v1.0 |
| 記名(トップマネジメント) | 山田 太郎 |
| 記名日 | 2026-09-01 |

## 1. 保証の相手と範囲の方針

| 項目 | 記載 |
| --- | --- |
| 保証の相手 | 社内利用者 |
| 組織として品質を保証する対象 | 基幹業務システム |

## 2. 受容しない条件

- 個人データに当たる未達

## 3. 外枠

| 区分 | 適用されるもの |
| --- | --- |
| 法令 | 個人情報保護法 |

## 4. 受容の権限の段階

| 受容の対象 | 受容できる水準 | 受容者(役割) | 受容の期限 |
| --- | --- | --- | --- |
| 品質の残存リスク(保証の開示の項目5) | R3 | 事業決裁者 | — |
| AI の利用の縮小・停止(組織全体) | | | — |
| 有事の決定: 重大事故(停止・切替・顧客説明) | | | — |
| 有事の決定: 情報漏えい(停止・切替・顧客説明) | | | — |

## 5. 上申先

| 上申の種類 | 届け先(役割) |
| --- | --- |
| 出荷判定者の異議を退けた受容の届け先 | 社長 |
`;
const p = readPolicy(cfg, { text, today: '2026-10-03' });
console.log(JSON.stringify({ valid: p.valid, problems: p.problems, tolerance: p.tolerance }, null, 1));
