// D-0 を作成した直後の再生成(版の取得と、生成区間の書き込み)。
//   sh tmp/fix2-g3a/fresh.sh a && node tmp/fix2-g3a/acquire.mjs
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["a"], "fixes": ["#284", "#285"]}
import { workspace, checker, BASE, APPOINTER } from './lib.mjs';

const { git, write, read, cfg, gen, contract, checkD0, checkRules, d0 } = workspace('a');
const { check, refused, done, fixes } = checker();
fixes(["K75", "K42"]);

write('answers.json', { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp' });
check('初期化', gen('--answers', 'answers.json', '--stack', 'node').ok);
check('D-0 が無いあいだ、D-0 の検査は落ちる', !checkD0().ok && checkD0().out.includes('がありません'));
d0('1.0');
check('様式を写した直後は、生成区間が構成と一致しない', !checkD0().ok && checkD0().out.includes('生成区間が、構成'), checkD0().out);
const r = gen('--answers', 'process.config.json');
check('再生成で、版を取得し、生成区間と節3 の2行を書く', r.ok && cfg().d0Version === '1.0' && cfg().changeLog.length === 2 && cfg().changeLog[1].summary === 'D-0 体制図の版を取得した' && Boolean(cfg().changeLog[1].prevHash), r.out);
check('全検査', contract().ok && checkD0().ok && checkRules().ok, contract().out + checkD0().out);
check('節3 の決定者(3名以上の既定: 事業決裁者 / リリース判定会)', /\| 体制と運用形態[^|]*\| 事業決裁者 \|/.test(read('docs/D-0-governance.md')) && /\| 標準変更カタログへの登録[^|]*\| リリース判定会\(B-4\) \|/.test(read('docs/D-0-governance.md')));
const before = read('process.config.json');
check('もう一度再生成しても、構成は変わらない', gen('--answers', 'process.config.json').ok && before === read('process.config.json') && git('status', '--porcelain', 'docs').out.includes('docs/'));
refused('再生成で --project-id を変える', gen('--answers', 'process.config.json', '--project-id', 'P-999'), '種別 settings');
// D-0 の版が数字で終わらない場合
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: draft'));
write('c.json', { kind: 'accountable', summary: 'x', people: [{ id: 'p1', name: '山田 太郎' }, { id: 'p2', name: '佐藤 花子' }, { id: 'p3', name: '鈴木 一郎' }, APPOINTER] });
// K75-1(第5巡): D-0 の版は N.N に限る。数字で終わらない版(draft)は、変化点でも D-0 の検査でも拒否する(期待値を改めた)
refused('版の形式(N.N)でない D-0 の版は拒否する', gen('--change', 'c.json'), '版の形式');
check('D-0 の検査も、版の形式を確かめる', !checkD0().ok && checkD0().out.includes('版の形式'), checkD0().out);
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: 1.0'));
check('版を戻せば、名簿を反映できる', gen('--change', 'c.json').ok && cfg().d0Version === '1.1', cfg().d0Version);
write('c.json', { kind: 'accountable', summary: 'y', seats: { 'biz-approver': { accountable: '山田 太郎' } }, d0Version: '2.0', decidedBy: APPOINTER.name, reason: '任命' });
check('入力の d0Version で版を指定する', gen('--change', 'c.json').ok && cfg().d0Version === '2.0' && read('docs/D-0-governance.md').includes('version: 2.0') && checkD0().ok, checkD0().out);
done();
