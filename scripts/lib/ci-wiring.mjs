// CI の結線の検査の本体(Issue #293 裁定 J-1・J-2・J-6 / ADR-0077)。純粋な関数だけを置く。
//
// 検査の一覧の正本は package.json の check である。説明の側(CLAUDE.md・README・CONTRIBUTING・
// PR テンプレート・プロジェクト運営の頁)は列挙しない。ここで確かめるのは、ワークフローがその
// npm run check を合否に使い、公開と配布がその通過の後にだけ走ることである。
// YAML の構造だけを読む。散文の列挙は検査しない(偽陽性を生むため、課さないと決めた)。

const CI_FILE = 'ci.yml';
const CHECK_JOB = 'check';

const asArray = (v) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
const steps = (job) => asArray(job?.steps).filter((s) => s && typeof s === 'object');
const runOf = (step) => (typeof step.run === 'string' ? step.run : '');
const usesOf = (step) => (typeof step.uses === 'string' ? step.uses : '');

/** Pages へ配備するジョブか */
export function deploysPages(job) {
  return steps(job).some((s) => /^actions\/deploy-pages@/.test(usesOf(s)));
}

/** dist/standard へ書くジョブか(いずれかの手順が dist/standard を含み、いずれかの手順が git push を含む) */
export function writesDistStandard(job) {
  const ss = steps(job);
  return ss.some((s) => /dist\/standard/.test(runOf(s))) && ss.some((s) => /git\s+push/.test(runOf(s)));
}

const PUBLISH_JOB = 'publish';
/** 配布のジョブが参照する実行環境。配備のブランチを main に限る(設定は GitHub 側) */
export const DIST_ENVIRONMENT = 'dist-standard';

/**
 * 配布の書き込みは、ジョブに付けた GITHUB_TOKEN の権限だけで行う(保守者の決定 2026-10-23 / ADR-0077 決定6)。
 * deploy key・SSH 鍵・秘密情報を使う形を見つける。秘密情報の参照と、SSH での接続の痕跡を読む
 */
const SECRET_REF = /\bsecrets\s*\./;
const SSH_TRACE = /GIT_SSH_COMMAND|ssh-keygen|ssh-agent|\.ssh\/|git@github\.com:|ssh:\/\//;

/** ジョブの permissions が contents の書き込みを与えるか(write-all を含む) */
function grantsContentsWrite(perms) {
  if (typeof perms === 'string') return perms === 'write-all';
  if (!perms || typeof perms !== 'object') return false;
  return String(perms.contents ?? '') === 'write';
}

/** ジョブが参照する実行環境の名前 */
function environmentName(job) {
  const env = job?.environment;
  if (typeof env === 'string') return env;
  if (env && typeof env === 'object' && typeof env.name === 'string') return env.name;
  return '';
}

/** 契機に、main への push があるか */
function pushesMain(on) {
  if (!on || typeof on !== 'object') return false;
  if (!('push' in on)) return false;
  const push = on.push;
  if (push === null || push === undefined) return true; // 全ブランチの push(main を含む)
  const branches = asArray(push.branches);
  return branches.length === 0 || branches.includes('main');
}

/** ジョブの if が、main への push に限っているか(式の文字列を読む) */
function gatedOnPushToMain(job) {
  const cond = typeof job?.if === 'string' ? job.if : '';
  return /github\.event_name\s*==\s*'push'/.test(cond) && /github\.ref\s*==\s*'refs\/heads\/main'/.test(cond);
}

/**
 * ジョブの if が、検査の通過を待たない形か。状態の関数(always・failure・cancelled。否定を含む)は
 * needs の失敗の後にもジョブを走らせる。|| は main への push の限定を外す
 */
