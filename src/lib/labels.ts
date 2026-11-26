import type { CredentialType, ResearchStatus, TimelineKind } from '@/types';

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
  internship: 'Internship',
  experience: 'Experience',
};

/** Early-stage and ongoing research show a "live" status dot. */
export const isActiveResearch = (status: ResearchStatus) => status === 'early-stage' || status === 'ongoing';
