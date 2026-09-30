#!/usr/bin/env node
// 出典台帳(research/sources/)と調査スナップショットの取り込み・検証・検査・索引生成(Issue #282)
//
// 200件規模の外部文献を「毎回全部読まずに済む」構造に保つための道具。
// 3層構造 = 出典カード(SRC-NNNN.yaml) / 知見(findings.yaml) / 生成索引(catalog, by-issue, ...)。
// 人が書くのは digest とテーマ本文だけで、索引はすべてここから生成する(手で編集しない)。
//
// サブコマンド:
//   ingest <staging-dir>        検索役が書いた JSON カードを正規化・重複除去・採番して SRC-*.yaml へ
//   verify [--ids a,b] [--all]  機械検証(HTTP・タイトル・arXiv/Crossref・引用文の照合)。既定は未検証のみ
//   blind-tasks [--batch N]     目隠し抽出の作業票(値を伏せた問いと locator)をバッチに分けて書き出す
//   merge-verification <json>   目隠し抽出(エージェント)の結果をカードへ反映し、比較を機械で行う
//   findings-ingest <json>      知見の JSON を採番して findings.yaml へ追記
//   lint                        オフライン検査(スキーマ・語彙・参照整合)。npm run check から呼ぶ
//   index                       catalog / by-issue / questions / coverage / verification 集計 / views を再生成
//
// 設計上の約束:
//   - ID は再利用しない(EV と同じ)。excluded のカードも消さない(却下は成果)
//   - 「知らない」を「存在しない」の根拠にしない。到達できないものは unreachable として残す
//   - LLM に書き写させない。変換はすべてここで行う

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES_DIR = path.join(ROOT, 'research/sources');
const SURVEY_DIR = path.join(ROOT, process.env.SURVEY_DIR ?? 'research/282-survey-2026-09');
const FINDINGS_PATH = path.join(SURVEY_DIR, 'findings.yaml');
const RQ_PATH = path.join(SURVEY_DIR, 'rq.yaml');

const VOCAB = {
  status: ['included', 'excluded'],
  excludeReason: ['not-found', 'off-topic', 'duplicate', 'untraceable-number', 'superseded', 'promotional', 'low-quality'],
  orgType: ['vendor', 'academic', 'standards-body', 'government', 'enterprise', 'sier', 'user-it', 'startup', 'individual', 'media', 'community', 'consultancy', 'nonprofit'],
  region: ['global', 'us', 'eu', 'jp', 'cn', 'other'],
  sourceType: ['standard', 'regulation', 'public-agency', 'paper-peer', 'preprint', 'vendor-official', 'industry-report', 'corp-techblog', 'individual', 'news', 'talk', 'repo', 'community', 'book'],
  publishedBasis: ['arxiv-v1', 'byline', 'meta', 'pdf', 'page', 'unknown'],
  access: ['open', 'paywall', 'login', 'blocked'],
  readLevel: ['full', 'section', 'abstract', 'secondary', 'snippet'],
  evidenceKind: ['rct', 'controlled-experiment', 'observational', 'survey', 'case-report', 'benchmark', 'review', 'normative', 'vendor-guidance', 'expert-opinion', 'news-fact'],
  stance: ['supports', 'contradicts', 'qualifies', 'context'],
  verificationStatus: ['verified', 'partial', 'mismatch', 'unreachable', 'not-found', 'unverified', 'needs-agent'],
  volatility: ['fast', 'medium', 'slow'],
  level: ['E0', 'E1', 'E2', 'E3'],
  change: ['new', 'confirmed', 'changed', 'refuted'],
  rqKind: ['verify-claim', 'explore', 'recheck-baseline'],
  rqPriority: ['must', 'should'],
  rqStatus: ['open', 'answered', 'partial'],
};

const THEMES = {
  TH01: 'ロールとAIの位置づけ',
  TH02: '体制・ステージの変化点と段階的有効化',
  TH03: 'ルールの配送(スキル・コマンドの階層化)',
  TH04: 'コンテキスト予算とトークン経済',
  TH05: '成果物の目的・読み手・形式・量',
  TH06: '検証の独立性とAIレビュー',
  TH07: 'ゲート形骸化・装置肥大・機械判定の範囲',
  TH08: '仕様・要求・前提・トレーサビリティ',
  TH09: '企画・探索・技術検証',
  TH10: 'リポジトリ構成と Git/PR/CI',
  TH11: '計測とメトリクス',
  TH12: '規格・規制と標準自体の運営',
};

const args = process.argv.slice(2);
const cmd = args[0];
const flags = new Set(args.filter((a) => a.startsWith('--')));
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

// ---------------------------------------------------------------- utilities

function today() {
  return new Date().toISOString().slice(0, 10);
}

function pad(n) {
  return String(n).padStart(4, '0');
}

function readYaml(file) {
  return YAML.parse(readFileSync(file, 'utf8'));
}

function writeYaml(file, data) {
  // ID の並び(themes / rqs / issues / sources など)は1行のフロー形式にする。grep で1行ずつ拾えるようにするため
  const doc = new YAML.Document(data);
  YAML.visit(doc, {
    Seq(_, node) {
      const scalars = node.items.every((it) => YAML.isScalar(it) && String(it.value ?? '').length <= 40);
      const smallMaps = node.items.length > 0 && node.items.every((it) => YAML.isMap(it) && it.items.length <= 2 && it.items.every((pr) => YAML.isScalar(pr.value) && String(pr.value.value ?? '').length <= 20));
      if (scalars || smallMaps) node.flow = true;
    },
  });
  writeFileSync(file, doc.toString({ lineWidth: 0, defaultStringType: 'PLAIN', defaultKeyType: 'PLAIN', flowCollectionPadding: false }));
}

function loadCards() {
  if (!existsSync(SOURCES_DIR)) return [];
  return readdirSync(SOURCES_DIR)
    .filter((f) => /^SRC-\d{4}\.yaml$/.test(f))
    .sort()
    .map((f) => ({ file: path.join(SOURCES_DIR, f), card: readYaml(path.join(SOURCES_DIR, f)) }));
}

function loadFindings() {
  if (!existsSync(FINDINGS_PATH)) return [];
  return readYaml(FINDINGS_PATH)?.findings ?? [];
}

function loadRqs() {
  if (!existsSync(RQ_PATH)) return [];
  return readYaml(RQ_PATH)?.questions ?? [];
}

function nextId(prefix, existing) {
  const max = existing.reduce((m, id) => Math.max(m, Number(id.slice(prefix.length + 1)) || 0), 0);
  return `${prefix}-${pad(max + 1)}`;
}

/** 照合用の正規化: NFKC・小文字・空白と記号を除去 */
function norm(s) {
  return String(s ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s　]+/g, '')
    .replace(/[“”"'’‘`´,.;:!?()[\]{}<>«»、。「」『』（）・…—–\-_*#|/\\]/g, '');
}

function numbersIn(s) {
  return [...String(s ?? '').normalize('NFKC').matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0].replace(/,/g, ''));
}

