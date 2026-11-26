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

/**
 * Editorial definition-style breakdown of the "About" content. Rows with no
 * content are left out, so the panel is only as tall as what it shows.
 */
export function AboutDetails({ about }: { about: AboutContent }) {
  const rows: Array<{ label: string; content: ReactNode }> = [];
  const academic = about.academicBackground?.trim();
  const interests = (about.professionalInterests ?? []).filter((i) => i.trim());
  const aspirations = about.careerAspirations?.trim();

  if (academic) rows.push({ label: 'Academic background', content: <p>{academic}</p> });
  if (interests.length > 0) {
    rows.push({
      label: 'Professional interests',
      content: (
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {interests.map((i) => (
            <li key={i} className="flex items-center gap-2.5 text-fg">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
              {i}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (aspirations) rows.push({ label: 'Career aspirations', content: <p>{aspirations}</p> });

  if (rows.length === 0) return null;
  return (
    <div className="border-b border-line">
      {rows.map((row, i) => (
        <Row key={row.label} label={row.label} index={i}>
          {row.content}
        </Row>
      ))}
    </div>
  );
}
