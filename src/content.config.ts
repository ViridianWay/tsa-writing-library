import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Who wrote it
				author: z.string().optional(),
				// The book, series, or collection this belongs to
				series: z.string().optional(),
				// Content classification: Chapter, Article, Letter, Series Overview, Book, etc.
				type: z.string().optional(),
				// Part number (for multi-part books like In Darkest England)
				part: z.union([z.string(), z.number()]).optional(),
				// Chapter number within a part or series
				chapter: z.union([z.string(), z.number()]).optional(),
				// Publication date (flexible: YYYY, YYYY-MM-DD, YYYY-MM-00, etc.)
				published: z.union([z.string(), z.date()]).optional(),
				// Topical tags for browsing and discovery
				tags: z.array(z.string()).optional(),
				// Original publication source (e.g., "The War Cry", "The Officer")
				source: z.string().optional(),
			}),
		}),
	}),
};
