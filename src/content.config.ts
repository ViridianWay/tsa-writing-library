import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				author: z.string().optional(),
				series: z.string().optional(),
				type: z.string().optional(),
				chapter: z.union([z.string(), z.number()]).optional(),
				published: z.union([z.string(), z.date()]).optional(),
				tags: z.array(z.string()).optional(),
				filename: z.string().optional(),
			}),
		}),
	}),
};
