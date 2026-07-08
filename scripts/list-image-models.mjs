#!/usr/bin/env node
/**
 * 利用可能な Gemini 画像系モデルの一覧を表示する。
 * 新しいモデルが出たら、これで確認して .env の IMAGE_MODEL か --model で切り替える。
 *
 * 使い方: node scripts/list-image-models.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(repoRoot, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('エラー: .env に GOOGLE_AI_STUDIO_API_KEY がありません。');
  process.exit(1);
}

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', {
  headers: { 'x-goog-api-key': apiKey },
});
if (!res.ok) {
  console.error(`エラー: HTTP ${res.status}`, await res.text());
  process.exit(1);
}
const { models = [] } = await res.json();
const imageModels = models.filter((m) => /image|imagen/i.test(m.name));
for (const m of imageModels) {
  console.log(`${m.name.replace('models/', '')}\t${m.supportedGenerationMethods?.join(',')}`);
}
console.log(`\n${imageModels.length} 件(generateContent 対応のものが generate-image.mjs で利用可能)`);
