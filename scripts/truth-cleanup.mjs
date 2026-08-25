import { readFile, writeFile } from 'node:fs/promises';

const productsPath = new URL('../src/lib/data/products.json', import.meta.url);
const articlesPath = new URL('../src/lib/data/articles.json', import.meta.url);
const products = JSON.parse(await readFile(productsPath, 'utf8'));
const articles = JSON.parse(await readFile(articlesPath, 'utf8'));

const descriptions = {
  'sony-wh-1000xm5-wireless-headphones': 'Over-ear wireless headphones with active noise cancellation, multipoint Bluetooth, touch controls, and a fold-flat carrying case.',
  'ember-smart-mug-2': 'A temperature-controlled mug designed to hold a chosen drinking temperature for up to 80 minutes on battery power.',
  'ergotron-lx-single-monitor-arm': 'A monitor arm with Constant Force movement, VESA compatibility, cable routing, and a wide adjustment range for supported displays.',
  'taotronics-led-desk-lamp': 'An adjustable LED desk lamp with multiple color-temperature modes, brightness levels, and an integrated USB charging port.',
  'benq-screenbar-halo': 'A monitor-mounted light with front and rear illumination, a wireless controller, and automatic brightness adjustment.',
  'elgato-facecam-pro': 'A 4K60 webcam with a large sensor, adjustable field of view, autofocus, and desktop software controls for creators and calls.',
  'lifx-a19-smart-led': 'A hub-free Wi-Fi smart bulb with adjustable white light, color controls, schedules, and voice-assistant support.',
  'switchbot-hub-2-matter': 'A Matter-compatible smart hub with temperature and humidity sensors, IR control, and support for selected SwitchBot devices.',
  'philips-hue-bridge-starter-kit': 'A smart-lighting starter kit built around the Hue Bridge, with app, schedule, scene, and voice-control options.',
  'aqara-fp2-presence-sensor': 'A camera-free mmWave presence sensor designed to detect occupancy zones and support compatible home automations.',
  'roborock-qrevo-curv': 'A robot vacuum and mop with an obstacle-crossing chassis, anti-tangle brush design, and an automated dock.',
  'thermopro-twin-tempspike-plus': 'A wireless meat thermometer with two probes, a booster display, and a published connection range of up to 600 feet in suitable conditions.',
  'ninja-air-fryer-4-in-1-pro': 'A basket-style air fryer with four cooking functions, a nonstick cooking basket, and dishwasher-safe removable parts.',
  'vitamix-e310-explorian-blender': 'A full-size blender with a variable-speed control, pulse function, 48-ounce container, and stainless-steel blade assembly.',
  'logitech-mx-master-3s': 'A wireless productivity mouse with quiet clicks, an electromagnetic scroll wheel, multi-device switching, and customizable controls.',
  'breville-barista-express-espresso-machine': 'An espresso machine with an integrated conical-burr grinder, manual steam wand, and adjustable grind and dose controls.',
  'hamilton-beach-flexbrew-coffee-maker': 'A dual-format coffee maker that can brew a full carafe or a single serving using grounds or compatible pods.',
  'traverseon-precision-micro-baitcasting-reel': 'A 190-gram micro baitcasting reel designed for light-lure and finesse fishing, with carbon drag and brass gearing.',
  'levitating-globe-lamp': 'A small magnetic-levitation globe with an illuminated C-shaped base, designed as a decorative desk or shelf piece.',
};

for (const product of products) {
  if (descriptions[product.slug]) product.description = descriptions[product.slug];
  for (const key of ['features', 'pros', 'cons']) {
    if (Array.isArray(product[key])) {
      product[key] = product[key]
        .filter((value) => !/commission|publisher|convert|cookie|click/i.test(value))
        .map((value) => value.replace(/ultimate versatility/gi, 'added packing flexibility'));
    }
  }
  if (Array.isArray(product.whoShouldBuy)) {
    product.whoShouldBuy = product.whoShouldBuy.map((value) => value.replace(/Ultimate Luxury/gi, 'Temperature-Controlled Drinks').replace(/Ultimate Prep Speed/gi, 'Faster Food Preparation'));
  }
}

for (const article of articles.queue || []) {
  article.body_intro = article.body_intro
    .replace(/After testing dozens of budget-friendly smart home devices, we've compiled the ultimate starter kit\./gi, 'This guide compares a practical starter set using published compatibility, feature, and pricing information.')
    .replace(/We've curated the ultimate tech loadout for digital nomads, focusing on portability, reliability, and extreme performance\./gi, 'This guide groups travel technology by portability, compatibility, power needs, and day-to-day usefulness.')
    .replace(/Thunderbolt 4 is non-negotiable\./gi, 'Thunderbolt 4 is worth considering for demanding multi-display or high-bandwidth workflows.')
    .replace(/are not a luxury for remote workers; they are an absolute necessity/gi, 'can be useful for remote workers who regularly work in noisy environments')
    .replace(/give you complete peace of mind/gi, 'provide additional visibility while you are away')
    .replace(/the ultimate starter kit/gi, 'a practical starter kit')
    .replace(/our top recommendations/gi, 'the products compared')
    .replace(/our top picks/gi, 'the products compared');
  article.body_intro = article.body_intro
    .replace(/After testing over 20 models, these three stand out for speed, visibility, and value\./gi, 'This guide compares three models using published capacity, controls, cleaning requirements, and catalog pricing.')
    .replace(/ultimate versatility/gi, 'added packing flexibility');
}

await writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`);
await writeFile(articlesPath, `${JSON.stringify(articles, null, 2)}\n`);
console.log('Removed unsupported promotional, testing, and publisher-facing language.');
