import type { VolunteeringEntry } from '@/types';

/**
 * VOLUNTEERING & EXPERIENCE — roles where you contributed (volunteering,
 * ambassador and student roles, internships). Array order = display order.
 * `credentialIds` link to records in credentials.ts (omitted cleanly if a
 * record is hidden or deleted). Only add duties/outcomes you can support.
 */
export const volunteering: VolunteeringEntry[] = [
  {
    id: 'ieee-sb-finance-committee',
    visible: true,
    type: 'volunteering',
    role: 'Finance Committee Member',
    organisation: 'IEEE Student Branch, University of Jaffna',
    start: '2025-04',
    end: '2026-01',
    description: null,
    highlights: [],
    url: null,
    credentialIds: ['ieee-appreciation'],
  },
];
