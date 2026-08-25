import { readFile, writeFile } from 'node:fs/promises';

const productsPath = new URL('../src/lib/data/products.json', import.meta.url);
const articlesPath = new URL('../src/lib/data/articles.json', import.meta.url);
const products = JSON.parse(await readFile(productsPath, 'utf8'));
const articles = JSON.parse(await readFile(articlesPath, 'utf8'));

const articleIntroductions = {
  'Best Standing Desks of 2026': '<p>We compared published standing-desk specifications, adjustment ranges, fit questions, and ownership considerations to create a research-based shortlist for home offices.</p>',
  'Best Ergonomic Chairs': '<p>Chair fit is personal. This research-based guide compares published adjustment features, size considerations, and catalog price bands; it does not replace an in-person fit check or medical advice.</p>',
  'Best Smart Speakers': '<p>This research-based guide compares smart speakers by published compatibility, audio and assistant features, privacy controls, and ecosystem requirements. The right choice depends on the services and devices already used in the home.</p>',
  'Best Air Fryers of 2026': '<p>This research-based guide compares published capacity, controls, cleaning requirements, counter-space needs, and catalog price bands. Confirm current specifications and safety instructions with the manufacturer.</p>',
  'Best Kitchen Gadgets 2026 UPDATED': '<p>This research-based shortlist covers kitchen tools with different jobs, from temperature monitoring to food preparation. Compare storage, cleanup, safety, compatibility, and likely frequency of use before buying.</p>',
  'Top Smart Home Tech 2026': '<p>This research-based guide compares published smart-home features, compatibility requirements, privacy considerations, and likely setup effort. No device is the right fit for every household.</p>',
  'Best Smart Home Upgrades 2026': '<p>This research-based guide compares products that address different household tasks. Check ecosystem compatibility, privacy controls, subscriptions, installation requirements, and current manufacturer terms before choosing.</p>',
  'Best Desk Lamps for Home Office 2026': '<p>This research-based guide compares published lamp dimensions, controls, mounting methods, and lighting features. Comfort and visibility vary by room and user; this is not a medical or hands-on assessment.</p>',
  'Roomba vs Roborock: Which Robot Vacuum Wins?': '<p>This research-based comparison uses published cleaning features, navigation approaches, dock functions, maintenance needs, and catalog information. Floor plan, thresholds, pets, and upkeep can change which option fits a household.</p>',
  'Best Smart Light Bulbs for Every Room': '<p>This research-based guide compares published bulb compatibility, brightness and color controls, hub requirements, privacy considerations, and automation options. Confirm fixture, dimmer, app, and ecosystem support before buying.</p>',
  'Ninja vs Vitamix: The Professional Blender Showdown': '<p>This research-based comparison looks at published controls, container size, motor specifications, warranty information, and ownership trade-offs. Expected use, budget, noise tolerance, and storage should drive the choice.</p>',
  'Top 5 Smart Coffee Makers for 2026': '<p>This research-based guide compares published scheduling, brewing, app, capacity, and cleaning features. Flavor is subjective, and connected features may add setup, account, privacy, or support requirements.</p>',
  'MX Master 3S Review: The Best Office Mouse?': '<p>This is a research-based buying guide, not a hands-on review. It considers published controls, connectivity, software, shape, and workflow fit. Hand size, handedness, operating system, and employer software policy should be checked before purchase.</p>',
  'Smart Home on a Budget: Build Your Setup Under $200': '<p>A sub-$200 smart-home setup is a planning target, not a guaranteed total. This research-based guide compares published compatibility, features, and catalog price bands; taxes, shipping, subscriptions, required hubs, and price changes can alter the final cost.</p><h2>Start with compatibility</h2><p>Choose one useful task, then confirm the home network, phone, voice assistant, hub, account, privacy, and wiring requirements. A Matter logo can improve cross-platform options, but it does not guarantee that every feature works in every ecosystem.</p><h2>Add devices selectively</h2><p>Lighting and plugs can automate supported lamps or appliances, but electrical ratings and manufacturer safety instructions matter. Avoid using a smart plug with heating or high-draw equipment unless both manufacturers explicitly permit that use.</p>',
  'Must-Have Travel Gadgets for Digital Nomads': '<p>This research-based guide groups travel technology by portability, compatibility, power needs, and day-to-day usefulness. Check airline battery limits, destination plug standards, device power requirements, data-security practices, and carry weight before travel.</p><h2>Power away from an outlet</h2><p>Compare rated capacity, output, cable requirements, and airline rules. Published battery capacity does not guarantee a particular laptop runtime because device load and conversion losses vary.</p><h2>Storage and focus</h2><p>A portable SSD can provide a local backup option, but durability claims have limits and one drive is not a complete backup plan. Noise-canceling headphones may reduce some ambient sound; fit, comfort, and microphone performance vary.</p>',
  'Best GPS Trackers for Cars and Valuables 2026: ShadowAuto vs. ShadowTrack': '<p>This research-based guide compares published power, mounting, location, alert, subscription, and app requirements for two ShadowGPS products. It is not a hands-on security test, and a tracker cannot prevent theft or guarantee recovery.</p><h2>Check consent, law, and coverage</h2><p>Use tracking devices only on property and vehicles you are legally permitted to monitor. Confirm local law, cellular coverage, subscription terms, battery expectations, installation location, and the effect of signal conditions before purchase.</p><h2>Choose by power source</h2><p>An OBD-II model may suit a compatible vehicle when continuous vehicle power and visible port placement are acceptable. A rechargeable asset tracker may suit non-vehicle property, but it requires a charging routine and an appropriate mounting surface. Verify every feature with the manufacturer.</p>',
};

const descriptions = {
  'vivo-dual-monitor-desk-mount': 'A steel desk mount for two supported monitors, with published screen-size, weight, VESA, and desk-mounting requirements that should be checked before purchase.',
  'samsung-t7-shield-1tb': 'A portable solid-state drive with published USB performance and water, dust, and drop-resistance ratings. Those ratings apply only under the manufacturer\'s stated test conditions.',
  'shadowauto-obd-ii-gps-car-tracker': 'An OBD-II vehicle tracker with published location, route-history, alert, and diagnostic features. Confirm vehicle compatibility, cellular coverage, subscription terms, consent, and applicable law.',
  'fullstar-vegetable-chopper-mandoline-slicer-9-in-1': 'A multi-part vegetable preparation tool with a collection container and several cutting and grating inserts. Review blade-safety, cleaning, and storage instructions before use.',
  'ninja-professional-blender-bl610': 'A full-size blender sold as the Ninja Professional Blender BL610, with a published 1,000-watt motor rating and a large pitcher for supported blending tasks.',
  'furbo-360-dog-camera': 'A connected pet camera with published video, movement-tracking, bark-alert, and treat-tossing features. Confirm subscriptions, privacy settings, app support, and pet suitability.',
  'neakasa-p1-pro-pet-grooming-vacuum': 'A pet-grooming vacuum kit with several published grooming attachments. Noise tolerance, coat type, cleaning, filter care, and safe tool use should be checked for the individual pet.',
  'ergear-single-monitor-arm': 'A single-monitor arm with a gas-spring adjustment mechanism, cable routing, and published screen, weight, VESA, and desk-thickness limits that should be checked before installation.',
  'irobot-roomba-j9-series': 'A robot vacuum with published object-detection, mapping, app-control, and dock options. Cleaning results depend on the floor plan, surface, obstacles, maintenance, and selected model.',
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
  if (articleIntroductions[article.title]) article.body_intro = articleIntroductions[article.title];
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
