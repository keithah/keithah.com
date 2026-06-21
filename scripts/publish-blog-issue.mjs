import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repo = process.env.GITHUB_REPOSITORY ?? 'keithah/keithah.com';
const issueNumber = process.env.ISSUE_NUMBER;
const eventPath = process.env.GITHUB_EVENT_PATH;
const postsDir = process.env.BLOG_POSTS_DIR ?? path.join('src', 'content', 'posts');
const dryRun = process.env.BLOG_ISSUE_DRY_RUN === '1';

if (!issueNumber && !eventPath) {
  throw new Error('Set ISSUE_NUMBER or GITHUB_EVENT_PATH');
}

const issue = issueNumber
  ? JSON.parse(execFileSync('gh', ['api', `repos/${repo}/issues/${issueNumber}`], { encoding: 'utf8' }))
  : JSON.parse(readFileSync(eventPath, 'utf8')).issue;

if (!issue?.body) {
  throw new Error('Issue body is empty');
}

const fields = parseIssueForm(issue.body);
const postTitle = required(fields, 'Post title');
const slug = normalizeSlug(fields.get('Slug') || postTitle);
const date = normalizeDate(fields.get('Date'));
const description = fields.get('Description')?.trim() ?? '';
const tags = parseList(fields.get('Tags'));
const products = parseList(fields.get('Products'));
const body = required(fields, 'Body').trim();

const postPath = path.join(postsDir, `${slug}.md`);
mkdirSync(path.dirname(postPath), { recursive: true });

const frontmatter = [
  '---',
  `title: ${yamlString(postTitle)}`,
  `date: ${date}`,
  description ? `description: ${yamlString(description)}` : 'description: ""',
  `tags: ${yamlArray(tags)}`,
  `products: ${yamlArray(products)}`,
  'draft: false',
  '---',
  '',
].join('\n');

writeFileSync(postPath, `${frontmatter}${body}\n`);

if (dryRun) {
  console.log(postPath);
  process.exit(0);
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['add', postPath]);

if (!hasStagedChanges()) {
  comment(issue.number, `No post changes detected for \`${postPath}\`.`);
  process.exit(0);
}

execFileSync('git', ['commit', '-m', `Publish blog issue #${issue.number}: ${postTitle}`]);
execFileSync('git', ['pull', '--rebase', 'origin', 'main']);
execFileSync('git', ['push', 'origin', 'HEAD:main']);

const url = `https://keithah.com/posts/${slug}`;
comment(
  issue.number,
  [
    `Published issue #${issue.number} to \`${postPath}\`.`,
    `URL: ${url}`,
  ].join('\n\n'),
);

if (process.env.GITHUB_ACTIONS) {
  execFileSync('gh', ['issue', 'close', String(issue.number), '--repo', repo, '--reason', 'completed']);
}

function parseIssueForm(markdown) {
  const fields = new Map();
  const matches = markdown.matchAll(/^### (.+?)\s*\n+([\s\S]*?)(?=\n### |\s*$)/gm);
  for (const match of matches) {
    const key = match[1].trim();
    const value = match[2].replace(/^_No response_\s*$/m, '').trim();
    fields.set(key, value);
  }
  return fields;
}

function required(fields, key) {
  const value = fields.get(key)?.trim();
  if (!value) throw new Error(`Missing required field: ${key}`);
  return value;
}

function normalizeSlug(value) {
  const slug = value
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Slug is empty after normalization');
  return slug;
}

function normalizeDate(value) {
  const date = value?.trim() || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Date must use YYYY-MM-DD: ${date}`);
  }
  return date;
}

function parseList(value) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function yamlArray(values) {
  return `[${values.map(yamlString).join(', ')}]`;
}

function comment(number, body) {
  if (!process.env.GITHUB_ACTIONS) return;
  execFileSync('gh', ['issue', 'comment', String(number), '--repo', repo, '--body', body]);
}

function hasStagedChanges() {
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], { stdio: 'pipe' });
    return false;
  } catch (error) {
    if (error.status === 1) return true;
    throw error;
  }
}
