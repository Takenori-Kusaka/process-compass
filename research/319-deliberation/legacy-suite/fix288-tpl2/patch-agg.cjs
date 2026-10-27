const fs=require('fs');const p='scripts/gate/aggregate-evidence.mjs';let s=fs.readFileSync(p,'utf8');const crlf=s.includes('\r\n');s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,60));s=s.replace(a,b);};
rep("  dueDayOf,\n  nameProblems,\n} from './config.mjs';","  dueDayOf,\n  nameProblems,\n  gateExceptionTarget,\n} from './config.mjs';");
rep("    if (!refers(r.target)) continue;\n    const why = [];\n    if (!ACTIVE_EXCEPTION_STATES","    // 対象がゲートの判定(`G-2 F-001`)の行は、変更へ対応づけない(下の gateExceptions で照合する)\n    if (gateExceptionTarget(r.target)) continue;\n    if (!refers(r.target)) continue;\n    const why = [];\n    if (!ACTIVE_EXCEPTION_STATES");
rep(`// --- 突合と gaps -----------------------------------------------------------`,
`// ゲートの判定を対象とする例外承認(台帳の「対象」が \`G-2 F-001\` の形。#286)。変更の例外承認と区別して照合する。
// 有効を示す状態の行だけを見て、7.3 の記録の事項(承認した者・理由・期限)が記入され、承認した者が名簿の人で
// AI の名義でないことを確かめる。成立しない行は欠落にする(記録として例外承認の成立を示さないため)。
// どの基準を欠いた判定か、承認した者が成果物の作成者と別の人か、権限を持つ者かは、機械では確かめない
const gateExceptions = { matched: [], rejected: [] };
for (const r of ledgerRows ?? []) {
  if (r.kind !== '例外') continue;
  const t = gateExceptionTarget(r.target);
  if (!t) continue;
  if (!ACTIVE_EXCEPTION_STATES.includes(r.state.replace(/\*/g, '').normalize('NFKC').trim())) continue;
  const why = [];
  if (!filled(r.approver)) why.push('承認した者が未記入');
  else {
    if (aiNameBlocked(config, r.approver)) why.push('承認した者が AI の名義である');
    if (!resolveSigner(config, r.approver)) why.push(\`承認した者 "\${r.approver}" が、人の名簿(people[])の人へ対応づかない\`);
  }
  if (!filled(r.content) || (r.reason !== null && !filled(r.reason))) why.push('理由(内容・受容した理由)が未記入');
  if (!filled(r.due) || !dueDayOf(r.due)) why.push(\`期限(返却の目安)が未記入、または日付として解釈できない(\${r.due || '未記入'})\`);
  const label = \`\${r.id}(\${t.gate} \${t.subject})\`;
  if (why.length) gateExceptions.rejected.push(\`\${label}: \${why.join('、')}\`);
  else gateExceptions.matched.push(label);
}

// --- 突合と gaps -----------------------------------------------------------`);
rep("for (const p of configIntegrityProblems(config)) gaps.push(`構成の整合: ${p}`);",
"for (const p of configIntegrityProblems(config)) gaps.push(`構成の整合: ${p}`);\nfor (const x of gateExceptions.rejected) {\n  gaps.push(`ゲートの判定を対象とする例外承認 ${x}。例外承認の記録として成立していません(第7章 7.3)。記入を補うか、状態を「取り下げ」にして、そのゲートを判定基準どおりに判定し直す`);\n}");
rep("  openExceptions: debtRows ? debtRows.filter((r) => r.kind === '例外').map((r) => `${r.id} ${r.content}`) : NO_RECORD,",
"  openExceptions: debtRows ? debtRows.filter((r) => r.kind === '例外').map((r) => `${r.id} ${r.content}`) : NO_RECORD,\n  // ゲートの判定を対象とする例外承認のうち、記録として成立したもの(変更の例外承認と分けて出す)\n  gateExceptions: gateExceptions.matched,");
rep("  R.push(`- 独立した人の確認を経ていないが、例外承認の記録が対応づいた変更(未回収の例外): ${listOr(A.residual.exceptedChanges ?? [])}`);",
"  R.push(`- 独立した人の確認を経ていないが、例外承認の記録が対応づいた変更(未回収の例外): ${listOr(A.residual.exceptedChanges ?? [])}`);\n  R.push(`- ゲートの判定を対象とする例外承認(未回収): ${listOr(A.residual.gateExceptions ?? [])}`);");
if(crlf)s=s.replace(/\n/g,'\r\n');
fs.writeFileSync(p,s);console.log('patched');
