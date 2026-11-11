// #288 第3巡 追加: 導入前の検証の記録の要約値と verify を、採用者のリポジトリで確かめる。
// 元は research/319-deliberation/legacy-suite/fix288-r3/scen2.mjs(11 場面)。#378 で移した(research/378-deliberation/decision.md)。
// 元は scen.mjs の後の状態で流した。ここでは a〜g の後に、scen.mjs の状態を変える節(i・q・j)を判定せずに再生してから
// 場面へ入る(裁定 R-1)。再生の手順は r3-scen と同じ関数(lib-r3.mjs の scenSteps)である。
//   node scripts/regress/run.mjs --only r3-verify
// @regress {"now": "2026-10-07T12:00:00Z", "workspaces": ["r3b"], "fixes": ["#288"]}
import { adopter, trialSteps, scenSteps, verifySteps, check, done, quiet } from './lib-r3.mjs';

const A = adopter('r3b');
const T = trialSteps(A);
scenSteps(A, T, quiet);
verifySteps(A, check);
done();
