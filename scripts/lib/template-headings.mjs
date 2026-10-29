// 準拠テンプレートの様式の見出しと、対応表(src/data/template-fields.yaml)の照合(方向3)。
// check-template-fields.mjs と test-template-fields.mjs が使う(ADR-0087 決定4、#317 突合 X-6・X-7)

/** extra の区分 */
export const EXTRA_KINDS = {
  'same-as-standard': '標準の様式の節と同じ見出し。standard に標準の見出しを書く',
  structure: 'テンプレートの節の構成。標準の欄を節に分けて置き、欄は fields で検査する',
  guide: '記入の手引き。欄を足さず、標準と逆の指示を含まない',
};

/** 見出しの正規化。番号の接頭辞(「N. 」)と、末尾の適用範囲の括弧(「(適用: …)」)を除く */
export function normalizeHeading(text) {
  return String(text)
    .trim()
    .replace(/^\d+\.\s+/, '')
    .replace(/\s*\(適用:[^()]*(\([^()]*\)[^()]*)*\)\s*$/, '')
    .trim();
}

/** フェンスの外の「## 」見出しの文字列(## を除く)の並び */
export function headingsOf(text) {
  const out = [];
  let fenced = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^## (.+?)\s*$/.exec(line);
    if (m) out.push(m[1]);
  }
  return out;
}

/**
 * 様式の見出しの照合。節を指す欄(standard が # で始まる欄)の template と、正規化した見出しの完全一致を対応とする。
 * 対応の無い見出しは extra の登録(heading・kind・reason)を要する。
 * 戻り値: { problems: [文], extras: 件数 }
 */
export function checkHeadings(form, body, standardText) {
  const problems = [];
  const registered = new Map();
  for (const ex of form.extra ?? []) {
    if (!ex.heading || !ex.reason || !ex.kind) {
      problems.push(`${form.name}: extra の登録には heading・kind・reason が要ります(${JSON.stringify(ex)})`);
      continue;
    }
    if (!(ex.kind in EXTRA_KINDS)) {
      problems.push(`${form.name}: extra「${ex.heading}」の kind「${ex.kind}」は ${Object.keys(EXTRA_KINDS).join(' / ')} のいずれかにしてください`);
    }
    if (ex.kind === 'same-as-standard' && !ex.standard) {
      problems.push(`${form.name}: extra「${ex.heading}」は same-as-standard のため standard(標準の見出し)が要ります`);
    }
    if (ex.standard && !standardText.includes(ex.standard)) {
      problems.push(`${form.name}: extra「${ex.heading}」の standard「${ex.standard}」が標準の第6章に見つかりません`);
    }
    registered.set(ex.heading, ex);
  }
  if (body === null) return { problems, extras: 0 };
  const sectionTemplates = new Set((form.fields ?? []).filter((f) => !f.omit && /^#/.test(f.standard)).map((f) => normalizeHeading(f.template)));
  const headings = headingsOf(body);
  let extras = 0;
  for (const h of headings) {
    if (sectionTemplates.has(normalizeHeading(h))) continue;
    if (registered.has(h)) {
      extras += 1;
      continue;
    }
    problems.push(
      `${form.name}: ${form.file} の見出し「## ${h}」に、対応表の対応がありません。\n` +
        `  標準の節に対応するなら fields へ、標準に無い節なら extra へ heading・kind・reason を登録してください`
    );
  }
  for (const h of registered.keys()) {
    if (!headings.includes(h)) problems.push(`${form.name}: extra に登録した見出し「${h}」が ${form.file} にありません`);
  }
  return { problems, extras };
}
