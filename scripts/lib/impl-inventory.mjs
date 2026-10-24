// 実装マークの対象の棚卸し(Issue #292 / ADR-0076)
//
// 実装マークは、付けた規定についてだけ降ろし先を追跡する。付けていない規定は台帳に
// 現れない。本モジュールは、対象のページを節に区切り、節ごとに「マーク済み / 判定基準の表 /
// 対象にしない / 未棚卸し」のどれかが登録簿(src/data/impl-inventory.yaml)にあることを
// 確かめる。節の中の規定の網羅は確かめない(区分の判断は人が行い、登録簿に記録する)。
//
// 純粋な関数だけを置く(node:crypto の要約関数を除き、副作用を持たない)。ファイルの読み書きは scripts/check-impl.mjs が行い、
// scripts/test-check-impl.mjs が既知の違反で落ちることを確かめる(陽性対照)。

import { createHash } from 'node:crypto';

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

/**
 * 番号つきの表の判別は構造による(突合 X-6)。1列目の見出しが「#」で、本文の行の1列目が番号の表の行を、
 * 単位にする。2列目の見出しの語(要求事項・手続・記載事項 …)で絞らない。語の一覧は閉じないためである
 */
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

/** 4字以上の字下げで始まる行(CommonMark の字下げのコードブロック)。読者には文字列のまま表示される */
const INDENTED_MARK_RE = /^( {4,}|\t)\s*<!--\s*impl\s/;
/** 行内のバッククォートの中のマーク */
const INLINE_CODE_MARK_RE = /`[^`]*<!--\s*impl\s/;

/**
 * コードの中にある実装マークの行(1 始まり)。台帳に載らず、読者には文字列のまま表示される。
 * 対象は、囲みのコードブロック・字下げのコードブロック(4字以上の字下げ)・行内のバッククォート(突合 X-10)
 */
export function marksInFences(lines) {
  const { fenced } = maskFences(lines);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!MARK_LOOSE_RE.test(l)) continue;
    if (fenced[i] || INDENTED_MARK_RE.test(l) || INLINE_CODE_MARK_RE.test(l)) out.push(i + 1);
  }
  return out;
}

/** 基準線の要約(鍵を整列し、改行で連ねた文字列の SHA-256)。基準線の凍結を検査が確かめる */
export function baselineDigest(keys) {
  return createHash('sha256').update([...keys].sort().join('\n')).digest('hex');
}

function splitCells(line) {
  const t = line.trim();
  if (!t.startsWith('|')) return null;
  return t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
}

