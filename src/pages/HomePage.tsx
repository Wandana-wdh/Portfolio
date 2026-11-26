import { useLoaderData } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useProfile } from '@/hooks/useProfile';
import { Hero } from '@/components/sections/home/Hero';
import {
  AboutSection,
  AchievementsSection,
  ArticlesSection,
  ContactSection,
  EducationSection,
  EventsSection,
  ExperienceSection,
  ExpertiseSection,
  FeaturedProjectsSection,
} from '@/components/sections/home/HomeSections';
import type { homeLoader, LoaderData } from './loaders';

export default function HomePage() {
  const profile = useProfile();
  const data = useLoaderData() as LoaderData<typeof homeLoader>;
  useDocumentMeta({ type: 'profile' });

  return (
    <>
      <Hero profile={profile} featured={data.projects[0] ?? null} />
      <FeaturedProjectsSection projects={data.projects} />
      <AboutSection profile={profile} />
      <ExpertiseSection groups={data.skills} />
      <EducationSection entries={data.timeline} />
      <ExperienceSection entries={data.volunteering} />
      <EventsSection entries={data.events} />
      <AchievementsSection items={data.credentials} total={data.totalCredentials} />
      <ArticlesSection articles={data.articles} />
      <ContactSection profile={profile} />
    </>
  );
}
