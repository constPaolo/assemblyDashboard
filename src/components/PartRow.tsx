import { useState } from 'react';
import { AlertTriangle, Check, Clock } from 'lucide-react';
import type { Part } from '@/data/types';
import { isForced, partDoneAt, toIsoDate, type PartRecords } from '@/lib/metrics';
import { markDone, markForced, markOpen } from '@/lib/state';
import { formatTimestamp } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Panel = null | 'when' | 'today' | 'other' | 'force';

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * One part of a phase. Tapping an open part asks when it was finished
 * (operators often log work after the fact); tapping a done part reopens it.
 */
export function PartRow({ part, records }: { part: Part; records: PartRecords }) {
  const doneAt = partDoneAt(part, records);
  const forced = isForced(part, records);
  const [panel, setPanel] = useState<Panel>(null);
  const [time, setTime] = useState(nowTime);
  const [date, setDate] = useState(() => toIsoDate(new Date()));

  const toggle = () => {
    if (doneAt) {
      markOpen(part.id);
      return;
    }
    setTime(nowTime());
    setPanel(p => (p ? null : part.missingMaterial ? 'force' : 'when'));
  };

  const finish = (at: Date) => {
    markDone(part.id, at);
    setPanel(null);
  };

  return (
    <li className="border-t first:border-t-0">
      <div className="flex items-center gap-3 px-5 py-3">
        <button
          onClick={toggle}
          aria-label={doneAt ? `Reopen ${part.code}` : `Complete ${part.code}`}
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            doneAt
              ? forced
                ? 'border-warning bg-warning text-white'
                : 'border-foreground bg-foreground text-background'
              : panel
                ? 'border-foreground'
                : 'border-input hover:border-muted-foreground',
          )}
        >
          {doneAt && <Check className="size-3" strokeWidth={3} />}
        </button>

        <button onClick={toggle} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 text-left">
          <span className="font-mono text-xs text-muted-foreground">{part.code}</span>
          <span className={cn('text-sm', doneAt && 'text-muted-foreground line-through decoration-muted-foreground/40')}>
            {part.name}
          </span>
          {!doneAt && part.missingMaterial && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
              <AlertTriangle className="size-3" />
              Missing material
            </span>
          )}
          {!doneAt && !part.missingMaterial && part.inProgress && (
            <span className="text-xs text-muted-foreground">In progress</span>
          )}
          {forced && doneAt && <span className="text-xs font-medium text-warning">Forced</span>}
        </button>

        <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground tabular">
          {doneAt && <span className="hidden sm:inline">{formatTimestamp(doneAt)}</span>}
          <span className="inline-flex w-10 items-center justify-end gap-1">
            <Clock className="size-3" />
            {part.hours === null ? '—' : `${part.hours}h`}
          </span>
        </div>
      </div>

      {panel && !doneAt && (
        <div className="mx-5 mb-3 ml-13 rounded-lg border bg-muted/40 p-3">
          {panel === 'force' ? (
            <div className="space-y-3">
              <p className="text-sm">
                The material for this part hasn't arrived. Mark it done anyway? It will be flagged as forced.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPanel(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    markForced(part.id);
                    setPanel(null);
                  }}
                >
                  Complete anyway
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">When was it finished?</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => finish(new Date())}>
                  Just now
                </Button>
                <Button size="sm" variant={panel === 'today' ? 'secondary' : 'outline'} onClick={() => setPanel('today')}>
                  Earlier today
                </Button>
                <Button size="sm" variant={panel === 'other' ? 'secondary' : 'outline'} onClick={() => setPanel('other')}>
                  Another day
                </Button>
              </div>
              {panel !== 'when' && (
                <form
                  className="flex flex-wrap items-center gap-2 pt-1"
                  onSubmit={e => {
                    e.preventDefault();
                    const at = new Date(`${panel === 'other' ? date : toIsoDate(new Date())}T${time}`);
                    if (!Number.isNaN(at.getTime())) finish(at);
                  }}
                >
                  {panel === 'other' && (
                    <input
                      type="date"
                      value={date}
                      max={toIsoDate(new Date())}
                      onChange={e => setDate(e.target.value)}
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                    />
                  )}
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                  />
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
