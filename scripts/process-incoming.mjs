/**
 * Process incoming markdown files into the library.
 *
 * - Reads all .md files from incoming/
 * - Generates clean URL-friendly slugs
 * - Normalizes frontmatter (type, series, removes filename field)
 * - Writes to src/content/docs/library/
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const INCOMING_DIR = join(process.cwd(), 'incoming');
const LIBRARY_DIR = join(process.cwd(), 'src/content/docs/library');

// Normalize the "type" field to consistent values
const TYPE_MAP = {
  'book introduction': 'Chapter',
  'doctrinal article': 'Article',
  'letter collection': 'Book',
};

// Series values that are really categories, not actual series
const CATEGORY_NOT_SERIES = new Set([
  'Short Articles & Practical Guidance',
  'The Salvation Army',
  'International & Missions',
  'The William Booth Collection',
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (extname(entry.name).toLowerCase() === '.md') {
      files.push(full);
    }
  }
  return files;
}

function generateSlug(filename) {
  let name = basename(filename, '.md');

  // Strip date prefix (YYYY-MM-DD_ or YYYY-00-00_ patterns)
  name = name.replace(/^\d{4}-\d{2}-\d{2}_/, '');

  // Convert to lowercase, replace underscores with hyphens
  name = name.toLowerCase().replace(/_/g, '-');

  // Collapse multiple hyphens
  name = name.replace(/-{2,}/g, '-');

  // Remove leading/trailing hyphens
  name = name.replace(/^-+|-+$/g, '');

  return name;
}

function normalizeFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;

  let frontmatter = match[1];
  const body = content.slice(match[0].length);

  // Remove the filename field (it's redundant with the actual filename)
  frontmatter = frontmatter.replace(/^filename:.*$\n?/gm, '');

  // Normalize type values
  for (const [from, to] of Object.entries(TYPE_MAP)) {
    const regex = new RegExp(`^(type:\\s*["']?)${from}(["']?\\s*)$`, 'gim');
    frontmatter = frontmatter.replace(regex, `$1${to}$2`);
  }

  // Clear series values that are really categories
  for (const cat of CATEGORY_NOT_SERIES) {
    // Handle both quoted and unquoted
    frontmatter = frontmatter.replace(
      new RegExp(`^series:\\s*["']?${cat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?\\s*$`, 'gm'),
      'series: ""'
    );
  }

  // Remove empty series lines
  frontmatter = frontmatter.replace(/^series:\s*["']?["']?\s*$/gm, '');

  // Clean trailing whitespace on each line
  frontmatter = frontmatter
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // Remove trailing empty lines from frontmatter
  frontmatter = frontmatter.replace(/\n+$/, '');

  return `---\n${frontmatter}\n---${body}`;
}

async function main() {
  await mkdir(LIBRARY_DIR, { recursive: true });

  const files = await walk(INCOMING_DIR);
  console.log(`Found ${files.length} markdown files in incoming/\n`);

  const slugsSeen = new Map();
  let processed = 0;
  let skipped = 0;

  for (const file of files.sort()) {
    const slug = generateSlug(basename(file));

    // Handle duplicate slugs
    if (slugsSeen.has(slug)) {
      console.warn(`  DUPLICATE slug "${slug}":`);
      console.warn(`    Already: ${slugsSeen.get(slug)}`);
      console.warn(`    New:     ${file}`);
      skipped++;
      continue;
    }
    slugsSeen.set(slug, file);

    const content = await readFile(file, 'utf-8');
    const normalized = normalizeFrontmatter(content);
    const outPath = join(LIBRARY_DIR, `${slug}.md`);

    await writeFile(outPath, normalized, 'utf-8');
    processed++;
    console.log(`  ${slug}.md`);
  }

  console.log(`\nDone: ${processed} processed, ${skipped} skipped (duplicates)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
