import type {
  Article,
  ContentCollection,
  Credential,
  EventEntry,
  Project,
  ResearchProject,
  SkillGroup,
  TimelineEntry,
  VolunteeringEntry,
} from '@/types';
import { credentialTypeLabel, experienceTypeLabel, researchStatusLabel, timelineKindLabel } from '@/lib/labels';
import { formatDate, formatRange } from '@/lib/utils';

/** Entry data as stored in the database (id/visible live in their own columns). */
export type EntryData<T> = Omit<T, 'id' | 'visible'>;

export interface CollectionConfig<T = unknown> {
  label: string;
  singular: string;
  description: string;
  /** Row title and subtitle in lists. */
  describe: (data: EntryData<T>) => { title: string; subtitle?: string };
  /** Public page for this entry, if it has one. */
  publicPath?: (data: EntryData<T>) => string;
  create: () => EntryData<T>;
  /** Whether entries have a URL slug. */
  hasSlug?: boolean;
}

export const collections: { [K in ContentCollection]: CollectionConfig } = {
  projects: {
    label: 'Projects',
    singular: 'project',
    description: 'Project cards on the homepage and Projects page, and each project’s page. The order here is the order on the site.',
    hasSlug: true,
    describe: (d) => {
      const p = d as EntryData<Project>;
      return { title: p.title, subtitle: [p.category, p.team ? 'Team project' : null].filter(Boolean).join(' · ') };
    },
    publicPath: (d) => `/projects/${(d as EntryData<Project>).slug}`,
    create: (): EntryData<Project> => ({
      slug: '',
      title: '',
      summary: '',
      description: [],
      category: 'Web Application',
      tech: [],
      highlights: [],
      contribution: [],
      role: null,
      team: false,
      year: null,
      cover: null,
      gallery: [],
      artwork: 'network',
      repositories: [],
      liveUrl: null,
      credentialIds: [],
    }),
  },
  credentials: {
    label: 'Certificates',
    singular: 'certificate',
    description: 'Certificates, badges and letters. The order here is the order on the Achievements page.',
    describe: (d) => {
      const c = d as EntryData<Credential>;
      return {
        title: c.title,
        subtitle: [c.issuer, credentialTypeLabel[c.type], c.inAchievements === false ? 'Not listed on Achievements' : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: () => '/achievements',
    create: (): EntryData<Credential> => ({
      type: 'certificate',
      title: '',
      issuer: '',
      issueDate: null,
      credentialId: null,
      verifyUrl: null,
      image: null,
      document: null,
      courses: [],
      inAchievements: true,
      note: null,
    }),
  },
  timeline: {
    label: 'Education',
    singular: 'education entry',
    description: 'University and school entries in the Education section, newest first. The order here is the order on the site.',
    describe: (d) => {
      const t = d as EntryData<TimelineEntry>;
      return {
        title: t.title,
        subtitle: [timelineKindLabel[t.kind], t.organisation, formatRange(t.start, t.end), t.credentialIds?.length ? 'Certificate attached' : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: () => '/about#education',
    create: (): EntryData<TimelineEntry> => ({
      kind: 'school',
      title: '',
      organisation: null,
      location: null,
      start: null,
      end: null,
      description: null,
      highlights: [],
      credentialIds: [],
    }),
  },
  volunteering: {
    label: 'Volunteering & Experience',
    singular: 'role',
    description: 'Roles where you contributed — volunteering, ambassador and student roles, internships. The order here is the order on the site.',
    describe: (d) => {
      const v = d as EntryData<VolunteeringEntry>;
      return {
        title: v.role,
        subtitle: [experienceTypeLabel[v.type ?? 'volunteering'], v.organisation, formatRange(v.start, v.end)].filter(Boolean).join(' · '),
      };
    },
    publicPath: () => '/about#volunteering',
    create: (): EntryData<VolunteeringEntry> => ({
      type: 'volunteering',
      role: '',
      organisation: '',
      start: null,
      end: null,
      description: null,
      highlights: [],
      url: null,
      credentialIds: [],
    }),
  },
  events: {
    label: 'Events & Participation',
    singular: 'event',
    description: 'Events, meetups and workshops you attended. The order here is the order on the site.',
    describe: (d) => {
      const e = d as EntryData<EventEntry>;
      return { title: e.title, subtitle: [e.organiser, formatDate(e.date)].filter(Boolean).join(' · ') };
    },
    publicPath: () => '/about#events',
    create: (): EntryData<EventEntry> => ({
      title: '',
      organiser: null,
      date: null,
      description: null,
      url: null,
      credentialIds: [],
    }),
  },
  articles: {
    label: 'Articles',
    singular: 'article',
    description: 'Articles on the Articles page. The first visible article is featured.',
    hasSlug: true,
    describe: (d) => {
      const a = d as EntryData<Article>;
      return { title: a.title, subtitle: [a.category, a.url ? 'Medium link' : 'No Medium link yet'].join(' · ') };
    },
    publicPath: () => '/articles',
    create: (): EntryData<Article> => ({
      slug: '',
      title: '',
      excerpt: '',
      category: 'Software Engineering',
      url: null,
      publishedAt: null,
      readingMinutes: null,
      cover: null,
      artwork: 'network',
      tags: [],
      body: [],
    }),
  },
  research: {
    label: 'Research',
    singular: 'research entry',
    description: 'The Undergraduate Research page.',
    hasSlug: true,
    describe: (d) => {
      const r = d as EntryData<ResearchProject>;
      return { title: r.title, subtitle: researchStatusLabel[r.status] };
    },
    publicPath: (d) => `/research/${(d as EntryData<ResearchProject>).slug}`,
    create: (): EntryData<ResearchProject> => ({
      slug: '',
      title: '',
      summary: '',
      description: [],
      status: 'early-stage',
      startDate: null,
      institution: 'University of Jaffna',
      supervisor: null,
      areas: [],
      tags: [],
      questions: [],
      methodology: [],
      links: [],
      cover: null,
      artwork: 'waves',
    }),
  },
  skills: {
    label: 'Skills',
    singular: 'skill group',
    description: 'Skill groups in Technical Expertise.',
    describe: (d) => {
      const s = d as EntryData<SkillGroup>;
      return { title: s.title, subtitle: s.skills.slice(0, 4).join(', ') };
    },
    create: (): EntryData<SkillGroup> => ({ title: '', description: '', icon: 'code', skills: [] }),
  },
};

export const collectionOrder: ContentCollection[] = ['projects', 'credentials', 'timeline', 'volunteering', 'events', 'articles', 'research', 'skills'];

export const isCollection = (value: string | undefined): value is ContentCollection =>
  Boolean(value && value in collections);
