// テンプレートリポジトリへ複製した資産と、複製元の乖離を検出する。
//
//   node scripts/check-template-drift.mjs
//
// 正本は本リポジトリの src/ 側です。複製を先に書き換えても、検査は一致を求めます。
// テーラリングの判定ロジックが2箇所へ分かれ、標準の改訂がテンプレートへ伝わらなくなる
// 状態を防ぐための検査です。
//
// submodule(template/)を初期化していない環境では、検査を飛ばします。
// クローン直後に npm run check が失敗する構成にしないためです。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKb } from './build-template-kb.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(ROOT, 'template');

if (!fs.existsSync(path.join(TEMPLATE, 'process.config.json'))) {
  console.log('template/ が未初期化のため、複製の検査を飛ばします');
  console.log('  初期化: git submodule update --init --recursive');
  process.exit(0);
}

const problems = [];

/** 1. テーラリングエンジンの本文が一致するか */
const engineSrc = path.join(ROOT, 'src/lib/tailoring-engine.mjs');
const engineDst = path.join(TEMPLATE, 'scripts/vendor/tailoring-engine.mjs');

const norm = (s) => s.replace(/\r\n/g, '\n');

if (!fs.existsSync(engineDst)) {
  problems.push('template/scripts/vendor/tailoring-engine.mjs がありません');
} else if (norm(fs.readFileSync(engineSrc, 'utf8')) !== norm(fs.readFileSync(engineDst, 'utf8'))) {
  problems.push(
    'テーラリングエンジンが複製元と一致しません。' +
      'cp src/lib/tailoring-engine.mjs template/scripts/vendor/tailoring-engine.mjs'
  );
}

/** 2. 知識ベースが最新の YAML から生成されたものか */
const kbDst = path.join(TEMPLATE, 'scripts/vendor/tailoring-kb.json');
if (!fs.existsSync(kbDst)) {
  problems.push('template/scripts/vendor/tailoring-kb.json がありません');
} else {
  const expected = JSON.stringify(buildKb(), null, 2) + '\n';
  const actual = fs.readFileSync(kbDst, 'utf8');
  if (norm(expected) !== norm(actual)) {
    problems.push(
      '知識ベースが複製元の YAML と一致しません。node scripts/build-template-kb.mjs を実行してください'
    );
  }
}

/** 3. テンプレートが参照するゲートの識別子が、参照モデルと一致するか */
const kb = buildKb();
const keys = kb.gates.map((g) => g.label.replace('-', '').toLowerCase());
const cfg = JSON.parse(fs.readFileSync(path.join(TEMPLATE, 'process.config.json'), 'utf8'));
for (const k of keys) {
  if (!cfg.gates[k]) problems.push(`template/process.config.json に ${k} の定義がありません`);
}
for (const k of Object.keys(cfg.gates)) {
  if (!keys.includes(k)) problems.push(`template/process.config.json の ${k} は参照モデルに存在しません`);
}

/** 4. 配布テンプレート(template/templates/)が、標準本体のテンプレ0〜10 と対応しているか
 *
 * 配布テンプレートは記入用、標準本体は規定用であり、粒度も見出し構成も異なります。
 * したがって全文一致も見出し集合の一致も要求できません(要求すると直しようのない警告になる)。
 * 機械的に判定でき、かつ乖離したら必ず誤りである3点だけを検査します。
 *
 *   4-a. テンプレ番号と配布ファイルの対応(存在と過不足)
 *   4-b. テンプレ番号とゲートの対応(標準本体の一覧表 と 配布側 README の表)
 *   4-c. 両側に現れなければならない項目名(二重規範が判明した箇所を再発させない)
 */
const STANDARD_DOC = path.join(ROOT, 'src/content/docs/phase4-process-design/deliverable-templates.md');
const TEMPLATE_DIR = path.join(TEMPLATE, 'templates');

// テンプレ番号 → 配布ファイル名。推測せず、ここで明示的に対応づける
const TEMPLATE_FILES = {
  0: '00-d0-governance.md',
  1: '01-feature-spec.md',
  2: '02-adr.md',
  3: '03-debt-ledger.md',
  4: '04-gate-record.md',
  5: '05-handover.md',
  6: '06-project-brief.md',
  7: '07-implementation-plan.md',
  8: '08-ai-sla.md',
  9: '09-safety-risk-assessment.md',
  10: '10-assumption-ledger.md',
  11: '11-quality-assurance-policy.md',
};

