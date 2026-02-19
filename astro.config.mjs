// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'TSA Writing Library',
			description:
				'A digital archive of historical and contemporary Salvation Army writings.',
			components: {
				Pagination: './src/components/CollectionPagination.astro',
				PageTitle: './src/components/ArticleHeader.astro',
				Sidebar: './src/components/LibrarySidebar.astro',
			},
			sidebar: [
				{
					label: 'Browse',
					items: [
						{ label: 'By Author', slug: 'browse/authors' },
						{ label: 'By Collection', slug: 'browse/series' },
						{ label: 'By Type', slug: 'browse/types' },
						{ label: 'By Topic', slug: 'browse/topics' },
						{ label: 'By Year', slug: 'browse/years' },
					],
				},
				{
					label: 'Collections',
					items: [
						{ label: 'In Darkest England', slug: 'collections/in-darkest-england' },
						{ label: "The Founder's Messages", slug: 'collections/founders-messages' },
						{ label: 'How to Reach the Masses', slug: 'collections/how-to-reach-the-masses' },
						{ label: 'Fishing for Men', slug: 'collections/fishing-for-men' },
						{ label: 'How to Preach', slug: 'collections/how-to-preach' },
						{ label: 'Essential Measures', slug: 'library/essential-measures-full-book' },
					],
				},
				{
					label: 'About',
					items: [
						{ label: 'About the Library', slug: 'about' },
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
