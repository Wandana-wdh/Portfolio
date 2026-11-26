/**
 * Domain models for the portfolio.
 *
 * Content is edited in /admin (Supabase) — src/data/ holds the initial import and
 * the offline fallback. Conventions shared by every list:
 *  - `id`       stable identifier — other records reference entries by id.
 *  - `visible`  false hides the entry everywhere (homepage previews and full pages).
 *  - array order is display order — move a record up or down to reorder it.
 * Dates are ISO strings: "YYYY", "YYYY-MM" or "YYYY-MM-DD".
 * File references are a full URL, a path under /public ("/cv/x.pdf") or an
 * uploaded file ("uploads/...") which is resolved to a storage URL at load time.
 */

export interface Listable {
  id: string;
  visible: boolean;
}

export interface ImageAsset {
  /** Path under /public (e.g. "/images/projects/cems/cover.webp") or a full URL. */
  src: string;
  /** Describe what the image shows — read aloud by screen readers. */
  alt: string;
  width?: number;
  height?: number;
}

/** A project screenshot with optional caption (short) and description (longer). */
export interface GalleryImage extends ImageAsset {
  caption?: string;
  description?: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

/** A downloadable file (PDF/image) such as a certificate or letter. */
export interface Attachment {
  label: string;
  /** Path under /public, e.g. "/documents/al-certificate.pdf". */
  href: string;
}

/** Generated cover-art style used when no real image has been provided. */
export type ArtworkVariant = 'network' | 'circuit' | 'lattice' | 'blocks' | 'waves' | 'grid' | 'pulse';

export type SocialPlatform = 'github' | 'linkedin' | 'medium' | 'email' | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
  /** Visible handle, e.g. "github.com/username". */
  handle: string;
}

export interface AboutContent {
  /** Main About introduction (one paragraph). */
  intro: string;
  /** Optional — the row is hidden when empty. */
  academicBackground: string;
  professionalInterests: string[];
  careerAspirations: string;
}

export interface Profile {
  name: string;
  /** Main professional headline, e.g. "Computer Science Undergraduate". */
  headline: string;
  /** Supporting line under the headline, e.g. "University of Jaffna, Sri Lanka". */
  supportingLine: string;
  /** Short hero introduction. */
  intro: string;
  institution: string;
  location: string;
  availability: string | null;
  portrait: ImageAsset | null;
  /** Path to the CV PDF under /public, or null to disable the Download CV button. */
  cvUrl: string | null;
  email: string;
  socials: SocialLink[];
  /** Short labels shown in the strip under the hero. */
  focusAreas: string[];
  about: AboutContent;
}

// ---------------------------------------------------------------- Projects

export type ProjectCategory = 'Web Application' | 'IoT & Cloud' | 'Mobile' | 'Other';

export interface ProjectRepository {
  /** e.g. "Frontend", "Backend" or "Source code". */
  label: string;
  url: string;
}

export interface Project extends Listable {
  /** URL segment: /projects/<slug>. Changing it changes the page URL. */
  slug: string;
  title: string;
  /** Optional short name used in compact links, e.g. "CEMS". */
  shortTitle?: string;
  summary: string;
  description: string[];
  category: ProjectCategory;
  tech: string[];
  highlights: string[];
  /** Your own contribution — especially important for team projects. */
  contribution: string[];
  role: string | null;
  team: boolean;
  year: string | null;
  /** Shown on the card and at the top of the detail page. */
  cover: ImageAsset | null;
  /** Screenshots shown on the detail page (zero, one or many). */
  gallery: GalleryImage[];
  /** Fallback graphic used when there is no cover image. */
  artwork: ArtworkVariant;
  /** Public repositories only — buttons appear only when this list is non-empty. */
  repositories: ProjectRepository[];
  liveUrl: string | null;
  /** Ids of related records in credentials.ts (e.g. a confirmation letter). */
  credentialIds: string[];
}

// ---------------------------------------------------------------- Credentials

export type CredentialType =
  | 'confirmation-letter'
  | 'skills-credential'
  | 'project-badge'
  | 'challenge-completion'
  | 'certificate'
  | 'specialization'
  | 'appreciation'
  | 'event-participation'
  | 'workshop-participation';

export interface CredentialCourse {
  title: string;
  issueDate: string | null;
  credentialId: string | null;
  verifyUrl: string | null;
}

