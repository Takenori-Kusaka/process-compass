// 実装マークの対象の棚卸し(Issue #292 / ADR-0076)
//
// 実装マークは、付けた規定についてだけ降ろし先を追跡する。付けていない規定は台帳に
// 現れない。本モジュールは、対象のページを節に区切り、節ごとに「マーク済み / 判定基準の表 /
// 対象にしない / 未棚卸し」のどれかが登録簿(src/data/impl-inventory.yaml)にあることを
// 確かめる。節の中の規定の網羅は確かめない(区分の判断は人が行い、登録簿に記録する)。
//
// 純粋な関数だけを置く。ファイルの読み書きは scripts/check-impl.mjs が行い、
// scripts/test-check-impl.mjs が既知の違反で落ちることを確かめる(陽性対照)。

/** 見出しの適用範囲の注記(community/scope-marking.md)。鍵からは外す */
export const SCOPE_RE = /\s*[((]適用:\s*[^))]+[))]/;

export const MARK_RE = /<!--\s*impl\s+(IMPL-\d{4})\s+([^>]*?)-->/;
export const MARK_LOOSE_RE = /<!--\s*impl\s/;

/** 区分 */
export const STATUSES = {
  marked: 'マーク済み',
  kb: '判定基準の表',
  none: '対象にしない',
  pending: '未棚卸し',
};

/** 「対象にしない」の理由の区分(閉じた語彙)。足すときは規約を改める */
export const NONE_CATEGORIES = {
  explanation: '説明',
  'org-design': '制度設計',
  elsewhere: '所在は他節',
  'not-imposed': '課さない',
};

/** 番号つきの要求事項・禁止事項の表(行を単位にする表)の見出しの2列目 */
export const NUMBERED_TABLE_RE = /^(追加の)?(要求事項|要求|要件|禁止事項)$/;

/** 節の見出しを持たない、頁の冒頭の本文の名前 */
export const LEAD = '(冒頭)';

/** frontmatter とコードブロックの中身を空行へ置換し、行番号を保ったまま対象外にする */
export function maskFences(lines) {
  const masked = [...lines];
  const fenced = new Array(lines.length).fill(false);
  let i = 0;
  if (masked[0] === '---') {
    masked[0] = '';
    for (i = 1; i < masked.length; i++) {
      const end = masked[i] === '---';
      masked[i] = '';
      if (end) {
        i++;
        break;
      }
    }
  }
  let fence = null;
  for (; i < masked.length; i++) {
    const m = /^\s*(`{3,}|~{3,})/.exec(masked[i]);
    if (fence === null && m) {
      fence = m[1];
      masked[i] = '';
      fenced[i] = true;
      continue;
    }
    if (fence !== null) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
      masked[i] = '';
      fenced[i] = true;
    }
  }
  return { masked, fenced };
}

/** コードブロックの中にある実装マークの行(1 始まり)。台帳に載らず、読者には文字列のまま表示される */
export function marksInFences(lines) {
  const { fenced } = maskFences(lines);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (fenced[i] && MARK_LOOSE_RE.test(lines[i])) out.push(i + 1);
  }
  return out;
}

function splitCells(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  return t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
}

/** 節の本文から、番号つきの要求事項・禁止事項の表の行の鍵を読む(例: 要求事項6) */
export function numberedRows(bodyLines) {
  const rows = [];
  const labels = new Map();
  let label = null;
  for (const line of bodyLines) {
    const cells = splitCells(line);
    if (!cells) {
      label = null;
      continue;
    }
    if (label === null) {
      if (cells[0] === '#' && NUMBERED_TABLE_RE.test(cells[1] ?? '')) {
        const n = (labels.get(cells[1]) ?? 0) + 1;
        labels.set(cells[1], n);
        label = n === 1 ? cells[1] : `${cells[1]}(表${n})`;
      } else {
        label = '';
      }
      continue;
    }
    if (label === '') continue;
    if (/^\d+$/.test(cells[0])) rows.push(`${label}${cells[0]}`);
  }
  return rows;
}

/**
 * 頁を節に区切る。節は、見出しから次の見出し(階層を問わない)までの本文とする。
 * 本文の無い見出し(直後に下位の見出しが来るもの)は節に数えない。
 * 最初の見出しより前の本文は「(冒頭)」の節とする。
 * 鍵は「頁#見出しの経路」。経路は上位の見出しから「 > 」で連ね、適用範囲の注記を外す。
 */
export function parseSections(page, text) {
  const lines = text.split(/\r?\n/);
  const { masked } = maskFences(lines);
  const heads = [];
  for (let i = 0; i < masked.length; i++) {
    const h = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(masked[i]);
    if (h) heads.push({ line: i, level: h[1].length, title: h[2].replace(SCOPE_RE, '').trim() });
  }

  const sections = [];
  const stack = [];
  const push = (title, start, end, headLine) => {
    const body = lines.slice(start, end);
    if (!body.some((l) => l.trim() !== '')) return;
    const mbody = masked.slice(start, end);
    const marks = [];
    for (const l of mbody) {
      const m = MARK_RE.exec(l);
      if (m) marks.push(m[1]);
    }
    sections.push({
      key: `${page}#${title}`,
      page,
      line: headLine + 1,
      marks,
      rows: numberedRows(mbody),
      hasCriteriaTable: mbody.some((l) => /^\|\s*#\s*\|\s*判定基準\s*\|/.test(l.trim())),
    });
  };

  // frontmatter の後から最初の見出しまで
  let fmEnd = 0;
  if (lines[0] === '---') {
    fmEnd = lines.indexOf('---', 1) + 1;
  }
  push(LEAD, fmEnd, heads.length ? heads[0].line : lines.length, 0);

  for (let k = 0; k < heads.length; k++) {
    const h = heads[k];
    while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
    stack.push(h);
    const pathTitle = stack.map((s) => s.title).join(' > ');
    const end = k + 1 < heads.length ? heads[k + 1].line : lines.length;
    push(pathTitle, h.line + 1, end, h.line);
  }
  return sections;
}

