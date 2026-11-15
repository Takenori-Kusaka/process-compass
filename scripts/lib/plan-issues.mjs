// 実装マークの計画の Issue(issue=)の検出の本体(Issue #439 / ADR-0130)。純粋な関数だけを置く。
//
// 検査(npm run check)はオフラインで実行する。ここは GitHub へ問い合わせない。問い合わせは
// scripts/check-impl-plan-issues.mjs が行い、結果をこの関数へ渡す。
// 機械は Issue の状態を変えない(開き直さない・閉じない・編集しない)。コメントと失敗の表示だけを行う。
import { MARK_RE, maskFences } from './impl-inventory.mjs';

/** key=value / key="value を含む文字列" の並びを読む */
export function parseMarkAttrs(text) {
  const attrs = {};
  const re = /(\w+)=(?:"([^"]*)"|(\S+))/g;
  let m;
  while ((m = re.exec(text))) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

/**
 * 1ファイルの本文から、issue= を持つ実装マークを返す。コードブロックと frontmatter の中の見本は数えない。
 * @returns {{id: string, file: string, line: number, issue: number}[]}
 */
export function marksWithIssue(file, text) {
  const { masked } = maskFences(text.split(/\r?\n/));
  const out = [];
  for (let i = 0; i < masked.length; i++) {
    const m = MARK_RE.exec(masked[i]);
    if (!m) continue;
    const attrs = parseMarkAttrs(m[2]);
    if (!/^\d+$/.test(attrs.issue ?? '')) continue;
    out.push({ id: m[1], file, line: i + 1, issue: Number(attrs.issue) });
  }
  return out;
}

/**
 * 計画の Issue が閉じている・実在しない・Issue でない(PR)マークを、番号ごとにまとめて返す。
 * @param marks marksWithIssue の戻り値の連結
 * @param stateOf (番号) => {kind: 'issue'|'pr', state: 'open'|'closed'} | null(実在しない)
 * @returns {{issue: number, reason: 'closed'|'notfound'|'pr', marks: object[]}[]} 番号の昇順
 */
export function planIssueFindings(marks, stateOf) {
  const byIssue = new Map();
  for (const m of marks) {
    if (!byIssue.has(m.issue)) byIssue.set(m.issue, []);
    byIssue.get(m.issue).push(m);
  }
  const out = [];
  for (const [issue, ms] of [...byIssue].sort((a, b) => a[0] - b[0])) {
    const s = stateOf(issue);
    let reason = null;
    if (!s) reason = 'notfound';
    else if (s.kind === 'pr') reason = 'pr';
    else if (s.state === 'closed') reason = 'closed';
    else if (s.state !== 'open') throw new Error(`#${issue} の状態を読めません: ${JSON.stringify(s.state)}`);
    if (reason) out.push({ issue, reason, marks: ms });
  }
  return out;
}

/**
 * 指定した番号を issue= に持つマークを、Issue の状態に依らず番号ごとにまとめる(閉じる前の確認用。オフライン)。
 * @returns {{issue: number, reason: 'named', marks: object[]}[]} 番号の昇順。名指すマークの無い番号は含まない
 */
export function marksNaming(marks, numbers) {
  const want = new Set(numbers);
  const out = [];
  for (const n of [...want].sort((a, b) => a - b)) {
    const ms = marks.filter((m) => m.issue === n);
    if (ms.length) out.push({ issue: n, reason: 'named', marks: ms });
  }
  return out;
}

/** --issue の値(`443` または `443,444`)を番号の配列へ。読めなければ例外 */
export function parseIssueList(text) {
  const parts = String(text).split(',').map((x) => x.trim());
  if (!parts.length || !parts.every((x) => /^\d+$/.test(x))) throw new Error(`--issue の値を読めません: ${text}`);
  return parts.map(Number);
}

/**
 * gh の実行関数 run(args) で番号の状態を問い合わせる。HTTP 404 だけを「実在しない」(null)とし、
 * それ以外の失敗・読めない応答は例外(実行の失敗)にする。偽の合格を作らないため。
 */
