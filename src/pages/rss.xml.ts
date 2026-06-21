import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', p => !p.data.draft);
  return rss({
    title: 'Keith Herrington',
    description: 'Technical Product @ TuneIn · Exec Director, Kodi Foundation · aspirational slopcoder.',
    site: context.site!.toString(),
    items: posts
      .sort((a,b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map(p => ({
        title: p.data.title,
        pubDate: p.data.date,
        description: p.data.description ?? '',
        link: `/posts/${p.slug}`,
      })),
  });
}
