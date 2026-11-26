import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const widths = {
  default: 'max-w-6xl',
  wide: 'max-w-5xl',
  narrow: 'max-w-3xl',
} as const;

export function Container({
  children,
  className,
  size = 'default',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof widths;
  as?: ElementType;
}) {
  return <Tag className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[size], className)}>{children}</Tag>;
}

/** Vertical rhythm wrapper for page sections. */
export function Section({
  children,
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('py-20 sm:py-24 lg:py-28', className)}>
      <Container>{children}</Container>
    </section>
  );
}
