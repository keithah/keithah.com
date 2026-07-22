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
  'Know what your battery is doing.',
  'See the charge',
  'Control the outputs',
  'Run on a schedule',
  'Direct and local',
  'Browser monitoring and automation',
  'TestFlight coming soon',
  'https://github.com/keithah/openwrt-wattline',
  '/products/wattline/onboarding.png',
  '/products/wattline/nearby-devices.png',
  '/products/wattline/dashboard.png',
];
const prohibited = [
  'Direct Bluetooth control',
  'Bluetooth is the everyday connection.',
  'https://testflight.apple.com',
  'App Store',
  'remote relay is ready',
  'hardware validated',
  'Learn the shape before touching the hardware.',
];

for (const value of required) {
  if (!html.includes(value)) throw new Error(`missing: ${value}`);
}

const narrativeOrder = [
  'See the charge',
  'Control the outputs',
  'Run on a schedule',
  'Direct and local',
  'Browser monitoring and automation',
];
let priorNarrativePosition = -1;
for (const value of narrativeOrder) {
  const position = html.indexOf(value);
  if (position <= priorNarrativePosition) {
    throw new Error(`Wattline narrative order is incorrect at: ${value}`);
  }
  priorNarrativePosition = position;
}

for (const value of prohibited) {
  if (html.includes(value)) throw new Error(`prohibited: ${value}`);
}

const images = [
  {
    name: 'onboarding',
    path: '/products/wattline/onboarding.png',
    width: '1206',
    height: '2622',
    lazy: true,
  },
  {
    name: 'nearby devices',
    path: '/products/wattline/nearby-devices.png',
    width: '1206',
    height: '2622',
    lazy: true,
  },
  {
    name: 'dashboard',
    path: '/products/wattline/dashboard.png',
    width: '1206',
    height: '2622',
    lazy: false,
  },
  {
    name: 'router pairing',
    path: '/products/wattline/router-pairing.png',
    width: '984',
    height: '1092',
    lazy: true,
  },
  {
    name: 'router panel',
    path: '/products/wattline/router-panel.png',
    width: '984',
    height: '2488',
    lazy: true,
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasExactAttribute = (tag, name, value) => {
  const escapedName = escapeRegExp(name);
  const escapedValue = escapeRegExp(value);
  return new RegExp(`(?:^|\\s)${escapedName}="${escapedValue}"(?=\\s|/?>)`, 'i').test(tag);
};

const exactAttributeValue = (tag, name) => {
  const escapedName = escapeRegExp(name);
  return tag.match(new RegExp(`(?:^|\\s)${escapedName}="([^"]+)"(?=\\s|/?>)`, 'i'))?.[1];
};

for (const image of images) {
  const assetPath = join(dist, image.path.replace(/^\//, ''));
  await access(assetPath);
  const asset = await stat(assetPath);
  if (asset.size <= 10_000) {
    throw new Error(`${image.name} screenshot must be larger than 10,000 bytes`);
  }

  const tag = (html.match(/<img\b[^>]*>/gi) ?? []).find((candidate) =>
    hasExactAttribute(candidate, 'src', image.path),
  );
  if (!tag) throw new Error(`missing ${image.name} screenshot image tag`);
  if (!hasExactAttribute(tag, 'width', image.width) || !hasExactAttribute(tag, 'height', image.height)) {
    throw new Error(`${image.name} screenshot dimensions must be ${image.width} by ${image.height}`);
  }
  if (!hasExactAttribute(tag, 'decoding', 'async')) {
    throw new Error(`${image.name} screenshot must decode asynchronously`);
  }
  if (image.lazy !== hasExactAttribute(tag, 'loading', 'lazy')) {
    throw new Error(`${image.name} screenshot lazy-loading behavior is incorrect`);
  }

  const alt = exactAttributeValue(tag, 'alt') ?? '';
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
