import { cn } from '@/lib/utils';

const NODES: Array<[number, number]> = [
  [60, 80], [180, 40], [300, 110], [420, 60], [520, 150],
  [110, 220], [240, 200], [380, 240], [480, 300], [70, 360],
  [200, 330], [330, 380], [450, 430], [150, 470], [290, 500], [520, 480],
];

const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 2], [6, 7], [7, 4], [7, 8],
  [5, 9], [9, 10], [10, 6], [10, 11], [11, 7], [11, 12], [12, 8], [10, 13], [13, 14], [14, 11], [14, 15], [15, 12],
];

/** Small interface "panels" floating in the network — a neutral software motif. */
const PANELS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 395, y: 20, w: 96, h: 58 },
  { x: 8, y: 260, w: 84, h: 52 },
  { x: 410, y: 520, w: 104, h: 30 },
];

/** Decorative network motif behind the hero portrait. Purely visual. */
export function NetworkBackdrop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 580 560" aria-hidden className={cn('pointer-events-none text-accent', className)}>
      <g stroke="currentColor" strokeOpacity="0.22">
        {EDGES.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        <g key={i}>
          {i % 4 === 0 && (
            <circle
              cx={x}
              cy={y}
              r={10}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              className="animate-node-pulse"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          )}
          <circle cx={x} cy={y} r={3} fill="currentColor" fillOpacity="0.6" />
        </g>
      ))}
      {PANELS.map((p) => (
        <g key={`${p.x}-${p.y}`} stroke="currentColor" fill="none" strokeOpacity="0.45">
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={7} />
          <line x1={p.x} y1={p.y + 12} x2={p.x + p.w} y2={p.y + 12} strokeOpacity="0.3" />
          <circle cx={p.x + 7} cy={p.y + 6} r={1.6} fill="currentColor" fillOpacity="0.6" stroke="none" />
          <circle cx={p.x + 13} cy={p.y + 6} r={1.6} fill="currentColor" fillOpacity="0.4" stroke="none" />
          {p.h > 40 && (
            <>
              <line x1={p.x + 8} y1={p.y + 24} x2={p.x + p.w * 0.7} y2={p.y + 24} strokeOpacity="0.35" strokeLinecap="round" />
              <line x1={p.x + 8} y1={p.y + 34} x2={p.x + p.w * 0.5} y2={p.y + 34} strokeOpacity="0.25" strokeLinecap="round" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
