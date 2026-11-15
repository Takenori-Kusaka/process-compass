// integrated.yaml の判定基準(criteria)の読み書き(#326)。check-gate-criteria.mjs と試験が使う

import YAML from 'yaml';

/**
 * integrated.yaml の gates[].criteria を、id をキーに読む。
 * 読みは YAML パーサで行う。自前の「,」分割は、基準が記号(`[ ] , : #`)を含むと件数が狂った(#326)。
 */
export function readYamlCriteria(text) {
  const out = {};
  const doc = YAML.parse(text);
  for (const g of doc?.gates ?? []) {
    if (g && typeof g.id === 'string' && Array.isArray(g.criteria)) out[g.id] = g.criteria.map(String);
  }
  return out;
}

/**
 * 基準1件を、flow 配列の要素として書く。素のままで往復できるものは素のまま、
 * 記号を含むものは二重引用符で書く(JSON の文字列は YAML の二重引用符として有効)。
 */
export function formatCriterion(c) {
  const plain =
    c.length > 0 && !/^[\s\-?:,[\]{}#&*!|>'"%@`]/.test(c) && !/[[\]{},"\\]|: | #|:$|\s$/.test(c);
  if (plain) {
    try {
      const back = YAML.parse(`[${c}]`);
      if (Array.isArray(back) && back.length === 1 && back[0] === c) return c;
    } catch {
      /* 引用へ落とす */
    }
  }
  return JSON.stringify(c);
}

/** integrated.yaml の text のうち、ゲート id の criteria 行だけを want で置き換える */
export function writeCriteria(text, id, want) {
  const re = new RegExp(`(- id: ${id}\\n[\\s\\S]*?criteria: )\\[.*\\]`);
  return text.replace(re, (_m, head) => `${head}[${want.map(formatCriterion).join(', ')}]`);
}
