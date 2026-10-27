#!/usr/bin/env node
// 決定を固定する回帰の試験を流す(#319 裁定 R-1・R-3)。
//
//   node scripts/regress/run.mjs [--only v3,new] [--jobs N] [--out DIR] [--keep] [-v]
//                                [--template DIR] [--template-ref REF] [--kb rebuild|keep] [--suite DIR]
//
// 試験の対象は template/ の作業ツリーで、知識ベースは標準から作り直したもの(--kb rebuild。既定)。
// --template-ref は、テンプレートの過去の版(例: ec8ecd6。#311 の前の基準 p302)を対象にする。
// そのときの知識ベースは、その版に複製済みのもの(--kb keep)を使うのが、移植の一致の確認の手順である。
//
// 仕組み(元のスイートの runsuite.sh・runall2.sh・fresh.sh・tpl2-setup.sh を Node へ置き換えた):
//   1. 作業の場所を作業ツリーの外(os.tmpdir() の下の mkdtemp)に作り、テンプレートを tpl/ へ写す
//   2. 走らせる前に確かめる: 時計の先読みが子プロセスに効くこと、gh の代役が PATH で見つかること、
//      テンプレートのスクリプトが止まらない時計(引数なしの Intl.DateTimeFormat().format())を使わないこと
//   3. スクリプトごと(suite/*.mjs の先頭の @regress の宣言)に、作業用の複製を作り(git init の後に最上位を確かめる)、
//      宣言した時刻で時計を止めて流す。git の時刻も同じ時刻にそろえる
//   4. 終了コードを伝える: どれかのスクリプトが落ちる・中断する・場面の記録と終了コードが食い違う・
//      固定する決定(fixes)を持たない場面がある・落ちることを期待する印の見直しの時期を過ぎた、のどれかで 1 を返す
//
// 結果: --out(既定は作業の場所の out/)に、スクリプトごとの出力(.log)と場面の記録(.jsonl)、summary.json、fixes.md を書く。
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unfrozenClockUses } from './lib/unfrozen-clock.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const argv0 = process.argv.slice(2);
// --suite は、実行役そのものの試験(test-run.mjs)が、作った場面のスクリプトを流すためだけに使う
const SUITE = argv0.includes('--suite') ? path.resolve(argv0[argv0.indexOf('--suite') + 1]) : path.join(HERE, 'suite');
const CLOCK = path.join(HERE, 'lib', 'clock.mjs');
const BIN = path.join(HERE, 'lib', 'bin');

const argv = process.argv.slice(2);
const opt = (name, dflt = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : dflt;
};
const flag = (name) => argv.includes(name);
const ONLY = opt('--only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;
const JOBS = Math.max(1, Number(opt("--jobs", String(Math.min(8, Math.max(2, os.availableParallelism?.() ?? os.cpus().length))))));
const TEMPLATE = path.resolve(opt('--template', path.join(REPO, 'template')));
const TEMPLATE_REF = opt('--template-ref');
const KB = opt('--kb', TEMPLATE_REF ? 'keep' : 'rebuild');
const KEEP = flag('--keep');
const VERBOSE = flag('-v');

const fail = (msg) => {
  console.error(`regress: ${msg}`);
  process.exit(2);
};

// ---------------------------------------------------------------- 宣言の読み取り
/** suite/*.mjs の先頭の `// @regress {...}` を読む。runs ごとに 1 回の実行 */
function manifest() {
  const runs = [];
  for (const file of fs.readdirSync(SUITE).filter((f) => f.endsWith('.mjs')).sort()) {
    const text = fs.readFileSync(path.join(SUITE, file), 'utf8');
    const m = /^\/\/ @regress (\{.*\})$/m.exec(text);
    if (!m) continue;
    let decl;
    try {
      decl = JSON.parse(m[1]);
    } catch (e) {
      fail(`${file} の @regress を JSON として読めない: ${e.message}`);
    }
    const script = path.basename(file, '.mjs');
    if (!decl.now || Number.isNaN(Date.parse(decl.now))) fail(`${file}: @regress に時刻(now)が無い`);
    if (!Array.isArray(decl.fixes) || !decl.fixes.length) fail(`${file}: @regress に固定する決定(fixes)が無い`);
    for (const r of decl.runs ?? [{}]) {
      runs.push({
        name: r.name ?? script,
        script,
        file: path.join(SUITE, file),
        now: r.now ?? decl.now,
        tz: r.tz ?? decl.tz ?? 'UTC',
        fixes: decl.fixes,
        workspaces: r.workspaces ?? decl.workspaces ?? [],
        args: r.args ?? [],
        timeout: (r.timeout ?? decl.timeout ?? 1800) * 1000,
      });
    }
  }
  return runs;
}

// ---------------------------------------------------------------- 作業の場所
const git = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });

