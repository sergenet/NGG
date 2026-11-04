type EventParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return
  if (typeof window.gtag === "function") window.gtag("event", name, params)
  const type = ({ affiliate_click: 'retailer_click', file_download: 'checklist_download', newsletter_signup_attempt: 'newsletter_attempt' } as Record<string, string>)[name]
  if (type && localStorage.getItem('ngg_analytics_consent') === 'granted') {
    navigator.sendBeacon('/control-room/event', new Blob([JSON.stringify({ type, path: location.pathname, referrer: document.referrer })], { type: 'application/json' }))
  }
}