/**
 * 登録簿を節と突き合わせる。返すのは失敗の一覧(空なら合格)。
 *
 * @param {object} p
 * @param {Array} p.sections   parseSections の結果を全頁ぶん連ねたもの
 * @param {Array} p.entries    登録簿の sections
 * @param {Array<string>} p.baseline 基準線(未棚卸しで登録してよい鍵)
 * @param {number} p.baselineSize   基準線の凍結時の件数。基準線はこれを超えて増えない
 * @param {Set<string>} p.ledgerIds 台帳にある実装マークの識別子
 */
export function checkInventory({ sections, entries, baseline, baselineSize, ledgerIds }) {
  const errors = [];
  const byKey = new Map();
  for (const s of sections) {
    if (byKey.has(s.key)) {
      errors.push(`節の鍵が一意になりません: ${s.key}(見出しの経路が同じ節が2つあります)`);
      continue;
    }
    byKey.set(s.key, s);
  }

  const baseSet = new Set(baseline);
  if (baseline.length > baselineSize) {
    errors.push(
      `基準線(未棚卸しで登録してよい節)が凍結時の ${baselineSize} 件を超えています: ${baseline.length} 件。基準線へ節を足してはなりません`
    );
  }
  if (baseSet.size !== baseline.length) errors.push('基準線に重複した鍵があります');
  for (const k of baseline) {
    if (!byKey.has(k)) errors.push(`基準線の鍵に当たる節がありません(基準線から外してください): ${k}`);
  }

  const seen = new Set();
  for (const e of entries) {
    const where = `登録簿 ${e.key}`;
    if (seen.has(e.key)) {
      errors.push(`${where}: 鍵が重複しています`);
      continue;
    }
    seen.add(e.key);
    const s = byKey.get(e.key);
    if (!s) {
      errors.push(`${where}: 鍵に当たる節がありません(見出しを改めたか、節が消えています)`);
      continue;
    }
    if (!STATUSES[e.status]) {
      errors.push(`${where}: 区分が不正です: ${e.status}(${Object.keys(STATUSES).join(' / ')})`);
      continue;
    }

    const listed = new Set([...(e.ids ?? []), ...Object.values(e.rows ?? {}).flatMap((r) => r?.ids ?? [])]);
    for (const id of listed) {
      if (!ledgerIds.has(id)) errors.push(`${where}: 挙げた識別子 ${id} が台帳にありません`);
    }

    if (e.status === 'pending') {
      if (!baseSet.has(e.key)) {
        errors.push(`${where}: 基準線に無い節を「未棚卸し」で登録しています。区分を判定してください`);
      }
      continue;
    }

    if (e.status === 'none') {
      checkNone(e, where, errors, byKey);
      if (s.marks.length) {
        errors.push(`${where}: 「対象にしない」の節に実装マークがあります(${s.marks.join(', ')})`);
      }
      continue;
    }

    // marked / kb: 節の中のマークは、すべて登録に挙がっていなければならない
    for (const id of s.marks) {
      if (!listed.has(id)) errors.push(`${where}: 節の中のマーク ${id} が登録に挙がっていません`);
    }

    if (e.status === 'kb') {
      if (!s.hasCriteriaTable) errors.push(`${where}: 「判定基準の表」で登録していますが、節に判定基準の表がありません`);
      continue;
    }

    // marked
    if (!listed.size) errors.push(`${where}: 「マーク済み」の登録に識別子がありません`);
    if (s.rows.length) {
      const rows = e.rows ?? {};
      for (const r of s.rows) {
        if (!rows[r]) {
          errors.push(`${where}: 番号つきの表の行 ${r} の区分がありません`);
          continue;
        }
        const row = rows[r];
        if (row.status === 'marked') {
          if (!row.ids?.length) errors.push(`${where}: 行 ${r} を「マーク済み」にしていますが、識別子がありません`);
        } else if (row.status === 'none') {
          checkNone(row, `${where} 行 ${r}`, errors, byKey);
        } else {
          errors.push(`${where}: 行 ${r} の区分が不正です: ${row.status}(marked / none)`);
        }
      }
      for (const r of Object.keys(rows)) {
        if (!s.rows.includes(r)) errors.push(`${where}: 行 ${r} が節の表にありません`);
      }
    } else if (e.rows && Object.keys(e.rows).length) {
      errors.push(`${where}: 番号つきの表の無い節に、行の区分があります`);
    }
  }

  for (const s of sections) {
    if (!seen.has(s.key)) errors.push(`登録の無い節があります: ${s.key}(${s.page}.md:${s.line})`);
  }
  return errors;
}

