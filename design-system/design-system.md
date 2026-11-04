# NewGiftsAndGadgets.com — Design System

## Color Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--brand-primary` | hsl(220, 65%, 38%) | `#224B8E` | Primary CTAs, headers, links |
| `--brand-secondary` | hsl(160, 50%, 45%) | `#39B385` | Success states, "Best Value" badges |
| `--brand-accent` | hsl(32, 95%, 55%) | `#F29D2A` | "Editor's Pick" badges, highlights |
| `--brand-dark` | hsl(220, 25%, 15%) | `#1D2433` | Body text, dark backgrounds |
| `--brand-light` | hsl(220, 20%, 97%) | `#F5F6F8` | Page backgrounds |
| `--surface` | hsl(0, 0%, 100%) | `#FFFFFF` | Cards, modals |
| `--border` | hsl(220, 15%, 90%) | `#E2E5EB` | Card borders, dividers |
| `--text-primary` | hsl(220, 25%, 20%) | `#263040` | Headings |
| `--text-secondary` | hsl(220, 10%, 45%) | `#667085` | Body text |
| `--text-muted` | hsl(220, 10%, 60%) | `#8C94A3` | Captions, metadata |
| `--danger` | hsl(0, 75%, 55%) | `#DC3545` | Price reductions, warnings |
| `--star-gold` | hsl(45, 95%, 55%) | `#F5C518` | Star ratings |

## Typography

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 | Playfair Display | 700 | 2.5rem (40px) | 1.2 |
| H2 | Inter | 700 | 1.875rem (30px) | 1.3 |
| H3 | Inter | 600 | 1.5rem (24px) | 1.35 |
| H4 | Inter | 600 | 1.25rem (20px) | 1.4 |
| Body | Inter | 400 | 1rem (16px) | 1.7 |
| Small | Inter | 400 | 0.875rem (14px) | 1.5 |
| Caption | Inter | 500 | 0.75rem (12px) | 1.4 |

**Google Fonts Import:**
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap
```

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon gaps |
| `--space-sm` | 8px | Tight padding |
| `--space-md` | 16px | Standard padding |
| `--space-lg` | 24px | Section padding |
| `--space-xl` | 32px | Card padding |
| `--space-2xl` | 48px | Section gaps |
| `--space-3xl` | 64px | Page section spacing |
| `--space-4xl` | 96px | Hero section padding |

## Button Styles

### Primary CTA (Affiliate Links)
- Background: `--brand-primary` → hover: darker 10%
- Color: white
- Border-radius: 8px
- Padding: 14px 28px
- Font: Inter 600, 1rem
- Shadow: `0 2px 8px rgba(34, 75, 142, 0.25)`
- Arrow icon on right (→)

### Secondary CTA
- Background: transparent
- Border: 2px solid `--brand-primary`
- Color: `--brand-primary`
- Same padding and radius

### Accent CTA ("Best Value")
- Background: `--brand-secondary`
- Color: white

## Card Styles

### Product Card
- Background: white
- Border: 1px solid `--border`
- Border-radius: 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.06)`
- Hover shadow: `0 8px 25px rgba(0,0,0,0.1)`
- Transition: all 0.3s ease
- Image ratio: 4:3 (object-fit: cover)
- Badge position: top-left, absolute

### Article Card
- Similar to product card but with:
- Category tag (top), title, excerpt, read time
- Author avatar + name (bottom)

## Badge System

| Badge | Background | Text | Usage |
|-------|-----------|------|-------|
| Editor's Pick | `--brand-accent` | White | Top recommendation |
| Best Value | `--brand-secondary` | White | Budget-friendly pick |
| Premium Choice | `--brand-primary` | White | Premium option |
| New | hsl(270, 60%, 55%) | White | Recently added |
| Sale | `--danger` | White | Price drops |

## Mobile-First Rules

- **Base**: 1 column, 16px padding
- **≥576px (sm)**: 2-column product grid
- **≥768px (md)**: Sidebar appears, 2-col content
- **≥992px (lg)**: 3-column product grid, full nav
- **≥1200px (xl)**: Max-width 1200px container

## Featured Image Guidelines

- **Hero**: 1200×500px, 16:9 wide crop
- **Product Thumbnail**: 600×450px, 4:3 ratio
- **Category Card**: 800×500px, landscape
- **Article Card**: 800×450px, landscape
- **Format**: WebP with JPEG fallback
- **Max file size**: 100KB per image
