import type { EventEntry } from '@/types';

/**
 * EVENTS & PARTICIPATION — events, meetups and workshops attended, newest first
 * (array order = display order). Leave anything unconfirmed as null.
 * `credentialIds` link to participation certificates in credentials.ts.
 */
export const events: EventEntry[] = [
  {
    id: 'aws-career-meetup',
    visible: true,
    title: 'Level Up on the Cloud: Building Your AWS Career',
    organiser: null,
    date: '2026-02',
    description: null,
    url: null,
    credentialIds: ['aws-meetup-level-up-cloud'],
  },
  {
    id: 'joomla-cms-workshop',
    visible: true,
    title: 'Joomla CMS Training Workshop',
    organiser: 'Nenasala Sri Lanka',
    date: '2023-01',
    description: null,
    url: null,
    credentialIds: ['joomla-workshop'],
  },
];
