// 回帰の試験の補助(#319 で research/319-deliberation/legacy-suite/fix288-tpl2/suite/lib.mjs から移した)。
//
// 元の仕組み(作業用の複製で、テンプレートのスクリプトを子プロセスとして実行し、場面ごとに ok / FAIL を出す)を保つ。
// 移すときに直したこと(裁定 R-1.2・R-3。詳細は research/319-deliberation/port-results.md):
//   - 作業の場所: スイートの下の w/ ではなく、run.mjs が作業ツリーの外(mkdtemp)に作る REGRESS_ROOT/w/<名>
//   - 場面の記録: 各場面の結果を REGRESS_RESULTS(JSON Lines)へも書く。固定する決定(fixes)と印を持たせる
//   - 時計: TODAY は止めた時計(clock.mjs)から求める。先読みが効いていなければ、場面に入る前に止める
//   - gh: PATH 上の代役(lib/bin/gh)。ghRun は代役が呼ばれたことを場面として確かめる
//   - fixes: 場面ごとの固定する決定。checker の fixes() で節ごとに宣言し、場面の名前に書かれた K 番号を加える
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (!globalThis.__REGRESS_CLOCK__) {
  console.error('lib.mjs: 時計が止まっていない。scripts/regress/run.mjs から流す(NODE_OPTIONS=--import lib/clock.mjs)');
  process.exit(2);
}
const ROOT = process.env.REGRESS_ROOT;
if (!ROOT || !fs.existsSync(path.join(ROOT, 'w'))) {
  console.error('lib.mjs: REGRESS_ROOT(作業の場所)が無い。scripts/regress/run.mjs から流す');
  process.exit(2);
}

// 論理の時計(lib/clock.mjs)。REGRESS_NOW から始め、子プロセスを起動するたびに 1 秒進める
let logical = Date.parse(process.env.REGRESS_NOW);
const tick = () => {
  logical += 1000;
  globalThis.__REGRESS_CLOCK_SET__(logical);
  return new Date(logical).toISOString();
};

/** 作業の場所の最上位(元は スイートのディレクトリ。w/ の親) */
export const HERE = ROOT;
/** 試験の対象のテンプレートの写し(run.mjs が作る。unit が config.mjs を直接読む) */
export const TPL = process.env.REGRESS_TPL;
/** 構成管理の下の入力(replay の入力・probe-policy の本文) */
export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

export function workspace(name) {
  const DIR = path.join(ROOT, 'w', name);
  if (!fs.existsSync(path.join(DIR, '.git'))) {
    console.error(`lib.mjs: 作業用の複製 ${name} が無い(run.mjs の manifest の workspaces に足す)`);
    process.exit(2);
  }
  const run = (cmd, args, env = {}) => {
    const extra = { ...env };
    // 論理の時計を 1 秒進め、子プロセスと git へ同じ時刻を渡す(lib/clock.mjs)。場面が時刻を指定したときは、その時刻を渡す
    if (!extra.REGRESS_NOW) extra.REGRESS_NOW = tick();
    Object.assign(extra, { GIT_AUTHOR_DATE: extra.REGRESS_NOW, GIT_COMMITTER_DATE: extra.REGRESS_NOW });
    try {
      return { ok: true, out: execFileSync(cmd, args, { cwd: DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GITHUB_BASE_REF: '', ...extra } }) };
    } catch (e) {
      return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
    }
  };
  const git = (...args) => run('git', args);
  const write = (rel, obj) => {
    fs.mkdirSync(path.dirname(path.join(DIR, rel)), { recursive: true });
    fs.writeFileSync(path.join(DIR, rel), typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
  };
  const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8');
  const cfg = () => JSON.parse(read('process.config.json'));
  const gen = (...args) => run('node', ['scripts/init/generate-profile.mjs', ...args]);
  const change = (c, dry = false) => {
    write('change.json', c);
    return gen('--change', 'change.json', ...(dry ? ['--dry-run'] : []));
  };
  const contract = (...args) => run('node', ['scripts/gate/verify-gate-contract.mjs', ...args]);
  const checkD0 = () => run('node', ['scripts/gate/check-d0.mjs']);
  const checkRules = () => run('node', ['scripts/gate/check-process-rules.mjs']);
  const resetTo = (ref) => {
    git('reset', '-q', '--hard', ref);
    git('clean', '-qfd');
  };
  const commit = (msg) => {
    git('add', '-A');
    git('commit', '-q', '-m', msg);
  };
  /** 様式から D-0 を作る(frontmatter を埋める) */
  const d0 = (version = '1.0') =>
    write(
      'docs/D-0-governance.md',
      read('templates/00-d0-governance.md')
        .replace(/^version:.*$/m, `version: ${version}`)
        .replace(/^approver:.*$/m, 'approver: 山田 太郎')
        .replace(/^approved_at:.*$/m, 'approved_at: 2026-09-30')
        .replace(/^approval_scope:.*$/m, 'approval_scope: all')
        .replace(/^next_review:.*$/m, 'next_review: 2027-03-31')
    );
  const d0Version = () => read('docs/D-0-governance.md').match(/^version:\s*(.+)$/m)?.[1].trim();
  return { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0, d0Version };
}

