import ICAL from 'ical.js';
import type { CalendarEvent } from '../types';

export function parseICS(icsText: string): CalendarEvent[] {
  const jcal = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents('vevent');

  const seen = new Set<string>();
  const results: CalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const uid = event.uid || crypto.randomUUID();

    // Skip duplicates (e.g. RRULE exceptions with same UID)
    if (seen.has(uid)) continue;
    seen.add(uid);

    const dtstart = event.startDate;
    const dtend = event.endDate;

    const isAllDay =
      dtstart.icaltype === 'date' ||
      (dtstart.hour === 0 && dtstart.minute === 0 && dtend.hour === 0 && dtend.minute === 0);

    results.push({
      id: uid,
      title: event.summary || '(No title)',
      start: dtstart.toJSDate(),
      end: dtend.toJSDate(),
      allDay: isAllDay,
      description: event.description || '',
      location: event.location || '',
      visible: true,
      color: '',
    });
  }

  return results;
}

export interface FetchICSOptions {
  strict?: 'utokyo';
}

export async function fetchICS(
  url: string,
  proxyBase?: string,
  opts?: FetchICSOptions,
): Promise<string> {
  const res = proxyBase
    ? await fetch(proxyBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...(opts?.strict ? { strict: opts.strict } : {}) }),
      })
    : await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`読み込みに失敗しました (${res.status}): ${text || res.statusText}`);
  }
  return res.text();
}
