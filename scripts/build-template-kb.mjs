// テーラリング知識ベースを、テンプレートリポジトリへ複製できる JSON へ変換する。
//
// テンプレート側(pit-in-template)はゲートのスクリプトを依存パッケージなしで動かすため、
// YAML パーサを持たない。正本は src/data/ の YAML であり、本スクリプトはその符号化を行う。
//
//   node scripts/build-template-kb.mjs            # 既定の出力先へ書き出す
//   node scripts/build-template-kb.mjs --print    # 標準出力へ出す(差分検査で使う)
//   node scripts/build-template-kb.mjs --out <path>
//
// 出力先の既定は template/scripts/vendor/tailoring-kb.json。
// submodule を初期化していない場合は ../pit-in-template/ を試す。

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import GithubSlugger from 'github-slugger';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TAILORING_DIR = path.join(ROOT, 'src/data/tailoring');
const PROCESS_FILE = path.join(ROOT, 'src/data/processes/integrated.yaml');

/** rules-*.yaml をファイル名の昇順で読み、規則を1配列へ平坦化する(記載順を保つ) */
function loadRules() {
  const files = fs
    .readdirSync(TAILORING_DIR)
    .filter((f) => f.startsWith('rules-') && f.endsWith('.yaml'))
    .sort();
  const rules = [];
  for (const f of files) {
    const doc = YAML.parse(fs.readFileSync(path.join(TAILORING_DIR, f), 'utf8'));
    for (const r of doc.rules ?? []) rules.push({ ...r, sourceFile: f });
  }
  return rules;
}

function loadYaml(file) {
  return YAML.parse(fs.readFileSync(file, 'utf8'));
}

/** 公開サイトの基底。案件のリポジトリからはサイト相対パスをたどれないため、絶対 URL で渡す */
const SITE = 'https://takenori-kusaka.github.io';
const BASE_PATH = '/process-compass';

/** サイト相対の参照(/process-compass/...)を絶対 URL へ直す */
function abs(href) {
  if (typeof href !== 'string') return null;
  return href.startsWith('/') ? `${SITE}${href}` : href;
}

/**
 * 構成の各項目から標準の該当節へたどれるようにする(#221)。
 * 参照先が案件へ届かないと、規定があっても「規定がない」と扱われる。
 */
function withSource(obj) {
  if (Array.isArray(obj)) return obj.map(withSource);
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = k === 'source' || k === 'href' ? abs(v) : withSource(v);
  }
  return out;
}

/**
 * ゲートごとの見出しアンカーを、判定基準のページから読み取る。
 *
 * 参照先がページ全体だと、案件側は該当ゲートの基準まで自力で探すことになる。
 * 見出しの文言が変わってもここが追随するよう、本文から拾う(#221)。
 */
function gateAnchors() {
  const file = path.join(ROOT, 'src/content/docs/phase4-process-design/gate-criteria.md');
  const slugger = new GithubSlugger();
  const anchors = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (!m) continue;
    const slug = slugger.slug(m[1]);
    const g = m[1].match(/^(G-\d)\s/);
    if (g) anchors[g[1]] = slug;
  }
  return anchors;
}

/**
 * 適用範囲が限定される条項を、見出しの注記から拾う(#226 / ADR-0039)。
 *
 * 案件は「自分へどの条項が適用されるか」を、標準本文を全部読まずに知る手段を持たない。
 * ただし判定の単位を混ぜてはならない。リスク区分(R)は変更ごとに判定するため、
 * 案件の構成から適用外を宣言できるのは安全重要度(CL)などの側だけである。
 */
function clauseScopes() {
  const SCOPE_RE = /[((]適用:\s*([^))]+)[))]/;
  const DIRS = ['phase4-process-design', 'phase5-implementation', 'phase6-operation'];
  const out = [];

  for (const dir of DIRS) {
    const base = path.join(ROOT, 'src/content/docs', dir);
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base).sort()) {
      if (!name.endsWith('.md')) continue;
      const slugger = new GithubSlugger();
      const page = `${dir}/${name.replace(/\.md$/, '')}`;
      for (const line of fs.readFileSync(path.join(base, name), 'utf8').split(/\r?\n/)) {
        const h = /^#{2,4}\s+(.+?)\s*$/.exec(line);
        if (!h) continue;
        const slug = slugger.slug(h[1]);
        const m = SCOPE_RE.exec(h[1]);
        if (!m) continue;
        const range = m[1].trim();
        out.push({
          title: h[1].replace(SCOPE_RE, '').trim(),
          range,
          unit: /R[123]/.test(range) ? 'per-change' : /CL[0-3]/.test(range) ? 'per-project' : 'other',
          source: `${SITE}${BASE_PATH}/${page}/#${slug}`,
        });
      }
    }
  }
  return out;
}

