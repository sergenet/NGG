export interface VendorOffer {
  name: string;        // e.g., "Official Brand Store", "Amazon", "Uncommon Goods"
  url: string;         // Affiliate link
  price: number;       // Catalog price snapshot; retailer price may differ
  isPrimary: boolean;  // Preferred retailer destination shown in the primary CTA
}

export interface ProductTags {
  category: string;      // e.g., "Smart Home", "Electric Transport", "Unique Inventions"
  recipient: string[];   // e.g., ["Men", "Women", "Teens"]
  priceBracket: string;  // e.g., "under-50", "50-100", "over-100"
}

export interface Product {
  id: string;          // Unique identifier (e.g., "P-1001")
  slug: string;        // URL slug (e.g., "smart-led-ambient-light")
  title: string;       // Product Name
  description: string; // SEO-optimized summary
  images: string[];    // Array of image paths (e.g., ["/images/products/light-1.jpg"])
  vendors: VendorOffer[]; // Array of available vendors and their affiliate links
  tags: ProductTags;   // For dynamic filtering in the 'Gift Finder'
  brand?: string;      // Optional: For the "Shop by Brand" section
  features?: string[]; // Optional: Bullet points for the deep-dive review page
  whoShouldBuy?: string[];
  whoShouldSkip?: string[];
  pros?: string[];
  cons?: string[];
  setupTips?: string[];
  // Written per product, not generated from the fields above: these are the notes
  // that stop every page reading like the same page with a different name.
  editorial?: { heading: string; body: string }[];
  faqs?: { question: string; answer: string }[];
  lastUpdated?: string;
}
