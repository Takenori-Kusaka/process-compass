// 注意の枠の中の要求・禁止(検査12 の拡張)と、主語の無い表明の文末(検査17)の判定(#440 / ADR-0132)
//
// scripts/check-provisions.mjs が使う。試験は scripts/test-provisions.mjs(npm run test:provisions)。
// 登録簿は src/data/provision-forms.yaml の undecidedFrameSentences・declarationVerbs。

/**
 * 行が注意の枠の開きか。札が根拠水準のマークの書式(「暫定 EV-NNNN」)の枠は対象の外。「暫定」の語を含むだけの札は対象に入る(X-6)。
 * 注記(:::note)は検査12 の本来の対象なので、ここでは扱わない。戻り値: 'frame' | 'tentative' | null
 */
export function frameOpening(line) {
  const m = /^\s*:::(caution|danger|tip|warning)(?![A-Za-z])(.*)$/.exec(line);
  if (!m) return null;
  return /^\[暫定 EV-\d+/.test(m[2]) ? 'tentative' : 'frame';
}

/** 行が枠の閉じ(:::だけの行)か */
export const isFenceClose = (line) => /^\s*:::\s*$/.test(line);

/** 行を文に切る。「。」と表の升の区切り「|」で切り、強調(**)と箇条書きの記号を外す */
export function splitSentences(line) {
  return line
    .replace(/\*\*/g, '')
    .split(/。|\|/)
    .map((x) => x.replace(/^\s*(?:[-*]\s+|\d+\.\s+)?/, '').trim())
    .filter(Boolean);
}

/**
 * 行の中の、re に当たる文のうち、登録した句を含まない文を返す(X-5。除外は行ではなく文の単位)。
 * 登録した文と同じ行・同じ段落へ別の禁止を足しても、足した文は登録の句を含まないので残る。
 */
export function unregisteredSentences(line, re, phrases) {
  return splitSentences(line).filter((s) => re.test(s) && !phrases.some((p) => s.includes(p)));
}

/**
 * 主語の無い表明の文末(検査17)を探す。
 * verbs は登録簿 declarationVerbs.verbs、subject は同 subject(正規表現の文字列)。
 * 文末は、否定形の後ろが行末・閉じ括弧・開き括弧のとき(共通の END を変えず、この検査だけの形)。
 * 戻り値: 検出した文の配列(文・動詞の否定形)
 */
export function subjectlessDeclarations(line, verbs, subject) {
  const out = [];
  const reSubject = new RegExp(subject);
  for (const sentence of splitSentences(line)) {
    if (reSubject.test(sentence)) continue;
    for (const v of verbs) {
      for (const form of v.forms ?? []) {
        const re = new RegExp(`${form}(?=\\s*(?:$|[)）(（]))`);
        if (re.test(sentence)) out.push({ sentence, form });
      }
    }
  }
  return out;
}

/** declarationVerbs の項目の問題(空なら適合)。自己試験の hit を検出し、miss を検出しない */
export function declarationVerbProblems(entry, subject) {
  const problems = [];
  const label = entry?.verb ?? '(verb 無し)';
  if (!entry?.verb) problems.push(`${label}: verb がありません`);
  if (!entry?.by) problems.push(`${label}: by(決めた決定)がありません`);
  if (!Array.isArray(entry?.forms) || entry.forms.length === 0) {
    problems.push(`${label}: forms(否定形)がありません`);
    return problems;
  }
  const hit = entry?.specs?.hit ?? [];
  const miss = entry?.specs?.miss ?? [];
  if (hit.length === 0) problems.push(`${label}: specs.hit(検出する文)がありません`);
  if (miss.length === 0) problems.push(`${label}: specs.miss(検出しない文)がありません`);
  for (const h of hit) {
    if (subjectlessDeclarations(h, [entry], subject).length === 0) problems.push(`${label}: hit の文を検出しません「${h}」`);
  }
  for (const m of miss) {
    if (subjectlessDeclarations(m, [entry], subject).length > 0) problems.push(`${label}: miss の文を検出します「${m}」`);
  }
  return problems;
}

/**
 * 地位が未決の文の登録(undecidedFrameSentences)と実物の一致の問題を返す(空なら一致)。
 *   entries   — 登録の項目
 *   notice    — { frame, declaration } 実物のそばに置く文
 *   linesOf   — page を渡すと、その頁の行の配列(コードブロック除去済み)を返す関数。頁が無ければ null
 *   inFrame   — page を渡すと、各行が注意の枠の中か(真偽の配列)を返す関数
 *   ledgerText — 第1章 1.7.2 のマークの表を含む頁の全文
 * 検査は値の一致と存在だけを見る。文の意味は見ない
 */
export function undecidedProblems({ entries, notice, linesOf, inFrame, ledgerText }) {
  const problems = [];
  entries.forEach((e, k) => {
    const label = e?.phrase ?? `(${k + 1} 番目の項目)`;
    for (const f of ['kind', 'page', 'phrase', 'ledgerKey', 'issue', 'review']) {
      if (e?.[f] === undefined || e[f] === '') problems.push(`${label}: ${f} がありません`);
    }
    if (!['frame', 'declaration'].includes(e?.kind)) {
      problems.push(`${label}: kind は frame か declaration です`);
      return;
    }
    if (!e.page || !e.phrase) return;
    const lines = linesOf(e.page);
    if (!lines) {
      problems.push(`${label}: 頁 ${e.page} がありません`);
      return;
    }
    const frames = e.kind === 'frame' ? inFrame(e.page) : null;
    const idx = lines.findIndex((l, i) => l.includes(e.phrase) && (e.kind === 'declaration' || frames[i]));
    if (idx < 0) {
      problems.push(`${label}: 登録の句が本文${e.kind === 'frame' ? 'の注意の枠の中' : ''}にありません(本文から消えた登録。審議が済んだなら、登録と第1章 1.7.2 のマークの表の行を除いてください)`);
    } else {
      const want = notice?.[e.kind];
      if (!want) problems.push(`${label}: notice.${e.kind} がありません`);
      else {
        // 実物のそばの表示: 枠は閉じの後、文は同じ段落。句の行から 8 行以内に表示の文があること
        const near = lines.slice(idx, idx + 9).join('\n');
        if (!near.includes(want)) problems.push(`${label}: 実物のそばに表示の文がありません「${want}」`);
      }
    }
    if (e.ledgerKey && !ledgerText.includes(e.ledgerKey)) {
      problems.push(`${label}: 第1章 1.7.2 のマークの表に「${e.ledgerKey}」がありません`);
    }
  });
  return problems;
}
