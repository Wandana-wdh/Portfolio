import type {
  Article,
  Credential,
  Profile,
  Project,
  ResearchProject,
  SkillGroup,
  TimelineEntry,
  VolunteeringEntry,
} from '@/types';

/** Compact reference to a project, used when another record links to it. */
export interface ProjectRef {
  slug: string;
  title: string;
  shortTitle?: string;
}

/** A credential with the visible projects that reference it. */
export interface CredentialView extends Credential {
  relatedProjects: ProjectRef[];
}

/** A timeline entry with its visible attached credentials. */
export interface TimelineView extends TimelineEntry {
  credentials: Credential[];
}

/** A volunteering entry with its visible attached credentials. */
export interface VolunteeringView extends VolunteeringEntry {
  credentials: Credential[];
}

/**
 * Read-only access to portfolio content. Every list method returns only visible
 * entries, in display order — so homepage previews and full pages always agree.
 */
export interface PortfolioRepository {
  getProfile(): Promise<Profile>;
  listProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  /** Credentials shown on the Achievements page. */
  listCredentials(): Promise<CredentialView[]>;
  /** Visible credentials for the given ids, in the given order; unknown/hidden ids are skipped. */
  getCredentials(ids: string[]): Promise<Credential[]>;
  listTimeline(): Promise<TimelineView[]>;
  listVolunteering(): Promise<VolunteeringView[]>;
  listSkillGroups(): Promise<SkillGroup[]>;
  listResearch(): Promise<ResearchProject[]>;
  getResearch(slug: string): Promise<ResearchProject | null>;
  listArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
}
