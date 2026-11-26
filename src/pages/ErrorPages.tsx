import { AlertTriangle, RotateCcw } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { NotFoundContent } from './NotFoundPage';

function ErrorContent() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
        <AlertTriangle className="size-7" aria-hidden />
      </span>
      <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-fg-muted">An unexpected error occurred while loading this page.</p>
      <Button className="mt-8" onClick={() => window.location.reload()} leadingIcon={<RotateCcw className="size-4" aria-hidden />}>
        Try again
      </Button>
    </Container>
  );
}

/** Rendered inside the layout for errors in a page or its loader. */
export function RouteErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  useDocumentMeta({ title: is404 ? 'Page not found' : 'Error', noIndex: true });
  if (!is404 && import.meta.env.DEV) console.error(error);
  return is404 ? <NotFoundContent /> : <ErrorContent />;
}

/** Last-resort fallback when the root layout itself fails (no navbar/footer). */
export function RootErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);
  return (
    <main className="min-h-dvh bg-canvas">
      <ErrorContent />
    </main>
  );
}
