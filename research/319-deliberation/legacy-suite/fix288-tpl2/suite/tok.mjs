import fs from 'node:fs';
import { workspace, BASE } from './lib.mjs';
const SIZE = { 1: 'size-1-2', 5: 'size-3-9', 15: 'size-10plus' };
const PHASE = { 1: 'poc', 5: 'mvp', 15: 'growth' };
for (const n of [1, 5, 15]) {
  const W = workspace(`tok${n}`);
  const a = { 'q-team-size': SIZE[n], 'q-biz-phase': PHASE[n], ...BASE };
  if (n === 1) a['q-external-reviewer'] = 'reviewer-no';
  W.write('answers.json', a);
  W.gen('--answers', 'answers.json', '--stack', 'node');
  const t = W.read('CLAUDE.md');
  let ja = 0, ascii = 0;
  for (const ch of t) (ch.charCodeAt(0) < 128 ? ascii++ : ja++);
  console.log(`${n}名: ${(Buffer.byteLength(t) / 1024).toFixed(1)}KB 推定 ${Math.round(ja + ascii / 3.5)} トークン`);
}
