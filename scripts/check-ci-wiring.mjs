// CI の結線を検査する(Issue #293 裁定 J-1 / ADR-0077)。
//
//   node scripts/check-ci-wiring.mjs   (npm run lint:ci)
//
// 検査の一覧の正本は package.json の check です。ここでは .github/workflows/ を読み、
// 次を確かめます。条件の本体と試験は scripts/lib/ci-wiring.mjs・scripts/test-check-ci-wiring.mjs にあります。
//   1. ci.yml の契機に pull_request と、main への push がある
//   2. ジョブ check に、run がちょうど npm run check の手順がある。その手順にもジョブにも if・continue-on-error が無い
//   3. ジョブ check が template のサブモジュールを取得する
//   4. Pages へ配備するジョブと dist/standard へ書くジョブは ci.yml にあり、needs に check を含み、main への push に限る
//   5. 全ワークフローが最上位に permissions を明示し、最上位で書き込みを与えない
//   6. dist/standard へ書くジョブが environment を持つ
//
// 確かめないこと: 説明の文書(CLAUDE.md・README など)の散文の列挙(課さないと決めた)、
// GitHub 側の設定(Environment の保護・ルールセット・deploy key)。後者は管理者が行い、
// community/project-management.md「公開と配布の経路」に手順と止まらない経路を書く。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { checkWiring, renderProblems } from './lib/ci-wiring.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, '.github/workflows');

const workflows = fs
  .readdirSync(DIR)
  .filter((f) => /\.ya?ml$/.test(f))
  .sort()
  .map((file) => ({ file, doc: YAML.parse(fs.readFileSync(path.join(DIR, file), 'utf8')) }));

const problems = checkWiring(workflows);
if (problems.length) {
  console.error(renderProblems(problems));
  process.exit(1);
}
console.log(`CI の結線: ${workflows.length} ワークフローを検査(ci.yml が npm run check を合否に使い、公開と配布はその通過の後)`);
