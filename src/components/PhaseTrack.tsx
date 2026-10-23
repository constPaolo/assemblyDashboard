import type { Order } from '@/data/types';
import { phaseStats, type PartRecords, type PhaseStatus } from '@/lib/metrics';
import { cn } from '@/lib/utils';

const fill: Record<PhaseStatus, string> = {
  done: 'bg-success',
  late: 'bg-danger',
  active: 'bg-foreground',
  'no-deadline': 'bg-foreground/50',
};

/**
 * The build as a row of phases. Each segment is as wide as its share of the
 * parts and fills up as they're finished; a late phase gets a red track.
 */
export function PhaseTrack({
  order,
  records,
  today,
  large = false,
  onSelect,
}: {
  order: Order;
  records: PartRecords;
  today: Date;
  large?: boolean;
  onSelect?: (phaseId: string) => void;
}) {
  return (
    <div className={cn('flex min-w-0', large ? 'gap-2' : 'gap-1')}>
      {order.phases.map(phase => {
        const s = phaseStats(phase, records, today);
        const Segment = onSelect ? 'button' : 'div';
        return (
          <Segment
            key={phase.id}
            title={`${phase.name}: ${s.done} of ${s.total} done`}
            onClick={onSelect ? () => onSelect(phase.id) : undefined}
            className={cn('min-w-0 basis-0 text-left', onSelect && 'group')}
            style={{ flexGrow: Math.max(phase.parts.length, 1) }}
          >
            <div
              className={cn(
                'overflow-hidden rounded-full',
                large ? 'h-2.5' : 'h-1.5',
                s.status === 'late' ? 'bg-danger/20' : 'bg-muted',
                onSelect && 'transition-opacity group-hover:opacity-80',
              )}
            >
              <div className={cn('h-full rounded-full transition-[width] duration-500', fill[s.status])} style={{ width: `${s.progress}%` }} />
            </div>
            <p className={cn('truncate text-muted-foreground', large ? 'mt-2 text-xs' : 'mt-1.5 text-[0.7rem]')}>
              <span className={cn(s.status === 'late' && 'text-danger', large && 'font-medium text-foreground')}>{phase.name}</span>
              <span className="tabular"> {s.done}/{s.total}</span>
            </p>
          </Segment>
        );
      })}
    </div>
  );
}
