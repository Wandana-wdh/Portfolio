import type { LoaderFunctionArgs } from 'react-router-dom';
import { getRepository, loadSiteContent } from '@/services';

/**
 * Route loaders — the only place pages get content from. Lists are already
 * filtered to visible entries in display order (see services/contentRepository).
 */

/** How many entries the homepage previews show (the first N visible ones). */
export const HOME_PREVIEW = { projects: 3, credentials: 3, articles: 3 } as const;

function notFound(): never {
  throw new Response('Not Found', { status: 404, statusText: 'Not Found' });
}

export async function rootLoader() {
  const source = await loadSiteContent();
  const portfolio = await getRepository();
  return { profile: await portfolio.getProfile(), mode: source.mode, publishedAt: source.publishedAt };
}

export async function homeLoader() {
  const portfolio = await getRepository();
  const [projects, skills, timeline, volunteering, events, credentials, articles] = await Promise.all([
    portfolio.listProjects(),
    portfolio.listSkillGroups(),
    portfolio.listTimeline(),
    portfolio.listVolunteering(),
    portfolio.listEvents(),
    portfolio.listCredentials(),
    portfolio.listArticles(),
  ]);
  return {
    projects: projects.slice(0, HOME_PREVIEW.projects),
    skills,
    timeline,
    volunteering,
    events,
    credentials: credentials.slice(0, HOME_PREVIEW.credentials),
    totalCredentials: credentials.length,
    articles: articles.slice(0, HOME_PREVIEW.articles),
  };
}

export async function aboutLoader() {
  const portfolio = await getRepository();
  const [skills, timeline, volunteering, events] = await Promise.all([
    portfolio.listSkillGroups(),
    portfolio.listTimeline(),
    portfolio.listVolunteering(),
    portfolio.listEvents(),
  ]);
  return { skills, timeline, volunteering, events };
}

export async function researchListLoader() {
  const portfolio = await getRepository();
  return { research: await portfolio.listResearch() };
}

export async function researchDetailLoader({ params }: LoaderFunctionArgs) {
  const portfolio = await getRepository();
  const research = await portfolio.getResearch(params.slug ?? '');
  if (!research) notFound();
  return { research };
}

export async function projectsLoader() {
  const portfolio = await getRepository();
  return { projects: await portfolio.listProjects() };
}

export async function projectDetailLoader({ params }: LoaderFunctionArgs) {
  const portfolio = await getRepository();
  const [project, all] = await Promise.all([portfolio.getProject(params.slug ?? ''), portfolio.listProjects()]);
  if (!project) notFound();
  const credentials = await portfolio.getCredentials(project.credentialIds);
  const others = all.filter((p) => p.id !== project.id).slice(0, 2);
  return { project, credentials, others };
}

export async function achievementsLoader() {
  const portfolio = await getRepository();
  return { items: await portfolio.listCredentials() };
}

export async function articlesLoader() {
  const portfolio = await getRepository();
  return { articles: await portfolio.listArticles() };
}

export async function articleDetailLoader({ params }: LoaderFunctionArgs) {
  const portfolio = await getRepository();
  const [article, all] = await Promise.all([portfolio.getArticle(params.slug ?? ''), portfolio.listArticles()]);
  if (!article) notFound();
  const more = all.filter((a) => a.id !== article.id).slice(0, 3);
  return { article, more };
}

export type LoaderData<T extends (...args: never[]) => unknown> = Awaited<ReturnType<T>>;
