const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIRS = [
  '/home/user/tsa-writing-library/incoming/The Southern Spirit/2025',
  '/home/user/tsa-writing-library/incoming/The Southern Spirit/2026',
];
const TARGET_DIR = '/home/user/tsa-writing-library/src/content/docs/periodicals/southern-spirit';

// Rank prefixes to strip from author names (order matters: longer/more specific first)
const RANK_PREFIXES = [
  'Lt. Colonel',
  'Lieutenant Colonel',
  'Lt. Col.',
  'Colonel',
  'Commissioner',
  'Brigadier',
  'Lieutenant',
  'Lt.',
  'Major',
  'Captain',
  'General',
  'Envoy',
  'Dr.',
];

// Month name to number mapping
const MONTHS = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes/smart quotes
    .replace(/[^a-z0-9]+/g, '-')   // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')       // Trim leading/trailing hyphens
    .replace(/-{2,}/g, '-');        // Collapse multiple hyphens
}

function stripRank(author) {
  if (!author) return author;
  let stripped = author.trim();
  for (const rank of RANK_PREFIXES) {
    // Check if author starts with rank followed by a space
    if (stripped.startsWith(rank + ' ')) {
      stripped = stripped.substring(rank.length).trim();
      break; // Only strip one rank prefix
    }
  }
  return stripped;
}

function parseDate(dateStr, yyyymmPrefix) {
  if (!dateStr) {
    // Fall back to YYYYMM prefix
    if (yyyymmPrefix && yyyymmPrefix.length >= 6) {
      const year = yyyymmPrefix.substring(0, 4);
      const month = yyyymmPrefix.substring(4, 6);
      return `${year}-${month}-01`;
    }
    return null;
  }

  dateStr = dateStr.trim();

  // Try "Month Day, Year" format (e.g., "January 15, 2025" or "Jan 17, 2025")
  const fullDateMatch = dateStr.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (fullDateMatch) {
    const monthName = fullDateMatch[1].toLowerCase();
    const day = fullDateMatch[2].padStart(2, '0');
    const year = fullDateMatch[3];
    const month = MONTHS[monthName];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  // Try "Month Year" format (e.g., "January 2025")
  const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthName = monthYearMatch[1].toLowerCase();
    const year = monthYearMatch[2];
    const month = MONTHS[monthName];
    if (month) {
      return `${year}-${month}-01`;
    }
  }

  // Try "YYYY-MM-DD" format (already formatted)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return dateStr;
  }

  // Fall back to YYYYMM prefix from filename
  if (yyyymmPrefix && yyyymmPrefix.length >= 6) {
    const year = yyyymmPrefix.substring(0, 4);
    const month = yyyymmPrefix.substring(4, 6);
    return `${year}-${month}-01`;
  }

  return null;
}

