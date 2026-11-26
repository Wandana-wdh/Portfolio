import type { Article } from '@/types';

/**
 * ARTICLES — array order = display order (the first visible article is featured).
 * For a Medium story set `url` to the direct story link; while `url` is null the
 * card shows "View my Medium profile" instead of "Read on Medium".
 * Add `publishedAt`, `readingMinutes` and `cover` only when you know them.
 */
export const articles: Article[] = [
  {
    id: 'trust-without-trusting',
    visible: true,
    slug: 'trust-without-trusting',
    title: 'Trust Without Trusting',
    excerpt: 'How cryptography is reshaping trust in the digital world.',
    category: 'Cryptography',
    url: 'https://medium.com/@wandanaherath.wdh/trust-without-trusting-f8ef1e744176',
    publishedAt: '2026-11-25',
    // Add the reading time shown on Medium, e.g. 3.
    readingMinutes: null,
    cover: {
      src: 'https://cdn-images-1.medium.com/v2/resize:fit:1024/1*r5FEZX9DcHzAnkEDsaNBxw.png',
      alt: 'Illustration of two hands reaching toward a glowing geometric network between them',
      width: 1024,
      height: 576,
    },
    artwork: 'lattice',
    tags: ['Zero-Knowledge Proofs', 'Digital Privacy', 'Cryptography', 'Cybersecurity', 'Blockchain'],
    body: [],
  },
];
