import { readFile, writeFile } from 'node:fs/promises';

const audit = JSON.parse(await readFile(new URL('../scratch/amazon-destination-audit.json', import.meta.url), 'utf8'));
const review = audit.filter((item) => item.status !== 200 || item.match < 0.34);
const ignored = new Set(['with', 'wireless', 'smart', 'plus', 'latest', 'model', 'series', 'premium', 'professional', 'amazon', 'generation']);
const tokens = (value) => [...new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 3 && !ignored.has(word)))];
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replace(/\s+/g, ' ').trim();
const score = (expected, candidate) => {
  const words = tokens(expected);
  return words.length ? Number((words.filter((word) => candidate.toLowerCase().includes(word)).length / words.length).toFixed(2)) : 0;
};

async function search(item) {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(item.expected)}`;
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(30000) });
    const html = await response.text();
    const starts = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)];
    const candidates = starts.map((match, index) => {
      const block = html.slice(match.index, starts[index + 1]?.index || match.index + 18000);
      const imageAlt = decode(block.match(/<img[^>]+alt="([^"]+)"/i)?.[1] || '');
      const image = decode(block.match(/<img[^>]+src="([^"]+)"/i)?.[1] || '');
      return { asin: match[1], title: imageAlt, image, score: score(item.expected, imageAlt) };
    }).filter((candidate) => candidate.title).sort((a, b) => b.score - a.score);
    return { slug: item.slug, expected: item.expected, currentUrl: item.url, searchStatus: response.status, candidates: candidates.slice(0, 5) };
  } catch (error) {
    return { slug: item.slug, expected: item.expected, currentUrl: item.url, searchStatus: 0, error: error instanceof Error ? error.message : String(error), candidates: [] };
  }
}

const results = [];
for (const item of review) {
  results.push(await search(item));
  await new Promise((resolve) => setTimeout(resolve, 350));
}

await writeFile(new URL('../scratch/amazon-replacement-suggestions.json', import.meta.url), `${JSON.stringify(results, null, 2)}\n`);
for (const result of results) {
  const best = result.candidates[0];
  console.log(`${result.slug}\t${result.searchStatus}\t${best?.score || 0}\t${best?.asin || '-'}\t${best?.title || result.error || 'no candidate'}`);
}
