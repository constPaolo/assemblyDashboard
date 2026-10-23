import type { Order } from '@/data/types';
import { DUE_SOON_DAYS, type OrderStats } from './metrics';
import { formatDaysLeft, plural } from './format';

export interface AttentionItem {
  key: string;
  kind: 'late' | 'behind' | 'material' | 'shipping';
  title: string;
  detail: string;
  orderId: string;
}

/** Late machines and phases first, then missing material, then what ships this week. */
export function attentionItems(rows: { order: Order; stats: OrderStats }[]): AttentionItem[] {
  const late: AttentionItem[] = [];
  const material: AttentionItem[] = [];
  const shipping: AttentionItem[] = [];
  for (const { order, stats } of rows) {
    if (stats.status === 'done') continue;
    if (stats.status === 'late' && stats.daysLeft !== null) {
      late.push({
        key: `late-${order.id}`,
        kind: 'late',
        title: `${order.name} is ${formatDaysLeft(stats.daysLeft)}`,
        detail: `${order.client} · ${stats.progress}% built`,
        orderId: order.id,
      });
    }
    // A late machine already has its own card; don't repeat its phases.
    for (const phase of stats.status === 'late' ? [] : stats.latePhases) {
      late.push({
        key: `behind-${phase.id}`,
        kind: 'behind',
        title: `${order.name} is behind on ${phase.name.toLowerCase()}`,
        detail: `${order.client} · ${stats.progress}% built`,
        orderId: order.id,
      });
    }
    for (const part of stats.missingMaterial) {
      material.push({
        key: `mat-${part.id}`,
        kind: 'material',
        title: `Waiting on ${part.name.charAt(0).toLowerCase()}${part.name.slice(1)}`,
        detail: `${order.name} · ${part.code}`,
        orderId: order.id,
      });
    }
    if (stats.daysLeft !== null && stats.daysLeft >= 0 && stats.daysLeft <= DUE_SOON_DAYS) {
      const when = stats.daysLeft === 0 ? 'today' : stats.daysLeft === 1 ? 'tomorrow' : `in ${stats.daysLeft} days`;
      shipping.push({
        key: `ship-${order.id}`,
        kind: 'shipping',
        title: `${order.name} ships ${when}`,
        detail: `${stats.progress}% built · ${plural(stats.total - stats.done, 'part')} to go`,
        orderId: order.id,
      });
    }
  }
  return [...late, ...material, ...shipping];
}
