#!/usr/bin/env node
// Summarize token usage of Claude Code transcripts (JSONL) in a directory.
// Usage: node .claude/tools/token-usage.cjs <dir-with-jsonl> [<dir> ...]
// Prints per-transcript output / cache-write / cache-read tokens, call count,
// and the average context re-read per call (cache read / calls), which is the
// main cost driver for long-lived agents.
const fs = require('fs');
const path = require('path');

function sum(file) {
  const t = { in: 0, out: 0, cw: 0, cr: 0, n: 0, first: null, desc: null };
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    if (!t.first && j.timestamp) t.first = j.timestamp;
    if (!t.desc && j.type === 'user' && typeof (j.message && j.message.content) === 'string') {
      t.desc = j.message.content.slice(0, 40).replace(/\s+/g, ' ');
    }
    const u = j.message && j.message.usage;
    if (j.type === 'assistant' && u) {
      t.in += u.input_tokens || 0;
      t.out += u.output_tokens || 0;
      t.cw += u.cache_creation_input_tokens || 0;
      t.cr += u.cache_read_input_tokens || 0;
      t.n++;
    }
  }
  return t;
}

const rows = [];
for (const dir of process.argv.slice(2)) {
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jsonl|output)$/.test(f)) continue;
    const p = path.join(dir, f);
    try {
      if (fs.statSync(p).size < 1000) continue;
      const t = sum(p);
      if (t.n) rows.push([f, t]);
    } catch { /* skip unreadable */ }
  }
}
const T = { in: 0, out: 0, cw: 0, cr: 0, n: 0 };
rows.sort((a, b) => b[1].cr - a[1].cr);
for (const [f, t] of rows) {
  for (const k in T) T[k] += t[k];
  const avg = t.n ? (t.cr / t.n / 1e3).toFixed(0) : 0;
  console.log(`${(t.first || '').slice(0, 16)} out=${(t.out / 1e3).toFixed(0)}k cw=${(t.cw / 1e6).toFixed(2)}M cr=${(t.cr / 1e6).toFixed(1)}M calls=${t.n} avgctx=${avg}k ${t.desc || f}`);
}
console.log(`TOTAL out=${(T.out / 1e6).toFixed(2)}M cw=${(T.cw / 1e6).toFixed(1)}M cr=${(T.cr / 1e6).toFixed(0)}M calls=${T.n} avgctx=${T.n ? (T.cr / T.n / 1e3).toFixed(0) : 0}k files=${rows.length}`);
