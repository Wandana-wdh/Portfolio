import {
  articles,
  credentials,
  events,
  profile,
  projects,
  researchProjects,
  skillGroups,
  timeline,
  volunteering,
} from '@/data';
import type { SiteContent } from '@/types';

/**
 * The bundled content in src/data — used before Supabase is configured and as
 * the source for the initial database import (scripts/generate-import.ts).
 */
export function staticSiteContent(): SiteContent {
  return structuredClone({
    profile,
    projects,
    credentials,
    articles,
    timeline,
    volunteering,
    events,
    skills: skillGroups,
    research: researchProjects,
  });
}
