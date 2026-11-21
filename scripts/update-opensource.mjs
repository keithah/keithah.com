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
const excludedRepos = new Set(['keithah/kodi-donor-radio', 'xbmc/xbmc']);
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
    // Public only: a private repository's pull-request titles must never be
    // published, and the site is built from this snapshot.
    private: metadata.private === true,
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
  if (mergedRepos.length === 0) {
    throw new Error('GitHub returned no upstream merged pull requests');
  }

  // Public projects only. The flag is a build-time filter, so it is stripped
  // before anything is written.
  const publicOnly = (rows) => rows
    .filter((row) => !row.private)
    .map(({ private: _private, ...row }) => row);

  // Fetch pooled candidates and stop once enough *public* rows are collected.
  // Taking a fixed number of candidates first would let private repositories
  // eat the quota and leave the published list short.
  const collectPublic = async (items, state, want) => {
    const picked = [];
    const batch = 6;
    for (let i = 0; i < items.length && picked.length < want; i += batch) {
      const rows = await Promise.all(items.slice(i, i + batch).map((item) => normalize(item, state)));
      picked.push(...publicOnly(rows));
    }
    return picked.slice(0, want);
  };

  // Merged rows need a wider pool than the three shown, because the star
  // ranking chooses among them.
  const mergedPool = await collectPublic(mergedRepos.slice(0, 24), 'merged', 12);
  const open = await collectPublic(openRepos.slice(0, 12), 'open', 3);

  // Most-starred project first; ties fall back to name for a stable snapshot.
  const featuredMerged = mergedPool
    .sort((a, b) => b.stars - a.stars || a.repo.localeCompare(b.repo))
    .slice(0, 3);

  // The published list is empty if every candidate was private, which the
  // search-level check above cannot see.
  if (featuredMerged.length === 0) {
    throw new Error('No public upstream merged pull requests to publish');
  }

  // An empty open list is a valid state, not a failure: it means no upstream
  // pull request is open right now.
  if (open.length === 0) console.warn('No open upstream pull requests to publish.');

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
