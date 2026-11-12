// Read-only content measurement over the static export.
//
// Two views, because they answer different questions:
//   whole page   - what a crawler sees, including nav, footer and cross-sell blocks.
//                  Comparable with the 0.30 (42 products) and 0.41 (236 products)
//                  figures recorded in SESSION_HANDOFF §10.
//   main content - the <main> element only, which is what a reader compares between
//                  two product pages. Chrome is identical on every page, so the
//                  whole-page number understates how different the content is.
//
// Metrics per view:
//   words        - visible words per product page
//   similarity   - mean pairwise Jaccard similarity of 5-word shingles
//   worst pair   - highest single pair similarity
//   unique share - share of a page's words that appear on no other product page
//
// Run after `npm run build`. Paths resolve from this file, so cwd does not matter.
// Note when quoting: "unique share" falls as the catalogue grows (more pages means
// more words are shared with *something*), so only compare it against a run over a
// catalogue of the same size. Mean and worst-pair similarity are the stable signals.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(repoRoot, 'out', 'product');

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const mainOf = (html) => {
  const match = html.match(/<main[\s\S]*?<\/main>/i);
  return match ? textOf(match[0]) : '';
};

const shingles = (words) => {
  const set = new Set();
  for (let i = 0; i + 5 <= words.length; i += 1) set.add(words.slice(i, i + 5).join(' '));
  return set;
};

const pages = [];
for (const slug of readdirSync(root)) {
  let html;
  try {
    html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  } catch {
    continue;
  }
  const whole = textOf(html).toLowerCase().match(/[a-z0-9']+/g) || [];
  const main = mainOf(html).toLowerCase().match(/[a-z0-9']+/g) || [];
  pages.push({ slug, whole, main });
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

function report(label, pick) {
  const sets = pages.map((page) => ({ slug: page.slug, words: pick(page), shingles: shingles(pick(page)) }));

  let pairSum = 0;
  let pairCount = 0;
  let worst = { value: 0, a: '', b: '' };
  for (let i = 0; i < sets.length; i += 1) {
    for (let j = i + 1; j < sets.length; j += 1) {
      const a = sets[i].shingles;
      const b = sets[j].shingles;
      let shared = 0;
      for (const value of a) if (b.has(value)) shared += 1;
      const union = a.size + b.size - shared;
      const score = union === 0 ? 0 : shared / union;
      pairSum += score;
      pairCount += 1;
      if (score > worst.value) worst = { value: score, a: sets[i].slug, b: sets[j].slug };
    }
  }

  const wordSets = sets.map((page) => new Set(page.words));
  const uniqueShares = sets.map((page, index) => {
    const others = new Set();
    wordSets.forEach((set, otherIndex) => {
      if (otherIndex === index) return;
      for (const word of set) others.add(word);
    });
    const own = [...wordSets[index]];
    const unique = own.filter((word) => !others.has(word)).length;
    return own.length ? unique / own.length : 0;
  });

  const wordCounts = sets.map((page) => page.words.length);
  console.log(`\n${label}`);
  console.log(`  product pages: ${sets.length}`);
  console.log(`  words: min ${Math.min(...wordCounts)} · mean ${Math.round(mean(wordCounts))} · max ${Math.max(...wordCounts)}`);
  console.log(`  mean pair similarity: ${(pairSum / pairCount).toFixed(2)}`);
  console.log(`  worst pair: ${worst.value.toFixed(2)} (${worst.a} vs ${worst.b})`);
  console.log(`  unique share: ${Math.round(mean(uniqueShares) * 100)}%`);
}

report('whole page (crawler view)', (page) => page.whole);
report('main content (reader view)', (page) => page.main);
