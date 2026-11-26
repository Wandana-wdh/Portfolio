import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye, LogOut, Rocket } from 'lucide-react';
import { NavLink, Outlet, redirect, ScrollRestoration, useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { cn, formatDate } from '@/lib/utils';
import { exitPreview } from '@/services';
import { AdminContext, type AdminContextValue } from '../AdminContext';
import { PublishDialog } from '../components/PublishDialog';
import { SetupNotice } from '../components/SetupNotice';
import { currentUserEmail, isOwner, publishStatus, signOut } from '../lib/api';
import { collectionOrder, collections } from '../lib/collections';

/** Route guard: signed-out visitors go to the login page; non-owners are signed out. */
export async function loader({ request }: LoaderFunctionArgs) {
  if (!isSupabaseConfigured) return { configured: false as const, email: '' };
  const email = await currentUserEmail();
  if (!email) {
    const url = new URL(request.url);
    throw redirect(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }
  if (!(await isOwner())) {
    await signOut();
    throw redirect('/admin/login?error=not-owner');
  }
  return { configured: true as const, email };
}

const nav = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/profile', label: 'Profile' },
  ...collectionOrder.map((c) => ({ to: `/admin/${c}`, label: collections[c].label })),
];

export function Component() {
  const { configured, email } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const [status, setStatus] = useState<AdminContextValue['status']>(null);
  const [publishing, setPublishing] = useState(false);
  useDocumentMeta({ title: 'Admin', noIndex: true });

  const refreshStatus = useCallback(() => {
    if (!configured) return;
    publishStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [configured]);

  useEffect(refreshStatus, [refreshStatus]);

  const ctx = useMemo(() => ({ email, status, refreshStatus }), [email, status, refreshStatus]);

  if (!configured) return <SetupNotice />;

  async function handleSignOut() {
    exitPreview();
    await signOut();
    navigate('/admin/login?signed-out=1', { replace: true });
  }

  return (
    <AdminContext.Provider value={ctx}>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-accent-solid focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-accent"
      >
        Skip to content
      </a>
      <div className="min-h-dvh bg-canvas">
        <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <NavLink to="/admin" className="flex items-center gap-2.5 rounded-lg">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-navy font-display text-sm font-bold text-offwhite ring-1 ring-line-strong dark:bg-surface-2">
                WH
              </span>
              <span className="hidden font-display text-sm font-semibold sm:inline">Portfolio admin</span>
            </NavLink>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  'hidden rounded-full px-2.5 py-1 text-xs font-medium md:inline-flex',
                  status?.hasChanges ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-accent-soft text-accent',
                )}
                aria-live="polite"
              >
                {status ? (status.hasChanges ? 'Unpublished changes' : 'All changes published') : 'Checking…'}
              </span>
              <Button
                variant="secondary"
                size="sm"
                href="/?preview=1"
                target="_blank"
                leadingIcon={<Eye className="size-4" aria-hidden />}
                aria-label="Preview drafts (opens the site in a new tab)"
              >
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button size="sm" onClick={() => setPublishing(true)} leadingIcon={<Rocket className="size-4" aria-hidden />}>
                Publish
              </Button>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex size-10 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-red-500/50 hover:text-red-600"
                aria-label="Sign out"
                title={`Sign out (${email})`}
              >
                <LogOut className="size-[18px]" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_1fr] lg:gap-10 lg:py-10">
          <nav aria-label="Admin sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <ul className="flex gap-1 lg:sticky lg:top-24 lg:flex-col">
              {nav.map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                        isActive ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:bg-surface-2/60 hover:text-fg',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 hidden border-t border-line pt-3 lg:block">
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-accent">
                  View public site
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                {status?.published && (
                  <p className="px-3 text-xs text-fg-subtle">Last published {formatDate(status.published.publishedAt.slice(0, 10))}</p>
                )}
              </li>
            </ul>
          </nav>
          <main id="admin-main" tabIndex={-1} className="min-w-0 focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
      <PublishDialog
        open={publishing}
        onClose={() => setPublishing(false)}
        onPublished={refreshStatus}
      />
      <ScrollRestoration />
    </AdminContext.Provider>
  );
}
