import {
  Award,
  BadgeCheck,
  CalendarCheck,
  FileCheck2,
  GraduationCap,
  HandHeart,
  Presentation,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { CredentialType } from '@/types';

/** Icon shown for each credential type. */
export const credentialIcon: Record<CredentialType, LucideIcon> = {
  'confirmation-letter': FileCheck2,
  'skills-credential': BadgeCheck,
  'project-badge': Award,
  'challenge-completion': Trophy,
  certificate: BadgeCheck,
  specialization: GraduationCap,
  appreciation: HandHeart,
  'event-participation': CalendarCheck,
  'workshop-participation': Presentation,
};

