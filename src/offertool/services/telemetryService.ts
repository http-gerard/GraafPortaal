import { QuoteData, QuoteAnalytics } from '../types';

export interface TrackPayload {
  quoteId: string;
  eventType: 'session_start' | 'heartbeat' | 'time_ping' | 'section_view' | 'pdf_download' | 'sign_started' | 'quote_signed';
  sectionId?: string;
  durationSeconds?: number;
  deviceInfo?: string;
  location?: string;
  actionDescription?: string;
  details?: string;
  sessionId?: string;
}

export function detectDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Onbekend';
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  const isChrome = /Chrome/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);

  let os = 'Desktop';
  if (/iPhone/i.test(ua)) os = 'iPhone (iOS)';
  else if (/iPad/i.test(ua)) os = 'iPad (iPadOS)';
  else if (/Android/i.test(ua)) os = 'Android Mobiel';
  else if (isMac) os = 'MacBook / macOS';
  else if (isWindows) os = 'Windows PC';

  let browser = 'Browser';
  if (isSafari) browser = 'Safari';
  else if (isChrome) browser = 'Chrome';
  else if (isFirefox) browser = 'Firefox';

  return `${os} • ${browser}`;
}

export async function syncQuoteToPortal(quote: QuoteData): Promise<boolean> {
  try {
    const res = await fetch('/api/quotes/sync-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync quote to portal:', err);
    return false;
  }
}

export async function fetchLiveAnalytics(quoteId: string): Promise<QuoteAnalytics | null> {
  try {
    const res = await fetch(`/api/analytics/${encodeURIComponent(quoteId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.analytics || null;
  } catch (err) {
    console.warn('Failed to fetch live analytics:', err);
    return null;
  }
}

export async function sendTelemetryEvent(payload: TrackPayload): Promise<QuoteAnalytics | null> {
  try {
    const res = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.analytics || null;
  } catch (err) {
    console.warn('Failed to send telemetry event:', err);
    return null;
  }
}