/** gh の代役の呼び出しの行数(REGRESS_GH_LOG) */
const ghCalls = () => {
  const f = process.env.REGRESS_GH_LOG;
  return f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean) : [];
};

const SCRIPT = process.env.REGRESS_SCRIPT ?? path.basename(process.argv[1] ?? '', '.mjs');
const RESULTS = process.env.REGRESS_RESULTS;
const BASE_FIXES = JSON.parse(process.env.REGRESS_FIXES ?? '[]');
const K_IN_LABEL = /(?<![A-Za-z0-9])K\d{1,2}(?![0-9])/g;

/**
 * 場面の判定と記録。
 *   check(名前, 条件, 詳細, { fixes, knownFailure, changed })
 *   fixes(['K60', 'ADR-0079'])  以後の場面の固定する決定(節の宣言)。場面の名前に書かれた K 番号は自動で加える
 *   knownFailure: { issue: '#NNN', match: '拒否の理由の文' | ['理由1', '理由2'], on: 'YYYY-MM-DD', review: 'YYYY-MM' }
 *              または { issue, observed: '観測の値', on, review }(観測を期待値と比べる場面)
 *     落ちることを期待する印(裁定 R-2.5・R-2.6、§8 X-4・X-11)。
 *     match の形: 詳細(出力)の拒否の理由(reasons)の集合が match と一致して落ちたときだけ通る。理由の件数が match の件数と
 *       同じで、各 match を別々の理由の1件が含むこと。期待した理由に別の理由が加わったら失敗(印が新しい拒否を覆い隠さない)。
 *     observed の形: 場面の観測(opts.observed)が observed とちょうど一致して落ちたときだけ通る。
 *     通ったら失敗(予期しない通過)。on は印を付けた日、review は見直しの月(01〜12)で、付けた月から 6 か月以内
 *     (KF_REVIEW_MONTHS。暫定の値。ADR-0089 決定4・EV-0183)。review を過ぎた印は run.mjs が失敗にする
 *   dependsOn: '根の場面の名前'  根の場面の印に従属する連鎖の場面(裁定 7.5 J-1)。根が印のとおりに落ちている間は、
 *     この場面が落ちることを「根に従属して落ちる」として通す。根が落ちているのにこの場面が通ったら失敗。
 *     根が通ったら(根は予期しない通過で失敗する)、この場面は条件どおりに判定する
 *   changed: [{ by: 'ADR-NNNN' | '#NNN', on: 'YYYY-MM-DD', from: '旧い期待値' }]  期待値を改めた記録(裁定 R-4)
 */
