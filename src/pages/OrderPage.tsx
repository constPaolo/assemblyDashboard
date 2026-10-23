import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { orders } from '@/data/seed';
import { useStore } from '@/lib/store';
import { partRecords } from '@/lib/state';
import { nextActions, orderStats, phaseStats } from '@/lib/metrics';
import { formatDate, formatDaysLeft, plural } from '@/lib/format';
import { MetricStrip, Page, PageHeader, Panel, PanelHeader } from '@/components/Layout';
import { Bar, StatusPill } from '@/components/Status';
import { orderLabel, orderTone, phaseTone, riskTone, toneText } from '@/lib/tones';
import { PartRow } from '@/components/PartRow';
import { PhaseTrack } from '@/components/PhaseTrack';
import { Button } from '@/components/ui/button';

const riskLabel = { low: 'Low', medium: 'Medium', high: 'High' };

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const records = useStore(partRecords);
  const today = useMemo(() => new Date(), []);
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <Page className="py-24 text-center">
        <p className="text-sm text-muted-foreground">This order doesn't exist.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/')}>
          Back to production
        </Button>
      </Page>
    );
  }

  const stats = orderStats(order, records, today);
  const actions = nextActions(order, stats);
  const tone = orderTone[stats.status];

  return (
    <Page>
      <PageHeader
        back={{ label: 'Production', onClick: () => navigate('/') }}
        title={order.name}
        description={
          <>
            {order.client} · <span className="font-mono text-xs">{order.code}</span>
          </>
        }
        meta={
          <>
            <StatusPill tone={tone}>{orderLabel[stats.status]}</StatusPill>
            {order.due && (
              <span className="text-xs text-muted-foreground">
                Delivery {formatDate(order.due, { year: true })}
                {stats.status !== 'done' && stats.daysLeft !== null && (
                  <span className={toneText[tone]}> · {formatDaysLeft(stats.daysLeft)}</span>
                )}
              </span>
            )}
          </>
        }
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            Print job sheet
          </Button>
        }
      />

      <Panel className="mb-4 px-5 pt-5 pb-4">
        <PhaseTrack
          order={order}
          records={records}
          today={today}
          large
          onSelect={phaseId => document.getElementById(phaseId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      </Panel>

      <MetricStrip
        metrics={[
          {
            label: 'Progress',
            value: `${stats.progress}%`,
            hint: `${stats.done} of ${plural(stats.total, 'part')} done`,
          },
          {
            label: 'Delay risk',
            value: <span className={toneText[riskTone[stats.riskLevel]]}>{stats.risk}%</span>,
            hint: riskLabel[stats.riskLevel],
          },
          {
            label: 'Blockers',
            value: <span className={stats.blockers ? toneText.warning : undefined}>{stats.blockers}</span>,
            hint: `${stats.missingMaterial.length} material · ${stats.latePhases.length} late · ${stats.idlePhases.length} not started`,
          },
          {
            label: 'Hours',
            value: (
              <>
                {stats.hoursDone}h <span className="text-sm font-normal text-muted-foreground">/ {stats.hoursPlanned}h</span>
              </>
            ),
            hint: stats.unestimated ? `${plural(stats.unestimated, 'part')} without an estimate` : 'All parts estimated',
          },
        ]}
      />

      <Panel className="mt-4">
        <PanelHeader title="Next up" />
        <ul className="space-y-1 px-3 pb-3">
          {actions.slice(0, 4).map(action => (
            <li key={action} className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm">
              <ArrowRight className="size-3.5 text-muted-foreground" />
              {action}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-4 space-y-4">
        {order.phases.map(phase => {
          const s = phaseStats(phase, records, today);
          const phaseToneValue = phaseTone[s.status];
          return (
            <Panel key={phase.id} id={phase.id} className="scroll-mt-6">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-medium">{phase.name}</h2>
                  <StatusPill tone={phaseToneValue}>
                    {s.status === 'done'
                      ? 'Done'
                      : s.status === 'late'
                        ? `Late · ${formatDate(phase.due!)}`
                        : phase.due
                          ? `Due ${formatDate(phase.due)}`
                          : 'No deadline'}
                  </StatusPill>
                </div>
                <div className="flex w-48 items-center gap-3">
                  <Bar value={s.progress} tone={s.status === 'late' ? 'danger' : s.status === 'done' ? 'success' : 'neutral'} />
                  <span className="w-16 text-right text-xs text-muted-foreground tabular">
                    {s.done}/{s.total}
                  </span>
                </div>
              </div>
              <ul className="border-t">
                {phase.parts.map(part => (
                  <PartRow key={part.id} part={part} records={records} />
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>
    </Page>
  );
}
