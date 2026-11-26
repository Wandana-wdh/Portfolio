import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Shown on /admin when the site is not connected to Supabase yet. */
export function SetupNotice() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Settings2 className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Admin isn’t connected yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Add <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> to the environment (Vercel → Settings →
          Environment Variables, or <code className="font-mono text-xs">.env.local</code> locally), then redeploy. The steps are in{' '}
          <code className="font-mono text-xs">SETUP.md</code>.
        </p>
        <Button to="/" variant="secondary" size="sm" className="mt-6">
          Back to the site
        </Button>
      </div>
    </main>
  );
}
