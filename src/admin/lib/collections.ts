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
import { credentialTypeLabel, eventTypeLabel, experienceTypeLabel, researchStatusLabel, roleWhen, timelineKindLabel, workStatusLabel } from '@/lib/labels';
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
      return {
        title: p.title,
        subtitle: [p.featured ? 'Featured' : null, p.status ? workStatusLabel[p.status] : null, p.category, p.team ? 'Team project' : null, p.presentation ? 'Presentation' : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: (d) => `/projects/${(d as EntryData<Project>).slug}`,
    create: (): EntryData<Project> => ({
      slug: '',
      featured: false,
      status: null,
      presentation: null,
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
        subtitle: [timelineKindLabel[t.kind], t.status === 'completed' ? workStatusLabel.completed : null, t.organisation, formatRange(t.start, t.end), t.credentialIds?.length ? 'Certificate attached' : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: () => '/about#education',
    create: (): EntryData<TimelineEntry> => ({
      kind: 'school',
      status: null,
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
    description: 'Roles where you contributed — volunteering, ambassador and student roles, internships. Each has its own page with photos. The order here is the order on the site.',
    hasSlug: true,
    describe: (d) => {
      const v = d as EntryData<VolunteeringEntry>;
      return {
        title: v.role,
        subtitle: [experienceTypeLabel[v.type ?? 'volunteering'], v.organisation, roleWhen(v), v.gallery?.length ? `${v.gallery.length} photo${v.gallery.length === 1 ? '' : 's'}` : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: (d) => `/experience/${(d as EntryData<VolunteeringEntry>).slug}`,
    create: (): EntryData<VolunteeringEntry> => ({
      slug: '',
      type: 'volunteering',
      role: '',
      organisation: '',
      term: null,
      start: null,
      end: null,
      description: null,
      highlights: [],
      url: null,
      credentialIds: [],
      cover: null,
      gallery: [],
      recap: [],
    }),
  },
  events: {
    label: 'Events & Participation',
    singular: 'event',
    description: 'Conferences, bootcamps, meetups and workshops you took part in. Each has its own page with photos. The order here is the order on the site.',
    hasSlug: true,
    describe: (d) => {
      const e = d as EntryData<EventEntry>;
      return {
        title: e.title,
        subtitle: [eventTypeLabel[e.type ?? 'other'], e.organiser, formatDate(e.date), e.gallery?.length ? `${e.gallery.length} photo${e.gallery.length === 1 ? '' : 's'}` : null]
          .filter(Boolean)
          .join(' · '),
      };
    },
    publicPath: (d) => `/events/${(d as EntryData<EventEntry>).slug}`,
    create: (): EntryData<EventEntry> => ({
      slug: '',
      title: '',
      type: 'meetup',
      organiser: null,
      location: null,
      date: null,
      description: null,
      recap: [],
      url: null,
      cover: null,
      gallery: [],
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
      return { title: r.title, subtitle: [r.status ? researchStatusLabel[r.status] : null, r.cover ? 'Cover photo' : null].filter(Boolean).join(' · ') };
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
    label: 'Tools & Technologies',
    singular: 'skill group',
    description: 'Skill groups in the Tools and Technologies section (homepage) and Skills on the About page. The order here is the order on the site.',
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
