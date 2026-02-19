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
						{ label: 'Library Home', slug: 'library' },
						{ label: 'Example Work', slug: 'library/example-work' },
					],
				},
				{
					label: 'Browse',
					items: [
						{ label: 'Authors', slug: 'authors' },
						{ label: 'Series', slug: 'series' },
						{ label: 'Types', slug: 'types' },
						{ label: 'Tags', slug: 'tags' },
						{ label: 'Years', slug: 'years' },
					],
				},
				{
					label: 'Project',
					items: [{ label: 'About', slug: 'about' }],
				},
			],
		}),
	],
});
