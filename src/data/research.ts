import type { ResearchProject } from '@/types';

/**
 * UNDERGRADUATE RESEARCH — shown only on the Research pages.
 * Array order = display order; `visible: false` hides an entry.
 */
export const researchProjects: ResearchProject[] = [
  {
    id: 'zk-mangrove',
    visible: true,
    slug: 'zk-mangrove',
    title: 'ZK-Mangrove',
    summary:
      'I’m exploring whether zero-knowledge proofs can help verify mangrove biomass estimates while keeping underlying measurements private.',
    description: [
      'I’m exploring whether zero-knowledge proofs can help verify mangrove biomass estimates while keeping underlying measurements private.',
      'Mangrove biomass estimates support conservation and sustainability reporting, but the measurements behind them can be sensitive and the resulting claims are hard for others to check. A zero-knowledge proof could let someone show that an estimate was computed correctly without revealing the measurements themselves.',
    ],
    status: 'early-stage',
    startDate: null,
    institution: 'University of Jaffna',
    supervisor: null,
    areas: ['Zero-Knowledge Proofs', 'Privacy-Preserving Verification', 'Mangrove Biomass Estimation', 'Environmental Sustainability'],
    tags: ['ZK Proofs', 'Privacy', 'Biomass Estimation', 'Sustainability'],
    questions: [
      'Can a zero-knowledge proof show that a mangrove biomass estimate was computed correctly?',
      'Can that verification work while keeping the underlying measurements private?',
    ],
    methodology: [],
    links: [],
    cover: null,
    artwork: 'waves',
  },
];
