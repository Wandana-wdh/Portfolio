import { ArrowRight, Database, FileCheck2, Leaf, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';

const steps: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Database, title: 'Environmental data', text: 'Field and sensing inputs' },
  { icon: Leaf, title: 'Biomass estimation', text: 'Estimate computed from data' },
  { icon: ShieldCheck, title: 'Zero-knowledge proof', text: 'Correctness proven privately' },
  { icon: FileCheck2, title: 'Public verification', text: 'Tamper-evident, verifiable claim' },
];

/** Conceptual (illustrative) overview of the ZK-Mangrove idea. */
export function ResearchPipeline() {
  return (
    <figure>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-2">
        {steps.map((step, i) => (
          <Fragment key={step.title}>
            <li className="flex items-start gap-3 rounded-xl border border-line bg-canvas/70 p-4 lg:flex-col">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <step.icon className="size-[18px]" aria-hidden />
              </span>
              <span>
                <span className="block font-mono text-[0.65rem] text-fg-subtle">0{i + 1}</span>
                <span className="block text-sm font-semibold">{step.title}</span>
                <span className="mt-0.5 block text-xs text-fg-muted">{step.text}</span>
              </span>
            </li>
            {i < steps.length - 1 && (
              <li aria-hidden className="hidden items-center text-accent/70 lg:flex">
                <ArrowRight className="size-4" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
      <figcaption className="mt-4 font-mono text-xs text-fg-subtle">
        Fig. 1 — Conceptual overview of privacy-preserving verification (illustrative).
      </figcaption>
    </figure>
  );
}
