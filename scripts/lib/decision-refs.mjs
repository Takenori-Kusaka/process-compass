// 決定の識別子(ADR の決定・K 番号・標準の条項・Issue)の実在の検査(#319 裁定 R-1.4・R-4・R-5、§8 X-1 / ADR-0089)。
//
// 回帰の試験の fixes・changed・knownFailure(scripts/regress/check-fixes.mjs・run.mjs)と、
// 廃した言い回しの登録簿の by(scripts/check-provisions.mjs)が使う。
//
// 実在の確かめ方(識別子の形ごと):
//   - ADR-NNNN        src/content/docs/adr/NNNN-*.md がある
//   - ADR-NNNN 決定N  そのうえで、その ADR の「## 決定」の節に見出し「### N.」(または「### 決定N:」)がある。
//                     本文の中の他の ADR の決定の引用(「書式(決定10)」など)への部分一致は数えない
//   - KNN             research/phase4-standard/284-285-fix-spec*.md に見出し「KNN 」がある(#284・#285 の会議体の決定)
//   - 標準 X.Y[.Z…]   第X章のページ(src/content/docs/phase4-process-design/)に、その番号で始まる見出しがある
//   - 標準 G-N        第4章に、そのゲートの見出し(### G-N )がある
//   - #NNN            版管理の下の Issue の一覧の写し(src/data/issue-index.tsv。npm run issues:snapshot が作る)にある。
//                     本文や調査メモの記載の有無では代えない(調査メモへ番号を書けば、どの番号でも通ったため)
//
// 決定に当たる識別子(isDecision): ADR-NNNN 決定N、決定を番号で分けていない ADR の ADR-NNNN、KNN、標準の条項(標準 X.Y…・標準 G-N)。
// 標準の条項は、採用した決定そのものであるため決定に数える(§8 X-1 は changed.by に標準の条項を認める。fixes も同じに扱う。
// 実装の記録 §8 の対応表に判断として書いた)。
// Issue は決定の中身を持たないことがあるため、決定に数えない(§8 X-1)。
// 確かめないこと: 引いた決定が、引く側の内容を本当に定めているか(人が差分で確かめる)。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const adrDir = path.join(ROOT, 'src/content/docs/adr');
const adrFiles = fs.readdirSync(adrDir);
const P4 = path.join(ROOT, 'src/content/docs/phase4-process-design');
const CHAPTER = { 1: 'overview', 2: 'lifecycle', 3: 'roles-responsibilities', 4: 'gate-criteria', 5: 'human-ai-boundary', 6: 'deliverable-templates', 7: 'exception-escalation', 8: 'tailoring-guide' };
export const ISSUE_INDEX = path.join(ROOT, 'src/data/issue-index.tsv');

const kText = fs
  .readdirSync(path.join(ROOT, 'research/phase4-standard'))
  .filter((f) => /^284-285-fix-spec.*\.md$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'research/phase4-standard', f), 'utf8'))
  .join('\n');

