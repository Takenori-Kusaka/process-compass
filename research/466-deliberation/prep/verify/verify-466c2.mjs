import { queueActions } from './review-queue.mjs';
const config={people:[],seats:[],riskFloor:{rules:[]}};
const mk=(n)=>({number:n,draft:false,createdAt:'2026-11-18T00:00:00Z',readyAt:null,files:['src/i18n/ja.json'],requestedTeams:[],requests:[{login:'owner',at:`2026-11-18T0${n}:00:00Z`}],reviews:[],comments:[],labels:['risk/R3'],delegated:true,changes:[]});
const prs=[1,2,3,4].map(mk);
for (const ex of [false,true]) console.log('excludeDelegated='+ex, queueActions({now:'2026-11-18T03:00:00Z',config,d0Text:'',prs,excludeDelegated:ex}).actions.map(a=>a.pr+':'+a.key).join(' | ')||'(通知なし)');
