import type { TimelineEntry } from '@/types';

/**
 * EDUCATION — newest first (array order = display order).
 * `start`/`end` are optional. Attach a certificate or results document by listing
 * credential ids in `credentialIds` (use inAchievements: false for school certificates).
 */
export const timeline: TimelineEntry[] = [
  {
    id: 'uoj-computer-science',
    visible: true,
    status: null,
    kind: 'education',
    title: 'Computer Science',
    organisation: 'University of Jaffna',
    location: 'Sri Lanka',
    start: '2023',
    end: null,
    description: null,
    highlights: [],
    credentialIds: [],
  },
  {
    id: 'gce-advanced-level',
    visible: true,
    status: 'completed',
    kind: 'school',
    title: 'GCE Advanced Level (A/L)',
    organisation: null,
    location: null,
    start: null,
    end: null,
    description: null,
    highlights: [],
    credentialIds: [],
  },
  {
    id: 'gce-ordinary-level',
    visible: true,
    status: 'completed',
    kind: 'school',
    title: 'GCE Ordinary Level (O/L)',
    organisation: null,
    location: null,
    start: null,
    end: null,
    description: null,
    highlights: [],
    credentialIds: [],
  },
  {
    id: 'grade-5-scholarship',
    visible: true,
    status: 'completed',
    kind: 'school',
    title: 'Grade 5 Scholarship Examination',
    organisation: null,
    location: null,
    start: null,
    end: null,
    description: null,
    highlights: [],
    credentialIds: [],
  },
];
