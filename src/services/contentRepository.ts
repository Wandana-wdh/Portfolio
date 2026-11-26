import type { EventEntry, Listable, SiteContent, TimelineEntry, VolunteeringEntry } from '@/types';
import type { PortfolioRepository, ProjectRef } from './portfolioRepository';

/** Returns a copy so callers can never mutate the source data. */
const resolve = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));

/** Visible entries only, in array (display) order. */
const shown = <T extends Listable>(items: T[]): T[] => items.filter((item) => item.visible !== false);

/**
 * Fills in fields added after a snapshot was published, so older published
 * versions keep working until the next publish.
 */
export function normalizeContent(content: SiteContent): SiteContent {
  const c = content as Partial<SiteContent> & Pick<SiteContent, 'profile'>;
  return {
    ...content,
    projects: c.projects ?? [],
    credentials: c.credentials ?? [],
    articles: c.articles ?? [],
    skills: c.skills ?? [],
    research: c.research ?? [],
    timeline: (c.timeline ?? []).map((t): TimelineEntry => ({ ...t, kind: t.kind === 'education' ? 'education' : 'school' })),
    volunteering: (c.volunteering ?? []).map((v): VolunteeringEntry => ({ ...v, type: v.type ?? 'volunteering', url: v.url ?? null })),
    events: (c.events ?? []).map((e): EventEntry => ({ ...e, credentialIds: e.credentialIds ?? [] })),
  };
}

/** Builds the read API over one site snapshot (static, published or preview). */
export function createRepository(snapshot: SiteContent): PortfolioRepository {
  const content = normalizeContent(snapshot);
  const projects = shown(content.projects);
  const credentials = shown(content.credentials);
  const byId = new Map(credentials.map((c) => [c.id, c]));
  const pick = (ids: string[] | undefined) =>
    (ids ?? []).map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const projectsUsing = (credentialId: string): ProjectRef[] =>
    projects
      .filter((p) => p.credentialIds?.includes(credentialId))
      .map((p) => ({ slug: p.slug, title: p.title, shortTitle: p.shortTitle }));

  return {
    getProfile: () => resolve(content.profile),

    listProjects: () => resolve(projects),
    getProject: (slug) => resolve(projects.find((p) => p.slug === slug) ?? null),

    listCredentials: () =>
      resolve(credentials.filter((c) => c.inAchievements !== false).map((c) => ({ ...c, relatedProjects: projectsUsing(c.id) }))),
    getCredentials: (ids) => resolve(pick(ids)),

    listTimeline: () => resolve(shown(content.timeline).map((t) => ({ ...t, credentials: pick(t.credentialIds) }))),
    listVolunteering: () => resolve(shown(content.volunteering).map((v) => ({ ...v, credentials: pick(v.credentialIds) }))),
    listEvents: () => resolve(shown(content.events).map((e) => ({ ...e, credentials: pick(e.credentialIds) }))),

    listSkillGroups: () => resolve(shown(content.skills)),

    listResearch: () => resolve(shown(content.research)),
    getResearch: (slug) => resolve(shown(content.research).find((r) => r.slug === slug) ?? null),

    listArticles: () => resolve(shown(content.articles)),
    getArticle: (slug) => resolve(shown(content.articles).find((a) => a.slug === slug) ?? null),
  };
}
