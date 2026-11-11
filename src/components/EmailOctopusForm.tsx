'use client';

import { useEffect, useRef } from 'react';
import Link from '@/components/SiteLink';
import { trackEvent } from '@/lib/analytics';

const FORM_ID = 'c209e1e8-a14d-11f1-a4bf-1507f2a577fb';

export function EmailOctopusForm() {
  const formContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = formContainer.current;
    if (!container || container.querySelector('script')) return;

    const trackNewsletterInteraction = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('button[type="submit"], input[type="submit"]')) return;

      trackEvent('newsletter_click', {
        event_category: 'newsletter',
        event_label: 'monthly_gift_ideas',
        source: 'inline',
        provider: 'emailoctopus',
      });
    };

    const trackSignupAttempt = () => {
      trackEvent('newsletter_signup_attempt', {
        event_category: 'newsletter',
        event_label: 'monthly_gift_ideas',
        source: 'inline',
        provider: 'emailoctopus',
        confirmation_required: true,
      });
    };

    container.addEventListener('click', trackNewsletterInteraction);
    container.addEventListener('submit', trackSignupAttempt, true);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://eomail5.com/form/${FORM_ID}.js`;
    script.dataset.form = FORM_ID;
    container.appendChild(script);

    // The embed refuses to submit while its consent box is unticked, but shows no
    // message: the Subscribe button simply appears dead. Marking the box required
    // lets the browser block the submit and point at what is missing.
    const requireConsent = () => {
      const box = container.querySelector<HTMLInputElement>('input[name="consent"]');
      if (!box) return;
      if (!box.required) box.required = true;
    };
    requireConsent();
    const consentObserver = new MutationObserver(requireConsent);
    consentObserver.observe(container, { childList: true, subtree: true });

    return () => {
      consentObserver.disconnect();
      container.removeEventListener('click', trackNewsletterInteraction);
      container.removeEventListener('submit', trackSignupAttempt, true);
      container.replaceChildren();
    };
  }, []);

  return (
    <div>
      <div ref={formContainer} />
      <p className="mt-2 text-center text-xs text-slate-500">
        Subscription details are explained in our{' '}
        <Link href="/privacy/" className="underline hover:text-slate-700">privacy policy</Link>.
        {' '}This form uses Google reCAPTCHA; Google&apos;s{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-slate-700">Privacy Policy</a>
        {' '}and{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-slate-700">Terms of Service</a> apply.
      </p>
    </div>
  );
}
