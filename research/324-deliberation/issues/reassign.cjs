// usage: node reassign.cjs <marks.tsv> <phase: gen|create|apply>
const fs=require('fs'),cp=require('child_process');
const dir='research/324-deliberation/issues/';
const rows=fs.readFileSync(process.argv[2],'utf8').split('\n').map(x=>x.split('\t')).map(r=>({id:r[0],file:r[1].split(String.fromCharCode(92)).join('/').replace('src/content/docs/',''),line:r[2],attrs:r[3],
  target:r[3].match(/target=(\S+)/)[1],note:(r[3].match(/note="([^"]*)/)||[])[1]||''}));
const T=(s)=>new Set(s.split(/\s+/));
const existing={
 355:'evidence-aggregation',
 325:'pre-review-automation',
 444:'agent-run-record'};
const A=T('gate-skill gate-skill-g6 gate-record-template gate-entry-workflow gate-contract g1-check g5-adapter pr-checks review-queue-control next-role handoff-reference budget-escalation');
const B=T('d0-template config-delegation config-change-log config-deviations config-roles config-seats config-unmet autonomy-derivation process-change-skill profile-generator process-profile');
const C=T('context-transfer-record project-registration-record proposal-record committee-agenda internal-audit-record ai-runtime-connection ai-free-practice-record ip-allowlist-operation deprecation-inventory instruction-asset-inventory control-rollout model-quality-monitor');
const D=T('safety-verification-record');
const E=T('spec-write-skill implement-skill claude-md-resident claude-md feature-spec-template');
const F=T('ai-sla-guide ai-sla-template project-brief-template qa-policy-template assumption-ledger-template debt-ledger-template defect-ledger-template adr-template handover-template');
const safetyOv=T('0759 0919 0764 0760 0766');
const groups={
 A:{title:'ゲート判定の記録・PR の検査・レビューの待ち行列・予算の上程が準拠テンプレートに降りていない',desc:'ゲート・判定記録の様式とスキル、PR の検査、レビューの待ち行列、予算の上程'},
 B:{title:'体制・構成・委任・D-0・変化点の反映が準拠テンプレートに降りていない',desc:'体制・構成・委任・D-0 の担当表・変化点の反映・テーラリング'},
 C:{title:'記録の置き場が準拠テンプレートに無い(引き継ぎ・案件登録・提案・議題・内部監査・AI 実行基盤ほか)',desc:'準拠テンプレートに記録の置き場が無い規定'},
 D:{title:'安全(安全適合性の検証記録・安全リスクアセスメント・安全重要度に応じた制約)が準拠テンプレートに降りていない',desc:'安全適合性の検証記録・安全リスクアセスメント・附属書F・安全重要度ごとの制約'},
 E:{title:'スキルと常駐の指示(仕様の記述・実装・CLAUDE.md の常駐部分)が準拠テンプレートに降りていない',desc:'スキル(spec-write・implement)と常駐の指示(CLAUDE.md)'},
 F:{title:'様式(企画書・AI SLA・品質保証の方針・台帳)と予算ほかが準拠テンプレートに降りていない',desc:'企画書・AI SLA・品質保証の方針・各種台帳の様式'}};
function dest(r){
  for(const [n,t] of Object.entries(existing)) if(r.target===t) return String(n);
  const num=r.id.slice(5);
  if(safetyOv.has(num)) return 'D';
  for(const [k,s] of Object.entries({A,B,C,D,E,F})) if(s.has(r.target)) return k;
  throw new Error('unmapped '+r.id+' '+r.target);
}
const by={};
for(const r of rows){(by[dest(r)] ||= []).push(r);}
const phase=process.argv[3];
function summary(n){let s=n.replace(/\s+/g,' ');const i=s.indexOf('。');if(i>0&&i<110)s=s.slice(0,i+1);else if(s.length>110)s=s.slice(0,108)+'…';return s.replace(/\|/g,'\|');}
function table(rs){return '| マーク | 所在 | 降ろし先 | 規定の要旨 |\n| --- | --- | --- | --- |\n'+rs.map(r=>`| ${r.id} | ${r.file.replace('.md','')}:${r.line} | ${r.target} | ${summary(r.note)} |`).join('\n');}
const safetyExtra='\n## 条文の食い違いの候補\n- CL2 の AI 自律レベルの上限が、第8章 軸E の表(L2)と附属書F F.3 要求1(L1 固定)で食い違う。安全に当たるので重の審議で決める。#324 では条文を変えていない\n';
const mapping={};
for(const [k,rs] of Object.entries(by)) mapping[k]=rs.map(r=>r.id);
if(phase==='gen'){
  fs.writeFileSync(dir+'mapping.json',JSON.stringify(mapping,null,1));
  for(const [k,rs] of Object.entries(by)){
    if(groups[k]){
      const body=`## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(\`state=undelivered\`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「${groups[k].desc}」に当たるものを、この Issue へまとめて送ります。実装マークの \`issue=\` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(${rs.length} 件)
${table(rs)}
${k==='D'?safetyExtra:''}
## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして \`state=delivered\` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・\`plan=\`・\`review=\` を結論に合わせている
- [ ] 準拠テンプレート(\`template/\`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の \`npm run check\` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は \`template/\` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
`;
      fs.writeFileSync(dir+`body-${k}.md`,body);
    } else {
      fs.writeFileSync(dir+`comment-${k}.md`,`#324(実装マークの節の棚卸し、ADR-0140)で、領域の合う降りていない規定の実装マーク ${rs.length} 件が仮に #324 を名指していたため、本 Issue へ付け替えます(実装マークの \`issue=\` を ${k} へ改めます)。条文は変えていません。

## 足す範囲
${table(rs)}

## 受け入れ条件の案(追加分)
- [ ] 上表のマークごとに、降ろして \`state=delivered\` にするか、降ろさないと決めて理由を記録している(解決の方法は前提にしない。採用者に委ねる扱いは審議で決める)
- [ ] 各マークの state・note・\`plan=\`・\`review=\` を結論に合わせている
`);
    }
  }
  console.log(Object.entries(by).map(([k,v])=>k+':'+v.length).join(' '));
} else if(phase==='create'){
  const nums={};
  for(const k of Object.keys(groups)){
    const out=cp.execFileSync('gh',['issue','create','--title',`#324 の残り: ${groups[k].title}`,'--body-file',dir+`body-${k}.md`],{encoding:'utf8'});
    nums[k]=out.trim().split('/').pop();console.log(k,out.trim());
  }
  fs.writeFileSync(dir+'created.json',JSON.stringify(nums,null,1));
} else if(phase==='apply'){
  const nums=JSON.parse(fs.readFileSync(dir+'created.json','utf8'));
  const to={};for(const [k,rs] of Object.entries(by))for(const r of rs)to[r.id]=nums[k]||k;
  const files=[...new Set(rows.map(r=>r.file))];
  let c=0;
  for(const f of files){
    const p='src/content/docs/'+f;let t=fs.readFileSync(p,'utf8');
    t=t.replace(/<!-- impl (IMPL-\d+) ([^\n]*?) -->/g,(m,id,a)=>{
      if(!to[id]||!/issue=324\b/.test(a)) return m;
      c++;return `<!-- impl ${id} ${a.replace(/issue=324\b/,'issue='+to[id])} -->`;});
    fs.writeFileSync(p,t);
  }
  console.log('replaced',c);
}
