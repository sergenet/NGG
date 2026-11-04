# NewGiftsAndGadgets.com — Site Architecture

## Site Hierarchy (SEO Silo Structure)

```
newgiftsandgadgets.com/
├── index.html                     (Homepage)
├── home-office/
│   ├── index.html                 (Category Landing)
│   ├── best-standing-desks/       (Roundup)
│   ├── ergonomic-chairs-review/   (Review)
│   ├── monitor-arms-compared/     (Comparison)
│   └── home-office-gift-guide/    (Gift Guide)
├── smart-home/
│   ├── index.html                 (Category Landing)
│   ├── best-smart-speakers/       (Roundup)
│   ├── ring-doorbell-review/      (Review)
│   ├── alexa-vs-google-home/      (Comparison)
│   └── smart-home-gift-guide/     (Gift Guide)
├── kitchen/
│   ├── index.html                 (Category Landing)
│   ├── best-air-fryers/           (Roundup)
│   ├── ninja-blender-review/      (Review)
│   ├── instant-pot-vs-ninja/      (Comparison)
│   └── kitchen-gadget-gift-guide/ (Gift Guide)
├── gift-guides/                   (Cross-category gift compilations)
├── about/
├── contact/
└── privacy/
```

## Navigation Menu

| Position | Label | URL | Dropdown Items |
|----------|-------|-----|----------------|
| 1 | Home | / | — |
| 2 | Home Office | /home-office/ | Standing Desks · Ergonomic Chairs · Desk Accessories · Monitors & Arms |
| 3 | Smart Home | /smart-home/ | Smart Speakers · Security Cameras · Smart Lighting · Robot Vacuums |
| 4 | Kitchen | /kitchen/ | Air Fryers · Blenders · Coffee Makers · Kitchen Gadgets |
| 5 | Gift Guides | /gift-guides/ | Under $50 · Under $100 · For Him · For Her · Tech Lovers |
| 6 | Reviews | /reviews/ | Latest Reviews |

## Internal Linking Strategy

### Silo Rules
1. **Category pages** link DOWN to their child articles (roundups, reviews, comparisons)
2. **Child articles** link UP to their parent category page
3. **Child articles** link ACROSS to sibling articles within the same silo
4. **Cross-silo links** are used sparingly and only in contextual mentions
5. **Homepage** links to all 3 category landing pages and top-performing articles

### Link Placement
- **In-content contextual links**: 2–4 per 1000 words
- **"Related Articles" sidebar**: 3–5 links from same silo
- **"You May Also Like" section**: bottom of every article, 3 cards
- **Breadcrumb navigation**: every page except homepage

## Footer Structure

| Column 1: Explore | Column 2: Resources | Column 3: About | Column 4: Connect |
|-------------------|---------------------|------------------|-------------------|
| Home Office | Gift Guides | About Us | Newsletter Signup |
| Smart Home | Latest Reviews | Privacy Policy | Social Media Icons |
| Kitchen | Comparison Posts | Terms of Service | Contact Form |
| All Products | How We Review | Affiliate Disclosure | RSS Feed |
