import fs from 'node:fs'; import path from 'node:path';
import { ROOT } from './config.mjs';
import { autonomyState, readReworkRecords, rejectionText } from './autonomy.mjs';
const base = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/gate/fixtures/delegation-eligible.json'), 'utf8'));
// 標本が足りない間: 登録 2026-10-05、履歴は 2026-09-01 からの 20 変更(各 1 タスク)。窓の母数 20 < 30
const mk = (asOf, postHoc) => { const f = base(); f.records.asOf = asOf; f.config.delegation.changeTypes[0].registeredAt = '2026-10-05'; f.records.history.changes = [];
  for (let i = 0; i < 20; i++) { const d = new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10); f.records.history.changes.push({ ref: String(i + 1).padStart(40, '0'), date: d, pr: String(100 + i), files: ['src/i18n/ja.json'] }); }
  f.records.rejections = [{ file: 'x', date: '2026-09-02', target: 'PR #101', cited: true }];
  f.records.rework = { available: true, plan: [], trailers: f.records.history.changes.map((c, i) => ({ ref: c.ref, date: c.date, tasks: ['F-001/Task-' + (i + 1)], files: c.files })) };
  if (postHoc) f.records.postHoc = postHoc; return f; };
const s = (label, f) => { const t = autonomyState(f.config, f.records).types[0]; console.log(label, JSON.stringify({ level: t.level, stops: t.stops.map((x) => x.kind + ':' + x.reason.slice(0, 70)), fullMonths: t.postHoc?.fullMonths })); };
s('O2-1 asOf 10-20 (登録の月。事後確認の記録なし)', mk('2026-10-20', null));
s('O2-2 asOf 10-20 (記録を渡す)', mk('2026-10-20', { available: true, months: [] }));
s('O2-3 asOf 12-05 10月の確認 2/6 件', mk('2026-12-05', { available: true, months: [{ month: '2026-10', n: 6, k: 2 }] }));
s('O2-4 asOf 12-05 10月の確認 6/6 件', mk('2026-12-05', { available: true, months: [{ month: '2026-10', n: 6, k: 6 }] }));
