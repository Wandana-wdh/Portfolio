import type { ComponentType } from 'react';
import type { Credential } from '@/types';
import type { EntryRow } from '../lib/api';
import type { EntryData } from '../lib/collections';
import type { Errors } from '../lib/validation';

export interface FormProps<T> {
  data: T;
  update: (patch: Partial<T>) => void;
  errors: Errors;
  /** Storage folder for this entry's uploads. */
  folder: string;
  onUploaded: (path: string) => void;
  credentials: Array<EntryRow<EntryData<Credential>>>;
  isNew: boolean;
}

export interface FormDefinition<T> {
  Form: ComponentType<FormProps<T>>;
  validate: (data: T, ctx: { takenSlugs: string[] }) => Errors;
  /** Normalises data before saving (trim, drop empty list items, '' → null). */
  prepare: (data: T) => T;
}
