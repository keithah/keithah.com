import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    products: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    repo: z.string().url(),
    lang: z.string(),
    status: z.enum(['active', 'beta', 'stable', 'internal', 'archived']),
    tags: z.array(z.string()).default([]),
    isProduct: z.boolean().default(false),
    featured: z.number().optional(),
    // false for private repositories: cards then show no GitHub link.
    repoPublic: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    repo: z.string().url(),
    lang: z.string(),
    version: z.string(),
    status: z.enum(['active', 'beta', 'stable', 'archived']),
    platforms: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    license: z.string().default('MIT'),
    // The fields below are read only by the generic product template, not by
    // the custom Starwatch, PingScope and Wattline layouts.
    // Private repositories: no GitHub links, since visitors cannot open them.
    repoPublic: z.boolean().default(true),
    downloadUrl: z.string().url().optional(),
    privacyUrl: z.string().url().optional(),
    // Shown instead of "open an issue"; required when the repo is private.
    supportEmail: z.string().email().optional(),
  }).refine((d) => d.repoPublic || d.supportEmail, {
    message: 'supportEmail is required when repoPublic is false',
    path: ['supportEmail'],
  }),
});

export const collections = { posts, projects, products };
