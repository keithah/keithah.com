import { access, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'dist/products/pingscope/index.html'), 'utf8');
const unrelatedPages = await Promise.all([
  readFile(join(root, 'dist/products/starwatch/index.html'), 'utf8'),
  readFile(join(root, 'dist/products/overhear/index.html'), 'utf8'),
]);
const productFontRequest = 'family=Archivo+Black&family=IBM+Plex+Sans';
const required = [
  'PingScope for Mac',
  'PingScope for iPhone',
  'External TestFlight',
  'https://testflight.apple.com/join/rvBuNjMz',
  'https://apps.apple.com/us/app/pingscope-keep-connected/id6759278369?mt=12',
  'https://github.com/keithah/pingscope',
  '0.5.0',
];
const stale = ['iOS is next', 'Coming soon', 'Download 0.3.0'];
const assets = [
  'mac-all-hosts.png',
  'overlay.png',
  'ios-signal.png',
  'ios-ring.png',
  'ios-widget.png',
  'ios-live-activity.png',
];
const altPhrases = new Map([
  ['mac-all-hosts.png', 'All Hosts'],
  ['overlay.png', 'floating Mac overlay'],
  ['ios-signal.png', 'Signal view'],
  ['ios-ring.png', 'Ring view'],
  ['ios-widget.png', 'widget'],
  ['ios-live-activity.png', 'Live Activity'],
]);
const assetDimensions = new Map([
  ['mac-all-hosts.png', [969, 1200]],
  ['overlay.png', [1176, 696]],
  ['ios-signal.png', [1206, 2622]],
  ['ios-ring.png', [1206, 2622]],
  ['ios-widget.png', [1206, 650]],
  ['ios-live-activity.png', [979, 1900]],
]);
let eagerCaptureCount = 0;

for (const value of required) {
  if (!html.includes(value)) throw new Error(`missing: ${value}`);
}

for (const value of stale) {
  if (html.includes(value)) throw new Error(`stale: ${value}`);
}

const [head = '', body = ''] = html.split('</head>');
if (!head.includes(productFontRequest)) throw new Error('PingScope font request must be in the document head');
if (body.includes(productFontRequest)) throw new Error('PingScope font request leaked into the document body');
if (unrelatedPages.some((page) => page.includes(productFontRequest))) {
  throw new Error('PingScope font request leaked into an unrelated product page');
}
if (html.includes('class="nav-logo"')) {
  throw new Error('site-wide ~/keithah navigation must be hidden on the PingScope product page');
}
if (unrelatedPages.some((page) => !page.includes('class="nav-logo"'))) {
  throw new Error('site-wide navigation must remain visible on unrelated product pages');
}

for (const asset of assets) {
  if (!html.includes(`/products/pingscope/${asset}`)) throw new Error(`unreferenced: ${asset}`);
  const path = join(root, 'public/products/pingscope', asset);
  await access(path);
  if ((await stat(path)).size < 10_000) throw new Error(`asset too small: ${asset}`);

  const tags = html.match(new RegExp(`<img[^>]+${asset.replace('.', '\\.')}[^>]*>`, 'gi')) ?? [];
  if (tags.length === 0) throw new Error(`missing image element: ${asset}`);

  for (const tag of tags) {
    const alt = tag.match(/alt=["']([^"']+)["']/i)?.[1] ?? '';
    if (alt.trim().split(/\s+/).length < 6 || !alt.includes(altPhrases.get(asset))) {
      throw new Error(`weak alt text: ${asset}`);
    }

    const isHero = /class=["'][^"']*ps-hero-(?:mac|phone)/i.test(tag);
    if (isHero) {
      eagerCaptureCount += 1;
      if (/loading=["']lazy["']/i.test(tag)) throw new Error(`hero image must be eager: ${asset}`);
    } else if (!/loading=["']lazy["']/i.test(tag) || !/decoding=["']async["']/i.test(tag)) {
      throw new Error(`below-fold image must be lazy and async: ${asset}`);
    }

    const [width, height] = assetDimensions.get(asset);
    if (!tag.includes(`width="${width}"`) || !tag.includes(`height="${height}"`)) {
      throw new Error(`incorrect image dimensions: ${asset}`);
    }
  }
}

if (eagerCaptureCount !== 3) throw new Error(`expected 3 eager hero captures, found: ${eagerCaptureCount}`);

console.log('PASS: PingScope product page contract');
