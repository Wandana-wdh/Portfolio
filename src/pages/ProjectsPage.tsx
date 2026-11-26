import { useMemo, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLoaderData } from 'react-router-dom';
import type { ProjectCategory } from '@/types';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { unique } from '@/lib/utils';
import { cardGrid } from '@/lib/layout';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Section } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChips } from '@/components/ui/FilterChips';
import { PageHeader } from '@/components/ui/PageHeader';
import type { LoaderData, projectsLoader } from './loaders';

type Filter = 'all' | ProjectCategory;

export default function ProjectsPage() {
  const { projects } = useLoaderData() as LoaderData<typeof projectsLoader>;
  const [filter, setFilter] = useState<Filter>('all');
  useDocumentMeta({
    title: 'Projects',
    description: 'Software projects by Wandana Herath — role-based web applications and cloud–edge IoT automation.',
  });

  const options = useMemo(
    () => [
      { value: 'all' as Filter, label: 'All', count: projects.length },
      ...unique(projects.map((p) => p.category)).map((c) => ({
        value: c as Filter,
        label: c,
        count: projects.filter((p) => p.category === c).length,
      })),
    ],
    [projects],
  );

  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I have designed and built"
        description="Team, coursework and personal projects built around real workflows — from role-based dashboards to department automation."
      >
        {options.length > 2 && <FilterChips label="Filter projects by category" options={options} value={filter} onChange={setFilter} />}
      </PageHeader>

      <Section className="pt-14 sm:pt-16 lg:pt-16">
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} project{visible.length === 1 ? '' : 's'}
        </p>
        {visible.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects in this category yet" description="Try another category." />
        ) : (
          <motion.ul layout className={cardGrid}>
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProjectCard project={p} headingLevel="h2" />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </Section>
    </>
  );
}
