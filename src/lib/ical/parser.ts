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
  let fetchUrl: string;
  if (proxyBase) {
    const params = new URLSearchParams({ url });
    if (opts?.strict) params.set('strict', opts.strict);
    fetchUrl = `${proxyBase}?${params.toString()}`;
  } else {
    fetchUrl = url;
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch ICS: ${res.status} ${res.statusText}`);
  }
  return res.text();
}