/** 主張文から照合すべき数値だけを取り出す(Issue 番号・RQ ID・arXiv ID・台帳 ID・日付・版は除く) */
function claimNumbers(s) {
  const cleaned = String(s ?? '')
    .normalize('NFKC')
    .replace(/#\d+/g, ' ')
    .replace(/TH\d+-Q\d+|BASE-Q\d+|SRC-\d+|FND-\d+|EV-\d+|ADR-\d+|IMPL-\d+/g, ' ')
    .replace(/\b\d{4}\.\d{4,5}(v\d+)?\b/g, ' ')
    .replace(/\b(19|20)\d{2}(-\d{2}){0,2}\b/g, ' ')
    .replace(/\b(19|20)\d{2}\s*年(\s*\d{1,2}\s*月)?(\s*\d{1,2}\s*日)?/g, ' ')
    .replace(/\bv\d+(\.\d+)*\b/gi, ' ')
    .replace(/\b(GPT|Claude|Opus|Sonnet|Haiku|Fable|Mythos|Gemini|Llama|Qwen|Mistral|ISO|IEC|IEEE|SP|MMLU|GSM|HumanEval|SWE)[-\s/]?[\w.-]*\d[\w.-]*/gi, ' ')
    .replace(/第\s*\d+\s*(章|条|節|版|回)/g, ' ')
    .replace(/§\s*[\d.]+/g, ' ');
  return numbersIn(cleaned);
}

/** URL の正規化と正準キー(arxiv:ID / doi:xxx / https://host/path) */
function canonicalize(rawUrl, ids = {}) {
  let url = String(rawUrl ?? '').trim();
  if (!url) return { url: '', canonical: '', ids };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  let u;
  try {
    u = new URL(url);
  } catch {
    return { url, canonical: url.toLowerCase(), ids };
  }
  // 保存する URL は原形を保つ(ホストの www や末尾スラッシュを消すと 404 になるサイトがある)。
  // 変えるのは追跡用パラメータとフラグメントの除去だけ。重複判定の正準キーは別に作る
  u.hash = '';
  const tracking = [...u.searchParams.keys()].filter((k) => /^(utm_|fbclid|gclid|ref$|ref_src|mkt_tok|si$)/.test(k));
  for (const k of tracking) u.searchParams.delete(k);
  const kept = tracking.length ? u.toString() : url.replace(/#.*$/, '');
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const pathname = u.pathname.replace(/\/+$/, '') || '/';
  const arx = /^arxiv\.org$/.test(host) && /^\/(abs|pdf|html)\/(\d{4}\.\d{4,5})(v\d+)?(\.pdf)?$/.exec(pathname);
  if (arx) {
    ids = { ...ids, arxiv: arx[2] };
  }
  if (ids.arxiv) return { url: `https://arxiv.org/abs/${ids.arxiv}`, canonical: `arxiv:${ids.arxiv}`, ids };
  const doiHost = /^(dx\.)?doi\.org$/.test(host);
  if (doiHost) ids = { ...ids, doi: decodeURIComponent(pathname.slice(1)).toLowerCase() };
  if (ids.doi) return { url: kept, canonical: `doi:${ids.doi.toLowerCase()}`, ids };
  const canonical = `https://${host}${pathname}${u.search}`.toLowerCase();
  return { url: kept, canonical, ids };
}

function enumOr(value, list, fallback) {
  return list.includes(value) ? value : fallback;
}

// ---------------------------------------------------------------- ingest

function normalizeCard(raw, ctx) {
  const ids = { arxiv: raw.ids?.arxiv ?? null, doi: raw.ids?.doi ?? null };
  const { url, canonical, ids: ids2 } = canonicalize(raw.url, Object.fromEntries(Object.entries(ids).filter(([, v]) => v)));
  const claims = (raw.claims ?? []).map((c, i) => ({
    id: `c${i + 1}`,
    text: String(c.text ?? '').trim(),
    quote: String(c.quote ?? '').trim(),
    locator: String(c.locator ?? '').trim(),
    quant: c.quant && (c.quant.value || c.quant.n || c.quant.design)
      ? { value: c.quant.value ?? null, n: c.quant.n ?? null, design: c.quant.design ?? null, population: c.quant.population ?? null }
      : null,
    evidenceKind: enumOr(c.evidenceKind, VOCAB.evidenceKind, 'expert-opinion'),
    rqs: [...new Set((c.rqs ?? []).map(String))],
    issues: [...new Set((c.issues ?? []).map((n) => Number(String(n).replace('#', ''))).filter(Number.isFinite))],
    stance: enumOr(c.stance, VOCAB.stance, 'context'),
  }));
  return {
    schemaVersion: 0,
    id: null,
    status: enumOr(raw.status, VOCAB.status, 'included'),
    excludeReason: raw.excludeReason ?? null,
    title: String(raw.title ?? '').trim(),
    url,
    canonicalUrl: canonical,
    ids: { arxiv: ids2.arxiv ?? null, doi: ids2.doi ?? null },
    publisher: String(raw.publisher ?? '').trim(),
    authors: (raw.authors ?? []).map(String),
    orgType: enumOr(raw.orgType, VOCAB.orgType, 'community'),
    region: enumOr(raw.region, VOCAB.region, 'global'),
    lang: raw.lang ?? 'en',
    sourceType: enumOr(raw.sourceType, VOCAB.sourceType, 'community'),
    published: raw.published ?? null,
    publishedBasis: enumOr(raw.publishedBasis, VOCAB.publishedBasis, 'unknown'),
    version: raw.version ?? null,
    updated: raw.updated ?? null,
    accessed: raw.accessed ?? ctx.accessed,
    access: enumOr(raw.access, VOCAB.access, 'open'),
    readLevel: enumOr(raw.readLevel, VOCAB.readLevel, 'snippet'),
    foundBy: { cluster: ctx.cluster, query: String(raw.foundBy?.query ?? raw.query ?? '').trim() },
    derivedFrom: (raw.derivedFrom ?? []).map(String).filter((d) => /^SRC-\d{4}$/.test(d)),
    derivedFromUrl: (raw.derivedFromUrl ?? []).map((u) => canonicalize(u).canonical).filter(Boolean),
    selfReported: Boolean(raw.selfReported),
    themes: [...new Set((raw.themes ?? []).map(String).filter((t) => THEMES[t]))],
    events: (raw.events ?? []).map((e) => ({ date: String(e.date ?? ''), label: String(e.label ?? '') })).filter((e) => e.date && e.label),
    summary: String(raw.summary ?? '').trim(),
    claims,
    verification: { status: 'unverified', method: [], date: null, humanChecked: false, note: '', mech: null, agent: null },
    volatility: enumOr(raw.volatility, VOCAB.volatility, 'medium'),
    reviewBy: raw.reviewBy ?? null,
  };
}

function mergeInto(target, incoming, report) {
  // 同じ出典が別クラスタから来た: 主張・テーマ・発見経路を足す。本体は先着を正とする
  const offset = target.claims.length;
  for (const c of incoming.claims) {
    const dup = target.claims.find((t) => norm(t.text) === norm(c.text) || (c.quote && norm(t.quote) === norm(c.quote)));
    if (dup) {
      dup.rqs = [...new Set([...dup.rqs, ...c.rqs])];
      dup.issues = [...new Set([...dup.issues, ...c.issues])];
      continue;
    }
    target.claims.push({ ...c, id: `c${target.claims.length + 1}` });
  }
  target.themes = [...new Set([...target.themes, ...incoming.themes])];
  target.events = [...target.events, ...incoming.events.filter((e) => !target.events.some((t) => t.date === e.date && t.label === e.label))];
  if (!target.summary && incoming.summary) target.summary = incoming.summary;
  if (target.readLevel === 'snippet' && incoming.readLevel !== 'snippet') target.readLevel = incoming.readLevel;
  target.alsoFoundBy = [...(target.alsoFoundBy ?? []), incoming.foundBy];
  report.merged.push({ into: target.id ?? target.canonicalUrl, from: incoming.foundBy, claimsAdded: target.claims.length - offset });
}

function ingest(stagingDir) {
  if (!stagingDir || !existsSync(stagingDir)) {
    console.error('使い方: research-ledger.mjs ingest <staging-dir>');
    process.exit(2);
  }
  mkdirSync(SOURCES_DIR, { recursive: true });
  const existing = loadCards();
  const byCanonical = new Map(existing.map(({ card }) => [card.canonicalUrl, card]));
  const byArxiv = new Map(existing.filter(({ card }) => card.ids?.arxiv).map(({ card }) => [card.ids.arxiv, card]));
  const byDoi = new Map(existing.filter(({ card }) => card.ids?.doi).map(({ card }) => [card.ids.doi, card]));
  const usedIds = existing.map(({ card }) => card.id);
  const report = { created: [], merged: [], skipped: [], files: [] };
  const touched = new Map(existing.map(({ file, card }) => [card.id, { file, card, dirty: false }]));

  const files = readdirSync(stagingDir).filter((f) => f.endsWith('.json')).sort();
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(readFileSync(path.join(stagingDir, f), 'utf8'));
    } catch (e) {
      report.skipped.push({ file: f, reason: `JSON を読めません: ${e.message}` });
      continue;
    }
    const ctx = { cluster: data.cluster ?? f.replace(/\.json$/, ''), accessed: data.accessed ?? today() };
    const cards = Array.isArray(data) ? data : data.cards ?? [];
    report.files.push({ file: f, cluster: ctx.cluster, cards: cards.length, queries: data.queries ?? [] });
    for (const raw of cards) {
      if (!raw?.url || !raw?.title) {
        report.skipped.push({ file: f, title: raw?.title ?? '', reason: 'url か title がありません' });
        continue;
      }
      const card = normalizeCard(raw, ctx);
      const hit = byCanonical.get(card.canonicalUrl) ?? (card.ids.arxiv && byArxiv.get(card.ids.arxiv)) ?? (card.ids.doi && byDoi.get(card.ids.doi));
      if (hit) {
        mergeInto(hit, card, report);
        touched.get(hit.id).dirty = true;
        continue;
      }
      card.id = nextId('SRC', usedIds);
      usedIds.push(card.id);
      byCanonical.set(card.canonicalUrl, card);
      if (card.ids.arxiv) byArxiv.set(card.ids.arxiv, card);
      if (card.ids.doi) byDoi.set(card.ids.doi, card);
      const file = path.join(SOURCES_DIR, `${card.id}.yaml`);
      touched.set(card.id, { file, card, dirty: true });
      report.created.push({ id: card.id, cluster: ctx.cluster, title: card.title });
    }
  }
  // 二次情報の一次出典(URL で指定されたもの)を ID へ解決する
  for (const t of touched.values()) {
    const pending = t.card.derivedFromUrl ?? [];
    if (!pending.length) continue;
    const rest = [];
    for (const u of pending) {
      const hit = byCanonical.get(u);
      if (hit && hit.id !== t.card.id) {
        if (!t.card.derivedFrom.includes(hit.id)) t.card.derivedFrom.push(hit.id);
        t.dirty = true;
      } else rest.push(u);
    }
    if (rest.length !== pending.length) t.dirty = true;
    t.card.derivedFromUrl = rest;
  }
  for (const { file, card, dirty } of touched.values()) if (dirty) writeYaml(file, card);

  const outDir = path.join(ROOT, 'tmp/survey-2026-09');
  mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, `ingest-report-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`取り込み: 新規 ${report.created.length}件、統合 ${report.merged.length}件、スキップ ${report.skipped.length}件(台帳 ${usedIds.length}件)`);
  for (const s of report.skipped) console.log(`  スキップ ${s.file}: ${s.reason} ${s.title ?? ''}`);
  console.log(`報告: ${path.relative(ROOT, reportPath)}`);
}

/** 取り込み済みの staging から原形の URL を復元する(旧版の正規化が www と末尾スラッシュを消していた不具合の修復) */
function repairUrls(dir) {
  const orig = new Map();
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(path.join(dir, f), 'utf8'));
    for (const raw of Array.isArray(data) ? data : data.cards ?? []) {
      if (!raw?.url) continue;
      const { url, canonical } = canonicalize(raw.url, Object.fromEntries(Object.entries(raw.ids ?? {}).filter(([, v]) => v)));
      if (!orig.has(canonical)) orig.set(canonical, url);
    }
  }
  const changed = [];
  for (const { file, card } of loadCards()) {
    const u = orig.get(card.canonicalUrl);
    if (u && u !== card.url) {
      card.urlBeforeRepair = card.url;
      card.url = u;
      writeYaml(file, card);
      changed.push(card.id);
    }
  }
  console.log(`URL の復元: ${changed.length}件`);
  console.log(changed.join(','));
}

// ---------------------------------------------------------------- verify (online)

const UA = 'Mozilla/5.0 (compatible; process-compass-research-ledger/0.1; +https://github.com/Takenori-Kusaka/process-compass)';

async function fetchText(url, { timeoutMs = 25000 } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/json,text/plain,*/*' }, redirect: 'follow', signal: ctl.signal });
    const type = res.headers.get('content-type') ?? '';
    let body = '';
    if (/pdf|octet-stream/.test(type)) body = '';
    else body = await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url, type, body };
  } catch (e) {
    return { ok: false, status: 0, finalUrl: url, type: '', body: '', error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(t);
  }
}

function htmlTitle(html) {
  const og = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html) ?? /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i.exec(html);
  const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return decodeEntities((og?.[1] ?? t?.[1] ?? '').trim());
}

function htmlDate(html) {
  const m =
    /<meta[^>]+(?:property|name)=["'](?:article:published_time|citation_publication_date|citation_date|datePublished|date|dc\.date|pubdate|publish-date)["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
    /"datePublished"\s*:\s*"([^"]+)"/i.exec(html) ??
    /<time[^>]+datetime=["']([^"']+)["']/i.exec(html);
  return m?.[1]?.slice(0, 10)?.replace(/\//g, '-') ?? null;
}

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

/** 引用文の照合: 全文一致=found、20字の断片の6割以上が見つかれば partial(言い換えの疑い)、それ未満は not-found */
function quoteMatch(ntext, q) {
  if (!q) return 'no-quote';
  if (ntext.includes(q.length > 80 ? q.slice(0, 80) : q)) return 'found';
  const size = 20;
  if (q.length < size) return ntext.includes(q) ? 'found' : 'not-found';
  const shingles = [];
  for (let i = 0; i + size <= q.length; i += 10) shingles.push(q.slice(i, i + size));
  const hit = shingles.filter((sh) => ntext.includes(sh)).length;
  const ratio = hit / shingles.length;
  if (ratio >= 0.9) return 'found';
  if (ratio >= 0.6) return 'partial';
  return 'not-found';
}

/** 題名の一致: 先頭40字の包含、または25字以上の共通部分列(副題の有無の違いを許す) */
function titleSimilar(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x.includes(y.slice(0, 40)) || y.includes(x.slice(0, 40))) return true;
  const [sh, lg] = x.length <= y.length ? [x, y] : [y, x];
  // 25字以上の共通部分列があれば同じ文献の題名とみなす(Crossref は副題だけを返すことがある)
  for (let i = 0; i + 25 <= sh.length; i += 1) if (lg.includes(sh.slice(i, i + 25))) return true;
  return false;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// arXiv は間隔を空ける(並列の worker 間で共有する門)
let arxivNext = 0;
async function arxivWait(gapMs = 1500) {
  const now = Date.now();
  const at = Math.max(now, arxivNext);
  arxivNext = at + gapMs;
  await sleep(at - now);
}

/** PDF を取得して pdftotext で本文にする(pdftotext が無ければ空) */
async function fetchPdfText(url, timeoutMs = 40000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: ctl.signal });
    if (!res.ok) return '';
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.subarray(0, 4).toString() !== '%PDF') return '';
    const dir = path.join(ROOT, 'tmp/survey-2026-09/pdf');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Math.abs(hashCode(url))}.pdf`);
    writeFileSync(file, buf);
    return execFileSync('pdftotext', ['-q', file, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return '';
  } finally {
    clearTimeout(t);
  }
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

async function verifyCard(card) {
  const mech = { checkedAt: new Date().toISOString(), httpStatus: null, finalUrl: null, contentType: null, titleFetched: null, titleMatch: null, dateMeta: null, quotes: {}, arxiv: null, crossref: null, fullText: null, note: '' };
  const res = await fetchText(card.url);
  mech.httpStatus = res.status;
  mech.finalUrl = res.finalUrl;
  mech.contentType = res.type;
  if (res.error) mech.note = res.error;
  const html = res.body ?? '';
  let text = stripHtml(html);
  // 引用文の照合は全文で行う: arXiv は abs ではなく html 全文(無ければ PDF)、PDF は pdftotext
  if (card.ids?.arxiv) {
    await arxivWait();
    const h = await fetchText(`https://arxiv.org/html/${card.ids.arxiv}`);
    if (h.status === 200 && h.body && !/No HTML for/i.test(h.body)) {
      text += ' ' + stripHtml(h.body);
      mech.fullText = 'arxiv-html';
    } else {
      const p = await fetchPdfText(`https://arxiv.org/pdf/${card.ids.arxiv}`);
      if (p) {
        text += ' ' + p;
        mech.fullText = 'arxiv-pdf';
      }
    }
  } else if (/pdf/i.test(res.type) || /\.pdf($|\?)/i.test(card.url)) {
    const p = await fetchPdfText(card.url);
    if (p) {
      text += ' ' + p;
      mech.fullText = 'pdf';
    }
  }
  const ntext = norm(text);
  if (html) {
    mech.titleFetched = htmlTitle(html).slice(0, 200);
    const nt = norm(card.title);
    const nf = norm(mech.titleFetched);
    mech.titleMatch = nt && nf ? nf.includes(nt.slice(0, 40)) || nt.includes(nf.slice(0, 40)) : null;
    mech.dateMeta = htmlDate(html);
  }
  for (const c of card.claims ?? []) {
    if (!c.quote) {
      mech.quotes[c.id] = 'no-quote';
      continue;
    }
    if (!ntext) {
      mech.quotes[c.id] = 'no-text';
      continue;
    }
    mech.quotes[c.id] = quoteMatch(ntext, norm(c.quote));
  }
  if (card.ids?.arxiv) {
    await arxivWait();
    const a = await fetchText(`https://arxiv.org/abs/${card.ids.arxiv}`);
    if (a.status === 200) {
      const title = decodeEntities((/<title>\[[^\]]+\]\s*([\s\S]*?)<\/title>/i.exec(a.body)?.[1] ?? '').trim());
      const authors = [...a.body.matchAll(/<meta name="citation_author" content="([^"]+)"/g)].map((m) => decodeEntities(m[1]));
      const date = /<meta name="citation_date" content="([^"]+)"/.exec(a.body)?.[1]?.replace(/\//g, '-') ?? null;
      const lastVersion = [...a.body.matchAll(/\[v(\d+)\]/g)].map((m) => Number(m[1])).reduce((m, v) => Math.max(m, v), 0) || null;
      mech.arxiv = { status: 200, title, authors: authors.slice(0, 6), v1Date: date, latestVersion: lastVersion, titleMatch: titleSimilar(title, card.title) };
    } else {
      mech.arxiv = { status: a.status, error: a.error ?? null };
    }
  }
  if (card.ids?.doi) {
    await sleep(500);
    const c = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(card.ids.doi)}`);
    if (c.status === 200) {
      try {
        const msg = JSON.parse(c.body).message;
        const title = msg.title?.[0] ?? '';
        const issued = msg.issued?.['date-parts']?.[0]?.join('-') ?? null;
        mech.crossref = { status: 200, title, issued, titleMatch: titleSimilar(title, card.title) };
      } catch {
        mech.crossref = { status: 200, error: 'parse' };
      }
    } else {
      mech.crossref = { status: c.status };
    }
  }
  return mech;
}

function deriveMechStatus(card, mech) {
  const claimIds = (card.claims ?? []).map((c) => c.id);
  const arxivMissing = mech.arxiv && mech.arxiv.status === 404;
  if (mech.httpStatus === 404 || mech.httpStatus === 410 || arxivMissing) return 'not-found';
  const authoritative = (mech.arxiv && mech.arxiv.status === 200) || (mech.crossref && mech.crossref.status === 200);
  const idTitleOk = authoritative && (mech.arxiv?.titleMatch || mech.crossref?.titleMatch);
  if (authoritative && !idTitleOk) return 'mismatch';
  const reachable = mech.httpStatus >= 200 && mech.httpStatus < 300;
  if (!reachable && !authoritative) return 'unreachable';
  const qs = claimIds.map((id) => mech.quotes[id]);
  if (claimIds.length === 0) return reachable && mech.titleMatch !== false ? 'verified' : 'needs-agent';
  if (qs.every((q) => q === 'found')) return 'verified';
  if (qs.some((q) => q === 'no-quote')) return 'needs-agent';
  return 'needs-agent';
}

async function verify() {
  const cards = loadCards();
  const only = flagValue('--ids')?.split(',').map((s) => s.trim());
  const all = flags.has('--all');
  const targets = cards.filter(({ card }) => card.status === 'included' && (only ? only.includes(card.id) : all || ['unverified', 'needs-agent', 'unreachable'].includes(card.verification?.status)));
  const concurrency = Number(flagValue('--concurrency') ?? 6);
  console.log(`機械検証: ${targets.length}件(同時 ${concurrency})`);
  let i = 0;
  const summary = {};
  const queue = [...targets];
  const worker = async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next) await verifyOne(next);
    }
  };
  const verifyOne = async ({ file, card }) => {
    i += 1;
    const mech = await verifyCard(card);
    const status = deriveMechStatus(card, mech);
    card.verification = card.verification ?? {};
    card.verification.mech = mech;
    card.verification.method = [...new Set([...(card.verification.method ?? []), 'mech-fetch', ...(mech.arxiv ? ['arxiv-abs'] : []), ...(mech.crossref ? ['crossref'] : [])])];
    card.verification.date = today();
    // エージェント検証済みのものは上書きしない(mech は補助)
    if (!card.verification.agent) card.verification.status = status;
    if (status === 'not-found' && card.status === 'included') {
      card.status = 'excluded';
      card.excludeReason = 'not-found';
    }
    writeYaml(file, card);
    summary[status] = (summary[status] ?? 0) + 1;
    console.log(`  [${i}/${targets.length}] ${card.id} ${status} (${mech.httpStatus}${mech.fullText ? `, ${mech.fullText}` : ''}) ${card.title.slice(0, 60)}`);
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log('集計:', JSON.stringify(summary));
}

// ---------------------------------------------------------------- merge-verification

/**
 * 目隠し抽出の結果(検証役は主張された値を見ずに、URL と locator と問いから値と引用を抜き出す)を
 * カードに写し、主張との一致をここで判定する。判定はエージェントにさせない。
 * 入力: [{ id, claimId, found, extractedValue, extractedQuote, locator, access, note }]
 */
function mergeVerification(jsonPath) {
  const rows = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const list = Array.isArray(rows) ? rows : rows.results ?? [];
  const cards = new Map(loadCards().map(({ file, card }) => [card.id, { file, card }]));
  const touched = new Set();
  const out = { match: 0, mismatch: 0, notFound: 0, unreachable: 0, review: 0 };
  for (const r of list) {
    const entry = cards.get(r.id);
    if (!entry) {
      console.log(`  不明な ID: ${r.id}`);
      continue;
    }
    const { card } = entry;
    card.verification.agent = card.verification.agent ?? { claims: {}, date: today() };
    const claim = card.claims.find((c) => c.id === r.claimId);
    let verdict;
    if (r.access && r.access !== 'open') verdict = 'unreachable';
    else if (!r.found) verdict = 'not-found-in-source';
    else {
      const want = claimNumbers(`${claim?.quant?.value ?? ''} ${claim?.text ?? ''}`);
      // 検索役の原文抜粋は、機械照合で本文に実在を確かめた場合に限って照合相手に含める
      const quoteVerified = card.verification?.mech?.quotes?.[r.claimId] === 'found';
      const got = numbersIn(`${r.extractedValue ?? ''} ${r.extractedQuote ?? ''} ${quoteVerified ? claim?.quote ?? '' : ''}`);
      const wantQ = norm(claim?.quote ?? '');
      const gotQ = norm(r.extractedQuote ?? '');
      const quoteOverlap = wantQ && gotQ ? gotQ.includes(wantQ.slice(0, 40)) || wantQ.includes(gotQ.slice(0, 40)) : false;
      if (want.length === 0) verdict = quoteOverlap || !wantQ ? 'match' : 'review';
      else {
        const hit = want.filter((n) => got.includes(n)).length;
        verdict = hit === want.length ? 'match' : hit > 0 || quoteOverlap ? 'review' : 'mismatch';
      }
    }
    card.verification.agent.claims[r.claimId] = { verdict, extractedValue: r.extractedValue ?? null, extractedQuote: r.extractedQuote ?? null, locator: r.locator ?? null, note: r.note ?? '' };
    out[verdict === 'not-found-in-source' ? 'notFound' : verdict] = (out[verdict === 'not-found-in-source' ? 'notFound' : verdict] ?? 0) + 1;
    touched.add(r.id);
  }
  for (const id of touched) {
    const { file, card } = cards.get(id);
    const verdicts = Object.values(card.verification.agent.claims).map((c) => c.verdict);
    const mechOk = card.verification.mech && ['verified'].includes(deriveMechStatus(card, card.verification.mech));
    let status;
    if (verdicts.length && verdicts.every((v) => v === 'unreachable')) status = mechOk ? 'verified' : 'unreachable';
    else if (verdicts.some((v) => v === 'mismatch')) status = 'mismatch';
    else if (verdicts.every((v) => v === 'match')) status = 'verified';
    else status = 'partial';
    card.verification.status = status;
    card.verification.method = [...new Set([...(card.verification.method ?? []), 'agent-blind'])];
    card.verification.date = today();
    writeYaml(file, card);
  }
  console.log(`目隠し抽出の反映: ${touched.size}件のカード`, JSON.stringify(out));
}

// ---------------------------------------------------------------- blind-tasks

/**
 * 目隠し抽出の作業票を作る。検証役には「主張された値」を見せない。
 * 対象: 機械検証で引用文が見つからなかったカードの全主張 + 数値を持つ主張(全件)。
 * 主張の文から数値を伏せ字にし、locator と問いだけを渡す。
 */
function blindTasks() {
  const batchSize = Number(flagValue('--batch') ?? 8);
  const outDir = path.join(ROOT, 'tmp/survey-2026-09/verify');
  mkdirSync(outDir, { recursive: true });
  const tasks = [];
  for (const { card } of loadCards()) {
    if (card.status !== 'included') continue;
    const st = card.verification?.status;
    const done = card.verification?.agent?.claims ?? {};
    for (const c of card.claims ?? []) {
      if (done[c.id]) continue;
      const mechFound = card.verification?.mech?.quotes?.[c.id] === 'found';
      const nums = numbersIn(`${c.quant?.value ?? ''} ${c.text}`);
      const numeric = nums.length > 0;
      // 原文抜粋が本文に実在し、主張の数値がすべてその抜粋に含まれるなら、数値の書き写しは機械で確かめられている
      const quoteNums = numbersIn(c.quote);
      const numsCovered = numeric && nums.every((n) => quoteNums.includes(n));
      if (mechFound && (!numeric || numsCovered)) continue;
      const need = ['needs-agent', 'unreachable', 'unverified', 'partial', 'mismatch'].includes(st) || numeric;
      if (!need) continue;
      const masked = c.text.normalize('NFKC').replace(/\d+(?:[.,]\d+)?\s*(%|pt|ポイント|倍|件|人|日|時間|ドル|円|行|本|回)?/g, '___$1');
      tasks.push({ id: card.id, claimId: c.id, url: card.url, title: card.title, locator: c.locator, ask: masked, hasQuant: numeric, access: card.access, readLevel: card.readLevel });
    }
  }
  // 同じ出典の作業票は同じバッチへ(検証役が1出典を1回だけ取得すれば済むように)
  const batches = [];
  let cur = [];
  for (const t of tasks) {
    const sameCard = cur.length && cur[cur.length - 1].id === t.id;
    if (cur.length >= batchSize && !sameCard) {
      batches.push(cur);
      cur = [];
    }
    cur.push(t);
  }
  if (cur.length) batches.push(cur);
  for (const f of readdirSync(outDir)) if (/^tasks-\d+\.json$/.test(f)) writeFileSync(path.join(outDir, f), '[]');
  batches.forEach((b, i) => writeFileSync(path.join(outDir, `tasks-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(b, null, 2)));
  console.log(`目隠し抽出の作業票: ${tasks.length}件 → ${batches.length} バッチ(${batchSize}件ずつ)`);
  console.log(JSON.stringify({ tasks: tasks.length, batches: batches.length }));
}

