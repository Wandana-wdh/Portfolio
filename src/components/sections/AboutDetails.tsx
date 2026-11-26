import type { ReactNode } from 'react';
import type { AboutContent } from '@/types';
import { Reveal } from '@/components/ui/Reveal';

function Row({ label, children, index }: { label: string; children: ReactNode; index: number }) {
  return (
    <Reveal delay={Math.min(index * 0.05, 0.2)}>
      <div className="grid gap-3 border-t border-line py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle sm:pt-1">{label}</h3>
        <div className="text-[0.95rem] leading-relaxed text-fg-muted">{children}</div>
      </div>
    </Reveal>
  );
}

/** Editorial definition-style breakdown of the "About" content. */
export function AboutDetails({ about }: { about: AboutContent }) {
  return (
    <div className="border-b border-line">
      <Row label="Academic background" index={0}>
        <p>{about.academicBackground}</p>
      </Row>
      <Row label="Software development" index={1}>
        <p>{about.developmentExperience}</p>
      </Row>
      <Row label="Professional interests" index={2}>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {about.professionalInterests.map((i) => (
            <li key={i} className="flex items-center gap-2.5 text-fg">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
              {i}
            </li>
          ))}
        </ul>
      </Row>
      <Row label="Career aspirations" index={3}>
        <p>{about.careerAspirations}</p>
      </Row>
    </div>
  );
}
