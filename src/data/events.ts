import type { EventEntry } from '@/types';

/**
 * EVENTS & PARTICIPATION — events, meetups, bootcamps and workshops attended
 * (array order = display order). Leave anything unconfirmed as null. Each entry
 * has its own page at /events/<slug> with an optional recap and photo gallery.
 * `credentialIds` link to participation certificates in credentials.ts.
 */
const blank = { recap: [], cover: null, gallery: [], url: null, credentialIds: [] as string[] };

export const events: EventEntry[] = [
  {
    ...blank,
    id: 'yarl-dreamin-25',
    visible: true,
    slug: 'yarl-dreamin-25',
    title: 'Yarl Dreamin’ 25',
    type: 'conference',
    organiser: null,
    location: 'Jaffna',
    date: null,
    description:
      'I joined the Salesforce community in Jaffna for sessions on Agentforce, Apex trigger frameworks, data quality, and real-time integrations. I also had the chance to meet fellow Trailblazers and exchange ideas about how they use Salesforce in their work.',
  },
  {
    ...blank,
    id: 'yarlinsight-2',
    visible: true,
    slug: 'yarlinsight-2',
    title: 'YarlInsight 2.0',
    type: 'bootcamp',
    organiser: 'IEEE Student Branch, University of Jaffna',
    location: null,
    date: null,
    description:
      'I took part in a two-day, hands-on bootcamp on full-stack web development with MongoDB, Express.js, React, and Node.js. I learned from industry mentors and worked alongside other students as we explored practical development approaches.',
  },
  {
    ...blank,
    id: 'aws-meetup-yarl-salesforce-ohana',
    visible: true,
    slug: 'aws-meetup-yarl-salesforce-ohana',
    title: 'AWS Meetup with Yarl Salesforce Ohana',
    type: 'meetup',
    organiser: null,
    location: null,
    date: null,
    description:
      'I joined a hands-on AWS meetup with sessions led by Gnanakeethan B. and Parathan Thiyagalingam. It was a chance to learn more about cloud computing and connect with others exploring AWS.',
  },
  {
    ...blank,
    id: 'aws-career-meetup',
    visible: true,
    slug: 'aws-career-meetup',
    title: 'Level Up on the Cloud: Building Your AWS Career',
    type: 'meetup',
    organiser: null,
    location: null,
    date: '2026-02',
    description: null,
    credentialIds: ['aws-meetup-level-up-cloud'],
  },
  {
    ...blank,
    id: 'joomla-cms-workshop',
    visible: true,
    slug: 'joomla-cms-workshop',
    title: 'Joomla CMS Training Workshop',
    type: 'workshop',
    organiser: 'Nenasala Sri Lanka',
    location: null,
    date: '2023-01',
    description: null,
    credentialIds: ['joomla-workshop'],
  },
];