export function ghStateOf(run, repo, issue) {
  let out;
  try {
    out = run(['api', `repos/${repo}/issues/${issue}`]);
  } catch (e) {
    if (/\(HTTP 404\)/.test(String(e.stderr ?? e.message))) return null;
    throw e;
  }
  const j = JSON.parse(out);
  if (j.state !== 'open' && j.state !== 'closed') throw new Error(`#${issue} の状態を読めません: ${JSON.stringify(j.state)}`);
  return { kind: j.pull_request ? 'pr' : 'issue', state: j.state };
}

const REASON_TEXT = {
  named: 'を issue= に持つマークがあります(状態は問いません)',
  closed: 'は閉じています',
  notfound: 'は実在しません',
  pr: 'は Issue ではなくプルリクエストです',
};

/** 所見の一覧を、人が読む行へ */
export function renderFindings(findings) {
  const lines = [];
  for (const f of findings) {
    lines.push(`#${f.issue} ${REASON_TEXT[f.reason]}。この番号を issue= に持つマーク:`);
    for (const m of f.marks) lines.push(`  ${m.id} ${m.file}:${m.line}`);
  }
  return lines;
}

/** 同じ所見のコメントを見分ける署名(識別子の集合)。コメント本文に埋めて、繰り返しを避ける */
export function findingSignature(finding) {
  return `impl-plan-issues:${finding.marks.map((m) => m.id).sort().join(',')}`;
}

/** 閉じた Issue へ足すコメントの本文。署名を HTML コメントで含む。責任者・承認者は書かない */
export function commentBody(finding) {
  const rows = finding.marks.map((m) => `- ${m.id}(\`${m.file}:${m.line}\`)`);
  return [
    `<!-- ${findingSignature(finding)} -->`,
    `この Issue は閉じていますが、次の実装マークが \`issue=${finding.issue}\` で担い手として名指しています。マークは降りていない規定として台帳に表示され続けます。`,
    '',
    ...rows,
    '',
    '対処は人が決めます。マークの `issue=` を open の Issue へ付け替えるか、この Issue を開き直してください。機械はこの Issue の状態を変えません。',
    '',
    '規約: [実装マークの規約](https://takenori-kusaka.github.io/process-compass/community/implementation-marking/)',
  ].join('\n');
}

/** 既存のコメントの本文のどれかが同じ署名を持つか */
export function alreadyCommented(commentBodies, finding) {
  const sig = `<!-- ${findingSignature(finding)} -->`;
  return commentBodies.some((b) => typeof b === 'string' && b.includes(sig));
}

/**
 * --closed-from のファイルを読む。1行1件: `番号 [closed|open|notfound|pr]`(状態を省くと closed)。
 * 一覧に無い番号は open の Issue として扱う(オフラインでは状態を知り得ないため、試験の入力に限る)
 */
export function parseClosedFrom(text) {
  const map = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [n, st = 'closed'] = line.split(/\s+/);
    if (!/^\d+$/.test(n) || !['closed', 'open', 'notfound', 'pr'].includes(st)) {
      throw new Error(`--closed-from の行を読めません: ${raw}`);
    }
    map.set(Number(n), st);
  }
  return (issue) => {
    const st = map.get(issue) ?? 'open';
    if (st === 'notfound') return null;
    if (st === 'pr') return { kind: 'pr', state: 'open' };
    return { kind: 'issue', state: st };
  };
}

/**
 * lint:impl の検査(オフライン)。issue= の番号が Issue の一覧の写し(src/data/issue-index.tsv)に在り、
 * 種別が issue であること。状態(開閉)は写しにない。見ない
 * @param index Map<number, {kind: string, title: string}>
 */
export function issueRefProblem(issue, index) {
  const n = Number(issue);
  if (index.size === 0) return 'Issue の一覧の写しが空か、ありません。npm run issues:snapshot で作ります';
  const e = index.get(n);
  if (!e) return `issue=${issue} が Issue の一覧の写しにありません。番号の打ち間違いか、写しが古いです(npm run issues:snapshot)`;
  if (e.kind !== 'issue') return `issue=${issue} は Issue ではなくプルリクエストです。計画の担い手は Issue を名指します`;
  return null;
}
