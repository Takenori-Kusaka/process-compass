// 文末の肯定の「できます/できる」の登録簿の検査(#366 / ADR-0117)
//
// 規定の文書(本文8章と規定の附属書)の文を、#366 の抽出(research/366-deliberation/extract.mjs)と同じ規則で区切り、
// 文末が「できます」か「できる」の文を拾う。拾った文が登録簿(src/data/dekimasu-registry.yaml)に無ければ失敗とする。
// 機械は「できます」が許容か能力かを判定しない。確かめるのは、区分を付けて登録された文かどうかだけである(第1章 1.7.4)。
//
// 文の区切り: 「。」、表の升、<br>、箇条の末尾
// 末尾の判定: リンクを文字列に直し、末尾の括弧(半角・全角)・強調・空白・読点を外してから判定する
// 除外: フロントマター、HTML の注記、markdown・text 以外のコードブロック(mermaid など)
// 含める: markdown・text のコードブロックの中の文(様式の中の文)

/** 区分。許容(permission)は置けない。第1章 1.7.1 は文末の「できます」を許容に使わないと定める */
export const CLASSES = {
  capability: '能力・可能性',
  criterion: '判定基準・条件・力量要件の項目',
  other: 'その他(命題など)',
};
/** 区分の根拠。ai-blind: 2つの AI の読み手(前後1文)。ai-context: AI の裁定役が頁の文脈で確かめた。human: 人が読んで登録した */
export const BASES = ['ai-blind', 'ai-context', 'human'];

const END = /(できます|できる)$/;

/** 文を末尾の判定の形に直す(リンク・タグ・末尾の括弧・強調・空白・読点を外す) */
export function normalizeSentence(s) {
  let t = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/<[^>]+>/g, '');
  t = t.trim();
  let prev;
  do {
    prev = t;
    t = t.replace(/[\s*_`]+$/g, '');
    t = t.replace(/(\([^()]*\)|（[^（）]*）)$/u, '');
    t = t.replace(/[、,:：;]+$/u, '');
  } while (t !== prev);
  return t;
}

/** 頁の行から文を取り出す。{ line, text }。text は句点を外して normalizeSentence を通したもの */
export function sentencesOf(lines) {
  const out = [];
  let inFront = false;
  let inCode = false;
  let codeLang = '';
  let inComment = false;
  lines.forEach((ln, i) => {
    const no = i + 1;
    if (i === 0 && ln.trim() === '---') { inFront = true; return; }
    if (inFront) { if (ln.trim() === '---') inFront = false; return; }
    const fm = ln.match(/^\s*(```|~~~)(\w*)/);
    if (fm) { inCode = !inCode; codeLang = inCode ? fm[2] : ''; return; }
    if (inCode && !/^(markdown|text)$/.test(codeLang)) return;
    let l = ln;
    if (inComment) {
      const e = l.indexOf('-->');
      if (e < 0) return;
      l = l.slice(e + 3);
      inComment = false;
    }
    l = l.replace(/<!--.*?-->/g, '');
    const s = l.indexOf('<!--');
    if (s >= 0) { l = l.slice(0, s); inComment = true; }
    if (!l.trim()) return;
    if (/^\s*\|?\s*:?-{3,}/.test(l) && /^[\s|:-]+$/.test(l)) return; // 表の区切りの行
    const cells = /^\s*\|/.test(l)
      ? l.replace(/\\\|/g, '\u0000').split('|').slice(1, -1).map((c) => c.replace(/\u0000/g, '|'))
      : [l.replace(/^\s*(>\s*)?([-*+]|\d+\.)?\s*/, '').replace(/^#+\s*/, '')];
    for (const c of cells) {
      for (const piece of c.split(/<br\s*\/?>/)) {
        for (const p of piece.split(/(?<=。)/)) {
          if (p.trim()) out.push({ line: no, text: normalizeSentence(p.trim().replace(/。$/, '')) });
        }
      }
    }
  });
  return out;
}

/** 文末が「できます/できる」の文 */
export function findDekimasu(lines) {
  return sentencesOf(lines).filter((s) => END.test(s.text));
}

/**
 * 登録簿と頁を照合する。
 * @param {{ entries: any[] }} registry
 * @param {Record<string, string[]>} pages 頁(src/content/docs/ からの相対パス、拡張子なし) → 行
 * @returns {{ problems: string[], found: number, registered: number }}
 */
export function checkDekimasu(registry, pages) {
  const problems = [];
  const entries = Array.isArray(registry?.entries) ? registry.entries : [];
  const keys = new Map();
  entries.forEach((e, i) => {
    const at = `登録簿の ${i + 1} 件目(${e?.id ?? '識別子なし'})`;
    if (!e || typeof e.page !== 'string' || typeof e.text !== 'string' || !e.text) {
      problems.push(`${at}: page と text を書いてください`);
      return;
    }
    if (!(e.page in pages)) problems.push(`${at}: page「${e.page}」は検査の対象の頁(規定の文書)ではありません`);
    if (e.class === 'permission') problems.push(`${at}: 区分に許容(permission)は置けません。許容は「〜してよいものとします/〜してよい」の形で書いてください(第1章 1.7.1)`);
    else if (!(e.class in CLASSES)) problems.push(`${at}: 区分(class)は ${Object.keys(CLASSES).join('・')} のいずれかです(「${e.class ?? ''}」)`);
    if (!BASES.includes(e.basis)) problems.push(`${at}: 区分の根拠(basis)は ${BASES.join('・')} のいずれかです(「${e.basis ?? ''}」)`);
    if (e.text !== normalizeSentence(e.text) || !END.test(e.text)) problems.push(`${at}: text は、文末の句点・括弧・強調を外した文で、「できます」か「できる」で終わる形で書いてください`);
    const key = `${e.page}\u0000${e.text}`;
    if (keys.has(key)) problems.push(`${at}: 同じ頁の同じ文が ${keys.get(key)} にもあります`);
    else keys.set(key, at);
  });
  let found = 0;
  const seen = new Set();
  for (const [page, lines] of Object.entries(pages)) {
    for (const s of findDekimasu(lines)) {
      found++;
      const key = `${page}\u0000${s.text}`;
      if (keys.has(key)) { seen.add(key); continue; }
      problems.push(`${page}.md:${s.line}: 文末の「できます/できる」が登録簿にありません。「${s.text.slice(-40)}」。許容なら「〜してよいものとします/〜してよい」へ改め、能力・可能性または条件の項目なら区分を付けて登録してください(第1章 1.7.1・1.7.4)`);
    }
  }
  for (const [key, at] of keys) {
    if (!seen.has(key)) {
      const [page, text] = key.split('\u0000');
      problems.push(`${at}: 登録した文が ${page} にありません。「${text.slice(-40)}」。文を改めたら登録も改めてください`);
    }
  }
  return { problems, found, registered: entries.length };
}
