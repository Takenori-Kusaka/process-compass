const fs = require('fs'), path = require('path');
const S = process.argv[2];
const closed = new Set(JSON.parse(fs.readFileSync(S + '/closed.json', 'utf8')).map(x => x.number));
const open = new Map(JSON.parse(fs.readFileSync(S + '/open.json', 'utf8')).map(x => [x.number, x.title]));
const out = [];
function attr(a, k) {
  const r = new RegExp('(?:^|\\s)' + k + '=("([^"]*)"|\\S+)').exec(a);
  return r ? (r[2] ?? r[1]) : null;
}
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.mdx?$/.test(e.name)) {
      const L = fs.readFileSync(p, 'utf8').split('\n');
      L.forEach((l, i) => {
        const re = /<!--\s*impl\s+(IMPL-\d+)\s+([^>]*?)-->/g;
        let m;
        while ((m = re.exec(l))) {
          const a = m[2];
          out.push({ file: p.split(path.sep).join('/'), line: i + 1, id: m[1], target: attr(a, 'target'), state: attr(a, 'state'), plan: attr(a, 'plan'), issue: attr(a, 'issue'), review: attr(a, 'review'), check: attr(a, 'check'), decision: attr(a, 'decision'), note: attr(a, 'note') });
        }
      });
    }
  }
}
walk('src/content/docs');
const marks = out.filter(o => !/implementation-ledger|implementation-marking/.test(o.file));
console.log('total marks', marks.length, 'closed n', closed.size, 'open n', open.size);
const byState = {}; marks.forEach(m => byState[m.state] = (byState[m.state] || 0) + 1); console.log(byState);
const wi = marks.filter(m => m.issue);
console.log('with issue=', wi.length);
const st = m => { const n = +m.issue; return closed.has(n) ? 'CLOSED' : open.has(n) ? 'OPEN' : 'UNKNOWN'; };
const tab = {}; wi.forEach(m => { const k = m.state + '/' + st(m) + '/#' + m.issue; tab[k] = (tab[k] || 0) + 1; }); console.log(tab);
const bad = wi.filter(m => st(m) !== 'OPEN');
fs.writeFileSync(S + '/bad.json', JSON.stringify(bad, null, 1));
for (const m of bad) console.log(m.file.replace('src/content/docs/', ''), m.line, m.id, m.state, m.target, 'plan=' + m.plan, 'issue=' + m.issue, st(m), 'review=' + m.review);
const due = marks.filter(m => m.review && m.review <= '2026-11');
console.log('review<=2026-11:', due.length);
for (const m of due) console.log(' ', m.file.replace('src/content/docs/', ''), m.line, m.id, m.state, 'issue=' + m.issue, 'review=' + m.review);
const rv = {}; marks.filter(m => m.review).forEach(m => rv[m.review] = (rv[m.review] || 0) + 1); console.log('review dist', rv);
for (const m of out.filter(o => /implementation-marking/.test(o.file) && o.issue)) console.log('MARKING-DOC', m.line, m.id, m.state, 'issue=' + m.issue, st(m));
