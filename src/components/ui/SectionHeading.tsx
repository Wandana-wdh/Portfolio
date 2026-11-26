import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  id: string;
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; to: string };
  className?: string;
}

export function SectionHeading({ id, index, eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn('mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-3">
          {index && <span className="text-fg-subtle">{index}</span>}
          {index && <span aria-hidden className="h-px w-8 bg-accent/50" />}
          {eyebrow}
        </p>
        <h2 id={id} className="mt-4 text-3xl font-semibold sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-lg">{description}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-accent"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </Reveal>
  );
}
