import { createContext, useContext } from 'react';
import type { PublishedInfo } from './lib/api';

export interface AdminContextValue {
  email: string;
  status: { published: PublishedInfo | null; hasChanges: boolean } | null;
  refreshStatus: () => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside the admin layout');
  return ctx;
}
