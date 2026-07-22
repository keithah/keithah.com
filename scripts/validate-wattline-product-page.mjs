import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'dist/products/wattline/index.html'), 'utf8');
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

console.log('PASS: Wattline product page contract');