// 標準本体で新設したが、配布テンプレートがまだ無い様式。テンプレ番号 → 実装マークの番号。
// 降りていない規定は消さずに表示し続ける(#222)。ここへ載せた様式は失敗にせず「降りていない」と
// 表示する。ただし、対応する実装マークが state=undelivered で実在する場合に限る。マークが無い・
// delivered になった様式をここへ残すと失敗にする。配布テンプレートを置いたら TEMPLATE_FILES へ移す。
// テンプレ11(IMPL-0058)は配布済み(#288)。現在、配布待ちの様式は無い
const PENDING_TEMPLATES = {};

// 標準の様式番号を持たない補助の様式(#288 第2巡)。標準の本文が記録を要求し、様式そのものは準拠テンプレートが持つ。
// 配布ファイル名 → 要求の所在(src/content/docs からの相対パス)と、本文に実在すべき語句
const AUX_TEMPLATES = {
  // 第4章 G-7「基準1・2 の記録」: 欠陥の台帳(重大度・優先度・状態)。台帳が無い出荷は記載の欠落
  'defect-ledger.md': { doc: 'phase4-process-design/gate-criteria.md', phrase: '欠陥の台帳が無い出荷は、基準2 を確かめられない' },
  // 附属書I I.11: 導入前の検証の合否の基準(実行の前に採用者が記入する)
  'adoption-trial-criteria.md': { doc: 'phase4-process-design/adoption-guide.md', phrase: '## 1. 合否の基準(実行の前に記入する。採用者が書き、コマンドが写す)' },
};

// 標準本体と配布テンプレートの双方に現れなければならない項目名。
// 片側にしか無い項目が二重規範を生んだ事例(ADR-0031)への対処であり、網羅表ではありません。
// 粒度の違いによる差は対象外とし、両側で同一の語で規定すると決めた項目だけを列挙します。
// 乖離が判明して両側へ揃えたときに、再発防止として追記してください。
const SHARED_TERMS = {
  6: ['現在の代替手段', 'その代替手段が使われ続ける条件', '効果が出ない条件'],
};

// 見出しから次の同レベル見出しまでを切り出す。様式は ```markdown ブロックの中にあり、
// その中の「## ...」は本文の見出しではないため、フェンスの内側は区切りとみなさない
const sectionBody = (md, startsWith) => {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.startsWith(startsWith));
  if (start < 0) return null;
  const out = [];
  let fenced = false;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('```')) fenced = !fenced;
    else if (!fenced && line.startsWith('## ')) break;
    out.push(line);
  }
  return out.join('\n');
};

const readTable = (md) =>
  md
    .split('\n')
    .filter((l) => l.trimStart().startsWith('|') && !/^\s*\|[\s|:-]+\|\s*$/.test(l))
    .map((l) => l.trim().slice(1, -1).split('|').map((c) => c.trim()));

// 「全ゲート」は個別の識別子を列挙しない表現のため、比較対象から外す
const gatesOf = (cell) => (cell.includes('全ゲート') ? null : [...new Set(cell.match(/G-\d/g) ?? [])].sort().join(','));

