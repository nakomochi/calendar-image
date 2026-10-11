import type { RequestHandler } from './$types';
import { ALLOWED_HOSTS, UTOKYO_HOSTS, isHostAllowed } from '$lib/ical/hosts';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 10_000; // 10s

interface ProxyRequestBody {
  url?: unknown;
  strict?: unknown;
}

function originHost(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

export const POST: RequestHandler = async ({ request, url }) => {
  // Compare hosts only: behind a TLS-terminating proxy the server sees http
  // while the browser's Origin is https.
  const origin = request.headers.get('origin');
  if (origin && originHost(origin) !== url.host) {
    return new Response('Forbidden origin', { status: 403 });
  }

  let payload: ProxyRequestBody;
  try {
    payload = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const target = payload?.url;
  if (typeof target !== 'string' || !target) {
    return new Response('Missing url', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return new Response('Only HTTPS URLs are allowed', { status: 400 });
  }

  const allowed = payload.strict === 'utokyo' ? UTOKYO_HOSTS : ALLOWED_HOSTS;
  if (!isHostAllowed(parsed.hostname, allowed)) {
    return new Response(`Host not allowed: ${parsed.hostname}`, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const res = await fetch(target, {
      signal: controller.signal,
      redirect: 'manual',
    });
    clearTimeout(timeout);

    if (res.status >= 300 && res.status < 400) {
      return new Response('Redirects are not allowed', { status: 403 });
    }

    if (!res.ok) {
      return new Response(`Upstream error: ${res.status} ${res.statusText}`, { status: res.status });
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return new Response('Response too large', { status: 413 });
    }

    const body = await res.text();

    if (body.length > MAX_SIZE) {
      return new Response('Response too large', { status: 413 });
    }

    if (!body.trimStart().startsWith('BEGIN:VCALENDAR')) {
      return new Response('Not a valid iCalendar file', { status: 422 });
    }

    return new Response(body, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return new Response('Request timed out', { status: 504 });
    }
    return new Response('Failed to fetch calendar', { status: 502 });
  }
};
