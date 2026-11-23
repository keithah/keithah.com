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
const excludedRepos = new Set(['keithah/kodi-donor-radio', 'xbmc/xbmc', 'xbmc/kodiai']);
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

// The search API returns at most 100 rows a page and 1000 rows a query.
async function search(query) {
  const items = [];
  for (let page = 1; page <= 10; page += 1) {
    const result = await github(
      `/search/issues?q=${encodeURIComponent(query)}&per_page=100&page=${page}&sort=updated&order=desc`,
    );
    items.push(...result.items);
    if (result.items.length < 100) break;
  }
  // Only other people's projects count as contributions, and excluded
  // repositories are dropped here so they never reach the snapshot.
  return items.filter((item) => {
    const repo = repoOf(item);
    return !repo.startsWith('keithah/') && !isExcluded(repo);
  });
}

const repoOf = (item) => item.repository_url.replace(`${api}/repos/`, '');

// One metadata request per repository, however many pull requests it has.
const metadataCache = new Map();
const metadataFor = (repo) => {
  if (!metadataCache.has(repo)) metadataCache.set(repo, github(`/repos/${repo}`));
  return metadataCache.get(repo);
};

async function normalize(item, state) {
  const repo = repoOf(item);
  const metadata = await metadataFor(repo);
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
    // Merge date for merged rows, opening date for open ones.
    date: (state === 'merged' ? item.pull_request?.merged_at : item.created_at) || item.updated_at,
    url: item.html_url,
    state,
  };
}

try {
  const [mergedItems, openItems] = await Promise.all([
    search('author:keithah is:pr is:merged -user:keithah'),
    search('author:keithah is:pr is:open -user:keithah'),
  ]);
  if (mergedItems.length === 0) {
    throw new Error('GitHub returned no upstream merged pull requests');
  }

  // Public projects only. The flag is a build-time filter, so it is stripped
  // before anything is written.
  const publicOnly = (rows) => rows
    .filter((row) => !row.private)
    .map(({ private: _private, ...row }) => row);

  // Every public contribution, most recently updated first. Requests go out in
  // small batches so a long history does not open hundreds of sockets at once.
  const collectAll = async (items, state) => {
    const rows = [];
    const batch = 8;
    for (let i = 0; i < items.length; i += batch) {
      rows.push(...await Promise.all(items.slice(i, i + batch).map((item) => normalize(item, state))));
    }
    return publicOnly(rows);
  };

  const allMerged = await collectAll(mergedItems, 'merged');
  const allOpen = await collectAll(openItems, 'open');

  // The home page highlights one pull request per repository.
  const onePerRepo = (rows) => {
    const seen = new Set();
    return rows.filter((row) => !seen.has(row.repo) && seen.add(row.repo));
  };

  // Merged highlights: the most-starred projects among the twelve most recently
  // touched; ties fall back to name for a stable snapshot.
  const featuredMerged = onePerRepo(allMerged)
    .slice(0, 12)
    .sort((a, b) => b.stars - a.stars || a.repo.localeCompare(b.repo))
    .slice(0, 3);
  const open = onePerRepo(allOpen).slice(0, 3);

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
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      merged: featuredMerged,
      open,
      // The full history, shown on /opensource.
      all: { merged: allMerged, open: allOpen },
    }, null, 2)}\n`,
  );
  console.log(
    `Updated ${output}: ${featuredMerged.length} merged and ${open.length} open highlighted, `
    + `${allMerged.length} merged and ${allOpen.length} open in all`,
  );
} catch (error) {
  try {
    await readFile(output);
    console.warn(`GitHub PR refresh failed; keeping existing snapshot: ${error.message}`);
  } catch {
    console.error(`GitHub PR refresh failed and no snapshot exists: ${error.message}`);
    process.exitCode = 1;
  }
}
