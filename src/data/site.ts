import type { NavItem, SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'Wandana Herath',
  // Update to the production domain once deployed on Vercel.
  url: 'https://wandana-herath.vercel.app',
  defaultTitle: 'Wandana Herath — Computer Science Undergraduate',
  titleTemplate: '%s · Wandana Herath',
  description:
    'Portfolio of Wandana Herath, a Computer Science undergraduate at the University of Jaffna, Sri Lanka — software projects, credentials, writing and experience.',
  ogImage: null,
  mediumProfileUrl: 'https://medium.com/@wandanaherath.wdh',
};

export const mainNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Research', to: '/research' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Articles', to: '/articles' },
  { label: 'Contact', to: '/contact' },
];
