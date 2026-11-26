import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteConfig } from '@/data/site';

interface DocumentMeta {
  /** Page title; the site name is appended automatically. Omit on the homepage. */
  title?: string;
  description?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Sets per-page title, description, Open Graph tags and canonical URL. */
export function useDocumentMeta({ title, description, image, type = 'website', noIndex }: DocumentMeta) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? siteConfig.titleTemplate.replace('%s', title) : siteConfig.defaultTitle;
    const desc = description ?? siteConfig.description;
    const url = new URL(pathname, siteConfig.url).toString();
    const img = image ?? siteConfig.ogImage;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img ? new URL(img, siteConfig.url).toString() : null);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'robots', noIndex ? 'noindex' : null);
    setCanonical(url);
  }, [title, description, image, type, noIndex, pathname]);
}
