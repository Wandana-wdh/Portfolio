import { ArrowLeft, Compass } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function NotFoundContent() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Compass className="size-7" aria-hidden />
      </span>
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-fg-muted">The page you are looking for may have moved, or the link may be incorrect.</p>
      <Button to="/" className="mt-8" leadingIcon={<ArrowLeft className="size-4" aria-hidden />}>
        Back to home
      </Button>
    </Container>
  );
}

export default function NotFoundPage() {
  useDocumentMeta({ title: 'Page not found', noIndex: true });
  return <NotFoundContent />;
}
