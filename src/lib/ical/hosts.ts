// Hosts that the calendar proxy is allowed to fetch from.
export const ALLOWED_HOSTS = [
  'calendar.google.com',
  'outlook.office365.com',
  'outlook.live.com',
  'calendar.icloud.com',
  'u-tokyo.ac.jp',
] as const;

// Hosts permitted in the utokyo strict mode (`?strict=utokyo`).
export const UTOKYO_HOSTS = ['u-tokyo.ac.jp'] as const;

export function isHostAllowed(hostname: string, hosts: readonly string[]): boolean {
  return hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}
