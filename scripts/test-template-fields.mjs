// 方向3(様式の見出し → 対応表)の照合の陽性対照と陰性対照(#317 突合 X-6・X-7)
//
//   node scripts/test-template-fields.mjs

import { checkHeadings, normalizeHeading } from './lib/template-headings.mjs';

let failures = 0;
let checks = 0;
function check(name, ok, detail = '') {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'NG  '} ${name}${ok || !detail ? '' : `\n       ${detail}`}`);
}

const standardText = '## 14. 合意\n## 監査\n| 役割 | 氏名 |';
const form = {
  name: '試験の様式',
  file: 'templates/x.md',
  fields: [
    { standard: '## 14. 合意', template: '合意' },
    { standard: '## 監査', template: '監査' },
  ],
};

check('番号の接頭辞を除いて完全一致する見出しは、対応がある', checkHeadings(form, '## 14. 合意\n', standardText).problems.length === 0);
check('適用範囲の括弧を除いて完全一致する見出しは、対応がある', checkHeadings(form, '## 監査(適用: 委託の構成)\n', standardText).problems.length === 0);
check('正規化は番号と適用範囲の括弧だけを除く', normalizeHeading('3. 監査(適用: R1 の決定(例外を含む))') === '監査' && normalizeHeading('監査(G-6 のみ)') === '監査(G-6 のみ)');
const shortWord = checkHeadings(form, '## 15. 受注側の自己検査で足りるとする合意\n', standardText);
check('短い語(「合意」)を含むだけの独自の見出しは、登録が無ければ失敗する(陽性対照)', shortWord.problems.some((p) => p.includes('受注側の自己検査で足りるとする合意')), shortWord.problems.join(' / '));
check('フェンスの中の見出しは照合しない', checkHeadings(form, '```markdown\n## 独自の節\n```\n', standardText).problems.length === 0);

const withExtra = (ex) => ({ ...form, extra: [ex] });
check('kind の無い extra は失敗する', checkHeadings(withExtra({ heading: '独自', reason: 'r' }), '## 独自\n', standardText).problems.some((p) => p.includes('kind')));
check('知らない kind は失敗する', checkHeadings(withExtra({ heading: '独自', kind: 'other', reason: 'r' }), '## 独自\n', standardText).problems.some((p) => p.includes('kind')));
check('same-as-standard に standard が無ければ失敗する', checkHeadings(withExtra({ heading: '独自', kind: 'same-as-standard', reason: 'r' }), '## 独自\n', standardText).problems.some((p) => p.includes('standard')));
check('standard が標準に無ければ失敗する', checkHeadings(withExtra({ heading: '独自', kind: 'same-as-standard', standard: '## 無い節', reason: 'r' }), '## 独自\n', standardText).problems.some((p) => p.includes('無い節')));
const okExtra = checkHeadings(withExtra({ heading: '独自', kind: 'guide', reason: '記入の手引き' }), '## 独自\n', standardText);
check('kind と理由を書いた登録は通る', okExtra.problems.length === 0 && okExtra.extras === 1, okExtra.problems.join(' / '));
check('登録した見出しが様式から消えたら失敗する', checkHeadings(withExtra({ heading: '独自', kind: 'guide', reason: 'r' }), '', standardText).problems.some((p) => p.includes('ありません')));

console.log('');
if (failures) {
  console.log(`様式の見出しの照合の試験: ${failures} 件が期待と一致しません`);
  process.exit(1);
}
console.log(`様式の見出しの照合の試験: ${checks} 件が期待と一致しました`);
