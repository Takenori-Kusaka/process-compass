#!/usr/bin/env node
// Issue の一覧の写しを作る(#319 §8 X-1 / ADR-0089)。
//
//   node scripts/issues-snapshot.mjs   (npm run issues:snapshot)
//
// 決定の識別子の検査(scripts/lib/decision-refs.mjs)は、#NNN の実在を、版管理の下の写し src/data/issue-index.tsv で確かめる。
// 本文や調査メモに番号が書かれていることでは代えない。検査そのものは GitHub へ問い合わせない(オフラインで同じ結果を出す)。
// 写しは gh の REST(repos/{owner}/{repo}/issues)から作り、番号・種別(issue / pr)・題を番号の順に書く。状態は書かない
// (閉じた Issue も決定の経緯として引けるため。状態の変化で写しの差分を出さないため)。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { ISSUE_INDEX } from './lib/decision-refs.mjs';

const REPO = process.env.ISSUES_REPO ?? 'Takenori-Kusaka/process-compass';
const rows = new Map();
for (let page = 1; page < 100; page++) {
  const out = execFileSync('gh', ['api', `repos/${REPO}/issues?state=all&per_page=100&page=${page}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const list = JSON.parse(out);
  if (!list.length) break;
  for (const i of list) rows.set(i.number, `${i.number}\t${i.pull_request ? 'pr' : 'issue'}\t${String(i.title).replace(/[\t\n\r]+/g, ' ')}`);
}
if (!rows.size) {
  console.error('issues-snapshot: 一覧が空でした。写しを書き換えません');
  process.exit(1);
}
const header = `# Issue の一覧の写し(生成物。手で編集しない。npm run issues:snapshot)。${REPO}。番号\t種別\t題\n`;
fs.writeFileSync(ISSUE_INDEX, header + [...rows.keys()].sort((a, b) => a - b).map((n) => rows.get(n)).join('\n') + '\n');
console.log(`issues-snapshot: ${rows.size} 件を ${ISSUE_INDEX} へ書いた`);
