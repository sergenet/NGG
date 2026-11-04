import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Single source of truth for /shop/<slug> URLs.
 *
 * A raw "&" in a category name used to flow straight into the slug, which produced
 * /shop/health-&-wellness — a path that cannot be safely written into the sitemap XML
 * and that Next exports as a 404 body. "&" now becomes "and" so every slug is
 * [a-z0-9-] only.
 */
export function categorySlug(categoryName: string | undefined): string {
  return String(categoryName ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Newest first, by the date a product was added or last updated.
 *
 * "New Arrivals" used to be the purchasable catalog reversed, which is the same set
 * as /shop/all in the opposite order. Ordering by `lastUpdated` is what makes the
 * page genuinely recency-based; it also survives catalog reordering.
 */
export function sortByRecency<T extends { lastUpdated?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''))
}

export function formatPriceBracket(bracket: string | undefined): string {
  const labels: Record<string, string> = {
    'under-50': 'Under $50',
    '50-100': '$50–$100',
    '100-250': '$100–$250',
    'over-250': 'Over $250',
  }
  return bracket ? labels[bracket] ?? 'Check current price' : 'Check current price'
}

type VendorLike = {
  name: string
  url: string
  price: number
  isPrimary: boolean
}

export function isActiveRetailerUrl(url: string | undefined): boolean {
  if (!url) return false
  if (url === "#" || url.startsWith("javascript:")) return false
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    // Amazon Associates account closed on 2026-08-24. Keep this guard until a
    // newly approved account and replacement Store ID are deliberately enabled.
    return !(hostname.includes("amazon.") || hostname === "amzn.to")
  } catch {
    return false
  }
}

export function pickPrimaryVendor<T extends VendorLike>(vendors: T[]): T | undefined {
  if (!vendors.length) return undefined
  return vendors.find((v) => v.isPrimary && isActiveRetailerUrl(v.url))
    ?? vendors.find((v) => isActiveRetailerUrl(v.url))
}

export function pickBestPriceVendor<T extends VendorLike>(vendors: T[]): T | undefined {
  if (!vendors.length) return undefined
  const candidates = vendors.filter((vendor) => isActiveRetailerUrl(vendor.url))
  if (!candidates.length) return undefined
  return candidates.reduce((best, current) => (current.price < best.price ? current : best), candidates[0])
}

export function withAffiliateTracking(rawUrl: string, placement: string): string {
  if (!rawUrl || rawUrl.startsWith("#")) return rawUrl

  try {
    const url = new URL(rawUrl)
    if (url.hostname.includes("amazon.") || url.hostname === "amzn.to") return "#"
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "newgiftsandgadgets")
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "affiliate")
    if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", "monetization")
    if (!url.searchParams.has("utm_content")) url.searchParams.set("utm_content", placement)
    return url.toString()
  } catch {
    return rawUrl
  }
}