/**
 * 節の本文から、番号つきの表の行の鍵を読む(例: 要求事項6、手続3)。
 * 表は構造で判別する: 1列目の見出しが「#」で、行の1列目が番号。鍵の語は2列目の見出し。
 * 同じ語の表が節に2つ以上あれば、2つ目から「(表N)」を付ける
 */
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
      if (cells[0] === '#' && (cells[1] ?? '') !== '') {
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
 * @param {Array<string>} p.baseline 基準線(未棚卸しで登録してよい鍵。凍結の時点の未棚卸しの節だけ)
 * @param {string} p.baselineDigest  凍結の時点の基準線の要約(baselineDigest)。食い違えば失敗
 * @param {Set<string>} p.ledgerIds 台帳にある実装マークの識別子
 * @param {Array|null} [p.baseEntries] 比較の基点(既定ブランチ)の登録簿。null なら比べない
 */
export function checkInventory({ sections, entries, baseline, baselineDigest: expected, ledgerIds, baseEntries = null }) {
  const errors = [];
  const byKey = new Map();
  for (const s of sections) {
    if (byKey.has(s.key)) {
      errors.push(`節の鍵が一意になりません: ${s.key}(見出しの経路が同じ節が2つあります)`);
      continue;
    }
    byKey.set(s.key, s);
  }

  // 基準線は凍結する(突合 X-1)。鍵の追加・削除・入れ替えのどれでも要約が変わる。
  // 節が消えた基準線の鍵は失敗にせず、無視する(改名した節の新しい鍵は基準線に無いので、区分の判断が要る)
  const baseSet = new Set(baseline);
  if (baselineDigest(baseline) !== expected) {
    errors.push(
      '基準線(未棚卸しで登録してよい節)が凍結の時点から変わっています。基準線は編集しません。見出しを改めた節・新しい節は、未棚卸しでなく区分を判断して登録してください'
    );
  }
  if (baseSet.size !== baseline.length) errors.push('基準線に重複した鍵があります');

  // 棚卸し済みの節を未棚卸しへ戻さない(突合 X-2)。比較の基点が読めるときだけ確かめる
  const baseStatus = new Map((baseEntries ?? []).map((e) => [e.key, e.status]));

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
        errors.push(`${where}: 基準線に無い節を「未棚卸し」で登録しています。区分を判断して登録してください`);
      }
      const before = baseStatus.get(e.key);
      if (before && before !== 'pending') {
        errors.push(`${where}: 比較の基点で「${STATUSES[before] ?? before}」だった節を「未棚卸し」へ戻しています`);
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

    // marked: 節の中のマークを1件以上挙げ、挙げた識別子はすべて節の中にある(突合 X-11)。
    // 他の節のマークで追う節は「対象にしない(所在は他節)」で登録する
    if (!listed.size) errors.push(`${where}: 「マーク済み」の登録に識別子がありません`);
    if (!s.marks.length) {
      errors.push(`${where}: 節の中に実装マークがありません。他の節で追う節は「対象にしない」(elsewhere)で登録してください`);
    }
    // 節の規定の一部を他の節のマークで追う場合は、その節を location に挙げる(識別子は挙げない)
    for (const l of [e.location ?? []].flat()) {
      if (!byKey.has(l)) errors.push(`${where}: 所在 ${l} に当たる節がありません`);
    }
    for (const id of listed) {
      if (!s.marks.includes(id)) {
        errors.push(`${where}: 挙げた識別子 ${id} が節の中にありません。他の節で追う規定は所在(elsewhere)で示してください`);
      }
    }
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
          for (const l of [row.location ?? []].flat()) {
            if (!byKey.has(l)) errors.push(`${where}: 行 ${r} の所在 ${l} に当たる節がありません`);
          }
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
export function renderUndelivered(rows, nameOf, locate, { kindOf = () => 'planned', planOf = () => '—', overdue = null, month = null } = {}) {
  const out = [];
  out.push('### 降りていない規定');
  out.push('');
  out.push(`降りていない規定: **${rows.length}件**`);
  out.push('');
  if (overdue !== null) {
    // 見直しの年月を過ぎた件数は、生成した月で変わる。鮮度の比較はこの行を除いて行う(合否に使わない)
    out.push(`${OVERDUE_PREFIX}**${overdue}件**(${month} の時点。合否に使わない)`);
    out.push('');
  }
  out.push(
    '件数は、マークを付けた規定についてだけ数えます。件数を、合否にも警戒の条件にも使いません。0 件は、マークを付けた規定がすべて降りていることだけを示します。'
  );
  out.push('');
  if (rows.length) {
    const planned = rows.filter((m) => kindOf(m.target) === 'planned').length;
    out.push(
      `降ろし先の種別で、案件から見える状態が違います。降ろし先が「予定」の ${planned} 件は、準拠テンプレートに置き場がまだありません。` +
        `降ろし先が実在する ${rows.length - planned} 件は、置き場はありますが、規定の全部または一部が置き場にありません(無い部分は注記で示します)。` +
        'どちらも、無い部分は**案件からは「規定がない」ものとして扱われます**。'
    );
    out.push('');
    out.push(
      '計画の「予定」は Issue と見直しの年月を持ちます。「採用者が実装する」は、準拠テンプレートが実装せず、採用者が自ら実装する規定です。規定は課したままです。' +
        '並びは、採用者が実装するにできない規定 → G-7・G-8・R1 の決定に関わる規定 → その他の順です。'
    );
    out.push('');
    out.push('| 識別子 | 規定 | 降ろし先 | 計画 | 記載箇所 |');
    out.push('| --- | --- | --- | --- | --- |');
    for (const m of rows) {
      const where = kindOf(m.target) === 'planned' ? `${nameOf(m.target)}(予定の置き場)` : nameOf(m.target);
      out.push(`| ${m.id} | ${m.note} | ${where} | ${planOf(m)} | ${locate(m)} |`);
    }
    out.push('');
  }
  return out;
}

/** 台帳の、見直しの年月を過ぎた件数の行の書き出し。鮮度の比較で除く */
export const OVERDUE_PREFIX = '見直しの年月を過ぎた計画(予定): ';

// ---------------------------------------------------------------- 検査の手段と計画(Issue #314 / ADR-0084)

/** 検査の手段(ADR-0061)。#314 以後、属性を欠くマークは検査が落とす */
export const CHECK_VALUES = ['machine', 'presence', 'manual'];
/** presence の注記に書く、規則を運ぶ単位(ADR-0084 決定1)。より粗い単位(節の見出し)の確認は manual とする */
export const PRESENCE_UNIT_RE = /単位:\s*(欄|キー|行|ファイル)/;
/** 降りていない規定の計画(ADR-0084 決定4)。state は 2 値のまま、別の属性で持つ */
export const PLANS = { scheduled: '予定', adopter: '採用者が実装する' };

/**
 * マークの属性 check・test・plan の問題を返す(ファイルを読まない部分)。
 * attrs はマークの属性、noAdopter は「採用者が実装する」にできない節に置かれたか
 */
export function markAttrProblems(attrs, { noAdopter = false } = {}) {
  const out = [];
  if (!attrs.check) out.push('check がありません(machine / presence / manual。#314 以後は必須)');
  else if (!CHECK_VALUES.includes(attrs.check)) out.push(`check が不正です: ${attrs.check}(machine / presence / manual)`);
  if (attrs.check === 'machine' && !attrs.test) {
    out.push('check=machine に test= がありません。違反と適合の対を持つ試験のファイルを名指してください。試験が無ければ presence か manual へ下げます');
  }
  if (attrs.test && attrs.check !== 'machine') out.push(`test= は check=machine のマークだけに書きます(check=${attrs.check ?? 'なし'})`);
  if (attrs.check === 'presence' && !PRESENCE_UNIT_RE.test(attrs.note ?? '')) {
    out.push('check=presence の注記に、規則を運ぶ単位(単位: 欄 / キー / 行 / ファイル)がありません。より粗い単位の確認は manual です');
  }
  if (attrs.state === 'undelivered') {
    if (!attrs.plan) out.push('state=undelivered に plan がありません(scheduled / adopter)');
    else if (!PLANS[attrs.plan]) out.push(`plan が不正です: ${attrs.plan}(scheduled / adopter)`);
    if (attrs.plan === 'scheduled') {
      if (!/^\d+$/.test(attrs.issue ?? '')) out.push('plan=scheduled に issue=(Issue 番号)がありません');
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(attrs.review ?? '')) out.push('plan=scheduled に review=YYYY-MM(見直しの年月)がありません');
    }
    if (attrs.plan === 'adopter') {
      if (!attrs.decision) out.push('plan=adopter に decision=(ADR または記録の所在)がありません');
      if (noAdopter) out.push('この節の規定は「採用者が実装する」にできません(src/data/impl-no-adopter.yaml)。plan=scheduled で降ろす計画を書きます');
    }
  } else {
    for (const k of ['plan', 'issue', 'review', 'decision']) {
      if (attrs[k]) out.push(`${k}= は state=undelivered のマークだけに書きます`);
    }
  }
  return out;
}

/**
 * check=machine の試験の問題を返す。試験は違反の入力(IMPL-NNNN:ng)と適合の入力(IMPL-NNNN:ok)の対を持ち、
 * 必須の集約から実行される。この確かめは、試験の中身が規定を正しく確かめていることを示さない
 */
export function machineTestProblems(id, test, { exists, read, wired }) {
  if (!exists(test)) return [`test= の試験 ${test} がありません`];
  const out = [];
  const text = read(test);
  for (const k of ['ng', 'ok']) {
    if (!new RegExp(`${id}:${k}\\b`).test(text)) {
      out.push(`試験 ${test} に ${id}:${k}(${k === 'ng' ? '違反の入力で落ちる' : '適合の入力で通る'}場面の目印)がありません`);
    }
  }
  const w = wired(test);
  if (w) out.push(w);
  return out;
}

/** package.json の script から、npm run で辿れるコマンドの文字列をすべて集める */
export function reachableCommands(scripts, entry = 'check') {
  const seen = new Set();
  const out = [];
  const visit = (name) => {
    if (seen.has(name) || scripts[name] === undefined) return;
    seen.add(name);
    const cmd = scripts[name];
    out.push(cmd);
    for (const m of cmd.matchAll(/npm run ([\w:-]+)/g)) visit(m[1]);
  };
  visit(entry);
  return out;
}

/** 親の試験が package.json の check から実行されるか。問題があれば文字列 */
export function parentTestWired(scripts, test) {
  const re = new RegExp(`node\\s+${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
  return reachableCommands(scripts).some((c) => re.test(c)) ? null : `試験 ${test} が package.json の check から実行されていません`;
}

/**
 * テンプレートの試験が、集約 gate-g5 の合否に使われるジョブの run: から実行されるか。
 * jobs はジョブ名 → 本文、effective は集約が合否に使うジョブの集合
 */
export function templateTestWired(jobs, effective, test) {
  const rel = test.replace(/^template\//, '');
  const re = new RegExp(`run:\\s*node\\s+${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'm');
  const hit = [...jobs].filter(([, body]) => re.test(body)).map(([name]) => name);
  if (!hit.length) return `試験 ${test} が gate-g5.yml の run: から実行されていません`;
  if (!hit.some((j) => effective.has(j))) return `試験 ${test} を実行するジョブ(${hit.join(', ')})が、集約 gate-g5 の合否に使われていません`;
  return null;
}

/**
 * 降りていない規定の順序(ADR-0084 決定4。根拠水準 E0): 表示の誤り → 採用者が実装するにできない規定 →
 * G-7・G-8・R1 の決定に関わる規定 → その他。表示の誤りは見つけたその場で直すため、台帳の順序は残りの 3 段で並べる
 */
export function undeliveredRank(m, noAdopterKey) {
  if (noAdopterKey(m)) return 1;
  if (/G-7|G-8|R1/.test(m.note ?? '')) return 2;
  return 3;
}

/** 見直しの年月を過ぎた plan=scheduled の件数。month は YYYY-MM。合否に使わない */
export function overdueCount(rows, month) {
  return rows.filter((m) => m.plan === 'scheduled' && m.review && m.review < month).length;
}

/**
 * 逆向きの追跡(ADR-0084 決定6)。files は対象のファイル(テンプレートの直下からの相対)、traced は登録簿に現れるパスの集合、
 * exempt は除外の一覧({ path, reason, why })。どちらにも無いファイルと、除外の不備を返す
 */
export const UNTRACED_REASONS = { library: '他の検査が使う部品', infra: '検査の実行の足回り' };
export function untracedProblems(files, traced, exempt) {
  const out = [];
  const ex = new Map((exempt ?? []).map((e) => [e.path, e]));
  for (const e of exempt ?? []) {
    if (!UNTRACED_REASONS[e.reason]) out.push(`除外の一覧の ${e.path}: 理由の区分が不正です: ${e.reason}(library / infra)`);
    if (!String(e.why ?? '').trim()) out.push(`除外の一覧の ${e.path}: 理由(why)が空です`);
    if (!files.includes(e.path)) out.push(`除外の一覧の ${e.path}: テンプレートにありません(消えたファイルは一覧から除きます)`);
    if (traced.has(e.path)) out.push(`除外の一覧の ${e.path}: 降ろし先の登録簿にもあります(除外の一覧から除きます)`);
  }
  for (const f of files) {
    if (!traced.has(f) && !ex.has(f)) {
      out.push(`テンプレートの ${f} が、降ろし先の登録簿(src/data/impl-targets.yaml)にも除外の一覧(src/data/impl-untraced.yaml)にもありません。実行層にしか無い規定かを確かめ、標準の規定へマークするか、理由(library / infra)つきで除外します`);
    }
  }
  return out;
}
