#!/usr/bin/env node
/**
 * Gemini 画像生成スクリプト(Google AI Studio API)
 *
 * 使い方:
 *   node scripts/generate-image.mjs --prompt "羅針盤のイラスト" --out research/assets/compass.png
 *
 * オプション:
 *   --prompt, -p   生成プロンプト(必須)
 *   --out, -o      出力ファイルパス(省略時: research/assets/generated-<timestamp>.png)
 *   --model, -m    モデル名(省略時: env IMAGE_MODEL → gemini-3-pro-image-preview)
 *   --aspect, -a   アスペクト比 1:1 | 16:9 | 4:3 | 3:2 | 9:16 | 21:9 など
 *   --size, -s     解像度 1K | 2K | 4K(対応モデルのみ)
 *   --input, -i    参照画像パス(編集・スタイル参照用。複数指定可)
 *
 * API キーは .env の GOOGLE_AI_STUDIO_API_KEY(または GEMINI_API_KEY)を読む。
 * 利用可能なモデル一覧は scripts/list-image-models.mjs で確認できる。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MODEL = 'gemini-3-pro-image-preview';

function loadEnv() {
  const envPath = resolve(repoRoot, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function parseArgs(argv) {
  const args = { input: [] };
  const alias = { p: 'prompt', o: 'out', m: 'model', a: 'aspect', s: 'size', i: 'input' };
  for (let i = 0; i < argv.length; i++) {
    let key = argv[i];
    if (!key.startsWith('-')) continue;
    key = key.replace(/^--?/, '');
    key = alias[key] ?? key;
    const val = argv[++i];
    if (key === 'input') args.input.push(val);
    else args[key] = val;
  }
  return args;
}

function mimeOf(path) {
  const ext = extname(path).toLowerCase();
  return { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext] ?? 'image/png';
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.prompt) {
    console.error('エラー: --prompt が必要です。例: node scripts/generate-image.mjs -p "羅針盤のイラスト"');
    process.exit(1);
  }
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('エラー: .env に GOOGLE_AI_STUDIO_API_KEY がありません。');
    process.exit(1);
  }
  const model = args.model ?? process.env.IMAGE_MODEL ?? DEFAULT_MODEL;
  const outPath = resolve(
    repoRoot,
    args.out ?? `research/assets/generated-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
  );

  const parts = [{ text: args.prompt }];
  for (const inputPath of args.input) {
    parts.push({
      inline_data: { mime_type: mimeOf(inputPath), data: readFileSync(resolve(inputPath)).toString('base64') },
    });
  }
  const imageConfig = {};
  if (args.aspect) imageConfig.aspectRatio = args.aspect;
  if (args.size) imageConfig.imageSize = args.size.toUpperCase();

  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      ...(Object.keys(imageConfig).length ? { imageConfig } : {}),
    },
  };

  console.log(`モデル: ${model}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let res;
  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    if (res.ok) break;
    const text = await res.text();
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      console.warn(`HTTP ${res.status}(リトライ ${attempt}/3)...`);
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      continue;
    }
    console.error(`エラー: HTTP ${res.status}\n${text}`);
    process.exit(1);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    console.error('エラー: 候補が返りませんでした。', JSON.stringify(data).slice(0, 500));
    process.exit(1);
  }

  let saved = 0;
  for (const part of candidate.content?.parts ?? []) {
    if (part.text) console.log(`[model] ${part.text}`);
    const inline = part.inlineData ?? part.inline_data;
    if (!inline?.data) continue;
    const path = saved === 0 ? outPath : outPath.replace(/(\.\w+)$/, `-${saved + 1}$1`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, Buffer.from(inline.data, 'base64'));
    console.log(`保存: ${path}`);
    saved++;
  }
  if (saved === 0) {
    console.error('エラー: 画像が返りませんでした。finishReason:', candidate.finishReason);
    process.exit(1);
  }
}

main();
