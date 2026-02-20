/**
 * Shared collection utilities — URL mappings, formatting helpers, etc.
 */

/** Map series names → collection landing-page URLs. */
export const collectionUrls: Record<string, string> = {
	'In Darkest England': '/collections/in-darkest-england/',
	"The Founder's Messages to Soldiers": '/collections/founders-messages/',
	'Fishing for Men': '/collections/fishing-for-men/',
	'How to Reach the Masses with the Gospel': '/collections/how-to-reach-the-masses/',
	'How to Preach': '/collections/how-to-preach/',
	"Now You Know: The Rest of The Army's Story": '/collections/now-you-know/',
	'Bible Conference 2025: Hope': '/collections/bible-conference-2025/',
};

/** Format a raw `published` value into a human-readable string. */
export function formatDate(published: string | Date | undefined): string {
	if (!published) return 'Date unknown';
	const str = String(published);
	// "0000" means unknown
	if (str.startsWith('0000')) return 'Date unknown';

	const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) {
		// Might be just a year like "1890"
		const yearOnly = str.match(/^\d{4}$/);
		if (yearOnly) return str;
		return str;
	}

	const [, year, month, day] = match;

	const monthNames = [
		'', 'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December',
	];

	const m = parseInt(month, 10);
	const d = parseInt(day, 10);

	if (m === 0) return year;
	if (d === 0) return `${monthNames[m]} ${year}`;
	return `${monthNames[m]} ${d}, ${year}`;
}

/** Turn a slug like "evangelism" into "Evangelism". */
export function formatTag(tag: string): string {
	return tag
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

/** Build a part + chapter label like "Part 2, Chapter 3". */
export function chapterLabel(
	part: string | number | undefined,
	chapter: string | number | undefined,
): string {
	const parts: string[] = [];
	if (part && Number(part) > 0) parts.push(`Part ${part}`);
	if (chapter && Number(chapter) > 0) parts.push(`Chapter ${chapter}`);
	return parts.join(', ');
}

/** Slug-ify an author name for URL use. */
export function authorSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
