import { useNavigate } from 'react-router-dom';
import { AlarmClock, Clock, PackageX, Truck } from 'lucide-react';
import type { AttentionItem } from '@/lib/attention';
import { cn } from '@/lib/utils';

const kinds = {
  late: { icon: AlarmClock, style: 'bg-danger/10 text-danger' },
  behind: { icon: Clock, style: 'bg-danger/10 text-danger' },
  material: { icon: PackageX, style: 'bg-warning/15 text-warning' },
  shipping: { icon: Truck, style: 'bg-foreground/[0.06] text-foreground' },
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const navigate = useNavigate();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item => {
        const { icon: Icon, style } = kinds[item.kind];
        return (
          <button
            key={item.key}
            onClick={() => navigate(`/orders/${item.orderId}`)}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-ring/40"
          >
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', style)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.title}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.detail}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
