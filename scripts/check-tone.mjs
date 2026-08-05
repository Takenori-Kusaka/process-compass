#!/usr/bin/env node
// 公開ドキュメントのトーン検査(Issue #108)
//
// src/content/docs/ 配下の Markdown / MDX から、内部文脈語・主観的表現・
// 未完成の痕跡を検出する。npm run check から呼ばれ、検出時は終了コード 1 で失敗する。
//
// 除外:
//   - コードブロック(``` で囲まれた範囲)と HTML コメント
//   - 行末に `<!-- tone-ok: 理由 -->` がある行(引用など正当な使用のため)
//
// 禁止語の追加・削除は下の RULES を編集する。運用方針は
// research/phase4-standard/108-tone-guardrail.md を参照。

import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';

const RULES = [
  {
    category: '内部資料への言及',
    pattern: /音声メモ|元ネタ|オーナー様|議事録によれば|前回の打ち合わせで|例の資料/,
    hint: '読者が参照できない資料への言及。根拠は本サイト内のページか出典URLで示すこと',
  },
  {
    category: '主観的な強調',
    pattern: /めっちゃ|ぶっちゃけ|ヤバ[いく]|すごく|物凄|超絶/,
    hint: '規程の客観性を損なう。定量表現または中立な語へ置き換えること',
  },
  {
    category: '断定を避ける口語',
    pattern: /な感じ|だと思います|たぶん|恐らくですが|〜的な感じ/,
    hint: '要求事項の効力が不明確になる。断定するか、条件を明示すること',
  },
  {
    category: '未完成の痕跡',
    pattern: /TODO|FIXME|後で書く|あとで直す|仮置き|書きかけ/,
    hint: '未完成の記述を公開しない。完成させるか、該当箇所を削除すること',
  },
];

const TONE_OK = /<!--\s*tone-ok:/;

/** コードブロックと HTML コメントを空行へ置換し、行番号を保ったまま検査対象外にする */
function maskExcluded(lines) {
  const masked = [...lines];
  let inFence = false;
  let inComment = false;
  for (let i = 0; i < masked.length; i++) {
    const line = masked[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      masked[i] = '';
      continue;
    }
    if (inFence) {
      masked[i] = '';
      continue;
    }
    if (inComment) {
      masked[i] = '';
      if (line.includes('-->')) inComment = false;
      continue;
    }
    if (/<!--/.test(line) && !/-->/.test(line)) {
      inComment = true;
      masked[i] = '';
      continue;
    }
  }
  return masked;
}

const violations = [];

for await (const file of glob('src/content/docs/**/*.{md,mdx}')) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const masked = maskExcluded(lines);
  masked.forEach((line, index) => {
    if (!line || TONE_OK.test(lines[index])) return;
    for (const rule of RULES) {
      const match = line.match(rule.pattern);
      if (match) {
        violations.push({
          file,
          line: index + 1,
          term: match[0],
          category: rule.category,
          hint: rule.hint,
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log('トーン検査: 違反なし');
  process.exit(0);
}

console.error(`トーン検査: ${violations.length} 件の違反があります。\n`);
for (const v of violations) {
  console.error(`${v.file}:${v.line}  [${v.category}] "${v.term}"`);
  console.error(`  → ${v.hint}\n`);
}
console.error('引用など正当な使用の場合は、行末に <!-- tone-ok: 理由 --> を付けて除外できます。');
process.exit(1);