// ---------------------------------------------------------------- bundles / rq-update

/** テーマ別にカードを1ファイルへ束ねる(知見抽出役・テーマ執筆役が1回の Read で済むように) */
function bundles() {
  // --from SRC-0508 --out bundles-gap で、追加分のカードだけを別の束にできる
  const from = flagValue('--from');
  const outDir = path.join(ROOT, 'tmp/survey-2026-09', flagValue('--out') ?? 'bundles');
  mkdirSync(outDir, { recursive: true });
  const cards = loadCards().map(({ card }) => card).filter((c) => c.status === 'included' && (!from || c.id >= from));
  const render = (c) => {
    const lines = [`### [${c.id}] ${c.title}`, `- ${c.publisher} / ${c.sourceType} / ${c.orgType} / ${c.region} / ${c.lang} / 公開 ${c.published ?? '?'} / 検証 ${c.verification?.status} / readLevel ${c.readLevel}${c.selfReported ? ' / selfReported' : ''}${c.derivedFrom?.length ? ` / 一次: ${c.derivedFrom.join(',')}` : ''}`, `- URL: ${c.url}`, `- 要約: ${c.summary}`];
    for (const cl of c.claims ?? []) {
      const q = cl.quant ? ` {value: ${cl.quant.value ?? ''}; n: ${cl.quant.n ?? ''}; design: ${cl.quant.design ?? ''}; population: ${cl.quant.population ?? ''}}` : '';
      const v = c.verification?.agent?.claims?.[cl.id]?.verdict ?? c.verification?.mech?.quotes?.[cl.id] ?? '';
      lines.push(`- [${c.id}#${cl.id}] (${cl.evidenceKind}, ${cl.stance}${cl.rqs?.length ? `, RQ ${cl.rqs.join(' ')}` : ''}${cl.issues?.length ? `, Issue ${cl.issues.map((n) => `#${n}`).join(' ')}` : ''}${v ? `, 照合 ${v}` : ''}) ${cl.text}${q}`);
      lines.push(`  > ${cl.quote}${cl.locator ? ` — ${cl.locator}` : ''}`);
      const bn = c.verification?.agent?.claims?.[cl.id]?.note;
      if (bn) lines.push(`  ※ 検証役の注記(主張を見ずに原典を読んだ側の指摘): ${cell(bn).slice(0, 400)}`);
    }
    return lines.join('\n');
  };
  const stats = {};
  for (const t of Object.keys(THEMES)) {
    const list = cards.filter((c) => c.themes.includes(t));
    stats[t] = list.length;
    writeFileSync(path.join(outDir, `${t}.md`), `# ${t} ${THEMES[t]} — 出典カード ${list.length}件\n\n${list.map(render).join('\n\n')}\n`);
  }
  const vendors = cards.filter((c) => c.sourceType === 'vendor-official');
  writeFileSync(path.join(outDir, 'VENDOR.md'), `# ベンダー公式の出典カード ${vendors.length}件\n\n${vendors.map(render).join('\n\n')}\n`);
  const all = cards;
  writeFileSync(path.join(outDir, 'ALL.md'), `# 全カード ${all.length}件\n\n${all.map(render).join('\n\n')}\n`);
  console.log(`束ね: ${JSON.stringify(stats)} vendor ${vendors.length} all ${all.length} → ${path.relative(ROOT, outDir)}`);
}

