import { parseIsoDate } from './metrics';

const LOCALE = 'en-GB';

export function formatDate(isoDate: string, opts: { year?: boolean } = {}): string {
  return parseIsoDate(isoDate).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    ...(opts.year ? { year: 'numeric' } : {}),
  });
}

/** "today", "in 3 days", "2 days late". */
export function formatDaysLeft(days: number): string {
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  if (days > 0) return `in ${days} days`;
  if (days === -1) return '1 day late';
  return `${-days} days late`;
}

/** "Today 14:05", "Yesterday 09:12", "12 Nov 16:40". */
export function formatTimestamp(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Today ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  return `${d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })} ${time}`;
}

export function formatMoney(value: number): string {
  return value.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR' });
}

export function plural(n: number, word: string, pluralWord = `${word}s`): string {
  return `${n} ${n === 1 ? word : pluralWord}`;
}
