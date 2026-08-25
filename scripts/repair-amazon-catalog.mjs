import fs from 'node:fs';

const productsPath = new URL('../src/lib/data/products.json', import.meta.url);
const articlesPath = new URL('../src/lib/data/articles.json', import.meta.url);

const replacements = {
  'elgato-prompter': 'B0CH3P9K1X',
  'caldigit-ts4-thunderbolt-4-dock': 'B09GK8LBWS',
  'vari-electric-standing-desk-48x30': 'B0CT95KTQH',
  'ember-smart-mug-2': 'B0H2BHDDSV',
  'elgato-stream-deck-mk-2': 'B09738CV2G',
  'lifx-a19-smart-led': 'B0H7T6B3XZ',
  'govee-ai-sync-box-2': 'B0DDPSCLFR',
  'samsung-t7-shield-1tb': 'B09VLK9W3S',
  'philips-hue-bridge-starter-kit': 'B0FMGKHCGH',
  'august-wi-fi-smart-lock-4th-gen': 'B082VXRND2',
  'aqara-fp2-presence-sensor': 'B0BXWZMQJ3',
  'amazon-echo-show-8-3rd-gen': 'B0BLS3Y632',
  'thermopro-twin-tempspike-plus': 'B0CJLP322B',
  'instant-vortex-plus-6-in-1': 'B096N3FTZP',
  'aerolatte-handheld-milk-frother': 'B0002KZUNA',
  'breville-barista-express-impress': 'B0BBYNPV33',
  'magsafe-compatible-phone-stand': 'B0D2QXRW9K',
  'google-nest-cam-battery': 'B09FCMSJZG',
  'apple-homepod-mini': 'B0DXRKQVVZ',
  'sonos-era-100': 'B0BW34LCB8',
  'ninja-professional-blender-bl610': 'B00NGV4506',
  'keurig-k-elite-coffee-maker': 'B078NN17K3',
  'logitech-mx-master-3s': 'B0FB21526X',
  'nomatic-travel-pack-30l': 'B07782GG5T',
  'anker-prime-20-000mah-power-bank': 'B0F66NH2ZX',
  'levitating-globe-lamp': 'B09JJR6CP1',
};

const removals = new Set([
  'lifx-luna-smart-lamp',
  'roborock-qrevo-curv',
  'zyliss-e900010u-viral-peeler',
  'google-nest-hub-2nd-gen',
]);

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const asinMap = new Map();

for (const product of products) {
  const oldAsin = product.id?.replace(/^P-/, '');
  if (removals.has(product.slug)) {
    asinMap.set(oldAsin, null);
    continue;
  }

  const newAsin = replacements[product.slug];
  if (!newAsin) continue;
  asinMap.set(oldAsin, newAsin);
  product.id = `P-${newAsin}`;
  for (const vendor of product.vendors ?? []) {
    if (vendor.name.toLowerCase().includes('amazon')) {
      vendor.url = `https://www.amazon.com/dp/${newAsin}?tag=sergenet05-20`;
    }
  }

  if (product.slug === 'magsafe-compatible-phone-stand') {
    product.title = 'UGREEN Magnetic Phone Stand for MagSafe';
    product.brand = 'UGREEN';
    product.description = 'An adjustable desktop stand designed to hold MagSafe-compatible iPhones in portrait or landscape orientation.';
  }

  if (product.slug === 'anker-prime-20-000mah-power-bank') {
    product.title = 'Anker Prime 20,100mAh Power Bank';
    product.description = 'A three-port portable battery with up to 220W total output, two-way charging, app support, and published flight-safe capacity.';
  }
}

const repairedProducts = products.filter((product) => !removals.has(product.slug));
fs.writeFileSync(productsPath, `${JSON.stringify(repairedProducts, null, 2)}\n`);

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
for (const article of articles.queue ?? []) {
  article.product_asins = (article.product_asins ?? [])
    .map((asin) => asinMap.has(asin) ? asinMap.get(asin) : asin)
    .filter(Boolean);
}
fs.writeFileSync(articlesPath, `${JSON.stringify(articles, null, 2)}\n`);

console.log(`Repaired ${Object.keys(replacements).length} Amazon destinations.`);
console.log(`Removed ${products.length - repairedProducts.length} products without defensible replacements.`);