function checkNone(e, where, errors, byKey) {
  if (!NONE_CATEGORIES[e.category]) {
    errors.push(`${where}: 「対象にしない」の理由の区分が不正です: ${e.category}(${Object.keys(NONE_CATEGORIES).join(' / ')})`);
  }
  if (!e.reason || !String(e.reason).trim()) errors.push(`${where}: 「対象にしない」の理由が空です`);
  if (e.category === 'elsewhere') {
    const locs = [e.location ?? []].flat();
    if (!locs.length) errors.push(`${where}: 「所在は他節」には所在(location)が要ります`);
    for (const l of locs) {
      if (!byKey.has(l)) errors.push(`${where}: 所在 ${l} に当たる節がありません`);
    }
  }
}

/** 区分ごとの件数を、まとまり(章・附属書・フェーズ)ごとに数える */
export function summarize(sections, entries, groupOf) {
  const status = new Map(entries.map((e) => [e.key, e.status]));
  const groups = new Map();
  for (const s of sections) {
    const g = groupOf(s.page);
    if (!groups.has(g)) groups.set(g, { total: 0, marked: 0, kb: 0, none: 0, pending: 0 });
    const c = groups.get(g);
    c.total += 1;
    const st = status.get(s.key);
    if (st && c[st] !== undefined) c[st] += 1;
  }
  return groups;
}

/** 予定(planned)の降ろし先は state=undelivered のマークだけが使える。問題があれば文字列 */
export function plannedProblem(target, state) {
  if (target?.kind === 'planned' && state !== 'undelivered') {
    return `target ${target.id} は予定(planned)の降ろし先です。予定の降ろし先は state=undelivered のマークだけが使えます`;
  }
  return null;
}

/**
 * 台帳の「降りていない規定」の節。0 件でも節と件数の行を出す。
 * 0 件と「節が無い版の台帳」を読み手が区別できるようにするため(#292)
 */
export function renderUndelivered(rows, nameOf, locate) {
  const out = [];
  out.push('### 降りていない規定');
  out.push('');
  out.push(`降りていない規定: **${rows.length}件**`);
  out.push('');
  out.push(
    '件数は、マークを付けた規定についてだけ数えます。件数を、合否にも警戒の条件にも使いません。0 件は、マークを付けた規定がすべて降りていることだけを示します。'
  );
  out.push('');
  if (rows.length) {
    out.push('次の規定は、実行層に対応する記述がありません。**案件からは「規定がない」ものとして扱われます**。');
    out.push('');
    out.push('| 識別子 | 規定 | 降ろし先(予定) | 記載箇所 |');
    out.push('| --- | --- | --- | --- |');
    for (const m of rows) out.push(`| ${m.id} | ${m.note} | ${nameOf(m.target)} | ${locate(m)} |`);
    out.push('');
  }
  return out;
}
