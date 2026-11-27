import type { ReactNode } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { statusBadge, type AnyStatus } from '@/lib/labels';
import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'accent' | 'outline' | 'warning' | 'overlay';

const tones: Record<BadgeTone, string> = {
  overlay: 'bg-navy/75 text-offwhite ring-1 ring-white/15 backdrop-blur',
  neutral: 'bg-surface-2 text-fg-muted',
  accent: 'bg-accent-soft text-accent',
  outline: 'border border-line-strong text-fg-muted',
  warning: 'border border-dashed border-amber-500/50 text-amber-700 dark:text-amber-300',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small monospace technology label. */
export function TechTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-surface-2/60 px-2 py-1 font-mono text-[0.7rem] leading-none text-fg-muted">
      {children}
    </span>
  );
}

/** Marks sample content that still needs to be replaced. */
export function PlaceholderTag({ label = 'Placeholder' }: { label?: string }) {
  return <Badge tone="warning">{label}</Badge>;
}

/** Pulsing status indicator, e.g. "Ongoing". */
export function StatusPill({ label, active = true }: { label: string; active?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
      <span className="relative flex size-2">
        {active && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />}
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      {label}
    </span>
  );
}

/**
 * Completed (check-circle) or In Progress / Early-stage (clock). The text is
 * always shown, so the status never depends on colour alone. Renders nothing
 * when the status is unset.
 */
export function StatusBadge({ status, overlay = false, className }: { status: AnyStatus | null | undefined; overlay?: boolean; className?: string }) {
  const info = status ? statusBadge[status] : undefined;
  if (!info) return null;
  const Icon = info.done ? CheckCircle2 : Clock;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap',
        overlay
          ? 'bg-navy/75 text-offwhite ring-1 ring-white/15 backdrop-blur'
          : info.done
            ? 'bg-accent-soft text-accent ring-1 ring-accent/25'
            : 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300',
        className,
      )}
    >
      <Icon className={cn('size-3.5 shrink-0', overlay && (info.done ? 'text-emerald-300' : 'text-amber-300'))} aria-hidden />
      <span>
        <span className="sr-only">Status: </span>
        {info.label}
      </span>
    </span>
  );
}
