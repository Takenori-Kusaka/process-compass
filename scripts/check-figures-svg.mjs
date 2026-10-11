// ブランドの SVG テンプレートから描いた図(src/assets/figures/**)の再現性を検査する。
//
//   node scripts/check-figures-svg.mjs
//
// 図の描画(SVG → PNG)は publishing-hub(brand/ の描画器と同梱フォント)で行い、ここには
// ソース(.svg)・PNG・再現用のメタ情報(.png.json)の 3 点を置く。このリポジトリは描画器を持たず、
// ハッシュの突合だけを行う(kusaka-brand BDR-0005)。
//   F1 PNG に SVG のソースがある
//   F2 SVG に PNG とメタ情報がある
//   F3 メタ情報のソースのハッシュが現在の .svg と一致する(ソースを変えたら描き直す)
//   F4 メタ情報の出力のハッシュが現在の PNG と一致する(手差し替えを止める)
//   F5 主ラベルの最小フォントサイズが自然幅 × 1/32 以上(電話で読める)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'src/assets/figures');
const MIN_FONT_RATIO = 1 / 32;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk(DIR);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const errors = [];
let pairs = 0;
for (const png of files.filter((f) => f.endsWith('.png'))) {
  if (!fs.existsSync(png.replace(/\.png$/, '.svg'))) errors.push(`F1 ${rel(png)}: ソース(.svg)がありません`);
}
for (const svg of files.filter((f) => f.endsWith('.svg'))) {
  const png = svg.replace(/\.svg$/, '.png');
  const meta = `${png}.json`;
  if (!fs.existsSync(png) || !fs.existsSync(meta)) { errors.push(`F2 ${rel(svg)}: PNG かメタ情報がありません(publishing-hub の npm run figures:svg で描き、3 点を写す)`); continue; }
  const m = JSON.parse(fs.readFileSync(meta, 'utf8'));
  pairs++;
  if (m.sourceSha256 !== sha256(fs.readFileSync(svg, 'utf8'))) errors.push(`F3 ${rel(svg)}: ソースを変えたのに PNG を描き直していません`);
  if (m.output?.sha256 !== sha256(fs.readFileSync(png))) errors.push(`F4 ${rel(png)}: PNG がメタ情報と一致しません(手差し替え)`);
  const min = Math.ceil((m.natural?.width || 0) * MIN_FONT_RATIO);
  if (typeof m.smallestFontSize === 'number' && m.smallestFontSize < min) errors.push(`F5 ${rel(svg)}: 主ラベルの最小 ${m.smallestFontSize}px < 下限 ${min}px`);
}
for (const e of errors) console.error(`  ✖ ${e}`);
console.log(errors.length ? `figures: ${errors.length} 件の問題` : `figures: ${pairs} 件の図の再現性を確認`);
process.exit(errors.length ? 1 : 0);
