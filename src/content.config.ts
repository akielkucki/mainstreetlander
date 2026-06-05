/**
 * content.config.ts — Astro content collections.
 *
 * `projects` is the single source of truth for the portfolio: each case study
 * is one Markdown file in `src/content/projects/`. The Work section renders the
 * table from `getCollection('projects')`, and `/projects/[slug]` renders each
 * file's body as a full case study. Add a project = drop in a new `.md` file.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const SWATCH_TOKENS = ['accent', 'secondary', 'ink'] as const;

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    /** Project / client name shown in the table and as the page H1. */
    title: z.string(),
    /** Business name, if different from `title`. Falls back to `title`. */
    client: z.string().optional(),
    /** Display year, e.g. "2025". String keeps leading-zero / range freedom. */
    year: z.string(),
    /** Discipline — drives the Work section filter pills. */
    category: z.enum(['Web Design', 'E-commerce', 'Branding']),
    /** Sector shown in the "Industry" column, e.g. "Healthcare". */
    industry: z.string(),
    /** One-line description used for cards, meta and OG description. */
    summary: z.string(),
    /** Headline outcome, e.g. "+38% new-patient bookings". */
    result: z.string(),
    /** What we delivered — listed on the case-study page. */
    services: z.array(z.string()).default([]),
    /**
     * Two brand-token names for the abstract placeholder gradient (kept from
     * the original Work section so projects look on-brand without screenshots).
     */
    swatch: z
      .tuple([z.enum(SWATCH_TOKENS), z.enum(SWATCH_TOKENS)])
      .default(['secondary', 'accent']),
    /** Optional real screenshot under /public; falls back to the gradient. */
    image: z.string().optional(),
    /** Live site URL, if public. */
    url: z.string().url().optional(),
    /** Lower sorts first in the table. */
    order: z.number().default(0),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
