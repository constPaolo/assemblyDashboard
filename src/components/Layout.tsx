import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn('mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8', className)}>{children}</main>;
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { label: string; onClick: () => void };
  meta?: ReactNode;
}) {
  return (
    <header className="pt-8 pb-6 sm:pt-10">
      {back && (
        <button
          onClick={back.onClick}
          className="no-print mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {back.label}
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Bordered surface. Children decide their own padding. */
export function Panel({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, right }: { title: ReactNode; description?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
      <div className="min-w-0">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export interface Metric {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

/** A row of headline numbers split by hairlines, Arc/Vercel analytics style. */
export function MetricStrip({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <Panel className={className}>
      {/* 1px gaps over a border-coloured background draw the dividers. */}
      <dl className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-card px-5 py-4">
            <dt className="text-xs text-muted-foreground">{m.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight tabular">{m.value}</dd>
            {m.hint && <dd className="mt-1 text-xs text-muted-foreground">{m.hint}</dd>}
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/** Rows whose background fills in proportion to their value. */
export function BarList({ items, format }: { items: { label: string; value: number }[]; format: (v: number) => string }) {
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <ul className="space-y-1 px-3 pb-3">
      {items.map(item => (
        <li key={item.label} className="relative flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm">
          <span className="absolute inset-y-0 left-0 rounded-md bg-muted" style={{ width: `${(item.value / max) * 100}%` }} />
          <span className="relative truncate">{item.label}</span>
          <span className="relative text-muted-foreground tabular">{format(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-5 py-12 text-center text-sm text-muted-foreground">{children}</div>;
}