function escapeYamlString(str) {
  if (!str) return '""';
  // If the string contains characters that need quoting in YAML, wrap in double quotes and escape
  // Always wrap in double quotes for safety with colons, special chars, etc.
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function parseArticle(content, filename) {
  const lines = content.split('\n');
  
  // Extract YYYYMM prefix from filename
  const yyyymmMatch = filename.match(/^(\d{6})/);
  const yyyymmPrefix = yyyymmMatch ? yyyymmMatch[1] : null;

  // Parse the heading line to get the title
  let title = '';
  let headingLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      headingLineIndex = i;
      // Remove the "# YYYYMM - " prefix to get the title
      let rawTitle = line.substring(2).trim();
      // Remove YYYYMM prefix pattern: "202501 - " or "202501 – "
      rawTitle = rawTitle.replace(/^\d{6}\s*[-–—]\s*/, '');
      title = rawTitle;
      break;
    }
  }

  if (!title) {
    // Fallback: derive title from filename
    title = filename
      .replace(/\.md$/, '')
      .replace(/^\d{6}\s*-\s*/, '');
  }

  // Parse metadata lines (between heading and first ---)
  let author = null;
  let dateStr = null;
  let location = null;
  let sourceStr = null;

  // Find the first "---" separator after the heading
  let separatorIndex = -1;
  for (let i = headingLineIndex + 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      separatorIndex = i;
      break;
    }
  }

  // Parse metadata between heading and separator
  if (separatorIndex > 0) {
    for (let i = headingLineIndex + 1; i < separatorIndex; i++) {
      const line = lines[i].trim();
      
      // Match "* **By:** ..." or "**By:** ..." patterns
      const byMatch = line.match(/\*?\s*\*\*By:\*\*\s*(.+)/);
      if (byMatch) {
        author = byMatch[1].trim();
        continue;
      }

      const dateMatch = line.match(/\*?\s*\*\*Date:\*\*\s*(.+)/);
      if (dateMatch) {
        dateStr = dateMatch[1].trim();
        continue;
      }

      const locationMatch = line.match(/\*?\s*\*\*Location:\*\*\s*(.+)/);
      if (locationMatch) {
        location = locationMatch[1].trim();
        continue;
      }

      const sourceMatch = line.match(/\*?\s*\*\*Source:\*\*\s*(.+)/);
      if (sourceMatch) {
        sourceStr = sourceMatch[1].trim();
        continue;
      }
    }
  }

  // Clean up author
  if (author) {
    // Check for placeholder values
    if (['Not specified', 'Not available', '[Author Name Not Listed]'].includes(author)) {
      author = null;
    } else {
      author = stripRank(author);
    }
  }

  // Parse date
  const publishedDate = parseDate(dateStr, yyyymmPrefix);

  // Extract body content (everything after the first "---" separator)
  let body = '';
  if (separatorIndex >= 0) {
    // Get everything after the separator
    let bodyLines = lines.slice(separatorIndex + 1);
    body = bodyLines.join('\n').trim();

    // Remove trailing source citation block if present
    // Pattern: "---\nSource: ..." or "---\n**Source:** ..." at the end
    body = body.replace(/\n---\s*\n\s*\*?\*?\s*\*?\*?Source:?\*?\*?\s*.+$/s, '').trim();
    // Also handle: "---\nSource: [text](url)" at end
    body = body.replace(/\n---\s*\n\s*Source:\s*\[.+?\]\(.+?\)\s*$/s, '').trim();
  }

  // Generate slug for filename
  const slug = slugify(title);
  const outputFilename = `${yyyymmPrefix}-${slug}.md`;

  // Build frontmatter
  let frontmatter = '---\n';
  frontmatter += `title: ${escapeYamlString(title)}\n`;
  if (author) {
    frontmatter += `author: ${escapeYamlString(author)}\n`;
  }
  frontmatter += `type: "Article"\n`;
  if (publishedDate) {
    frontmatter += `published: "${publishedDate}"\n`;
  }
  frontmatter += `source: "The Southern Spirit"\n`;
  frontmatter += `tags: ["southern-spirit"]\n`;
  frontmatter += '---\n';

  // Build final content
  const outputContent = `${frontmatter}\n# ${title}\n\n${body}\n`;

  return {
    title,
    author,
    publishedDate,
    outputFilename,
    outputContent,
  };
}

function main() {
  let totalFiles = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Ensure target directory exists
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const srcDir of SOURCE_DIRS) {
    if (!fs.existsSync(srcDir)) {
      console.log(`Warning: Source directory does not exist: ${srcDir}`);
      continue;
    }

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} .md files in ${srcDir}`);

    for (const file of files) {
      totalFiles++;
      const filePath = path.join(srcDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const result = parseArticle(content, file);

        const outputPath = path.join(TARGET_DIR, result.outputFilename);
        fs.writeFileSync(outputPath, result.outputContent, 'utf-8');

        successCount++;
        console.log(`  [OK] ${file} -> ${result.outputFilename}`);
      } catch (err) {
        errorCount++;
        errors.push({ file, error: err.message });
        console.error(`  [ERROR] ${file}: ${err.message}`);
      }
    }
  }

  console.log('\n========================================');
  console.log('Processing Summary');
  console.log('========================================');
  console.log(`Total files found:      ${totalFiles}`);
  console.log(`Successfully processed: ${successCount}`);
  console.log(`Errors:                 ${errorCount}`);
  console.log('========================================');

  if (errors.length > 0) {
    console.log('\nFiles with errors:');
    for (const e of errors) {
      console.log(`  - ${e.file}: ${e.error}`);
    }
  }
}

main();