/** テーマ執筆役が返した調査課題の状態と回答要旨を rq.yaml へ反映する */
function rqUpdate(jsonPath) {
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const list = Array.isArray(data) ? data : data.rqUpdates ?? [];
  const doc = readYaml(RQ_PATH);
  const byId = new Map(doc.questions.map((q) => [q.id, q]));
  let n = 0;
  for (const u of list) {
    const q = byId.get(u.id);
    if (!q) {
      console.log(`  不明な RQ: ${u.id}`);
      continue;
    }
    if (u.status && VOCAB.rqStatus.includes(u.status)) q.status = u.status;
    if (u.answer) q.answer = String(u.answer);
    if (u.findings) q.findings = [...new Set([...(q.findings ?? []), ...u.findings])];
    n += 1;
  }
  writeYaml(RQ_PATH, doc);
  console.log(`調査課題の更新: ${n}件`);
}

// ---------------------------------------------------------------- adjudication

/**
 * 機械比較で決着しなかった主張(review / 原典に無い)を裁定役へ渡す作業票。
 * 裁定役は出典を取りに行かず、主張・検索役の抜粋・目隠し抽出の抜粋だけを突き合わせる。
 */
function adjudicationTasks() {
  const out = [];
  for (const { card } of loadCards()) {
    const ac = card.verification?.agent?.claims ?? {};
    for (const c of card.claims ?? []) {
      const a = ac[c.id];
      if (!a || a.adjudication || !['review', 'not-found-in-source', 'mismatch'].includes(a.verdict)) continue;
      out.push({
        id: card.id,
        claimId: c.id,
        title: card.title,
        claimText: c.text,
        claimQuant: c.quant?.value ?? null,
        claimQuote: c.quote,
        claimQuoteFoundInSource: card.verification?.mech?.quotes?.[c.id] ?? null,
        blindValue: a.extractedValue,
        blindQuote: a.extractedQuote,
        blindLocator: a.locator,
        blindNote: a.note,
        machineVerdict: a.verdict,
      });
    }
  }
  const file = path.join(ROOT, 'tmp/survey-2026-09/verify/adjudication-tasks.json');
  writeFileSync(file, JSON.stringify(out, null, 1));
  console.log(`裁定の作業票: ${out.length}件 → ${path.relative(ROOT, file)}`);
}

