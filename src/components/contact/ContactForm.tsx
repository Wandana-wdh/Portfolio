import { useId, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import type { ContactMessage } from '@/types';
import { submitContactMessage } from '@/services';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type Errors = Partial<Record<keyof ContactMessage, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY: ContactMessage = { name: '', email: '', subject: '', message: '' };

function validate(values: ContactMessage): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.subject.trim().length < 3) errors.subject = 'Please add a short subject.';
  if (values.message.trim().length < 20) errors.message = 'Please write at least 20 characters.';
  return errors;
}

const inputClass =
  'block w-full rounded-xl border bg-canvas px-4 py-3 text-sm text-fg placeholder:text-fg-subtle ' +
  'transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none';

/** Validates the message, then opens the visitor's email app addressed to `to`. */
export function ContactForm({ to, className }: { to: string; className?: string }) {
  const id = useId();
  const [values, setValues] = useState<ContactMessage>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [honeypot, setHoneypot] = useState('');

  const update = (field: keyof ContactMessage) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot) return; // bot
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as Array<keyof ContactMessage>)[0];
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus();
      return;
    }
    setStatus('submitting');
    const result = await submitContactMessage(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      },
      to,
    );
    setStatus(result.ok ? 'success' : 'error');
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className={cn('flex flex-col items-center rounded-2xl border border-accent/30 bg-accent-soft px-6 py-14 text-center', className)}
      >
        <CheckCircle2 className="size-10 text-accent" aria-hidden />
        <h3 className="mt-4 text-xl font-semibold">Your email is ready</h3>
        <p className="mt-2 max-w-sm text-sm text-fg-muted">
          Your email app should have opened with the message filled in — press send there to reach me. If nothing opened, email me at{' '}
          <a href={`mailto:${to}`} className="font-medium text-accent underline-offset-4 hover:underline">
            {to}
          </a>
          .
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setStatus('idle');
          }}
        >
          Write another message
        </Button>
      </div>
    );
  }

  const field = (name: keyof ContactMessage, label: string, props: { type?: string; autoComplete?: string; placeholder?: string }) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`${id}-${name}`}
        name={name}
        value={values[name]}
        onChange={(e) => update(name)(e.target.value)}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
        className={cn(inputClass, errors[name] ? 'border-red-500/70' : 'border-line-strong')}
        {...props}
      />
      {errors[name] && (
        <p id={`${id}-${name}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn('relative rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8', className)}
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-xl font-semibold">
        Send a message
      </h3>
      <p className="mt-1.5 text-sm text-fg-muted">Internships, project collaboration or a quick question — all welcome.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {field('name', 'Name', { autoComplete: 'name', placeholder: 'Your name' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        <div className="sm:col-span-2">{field('subject', 'Subject', { placeholder: 'What is this about?' })}</div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="mb-2 block text-sm font-medium">
            Message
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={6}
            value={values.message}
            onChange={(e) => update('message')(e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
            placeholder="Tell me a little about your idea or opportunity…"
            className={cn(inputClass, 'resize-y', errors.message ? 'border-red-500/70' : 'border-line-strong')}
          />
          {errors.message && (
            <p id={`${id}-message-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-subtle" role="status" aria-live="polite">
          {status === 'error' ? `Your email app could not be opened. Please email ${to} directly.` : 'Opens your email app with this message ready to send.'}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          trailingIcon={<Mail className="size-4" aria-hidden />}
        >
          Compose Email
        </Button>
      </div>
    </form>
  );
}
