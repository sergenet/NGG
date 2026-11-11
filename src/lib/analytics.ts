type EventParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const CONSENT_KEY = 'ngg_analytics_consent'
const COLLECTOR_URL = '/control-room/event'

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

/** sendBeacon can be unavailable or reject the payload; tracking must never break the page. */
function postEvent(type: string): void {
  try {
    const body = new Blob([JSON.stringify({ type, path: location.pathname, referrer: document.referrer })], { type: 'application/json' })
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
  postEvent(type)
}
