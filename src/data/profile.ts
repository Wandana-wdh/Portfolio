import type { Profile } from '@/types';

/** Personal details, hero copy and About content. */
export const profile: Profile = {
  name: 'Wandana Herath',
  headline: 'Computer Science Undergraduate',
  supportingLine: 'University of Jaffna, Sri Lanka',
  intro:
    'I’m a Computer Science undergraduate at the University of Jaffna. I enjoy building software around real workflows, from role-based dashboards to department automation.',
  institution: 'University of Jaffna',
  location: 'Sri Lanka',
  // Set to null to hide the pill above the hero.
  availability: 'Open to software and IT internship opportunities',
  // Add a portrait: put the file in public/images/ and set
  // { src: '/images/portrait.webp', alt: 'Portrait of Wandana Herath', width: 800, height: 1000 }
  portrait: null,
  // Add your CV: put the PDF in public/cv/ and set '/cv/Wandana-Herath-CV.pdf'.
  // While null, the Download CV button is shown as unavailable.
  cvUrl: null,
  email: 'wandanaherath.wdh@gmail.com',
  socials: [
    {
      platform: 'github',
      label: 'GitHub',
      href: 'https://github.com/Wandana-wdh',
      handle: 'github.com/Wandana-wdh',
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/wandana-herath-88a3ab264',
      handle: 'linkedin.com/in/wandana-herath-88a3ab264',
    },
    {
      platform: 'medium',
      label: 'Medium',
      href: 'https://medium.com/@wandanaherath.wdh',
      handle: 'medium.com/@wandanaherath.wdh',
    },
    {
      platform: 'email',
      label: 'Email',
      href: 'mailto:wandanaherath.wdh@gmail.com',
      handle: 'wandanaherath.wdh@gmail.com',
    },
  ],
  focusAreas: ['Full-Stack Development', 'React & Node.js', 'Role-Based Access', 'Cloud & Edge', 'Software Testing'],
  about: {
    intro:
      'I’m Wandana Herath, a Computer Science undergraduate at the University of Jaffna. I’m drawn to the practical side of building software: figuring out what different users need and turning that into an interface they can work with. On our Civil Engineering Management System team, I worked on role-based access and dashboards for engineering and administrative users. Outside coursework, I contributed to the IEEE Student Branch finance committee and started sharing what I’m learning through writing.',
    academicBackground:
      'Computer Science undergraduate at the University of Jaffna since 2023, building strong fundamentals in data structures and algorithms and backend development.',
    professionalInterests: [
      'Full-stack web development',
      'Backend development',
      'Role-based dashboards and access control',
      'Cloud and edge computing',
      'Software testing and documentation',
      'Cybersecurity fundamentals',
    ],
    careerAspirations:
      'To grow as a software engineer through real-world development work — starting with a software or IT internship where I can contribute to production code and keep learning by building.',
  },
};
