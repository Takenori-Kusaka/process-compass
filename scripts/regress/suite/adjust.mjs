// 作業用の複製に入れた、初期化の事前点検への調整を確かめる(#319 裁定 7.5 J-4)。
//
// run.mjs の fresh() は、複製を作るときに2つの調整を入れる(.github/CODEOWNERS の @OWNER の置き換えと、
// .git/info/exclude への /answers.json・/change.json)。調整が無ければ、いまのテンプレートの初期化は事前点検
// (scripts/gate/preflight.mjs。ADR-0085 決定2)で止まる。調整が黙って残り、事前点検の回帰をスイートが見逃すことの無いよう、
// 調整を外した複製(raw:r)で初期化が止まることと、調整を入れた複製(a)で通ることを、同じ入力で確かめる。
// テンプレートの test-adoption.mjs・test-init-g5.mjs も事前点検を確かめるが、ここでは移した試験の側の調整そのものを固定する。
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["a", "raw:r"], "fixes": ["#319", "ADR-0085 決定2"]}
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, BASE } from './lib.mjs';

const A = workspace('a');
const R = workspace('r');
const { check, refused, accepted, done } = checker();
const answers = { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp' };

// ---------------------------------------------------------------- 調整そのもの
const coA = fs.readFileSync(path.join(A.DIR, '.github/CODEOWNERS'), 'utf8');
const coR = fs.readFileSync(path.join(R.DIR, '.github/CODEOWNERS'), 'utf8');
check('調整あり: CODEOWNERS に雛形の所有者 @OWNER が残っていない', !/@OWNER\b/.test(coA) && /@tester\b/.test(coA), coA);
check('調整なし: CODEOWNERS に雛形の所有者 @OWNER が残る(テンプレートのまま)', /@OWNER\b/.test(coR), coR);
const exA = fs.readFileSync(path.join(A.DIR, '.git/info/exclude'), 'utf8');
const exR = fs.readFileSync(path.join(R.DIR, '.git/info/exclude'), 'utf8');
check('調整あり: 回答と変化点の JSON を除外する', exA.includes('/answers.json') && exA.includes('/change.json'), exA);
check('調整なし: 回答と変化点の JSON を除外しない', !exR.includes('/answers.json') && !exR.includes('/change.json'), exR);

// ---------------------------------------------------------------- 同じ入力で初期化する
R.write('answers.json', answers);
const r = R.gen('--answers', 'answers.json', '--stack', 'node');
refused('調整なし: 初期化は事前点検で止まる', r, '事前点検が止める項目を見つけました');
check('調整なし: 止める項目の1つは、CODEOWNERS の雛形の所有者 @OWNER の残り', /^\[止める\] \.github\/CODEOWNERS: [^\n]*@OWNER/m.test(r.out), r.out);
check('調整なし: 止める項目の1つは、一覧に無い既存の資産', /^\[止める\] docs\/adoption-inventory\.md: 既存の統制の資産を 1 件検出した/m.test(r.out), r.out);
const draft = R.run('node', ['scripts/gate/preflight.mjs', '--draft']);
// 複製はテンプレートをそのままコミットしたものなので、配置の外のファイルは、場面が書いた回答の JSON(コミットしていない)の 1 件だけである
check('調整なし: 既存の資産として数えたのは、テンプレートの配置の外のファイル 1 件(場面が書いた回答の JSON)', draft.out.includes('テンプレートの配置の外のファイル 1 件') && R.git('status', '--porcelain').out.trim() === '?? answers.json', draft.out + R.git('status', '--porcelain').out);
check('調整なし: 構成は設定済みにならない', JSON.parse(R.read('process.config.json')).configured === false, R.read('process.config.json').slice(0, 200));

A.write('answers.json', answers);
accepted('調整あり: 同じ回答で初期化が通る', A.gen('--answers', 'answers.json', '--stack', 'node'));
check('調整あり: 構成は設定済みになる', A.cfg().configured !== false, JSON.stringify(A.cfg()).slice(0, 200));
done();
