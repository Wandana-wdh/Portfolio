import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article, Profile, Project, SkillGroup } from '@/types';
import type { EventEntry, VolunteeringEntry } from '@/types';
import type { CredentialView, TimelineView } from '@/services';
import { siteConfig } from '@/data/site';
import { cardGrid } from '@/lib/layout';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CredentialCard } from '@/components/cards/CredentialCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactLinks } from '@/components/contact/ContactLinks';
import { Section } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AboutDetails } from '@/components/sections/AboutDetails';
import { SkillGrid } from '@/components/sections/SkillGrid';
import { Timeline } from '@/components/sections/Timeline';
import { VolunteeringList } from '@/components/sections/Volunteering';
import { EventsList } from '@/components/sections/Events';
import { MediumIcon } from '@/components/ui/SocialIcon';

export function FeaturedProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHeading
        id="projects-title"
        index="01"
        eyebrow="Selected Work"
        title="Featured projects"
        description="Software built around real workflows — from role-based dashboards to department automation."
        action={{ label: 'All projects', to: '/projects' }}
      />
      <ul className={cardGrid}>
        {projects.map((p, i) => (
          <li key={p.id}>
            <Reveal delay={Math.min(i * 0.06, 0.2)} className="h-full">
              <ProjectCard project={p} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <Section id="about" labelledBy="about-title" className="border-y border-line bg-surface">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="about-title" index="02" eyebrow="About Me" title="Building software around how people work" className="mb-6 md:mb-6" />
          <Reveal>
            <p className="text-lg leading-relaxed text-fg-muted">{profile.about.intro}</p>
            <Link to="/about" className="group mt-8 inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent">
              More about me
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
        <AboutDetails about={profile.about} />
      </div>
    </Section>
  );
}

export function ExpertiseSection({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <Section id="expertise" labelledBy="expertise-title">
      <SectionHeading
        id="expertise-title"
        index="03"
        eyebrow="Technical Expertise"
        title="Tools and technologies"
        description="A working toolkit across the stack, from React interfaces to Node.js services, cloud platforms and testing."
      />
      <SkillGrid groups={groups} />
    </Section>
  );
}

export function EducationSection({ entries }: { entries: TimelineView[] }) {
  if (entries.length === 0) return null;
  return (
    <Section id="education" labelledBy="education-title" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="education-title"
          index="04"
          eyebrow="Education"
          title="From school to university"
          description="University studies and school examinations, newest first."
          action={{ label: 'Full background', to: '/about' }}
        />
        <Timeline entries={entries} />
      </div>
    </Section>
  );
}

export function ExperienceSection({ entries }: { entries: VolunteeringEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <Section id="experience" labelledBy="experience-title">
      <SectionHeading
        id="experience-title"
        index="05"
        eyebrow="Experience"
        title="Volunteering & Experience"
        description="Roles where I’ve contributed beyond coursework."
      />
      <VolunteeringList entries={entries} />
    </Section>
  );
}

export function EventsSection({ entries }: { entries: EventEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <Section id="events" labelledBy="events-title" className="border-y border-line bg-surface">
      <SectionHeading
        id="events-title"
        index="06"
        eyebrow="Participation"
        title="Events & Participation"
        description="Conferences, bootcamps, meetups and workshops I’ve taken part in."
      />
      <EventsList entries={entries} />
    </Section>
  );
}

export function AchievementsSection({ items, total }: { items: CredentialView[]; total: number }) {
  if (items.length === 0) return null;
  return (
    <Section id="achievements" labelledBy="achievements-title">
      <SectionHeading
        id="achievements-title"
        index="07"
        eyebrow="Achievements & Certifications"
        title="Credentials and recognition"
        description="Project confirmation, skills credentials and badges — with links to verify each one where available."
        action={{ label: `View all ${total}`, to: '/achievements' }}
      />
      <ul className={cardGrid}>
        {items.map((c, i) => (
          <li key={c.id}>
            <Reveal delay={i * 0.06} className="h-full">
              <CredentialCard item={c} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ArticlesSection({ articles }: { articles: Article[] }) {
  const [lead, ...rest] = articles;
  if (!lead) return null;
  return (
    <Section id="articles" labelledBy="articles-title" className="border-y border-line bg-surface">
      <SectionHeading
        id="articles-title"
        index="08"
        eyebrow="Articles"
        title="Writing"
        description="Sharing what I’m learning — across software, security and the ideas behind them."
        action={{ label: 'All articles', to: '/articles' }}
      />
      <Reveal>
        <ArticleCard article={lead} variant="featured" />
      </Reveal>
      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06} className="h-full">
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </div>
      )}
      <Reveal className="mt-8">
        <a
          href={siteConfig.mediumProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-fg-muted transition-colors hover:text-accent"
        >
          <MediumIcon className="size-4" />
          View my Medium profile
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Reveal>
    </Section>
  );
}

export function ContactSection({ profile }: { profile: Profile }) {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            id="contact-title"
            index="09"
            eyebrow="Contact"
            title="Let’s work together"
            description="Open to software and IT internships, project collaborations and conversations about building software."
            className="mb-8 md:mb-8"
          />
          <Reveal>
            <ContactLinks profile={profile} />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <ContactForm to={profile.email} />
        </Reveal>
      </div>
    </Section>
  );
}
