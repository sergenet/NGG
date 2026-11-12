// Read-only content measurement over the static export.
// Metric (same shape used in the earlier catalogue audit):
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
const pages = [];

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const slug of readdirSync(root)) {
  let html;
  try {
    html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  } catch {
    continue;
  }
  const text = textOf(html);
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  pages.push({ slug, text, words });
}

const shingles = (words) => {
  const set = new Set();
  for (let i = 0; i + 5 <= words.length; i += 1) set.add(words.slice(i, i + 5).join(' '));
  return set;
};

const sets = pages.map((page) => ({ ...page, shingles: shingles(page.words) }));

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

// Unique share: word types on a page that no other product page uses.
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
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

console.log(`product pages: ${sets.length}`);
console.log(`words: min ${Math.min(...wordCounts)} · mean ${Math.round(mean(wordCounts))} · max ${Math.max(...wordCounts)}`);
console.log(`mean pair similarity: ${(pairSum / pairCount).toFixed(2)}`);
console.log(`worst pair: ${worst.value.toFixed(2)} (${worst.a} vs ${worst.b})`);
console.log(`unique share: ${Math.round(mean(uniqueShares) * 100)}%`);
