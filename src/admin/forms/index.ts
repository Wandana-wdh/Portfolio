import type { ContentCollection } from '@/types';
import { credentialForm } from './CredentialForm';
import { eventForm, volunteeringForm } from './ActivityForms';
import { timelineForm } from './JourneyForms';
import { articleForm, researchForm, skillForm } from './OtherForms';
import { projectForm } from './ProjectForm';
import type { FormDefinition } from './types';

export const forms: Record<ContentCollection, FormDefinition<never>> = {
  projects: projectForm as unknown as FormDefinition<never>,
  credentials: credentialForm as unknown as FormDefinition<never>,
  timeline: timelineForm as unknown as FormDefinition<never>,
  volunteering: volunteeringForm as unknown as FormDefinition<never>,
  events: eventForm as unknown as FormDefinition<never>,
  articles: articleForm as unknown as FormDefinition<never>,
  research: researchForm as unknown as FormDefinition<never>,
  skills: skillForm as unknown as FormDefinition<never>,
};
