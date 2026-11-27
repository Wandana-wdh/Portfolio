import type { ResearchStatus, WorkStatus } from '@/types';
import { researchStatusLabel, workStatusLabel } from '@/lib/labels';

/** Select options for Completed / In Progress; '' = not set (no badge). */
export const workStatusOptions: Array<{ value: WorkStatus | ''; label: string }> = [
  { value: '', label: 'Not set (no badge)' },
  ...(Object.keys(workStatusLabel) as WorkStatus[]).map((value) => ({ value, label: workStatusLabel[value] })),
];

/** Education shows only "Completed" (no In Progress badge). */
export const educationStatusOptions: Array<{ value: WorkStatus | ''; label: string }> = [
  { value: '', label: 'Not set (no badge)' },
  { value: 'completed', label: workStatusLabel.completed },
];

export const researchStatusOptions: Array<{ value: ResearchStatus | ''; label: string }> = [
  { value: '', label: 'Not set (no badge)' },
  { value: 'early-stage', label: researchStatusLabel['early-stage'] },
  { value: 'ongoing', label: researchStatusLabel.ongoing },
  { value: 'completed', label: researchStatusLabel.completed },
  { value: 'published', label: researchStatusLabel.published },
];

export const statusHint = 'Shown as a small badge with an icon: a check for Completed, a clock for In Progress or Early-stage.';
