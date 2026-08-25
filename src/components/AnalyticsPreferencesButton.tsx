'use client';

export function AnalyticsPreferencesButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event('ngg:analytics-preferences'))} className="text-left hover:text-white">
      Analytics choices
    </button>
  );
}
