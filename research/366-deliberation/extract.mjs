// Extract sentence-final "できます/できる" from normative pages (scope of ADR-0086 R-2)
import fs from 'node:fs';
const root = process.argv[2];
const out = process.argv[3];
const files = ['overview','lifecycle','roles-responsibilities','gate-criteria','human-ai-boundary','deliverable-templates','exception-escalation','tailoring-guide','ears-guide','proposal-template','safety-verification','assurance-case'];
const part = { overview:'第1章', lifecycle:'第2章', 'roles-responsibilities':'第3章', 'gate-criteria':'第4章', 'human-ai-boundary':'第5章', 'deliverable-templates':'第6章', 'exception-escalation':'第7章', 'tailoring-guide':'第8章', 'ears-guide':'附属書B', 'proposal-template':'附属書D', 'safety-verification':'附属書F', 'assurance-case':'附属書H' };
const END = /(できます|できる)$/;
const AUX = /(できる|できます)(ものとします|ものとする|ようにします|ようにする|とします|とする|ようになります|ようになる|わけです|はずです|ことになります|ことになる|でしょう|状態にします|状態にする)$/;
function norm(s) {
  let t = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'); // links -> text
  t = t.replace(/<[^>]+>/g, '');
  t = t.trim();
  let prev;
  do {
    prev = t;
    t = t.replace(/[\s*_`]+$/g, '');
    t = t.replace(/(\([^()]*\)|（[^（）]*）)$/u, '');
    t = t.replace(/[、,:：;]+$/u, '');
  } while (t !== prev);
  return t;
}
const items = []; const aux = [];
for (const f of files) {
  const path = `src/content/docs/phase4-process-design/${f}.md`;
  const lines = fs.readFileSync(`${root}/${path}`, 'utf8').split(/\r?\n/);
  let inFront = false, inCode = false, codeLang = '', inComment = false;
  const sents = []; // {line, raw, n}
  lines.forEach((ln, i) => {
    const no = i + 1;
    if (i === 0 && ln.trim() === '---') { inFront = true; return; }
    if (inFront) { if (ln.trim() === '---') inFront = false; return; }
    const fm = ln.match(/^\s*(```|~~~)(\w*)/);
    if (fm) { inCode = !inCode; codeLang = inCode ? fm[2] : ''; return; }
    if (inCode && !/^(markdown|text)$/.test(codeLang)) return;
    const form = inCode;
    let l = ln;
    if (inComment) { const e = l.indexOf('-->'); if (e < 0) return; l = l.slice(e + 3); inComment = false; }
    l = l.replace(/<!--.*?-->/g, '');
    const s = l.indexOf('<!--'); if (s >= 0) { l = l.slice(0, s); inComment = true; }
    if (!l.trim()) return;
    if (/^\s*\|?\s*:?-{3,}/.test(l) && /^[\s|:-]+$/.test(l)) return; // table separator
    let cells;
    if (/^\s*\|/.test(l)) {
      cells = l.replace(/\\\|/g, '\u0000').split('|').slice(1, -1).map(c => c.replace(/\u0000/g, '|'));
    } else {
      cells = [l.replace(/^\s*(>\s*)?([-*+]|\d+\.)?\s*/, '').replace(/^#+\s*/, '')];
    }
    for (const c of cells) {
      for (const piece of c.split(/<br\s*\/?>/)) {
        const parts = piece.split(/(?<=。)/);
        for (const p of parts) { if (p.trim()) sents.push({ line: no, raw: p.trim(), form, n: norm(p.replace(/。$/, '')) }); }
      }
    }
  });
  sents.forEach((s, k) => {
    const rec = { file: path, part: part[f], line: s.line, sentence: s.raw, prev: sents[k - 1]?.raw ?? '', next: sents[k + 1]?.raw ?? '', inTemplateBlock: !!s.form };
    if (END.test(s.n)) items.push(rec);
    else if (AUX.test(s.n)) aux.push(rec);
  });
}
items.forEach((r, i) => r.id = `K-${String(i + 1).padStart(3, '0')}`);
aux.forEach((r, i) => r.id = `KX-${String(i + 1).padStart(3, '0')}`);
fs.writeFileSync(out, JSON.stringify({ items, aux }, null, 1));
console.log(items.length, aux.length);
const by = {}; items.forEach(r => by[r.part] = (by[r.part] || 0) + 1); console.log(by);
