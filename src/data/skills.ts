import type { SkillGroup } from '@/types';

/**
 * SKILLS — based on the LinkedIn skills list, GitHub profile and project work.
 * Array order = display order; `visible: false` hides a group.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    visible: true,
    title: 'Programming Languages',
    description: 'Languages used in coursework and projects.',
    icon: 'code',
    skills: ['Java', 'Python', 'JavaScript', 'C'],
  },
  {
    id: 'frontend',
    visible: true,
    title: 'Frontend Development',
    description: 'Interfaces built around how different users work.',
    icon: 'layout',
    skills: ['React', 'Protected Routes', 'Role-Based Dashboards', 'HTML', 'CSS'],
    emphasised: true,
  },
  {
    id: 'backend',
    visible: true,
    title: 'Backend Development',
    description: 'APIs and server-side application logic.',
    icon: 'server',
    skills: ['Node.js', 'Express', 'REST APIs'],
  },
  {
    id: 'databases',
    visible: true,
    title: 'Databases',
    description: 'Document and relational data.',
    icon: 'database',
    skills: ['MongoDB', 'MySQL'],
  },
  {
    id: 'cloud',
    visible: true,
    title: 'Cloud & Infrastructure',
    description: 'Cloud services, edge computing and servers.',
    icon: 'cloud',
    skills: ['Amazon Web Services (AWS)', 'AWS Lambda', 'Microsoft Azure', 'Apache'],
  },
  {
    id: 'quality',
    visible: true,
    title: 'Testing & Documentation',
    description: 'Making software dependable and understandable.',
    icon: 'test',
    skills: ['Software Testing', 'API Testing with Postman', 'Documentation'],
  },
  {
    id: 'tools',
    visible: true,
    title: 'Development Tools',
    description: 'Everyday tooling for collaboration and delivery.',
    icon: 'wrench',
    skills: ['Git', 'GitHub', 'VS Code', 'Postman', 'Linux'],
  },
];
