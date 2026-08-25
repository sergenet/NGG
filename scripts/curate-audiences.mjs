import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/lib/data/products.json', import.meta.url);
const products = JSON.parse(await readFile(path, 'utf8'));

const categoryAudiences = {
  'Home Office': ['Remote Workers', 'Students'],
  'Smart Home': ['New Homeowners', 'Tech Enthusiasts'],
  Kitchen: ['Home Cooks', 'Hosts'],
  'Outdoor Adventure': ['Outdoor Lovers', 'Travelers'],
  'Pet Tech': ['Pet Parents'],
  'Travel Tech': ['Travelers', 'Remote Workers'],
  'Desk Toys Novelty Gifts': ['Coworkers', 'Teens'],
};

for (const product of products) {
  const audiences = new Set(categoryAudiences[product.tags.category] || ['Everyone']);
  const text = `${product.title} ${product.description}`.toLowerCase();
  if (/coffee|frother|espresso/.test(text)) audiences.add('Coffee Lovers');
  if (/webcam|prompter|stream deck|microphone/.test(text)) audiences.add('Creators');
  if (/desk|keyboard|mouse|monitor|office/.test(text)) audiences.add('Remote Workers');
  if (/pet|dog|cat/.test(text)) audiences.add('Pet Parents');
  product.tags.recipient = [...audiences];

  delete product.setupTips;
  delete product.whoShouldSkip;
  delete product.faqs;
}

await writeFile(path, `${JSON.stringify(products, null, 2)}\n`);
console.log(`Curated audiences for ${products.length} products and removed unsupported filler fields.`);
