import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src', 'data', 'opensource.json');
const api = 'https://api.github.com';
const headers = { accept: 'application/vnd.github+json', 'user-agent': 'keithah.com-build' };

const topicFor = (repo, title) => {
  const value = `${repo} ${title}`.toLowerCase();
  if (value.includes('matrix')) return 'matrix';
  if (value.includes('plex') || value.includes('kodi') || value.includes('media')) return 'streaming';
  if (value.includes('homeclaw') || value.includes('home') || value.includes('proxmox') || value.includes('kvm')) return 'home automation';
  if (value.includes('travel') || value.includes('flight') || value.includes('hotel') || value.includes('seat')) return 'travel';
  if (value.includes('airbnb') || value.includes('reservation')) return 'travel';
  if (value.includes('hermes') || value.includes('libretto') || value.includes('mcp')) return 'AI / dev tools';
  if (value.includes('infra') || value.includes('pipeline') || value.includes('kuma') || value.includes('monitor')) return 'infrastructure';
  return 'open source';
};

async function github(pathname) {
  const response = await fetch(`${api}${pathname}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${pathname}`);
  return response.json();
}

async function search(query) {
  const result = await github(`/search/issues?q=${encodeURIComponent(query)}&per_page=20&sort=updated&order=desc`);
  return result.items;
}

async function normalize(item, state) {
  const repo = item.repository_url.replace(`${api}/repos/`, '');
  const metadata = await github(`/repos/${repo}`);
  return {
    number: item.number,
    title: item.title,
    repo,
    topic: topicFor(repo, item.title),
    lang: metadata.language || '—',
    stars: metadata.stargazers_count,
    updatedAt: item.updated_at,
    url: item.html_url,
    state,
  };
}

try {
  const [mergedItems, openItems] = await Promise.all([
    search('author:keithah is:pr is:merged'),
    search('author:keithah is:pr is:open'),
  ]);
  const merged = await Promise.all(mergedItems.slice(0, 3).map(item => normalize(item, 'merged')));
  const open = await Promise.all(openItems.slice(0, 3).map(item => normalize(item, 'open')));
  if (merged.length === 0 || open.length === 0) throw new Error('GitHub returned an empty merged or open set');
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), merged, open }, null, 2)}\n`);
  console.log(`Updated ${output}: ${merged.length} merged, ${open.length} open`);
} catch (error) {
  try {
    await readFile(output);
    console.warn(`GitHub PR refresh failed; keeping existing snapshot: ${error.message}`);
  } catch {
    console.error(`GitHub PR refresh failed and no snapshot exists: ${error.message}`);
    process.exitCode = 1;
  }
}
