// 決定の識別子(ADR・K 番号・Issue)の実在の検査(#319 裁定 R-1.4・R-4・R-5 / ADR-0089)。
//
// 回帰の試験の fixes・changed・knownFailure(scripts/regress/check-fixes.mjs)と、廃した言い回しの登録簿の by
// (scripts/check-provisions.mjs)が使う。
//   - ADR-NNNN       src/content/docs/adr/NNNN-*.md がある
//   - ADR-NNNN 決定N そのうえで、ADR の本文に「決定N」がある
//   - KNN            research/phase4-standard/284-285-fix-spec*.md に見出し「KNN 」がある(#284・#285 の会議体の決定)
//   - #NNN           research/ か src/content/docs/ のどこかに #NNN の記載がある(Issue の一覧を手元に持たないため、
//                    記載の有無で代える。GitHub への問い合わせはしない)
// 確かめないこと: 引いた決定が、引く側の内容を本当に定めているか(人が差分で確かめる)。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const adrDir = path.join(ROOT, 'src/content/docs/adr');
const adrFiles = fs.readdirSync(adrDir);
const kText = fs
  .readdirSync(path.join(ROOT, 'research/phase4-standard'))
  .filter((f) => /^284-285-fix-spec.*\.md$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'research/phase4-standard', f), 'utf8'))
  .join('\n');
let corpus = null;
const issueMentioned = (n) => {
  if (!corpus) {
    const parts = [];
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(md|mdx|yaml|yml)$/.test(e.name)) parts.push(fs.readFileSync(p, 'utf8'));
      }
    };
    walk(path.join(ROOT, 'research'));
    walk(path.join(ROOT, 'src/content/docs'));
    corpus = parts.join('\n');
  }
  return new RegExp(`#${n}(?![0-9])`).test(corpus);
};

export function problemOf(id) {
  let m;
  if ((m = /^ADR-(\d{4})(?: 決定(\d+))?$/.exec(id))) {
    const f = adrFiles.find((x) => x.startsWith(`${m[1]}-`));
    if (!f) return `ADR-${m[1]} のページが無い`;
    if (m[2] && !fs.readFileSync(path.join(adrDir, f), 'utf8').includes(`決定${m[2]}`)) return `ADR-${m[1]} に「決定${m[2]}」が無い`;
    return null;
  }
  if ((m = /^K(\d{1,2})$/.exec(id))) return new RegExp(`^#{2,3} K${m[1]}[ (]`, 'm').test(kText) ? null : `${id} の見出しが 284-285-fix-spec*.md に無い`;
  if ((m = /^#(\d+)$/.exec(id))) return issueMentioned(m[1]) ? null : `${id} の記載が research/・src/content/docs/ に無い`;
  return `識別子の形が分からない(ADR-NNNN / ADR-NNNN 決定N / KNN / #NNN)`;
}


/** 文の中の決定の識別子(ADR-NNNN、#NNN)を取り出す。登録簿の by のように、注記を伴う自由な書き方から読む */
export function decisionIdsIn(text) {
  return [...String(text ?? '').matchAll(/ADR-\d{4}|#\d+(?![0-9])/g)].map((m) => m[0]);
}