function prepareTemplate(root) {
  const tpl = path.join(root, 'tpl');
  if (!fs.existsSync(path.join(TEMPLATE, 'scripts', 'gate'))) fail(`テンプレートが無い(${TEMPLATE})。git submodule update --init --recursive`);
  if (TEMPLATE_REF) {
    // 過去の版: 一時の索引へ読み込み、tpl/ へ書き出す(tar・git archive に依らない)
    fs.mkdirSync(tpl, { recursive: true });
    const env = { ...process.env, GIT_INDEX_FILE: path.join(root, 'tpl.index') };
    git(['-C', TEMPLATE, 'read-tree', TEMPLATE_REF], { env });
    git(['-C', TEMPLATE, `--work-tree=${tpl}`, 'checkout-index', '-a', '-f'], { env });
  } else {
    fs.cpSync(TEMPLATE, tpl, { recursive: true, filter: (src) => !/[\\/](\.git|node_modules)$/.test(src) });
  }
  if (KB === 'rebuild') execFileSync(process.execPath, [path.join(REPO, 'scripts', 'build-template-kb.mjs'), '--out', path.join(tpl, 'scripts', 'vendor', 'tailoring-kb.json')], { stdio: ['ignore', 'ignore', 'inherit'] });
  return tpl;
}

/**
 * 作業用の複製を作る(元の fresh.sh)。git init の後に最上位が複製そのものであることを確かめ、違えば中止する。
 *
 * 初期化の事前点検(テンプレートの scripts/gate/preflight.mjs。ADR-0085 決定2、#315)への調整を2つ入れる(#319 裁定 7.5 J-4):
 *   1. .github/CODEOWNERS の雛形の所有者 @OWNER を @tester へ置き換える(ADR-0085 は「人が実在のアカウントへ置き換える」とする。
 *      試験の作業用の複製では、試験の作者がその人に当たる)
 *   2. .git/info/exclude に、場面が複製の中へ書く回答と変化点の JSON(/answers.json・/change.json)を足す。
 *      事前点検は、これらを一覧に無い既存の資産として数える
 * 調整は、場面の入力の書き方(複製の中の answers.json)を元のまま保ち、p302 との比べる基準を変えないために、ここ1か所に置く。
 * 調整が事前点検を黙らせたままにならないよう、調整を外した複製(workspaces の "raw:名前")で初期化が止まることを
 * suite/adjust.mjs が確かめる。
 */
export const ADJUST_EXCLUDE = ['/answers.json', '/change.json'];
function fresh(tpl, wsDir, env, { raw = false } = {}) {
  fs.rmSync(wsDir, { recursive: true, force: true });
  fs.cpSync(tpl, wsDir, { recursive: true, filter: (src) => !/[\\/](\.git|node_modules)$/.test(src) });
  const g = (args) => git(args, { cwd: wsDir, env });
  g(['init', '-q', '-b', 'main', '.']);
  const top = fs.realpathSync(g(['rev-parse', '--show-toplevel']).trim());
  if (top !== fs.realpathSync(wsDir)) throw new Error(`最上位が作業用の複製でない(${top} / ${wsDir})。中止`);
  if (!raw) {
    const co = path.join(wsDir, '.github', 'CODEOWNERS');
    if (fs.existsSync(co)) fs.writeFileSync(co, fs.readFileSync(co, 'utf8').replace(/@OWNER\b/g, '@tester'));
    fs.appendFileSync(path.join(wsDir, '.git', 'info', 'exclude'), `\n# scripts/regress/run.mjs: 事前点検への調整(#319)\n${ADJUST_EXCLUDE.join('\n')}\n`);
  }
  g(['config', 'user.email', 't@example.com']);
  g(['config', 'user.name', 'tester']);
  g(['config', 'core.autocrlf', 'false']);
  g(['add', '-A']);
  g(['commit', '-q', '-m', 'chore: template']);
}

