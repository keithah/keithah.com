import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Overhear's repository is private: its page and cards must not link to it,
// and support goes by email instead of GitHub issues.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const read = (path) => readFile(join(dist, path), 'utf8');

const product = await read('products/overhear/index.html');
const required = [
  'mailto:keith+overhear@hadm.net',
  'https://keithah.github.io/overhear/releases/v0.2.0/Overhear-0.2.0-local.zip',
  'https://keithah.github.io/overhear/privacy.html',
];
for (const value of required) {
  if (!product.includes(value)) throw new Error(`products/overhear: missing ${value}`);
}

const privateRepo = 'github.com/keithah/overhear';
// index.html shows only featured projects, and Overhear is not featured.
for (const page of ['products/overhear/index.html', 'work/index.html']) {
  const html = await read(page);
  if (html.includes(privateRepo)) throw new Error(`${page}: links to the private repo ${privateRepo}`);
}
if (product.includes('/issues/new')) throw new Error('products/overhear: offers GitHub issues');

console.log('Overhear product page contract passed.');
