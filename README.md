# keithah.com

Personal site for Keith Herrington — built with [Astro](https://astro.build), deployed to GitHub Pages.

## Structure

```
src/
  content/
    posts/      ← blog posts (.md) — edit these from mobile
    projects/   ← project metadata (.json)
    products/   ← product landing pages (.md)
  pages/
    index.astro         → keithah.com/
    about.astro         → keithah.com/about
    posts/index.astro   → keithah.com/posts
    posts/[slug].astro  → keithah.com/posts/[slug]
    projects.astro      → keithah.com/projects
    products.astro      → keithah.com/products
    products/[slug].astro → keithah.com/[productname]
  layouts/
    Base.astro    ← shared nav/footer
  styles/
    global.css    ← all styles (JetBrains Mono, dark terminal)
public/
  CNAME           ← keithah.com
```

## Writing a post

1. Open a new GitHub issue and choose the `Blog post` template.
2. Fill out the title, optional slug/date/description/tags/products, and Markdown body.
3. Leave the issue open while it is a draft.
4. Add the `publish` label when it is ready.

The `Publish Blog Issue` workflow converts the issue into `src/content/posts/[slug].md`, commits it to `main`, closes the issue, and the Pages deploy workflow publishes the site.

## Adding a project

Edit `src/content/projects/myproject.json`:
```json
{
  "name": "MyProject",
  "description": "One line description.",
  "repo": "https://github.com/keithah/myproject",
  "lang": "Go",
  "status": "active",
  "tags": ["go", "cli"],
  "isProduct": false
}
```

## Promoting a project to a product

Set `"isProduct": true` in the project JSON, then create `src/content/products/myproject.md` with full frontmatter. A landing page appears at `keithah.com/myproject`.

## Local dev

```bash
npm install
npm run dev
```

## Deploy

Push to `main`. GitHub Actions builds and deploys automatically.
