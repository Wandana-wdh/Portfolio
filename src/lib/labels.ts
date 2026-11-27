import type { ArtworkVariant, CredentialType, EventType, ExperienceType, ResearchStatus, TimelineKind } from '@/types';
import { formatRange } from './utils';

export const researchStatusLabel: Record<ResearchStatus, string> = {
  'early-stage': 'Early-stage research',
  ongoing: 'Ongoing research',
  completed: 'Completed research',
  published: 'Published research',
};

export const credentialTypeLabel: Record<CredentialType, string> = {
  'confirmation-letter': 'Confirmation letter',
  'skills-credential': 'Skills credential',
  'project-badge': 'Project badge',
  'challenge-completion': 'Challenge completion',
  certificate: 'Certificate',
  specialization: 'Specialization',
  appreciation: 'Appreciation',
  'event-participation': 'Event participation',
  'workshop-participation': 'Workshop participation',
};

/** Filter groups on the Achievements page. */
export type CredentialGroup = 'credentials' | 'recognition' | 'events';

export const credentialGroup: Record<CredentialType, CredentialGroup> = {
  'skills-credential': 'credentials',
  'project-badge': 'credentials',
  'challenge-completion': 'credentials',
  certificate: 'credentials',
  specialization: 'credentials',
  'confirmation-letter': 'recognition',
  appreciation: 'recognition',
  'event-participation': 'events',
  'workshop-participation': 'events',
};

export const credentialGroupLabel: Record<CredentialGroup, string> = {
  credentials: 'Certifications & badges',
  recognition: 'Letters & recognition',
  events: 'Workshops & events',
};

export const timelineKindLabel: Record<TimelineKind, string> = {
  education: 'University',
  school: 'School',
};

export const experienceTypeLabel: Record<ExperienceType, string> = {
  volunteering: 'Volunteering',
  ambassador: 'Ambassador',
  'student-role': 'Student role',
  internship: 'Internship',
  work: 'Work experience',
};

/** Early-stage and ongoing research show a "live" status dot. */
export const isActiveResearch = (status: ResearchStatus) => status === 'early-stage' || status === 'ongoing';

export const eventTypeLabel: Record<EventType, string> = {
  conference: 'Conference',
  bootcamp: 'Bootcamp',
  meetup: 'Meetup',
  workshop: 'Workshop',
  hackathon: 'Hackathon',
  webinar: 'Webinar',
  competition: 'Competition',
  other: 'Event',
};

/** Fallback graphics for cards without a cover photo. */
export const eventArtwork: Record<EventType, ArtworkVariant> = {
  conference: 'network',
  bootcamp: 'blocks',
  meetup: 'pulse',
  workshop: 'grid',
  hackathon: 'circuit',
  webinar: 'waves',
  competition: 'lattice',
  other: 'lattice',
};

export const experienceArtwork: Record<ExperienceType, ArtworkVariant> = {
  volunteering: 'waves',
  ambassador: 'network',
  'student-role': 'lattice',
  internship: 'circuit',
  work: 'grid',
};

/** "2025/2026 term", or the role's date range when no term is set. */
export function roleWhen(v: { term?: string | null; start: string | null; end: string | null }): string | null {
  return v.term?.trim() || formatRange(v.start, v.end);
}
