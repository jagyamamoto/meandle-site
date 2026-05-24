import type { APIRoute } from 'astro';
import nav from '../data/navigation.json';

export const prerender = true;

const SITE = 'https://meandle.jp';

// 公開ページ一覧。新規ページ追加時はここに登録する（自動生成）。
const pages: { path: string; priority: number; changefreq: string }[] = [
  { path: '/',         priority: 1.0, changefreq: 'weekly' },
  { path: '/contact/', priority: 0.8, changefreq: 'monthly' },
  { path: '/blog/',    priority: 0.7, changefreq: 'weekly' },
  ...nav.blog.map((b) => ({ path: `/blog/${b.slug}/`, priority: 0.6, changefreq: 'monthly' })),
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
