import { MotionConfig } from 'motion/react';
import { Outlet, ScrollRestoration, useRouteLoaderData } from 'react-router-dom';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import type { RootLoaderData } from '@/hooks/useProfile';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { NavigationProgress } from '@/components/layout/NavigationProgress';

export function RootLayout() {
  const root = useRouteLoaderData('root') as RootLoaderData | undefined;
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-accent-solid focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-accent"
      >
        Skip to content
      </a>
      <NavigationProgress />
      {root?.mode === 'preview' && <PreviewBanner />}
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </MotionConfig>
  );
}
