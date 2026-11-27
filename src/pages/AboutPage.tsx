import { ArrowRight, Download, MapPin } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useProfile } from '@/hooks/useProfile';
import { AboutDetails } from '@/components/sections/AboutDetails';
import { SkillGrid } from '@/components/sections/SkillGrid';
import { Timeline } from '@/components/sections/Timeline';
import { VolunteeringList } from '@/components/sections/Volunteering';
import { EventsList } from '@/components/sections/Events';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Portrait } from '@/components/ui/Portrait';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { aboutLoader, LoaderData } from './loaders';

export default function AboutPage() {
  const profile = useProfile();
  const { skills, timeline, volunteering, events } = useLoaderData() as LoaderData<typeof aboutLoader>;
  useDocumentMeta({
    title: 'About',
    description: `About ${profile.name} — background, skills, education, volunteering and experience, and events.`,
    type: 'profile',
  });

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={<>Building software people can work with.</>}
        description={profile.intro}
      />

      <Section labelledBy="profile-title">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <Portrait image={profile.portrait} name={profile.name} className="mx-auto max-w-xs lg:mx-0" />
            <div className="mt-10 space-y-2 text-sm">
              <h2 id="profile-title" className="text-2xl font-semibold">
                {profile.name}
              </h2>
              <p className="text-fg-muted">{profile.headline}</p>
              <p className="flex items-center gap-2 text-fg-subtle">
                <MapPin className="size-4" aria-hidden /> {profile.institution}, {profile.location}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/contact" size="sm" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                Get in touch
              </Button>
              {profile.cvUrl && (
                <Button href={profile.cvUrl} download variant="secondary" size="sm" leadingIcon={<Download className="size-4" aria-hidden />}>
                  Download CV
                </Button>
              )}
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-xl leading-relaxed text-fg sm:text-2xl sm:leading-relaxed">{profile.about.intro}</p>
            </Reveal>
            <div className="mt-12">
              <AboutDetails about={profile.about} />
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="skills-title" className="border-y border-line bg-surface">
        <SectionHeading id="skills-title" eyebrow="Technical Expertise" title="Skills and technologies" />
        <SkillGrid groups={skills} />
      </Section>

      {timeline.length > 0 && (
        <Section id="education" labelledBy="education-title">
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              id="education-title"
              eyebrow="Education"
              title="From school to university"
              description="University studies and school examinations, newest first."
            />
            <Timeline entries={timeline} />
          </div>
        </Section>
      )}

      {volunteering.length > 0 && (
        <Section id="volunteering" labelledBy="volunteering-title" className="border-t border-line bg-surface">
          <SectionHeading
            id="volunteering-title"
            eyebrow="Experience"
            title="Volunteering & Experience"
            description="Roles where I’ve contributed beyond coursework."
          />
          <VolunteeringList entries={volunteering} />
        </Section>
      )}

      {events.length > 0 && (
        <Section
          id="events"
          labelledBy="events-title"
          className={volunteering.length > 0 ? 'border-t border-line' : 'border-t border-line bg-surface'}
        >
          <SectionHeading
            id="events-title"
            eyebrow="Participation"
            title="Events & Participation"
            description="Conferences, bootcamps, meetups and workshops I’ve taken part in."
          />
          <EventsList entries={events} />
        </Section>
      )}
    </>
  );
}
