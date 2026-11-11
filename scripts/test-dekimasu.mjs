// 文末の「できます/できる」の登録簿の検査の、違反と適合の試験(#366 / ADR-0117)
//
//   node scripts/test-dekimasu.mjs   (npm run test:dekimasu)

import { checkDekimasu, findDekimasu, normalizeSentence } from './lib/dekimasu.mjs';

let failures = 0;
let checks = 0;
function check(name, ok, detail = '') {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'NG  '} ${name}${ok || !detail ? '' : `\n       ${detail}`}`);
}

const P = 'phase4-process-design/x';
const page = (text) => ({ [P]: text.split('\n') });
const entry = (text, extra = {}) => ({ id: 'K-900', page: P, class: 'capability', basis: 'ai-blind', text, ...extra });
const run = (entries, text) => checkDekimasu({ entries }, page(text));

// 適合
check('登録した文は通る(適合)', run([entry('版の不一致は機械で検出できる')], '- 版の不一致は機械で検出できる\n').problems.length === 0);
check('末尾の括弧・強調・句点を外して照合する', run([entry('記録を後から再構成できます')], '記録を後から再構成できます**([第2章](/process-compass/x/))。\n').problems.length === 0);
check('表の升の文を拾い、登録があれば通る', run([entry('説明できる', { class: 'criterion' })], '| 1 | 説明できる |\n').problems.length === 0);
check('文中の「できる」は拾わない', findDekimasu('確認できる場合は、記録する。\n'.split('\n')).length === 0);
check('補助の語が続く「できるようにする」は拾わない', findDekimasu('参照できるようにする。\n'.split('\n')).length === 0);
check('mermaid のコードブロックは拾わない', findDekimasu('```mermaid\nA[実行できる]\n```\n'.split('\n')).length === 0);
check('HTML の注記は拾わない', findDekimasu('<!-- impl IMPL-0001 note="実行できる" -->\n'.split('\n')).length === 0);
check('フロントマターは拾わない', findDekimasu('---\ndescription: 実行できる\n---\n'.split('\n')).length === 0);
check('markdown のコードブロック(様式)の中の文は拾う', findDekimasu('```markdown\n- 実行できる\n```\n'.split('\n')).length === 1);
check('「できます」と「できる」の両方を拾う', findDekimasu('取得できます。取得できる。\n'.split('\n')).length === 2);
check('正規化はリンクを文字列に直す', normalizeSentence('[第4章](/a/)で確かめられる') === '第4章で確かめられる');

// 違反
const unreg = run([], '判定者は、差し戻すことができます。\n');
check('登録簿に無い文末の「できます」で失敗する(違反)', unreg.problems.length === 1 && unreg.problems[0].includes(`${P}.md:1`), unreg.problems.join(' / '));
const changed = run([entry('判定者は、差し戻すことができます')], '判定者は、提出者へ差し戻すことができます。\n');
check('登録した文を改めると、新しい文の未登録と古い登録の消失の両方で失敗する', changed.problems.length === 2 && changed.problems.some((p) => p.includes('ありません。「')) && changed.problems.some((p) => p.includes('登録した文が')), changed.problems.join(' / '));
const perm = run([entry('差し戻すことができます', { class: 'permission' })], '差し戻すことができます。\n');
check('区分に許容(permission)を置くと失敗する', perm.problems.some((p) => p.includes('許容(permission)は置けません')), perm.problems.join(' / '));
check('知らない区分で失敗する', run([entry('実行できる', { class: 'ability' })], '- 実行できる\n').problems.some((p) => p.includes('区分(class)')));
check('区分の根拠が無いと失敗する', run([entry('実行できる', { basis: undefined })], '- 実行できる\n').problems.some((p) => p.includes('basis')));
check('対象の外の頁の登録で失敗する', run([entry('実行できる', { page: 'phase5-x/y' })], '- 実行できる\n').problems.some((p) => p.includes('対象の頁')));
check('文末が「できる」でない text の登録で失敗する', run([entry('実行してよい')], '').problems.some((p) => p.includes('text は')));
const twice = run([entry('実行できる')], '- 実行できる\n\n| a | 実行できる |\n');
check('登録した文の2度目の出現で失敗する(出現の回数を照らす)', twice.problems.length === 1 && twice.problems[0].includes('2 回'), twice.problems.join(' / '));
check('count に回数を書いた登録は、その回数の出現で通る', run([entry('実行できる', { count: 2 })], '- 実行できる\n\n| a | 実行できる |\n').problems.length === 0);
check('count と出現の回数が合わなければ失敗する', run([entry('実行できる', { count: 2 })], '- 実行できる\n').problems.length === 1);
check('count に 1 以下を書くと失敗する', run([entry('実行できる', { count: 1 })], '- 実行できる\n').problems.some((p) => p.includes('count は')));
check('かぎ括弧の閉じで終わる文を拾う', findDekimasu('「差し戻すことができます」\n'.split('\n')).length === 1);
check('ダッシュで終わる文を拾う', findDekimasu('差し戻すことができる——\n'.split('\n')).length === 1);
check('同じ文の二重の登録で失敗する', run([entry('実行できる'), entry('実行できる')], '- 実行できる\n').problems.some((p) => p.includes('にもあります')));

console.log(`\n${checks} 件中 ${checks - failures} 件が通過`);
if (failures) process.exit(1);
