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
    featured: true,
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
    featured: true,
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
    featured: true,
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
  {
    id: 'personal-portfolio',
    visible: true,
    featured: true,
    slug: 'personal-portfolio-website',
    title: 'Personal Portfolio & Content Dashboard',
    summary:
      'A responsive portfolio for my projects, education, certificates, and writing, with a private dashboard for editing content and publishing updates.',
    description: [
      'A responsive portfolio for my projects, education, volunteering, events, certificates and writing, with light and dark themes. It is built with React, TypeScript, Vite and Tailwind CSS.',
      'Behind the public pages is a private content dashboard. I sign in with Supabase Auth, edit content, upload certificates and photos to Supabase Storage, save my changes as drafts, preview the whole site with those drafts, and publish when it is ready — without changing code or redeploying.',
      'Content is stored in PostgreSQL on Supabase, with Row Level Security so that only my account can change it. I connected the GitHub repository to Vercel, which builds and deploys code changes automatically.',
    ],
    category: 'Web Application',
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'GitHub', 'Vercel'],
    highlights: [
      'Responsive pages with light and dark themes',
      'Owner-only sign-in with Supabase Auth',
      'Save, preview and publish workflow',
      'Certificate and photo uploads with Supabase Storage',
      'Row Level Security on the database and file storage',
      'Content updates without redeploying',
    ],
    contribution: [
      'Connected the GitHub repository to Vercel for automatic deployments.',
      'Set up the Supabase project: ran the database migrations, created the owner account and turned off public sign-up.',
      'Configured the site’s Supabase settings in Vercel, and keep the content up to date through the private editor.',
    ],
    role: null,
    team: false,
    year: '2026',
    cover: {
      src: '/images/projects/personal-portfolio/cover.webp',
      alt: 'Homepage of the portfolio website in dark mode, showing the hero introduction and a featured project card',
      width: 1600,
      height: 900,
    },
    gallery: [
      {
        src: '/images/projects/personal-portfolio/projects-page.webp',
        alt: 'Projects page in light mode with three equal-size project cards and category filters',
        width: 1600,
        height: 900,
        caption: 'Projects page in light mode',
      },
      {
        src: '/images/projects/personal-portfolio/education-mobile.webp',
        alt: 'The Education section on a phone, showing university and school entries on a vertical timeline',
        width: 1600,
        height: 900,
        caption: 'Education section on a phone',
      },
      {
        src: '/images/projects/personal-portfolio/admin-project-editor.webp',
        alt: 'The private editor in dark mode, editing a project’s title, page URL, category and year',
        width: 1600,
        height: 900,
        caption: 'Editing a project in the private editor',
      },
      {
        src: '/images/projects/personal-portfolio/admin-certificate-upload.webp',
        alt: 'The New certificate dialog with title, issuer, type, issue date, a PDF or image upload and the List on the Achievements page switch',
        width: 1600,
        height: 900,
        caption: 'Adding a certificate with its file',
      },
      {
        src: '/images/projects/personal-portfolio/admin-publish.webp',
        alt: 'The Publish changes dialog explaining that saved drafts will replace the public site',
        width: 1600,
        height: 900,
        caption: 'Publishing saved drafts',
      },
    ],
    artwork: 'lattice',
    repositories: [],
    liveUrl: 'https://wandana.vercel.app',
    credentialIds: [],
  },
];
