import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { execSync } from 'node:child_process';
import { ROOT } from './config.mjs';
import { autonomyState, readReworkRecords } from './autonomy.mjs';
const base = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/gate/fixtures/delegation-eligible.json'), 'utf8'));
const sum = (s) => { const t = s.types[0]; return { level: t.level, rej: t.rejection && { n: t.rejection.n, rejected: t.rejection.rejected, state: t.rejection.state }, rw: t.rework && { n: t.rework.n, state: t.rework.state }, stops: t.stops.map((x) => x.kind + ':' + x.reason.slice(0, 60)) }; };
// 罠A: 健全な機械的 R3。窓(2か月)に 40 変更・差し戻し 0 件。登録 2026-08-01
const mk = (asOf, registeredAt) => { const f = base(); f.records.asOf = asOf; f.config.delegation.changeTypes[0].registeredAt = registeredAt;
  f.records.history.changes = []; for (let i = 0; i < 80; i++) { const d = new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10); f.records.history.changes.push({ ref: String(i + 1).padStart(40, '0'), date: d, pr: String(100 + i), files: ['src/i18n/ja.json'] }); }
  f.records.rejections = []; return f; };
console.log('A1 asOf 2026-10-20 登録 08-01 (差し戻し0)', JSON.stringify(sum(autonomyState(mk('2026-10-20', '2026-08-01').config, mk('2026-10-20', '2026-08-01').records))));
{ const f = mk('2026-10-20', '2026-10-05'); console.log('A2 10-05 に登録し直し(評価日 10-01 の後)', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
{ const f = mk('2026-11-20', '2026-10-05'); console.log('A3 11-20 時点(11-01 の評価で再び0%)', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
{ const f = mk('2026-11-20', '2026-11-05'); console.log('A4 11-05 に再登録', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
// 罠B: トレーラ無し(rework.trailers = [])で履歴は十分
{ const f = mk('2026-10-20', '2026-10-05'); f.records.rejections = [{ file: 'x', date: '2026-09-01', target: 'PR #105', cited: true }]; f.records.rework = { available: true, trailers: [], plan: [] };
  console.log('B1 純関数: トレーラ0・差し戻し1・登録10-05', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
// 罠B(実 git): トレーラの無いコミットだけの履歴 40 件
const d = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-')); const g = (c, env = {}) => execSync(c, { cwd: d, env: { ...process.env, ...env }, stdio: 'pipe' }).toString();
g('git init -q -b main'); g('git config user.email a@b.c'); g('git config user.name t');
fs.mkdirSync(path.join(d, 'src/i18n'), { recursive: true });
for (let i = 0; i < 40; i++) { const dt = new Date(Date.UTC(2026, 7, 1 + i, 9)).toISOString(); fs.writeFileSync(path.join(d, 'src/i18n/ja.json'), `{"k":${i}}`); g('git add -A'); g(`git commit -q -m "chore(deps): bump dep ${i}"`, { GIT_AUTHOR_DATE: dt, GIT_COMMITTER_DATE: dt }); }
const rr = readReworkRecords({ root: d }); console.log('B2 実git: 取得可=', rr.available, 'トレーラ付き取り込み=', rr.trailers.length, '(コミット40件)');
{ const f = mk('2026-10-20', '2026-10-05'); f.records.rejections = [{ file: 'x', date: '2026-09-01', target: 'PR #105', cited: true }]; f.records.rework = rr; console.log('B3 実git記録を渡す', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
// B4: トレーラ付き(1コミット1タスク)なら母数は数えられる
{ const f = mk('2026-10-20', '2026-10-05'); f.records.rejections = [{ file: 'x', date: '2026-09-01', target: 'PR #105', cited: true }];
  f.records.rework = { available: true, trailers: f.records.history.changes.map((c, i) => ({ ref: c.ref, date: c.date, tasks: [`F-001/Task-${i + 1}`], files: c.files })), plan: [] };
  console.log('B4 トレーラ付き', JSON.stringify(sum(autonomyState(f.config, f.records)))); }
