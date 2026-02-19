// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'TSA Writing Library',
			description:
				'A public-facing digital library for authors, topics, and publications.',
			sidebar: [
				{
					label: 'Library',
					items: [
						{ label: 'Authors', slug: 'authors' },
						{ label: 'Topics', slug: 'topics' },
						{ label: 'Publications', slug: 'publications' },
						{ label: 'About', slug: 'about' },
					],
				},
			],
		}),
	],
});
