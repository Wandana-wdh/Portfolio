import type { VolunteeringEntry } from '@/types';

/**
 * VOLUNTEERING & EXPERIENCE — roles where you contributed (volunteering,
 * ambassador and student roles, internships). Array order = display order.
 * Each entry has its own page at /experience/<slug> with an optional photo gallery.
 * `credentialIds` link to records in credentials.ts (shown on the role's page).
 */
export const volunteering: VolunteeringEntry[] = [
  {
    id: 'ieee-sb-finance-committee',
    visible: true,
    slug: 'ieee-sb-finance-committee',
    type: 'volunteering',
    role: 'Finance Committee Member',
    organisation: 'IEEE Student Branch, University of Jaffna',
    term: '2025/2026 term',
    start: '2025-04',
    end: '2026-01',
    description: 'Served on the finance committee of the IEEE Student Branch at the University of Jaffna.',
    highlights: [],
    url: null,
    credentialIds: ['ieee-appreciation'],
    cover: null,
    gallery: [],
    recap: [],
  },
  {
    id: 'jamborieee-2025-finance-volunteer',
    visible: true,
    slug: 'jamborieee-2025-finance-volunteer',
    type: 'volunteering',
    role: 'Event Volunteer (Finance)',
    organisation: 'JamborIEEE 2025',
    term: null,
    start: null,
    end: null,
    description: 'Supported the finance team at an IEEE event that brought together students from six universities.',
    highlights: [],
    url: null,
    credentialIds: [],
    cover: null,
    gallery: [],
    recap: [],
  },
];
