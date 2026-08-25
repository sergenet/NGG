const DEFAULT_BEEHIIV_SUBSCRIBE_URL = 'https://newgiftsandgadgets.beehiiv.com/subscribe';

export const BEEHIIV_SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_BEEHIIV_SUBSCRIBE_URL || DEFAULT_BEEHIIV_SUBSCRIBE_URL;

export function buildBeehiivSignupUrl(email: string, source: string): string {
  const url = new URL(BEEHIIV_SUBSCRIBE_URL);
  
  if (email) {
    url.searchParams.set('email', email.trim().toLowerCase());
  }

  url.searchParams.set('utm_source', 'newgiftsandgadgets');
  url.searchParams.set('utm_medium', 'onsite');
  url.searchParams.set('utm_campaign', 'lead-magnet');
  url.searchParams.set('utm_content', source || 'unknown');

  return url.toString();
}