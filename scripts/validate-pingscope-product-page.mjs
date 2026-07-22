import { access, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'dist/products/pingscope/index.html'), 'utf8');
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

for (const value of required) {
  if (!html.includes(value)) throw new Error(`missing: ${value}`);
}

for (const value of stale) {
  if (html.includes(value)) throw new Error(`stale: ${value}`);
}

for (const asset of assets) {
  if (!html.includes(`/products/pingscope/${asset}`)) throw new Error(`unreferenced: ${asset}`);
  const path = join(root, 'public/products/pingscope', asset);
  await access(path);
  if ((await stat(path)).size < 10_000) throw new Error(`asset too small: ${asset}`);

  const imagePattern = new RegExp(`<img[^>]+src=["']\\/products\\/pingscope\\/${asset.replace('.', '\\.') }["'][^>]+alt=["']([^"']+)["']`, 'i');
  const altPattern = new RegExp(`<img[^>]+alt=["']([^"']+)["'][^>]+src=["']\\/products\\/pingscope\\/${asset.replace('.', '\\.') }["']`, 'i');
  if (!imagePattern.test(html) && !altPattern.test(html)) throw new Error(`missing meaningful alt text: ${asset}`);
}

console.log('PASS: PingScope product page contract');
