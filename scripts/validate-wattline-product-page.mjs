import { access, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const html = await readFile(join(dist, 'products/wattline/index.html'), 'utf8');
const pingscopeHtml = await readFile(join(dist, 'products/pingscope/index.html'), 'utf8');
const starwatchHtml = await readFile(join(dist, 'products/starwatch/index.html'), 'utf8');
const required = [
  'Wattline',
  'https://github.com/keithah/wattline',
  'Bluetooth Low Energy',
  'TestFlight coming soon',
  'https://github.com/keithah/openwrt-wattline',
  '/products/wattline/onboarding.png',
  '/products/wattline/nearby-devices.png',
  '/products/wattline/dashboard.png',
];
const prohibited = [
  'https://testflight.apple.com',
  'App Store',
  'remote relay is ready',
  'hardware validated',
];

for (const value of required) {
  if (!html.includes(value)) throw new Error(`missing: ${value}`);
}

if (html.indexOf('Bluetooth Low Energy') > html.indexOf('openwrt-wattline')) {
  throw new Error('Bluetooth Low Energy must precede openwrt-wattline');
}

for (const value of prohibited) {
  if (html.includes(value)) throw new Error(`prohibited: ${value}`);
}

const images = [
  {
    name: 'onboarding',
    path: '/products/wattline/onboarding.png',
    lazy: true,
  },
  {
    name: 'nearby devices',
    path: '/products/wattline/nearby-devices.png',
    lazy: true,
  },
  {
    name: 'dashboard',
    path: '/products/wattline/dashboard.png',
    lazy: false,
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const image of images) {
  const assetPath = join(dist, image.path.replace(/^\//, ''));
  await access(assetPath);
  const asset = await stat(assetPath);
  if (asset.size <= 10_000) {
    throw new Error(`${image.name} screenshot must be larger than 10,000 bytes`);
  }

  const escapedPath = escapeRegExp(image.path);
  const tag = html.match(new RegExp(`<img\\b(?=[^>]*\\bsrc="${escapedPath}")[^>]*>`, 'i'))?.[0];
  if (!tag) throw new Error(`missing ${image.name} screenshot image tag`);
  if (!/\bwidth="1206"/.test(tag) || !/\bheight="2622"/.test(tag)) {
    throw new Error(`${image.name} screenshot dimensions must be 1206 by 2622`);
  }
  if (!tag.includes('decoding="async"')) {
    throw new Error(`${image.name} screenshot must decode asynchronously`);
  }
  if (image.lazy !== tag.includes('loading="lazy"')) {
    throw new Error(`${image.name} screenshot lazy-loading behavior is incorrect`);
  }

  const alt = tag.match(/\balt="([^"]+)"/)?.[1] ?? '';
  if (alt.trim().split(/\s+/).length < 6) {
    throw new Error(`${image.name} screenshot needs meaningful six-word alt text`);
  }
}

const pendingTestFlight = '<span class="ps-btn wt-pending" aria-disabled="true">TestFlight coming soon</span>';
if (!html.includes(pendingTestFlight)) {
  throw new Error('TestFlight must remain a disabled, non-link status');
}
if (/href="[^"]*testflight/i.test(html)) {
  throw new Error('Wattline must not contain a TestFlight href');
}

if (!html.includes('ps-wattline')) throw new Error('Wattline page is missing its scoped class');
for (const [name, unrelatedHtml] of [
  ['PingScope', pingscopeHtml],
  ['Starwatch', starwatchHtml],
]) {
  if (unrelatedHtml.includes('ps-wattline')) {
    throw new Error(`${name} must not contain Wattline scoped markup`);
  }
  if (unrelatedHtml.includes('/products/wattline/')) {
    throw new Error(`${name} must not reference Wattline assets`);
  }
}

console.log('PASS: Wattline product page contract');
