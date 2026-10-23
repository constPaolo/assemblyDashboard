import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react';
import { orders } from '@/data/seed';
import { useStore } from '@/lib/store';
import { partRecords } from '@/lib/state';
import { DUE_SOON_DAYS, completionsByDay, openHoursByClient, orderStats, type OrderStats, type OrderStatus } from '@/lib/metrics';
import { attentionItems } from '@/lib/attention';
import { formatDate, formatDaysLeft, plural } from '@/lib/format';
import { BarList, EmptyState, MetricStrip, Page, PageHeader, Panel, PanelHeader } from '@/components/Layout';
import { AttentionList } from '@/components/Attention';
import { PhaseTrack } from '@/components/PhaseTrack';
import { CompletionChart } from '@/components/CompletionChart';
import { orderLabel, orderTone, toneText } from '@/lib/tones';
import { cn } from '@/lib/utils';

type Filter = 'all' | OrderStatus;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'late', label: 'Late' },
  { value: 'behind', label: 'Behind' },
  { value: 'due-soon', label: 'Due soon' },
  { value: 'on-track', label: 'On track' },
  { value: 'no-deadline', label: 'No deadline' },
  { value: 'done', label: 'Done' },
];

/** Late first, then by due date; done orders last. */
const statusOrder: Record<OrderStatus, number> = { late: 0, behind: 1, 'due-soon': 2, 'on-track': 3, 'no-deadline': 4, done: 5 };

export function OrdersPage() {
  const navigate = useNavigate();
  const records = useStore(partRecords);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const today = useMemo(() => new Date(), []);

  const rows = useMemo(
    () =>
      orders
        .map(order => ({ order, stats: orderStats(order, records, today) }))
        .sort(
          (a, b) =>
            statusOrder[a.stats.status] - statusOrder[b.stats.status] ||
            (a.stats.daysLeft ?? Infinity) - (b.stats.daysLeft ?? Infinity),
        ),
    [records, today],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: rows.length, late: 0, behind: 0, 'due-soon': 0, 'on-track': 0, 'no-deadline': 0, done: 0 };
    rows.forEach(r => (c[r.stats.status] += 1));
    return c;
  }, [rows]);

  const visible = rows.filter(({ order, stats }) => {
    const q = query.trim().toLowerCase();
    const matches = !q || [order.name, order.code, order.client].some(s => s.toLowerCase().includes(q));
    return matches && (filter === 'all' || stats.status === filter);
  });

  const attention = useMemo(() => attentionItems(rows), [rows]);
  const daily = useMemo(() => completionsByDay(orders, records, 14, today), [records, today]);
  const byClient = useMemo(() => openHoursByClient(orders, records), [records]);
  const open = rows.filter(r => r.stats.status !== 'done');
  const clients = new Set(open.map(r => r.order.client)).size;
  const week = daily.slice(-7);
  const previousWeek = daily.slice(0, 7);
  const hoursThisWeek = week.reduce((s, d) => s + d.hours, 0);
  const hoursLeft = byClient.reduce((s, c) => s + c.hours, 0);
  const shipping = open.filter(r => r.stats.daysLeft !== null && r.stats.daysLeft >= 0 && r.stats.daysLeft <= DUE_SOON_DAYS).length;

  return (
    <Page>
      <PageHeader
        title="In production"
        description={`${plural(open.length, 'machine')} in the workshop for ${plural(clients, 'client')}`}
      />

      {attention.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium">Needs attention</h2>
          <AttentionList items={attention.slice(0, 6)} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium">Machines</h2>
        <Panel>
          <div className="flex flex-col gap-3 border-b px-5 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-1">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
                    filter === f.value ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                  <span className="text-xs text-muted-foreground tabular">{counts[f.value]}</span>
                </button>
              ))}
            </div>
            <label className="relative block md:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-full rounded-lg border bg-background pr-8 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>

          {visible.length === 0 ? (
            <EmptyState>No machines match.</EmptyState>
          ) : (
            <ul className="divide-y">
              {visible.map(({ order, stats }) => (
                <li key={order.id}>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-8 gap-y-3 px-5 py-4 text-left transition-colors hover:bg-accent/40 md:grid-cols-[15rem_minmax(0,1fr)_7.5rem_1rem]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.client} · <span className="font-mono">{order.code}</span>
                      </p>
                    </div>
                    <div className="col-span-2 row-start-2 md:col-span-1 md:row-start-auto">
                      <PhaseTrack order={order} records={records} today={today} />
                    </div>
                    <Delivery stats={stats} due={order.due} />
                    <ChevronRight className="hidden size-4 text-muted-foreground md:block" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium">This week</h2>
        <MetricStrip
          metrics={[
            {
              label: 'Parts finished',
              value: week.reduce((s, d) => s + d.parts, 0),
              hint: <Trend current={week.reduce((s, d) => s + d.parts, 0)} previous={previousWeek.reduce((s, d) => s + d.parts, 0)} />,
            },
            {
              label: 'Hours of work done',
              value: `${hoursThisWeek}h`,
              hint: <Trend current={hoursThisWeek} previous={previousWeek.reduce((s, d) => s + d.hours, 0)} />,
            },
            { label: 'Machines shipping', value: shipping, hint: 'in the next 7 days' },
            { label: 'Work left', value: `${hoursLeft}h`, hint: 'estimated, all machines' },
          ]}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <Panel>
            <PanelHeader title="Parts finished per day" description="Last 14 days" />
            <CompletionChart data={daily} />
          </Panel>
          <Panel>
            <PanelHeader title="Work left by client" description="Estimated hours" />
            <BarList items={byClient.map(c => ({ label: c.client, value: c.hours }))} format={v => `${v}h`} />
          </Panel>
        </div>
      </section>
    </Page>
  );
}

function Delivery({ stats, due }: { stats: OrderStats; due: string | null }) {
  const tone = orderTone[stats.status];
  return (
    <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
      <p className={cn('text-sm font-medium', toneText[tone])}>
        {stats.status === 'done' || stats.daysLeft === null
          ? orderLabel[stats.status]
          : stats.status === 'late'
            ? formatDaysLeft(stats.daysLeft)
            : due && formatDate(due)}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground tabular">{stats.progress}% built</p>
    </div>
  );
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <span>nothing last week</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  return (
    <span>
      <span className={change >= 0 ? toneText.success : toneText.danger}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </span>{' '}
      vs last week
    </span>
  );
}