function envFor(root, run, runRoot) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(GIT_|REGRESS_|MOCK_|FAKE_RUN_ID$|GH_LOG$|GITHUB_)/.test(k) && k !== 'REGRESS_CAPTURE') delete env[k];
  return {
    ...env,
    TZ: run.tz,
    REGRESS_NOW: run.now,
    REGRESS_ROOT: runRoot,
    REGRESS_TPL: path.join(root, 'tpl'),
    REGRESS_SCRIPT: run.name,
    REGRESS_FIXES: JSON.stringify(run.fixes),
    REGRESS_RESULTS: path.join(runRoot, 'results.jsonl'),
    REGRESS_GH_LOG: path.join(runRoot, 'gh.log'),
    GH_LOG: path.join(runRoot, 'gh.log'),
    GIT_AUTHOR_DATE: run.now,
    GIT_COMMITTER_DATE: run.now,
    GIT_CONFIG_GLOBAL: path.join(root, 'gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    PATH: `${BIN}${path.delimiter}${process.env.PATH}`,
    NODE_OPTIONS: `--import "${pathToFileURL(CLOCK).href}"`,
  };
}

// ---------------------------------------------------------------- 走らせる前の確認
function preflight(root, tpl) {
  const problems = [];
  const env = envFor(root, { now: '2026-10-01T03:00:00Z', tz: 'UTC', name: 'preflight', fixes: [] }, root);
  // 時計が子プロセスまで届く(子の子でも同じ時刻)
  const probe = 'const {execFileSync}=require("node:child_process");const own=Date.now();const child=Number(execFileSync(process.execPath,["-e","process.stdout.write(String(Date.now()))"],{encoding:"utf8"}));process.stdout.write(JSON.stringify([own,child,new Date().toISOString()]))';
  try {
    const [own, child, iso] = JSON.parse(execFileSync(process.execPath, ['-e', probe], { env, encoding: 'utf8' }));
    const want = Date.parse('2026-10-01T03:00:00Z');
    if (own !== want || child !== want || iso !== '2026-10-01T03:00:00.000Z') problems.push(`時計が止まらない(${own} / ${child} / ${iso})`);
  } catch (e) {
    problems.push(`時計の確認に失敗: ${e.message}`);
  }
  // git の時刻
  try {
    const gdir = path.join(root, 'git-probe');
    fs.mkdirSync(gdir);
    const g = (a) => git(a, { cwd: gdir, env });
    g(['init', '-q', '-b', 'main', '.']);
    g(['-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'x']);
    const ct = g(['log', '-1', '--format=%cI']).trim();
    if (Date.parse(ct) !== Date.parse('2026-10-01T03:00:00Z')) problems.push(`git の時刻が止まらない(${ct})`);
  } catch (e) {
    problems.push(`git の時刻の確認に失敗: ${e.message}`);
  }
  // gh の代役
  try {
    const out = execFileSync('gh', ['--regress-probe'], { env, encoding: 'utf8' }).trim();
    if (out !== 'regress-gh') problems.push(`PATH の gh が代役でない(${out.slice(0, 80)})`);
  } catch (e) {
    problems.push(`gh の代役を呼べない(${e.message.split('\n')[0]})。Windows では代役(Node のスクリプト)を execFileSync('gh') から呼べない`);
  }
  for (const h of unfrozenClockUses(tpl)) problems.push(`止まらない時計を使う: ${h}`);
  return problems;
}

// ---------------------------------------------------------------- 実行
function runOne(root, tpl, run, outDir) {
  const runRoot = path.join(root, 'runs', run.name);
  fs.mkdirSync(path.join(runRoot, 'w'), { recursive: true });
  const env = envFor(root, run, runRoot);
  const started = Date.now();
  try {
    for (const ws of run.workspaces) {
      const raw = ws.startsWith('raw:');
      fresh(tpl, path.join(runRoot, 'w', raw ? ws.slice(4) : ws), env, { raw });
    }
  } catch (e) {
    return Promise.resolve({ run, exit: 9, signal: null, seconds: 0, error: `作業用の複製: ${e.message}` });
  }
  return new Promise((resolve) => {
    const log = fs.openSync(path.join(outDir, `${run.name}.log`), 'w');
    const child = spawn(process.execPath, [run.file, ...run.args, ...(VERBOSE ? ['-v'] : [])], { cwd: SUITE, env, stdio: ['ignore', log, log] });
    const timer = setTimeout(() => child.kill('SIGKILL'), run.timeout);
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      fs.closeSync(log);
      const res = path.join(runRoot, 'results.jsonl');
      if (fs.existsSync(res)) fs.copyFileSync(res, path.join(outDir, `${run.name}.jsonl`));
      resolve({ run, exit: code, signal, seconds: Math.round((Date.now() - started) / 1000) });
    });
  });
}