/**
 * 裁定結果の反映。入力: [{ id, claimId, verdict: consistent|corrected|inconsistent|unsupported, correctedText, reason }]
 * corrected は、目隠し抽出の原文(blindQuote)に沿って主張文を書き直し、quote も目隠し抽出の原文へ差し替える。
 */
function mergeAdjudication(jsonPath) {
  const rows = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const list = Array.isArray(rows) ? rows : rows.results ?? [];
  const cards = new Map(loadCards().map(({ file, card }) => [card.id, { file, card }]));
  const touched = new Set();
  const cnt = {};
  for (const r of list) {
    const e = cards.get(r.id);
    const claim = e?.card.claims.find((c) => c.id === r.claimId);
    const a = e?.card.verification?.agent?.claims?.[r.claimId];
    if (!claim || !a) continue;
    cnt[r.verdict] = (cnt[r.verdict] ?? 0) + 1;
    a.adjudication = { verdict: r.verdict, reason: r.reason ?? '', date: today() };
    if (r.verdict === 'consistent') a.verdict = 'match';
    else if (r.verdict === 'corrected' && r.correctedText) {
      a.adjudication.originalText = claim.text;
      a.adjudication.originalQuote = claim.quote;
      claim.text = r.correctedText;
      if (a.extractedQuote) claim.quote = a.extractedQuote;
      if (a.locator) claim.locator = a.locator;
      a.verdict = 'match';
    } else if (r.verdict === 'inconsistent') a.verdict = 'mismatch';
    else a.verdict = 'not-found-in-source';
    touched.add(r.id);
  }
  for (const id of touched) {
    const { file, card } = cards.get(id);
    const verdicts = Object.values(card.verification.agent.claims).map((c) => c.verdict);
    const pending = card.claims.filter((c) => !card.verification.agent.claims[c.id] && card.verification?.mech?.quotes?.[c.id] !== 'found');
    let status;
    if (verdicts.some((v) => v === 'mismatch')) status = 'mismatch';
    else if (verdicts.every((v) => v === 'match') && pending.length === 0) status = 'verified';
    else status = 'partial';
    card.verification.status = status;
    card.verification.method = [...new Set([...(card.verification.method ?? []), 'agent-adjudication'])];
    writeYaml(file, card);
  }
  console.log(`裁定の反映: ${touched.size}件のカード`, JSON.stringify(cnt));
}

// ---------------------------------------------------------------- findings-ingest

function findingsIngest(jsonPath) {
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const list = Array.isArray(data) ? data : data.findings ?? [];
  const existing = loadFindings();
  const ids = existing.map((f) => f.id);
  const cardsById = new Map(loadCards().map(({ card }) => [card.id, card]));
  let added = 0;
  for (const f of list) {
    const statement = String(f.statement ?? '').trim();
    if (!statement) continue;
    if (existing.some((e) => norm(e.statement) === norm(statement))) continue;
    const sources = [...new Set((f.sources ?? []).map(String))];
    const roots = new Set(
      sources.map((s) => {
        const id = s.split('#')[0];
        const card = cardsById.get(id);
        return card?.derivedFrom?.[0] ?? id;
      })
    );
    const issues = (f.issues ?? []).map((x) => (typeof x === 'object' ? { n: Number(x.n), stance: enumOr(x.stance, VOCAB.stance, 'context') } : { n: Number(String(x).replace('#', '')), stance: 'context' }));
    const id = nextId('FND', ids);
    ids.push(id);
    existing.push({
      id,
      theme: f.theme,
      statement,
      asOf: f.asOf ?? today(),
      level: enumOr(f.level, VOCAB.level, 'E0'),
      independentSources: roots.size,
      sources,
      counter: [...new Set((f.counter ?? []).map(String))],
      rqs: [...new Set((f.rqs ?? []).map(String))],
      issues,
      change: enumOr(f.change, VOCAB.change, 'new'),
      baseline: f.baseline ?? null,
      volatility: enumOr(f.volatility, VOCAB.volatility, 'medium'),
      reviewBy: f.reviewBy ?? null,
      supersedes: f.supersedes ?? null,
      note: f.note ?? '',
    });
    added += 1;
  }
  mkdirSync(SURVEY_DIR, { recursive: true });
  writeYaml(FINDINGS_PATH, { schemaVersion: 0, findings: existing });
  console.log(`知見: ${added}件追加(合計 ${existing.length}件)`);
}

// ---------------------------------------------------------------- lint

