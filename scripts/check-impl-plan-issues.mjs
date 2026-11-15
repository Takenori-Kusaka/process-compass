#!/usr/bin/env node
// 実装マークの issue= が、閉じた Issue・実在しない番号・PR を名指していないかを確かめる(Issue #439 / ADR-0131)。
//
//   node scripts/check-impl-plan-issues.mjs                       (npm run impl:issues)  gh で番号の状態を問い合わせる
//   node scripts/check-impl-plan-issues.mjs --closed-from <file>  番号の状態を <file> から読む(試験・オフラインの再現)
//   node scripts/check-impl-plan-issues.mjs --issue <番号[,番号]>  その番号を issue= に持つマークを、状態に依らず列挙する。
//                                                             閉じる前の確認(オフライン。gh を使わない。1 件以上で終了コード 1)
//   node scripts/check-impl-plan-issues.mjs --emit <file>         所見を JSON で書く(ワークフローが使う)
//   node scripts/check-impl-plan-issues.mjs --comment <file>      --emit の JSON を読み、閉じた Issue へコメントする
//
// npm run check には入れない(検査はオフラインで実行し、Issue の状態を知り得ないため。ADR-0084・ADR-0089)。
// 未知の引数・余った引数・値の欠けた旗・重複は使い方を出して終了コード 2(書き損ねで別の確認へ落とさない)。--issue=<番号> の形も受ける。
// 終了コード: 0 = 所見なし / 1 = 所見あり / 2 = 実行の失敗。
// 機械は Issue の状態を変えない(開き直さない・閉じない・編集しない)。コメントと失敗の表示だけを行う。
// 同じ所見(識別子の集合が同じ)のコメントが既にあれば、足さない。
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  marksWithIssue,
  planIssueFindings,
  renderFindings,
  commentBody,
  alreadyCommented,
  parseClosedFrom,
  marksNaming,
  parseIssueList,
  ghStateOf as ghStateOfWith,
} from './lib/plan-issues.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = process.env.IMPL_DOCS_DIR ?? path.join(ROOT, 'src/content/docs'); // IMPL_DOCS_DIR は試験用
const REPO = process.env.ISSUES_REPO ?? 'Takenori-Kusaka/process-compass';
const LEDGER = path.join('community', 'implementation-ledger.md');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.mdx?$/.test(name)) yield p;
  }
}

const USAGE = '使い方: [--closed-from <file>] [--issue <番号[,番号]>] [--emit <file>] [--comment <file>](--issue=<番号> の形も可)';
const KNOWN_FLAGS = ['--closed-from', '--issue', '--emit', '--comment'];

/** 引数を厳密に読む。未知の引数・余った引数・値の欠けた旗は使い方を出して exit 2(書き損ねで別の確認へ落ちないため) */
function parseArgs(argv) {
  const out = new Map();
  for (let i = 0; i < argv.length; i++) {
    let flag = argv[i];
    let value = null;
    const eq = flag.indexOf('=');
    if (flag.startsWith('--') && eq > 0) {
      value = flag.slice(eq + 1);
      flag = flag.slice(0, eq);
    }
    if (!KNOWN_FLAGS.includes(flag)) {
      console.error(`知らない引数、または余った引数です: ${argv[i]}
${USAGE}`);
      process.exit(2);
    }
    if (value === null) {
      value = argv[i + 1];
      i++;
    }
    if (!value || value.startsWith('--')) {
      console.error(`${flag} に値がありません
${USAGE}`);
      process.exit(2);
    }
    if (out.has(flag)) {
      console.error(`${flag} が重複しています
${USAGE}`);
      process.exit(2);
    }
    out.set(flag, value);
  }
  return out;
}

let ARGS = new Map();
const argValue = (flag) => ARGS.get(flag) ?? null;

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** gh で番号の状態を問い合わせる。HTTP 404 は実在しない。それ以外の失敗は実行の失敗 */
const ghStateOf = (issue) => ghStateOfWith(gh, REPO, issue);

function main() {
  ARGS = parseArgs(process.argv.slice(2));
  const commentFile = argValue('--comment');
  if (commentFile) {
    const findings = JSON.parse(readFileSync(commentFile, 'utf8'));
    for (const f of findings) {
      // コメントするのは閉じた Issue だけ。実在しない番号・PR は失敗の表示だけ
      if (f.reason !== 'closed') continue;
      const existing = JSON.parse(gh(['api', '--paginate', '--slurp', `repos/${REPO}/issues/${f.issue}/comments`])).flat();
      if (alreadyCommented(existing.map((c) => c.body), f)) {
        console.log(`#${f.issue}: 同じ所見のコメントが既にあります。足しません`);
        continue;
      }
      gh(['issue', 'comment', String(f.issue), '--repo', REPO, '--body', commentBody(f)]);
      console.log(`#${f.issue}: コメントを足しました`);
    }
    return 0;
  }

  const marks = [];
  for (const file of walk(DOCS)) {
    const rel = path.relative(DOCS, file).split(path.sep).join('/');
    if (rel === LEDGER.split(path.sep).join('/')) continue; // 台帳は生成物
    marks.push(...marksWithIssue(rel, readFileSync(file, 'utf8')));
  }
  if (marks.length === 0) {
    console.error('issue= を持つ実装マークが 1 件も見つかりません(置き場か書式の誤りです)。検出できないため失敗とします');
    return 2;
  }
  const issueArg = argValue('--issue');
  if (issueArg) {
    const named = marksNaming(marks, parseIssueList(issueArg));
    if (named.length === 0) {
      console.log(`#${issueArg} を issue= に持つマークは 0 件です。閉じてよい(付け替え済み)`);
      return 0;
    }
    console.error('この Issue を担い手として名指すマークが残っています。閉じる前に付け替えてください:\n');
    for (const l of renderFindings(named)) console.error(l);
    console.error('\n対処: issue= を open の Issue へ付け替える(寄せ先へ受け入れ条件の案をコメントで足す)。');
    return 1;
  }
  const closedFrom = argValue('--closed-from');
  const stateOf = closedFrom ? parseClosedFrom(readFileSync(closedFrom, 'utf8')) : memo(ghStateOf);
  const findings = planIssueFindings(marks, stateOf);

  const emit = argValue('--emit');
  if (emit) writeFileSync(emit, JSON.stringify(findings, null, 2));
  console.log(`issue= を持つ実装マーク: ${marks.length}件(番号 ${new Set(marks.map((m) => m.issue)).size}件)`);
  if (findings.length === 0) {
    console.log('計画の Issue は、すべて open の Issue です');
    return 0;
  }
  console.error('計画の Issue が open の Issue ではないマークがあります:\n');
  for (const l of renderFindings(findings)) console.error(l);
  console.error('\n対処: issue= を open の Issue へ付け替える(寄せ先へ受け入れ条件の案をコメントで足す)か、Issue を開き直す。');
  console.error('規約: community/implementation-marking.md');
  return 1;
}

function memo(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}

try {
  process.exit(main());
} catch (e) {
  console.error(`実行に失敗しました: ${e.message}`);
  process.exit(2);
}
