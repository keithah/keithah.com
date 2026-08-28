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
  }),
});

export const collections = { posts, projects, products };
