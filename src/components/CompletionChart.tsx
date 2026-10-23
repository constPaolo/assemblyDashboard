import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayCount } from '@/lib/metrics';
import { formatDate } from '@/lib/format';

/** Parts completed per day. Colours come from CSS variables, so it themes itself. */
export function CompletionChart({ data }: { data: DayCount[] }) {
  return (
    <div className="h-56 px-2 pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="completions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.14} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={d => formatDate(d)}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as DayCount;
              return (
                <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                  <p className="font-medium">{formatDate(d.date)}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {d.parts} parts · {d.hours}h
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="parts"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            fill="url(#completions)"
            isAnimationActive={false}
            activeDot={{ r: 3, fill: 'var(--foreground)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
