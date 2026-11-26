import { useId, useMemo, type ReactNode } from 'react';
import type { ArtworkVariant, ImageAsset } from '@/types';
import { cn } from '@/lib/utils';

const W = 400;
const H = 250;
const ACCENT = '#10B981';
const ACCENT_LIGHT = '#6EE7B7';
const GRID = 'rgba(148,163,184,0.12)';

type Rng = () => number;

/** Deterministic PRNG (FNV-1a seed + mulberry32) so art is stable per item. */
function createRng(seed: string): Rng {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (r: Rng, len = 4) =>
  Array.from({ length: len }, () => Math.floor(r() * 16).toString(16)).join('');

function Network({ r }: { r: Rng }) {
  const nodes = Array.from({ length: 18 }, () => ({ x: 24 + r() * (W - 48), y: 20 + r() * (H - 40), s: 1.5 + r() * 2.5 }));
  const edges = new Set<string>();
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return (
    <g>
      {[...edges].map((key) => {
        const [a, b] = key.split('-').map(Number);
        return <line key={key} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={ACCENT} strokeOpacity={0.35} />;
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          {i % 6 === 0 && <circle cx={n.x} cy={n.y} r={n.s + 6} fill="none" stroke={ACCENT} strokeOpacity={0.4} />}
          <circle cx={n.x} cy={n.y} r={n.s} fill={ACCENT_LIGHT} fillOpacity={0.85} />
        </g>
      ))}
    </g>
  );
}

function Circuit({ r }: { r: Rng }) {
  const chip = { x: 165, y: 90, w: 70, h: 70 };
  const traces: ReactNode[] = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 8; i++) {
      const yStart = 18 + i * 30 + r() * 8;
      const yEnd = chip.y + 8 + i * 7.5;
      const dy = Math.abs(yEnd - yStart);
      const bend = Math.max(8, chip.x - 12 - dy - r() * 30);
      const d = `M0 ${yStart} H${bend} L${bend + dy} ${yEnd} H${chip.x}`;
      traces.push(
        <g key={`${side}-${i}`} transform={side ? `translate(${W} 0) scale(-1 1)` : undefined}>
          <path d={d} fill="none" stroke={ACCENT} strokeOpacity={0.45} />
          <circle cx={bend} cy={yStart} r={2.2} fill={ACCENT_LIGHT} fillOpacity={0.8} />
        </g>,
      );
    }
  }
  return (
    <g>
      {traces}
      <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={8} fill="#0F1A2E" stroke={ACCENT} strokeOpacity={0.8} />
      <rect x={chip.x + 16} y={chip.y + 16} width={chip.w - 32} height={chip.h - 32} rx={4} fill={ACCENT} fillOpacity={0.15} stroke={ACCENT} strokeOpacity={0.5} />
    </g>
  );
}

function Lattice({ r }: { r: Rng }) {
  const step = 25;
  const dots: ReactNode[] = [];
  for (let x = step; x < W; x += step) for (let y = step; y < H; y += step) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.1} fill="#94A3B8" fillOpacity={0.35} />);
  const path: Array<[number, number]> = [];
  let row = 4 + Math.floor(r() * 2);
  for (let col = 1; col < W / step; col++) {
    path.push([col * step, row * step]);
    row = Math.min(8, Math.max(1, row + (r() < 0.5 ? -1 : 1) * (r() < 0.7 ? 1 : 0)));
  }
  return (
    <g>
      {dots}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={step * (2 + Math.floor(r() * 12))} y={step * (1 + Math.floor(r() * 7))} width={step} height={step} fill={ACCENT} fillOpacity={0.08 + r() * 0.08} />
      ))}
      <polyline points={path.map((p) => p.join(',')).join(' ')} fill="none" stroke={ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
      {path.filter((_, i) => i % 3 === 0).map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} fill="#0B1120" stroke={ACCENT_LIGHT} strokeWidth={1.4} />
      ))}
    </g>
  );
}

function Blocks({ r }: { r: Rng }) {
  const hi = Math.floor(r() * 4);
  return (
    <g fontFamily="ui-monospace, monospace">
      {Array.from({ length: 4 }, (_, i) => {
        const x = 26 + i * 92;
        const y = 78;
        return (
          <g key={i}>
            {i < 3 && <line x1={x + 72} y1={y + 46} x2={x + 92} y2={y + 46} stroke={ACCENT} strokeOpacity={0.6} strokeDasharray="3 3" />}
            <rect x={x} y={y} width={72} height={92} rx={8} fill="#0F1A2E" stroke={ACCENT} strokeOpacity={i === hi ? 0.9 : 0.35} />
            <text x={x + 10} y={y + 20} fontSize={9} fill={ACCENT_LIGHT} fillOpacity={0.9}>#{hex(r)}</text>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={x + 10} y={y + 34 + k * 14} width={24 + r() * 28} height={4} rx={2} fill="#94A3B8" fillOpacity={0.3} />
            ))}
            <text x={x + 10} y={y + 82} fontSize={8} fill="#94A3B8" fillOpacity={0.7}>0x{hex(r, 6)}</text>
          </g>
        );
      })}
    </g>
  );
}