export function buildKb() {
  const questions = loadYaml(path.join(TAILORING_DIR, 'questions.yaml')).questions;
  const constraints = loadYaml(path.join(TAILORING_DIR, 'constraints.yaml')).constraints;
  const practices = loadYaml(path.join(TAILORING_DIR, 'practices.yaml')).practices;
  const model = loadYaml(PROCESS_FILE);

  const anchors = gateAnchors();

  // 工程ゲート(G-1〜G-8)のみを取り出す。ステージ移行ゲート(SG-n)はテンプレートの CI では扱わない
  const gates = model.gates
    .filter((g) => /^G-\d$/.test(g.label ?? ''))
    .map((g) => ({
      id: g.id,
      label: g.label,
      name: g.name,
      approver: g.approver,
      approverRole: g.approverRole ?? null,
      // 判定基準の中身。正本は第4章の判定基準表であり、integrated.yaml は生成物(ADR-0048)。
      // 判定のたびに822行の本文から人が引き写す運用を無くすために配る。
      criteria: g.criteria ?? [],
      // 表の外にある規範は降ろせない。降りていないことを明示する(ADR-0048 決定3)。
      // 部分的な配送を、完全な配送として見せてはならない。
      criteriaComplete: false,
      criteriaNote:
        'この一覧は標準 第4章の判定基準表のみである。表の外にある規範(手続・禁止・注記)は含まない。source を参照すること',
      source: abs(g.href) + (anchors[g.label] ? `#${anchors[g.label]}` : ''),
    }));

  const roles = model.roles.map((r) => ({
    id: r.id,
    name: r.name,
    responsibility: r.responsibility,
    source: abs(r.href),
  }));

  // 兼務を禁止する組み合わせ。案件の構成で「担ってはならない工程」を導出するために渡す(ADR-0035)
  const separations = (model.separations ?? []).map((s) => ({
    id: s.id,
    roles: s.roles ?? null,
    scope: s.scope,
    reason: s.reason,
    exception: s.exception ?? 'none',
    gate: s.gate ?? null,
    source: abs(s.source ?? '/process-compass/phase4-process-design/roles-responsibilities/'),
  }));

  return {
    schemaVersion: 0,
    note: '自動生成。正本は process-compass の src/data/。手で編集しない',
    // 生成元の版。案件が「自分の KB が標準のどの時点のものか」を知る唯一の手段。
    // 標準の本文を案件へ同梱する場合、この値と同梱側のコミットが一致することを検査する。
    source: sourceVersion(),
    questions: withSource(questions),
    rules: withSource(loadRules()),
    constraints: withSource(constraints),
    practices: withSource(practices),
    gates,
    roles,
    separations,
    clauseScopes: clauseScopes(),
  };
}

/**
 * 生成元の版を返す。
 * commit は標準リポジトリの HEAD。dirty のときは末尾へ `-dirty` を付ける。
 * 案件は、この commit と同梱した標準の版が一致するかを検査できる。
 */
function sourceVersion() {
  const run = (cmd) => {
    try {
      return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return null;
    }
  };
  return {
    repository: 'https://github.com/Takenori-Kusaka/process-compass',
    commit: run('git rev-parse HEAD') ?? 'unknown',
    // 生成の日時と作業ツリーの汚れは入れない。
    // どちらも生成のたびに変わり、複製の検査が本文の編集で落ちるようになる。
    // 版の識別にはコミットで足りる。
  };
}

function defaultOut() {
  const inSubmodule = path.join(ROOT, 'template/scripts/vendor/tailoring-kb.json');
  if (fs.existsSync(path.join(ROOT, 'template'))) return inSubmodule;
  return path.resolve(ROOT, '../pit-in-template/scripts/vendor/tailoring-kb.json');
}

const args = process.argv.slice(2);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const json = JSON.stringify(buildKb(), null, 2) + '\n';
  if (args.includes('--print')) {
    process.stdout.write(json);
  } else {
    const outIdx = args.indexOf('--out');
    const out = outIdx >= 0 ? args[outIdx + 1] : defaultOut();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, json, 'utf8');
    console.log(`wrote ${out} (${json.length} bytes)`);
  }
}
