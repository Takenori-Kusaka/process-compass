import { execFileSync } from 'node:child_process';
import path from 'node:path';
const REPO = process.argv[2];
const START = process.argv[3]; // exclusive: commit before the first measured commit
import { pathToFileURL } from "node:url";
const mod = await import(pathToFileURL(path.resolve(REPO, "scripts/gate/verification-trace.mjs")).href);
const cfg = await import(pathToFileURL(path.resolve(REPO, "scripts/gate/config.mjs")).href);
const matchGlob = cfg.matchGlob;
const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });
const commits = git('rev-list', '--first-parent', '--reverse', `${START}..HEAD`).trim().split('\n');
const testPatterns = JSON.parse(git('show', 'HEAD:.claude/guard.json')).testPatterns;
function plansAt(rev) {
  const out = {};
  let list = '';
  try { list = git('ls-tree', '-r', '--name-only', rev, 'specs/'); } catch {}
  for (const f of list.split('\n').filter((f) => /^specs\/F-\d+\/plan\.md$/.test(f))) {
    const feat = f.split('/')[1];
    const text = git('show', `${rev}:${f}`);
    const r = mod.readPlanTargets(feat, { text });
    const states = {};
    for (const l of text.split('\n')) { const c = l.split('|').map((s) => s.trim()); if (/^Task-\d+$/.test(c[1] ?? '')) states[c[1]] = c[c.length - 2]; }
    out[feat] = r.tasks.map((t) => ({ ...t, state: states[t.id] }));
  }
  return out;
}
const U = (plans, pick) => Object.entries(plans).flatMap(([f, ts]) => ts.filter((t) => pick(f, t)).flatMap((t) => t.globs));
function classify(p) {
  if (/^specs\//.test(p)) return 'specs';
  if (/^docs\//.test(p)) return 'docs';
  if (/^context\//.test(p)) return 'context';
  if (/(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/.test(p)) return 'lockfile';
  if (/(^|\/)package\.json$/.test(p)) return 'package.json';
  if (/^(\.github\/|scripts\/gate\/|\.claude\/)/.test(p)) return 'enforcement';
  if (/fixtures?\//.test(p)) return 'fixture';
  if (/(^|\/)(README|CHANGELOG)\.md$/.test(p)) return 'readme/changelog';
  if (testPatterns.some((g) => matchGlob(g, p))) return 'test';
  return 'other';
}
const rows = []; const tot = { R1: {}, R2: {}, R3: {}, R4: {} };
for (const C of commits) {
  const subj = git('log', '-1', '--format=%s', C).trim();
  const body = git('log', '-1', '--format=%B', C);
  const feats = [...body.matchAll(/^Spec:\s*(F-\d+)/gm)].map((m) => m[1]);
  const changed = git('diff', '--name-status', '-M', `${C}^`, C).trim().split('\n').filter(Boolean).flatMap((l) => { const p = l.split('\t'); return p[0].startsWith('R') ? [p[1], p[2]] : [p[1]]; });
  const prev = plansAt(`${C}^`), cur = plansAt(C);
  const sets = {
    R1: U(prev, () => true),
    R2: U(prev, (f, t) => t.state !== '完了'),
    R3: U(prev, (f) => feats.includes(f)),
    R4: U(cur, () => true),
  };
  const row = { c: C.slice(0, 7), subj, spec: feats.join(','), changed: changed.length };
  for (const [k, globs] of Object.entries(sets)) {
    const out = changed.filter((p) => !globs.some((g) => matchGlob(g, p)));
    row[k] = out;
    for (const p of out) { const cl = classify(p); tot[k][cl] = (tot[k][cl] ?? 0) + 1; }
  }
  rows.push(row);
}
console.log('| commit | 題名 | Spec | 変更 | R1外 | R2外 | R3外 | R4外 |\n| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) console.log(`| ${r.c} | ${r.subj} | ${r.spec} | ${r.changed} | ${r.R1.length} | ${r.R2.length} | ${r.R3.length} | ${r.R4.length} |`);
console.log('\n外れたパスの置き場別の件数(のべ)\n\n| 置き場 | R1 | R2 | R3 | R4 |\n| --- | --- | --- | --- | --- |');
const cls = [...new Set(['R1','R2','R3','R4'].flatMap((k) => Object.keys(tot[k])))];
for (const c of cls) console.log(`| ${c} | ${tot.R1[c] ?? 0} | ${tot.R2[c] ?? 0} | ${tot.R3[c] ?? 0} | ${tot.R4[c] ?? 0} |`);
console.log('\n各コミットの R1 の外れたパス\n');
for (const r of rows) console.log(`- ${r.c} ${r.subj}: ${r.R1.map((p) => p + '[' + classify(p) + ']').join(', ') || '(なし)'}`);
console.log('\n各コミットの R3 の外れたパス\n');
for (const r of rows) console.log(`- ${r.c} (${r.spec || 'Spec なし'}): ${r.R3.join(', ') || '(なし)'}`);