function refsIn(raw) {
  // 書式の例示(インラインコード・コードブロック)は参照として数えない
  const text = raw.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const fnd = [...text.matchAll(/\[(FND-\d{4})\]/g)].map((m) => m[1]);
  const src = [...text.matchAll(/\[(SRC-\d{4})(#c\d+)?\]/g)].map((m) => ({ id: m[1], claim: m[2]?.slice(1) ?? null }));
  return { fnd, src };
}

function lint() {
  const errors = [];
  const warns = [];
  const entries = loadCards();
  const cards = new Map();
  const canon = new Map();
  for (const { file, card } of entries) {
    const base = path.basename(file, '.yaml');
    const where = path.relative(ROOT, file);
    if (card.id !== base) errors.push(`${where}: id(${card.id})とファイル名が一致しません`);
    if (cards.has(card.id)) errors.push(`${where}: id が重複しています`);
    cards.set(card.id, card);
    if (canon.has(card.canonicalUrl)) warns.push(`${where}: canonicalUrl が ${canon.get(card.canonicalUrl)} と重複しています(片方を excluded/duplicate にしてください)`);
    canon.set(card.canonicalUrl, card.id);
    for (const [k, list] of [['status', VOCAB.status], ['orgType', VOCAB.orgType], ['region', VOCAB.region], ['sourceType', VOCAB.sourceType], ['publishedBasis', VOCAB.publishedBasis], ['access', VOCAB.access], ['readLevel', VOCAB.readLevel], ['volatility', VOCAB.volatility]]) {
      if (!list.includes(card[k])) errors.push(`${where}: ${k} が語彙にありません: ${card[k]}`);
    }
    if (!VOCAB.verificationStatus.includes(card.verification?.status)) errors.push(`${where}: verification.status が不正です: ${card.verification?.status}`);
    if (card.status === 'excluded' && !VOCAB.excludeReason.includes(card.excludeReason)) errors.push(`${where}: excluded には excludeReason が必要です`);
    if (card.status === 'included') {
      if (!card.title) errors.push(`${where}: title がありません`);
      if (!card.url) errors.push(`${where}: url がありません`);
      if (!card.summary) warns.push(`${where}: summary がありません`);
      if (!card.published) warns.push(`${where}: published がありません`);
      if (!card.themes?.length) warns.push(`${where}: themes がありません`);
      if (card.verification?.status === 'not-found') errors.push(`${where}: not-found のカードは excluded にしてください`);
    }
    const seenClaim = new Set();
    for (const c of card.claims ?? []) {
      if (seenClaim.has(c.id)) errors.push(`${where}: claim id 重複 ${c.id}`);
      seenClaim.add(c.id);
      if (!c.text) errors.push(`${where}#${c.id}: text がありません`);
      if (!c.quote && card.status === 'included') warns.push(`${where}#${c.id}: quote(原文抜粋)がありません`);
      if (!VOCAB.evidenceKind.includes(c.evidenceKind)) errors.push(`${where}#${c.id}: evidenceKind が語彙にありません: ${c.evidenceKind}`);
      if (!VOCAB.stance.includes(c.stance)) errors.push(`${where}#${c.id}: stance が語彙にありません: ${c.stance}`);
    }
    for (const t of card.themes ?? []) if (!THEMES[t]) errors.push(`${where}: 不明なテーマ ${t}`);
    for (const d of card.derivedFrom ?? []) if (!/^SRC-\d{4}$/.test(d)) errors.push(`${where}: derivedFrom は SRC-NNNN で書いてください: ${d}`);
  }
  for (const card of cards.values()) for (const d of card.derivedFrom ?? []) if (!cards.has(d)) errors.push(`${card.id}: derivedFrom の ${d} が存在しません`);

  const rqs = loadRqs();
  const rqIds = new Set(rqs.map((q) => q.id));
  for (const q of rqs) {
    if (!/^TH\d{2}-Q\d+$/.test(q.id ?? '') && !/^BASE-Q\d+$/.test(q.id ?? '')) errors.push(`rq.yaml: id の形式が不正です: ${q.id}`);
    if (!q.question) errors.push(`rq.yaml ${q.id}: question がありません`);
    if (!q.falsifier) warns.push(`rq.yaml ${q.id}: falsifier(何が見つかれば否定されるか)がありません`);
    if (!VOCAB.rqKind.includes(q.kind)) errors.push(`rq.yaml ${q.id}: kind が不正です: ${q.kind}`);
    if (!VOCAB.rqPriority.includes(q.priority)) errors.push(`rq.yaml ${q.id}: priority が不正です: ${q.priority}`);
    if (!VOCAB.rqStatus.includes(q.status)) errors.push(`rq.yaml ${q.id}: status が不正です: ${q.status}`);
    if (q.status !== 'open' && !q.answer) warns.push(`rq.yaml ${q.id}: answered/partial には answer(要旨)を書いてください`);
  }
  if (rqIds.size) {
    for (const card of cards.values()) for (const c of card.claims ?? []) for (const r of c.rqs ?? []) if (!rqIds.has(r)) warns.push(`${card.id}#${c.id}: 不明な RQ ${r}`);
  }

  const findings = loadFindings();
  const fndIds = new Set();
  let cited = 0;
  let citedVerified = 0;
  for (const f of findings) {
    if (fndIds.has(f.id)) errors.push(`findings ${f.id}: id 重複`);
    fndIds.add(f.id);
    if (!THEMES[f.theme]) errors.push(`findings ${f.id}: 不明なテーマ ${f.theme}`);
    if (!VOCAB.level.includes(f.level)) errors.push(`findings ${f.id}: level が不正です: ${f.level}`);
    if (!f.asOf) errors.push(`findings ${f.id}: asOf(YYYY-MM-DD 時点)がありません`);
    if (!f.sources?.length) errors.push(`findings ${f.id}: sources がありません`);
    for (const s of f.sources ?? []) {
      const m = /^(SRC-\d{4})(?:#(c\d+))?$/.exec(s);
      if (!m) {
        errors.push(`findings ${f.id}: sources は SRC-NNNN#cN で書いてください: ${s}`);
        continue;
      }
      const card = cards.get(m[1]);
      if (!card) {
        errors.push(`findings ${f.id}: ${m[1]} が存在しません`);
        continue;
      }
      if (card.status !== 'included') errors.push(`findings ${f.id}: excluded の出典 ${m[1]} を引いています`);
      if (m[2] && !card.claims.some((c) => c.id === m[2])) errors.push(`findings ${f.id}: ${m[1]} に ${m[2]} がありません`);
      if (card.readLevel === 'snippet') errors.push(`findings ${f.id}: readLevel=snippet の ${m[1]} は知見の根拠にできません`);
      const vs = card.verification?.status;
      cited += 1;
      if (vs === 'verified') citedVerified += 1;
      else if (vs === 'partial') warns.push(`findings ${f.id}: ${m[1]} は partial です(注記があるか確認)`);
      else errors.push(`findings ${f.id}: ${m[1]} の検証状態が ${vs} です(verified/partial のみ可)`);
    }
    for (const r of f.rqs ?? []) if (rqIds.size && !rqIds.has(r)) warns.push(`findings ${f.id}: 不明な RQ ${r}`);
    const roots = new Set((f.sources ?? []).map((s) => cards.get(s.split('#')[0])?.derivedFrom?.[0] ?? s.split('#')[0]));
    if (f.level === 'E3' && roots.size < 2) errors.push(`findings ${f.id}: E3 には独立した出典が2件以上必要です(現在 ${roots.size})`);
    // 独立性は発行元の単位で数える。同じ発行元の複数カードと、自己申告(selfReported)は独立した測定に数えない
    const publishers = new Set(
      [...roots]
        .map((id) => cards.get(id))
        .filter((c) => c && !c.selfReported)
        .map((c) => norm(c.publisher || c.url))
    );
    if (f.level === 'E3' && publishers.size < 2) errors.push(`findings ${f.id}: E3 には、自己申告でない独立した発行元が2件以上必要です(現在 ${publishers.size})`);
    if (f.level === 'E2' && roots.size < 1) errors.push(`findings ${f.id}: E2 には出典が1件以上必要です`);
  }

  // 散文中の参照
  const proseFiles = [];
  if (existsSync(SURVEY_DIR)) {
    for (const f of ['digest.md', 'README.md', 'verification.md', 'process-log.md']) if (existsSync(path.join(SURVEY_DIR, f))) proseFiles.push(path.join(SURVEY_DIR, f));
    for (const sub of ['themes', 'views']) {
      const dir = path.join(SURVEY_DIR, sub);
      if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.md')) proseFiles.push(path.join(dir, f));
    }
  }
  for (const file of proseFiles) {
    const text = readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    const { fnd, src } = refsIn(text);
    for (const id of fnd) if (!fndIds.has(id)) errors.push(`${rel}: [${id}] が findings.yaml にありません`);
    for (const { id, claim } of src) {
      const card = cards.get(id);
      if (!card) errors.push(`${rel}: [${id}] が台帳にありません`);
      else if (claim && !card.claims.some((c) => c.id === claim)) errors.push(`${rel}: [${id}#${claim}] がありません`);
    }
    if (/themes[\\/]/.test(rel)) {
      const lines = text.split(/\r?\n/).length;
      if (lines > 220) warns.push(`${rel}: ${lines}行(200行以内が目安)`);
    }
    if (rel.endsWith('digest.md')) {
      const body = text.split(/\r?\n/).filter((l) => /^\s*(?:\d+\.|[-*])\s/.test(l));
      for (const l of body) if (!/\[FND-\d{4}\]/.test(l) && /\d/.test(l) && !/^#/.test(l) && !/(前回|変化|問い|はじめに|凡例)/.test(l)) warns.push(`digest.md: 知見の参照が無い項目: ${l.trim().slice(0, 60)}`);
    }
  }

  const included = [...cards.values()].filter((c) => c.status === 'included');
  const st = {};
  for (const c of included) st[c.verification?.status] = (st[c.verification?.status] ?? 0) + 1;
  console.log(`台帳: ${cards.size}件(included ${included.length}件)。検証状態: ${JSON.stringify(st)}`);
  console.log(`知見: ${findings.length}件。知見が引く出典 ${cited}件のうち verified ${citedVerified}件(${cited ? Math.round((citedVerified / cited) * 100) : 0}%)`);
  console.log(`調査課題: ${rqs.length}件(must ${rqs.filter((q) => q.priority === 'must').length}、open ${rqs.filter((q) => q.status === 'open').length})`);
  for (const w of warns) console.log(`  注意 ${w}`);
  if (errors.length) {
    console.error('\n出典台帳の検査で問題が見つかりました:');
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log('検査: 問題なし');
}

// ---------------------------------------------------------------- index

const NOTES_START = '<!-- notes:start -->';
const NOTES_END = '<!-- notes:end -->';

function keepNotes(file) {
  if (!existsSync(file)) return `${NOTES_START}\n(ここに人が書く注記を置く。生成部分は編集しない)\n${NOTES_END}\n`;
  const text = readFileSync(file, 'utf8');
  const s = text.indexOf(NOTES_START);
  const e = text.indexOf(NOTES_END);
  if (s < 0 || e < 0) return `${NOTES_START}\n${NOTES_END}\n`;
  return text.slice(s, e + NOTES_END.length) + '\n';
}

function writeGenerated(file, title, body, { notes = true } = {}) {
  mkdirSync(path.dirname(file), { recursive: true });
  const head = `# ${title}\n\n> 自動生成(\`node scripts/research-ledger.mjs index\`)。手で編集しない。注記は notes マーカーの内側にだけ書く。\n\n`;
  const noteBlock = notes ? `## 注記\n\n${keepNotes(file)}\n` : '';
  writeFileSync(file, head + body.trimEnd() + '\n\n' + noteBlock);
  console.log(`生成: ${path.relative(ROOT, file)}`);
}

function link(card) {
  return `[${card.title.replace(/[\[\]|]/g, ' ').slice(0, 90)}](${card.url})`;
}

function cell(s) {
  return String(s ?? '').replace(/\|/g, '｜').replace(/\r?\n/g, ' ');
}

function index() {
  const entries = loadCards();
  const cards = entries.map(({ card }) => card);
  const included = cards.filter((c) => c.status === 'included');
  const findings = loadFindings();
  const rqs = loadRqs();
  const byId = new Map(cards.map((c) => [c.id, c]));

  // catalog.md
  {
    const rows = cards.map((c) => `| ${c.id} | ${cell(c.published ?? '?')} | ${c.sourceType} | ${c.region}/${c.lang} | ${c.status === 'excluded' ? `除外(${c.excludeReason})` : c.verification?.status} | ${(c.themes ?? []).join(' ')} | ${cell(c.summary).slice(0, 80)} | ${link(c)} |`);
    const body = `件数: ${cards.length}(included ${included.length}、excluded ${cards.length - included.length})。生成日 ${today()}。\n\n読み方: ID で \`research/sources/SRC-NNNN.yaml\` を開くと主張(claims)と検証結果がある。テーマ・Issue から引くときは調査スナップショットの \`by-issue.md\` / \`questions.md\` を先に見る。\n\n| ID | 公開日 | 種別 | 地域/言語 | 検証 | テーマ | 要約 | 出典 |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}`;
    writeGenerated(path.join(SOURCES_DIR, 'catalog.md'), '出典台帳 カタログ', body, { notes: false });
  }
  if (!existsSync(SURVEY_DIR)) return;

  // by-issue.md
  {
    const issueMap = new Map();
    for (const f of findings) for (const it of f.issues ?? []) {
      const n = typeof it === 'object' ? it.n : Number(it);
      const stance = typeof it === 'object' ? it.stance : 'context';
      if (!issueMap.has(n)) issueMap.set(n, { findings: [], claims: [] });
      issueMap.get(n).findings.push({ f, stance });
    }
    for (const c of included) for (const cl of c.claims ?? []) for (const n of cl.issues ?? []) {
      if (!issueMap.has(n)) issueMap.set(n, { findings: [], claims: [] });
      issueMap.get(n).claims.push({ c, cl });
    }
    const stanceJa = { supports: '支持', contradicts: '反証', qualifies: '限定', context: '文脈' };
    const order = { contradicts: 0, qualifies: 1, supports: 2, context: 3 };
    const short = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);
    const parts = [];
    const toc = [];
    for (const n of [...issueMap.keys()].sort((a, b) => a - b)) {
      if (n === 282) continue; // この調査自身の Issue
      const { findings: fs, claims } = issueMap.get(n);
      fs.sort((x, y) => order[x.stance] - order[y.stance] || x.f.id.localeCompare(y.f.id));
      const main = fs.filter((x) => x.stance !== 'context');
      const ctx = fs.filter((x) => x.stance === 'context');
      const cnt = (st) => fs.filter((x) => x.stance === st).length;
      toc.push(`| #${n} | ${cnt('supports')} | ${cnt('contradicts')} | ${cnt('qualifies')} | ${cnt('context')} |`);
      parts.push(`## #${n}\n`);
      parts.push(`支持 ${cnt('supports')} / 反証 ${cnt('contradicts')} / 限定 ${cnt('qualifies')} / 文脈 ${cnt('context')}(立場は起票者の主張に対するもの)\n`);
      if (main.length) {
        parts.push('| 知見 | 立場 | 水準 | 主張(冒頭。全文は findings.yaml) | 根拠(先頭3件) |\n|---|---|---|---|---|');
        for (const { f, stance } of main) parts.push(`| [${f.id}] | ${stanceJa[stance]} | ${f.level} | ${short(cell(f.statement), 180)}(${f.asOf} 時点) | ${f.sources.slice(0, 3).map((s) => `[${s}]`).join(' ')}${f.sources.length > 3 ? ` ほか${f.sources.length - 3}` : ''} |`);
        parts.push('');
      }
      if (ctx.length) parts.push(`文脈として関係する知見: ${ctx.map(({ f }) => `[${f.id}]`).join(' ')}\n`);
      const only = claims.filter(({ c, cl }) => !fs.some(({ f }) => f.sources.includes(`${c.id}#${cl.id}`)));
      if (only.length) {
        const by = {};
        for (const { c, cl } of only) (by[cl.stance] ??= []).push(`[${c.id}#${cl.id}]`);
        parts.push(`知見に束ねていない根拠(主張は出典カードを開いて読む): ${Object.entries(by).sort((x, y) => order[x[0]] - order[y[0]]).map(([st, ids]) => `${stanceJa[st]} ${ids.join(' ')}`).join(' / ')}\n`);
      }
    }
    const body = `Issue 番号 → その主張を支持・反証・限定する知見。読み方: \`grep -n "^## #258" by-issue.md\` で節へ飛び、表の1行で足りなければ \`grep -n -A16 "id: FND-0031" findings.yaml\` で知見の全文と限定条件(note)を読む。数値や引用が要るときだけ \`SRC-NNNN.yaml\` を開く。反証・限定を先に並べている。#248 より前の番号は、既存の調査メモ(番号はそのメモの Issue)が引いた文献の検証結果。\n\n| Issue | 支持 | 反証 | 限定 | 文脈 |\n|---|---|---|---|---|\n${toc.join('\n')}\n\n${parts.join('\n')}`;
    writeGenerated(path.join(SURVEY_DIR, 'by-issue.md'), 'Issue 別の根拠索引', body, { notes: false });
  }

  // questions.md
  {
    const rows = rqs.map((q) => {
      const fs = findings.filter((f) => (f.rqs ?? []).includes(q.id));
      const cl = included.flatMap((c) => (c.claims ?? []).filter((x) => (x.rqs ?? []).includes(q.id)).map((x) => `${c.id}#${x.id}`));
      return `| ${q.id} | ${q.priority} | ${q.kind} | ${q.status} | ${cell(q.question)} | ${cell(q.answer ?? '')} | ${fs.map((f) => `[${f.id}]`).join(' ')} | ${cl.length} |`;
    });
    const must = rqs.filter((q) => q.priority === 'must');
    const body = `調査課題 ${rqs.length}件(must ${must.length}: answered ${must.filter((q) => q.status === 'answered').length} / partial ${must.filter((q) => q.status === 'partial').length} / open ${must.filter((q) => q.status === 'open').length})。\n\n| RQ | 優先 | 種別 | 状態 | 問い | 回答の要旨 | 知見 | 根拠数 |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}`;
    writeGenerated(path.join(SURVEY_DIR, 'questions.md'), '調査課題の回答状況', body, { notes: false });
  }

  // coverage.md
  {
    const types = VOCAB.sourceType;
    const regions = VOCAB.region;
    const th = Object.keys(THEMES);
    const count = (pred) => included.filter(pred).length;
    const t1 = [`| テーマ | ${types.join(' | ')} | 計 |`, `|---|${types.map(() => '---').join('|')}|---|`];
    for (const t of th) t1.push(`| ${t} ${THEMES[t]} | ${types.map((ty) => count((c) => c.themes.includes(t) && c.sourceType === ty) || '').join(' | ')} | ${count((c) => c.themes.includes(t))} |`);
    const t2 = [`| テーマ | ${regions.join(' | ')} | 反証(contradicts) | 学術 | 公式/規格 | 日本 |`, `|---|${regions.map(() => '---').join('|')}|---|---|---|---|`];
    const isAcademic = (c) => ['paper-peer', 'preprint'].includes(c.sourceType);
    const isOfficial = (c) => ['vendor-official', 'standard', 'regulation', 'public-agency'].includes(c.sourceType);
    for (const t of th) {
      const inT = included.filter((c) => c.themes.includes(t));
      const contra = inT.filter((c) => c.claims.some((x) => x.stance === 'contradicts')).length;
      const mark = (n) => (n > 0 ? `✓ ${n}` : '✗');
      t2.push(`| ${t} | ${regions.map((r) => inT.filter((c) => c.region === r).length || '').join(' | ')} | ${mark(contra)} | ${mark(inT.filter(isAcademic).length)} | ${mark(inT.filter(isOfficial).length)} | ${mark(inT.filter((c) => c.region === 'jp').length)} |`);
    }
    const clusters = new Map();
    for (const c of cards) {
      const k = c.foundBy?.cluster ?? '?';
      clusters.set(k, (clusters.get(k) ?? 0) + 1);
    }
    const t3 = ['| クラスタ | 件数 |', '|---|---|', ...[...clusters.entries()].sort().map(([k, v]) => `| ${k} | ${v} |`)];
    const body = `must セル = 各テーマに 学術≥1・公式/規格≥1・日本≥1・反証探索≥1。✗ のセルは「探して無かった」を注記に書く。\n\n## テーマ × 出典種別\n\n${t1.join('\n')}\n\n## テーマ × 地域、must セル\n\n${t2.join('\n')}\n\n## クラスタ別件数\n\n${t3.join('\n')}`;
    writeGenerated(path.join(SURVEY_DIR, 'coverage.md'), '網羅性', body);
  }

  // verification.md (集計ブロックのみ差し替え)
  {
    const file = path.join(SURVEY_DIR, 'verification.md');
    const st = {};
    for (const c of included) st[c.verification?.status] = (st[c.verification?.status] ?? 0) + 1;
    const excluded = cards.filter((c) => c.status === 'excluded');
    const problem = included.filter((c) => ['mismatch', 'unreachable', 'partial', 'needs-agent', 'unverified'].includes(c.verification?.status));
    const gen = [
      `<!-- ledger:verification:start -->`,
      `集計(生成日 ${today()}): ${Object.entries(st).map(([k, v]) => `${k} ${v}`).join(' / ')}`,
      '',
      '### 要確認(verified 以外)',
      '',
      '| ID | 状態 | 方法 | 注記 | 出典 |',
      '|---|---|---|---|---|',
      ...problem.map((c) => `| ${c.id} | ${c.verification.status} | ${(c.verification.method ?? []).join(',')} | ${cell(c.verification.note ?? c.verification.mech?.note ?? '')} | ${link(c)} |`),
      '',
      '### 除外した出典(却下は成果)',
      '',
      '| ID | 理由 | 出典 |',
      '|---|---|---|',
      ...excluded.map((c) => `| ${c.id} | ${c.excludeReason} | ${link(c)} |`),
      `<!-- ledger:verification:end -->`,
    ].join('\n');
    let text = existsSync(file) ? readFileSync(file, 'utf8') : `# 検証の記録\n\n## 手順\n\n(L0 生成時 / L1 機械 / L2 目隠し抽出 / L3 懐疑役 / L4 人)\n\n## 集計\n\n${gen}\n\n## Issue が引く文献の判定\n\n## 人の抽出検査(オーナー)\n\n| ID | 確認日 | 結果 | 備考 |\n|---|---|---|---|\n`;
    const s = text.indexOf('<!-- ledger:verification:start -->');
    const e = text.indexOf('<!-- ledger:verification:end -->');
    text = s >= 0 && e >= 0 ? text.slice(0, s) + gen + text.slice(e + '<!-- ledger:verification:end -->'.length) : text + '\n' + gen + '\n';
    writeFileSync(file, text);
    console.log(`生成: ${path.relative(ROOT, file)}(集計ブロック)`);
  }

  // views
  {
    const viewsDir = path.join(SURVEY_DIR, 'views');
    // landscape: events
    const ev = included.flatMap((c) => (c.events ?? []).map((e) => ({ ...e, id: c.id, pub: c.publisher }))).sort((a, b) => a.date.localeCompare(b.date));
    writeGenerated(path.join(viewsDir, 'landscape.md'), 'モデル・ツールの年表(2026-06〜09)', `出典カードの events から生成。日付は出典が示す発表日。\n\n| 日付 | 出来事 | 発表元 | 根拠 |\n|---|---|---|---|\n${ev.map((e) => `| ${e.date} | ${cell(e.label)} | ${cell(e.pub)} | [${e.id}] |`).join('\n')}`);
    // japan
    const jp = included.filter((c) => c.region === 'jp');
    const groups = ['enterprise', 'startup', 'sier', 'user-it', 'government', 'standards-body', 'academic', 'consultancy', 'media', 'community', 'individual', 'vendor', 'nonprofit'];
    const parts = [];
    for (const g of groups) {
      const list = jp.filter((c) => c.orgType === g);
      if (!list.length) continue;
      parts.push(`## ${g}(${list.length})\n\n| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |\n|---|---|---|---|---|---|\n${list.map((c) => `| ${c.id} | ${c.published ?? '?'} | ${cell(c.publisher)} | ${cell(c.summary).slice(0, 100)} | ${c.themes.join(' ')} | ${link(c)} |`).join('\n')}\n`);
    }
    writeGenerated(path.join(viewsDir, 'japan.md'), '日本の実務動向(出典一覧)', `region=jp のカード ${jp.length}件を組織種別ごとに並べる。\n\n${parts.join('\n')}`);
    // empirical
    const emp = [];
    for (const c of included) for (const cl of c.claims ?? []) if (['rct', 'controlled-experiment', 'observational', 'survey', 'benchmark'].includes(cl.evidenceKind)) emp.push({ c, cl });
    writeGenerated(path.join(viewsDir, 'empirical.md'), '実証研究の一覧(研究デザイン・N・効果)', `数値を持つ主張を研究デザインごとに並べる。E3 判定(独立した複数の測定)の材料。\n\n| 根拠 | デザイン | N / 母集団 | 値 | 主張 | 公開日 | 検証 | selfReported |\n|---|---|---|---|---|---|---|---|\n${emp.map(({ c, cl }) => `| [${c.id}#${cl.id}] | ${cl.evidenceKind} | ${cell(cl.quant?.n ?? '')} ${cell(cl.quant?.population ?? '')} | ${cell(cl.quant?.value ?? '')} | ${cell(cl.text).slice(0, 100)} | ${c.published ?? '?'} | ${c.verification?.status} | ${c.selfReported ? 'yes' : ''} |`).join('\n')}`);
    // vendor-matrix: 手書き本文 + 付録(公式出典一覧)
    const vm = path.join(viewsDir, 'vendor-matrix.md');
    const vendors = included.filter((c) => c.sourceType === 'vendor-official');
    const byPub = new Map();
    for (const c of vendors) byPub.set(c.publisher, [...(byPub.get(c.publisher) ?? []), c]);
    const appendix = ['<!-- ledger:vendors:start -->', ...[...byPub.entries()].sort().flatMap(([p, list]) => [`### ${p}(${list.length})`, '', ...list.map((c) => `- [${c.id}] ${c.published ?? '?'} ${link(c)} — ${cell(c.summary).slice(0, 80)}`), '']), '<!-- ledger:vendors:end -->'].join('\n');
    let text = existsSync(vm) ? readFileSync(vm, 'utf8') : `# AI ベンダー推奨方針の比較\n\n(本文はエージェントが書く。列: 自律度の既定値 / 人の承認点 / 作成者と承認者の分離 / AIレビューの位置づけ / スキル・ルール・メモリ機構 / マルチエージェントの推奨・警告 / 仕様駆動の推奨 / 費用統制 / 監査ログ / 発表日。各セルに [SRC-] を付ける)\n\n## 付録: 公式出典の一覧(生成)\n\n${appendix}\n`;
    const s = text.indexOf('<!-- ledger:vendors:start -->');
    const e = text.indexOf('<!-- ledger:vendors:end -->');
    text = s >= 0 && e >= 0 ? text.slice(0, s) + appendix + text.slice(e + '<!-- ledger:vendors:end -->'.length) : text + '\n' + appendix + '\n';
    writeFileSync(vm, text);
    console.log(`生成: ${path.relative(ROOT, vm)}(付録ブロック)`);
  }
}

// ---------------------------------------------------------------- main

switch (cmd) {
  case 'ingest':
    ingest(args[1]);
    break;
  case 'reformat': {
    for (const { file, card } of loadCards()) writeYaml(file, card);
    if (existsSync(FINDINGS_PATH)) {
      // 独立出典数は、一次出典へ束ねたうえで「自己申告でない発行元」の数として数え直す
      const byId = new Map(loadCards().map(({ card }) => [card.id, card]));
      const doc = readYaml(FINDINGS_PATH);
      for (const f of doc.findings ?? []) {
        const roots = new Set((f.sources ?? []).map((x) => byId.get(x.split('#')[0])?.derivedFrom?.[0] ?? x.split('#')[0]));
        f.independentSources = new Set([...roots].map((id) => byId.get(id)).filter((c) => c && !c.selfReported).map((c) => norm(c.publisher || c.url))).size;
      }
      writeYaml(FINDINGS_PATH, doc);
    }
    console.log('再整形しました');
    break;
  }
  case 'repair-urls':
    repairUrls(args[1]);
    break;
  case 'verify':
    await verify();
    break;
  case 'merge-verification':
    mergeVerification(args[1]);
    break;
  case 'blind-tasks':
    blindTasks();
    break;
  case 'adjudication-tasks':
    adjudicationTasks();
    break;
  case 'merge-adjudication':
    mergeAdjudication(args[1]);
    break;
  case 'bundles':
    bundles();
    break;
  case 'rq-update':
    rqUpdate(args[1]);
    break;
  case 'findings-ingest':
    findingsIngest(args[1]);
    break;
  case 'lint':
    lint();
    break;
  case 'index':
    index();
    break;
  default:
    console.log('使い方: research-ledger.mjs <ingest <dir> | verify [--ids a,b|--all] | blind-tasks [--batch N] | merge-verification <json> | findings-ingest <json> | lint | index>');
    process.exit(cmd ? 2 : 0);
}
