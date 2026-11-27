import type { ComponentType } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { RootLayout } from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import { RootErrorPage, RouteErrorPage } from '@/pages/ErrorPages';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  aboutLoader,
  achievementsLoader,
  articleDetailLoader,
  articlesLoader,
  eventDetailLoader,
  experienceDetailLoader,
  homeLoader,
  projectDetailLoader,
  projectsLoader,
  researchDetailLoader,
  researchListLoader,
  rootLoader,
} from '@/pages/loaders';

// Non-home pages are code-split; their loaders run in parallel with the chunk download.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

// Admin modules export { loader, Component } and are only downloaded on /admin.
const admin = (load: () => Promise<object>) => load;

const router = createBrowserRouter([
  {
    path: '/admin/login',
    lazy: admin(() => import('@/admin/pages/LoginPage')),
    errorElement: <RootErrorPage />,
    hydrateFallbackElement: <PageLoader />,
  },
  {
    path: '/admin',
    lazy: admin(() => import('@/admin/pages/AdminLayout')),
    errorElement: <RootErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, lazy: admin(() => import('@/admin/pages/DashboardPage')) },
          { path: 'profile', lazy: admin(() => import('@/admin/pages/ProfilePage')) },
          { path: ':collection', lazy: admin(() => import('@/admin/pages/CollectionPage')) },
          { path: ':collection/:id', lazy: admin(() => import('@/admin/pages/EntryEditorPage')) },
        ],
      },
    ],
  },
  {
    id: 'root',
    path: '/',
    loader: rootLoader,
    element: <RootLayout />,
    errorElement: <RootErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, loader: homeLoader, element: <HomePage /> },
          { path: 'about', loader: aboutLoader, lazy: page(() => import('@/pages/AboutPage')) },
          { path: 'research', loader: researchListLoader, lazy: page(() => import('@/pages/ResearchPage')) },
          { path: 'research/:slug', loader: researchDetailLoader, lazy: page(() => import('@/pages/ResearchDetailPage')) },
          { path: 'projects', loader: projectsLoader, lazy: page(() => import('@/pages/ProjectsPage')) },
          { path: 'projects/:slug', loader: projectDetailLoader, lazy: page(() => import('@/pages/ProjectDetailPage')) },
          { path: 'events/:slug', loader: eventDetailLoader, lazy: page(() => import('@/pages/EventDetailPage')) },
          { path: 'experience/:slug', loader: experienceDetailLoader, lazy: page(() => import('@/pages/ExperienceDetailPage')) },
          { path: 'achievements', loader: achievementsLoader, lazy: page(() => import('@/pages/AchievementsPage')) },
          { path: 'articles', loader: articlesLoader, lazy: page(() => import('@/pages/ArticlesPage')) },
          { path: 'articles/:slug', loader: articleDetailLoader, lazy: page(() => import('@/pages/ArticleDetailPage')) },
          { path: 'contact', lazy: page(() => import('@/pages/ContactPage')) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
