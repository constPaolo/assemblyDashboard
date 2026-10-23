import { cn } from '@/lib/utils';
import { toneBg, type Tone } from '@/lib/tones';

export function Dot({ tone, className }: { tone: Tone; className?: string }) {
  return <span className={cn('inline-block size-1.5 shrink-0 rounded-full', toneBg[tone], className)} />;
}

/** Small outlined pill with a coloured dot. */
export function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap">
      <Dot tone={tone} />
      {children}
    </span>
  );
}

/** Thin progress bar. The fill uses the tone colour, or ink for neutral. */
export function Bar({ value, tone = 'neutral', className }: { value: number; tone?: Tone; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', toneBg[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
