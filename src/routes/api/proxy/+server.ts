import type { RequestHandler } from './$types';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 10_000; // 10s

const ALLOWED_HOSTS = [
  'calendar.google.com',
  'outlook.office365.com',
  'outlook.live.com',
  'calendar.icloud.com',
  'u-tokyo.ac.jp',
];

export const GET: RequestHandler = async ({ url }) => {
  const target = url.searchParams.get('url');
  if (!target) {
    return new Response('Missing url parameter', { status: 400 });
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

  const hostAllowed = ALLOWED_HOSTS.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
  );
  if (!hostAllowed) {
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
      return new Response(`Upstream error: ${res.status}`, { status: 502 });
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
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return new Response('Request timed out', { status: 504 });
    }
    return new Response(`Fetch error: ${e}`, { status: 502 });
  }
};