function readResults(outDir, name) {
  const f = path.join(outDir, `${name}.jsonl`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
}

async function main() {
  const all = manifest();
  const runs = ONLY ? all.filter((r) => ONLY.includes(r.name) || ONLY.includes(r.script)) : all;
  if (!runs.length) fail('流すスクリプトが無い');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pit-regress-'));
  // 作業の場所が作業ツリーの外にあること(元の fresh.sh は作業ツリーの tmp/ の下に入れ子のリポジトリを作った)
  const rel = path.relative(fs.realpathSync(REPO), fs.realpathSync(root));
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) fail(`作業の場所が作業ツリーの中にある(${root})`);
  fs.writeFileSync(path.join(root, 'gitconfig'), '');
  const outDir = path.resolve(opt('--out', path.join(root, 'out')));
  fs.mkdirSync(outDir, { recursive: true });
  const tpl = prepareTemplate(root);
  const problems = preflight(root, tpl);
  if (problems.length) {
    console.error(`regress: 走らせる前の確認で止めた\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`regress: テンプレート ${TEMPLATE_REF ?? '作業ツリー'}(知識ベース ${KB})、${runs.length} 本、並列 ${JOBS}、作業の場所 ${root}`);

  const queue = [...runs].sort((a, b) => b.timeout - a.timeout);
  const results = [];
  const workers = Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
    while (queue.length) {
      const r = await runOne(root, tpl, queue.shift(), outDir);
      results.push(r);
      console.log(`  ${r.run.name}: exit ${r.exit ?? r.signal} ${r.seconds}s${r.error ? ` ${r.error}` : ''}`);
    }
  });
  await Promise.all(workers);

  // ---------------------------------------------------------------- 判定
  const summary = [];
  const errors = [];
  const today = new Date().toISOString().slice(0, 7);
  for (const r of results.sort((a, b) => a.run.name.localeCompare(b.run.name))) {
    const scenes = readResults(outDir, r.run.name);
    const failed = scenes.filter((s) => !s.ok);
    const kf = scenes.filter((s) => s.knownFailure);
    const noFixes = scenes.filter((s) => !s.fixes?.length);
    const row = { name: r.run.name, now: r.run.now, exit: r.exit, signal: r.signal, seconds: r.seconds, scenes: scenes.length, failed: failed.length, knownFailure: kf.length };
    summary.push(row);
    if (r.error) errors.push(`${r.run.name}: ${r.error}`);
    else if (r.exit !== 0) errors.push(`${r.run.name}: 終了コード ${r.exit ?? r.signal}(落ちた場面 ${failed.length}${failed.length ? '' : '。場面の外で中断'})`);
    else if (failed.length) errors.push(`${r.run.name}: 終了コード 0 なのに落ちた場面が ${failed.length} 件`);
    if (!scenes.length && !r.error) errors.push(`${r.run.name}: 場面の記録が無い`);
    for (const s of noFixes) errors.push(`${r.run.name}: 固定する決定(fixes)の無い場面「${s.label}」`);
    // 期待値を改めた記録の形(裁定 R-4): 引いた決定・日付・旧い期待値。決定の実在は check-fixes.mjs が確かめる
    for (const s of scenes) for (const c of s.changed ?? []) {
      if (!c?.by || !/^\d{4}-\d{2}-\d{2}$/.test(c.on ?? '') || c.from === undefined || c.from === '') errors.push(`${r.run.name}: 期待値を改めた記録(changed)の欄が欠けている「${s.label}」(by・on YYYY-MM-DD・from)`);
    }
    for (const s of kf) if (s.knownFailure.review && s.knownFailure.review < today) errors.push(`${r.run.name}: 落ちることを期待する印の見直しの時期を過ぎた「${s.label}」(${s.knownFailure.issue} / ${s.knownFailure.review})`);
  }
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ template: TEMPLATE_REF ?? 'worktree', kb: KB, runs: summary, errors }, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'fixes.md'), fixesTable(results.map((r) => r.run.name), outDir));
  fs.writeFileSync(path.join(outDir, 'changed.md'), changedTable(results.map((r) => r.run.name), outDir));
  console.log(summary.map((s) => `  ${s.name.padEnd(22)} 場面 ${String(s.scenes).padStart(4)} 落ちた ${String(s.failed).padStart(3)} 印 ${s.knownFailure} (${s.now})`).join('\n'));
  if (!KEEP) fs.rmSync(path.join(root, 'runs'), { recursive: true, force: true });
  if (errors.length) {
    console.error(`regress: 失敗\n${errors.map((e) => `  - ${e}`).join('\n')}\n結果: ${outDir}`);
    process.exit(1);
  }
  console.log(`regress: すべて通った。結果: ${outDir}`);
}

/** 期待値を改めた場面の一覧(裁定 R-4。PR の本文へ出す材料。生成物) */
function changedTable(names, outDir) {
  const lines = ['# 期待値を改めた場面(生成物。手で編集しない)', '', '| スクリプト | 場面 | 引いた決定 | 日付 | 旧い期待値 | いまの観測 |', '| --- | --- | --- | --- | --- | --- |'];
  const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  for (const name of names) for (const s of readResults(outDir, name)) for (const c of s.changed ?? []) {
    lines.push(`| ${name} | ${cell(s.label)} | ${cell(c.by)} | ${cell(c.on)} | ${cell(c.from)} | ${cell(s.observed ?? (s.ok ? '(場面の期待どおり)' : '(落ちた)'))} |`);
  }
  return `${lines.join('\n')}\n`;
}

/** 固定する決定 → 場面の対応表(場面の fixes から生成する。手で持たない。裁定 R-1.4) */
function fixesTable(names, outDir) {
  const map = new Map();
  for (const name of names) for (const s of readResults(outDir, name)) for (const f of s.fixes ?? []) {
    if (!map.has(f)) map.set(f, []);
    map.get(f).push(`${name}: ${s.label}`);
  }
  const key = (f) => (f.startsWith('ADR-') ? `0${f}` : f.startsWith('K') ? `1${f.slice(1).padStart(3, '0')}` : `2${f}`);
  const lines = ['# 固定する決定と場面の対応(生成物。手で編集しない)', ''];
  for (const f of [...map.keys()].sort((a, b) => key(a).localeCompare(key(b)))) {
    lines.push(`## ${f}(${map.get(f).length} 場面)`, '', ...map.get(f).map((s) => `- ${s}`), '');
  }
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
