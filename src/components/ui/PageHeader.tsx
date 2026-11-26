import type { ReactNode } from 'react';
import { Container } from './Container';
import { Reveal } from './Reveal';

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <Container className="relative pt-16 pb-14 sm:pt-20 sm:pb-16">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </Container>
    </header>
  );
}