function Waves({ r }: { r: Rng }) {
  const lines = Array.from({ length: 13 }, (_, k) => {
    const y0 = 34 + k * 15;
    const p1 = r() * Math.PI * 2;
    const p2 = r() * Math.PI * 2;
    const amp = 6 + k * 0.9;
    let d = '';
    for (let x = 0; x <= W; x += 8) {
      const y = y0 + Math.sin(x / 58 + p1) * amp + Math.sin(x / 21 + p2) * (amp / 4);
      d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `;
    }
    return <path key={k} d={d} fill="none" stroke={ACCENT} strokeOpacity={0.15 + (k / 13) * 0.5} />;
  });
  return (
    <g>
      {lines}
      {Array.from({ length: 5 }, (_, i) => {
        const x = 50 + i * 75 + r() * 20;
        const y = 190 + r() * 30;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={y - 22} stroke={ACCENT_LIGHT} strokeOpacity={0.6} />
            <circle cx={x} cy={y - 26} r={4} fill="none" stroke={ACCENT_LIGHT} strokeOpacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

function Grid({ r }: { r: Rng }) {
  const horizon = 150;
  const floor: ReactNode[] = [];
  for (let i = -10; i <= 10; i++) floor.push(<line key={`v${i}`} x1={W / 2} y1={horizon} x2={W / 2 + i * 60} y2={H} stroke={ACCENT} strokeOpacity={0.18} />);
  for (let t = 1; t <= 6; t++) {
    const y = horizon + (H - horizon) * (t / 6) ** 2;
    floor.push(<line key={`h${t}`} x1={0} y1={y} x2={W} y2={y} stroke={ACCENT} strokeOpacity={0.18} />);
  }
  let x = 38;
  const buildings: ReactNode[] = [];
  while (x < W - 50) {
    const w = 32 + r() * 22;
    const h = 40 + r() * 80;
    const y = horizon - h;
    buildings.push(
      <g key={x}>
        <rect x={x} y={y} width={w} height={h} fill="#0F1A2E" stroke={ACCENT} strokeOpacity={0.6} />
        {Array.from({ length: Math.floor(h / 14) }, (_, row) => (
          <line key={row} x1={x + 6} y1={y + 10 + row * 14} x2={x + w - 6} y2={y + 10 + row * 14} stroke="#94A3B8" strokeOpacity={0.22} strokeDasharray="4 4" />
        ))}
      </g>,
    );
    x += w + 8 + r() * 10;
  }
  return (
    <g>
      {floor}
      {buildings}
      <line x1={0} y1={horizon} x2={W} y2={horizon} stroke={ACCENT} strokeOpacity={0.5} />
    </g>
  );
}

function Pulse({ r, glowId }: { r: Rng; glowId: string }) {
  const grid: ReactNode[] = [];
  for (let x = 0; x <= W; x += 20) grid.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke={GRID} />);
  for (let y = 0; y <= H; y += 20) grid.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke={GRID} />);
  const base = 140;
  const pts: string[] = [];
  for (let x = 0; x <= W; ) {
    if (x > 30 && r() < 0.18) {
      pts.push(`${x},${base}`, `${x + 6},${base - 10}`, `${x + 12},${base}`, `${x + 18},${base + 14}`, `${x + 24},${base - 70 - r() * 20}`, `${x + 32},${base + 26}`, `${x + 40},${base}`);
      x += 64;
    } else {
      pts.push(`${x},${base}`);
      x += 16;
    }
  }
  return (
    <g>
      {grid}
      <polyline points={pts.join(' ')} fill="none" stroke={ACCENT} strokeWidth={4} strokeOpacity={0.35} filter={`url(#${glowId})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={ACCENT_LIGHT} strokeWidth={1.8} strokeLinejoin="round" />
      <g transform="translate(340 46)">
        <circle r={20} fill="none" stroke={ACCENT} strokeOpacity={0.6} />
        <path d="M-7 0H7M0 -7V7" stroke={ACCENT_LIGHT} strokeWidth={2} strokeLinecap="round" />
      </g>
    </g>
  );
}

interface CoverArtProps {
  variant: ArtworkVariant;
  seed: string;
  label?: string;
  className?: string;
}

/** Generated, on-brand cover graphic used until a real image is provided. */
export function CoverArt({ variant, seed, label, className }: CoverArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const bgId = `bg-${uid}`;
  const glowId = `glow-${uid}`;
  const halo = `halo-${uid}`;

  const art = useMemo(() => {
    const r = createRng(`${seed}:${variant}`);
    switch (variant) {
      case 'network':
        return <Network r={r} />;
      case 'circuit':
        return <Circuit r={r} />;
      case 'lattice':
        return <Lattice r={r} />;
      case 'blocks':
        return <Blocks r={r} />;
      case 'waves':
        return <Waves r={r} />;
      case 'grid':
        return <Grid r={r} />;
      case 'pulse':
        return <Pulse r={r} glowId={glowId} />;
    }
  }, [seed, variant, glowId]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden className={cn('block size-full', className)}>
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B1120" />
          <stop offset="1" stopColor="#14223D" />
        </linearGradient>
        <radialGradient id={halo} cx="0.85" cy="0.1" r="0.7">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.22" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${bgId})`} />
      <rect width={W} height={H} fill={`url(#${halo})`} />
      {art}
      {label && (
        <text x={18} y={H - 16} fontFamily="ui-monospace, monospace" fontSize={10} letterSpacing={1.5} fill="#94A3B8">
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

interface MediaProps {
  image: ImageAsset | null;
  artwork: ArtworkVariant;
  seed: string;
  label?: string;
  className?: string;
  priority?: boolean;
}

/** Real image when available, generated cover art otherwise. */
export function Media({ image, artwork, seed, label, className, priority }: MediaProps) {
  if (image) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('block size-full object-cover', className)}
      />
    );
  }
  return <CoverArt variant={artwork} seed={seed} label={label} className={className} />;
}