export function checker() {
  const VERBOSE = process.argv.includes('-v');
  let bad = 0;
  let n = 0;
  let section = [];
  /** 場面の名前 → { kf: 印, cond } (dependsOn の根を引く) */
  const states = new Map();
  const fixes = (list) => {
    section = [...list];
  };
  const record = (entry) => {
    if (RESULTS) fs.appendFileSync(RESULTS, `${JSON.stringify(entry)}\n`);
  };
  const check = (label, cond, detail = '', opts = {}) => {
    if (opts.knownFailure && opts.dependsOn !== undefined) throw new Error(`lib.mjs: 場面「${label}」に knownFailure と dependsOn の両方がある`);
    const fx = [...new Set([...BASE_FIXES, ...section, ...(opts.fixes ?? []), ...(String(label).match(K_IN_LABEL) ?? [])])];
    let pass = Boolean(cond);
    let note = '';
    const kf = opts.knownFailure;
    const root = opts.dependsOn !== undefined ? states.get(opts.dependsOn) : null;
    if (kf) {
      const formProblem = kfFormProblem(kf);
      if (formProblem) {
        pass = false;
        note = `印の欄の形が違う: ${formProblem}`;
      } else if (cond) {
        pass = false;
        note = `予期せず通った(落ちることを期待する印 ${kf.issue})`;
      } else if (kf.observed !== undefined) {
        pass = String(opts.observed) === kf.observed;
        note = pass ? `落ちることを期待する印(${kf.issue}、観測 ${kf.observed}、見直し ${kf.review})` : `期待と別の観測で落ちた(印 ${kf.issue} の観測: ${kf.observed}、いま: ${opts.observed})`;
      } else {
        const why = reasonSetMismatch(reasons(detail), [].concat(kf.match));
        pass = !why;
        note = pass ? `落ちることを期待する印(${kf.issue}、見直し ${kf.review})` : `期待と別の理由で落ちた(印 ${kf.issue}: ${why})`;
      }
    } else if (opts.dependsOn !== undefined) {
      if (!root || !root.kf) {
        pass = false;
        note = `従属する根の場面(印つき)が、この場面より前に無い: ${opts.dependsOn}`;
      } else if (!root.cond && cond) {
        pass = false;
        note = `根が落ちているのに通った(根: ${opts.dependsOn})`;
      } else if (!root.cond) {
        pass = true;
        note = `根に従属して落ちる(根: ${opts.dependsOn}、印 ${root.kf.issue})`;
      }
    }
    states.set(label, { kf: kf ?? null, cond: Boolean(cond) });
    if (!pass) bad++;
    n++;
    console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${note ? `  [${note}]` : ''}`);
    if ((!pass || VERBOSE) && detail) {
      const lines = String(detail).trim().split('\n').filter((l) => !/^- なし$|^$|較正引き継ぎ|人へ戻る判定件数/.test(l));
      const shown = lines.length > 30 ? [...lines.slice(0, 8), '...', ...lines.slice(-20)] : lines;
      console.log(shown.map((l) => `       ${l.slice(0, 400)}`).join('\n'));
    }
    record({
      script: SCRIPT,
      n,
      label,
      ok: pass,
      cond: Boolean(cond),
      fixes: fx,
      ...(kf ? { knownFailure: kf } : {}),
      ...(opts.dependsOn !== undefined ? { dependsOn: opts.dependsOn, ...(root?.kf ? { knownFailure: { ...root.kf, dependsOn: opts.dependsOn } } : {}) } : {}),
      ...(opts.words ? { words: opts.words } : {}),
      ...(opts.section ? { section: opts.section } : {}),
      ...(opts.changed ? { changed: opts.changed } : {}),
      ...(opts.kind ? { kind: opts.kind } : {}),
      ...(opts.observed !== undefined ? { observed: opts.observed } : {}),
      ...(!pass || process.env.REGRESS_CAPTURE ? { detail: String(detail).slice(0, 4000) } : {}),
    });
    return pass;
  };
  const split = (rest) => {
    const last = rest.at(-1);
    return last && typeof last === 'object' ? [rest.slice(0, -1), last] : [rest, {}];
  };
  // 拒否・反映の照合。拒否は、出力の全体ではなく、拒否の理由の 1 件(reasons)の中で語を照合する(裁定 R-1.2・品質保証 Q6)。
  // 元は出力のどこかに語があれば通り、構成の差分の節に同じ語があるだけで、別の理由の拒否でも通った
  //
  // 照合は2つに分ける(裁定 7.5 J-5)。語は拒否の理由の 1 件の中で照合し、拒否の対象(差分のどの節に何が出たか)は
  // opts.section = { heading: '節の見出しの書き出し', words: [...] } で、その節の中だけで照合する。
  // 2つを1回の照合にまとめない。出力の全体へ戻すと、別の節の同じ語で通る(品質保証 Q6)
  const refused = (label, r, ...rest) => {
    const [words, opts] = split(rest);
    const entries = reasons(r.out);
    const matched = entries.some((e) => words.every((w) => e.includes(w)));
    let why = entries.length ? '' : '[照合] 拒否の理由([エラー] / ::error:: の行)が出力に無い\n';
    let inSection = true;
    if (opts.section) {
      const body = sectionOf(r.out, opts.section.heading);
      inSection = body !== null && opts.section.words.every((w) => body.includes(w));
      if (!inSection) why += `[照合] 差分の節「${opts.section.heading}」に ${JSON.stringify(opts.section.words)} が無い${body === null ? '(節が無い)' : ''}\n`;
    }
    return check(`${label} → 拒否`, !r.ok && matched && inSection, why + r.out, { ...opts, words, kind: 'refused' });
  };
  const accepted = (label, r, ...rest) => {
    const [words, opts] = split(rest);
    return check(`${label} → 反映`, r.ok && words.every((w) => r.out.includes(w)), r.out, { ...opts, words, kind: 'accepted' });
  };
  /** gh の代役を呼ぶはずのコマンドを実行し、代役が呼ばれたことを場面として確かめる(裁定 R-1.2) */
  const ghRun = (W, label, cmd, args, env = {}) => {
    const before = ghCalls().length;
    const r = W.run(cmd, args, env);
    const calls = ghCalls().slice(before);
    check(`[代役] ${label}: gh の代役が呼ばれた`, calls.length > 0, r.out, { kind: 'harness' });
    return r;
  };
  const done = () => {
    console.log(bad ? `${bad} FAILED` : 'all ok');
    process.exit(bad ? 1 : 0);
  };
  return { check, refused, accepted, ghRun, fixes, done };
}

/** 印の見直しの時期の上限(付けた月からの月数)。暫定の値(ADR-0089 決定4・EV-0183) */
export const KF_REVIEW_MONTHS = 6;
const monthIndex = (ym) => {
  const m = /^(\d{4})-(\d{2})$/.exec(ym ?? '');
  return m && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
};
/** 落ちることを期待する印の欄の形の問題。無ければ null(§8 X-11) */
export function kfFormProblem(kf) {
  if (!/^#\d+$/.test(kf?.issue ?? '')) return 'issue は #NNN';
  const hasMatch = kf.match !== undefined;
  const hasObserved = kf.observed !== undefined;
  if (hasMatch === hasObserved) return 'match か observed のどちらか一方';
  if (hasMatch && !([].concat(kf.match).length && [].concat(kf.match).every((x) => typeof x === 'string' && x))) return 'match は空でない文字列か、その配列';
  if (hasObserved && (typeof kf.observed !== 'string' || !kf.observed)) return 'observed は空でない文字列';
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(kf.on ?? '');
  const on = d ? monthIndex(`${d[1]}-${d[2]}`) : null;
  if (on === null || Number(d[3]) < 1 || Number(d[3]) > 31) return 'on(印を付けた日)は YYYY-MM-DD';
  const review = monthIndex(kf.review);
  if (review === null) return 'review(見直しの月)は YYYY-MM(月は 01〜12)';
  if (review < on) return 'review が on より前';
  if (review - on > KF_REVIEW_MONTHS) return `review は on の月から ${KF_REVIEW_MONTHS} か月以内`;
  return null;
}
/**
 * 拒否の理由の集合が、期待した理由(各 1 件の部分文字列)と一致するか。一致すれば null、しなければ理由(§8 X-4)。
 * 件数が同じで、期待した各理由を、別々の理由の 1 件が含むこと
 */
export function reasonSetMismatch(entries, wants) {
  if (entries.length !== wants.length) return `拒否の理由が ${entries.length} 件(期待 ${wants.length} 件: ${wants.join(' / ')})。${entries.map((e) => e.split('\n')[0]).join(' / ')}`;
  const left = [...entries];
  for (const w of wants) {
    const i = left.findIndex((e) => e.includes(w));
    if (i < 0) return `期待した理由「${w}」を含む理由が無い。${entries.map((e) => e.split('\n')[0]).join(' / ')}`;
    left.splice(i, 1);
  }
  return null;
}

/**
 * 拒否の出力から、拒否の理由を 1 件ずつ取り出す。
 * テンプレートのスクリプトは、拒否の理由を「[エラー] …」または「::error::…」の行で出し、続く字下げ・箇条の行に内訳を書く。
 * 理由の 1 件 = 印の行から、次の印の行・空行・見出し(#)の手前まで。印の行が無い出力からは何も取り出さない(照合は落ちる)。
 */
export function reasons(out) {
  const entries = [];
  let cur = null;
  for (const line of String(out ?? '').split('\n')) {
    if (/^\s*(\[エラー\]|::error::)/.test(line)) {
      if (cur) entries.push(cur);
      cur = line;
    } else if (cur !== null && line.trim() && !/^#/.test(line) && (/^\s+/.test(line) || /^- /.test(line))) {
      cur += `\n${line}`;
    } else if (cur !== null) {
      entries.push(cur);
      cur = null;
    }
  }
  if (cur) entries.push(cur);
  return entries;
}

/**
 * 構成の差分の出力から、見出し「## <heading>…」の節の本文を取り出す。次の見出し(## )か拒否の理由の行の手前まで。
 * 節が無ければ null
 */
export function sectionOf(out, heading) {
  const lines = String(out ?? '').split('\n');
  const i = lines.findIndex((l) => l.startsWith(`## ${heading}`));
  if (i < 0) return null;
  const body = [];
  for (const l of lines.slice(i + 1)) {
    if (/^## /.test(l) || /^\s*(\[エラー\]|::error::)/.test(l)) break;
    body.push(l);
  }
  return body.join('\n');
}

export const BASE = { 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' };
export const NAMES = ['山田 太郎', '佐藤 花子', '鈴木 一郎', '高橋 次郎', '田中 三郎', '伊藤 四郎', '渡辺 五郎', '中村 六郎', '小林 七郎', '加藤 八郎', '吉田 九郎', '山本 十郎', '松本 一', '井上 二', '木村 三'];
export const SEATS = ['biz-approver', 'value-owner', 'tech-lead', 'dev-verifier', 'independent-reviewer', 'qa-gatekeeper', 'context-owner', 'ai-maintainer', 'ai-ops'];

// 第3巡(K60): 席の責任者の任免は、D-0 表1 の決定者の記名を要する。初期化の直後(全席が未記入)の初回の記入は、
// この変化点で「体制と運用形態」の決定者(事業決裁者)の席に記入する人の記名と理由で、1回の変化点として受け付ける
export const APPOINTER = { id: 'org', name: '組織 任命者', external: true, appointer: true };
/** 名簿と全席を、事業決裁者の席に記入する人の記名で1回の変化点として記入する */
export function fill(W, people, seats, { date = TODAY, summary = '体制を記入', signer = null, extra = {} } = {}) {
  const ref = seats['biz-approver']?.accountable;
  const who = signer ?? people.find((p) => p.id === ref || p.name === ref)?.name ?? ref;
  return W.change({ kind: 'accountable', date, summary, people, seats, decidedBy: who, reason: '初期の体制を記入する', ...extra });
}
// 第3巡(K55): 変更種別の登録の根拠(#302〜#310 組C の C-3 の決定で、detection を検知条件ごとの 3 欄へ)
export const BASIS = { detection: { rejectionRate: 'docs/metrics/q3.md(差し戻しの件数から算出)', duplicationRate: 'docs/metrics/q3.md(類似の検知の出力から算出)', reworkRate: 'docs/metrics/q3.md(14日以内の書き換えの行数から算出)' }, rollback: 'docs/rollback/2026-09.md(文言の取り消しを3回実行)', tests: 'tests/i18n/*.spec.ts が全キーの表示を確かめる' };
// 第3巡(K65): 発効日は未来を受け付けず、最後の記録より前も受け付けない。初期化の記録は実行日になるため、
// 場面の発効日は実行日(手元の時刻帯)にそろえる。実行日は、run.mjs がスクリプトごとに宣言した時刻(止めた時計)である
export const TODAY = (() => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();
