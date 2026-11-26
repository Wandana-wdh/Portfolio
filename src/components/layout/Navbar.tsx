import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { mainNav } from '@/data/site';
import { useProfile } from '@/hooks/useProfile';
import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const profile = useProfile();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock scroll, focus the first link and close with Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        // No backdrop-filter while the menu is open: it would become the containing
        // block for the fixed mobile panel and collapse it.
        open
          ? 'border-line bg-canvas'
          : scrolled
            ? 'border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-canvas/0',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo name={profile.name} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative isolate rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-fg' : 'text-fg-muted hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-surface-2"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:text-accent lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-line bg-canvas lg:hidden"
          >
            <Container className="flex min-h-full flex-col py-6">
              <nav aria-label="Mobile">
                <ul className="flex flex-col">
                  {mainNav.map((item, i) => (
                    <motion.li
                      key={item.to}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between border-b border-line py-4 font-display text-2xl font-medium transition-colors',
                            isActive ? 'text-accent' : 'text-fg hover:text-accent',
                          )
                        }
                      >
                        {item.label}
                        <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex items-center gap-3 pt-10">
                {profile.socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.href}
                    aria-label={s.label}
                    target={s.platform === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line text-fg-muted hover:text-accent"
                  >
                    <SocialIcon platform={s.platform} className="size-5" />
                  </a>
                ))}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
