import { getAllPosts, getBlogRoute } from '@/lib/blog/content';
import { SITE_NAME, SITE_URL } from '@/lib/seo/seo';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = getAllPosts({ locale }).slice(0, 20);
  const items = posts.map((post) => {
    const url = `${SITE_URL}${getBlogRoute(post, locale)}`;
    return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}</item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(SITE_NAME)} — ${escapeXml(locale.toUpperCase())}</title><link>${SITE_URL}/${locale}/blog</link><description>Published field notes.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
