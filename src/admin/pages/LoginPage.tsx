import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { SetupNotice } from '../components/SetupNotice';
import { TextField } from '../components/fields';
import { AdminError, isOwner, signIn } from '../lib/api';

/** Already signed in as the owner → straight to the dashboard. */
export async function loader() {
  if (isSupabaseConfigured && (await isOwner())) throw redirect('/admin');
  return null;
}

const safeNext = (next: string | null) => (next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin');

export function Component() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get('error') === 'not-owner' ? 'This account is not approved to edit the site.' : null);
  useDocumentMeta({ title: 'Sign in', noIndex: true });

  if (!isSupabaseConfigured) return <SetupNotice />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) {
      setError(err instanceof AdminError ? err.message : 'Sign-in failed. Try again.');
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <LockKeyhole className="size-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-semibold">Owner sign-in</h1>
          <p className="mt-2 text-sm text-fg-muted">Sign in to edit and publish the portfolio.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
          {params.get('signed-out') && !error && (
            <p role="status" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
              You have been signed out.
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <TextField label="Email" type="email" name="email" autoComplete="username" value={email} onChange={setEmail} required />
          <TextField label="Password" type="password" name="password" autoComplete="current-password" value={password} onChange={setPassword} required />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-fg-muted hover:text-accent">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
