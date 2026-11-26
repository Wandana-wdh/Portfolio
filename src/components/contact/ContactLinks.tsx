import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Profile } from '@/types';
import { SocialIcon } from '@/components/ui/SocialIcon';

export function ContactLinks({ profile }: { profile: Profile }) {
  return (
    <ul className="space-y-3">
      {profile.socials.map((s) => (
        <li key={s.platform}>
          <a
            href={s.href}
            target={s.platform === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-card-hover"
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg transition-colors group-hover:bg-accent-soft group-hover:text-accent">
              <SocialIcon platform={s.platform} className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                {s.label}
              </span>
              <span className="block truncate text-sm text-fg-muted">{s.handle}</span>
            </span>
            <ArrowUpRight
              className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              aria-hidden
            />
          </a>
        </li>
      ))}
      <li className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2">
          <MapPin className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-semibold">Location</span>
          <span className="block text-sm text-fg-muted">
            {profile.institution}, {profile.location}
          </span>
        </span>
      </li>
    </ul>
  );
}
