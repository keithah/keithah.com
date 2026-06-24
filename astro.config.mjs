import { defineConfig } from 'astro/config';
import rss from '@astrojs/rss';

export default defineConfig({
  site: 'https://keithah.com',
  output: 'static',
  redirects: {
    '/projects': '/work',
    '/products': '/work',
  },
});
