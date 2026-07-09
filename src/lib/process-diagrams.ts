// プロセスデータ(スキーマ v0)から Mermaid 図のコードを生成する(ADR-0006 / ADR-0007)
// データと描画の分離: ここを差し替えれば描画層を D2 等へ移行できる

type Gate = {
  id: string;
  name: string;
};

type Phase = {
  id: string;
  name: string;
  gatesAfter: string[];
};

type Activity = {
  id: string;
  name: string;
};

function esc(label: string): string {
  return label.replace(/"/g, '');
}

function withSlash(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * L1: フェーズの流れとゲート配置。フェーズノードは click で L2 へ。
 * ノード数を抑えるため(ADR-0006: 15ノード前後)、中間ゲートはエッジラベルで表現し、
 * 最終フェーズの出口ゲートのみ菱形ノードで示す。
 */
export function l1Diagram(
  processId: string,
  phases: Phase[],
  gates: Gate[],
  base: string
): string {
  const b = withSlash(base);
  const gateName = (id: string) => gates.find((g) => g.id === id)?.name ?? id;
  const lines: string[] = ['graph LR'];
  const clicks: string[] = [];

  phases.forEach((phase, i) => {
    const nodeId = `ph${i}`;
    lines.push(`  ${nodeId}["${esc(phase.name)}"]`);
    clicks.push(
      `  click ${nodeId} "${b}processes/${processId}/${phase.id}/" "${esc(phase.name)}の詳細へ"`
    );
    if (i > 0) {
      const prevGates = phases[i - 1].gatesAfter.map(gateName).join(' / ');
      const label = prevGates ? `|"${esc(prevGates)}"|` : '';
      lines.push(`  ph${i - 1} -->${label} ${nodeId}`);
    }
  });

  const last = phases[phases.length - 1];
  if (last && last.gatesAfter.length > 0) {
    const names = last.gatesAfter.map(gateName).join(' / ');
    lines.push(`  gEnd{"${esc(names)}"}`);
    lines.push(`  ph${phases.length - 1} --> gEnd`);
  }

  return [...lines, ...clicks].join('\n');
}

/** L2: フェーズ内のアクティビティの流れ。ノードは click で L3 へ */
export function l2Diagram(
  processId: string,
  phaseId: string,
  activities: Activity[],
  base: string
): string {
  const b = withSlash(base);
  const lines: string[] = ['graph LR'];
  const clicks: string[] = [];
  let prev: string | null = null;

  activities.forEach((act, i) => {
    const nodeId = `a${i}`;
    lines.push(`  ${nodeId}["${esc(act.name)}"]`);
    if (prev) lines.push(`  ${prev} --> ${nodeId}`);
    prev = nodeId;
    clicks.push(
      `  click ${nodeId} "${b}processes/${processId}/${phaseId}/${act.id}/" "${esc(act.name)}の詳細へ"`
    );
  });

  return [...lines, ...clicks].join('\n');
}