const adrCache = new Map();
/** ADR の決定の節の番号の集合。ページが無ければ null */
export function adrDecisions(nnnn) {
  if (adrCache.has(nnnn)) return adrCache.get(nnnn);
  const f = adrFiles.find((x) => x.startsWith(`${nnnn}-`));
  let res = null;
  if (f) {
    const lines = fs.readFileSync(path.join(adrDir, f), 'utf8').split('\n');
    const start = lines.findIndex((l) => /^## 決定\s*$/.test(l));
    const numbers = new Set();
    if (start >= 0) {
      for (const l of lines.slice(start + 1)) {
        if (/^## /.test(l)) break;
        // 見出しの形は「### N. …」と「### 決定N: …」の2つ(ADR-0036 などが後者)
        const m = /^### (?:(\d+)\.\s|決定(\d+)[:：])/.exec(l);
        if (m) numbers.add(Number(m[1] ?? m[2]));
      }
    }
    res = { file: f, hasSection: start >= 0, numbers };
  }
  adrCache.set(nnnn, res);
  return res;
}

let issues = null;
/** Issue の一覧の写し(番号 → 題)。写しが無ければ空 */
export function issueIndex() {
  if (!issues) {
    issues = new Map();
    if (fs.existsSync(ISSUE_INDEX)) {
      for (const line of fs.readFileSync(ISSUE_INDEX, 'utf8').split('\n')) {
        const m = /^(\d+)\t([^\t]*)\t(.*)$/.exec(line);
        if (m) issues.set(Number(m[1]), { kind: m[2], title: m[3] });
      }
    }
  }
  return issues;
}

const headingCache = new Map();
const chapterHeadings = (n) => {
  if (!headingCache.has(n)) {
    const f = CHAPTER[n] ? path.join(P4, `${CHAPTER[n]}.md`) : null;
    headingCache.set(n, f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter((l) => /^#{2,6} /.test(l)) : []);
  }
  return headingCache.get(n);
};

/** 識別子が実在しなければ、その理由を返す。実在すれば null */
export function problemOf(id) {
  let m;
  if ((m = /^ADR-(\d{4})(?: 決定(\d+))?$/.exec(id))) {
    const d = adrDecisions(m[1]);
    if (!d) return `ADR-${m[1]} のページが無い`;
    if (m[2]) {
      if (!d.hasSection) return `ADR-${m[1]} に「## 決定」の節が無い`;
      if (!d.numbers.has(Number(m[2]))) return `ADR-${m[1]} の決定の節に「### ${m[2]}.」が無い(あるのは ${[...d.numbers].join('・') || '番号の無い決定'})`;
    }
    return null;
  }
  if ((m = /^K(\d{1,2})$/.exec(id))) return new RegExp(`^#{2,3} K${m[1]}[ (]`, 'm').test(kText) ? null : `${id} の見出しが 284-285-fix-spec*.md に無い`;
  if ((m = /^標準 ((\d)\.\d+(?:\.\d+)*)$/.exec(id))) {
    const num = m[1].replace(/\./g, '\\.');
    return chapterHeadings(Number(m[2])).some((l) => new RegExp(`^#{2,6} ${num}(?![.0-9])`).test(l)) ? null : `第${m[2]}章に見出し「${m[1]}」が無い`;
  }
  if ((m = /^標準 (G-\d)$/.exec(id))) return chapterHeadings(4).some((l) => l.startsWith(`### ${m[1]} `)) ? null : `第4章に見出し「${m[1]}」が無い`;
  if ((m = /^#(\d+)$/.exec(id))) {
    if (!fs.existsSync(ISSUE_INDEX)) return `Issue の一覧の写し(${path.relative(ROOT, ISSUE_INDEX)})が無い。npm run issues:snapshot`;
    return issueIndex().has(Number(m[1])) ? null : `${id} が Issue の一覧の写しに無い(新しい Issue なら npm run issues:snapshot で写しを更新する)`;
  }
  return `識別子の形が分からない(ADR-NNNN / ADR-NNNN 決定N / KNN / 標準 X.Y / 標準 G-N / #NNN)`;
}

/**
 * 決定に当たる識別子か(形だけを見る。実在は problemOf)。
 * ADR を番号つきの決定で書いた ADR は「ADR-NNNN 決定N」で引かせる。番号の無い ADR は ADR-NNNN で決定に当たる
 */
export function isDecision(id) {
  let m;
  if ((m = /^ADR-(\d{4})( 決定\d+)?$/.exec(id))) {
    if (m[2]) return true;
    const d = adrDecisions(m[1]);
    return Boolean(d && d.numbers.size === 0);
  }
  return /^K\d{1,2}$/.test(id) || /^標準 (\d\.\d+(?:\.\d+)*|G-\d)$/.test(id);
}

/** 文の中の決定の識別子(ADR-NNNN[ 決定N]、#NNN)を取り出す。登録簿の by のように、注記を伴う自由な書き方から読む */
export function decisionIdsIn(text) {
  return [...String(text ?? '').matchAll(/ADR-\d{4}(?: 決定\d+)?|#\d+(?![0-9])/g)].map((m) => m[0]);
}

/** 期待値を改めた記録の by から識別子を取り出す(ADR-NNNN[ 決定N]・KNN・標準 X.Y・#NNN) */
export function idsInBy(text) {
  return [...String(text ?? '').matchAll(/ADR-\d{4}(?: 決定\d+)?|(?<![A-Za-z0-9])K\d{1,2}(?![0-9])|標準 (?:\d\.\d+(?:\.\d+)*|G-\d)|#\d+(?![0-9])/g)].map((m) => m[0]);
}

/** changed の by の問題(決定を含まない・実在しない)。無ければ空 */
export function byProblems(by) {
  const ids = idsInBy(by);
  const out = [];
  if (!ids.some(isDecision)) out.push(`by「${by}」が決定(ADR-NNNN 決定N・KNN・標準 X.Y・標準 G-N)を含まない。Issue だけの by は認めない`);
  for (const id of ids) {
    const p = problemOf(id);
    if (p) out.push(`by の ${id}: ${p}`);
  }
  return out;
}
