import { ArrowRight, ArrowUpRight, Download, FolderKanban, GraduationCap } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Profile, Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Portrait } from '@/components/ui/Portrait';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { NetworkBackdrop } from '@/components/decor/NetworkBackdrop';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero({ profile, featured }: { profile: Profile; featured: Project | null }) {
  const reduce = useReducedMotion();
  const anim = reduce ? {} : { variants: item };

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="absolute -top-40 right-0 size-[36rem] rounded-full bg-emerald-brand/10 blur-3xl dark:bg-emerald-brand/[0.07]"
      />

      <Container className="relative grid items-center gap-16 pt-10 pb-20 sm:pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14 lg:pt-20 lg:pb-28">
        <motion.div variants={container} initial={reduce ? false : 'hidden'} animate="show">
          {profile.availability && (
            <motion.div {...anim}>
              <StatusPill label={profile.availability} />
            </motion.div>
          )}

          <motion.h1
            {...anim}
            id="hero-title"
            className="mt-8 text-5xl font-semibold leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p {...anim} className="mt-5 font-display text-2xl font-medium tracking-tight text-fg sm:text-3xl">
            {profile.headline}
          </motion.p>
          <motion.p {...anim} className="mt-3 flex items-center gap-2 text-base font-medium text-fg-muted">
            <GraduationCap className="size-[18px] text-accent" aria-hidden />
            {profile.supportingLine}
          </motion.p>

          <motion.p {...anim} className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {profile.intro}
          </motion.p>

          <motion.div {...anim} className="mt-9 flex flex-wrap items-center gap-3">
            <Button to="/projects" size="lg" trailingIcon={<ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />}>
              View My Work
            </Button>
            {profile.cvUrl ? (
              <Button href={profile.cvUrl} download variant="secondary" size="lg" leadingIcon={<Download className="size-4" aria-hidden />}>
                Download CV
              </Button>
            ) : (
              <Button variant="secondary" size="lg" disabled title="CV coming soon" leadingIcon={<Download className="size-4" aria-hidden />}>
                Download CV
                <span className="sr-only"> (coming soon)</span>
              </Button>
            )}
          </motion.div>

          <motion.ul {...anim} className="mt-9 flex items-center gap-2" aria-label="Social links">
            {profile.socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target={s.platform === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface/70 text-fg-muted transition-[color,border-color,transform] hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
                >
                  <SocialIcon platform={s.platform} className="size-[18px]" />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[18rem] sm:max-w-sm lg:max-w-none"
        >
          <NetworkBackdrop className="absolute -top-12 -left-16 h-[calc(100%+6rem)] w-[calc(100%+8rem)] opacity-70" />
          <Portrait image={profile.portrait} name={profile.name} className="relative lg:ml-auto lg:max-w-[23rem]" />

          {featured && (
            <Link
              to={`/projects/${featured.slug}`}
              className="group absolute -bottom-6 -left-2 flex max-w-[16rem] items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3.5 pr-4 shadow-card-hover backdrop-blur-md transition-colors hover:border-accent/50 sm:-left-8"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <FolderKanban className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-fg-subtle">Featured project</span>
                <span className="flex items-center gap-1 font-display text-sm font-semibold">
                  {featured.shortTitle ?? featured.title}
                  <ArrowUpRight className="size-3.5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </span>
            </Link>
          )}
        </motion.div>
      </Container>

      {/* Focus strip */}
      <div className="relative border-y border-line bg-surface/60">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 font-mono text-xs uppercase tracking-[0.16em] text-fg-muted sm:justify-between">
            {profile.focusAreas.map((area) => (
              <li key={area} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {area}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}
