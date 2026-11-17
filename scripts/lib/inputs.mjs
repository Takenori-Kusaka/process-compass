// 検査器の入力の有無を確かめる(Issue #293 / ADR-0077)。
//
// 検査器が読む入力(準拠テンプレートのサブモジュール template/、配布する知識ベースなど)が
// 実行環境に無いときは、手元でも CI でも検査を失敗させる。飛ばしたり、黙って通したりしない。
// 入力が無いことは、検査の対象が無いこと(第4章 G-5「対象なし」)に当たらない。
//
// 空のディレクトリも「無い」に数える。初期化していないサブモジュールは、空のディレクトリとして残るため。

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** 入力が無いときに出す、取得の命令 */
export const INIT_HINT = 'git submodule update --init --recursive';

/**
 * 入力の欠けを返す。rels はリポジトリの根からの相対パス。
 * ファイルは存在を、ディレクトリは存在と中身(1件以上)を確かめる。
 * @returns {{ rel: string, why: string }[]}
 */
export function missingInputs(root, rels) {
  const out = [];
  for (const rel of rels) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      out.push({ rel, why: 'ありません' });
      continue;
    }
    const st = fs.statSync(abs);
    if (st.isDirectory() && fs.readdirSync(abs).length === 0) {
      out.push({ rel, why: '空のディレクトリです(サブモジュールを初期化していない)' });
    }
  }
  return out;
}

/** 欠けの説明文。検査ごとの出力に使う */
export function describeMissing(label, missing) {
  return [
    `${label}: 検査の入力が無いため、検査を実施できません。実施しなかった検査は失敗に数えます(通過として扱いません)。`,
    ...missing.map((m) => `  - ${m.rel} が${m.why}`),
    `  取得: ${INIT_HINT}`,
  ].join('\n');
}

/** 書き出し先の欠けの説明文。検査ではなく生成器が使う */
export function describeMissingTarget(label, missing) {
  return [
    `${label}: 書き出し先が無いため、書き出しません。`,
    ...missing.map((m) => `  - ${m.rel} が${m.why}`),
    `  取得: ${INIT_HINT}(別の場所へ書き出す場合は --out <path> を明示する)`,
  ].join('\n');
}

/** 入力が欠けていれば、理由と取得の命令を出して終了コード 1 で終える */
export function requireInputs(root, rels, label) {
  const missing = missingInputs(root, rels);
  if (missing.length) {
    console.error(describeMissing(label, missing));
    process.exit(1);
  }
}

/** 生成元の版(source.commit)が、40 桁の16進のコミットの識別子か */
export const COMMIT_RE = /^[0-9a-f]{40}$/;

/**
 * 知識ベースの生成元の版を検査する。expected を渡せば一致も求める。
 * @returns {string[]} 問題の一覧(空なら問題なし)
 */
export function commitProblems(commit, expected) {
  const problems = [];
  if (commit === undefined || commit === null || commit === '') {
    problems.push('配布した知識ベースに生成元の版(source.commit)がありません');
    return problems;
  }
  if (!COMMIT_RE.test(String(commit))) {
    problems.push(
      `配布した知識ベースの生成元の版(source.commit)が、40 桁の16進のコミットの識別子ではありません: ${commit}。` +
        '受け取り側が版を知る手段はこれだけです(ADR-0052 決定2)',
    );
    return problems;
  }
  if (expected !== undefined && expected !== null && expected !== '' && commit !== expected) {
    problems.push(`配布する知識ベースの生成元の版(${commit})が、配布を起動したコミット(${expected})と一致しません`);
  }
  return problems;
}

/**
 * 知識ベースの生成元(source.commit)が、標準のリポジトリの HEAD の祖先かを検査する(#332 / ADR-0157 決定3)。
 * rebase で生成元が履歴から外れると、表示(source.commit)と実態が食い違う。
 * 履歴を読めない場合(浅い clone、コミットのオブジェクトが無い)は、未確認を通さず失敗とする(#293 裁定 J-3)。
 * 形式が不正な値は commitProblems が報告するので、ここでは見ない。
 * @returns {string[]} 問題の一覧(空なら問題なし)
 */
export function ancestryProblems(root, commit) {
  if (!COMMIT_RE.test(String(commit ?? ''))) return [];
  const git = (args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  const hint = "rebase の後は 'npm run template:kb' で知識ベースを再生成してください";
  if (git(['rev-parse', '--git-dir']).status !== 0) {
    return [`生成元の版 ${commit} が標準の履歴の上にあるかを確かめられません(git のリポジトリではありません)。未確認は失敗に数えます`];
  }
  if (git(['rev-parse', '--is-shallow-repository']).stdout.trim() === 'true') {
    return [`生成元の版 ${commit} が標準の履歴の上にあるかを確かめられません(浅い clone です。履歴ごと取得してください: git fetch --unshallow)。未確認は失敗に数えます`];
  }
  if (git(['cat-file', '-e', `${commit}^{commit}`]).status !== 0) {
    return [
      `生成元の版 ${commit} のコミットが、標準のリポジトリにありません(履歴が外れたか、取得していません)。${hint}`,
    ];
  }
  const r = git(['merge-base', '--is-ancestor', commit, 'HEAD']);
  if (r.status === 0) return [];
  if (r.status === 1) {
    return [`生成元の版 ${commit} は、標準の HEAD の祖先ではありません(到達できないコミットを名乗っています)。${hint}`];
  }
  return [`生成元の版 ${commit} の祖先の確認が実行できませんでした: ${(r.stderr || '').trim()}。未確認は失敗に数えます`];
}
