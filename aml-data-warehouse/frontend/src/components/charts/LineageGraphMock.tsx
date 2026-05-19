import { LineageGraph } from "../../types";

interface Props {
  graph: LineageGraph;
}

/**
 * SVG-based lineage visualisation. Lays nodes out by their `type` column so we
 * keep dependencies down — no graphviz / d3-dagre required.
 */
export default function LineageGraphMock({ graph }: Props) {
  const columns: { key: string; label: string; tone: string }[] = [
    { key: "SOURCE_TABLE",    label: "Source",     tone: "bg-sky-100 text-sky-800 border-sky-300" },
    { key: "WAREHOUSE_TABLE", label: "Warehouse",  tone: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    { key: "REPORT",          label: "Reports",    tone: "bg-violet-100 text-violet-800 border-violet-300" },
  ];

  const colWidth = 240;
  const nodeHeight = 56;
  const colGap = 80;

  const grouped = columns.map((c) => graph.nodes.filter((n) => n.type === c.key));
  const maxRows = Math.max(...grouped.map((g) => g.length), 1);
  const height = maxRows * (nodeHeight + 14) + 40;
  const width = columns.length * colWidth + (columns.length - 1) * colGap + 40;

  const positions = new Map<string, { x: number; y: number }>();
  grouped.forEach((g, ci) => {
    g.forEach((n, ri) => {
      positions.set(n.id, {
        x: 20 + ci * (colWidth + colGap),
        y: 20 + ri * (nodeHeight + 14),
      });
    });
  });

  return (
    <div className="card-pad overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {graph.edges.map((e, idx) => {
          const a = positions.get(e.source);
          const b = positions.get(e.target);
          if (!a || !b) return null;
          const x1 = a.x + colWidth;
          const y1 = a.y + nodeHeight / 2;
          const x2 = b.x;
          const y2 = b.y + nodeHeight / 2;
          const c = (x1 + x2) / 2;
          return (
            <g key={idx}>
              <path
                d={`M ${x1} ${y1} C ${c} ${y1}, ${c} ${y2}, ${x2} ${y2}`}
                stroke="#94a3b8"
                strokeWidth="1.5"
                fill="none"
              />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle"
                    fontSize="10" fill="#475569">
                {e.type}
              </text>
            </g>
          );
        })}
        {grouped.map((nodes, ci) =>
          nodes.map((n) => {
            const p = positions.get(n.id)!;
            return (
              <g key={n.id} transform={`translate(${p.x},${p.y})`}>
                <rect
                  width={colWidth}
                  height={nodeHeight}
                  rx={10}
                  className={columns[ci].tone}
                  fill="currentColor"
                  fillOpacity="0.5"
                  stroke="currentColor"
                />
                <text x={12} y={22} fontSize="12" fontWeight="600" fill="#0f172a">
                  {n.label}
                </text>
                <text x={12} y={40} fontSize="10" fill="#475569">
                  {n.system}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
