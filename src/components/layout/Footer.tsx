import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mainNav } from '@/data/site';
import { useProfile } from '@/hooks/useProfile';
import { Container } from '@/components/ui/Container';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Logo } from './Logo';

export function Footer() {
  const profile = useProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo name={profile.name} />
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              {profile.headline} · {profile.supportingLine}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle">Navigate</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-fg-muted transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle">Connect</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {profile.socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.href}
                    target={s.platform === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-fg-muted transition-colors hover:text-accent"
                  >
                    <SocialIcon platform={s.platform} className="size-4" />
                    {s.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono">Built with React, TypeScript &amp; Tailwind CSS</p>
        </div>
      </Container>
    </footer>
  );
}
