'use client';

import Script from 'next/script';

const PLAUSIBLE_DOMAIN = 'multilogin.io';

export function Analytics() {
  // Only load in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}

// Track custom events
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  type PlausibleFn = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  const plausible = (typeof window !== 'undefined'
    ? (window as unknown as { plausible?: PlausibleFn }).plausible
    : undefined);

  if (typeof plausible === 'function') {
    plausible(eventName, { props });
  }
}

// Common event names
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: 'Sign Up',
  SIGN_IN: 'Sign In',
  SIGN_OUT: 'Sign Out',

  // Profile events
  PROFILE_CREATE: 'Profile Create',
  PROFILE_LAUNCH: 'Profile Launch',
  PROFILE_DELETE: 'Profile Delete',

  // Proxy events
  PROXY_ADD: 'Proxy Add',
  PROXY_TEST: 'Proxy Test',

  // Subscription events
  SUBSCRIPTION_START: 'Subscription Start',
  SUBSCRIPTION_UPGRADE: 'Subscription Upgrade',
  SUBSCRIPTION_CANCEL: 'Subscription Cancel',

  // Feature usage
  CLOUD_SYNC: 'Cloud Sync',
  API_KEY_CREATE: 'API Key Create',
  TEAM_INVITE: 'Team Invite',

  // CTA clicks
  CTA_DOWNLOAD: 'CTA Download',
  CTA_PRICING: 'CTA Pricing',
  CTA_SIGNUP: 'CTA Signup',
} as const;
