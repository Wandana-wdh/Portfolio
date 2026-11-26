import { useRouteLoaderData } from 'react-router-dom';
import type { Profile } from '@/types';
import type { ContentMode } from '@/services';

export interface RootLoaderData {
  profile: Profile;
  mode: ContentMode;
  publishedAt: string | null;
}

/** Profile loaded once by the root route — available on every page. */
export function useProfile(): Profile {
  const data = useRouteLoaderData('root') as RootLoaderData | undefined;
  if (!data) throw new Error('useProfile must be used inside the root route');
  return data.profile;
}
