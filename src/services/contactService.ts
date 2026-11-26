import type { ContactMessage } from '@/types';

export type ContactResult = { ok: true } | { ok: false; error: string };

/**
 * Hands a contact-form message to the visitor's email app, addressed to `to`.
 *
 * The site has no backend in this phase, so nothing is stored or sent from the
 * server — the visitor sends the pre-filled email themselves. To deliver
 * messages directly later, replace this with a form service or API call.
 */
export async function submitContactMessage(message: ContactMessage, to: string): Promise<ContactResult> {
  try {
    const body = `${message.message}\n\n— ${message.name} (${message.email})`;
    const href = `mailto:${to}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not open your email app.' };
  }
}
