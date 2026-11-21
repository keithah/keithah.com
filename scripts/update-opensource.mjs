import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'src', 'data', 'opensource.json');
const api = 'https://api.github.com';
const headers = { accept: 'application/vnd.github+json', 'user-agent': 'keithah.com-build' };

// Use a token when one is available so local refreshes are not capped at the
// anonymous rate limit. CI passes GITHUB_TOKEN; locally `gh auth token` is used.
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (token) headers.authorization = `Bearer ${token}`;

// Repositories that must never appear on the site, in any section. Filtering
// here rather than after the fetch keeps them out of the committed snapshot too,
// so a rebuild cannot reintroduce them.
const excludedRepos = new Set(['keithah/kodi-donor-radio']);
const isExcluded = (repo) => excludedRepos.has(repo.replace(/^\/+|\/+$/g, '').toLowerCase());

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
  const result = await github(`/search/issues?q=${encodeURIComponent(query)}&per_page=50&sort=updated&order=desc`);
  // Drop excluded repositories before the slice below, so the visible count
  // still fills from allowed results.
  return result.items.filter((item) => {
    const repo = item.repository_url.replace(`${api}/repos/`, '');
    return !isExcluded(repo);
  });
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
    search('author:keithah is:pr is:merged -user:keithah'),
    search('author:keithah is:pr is:open -user:keithah'),
  ]);
  // Only other people's projects are highlighted, and one pull request per
  // repository: dedupe BEFORE fetching metadata, because normalize() costs one
  // API request per row and a single busy project can dominate the results.
  const upstreamOnly = (items) => {
    const seen = new Set();
    const picked = [];
    for (const item of items) {
      const repo = item.repository_url.replace(`${api}/repos/`, '');
      if (repo.startsWith('keithah/') || isExcluded(repo) || seen.has(repo)) continue;
      seen.add(repo);
      picked.push(item);
    }
    return picked;
  };

  const mergedRepos = upstreamOnly(mergedItems);
  const openRepos = upstreamOnly(openItems);
  if (mergedRepos.length === 0 || openRepos.length === 0) {
    throw new Error('GitHub returned no upstream merged or open pull requests');
  }

  // Fetch a wider pool for merged rows so the star ranking has something to
  // choose from, then keep the most-starred projects.
  const merged = await Promise.all(mergedRepos.slice(0, 24).map((item) => normalize(item, 'merged')));
  const open = await Promise.all(openRepos.slice(0, 3).map((item) => normalize(item, 'open')));

  // Most-starred project first; ties fall back to name for a stable snapshot.
  merged.sort((a, b) => b.stars - a.stars || a.repo.localeCompare(b.repo));
  const featuredMerged = merged.slice(0, 3);

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(
    output,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), merged: featuredMerged, open }, null, 2)}\n`,
  );
  console.log(`Updated ${output}: ${featuredMerged.length} merged, ${open.length} open`);
} catch (error) {
  try {
    await readFile(output);
    console.warn(`GitHub PR refresh failed; keeping existing snapshot: ${error.message}`);
  } catch {
    console.error(`GitHub PR refresh failed and no snapshot exists: ${error.message}`);
    process.exitCode = 1;
  }
}
