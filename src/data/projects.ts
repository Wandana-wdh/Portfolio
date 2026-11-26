import type { Project } from '@/types';

/**
 * PROJECTS — array order is display order (homepage shows the first 3 visible).
 *
 * Add photos: put files in public/images/projects/<slug>/ and fill `cover`
 * and `gallery` (alt text required, caption/description optional).
 * Add `repositories` only for public GitHub repos — the GitHub buttons appear
 * automatically when the list is non-empty.
 */
export const projects: Project[] = [
  {
    id: 'cems',
    visible: true,
    slug: 'civil-engineering-management-system',
    title: 'Civil Engineering Management System (CEMS)',
    shortTitle: 'CEMS',
    summary:
      'A team-built management system with role-based access and dashboards for engineering and administrative users.',
    description: [
      'CEMS is a team project: a management system that serves both engineering and administrative users, each with access to the views and tools relevant to their role.',
    ],
    category: 'Web Application',
    tech: ['React', 'Protected Routes', 'Role-Based Access', 'Dashboards'],
    highlights: [
      'Separate dashboards for engineering and administrative users',
      'Role-based access to protected areas of the application',
    ],
    contribution: [
      'Implemented protected React routes for role-based access.',
      'Updated the dashboards for engineering and administrative users.',
    ],
    role: 'Team member',
    team: true,
    year: null,
    cover: null,
    gallery: [],
    artwork: 'grid',
    repositories: [],
    liveUrl: null,
    credentialIds: ['cems-confirmation-letter'],
  },
  {
    id: 'hospital-e-channeling',
    visible: true,
    slug: 'hospital-e-channeling-system',
    title: 'Hospital E-Channeling System',
    summary: 'An e-channeling system for finding doctors and booking hospital appointments online.',
    // Add a description, your role, tech stack, photos and repository links.
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
    artwork: 'pulse',
    repositories: [],
    liveUrl: null,
    credentialIds: [],
  },
  {
    id: 'edge-azure-iot',
    visible: true,
    slug: 'edge-azure-iot-department-automation',
    title: 'Edge and Azure IoT Department Automation',
    summary:
      'A cloud–edge IoT design for a smart campus: simulated room sensors, an edge rule engine and Azure cloud reporting.',
    description: [
      'Coursework on designing a smart campus solution with cloud–edge integration. The submission covers an architecture design, business continuity and disaster recovery (BCDR) techniques, a BANT analysis, and working Python code.',
      'The code simulates temperature and occupancy sensors, runs an edge rule engine that raises alerts when a room exceeds 30 °C, uploads data to the cloud, and produces room occupancy and temperature reports.',
    ],
    category: 'IoT & Cloud',
    tech: ['Python', 'Microsoft Azure', 'MQTT / HTTPS', 'Edge Computing'],
    highlights: [
      'Sensor simulation for temperature and occupancy',
      'Edge rule engine with temperature alerts',
      'Cloud upload and reporting',
      'Architecture, BCDR and BANT analysis',
    ],
    contribution: [],
    role: null,
    team: false,
    year: '2026',
    cover: null,
    gallery: [],
    artwork: 'circuit',
    repositories: [{ label: 'Source code', url: 'https://github.com/Wandana-wdh/Edge-Assignment-2025' }],
    liveUrl: null,
    credentialIds: [],
  },
];
