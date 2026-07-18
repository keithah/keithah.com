import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    products: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'data',
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
  type: 'content',
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
