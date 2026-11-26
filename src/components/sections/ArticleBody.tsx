import { Info } from 'lucide-react';
import type { ArticleBlock } from '@/types';

/**
 * Renders structured article content. When articles move to Supabase this can
 * be swapped for a Markdown/MDX renderer without changing the page.
 */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-6 text-[1.075rem] leading-[1.8] text-fg-muted">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{block.text}</p>;
          case 'heading':
            return (
              <h2 key={i} className="pt-4 text-2xl font-semibold text-fg">
                {block.text}
              </h2>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 marker:text-accent">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <blockquote key={i} className="border-l-2 border-accent pl-6 font-display text-xl text-fg italic">
                {block.text}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={i} className="overflow-x-auto rounded-2xl border border-line bg-navy p-5 font-mono text-sm leading-relaxed text-offwhite">
                <code data-language={block.language}>{block.code}</code>
              </pre>
            );
          case 'callout':
            return (
              <p key={i} className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-5 text-base text-fg">
                <Info className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