if (!fs.existsSync(TEMPLATE_DIR)) {
  problems.push('template/templates/ がありません');
} else {
  const standard = fs.readFileSync(STANDARD_DOC, 'utf8');

  const standardSection = sectionBody(standard, '## 成果物と様式の対応');

  /** 4-a. 対応するファイルと見出しが存在するか */
  const headings = new Set(
    [...standard.matchAll(/^## テンプレ(\d+):/gm)].map((m) => Number(m[1]))
  );
  for (const [num, file] of Object.entries(TEMPLATE_FILES)) {
    if (!headings.has(Number(num))) {
      problems.push(`標準本体に「## テンプレ${num}:」の見出しがありません(${file} に対応する規定)`);
    }
    if (!fs.existsSync(path.join(TEMPLATE_DIR, file))) {
      problems.push(`template/templates/${file} がありません(標準本体のテンプレ${num} に対応)`);
    }
  }
  const known = new Set(Object.values(TEMPLATE_FILES));
  for (const f of fs.readdirSync(TEMPLATE_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
    if (known.has(f)) continue;
    // 標準の様式番号を持たない補助の様式(#288)。標準の本文が、その記録を要求していることを確かめる
    const aux = AUX_TEMPLATES[f];
    if (aux) {
      const text = fs.readFileSync(path.join(ROOT, 'src/content/docs', aux.doc), 'utf8');
      if (!text.includes(aux.phrase)) {
        problems.push(`template/templates/${f} は補助の様式ですが、標準(${aux.doc})に「${aux.phrase}」がありません`);
      }
      continue;
    }
    // 記入見本(`*-sample-*.md`)は様式ではありません。標準の第6章に対応する規定を持たず、
    // 必須欄の検査(check-template-fields.mjs)の対象にもしません。ただし対応する様式が
    // 存在しない見本は、様式なしの記入例になるため許しません。
    const sample = /^[a-z0-9]+-sample-(.+)\.md$/.exec(f);
    if (sample) {
      if (!known.has(`${sample[1]}.md`) && ![...known].some((k) => k.endsWith(`${sample[1]}.md`))) {
        problems.push(
          `template/templates/${f} は記入見本ですが、対応する様式(${sample[1]}.md)がありません`,
        );
      }
      continue;
    }
    problems.push(
      `template/templates/${f} は対応表にありません。様式なら scripts/check-template-drift.mjs の ` +
        `TEMPLATE_FILES へ追加し、記入見本なら <ゲート>-sample-<様式名>.md の名前にしてください`,
    );
  }
  const docsText = () => {
    const out = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.mdx?$/.test(e.name)) out.push(fs.readFileSync(full, 'utf8'));
      }
    };
    walk(path.join(ROOT, 'src/content/docs'));
    return out.join('\n');
  };
  let docs = null;
  for (const num of headings) {
    if (num in TEMPLATE_FILES) continue;
    const impl = PENDING_TEMPLATES[num];
    if (!impl) {
      problems.push(`標準本体のテンプレ${num} に対応する配布テンプレートがありません`);
      continue;
    }
    docs ??= docsText();
    const mark = new RegExp(`<!--\\s*impl\\s+${impl}\\b[^>]*state=undelivered`);
    if (!mark.test(docs)) {
      problems.push(
        `標準本体のテンプレ${num} は配布待ち(${impl})として登録されていますが、${impl} の state=undelivered の実装マークがありません`,
      );
      continue;
    }
    console.log(`降りていない: 標準本体のテンプレ${num} の配布テンプレートはまだありません(${impl})`);
  }
  for (const num of Object.keys(PENDING_TEMPLATES).map(Number)) {
    if (num in TEMPLATE_FILES) {
      problems.push(`テンプレ${num} は TEMPLATE_FILES と PENDING_TEMPLATES の両方にあります。PENDING_TEMPLATES から外してください`);
    }
  }

  /** 4-b. テンプレ番号とゲートの対応が、標準本体と配布側 README で一致するか */
  const readmePath = path.join(TEMPLATE_DIR, 'README.md');
  if (!standardSection) {
    problems.push('標準本体に「## 成果物と様式の対応」の節がありません');
  } else if (!fs.existsSync(readmePath)) {
    problems.push('template/templates/README.md がありません');
  } else {
    const standardGates = new Map();
    for (const cells of readTable(standardSection)) {
      const m = cells[1]?.match(/テンプレ(\d+)/);
      if (m) standardGates.set(Number(m[1]), gatesOf(cells[3] ?? ''));
    }

    for (const cells of readTable(fs.readFileSync(readmePath, 'utf8'))) {
      if (!/^\d+$/.test(cells[0] ?? '')) continue;
      const num = Number(cells[0]);
      // リンク文字列(例: [体制図(D-0)](./00-....md))は表示名にも括弧を含むため、.md で終わる方を取る
      const file = cells[1]?.match(/\((?:\.\/)?([^()]+\.md)\)/)?.[1];
      if (file && TEMPLATE_FILES[num] !== file) {
        problems.push(`template/templates/README.md のテンプレ${num} が ${file} を指しています(対応表では ${TEMPLATE_FILES[num]})`);
      }
      if (!standardGates.has(num)) {
        problems.push(`標準本体の「成果物と様式の対応」にテンプレ${num} の行がありません`);
        continue;
      }
      const expected = standardGates.get(num);
      const actual = gatesOf(cells[4] ?? '');
      if (expected !== null && actual !== null && expected !== actual) {
        problems.push(
          `テンプレ${num} のゲート対応が一致しません: 標準本体=${expected || 'なし'} / README=${actual || 'なし'}`
        );
      }
    }
  }

  /** 4-c. 両側に現れなければならない項目名 */
  for (const [num, terms] of Object.entries(SHARED_TERMS)) {
    const file = TEMPLATE_FILES[num];
    const filePath = path.join(TEMPLATE_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const distributed = fs.readFileSync(filePath, 'utf8');
    const body = sectionBody(standard, `## テンプレ${num}:`) ?? '';
    for (const term of terms) {
      if (!body.includes(term)) problems.push(`標準本体のテンプレ${num} に「${term}」がありません(${file} には存在します)`);
      if (!distributed.includes(term)) problems.push(`template/templates/${file} に「${term}」がありません(標準本体のテンプレ${num} には存在します)`);
    }
  }
}

if (problems.length) {
  console.error('複製の検査で乖離を検出しました:');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  console.error('正本は本リポジトリの src/ 側です。変更は必ず複製元から行ってください');
  process.exit(1);
}

console.log('複製の検査: 一致しています');
