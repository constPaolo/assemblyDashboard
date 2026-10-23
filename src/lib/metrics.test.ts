import { describe, expect, it } from 'vitest';
import type { Order } from '@/data/types';
import { completionsByDay, delayRisk, nextActions, orderStats, phaseStats } from './metrics';

const today = new Date(2026, 9, 23, 10, 0);

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1',
    code: 'T-1',
    name: 'Test machine',
    client: 'Client',
    due: '2026-11-20',
    phases: [
      {
        id: 'design',
        name: 'Design',
        due: '2026-10-20',
        parts: [
          { id: 'a', code: 'A', name: 'Drawings', hours: 4, doneAt: '2026-10-21T09:00:00' },
          { id: 'b', code: 'B', name: 'Review', hours: 2 },
        ],
      },
      {
        id: 'build',
        name: 'Build',
        due: null,
        parts: [{ id: 'c', code: 'C', name: 'Frame', hours: null, missingMaterial: true }],
      },
    ],
    ...overrides,
  };
}

describe('phaseStats', () => {
  it('flags a phase past its deadline as late', () => {
    expect(phaseStats(order().phases[0], {}, today).status).toBe('late');
  });

  it('treats a fully done phase as done even after its deadline', () => {
    const records = { b: { doneAt: '2026-10-22T10:00:00' } };
    expect(phaseStats(order().phases[0], records, today)).toMatchObject({ status: 'done', progress: 100 });
  });

  it('lets a record reopen a part that the seed marks done', () => {
    expect(phaseStats(order().phases[0], { a: { doneAt: null } }, today).done).toBe(0);
  });
});

describe('orderStats', () => {
  it('counts parts, hours and blockers', () => {
    const s = orderStats(order(), {}, today);
    expect(s).toMatchObject({ total: 3, done: 1, progress: 33, hoursPlanned: 6, hoursDone: 4, unestimated: 1 });
    expect(s.missingMaterial.map(p => p.id)).toEqual(['c']);
    expect(s.latePhases.map(p => p.id)).toEqual(['design']);
    expect(s.idlePhases.map(p => p.id)).toEqual(['build']);
  });

  it('derives the status from the delivery date', () => {
    // Design is done here, so no phase is late.
    const designDone = { b: { doneAt: '2026-10-22T10:00:00' } };
    expect(orderStats(order({ due: '2026-10-20' }), designDone, today).status).toBe('late');
    expect(orderStats(order({ due: '2026-10-27' }), designDone, today).status).toBe('due-soon');
    expect(orderStats(order(), designDone, today).status).toBe('on-track');
    expect(orderStats(order({ due: null }), designDone, today).status).toBe('no-deadline');
  });

  it('is behind when a phase is late but the delivery date is not', () => {
    expect(orderStats(order(), {}, today).status).toBe('behind');
    expect(orderStats(order({ due: '2026-10-20' }), {}, today).status).toBe('late');
  });

  it('has no risk once everything is done', () => {
    const all = { a: { doneAt: 'x' }, b: { doneAt: 'x' }, c: { doneAt: 'x', forced: true } };
    expect(orderStats(order({ due: '2026-10-01' }), all, today)).toMatchObject({ status: 'done', risk: 0 });
  });
});

describe('delayRisk', () => {
  it('is capped at 100', () => {
    expect(delayRisk({ daysLeft: -10, latePhases: 3, missingMaterial: 4, notStartedShare: 1, progress: 0 })).toBe(100);
  });

  it('is low for an order with time and no blockers', () => {
    expect(delayRisk({ daysLeft: 40, latePhases: 0, missingMaterial: 0, notStartedShare: 0.2, progress: 60 })).toBe(4);
  });
});

describe('nextActions', () => {
  it('lists late phases, then missing material, then idle phases', () => {
    const o = order();
    expect(nextActions(o, orderStats(o, {}, today))).toEqual([
      'Design is past its deadline',
      'Chase material for C · Frame',
      'Start build',
    ]);
  });
});

describe('completionsByDay', () => {
  it('buckets completions by local day, oldest first', () => {
    const days = completionsByDay([order()], { b: { doneAt: '2026-10-23T08:30:00' } }, 3, today);
    expect(days.map(d => [d.date, d.parts, d.hours])).toEqual([
      ['2026-10-21', 1, 4],
      ['2026-10-22', 0, 0],
      ['2026-10-23', 1, 2],
    ]);
  });
});
