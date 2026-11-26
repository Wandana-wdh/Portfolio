import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { invalidateSiteContent } from '@/services';
import { AdminError, publishSite, type PublishStep } from '../lib/api';

const stepText = (s: PublishStep) => {
  switch (s.step) {
    case 'preparing':
      return 'Checking your changes…';
    case 'copying':
      return `Copying files to the public site (${s.done + 1} of ${s.total})…`;
    case 'publishing':
      return 'Publishing…';
    case 'cleaning':
      return 'Removing files that are no longer public…';
    case 'done':
      return 'Published.';
  }
};

/** Publishes the drafts and reports each step. */
export function PublishDialog({ open, onClose, onPublished }: { open: boolean; onClose: () => void; onPublished: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<PublishStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = step !== null && step.step !== 'done' && !error;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStep(null);
      setError(null);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  async function run() {
    setError(null);
    try {
      await publishSite(setStep);
      invalidateSiteContent();
      onPublished();
    } catch (e) {
      setError(e instanceof AdminError ? e.message : 'Publishing failed. Nothing was changed on the public site.');
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="publish-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!running) onClose();
      }}
      className="m-auto w-[min(30rem,92vw)] rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-navy/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="publish-title" className="flex items-center gap-2 text-lg font-semibold">
          <Rocket className="size-5 text-accent" aria-hidden />
          Publish changes
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-fg-muted" aria-live="polite">
          {!step && !error && (
            <p>
              Your saved drafts will replace the public site. Hidden entries and their files will no longer be publicly available.
            </p>
          )}
          {step && !error && (
            <p className="flex items-center gap-2 text-fg">
              {step.step === 'done' ? (
                <CheckCircle2 className="size-4 text-accent" aria-hidden />
              ) : (
                <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
              )}
              {stepText(step)}
            </p>
          )}
          {step?.step === 'done' && (
            <p className="mt-2">
              Version {step.version} is live{step.removed > 0 ? ` · ${step.removed} old file${step.removed === 1 ? '' : 's'} removed` : ''}.
              {step.warning && <span className="mt-2 block text-amber-700 dark:text-amber-300">{step.warning}</span>}
            </p>
          )}
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-red-700 dark:text-red-300">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {step?.step === 'done' ? (
            <>
              <Button href="/" variant="secondary" size="sm" target="_blank">
                View site
              </Button>
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onClose} disabled={running}>
                Cancel
              </Button>
              <Button size="sm" onClick={run} disabled={running}>
                {running ? 'Publishing…' : error ? 'Try again' : 'Publish now'}
              </Button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
