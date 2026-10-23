// Everything the UI shows about an order is derived here, from the seed data
// plus what people marked on the floor. Pure functions, so they're testable.
import type { Order, Part, Phase } from '@/data/types';

/** What was marked in the app, overriding the seed state of a part. */
export interface PartRecord {
  doneAt: string | null;
  /** Completed while material was still missing. */
  forced?: boolean;
}

export type PartRecords = Record<string, PartRecord>;

/** `behind`: a phase is past its deadline, but the delivery date isn't yet. */
export type OrderStatus = 'done' | 'late' | 'behind' | 'due-soon' | 'on-track' | 'no-deadline';
export type PhaseStatus = 'done' | 'late' | 'active' | 'no-deadline';
export type RiskLevel = 'low' | 'medium' | 'high';

const DAY = 24 * 60 * 60 * 1000;
export const DUE_SOON_DAYS = 7;

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Parses YYYY-MM-DD as a local date (`new Date()` would read it as UTC). */
export function parseIsoDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole days from `today` to an ISO date; negative when it's in the past. */
export function daysUntil(isoDate: string, today: Date): number {
  return Math.round((parseIsoDate(isoDate).getTime() - startOfDay(today).getTime()) / DAY);
}

export function partDoneAt(part: Part, records: PartRecords): string | null {
  const record = records[part.id];
  if (record) return record.doneAt;
  return part.doneAt ?? null;
}

export function isDone(part: Part, records: PartRecords): boolean {
  return partDoneAt(part, records) !== null;
}

export function isForced(part: Part, records: PartRecords): boolean {
  return records[part.id]?.forced === true;
}

export interface PhaseStats {
  total: number;
  done: number;
  progress: number;
  status: PhaseStatus;
}

export function phaseStats(phase: Phase, records: PartRecords, today: Date): PhaseStats {
  const total = phase.parts.length;
  const done = phase.parts.filter(p => isDone(p, records)).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  let status: PhaseStatus;
  if (total > 0 && done === total) status = 'done';
  else if (!phase.due) status = 'no-deadline';
  else if (daysUntil(phase.due, today) < 0) status = 'late';
  else status = 'active';
  return { total, done, progress, status };
}

export interface OrderStats {
  total: number;
  done: number;
  progress: number;
  status: OrderStatus;
  daysLeft: number | null;
  hoursPlanned: number;
  hoursDone: number;
  unestimated: number;
  missingMaterial: Part[];
  latePhases: Phase[];
  idlePhases: Phase[];
  blockers: number;
  risk: number;
  riskLevel: RiskLevel;
}

export function orderStats(order: Order, records: PartRecords, today: Date): OrderStats {
  const parts = order.phases.flatMap(p => p.parts);
  const total = parts.length;
  const done = parts.filter(p => isDone(p, records)).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const daysLeft = order.due ? daysUntil(order.due, today) : null;
  const phases = order.phases.map(phase => ({ phase, stats: phaseStats(phase, records, today) }));
  const latePhases = phases.filter(p => p.stats.status === 'late').map(p => p.phase);

  let status: OrderStatus;
  if (total > 0 && done === total) status = 'done';
  else if (daysLeft !== null && daysLeft < 0) status = 'late';
  else if (latePhases.length > 0) status = 'behind';
  else if (daysLeft === null) status = 'no-deadline';
  else if (daysLeft <= DUE_SOON_DAYS) status = 'due-soon';
  else status = 'on-track';

  const estimated = parts.filter(p => p.hours !== null);
  const hoursPlanned = estimated.reduce((s, p) => s + (p.hours ?? 0), 0);
  const hoursDone = estimated.filter(p => isDone(p, records)).reduce((s, p) => s + (p.hours ?? 0), 0);

  const open = parts.filter(p => !isDone(p, records));
  const missingMaterial = open.filter(p => p.missingMaterial);
  const idlePhases = phases
    .filter(p => p.stats.done === 0 && p.stats.total > 0 && !p.phase.parts.some(part => part.inProgress))
    .map(p => p.phase);

  const risk = status === 'done' ? 0 : delayRisk({
    daysLeft,
    latePhases: latePhases.length,
    missingMaterial: missingMaterial.length,
    notStartedShare: open.filter(p => !p.inProgress).length / Math.max(total, 1),
    progress,
  });

  return {
    total,
    done,
    progress,
    status,
    daysLeft,
    hoursPlanned,
    hoursDone,
    unestimated: total - estimated.length,
    missingMaterial,
    latePhases,
    idlePhases,
    blockers: missingMaterial.length + latePhases.length + idlePhases.length,
    risk,
    riskLevel: risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low',
  };
}

/**
 * A rough 0–100 score of how likely the order is to ship late. It is a
 * heuristic meant to sort attention, not a forecast.
 */
export function delayRisk(input: {
  daysLeft: number | null;
  latePhases: number;
  missingMaterial: number;
  notStartedShare: number;
  progress: number;
}): number {
  let risk = 0;
  if (input.daysLeft !== null) {
    if (input.daysLeft < 0) risk += 45;
    else if (input.daysLeft <= DUE_SOON_DAYS) risk += 30;
    else if (input.daysLeft <= 21) risk += 15;
  }
  risk += input.latePhases * 18;
  risk += input.missingMaterial * 12;
  risk += Math.round(input.notStartedShare * 20);
  if (input.progress < 40) risk += 10;
  return Math.min(100, risk);
}

/** Short, ordered to-do list for the people on the floor. */
export function nextActions(order: Order, stats: OrderStats): string[] {
  const actions: string[] = [];
  for (const phase of stats.latePhases) {
    actions.push(`${phase.name} is past its deadline`);
  }
  for (const part of stats.missingMaterial) {
    actions.push(`Chase material for ${part.code} · ${part.name}`);
  }
  for (const phase of stats.idlePhases.filter(p => !stats.latePhases.includes(p))) {
    actions.push(`Start ${phase.name.toLowerCase()}`);
  }
  if (actions.length === 0 && stats.status !== 'done') {
    const next = order.phases.flatMap(p => p.parts).find(p => p.inProgress);
    actions.push(next ? `Keep going on ${next.code} · ${next.name}` : 'Nothing blocking, keep the pace');
  }
  return actions;
}

export interface DayCount {
  date: string;
  parts: number;
  hours: number;
}

/** Parts and estimated hours completed per day, oldest first. */
export function completionsByDay(orders: Order[], records: PartRecords, days: number, today: Date): DayCount[] {
  const end = startOfDay(today).getTime();
  const buckets: DayCount[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(end - (days - 1 - i) * DAY);
    return { date: toIsoDate(d), parts: 0, hours: 0 };
  });
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const part of orders.flatMap(o => o.phases.flatMap(p => p.parts))) {
    const at = partDoneAt(part, records);
    if (!at) continue;
    const i = index.get(toIsoDate(new Date(at)));
    if (i === undefined) continue;
    buckets[i].parts += 1;
    buckets[i].hours += part.hours ?? 0;
  }
  return buckets;
}

/** Remaining estimated hours per client, largest first. */
export function openHoursByClient(orders: Order[], records: PartRecords): { client: string; hours: number }[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    const hours = order.phases
      .flatMap(p => p.parts)
      .filter(p => !isDone(p, records))
      .reduce((s, p) => s + (p.hours ?? 0), 0);
    if (hours > 0) totals.set(order.client, (totals.get(order.client) ?? 0) + hours);
  }
  return [...totals].map(([client, hours]) => ({ client, hours })).sort((a, b) => b.hours - a.hours);
}
