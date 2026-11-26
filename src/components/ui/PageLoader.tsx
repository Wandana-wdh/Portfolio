export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas" role="status" aria-label="Loading">
      <span className="size-8 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
    </div>
  );
}