export interface Credential extends Listable {
  type: CredentialType;
  title: string;
  issuer: string;
  issueDate: string | null;
  credentialId: string | null;
  /** Official verification page. Never an image URL. */
  verifyUrl: string | null;
  /** Badge or certificate image. Never a verification URL. */
  image: ImageAsset | null;
  /** Public-safe copy of the document (usually a PDF), if approved. */
  document: Attachment | null;
  /** Optional details, e.g. the courses inside a specialization. */
  courses: CredentialCourse[];
  /** List it on the Achievements page. Linked entries (projects, education, experience, events) show it either way. */
  inAchievements: boolean;
  note: string | null;
}

// ---------------------------------------------------------------- Education, experience & events

/** University or school. (Stored in the "timeline" collection.) */
export type TimelineKind = 'education' | 'school';

/** An Education entry, e.g. a degree, A/L or O/L. */
export interface TimelineEntry extends Listable {
  kind: TimelineKind;
  title: string;
  organisation: string | null;
  location: string | null;
  start: string | null;
  /** null = ongoing ("Present") when `start` is set. */
  end: string | null;
  description: string | null;
  highlights: string[];
  /** Ids of credentials (certificates or results documents) attached to this entry. */
  credentialIds: string[];
}

export type ExperienceType = 'volunteering' | 'ambassador' | 'student-role' | 'internship' | 'work';

/** Volunteering & Experience — roles where you contributed. */
export interface VolunteeringEntry extends Listable {
  type: ExperienceType;
  role: string;
  organisation: string;
  start: string | null;
  end: string | null;
  /** Only add duties or outcomes supported by your own materials. */
  description: string | null;
  highlights: string[];
  /** Optional link to evidence (e.g. a post or programme page). */
  url: string | null;
  /** Ids of credentials attached to this role (e.g. a certificate of appreciation). */
  credentialIds: string[];
}

/** Events & Participation — events, meetups and workshops you attended. */
export interface EventEntry extends Listable {
  /** Event name. */
  title: string;
  organiser: string | null;
  date: string | null;
  description: string | null;
  /** Optional event page. */
  url: string | null;
  /** Ids of credentials attached (e.g. a participation certificate). */
  credentialIds: string[];
}

// ---------------------------------------------------------------- Skills

export type SkillIcon = 'code' | 'layout' | 'server' | 'database' | 'cloud' | 'test' | 'wrench';

export interface SkillGroup extends Listable {
  title: string;
  description: string;
  icon: SkillIcon;
  skills: string[];
  /** Highlight this group (spans two columns on wide screens). */
  emphasised?: boolean;
}

// ---------------------------------------------------------------- Research

export type ResearchStatus = 'early-stage' | 'ongoing' | 'completed' | 'published';

export interface ResearchProject extends Listable {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  status: ResearchStatus;
  startDate: string | null;
  institution: string;
  supervisor: string | null;
  areas: string[];
  tags: string[];
  questions: string[];
  methodology: string[];
  links: LinkItem[];
  cover: ImageAsset | null;
  artwork: ArtworkVariant;
}

// ---------------------------------------------------------------- Articles

export type ArticleCategory =
  | 'Cryptography'
  | 'Software Engineering'
  | 'Web Development'
  | 'Cloud'
  | 'Cybersecurity'
  | 'Career';

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'callout'; text: string };

export interface Article extends Listable {
  /** URL segment: /articles/<slug>. */
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  /** Direct link to the story (e.g. on Medium). null → "View my Medium profile". */
  url: string | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  cover: ImageAsset | null;
  artwork: ArtworkVariant;
  tags: string[];
  /** Optional on-site content. Leave empty for articles hosted on Medium. */
  body: ArticleBlock[];
}

// ---------------------------------------------------------------- Site

/** Everything the public site renders — one published snapshot. */
export interface SiteContent {
  profile: Profile;
  projects: Project[];
  credentials: Credential[];
  articles: Article[];
  /** Education entries. */
  timeline: TimelineEntry[];
  /** Volunteering & Experience. */
  volunteering: VolunteeringEntry[];
  /** Events & Participation. */
  events: EventEntry[];
  skills: SkillGroup[];
  research: ResearchProject[];
}

export type ContentCollection = Exclude<keyof SiteContent, 'profile'>;

// ---------------------------------------------------------------- Misc

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NavItem {
  label: string;
  to: string;
}

export interface SiteConfig {
  name: string;
  url: string;
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  ogImage: string | null;
  mediumProfileUrl: string;
}
