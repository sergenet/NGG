type EventParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const CONSENT_KEY = 'ngg_analytics_consent'
const CAMPAIGN_KEY = 'ngg_campaign'
const COLLECTOR_URL = '/control-room/event'

export type Campaign = {
  source: string
  medium: string
  campaign: string
  content: string
  term: string
}

/**
 * localStorage throws in hardened and private browsing modes. Treat an unreadable
 * store as "no consent", so consent handling fails closed instead of throwing out
 * of a React effect and taking the page's interactions with it.
 */
export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

/**
 * Campaign attribution comes from the URL, not from the referrer.
 *
 * A Google Ads click arrives with a google.com referrer exactly like an organic
 * result, so the referrer cannot separate paid from free traffic. The utm
 * parameters on the landing URL can. They are stored for the session so that an
 * internal page view — or a click on a second page — does not forget which
 * campaign paid for the visit.
 *
 * Auto-tagging is the fallback: if Google rewrites an ad click to carry `gclid`
 * instead of utm parameters, the click is still recorded as paid rather than
 * silently labelled organic. The identifier itself is never stored.
 */
const CAMPAIGN_KEYS: Array<keyof Campaign> = ['source', 'medium', 'campaign', 'content', 'term']

const PAID_CLICK_ID = /^(gclid|gbraid|wbraid|dclid|msclkid)$/

const clean = (value: string | null): string =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 60)
    .replace(/^[-.]+|[-.]+$/g, '')

function readStoredCampaign(): Campaign | null {
  try {
    const raw = sessionStorage.getItem(CAMPAIGN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Campaign>
    const campaign: Campaign = {
      source: clean(parsed.source ?? ''),
      medium: clean(parsed.medium ?? ''),
      campaign: clean(parsed.campaign ?? ''),
      content: clean(parsed.content ?? ''),
      term: clean(parsed.term ?? ''),
    }
    return campaign.source || campaign.medium ? campaign : null
  } catch {
    return null
  }
}

function detectCampaign(): Campaign | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const campaign = {} as Campaign
    for (const key of CAMPAIGN_KEYS) campaign[key] = clean(params.get(`utm_${key}`))

    const untagged = !campaign.source && !campaign.medium
    if (untagged) {
      const autoTagged = [...params.keys()].some((key) => PAID_CLICK_ID.test(key))
      if (!autoTagged) return readStoredCampaign()
      campaign.source = 'google'
      campaign.medium = 'cpc-auto'
      campaign.campaign = 'autotagged'
    }

    if (campaign.source || campaign.medium) {
      try {
        sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign))
      } catch {
        // Private mode: the campaign applies to this page view only.
      }
      return campaign
    }
    return readStoredCampaign()
  } catch {
    return readStoredCampaign()
  }
}

/**
 * sendBeacon can be unavailable or reject the payload; tracking must never break
 * the page.
 */
function postEvent(type: string, extra: Record<string, unknown> = {}): void {
  try {
    const campaign = detectCampaign()
    const payload: Record<string, unknown> = {
      type,
      path: location.pathname,
      referrer: document.referrer,
      ...extra,
    }
    if (campaign) payload.campaign = campaign
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon(COLLECTOR_URL, body)
  } catch {
    // The click or page view itself must still succeed.
  }
}

export function trackPageView(): void {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return
  postEvent('page_view')
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return
  if (typeof window.gtag === "function") window.gtag("event", name, params)
  const type = ({ affiliate_click: 'retailer_click', file_download: 'checklist_download', newsletter_signup_attempt: 'newsletter_attempt' } as Record<string, string>)[name]
  if (!type || !hasAnalyticsConsent()) return
  // The outbound click is the campaign's conversion. It carries the placement
  // that produced it so hero, mid-page and footer CTAs can be told apart.
  const placement = typeof params.placement === 'string' ? clean(params.placement) : ''
  postEvent(type, placement ? { placement } : {})
}