function bypassesGate(job) {
  const cond = typeof job?.if === 'string' ? job.if : '';
  return /\b(always|failure|cancelled)\s*\(/.test(cond) || /\|\|/.test(cond) || /!\s*success\s*\(/.test(cond);
}

const WRITE = /write/;

/**
 * ワークフローの結線を検査する。
 * @param {{ file: string, doc: any }[]} workflows .github/workflows/ の YAML を読んだもの
 * @returns {string[]} 欠けた条件の一覧(空なら問題なし)
 */
export function checkWiring(workflows) {
  const problems = [];
  const ci = workflows.find((w) => w.file === CI_FILE);

  // 5. 全ワークフローが最上位に permissions を明示し、最上位で書き込みを与えない
  for (const w of workflows) {
    const perms = w.doc?.permissions;
    if (perms === undefined || perms === null) {
      problems.push(`${w.file}: 最上位に permissions がありません。最上位は contents: read にし、書き込みはジョブ単位で付けます(条件5)`);
      continue;
    }
    const values = typeof perms === 'string' ? [perms] : Object.values(perms);
    if (values.some((v) => WRITE.test(String(v)))) {
      problems.push(`${w.file}: 最上位の permissions が書き込みを与えています。書き込みはジョブ単位で付けます(条件5)`);
    }
  }

  if (!ci) {
    problems.push(`.github/workflows/${CI_FILE} がありません(条件1)`);
    return problems;
  }

  // 1. 契機に pull_request と main への push がある
  const on = ci.doc?.on;
  if (!on || typeof on !== 'object' || !('pull_request' in on)) {
    problems.push(`${CI_FILE}: 契機に pull_request がありません(条件1)`);
  }
  if (!pushesMain(on)) {
    problems.push(`${CI_FILE}: 契機に main への push がありません(条件1)`);
  }

  // 2. ジョブ check に、run がちょうど npm run check の手順がある。手順にもジョブにも if・continue-on-error が無い
  const job = ci.doc?.jobs?.[CHECK_JOB];
  if (!job) {
    problems.push(`${CI_FILE}: ジョブ ${CHECK_JOB} がありません(条件2)`);
  } else {
    if ('if' in job) problems.push(`${CI_FILE}: ジョブ ${CHECK_JOB} に if があります。条件によって検査が飛ばされます(条件2)`);
    if ('continue-on-error' in job) {
      problems.push(`${CI_FILE}: ジョブ ${CHECK_JOB} に continue-on-error があります。失敗が合否に使われません(条件2)`);
    }
    const runs = steps(job).filter((s) => runOf(s).trim() === 'npm run check');
    if (runs.length === 0) {
      problems.push(`${CI_FILE}: ジョブ ${CHECK_JOB} に、run がちょうど「npm run check」の手順がありません(条件2)`);
    }
    for (const s of runs) {
      if ('if' in s) problems.push(`${CI_FILE}: npm run check の手順に if があります(条件2)`);
      if ('continue-on-error' in s) problems.push(`${CI_FILE}: npm run check の手順に continue-on-error があります(条件2)`);
    }

    // 3. template のサブモジュールを取得する
    const fetchesTemplate = steps(job).some(
      (s) =>
        /git\s+submodule\s+update\s+--init/.test(runOf(s)) && /(^|\s)template(\s|$)/.test(runOf(s)),
    ) || steps(job).some((s) => /^actions\/checkout@/.test(usesOf(s)) && ['true', 'recursive'].includes(String(s.with?.submodules)));
    if (!fetchesTemplate) {
      problems.push(`${CI_FILE}: ジョブ ${CHECK_JOB} が template のサブモジュールを取得していません。検査の入力が無く失敗します(条件3)`);
    }
  }

  // 4・6. Pages へ配備するジョブと dist/standard へ書くジョブは、ci.yml にあり、needs に check を含み、
  // main への push に限る。dist/standard へ書くジョブは environment を持つ
  for (const w of workflows) {
    for (const [name, j] of Object.entries(w.doc?.jobs ?? {})) {
      const pages = deploysPages(j);
      const dist = writesDistStandard(j);
      if (!pages && !dist) continue;
      const what = pages ? 'Pages へ配備するジョブ' : 'dist/standard へ書くジョブ';
      if (w.file !== CI_FILE) {
        problems.push(`${w.file}: ${what} ${name} が ${CI_FILE} の外にあります。検査の通過を待ちません(条件4)`);
        continue;
      }
      if (!asArray(j.needs).includes(CHECK_JOB)) {
        problems.push(`${CI_FILE}: ${what} ${name} の needs に ${CHECK_JOB} がありません(条件4)`);
      }
      if (!gatedOnPushToMain(j)) {
        problems.push(`${CI_FILE}: ${what} ${name} の if が、main への push に限っていません(条件4)`);
      }
      if (bypassesGate(j)) {
        problems.push(
          `${CI_FILE}: ${what} ${name} の if に、状態の関数(always・failure・cancelled)か || があります。検査の失敗の後にも走るか、main への push の限定が外れます(条件4)`,
        );
      }
      if (dist && !j.environment) {
        problems.push(`${CI_FILE}: ${what} ${name} に environment がありません。配備のブランチを main に限った実行環境から走らせます(条件6)`);
      }
    }
  }

  // 9. ci.yml で contents の書き込みを持つのは、ジョブ publish だけ。publish は environment dist-standard を
  //    参照し、needs に check を含み、contents: write をジョブ単位で持つ(GITHUB_TOKEN で積むため)
  for (const [name, j] of Object.entries(ci.doc?.jobs ?? {})) {
    if (name !== PUBLISH_JOB && grantsContentsWrite(j?.permissions)) {
      problems.push(`${CI_FILE}: ジョブ ${name} が contents の書き込みを持ちます。書き込みを持つのはジョブ ${PUBLISH_JOB} だけです(条件9)`);
    }
  }
  const publish = ci.doc?.jobs?.[PUBLISH_JOB];
  if (publish) {
    if (typeof publish.permissions === 'string') {
      problems.push(`${CI_FILE}: ジョブ ${PUBLISH_JOB} の permissions が「${publish.permissions}」です。権限は contents: write だけを付けます(条件9)`);
    } else if (!grantsContentsWrite(publish.permissions)) {
      problems.push(`${CI_FILE}: ジョブ ${PUBLISH_JOB} の permissions に contents: write がありません。配布は GITHUB_TOKEN で積みます(条件9)`);
    }
    if (environmentName(publish) !== DIST_ENVIRONMENT) {
      problems.push(`${CI_FILE}: ジョブ ${PUBLISH_JOB} が environment ${DIST_ENVIRONMENT} を参照していません(条件9)`);
    }
    if (!asArray(publish.needs).includes(CHECK_JOB)) {
      problems.push(`${CI_FILE}: ジョブ ${PUBLISH_JOB} の needs に ${CHECK_JOB} がありません(条件9)`);
    }
  }

  // 10. dist/standard へ書くジョブと ci.yml の publish は、秘密情報を参照せず、SSH の鍵を使わない
  //     (deploy key・秘密情報を作らないと決めた。コメントは YAML の読み込みで落ちるため数えない)
  for (const w of workflows) {
    for (const [name, j] of Object.entries(w.doc?.jobs ?? {})) {
      if (!writesDistStandard(j) && !(w.file === CI_FILE && name === PUBLISH_JOB)) continue;
      const text = JSON.stringify(j ?? {});
      if (SECRET_REF.test(text)) {
        problems.push(`${w.file}: 配布のジョブ ${name} が秘密情報(secrets.)を参照します。配布はジョブの GITHUB_TOKEN だけで行います(条件10)`);
      }
      if (SSH_TRACE.test(text)) {
        problems.push(`${w.file}: 配布のジョブ ${name} が SSH の鍵・接続を使います。deploy key は作りません(条件10)`);
      }
    }
  }

  // 8. dist/standard の文字列は、ci.yml の publish ジョブの外に現れない
  //    (コメントは YAML の読み込みで落ちるため数えない)
  for (const w of workflows) {
    const { jobs, ...rest } = w.doc ?? {};
    const parts = [[`${w.file} の最上位`, rest]];
    for (const [name, j] of Object.entries(jobs ?? {})) {
      if (w.file === CI_FILE && name === PUBLISH_JOB) continue;
      parts.push([`${w.file} のジョブ ${name}`, j]);
    }
    for (const [where, part] of parts) {
      const text = JSON.stringify(part ?? {});
      if (text.includes('dist/standard')) {
        problems.push(`${where}: dist/standard が、${CI_FILE} のジョブ ${PUBLISH_JOB} の外に現れます(条件8)`);
      }
    }
  }

  return problems;
}

/** 失敗の文言。欠けた条件と、検査の一覧の正本を出す */
export function renderProblems(problems) {
  return [
    `CI の結線の検査: ${problems.length} 件の条件が欠けています。`,
    ...problems.map((p) => `  - ${p}`),
    '',
    '検査の一覧の正本は package.json の check です。CI はその npm run check を合否に使い、公開と配布はその通過の後にだけ走ります。',
    '規約: src/content/docs/adr/0077-repository-ci-wiring-and-distribution.md',
  ].join('\n');
}
