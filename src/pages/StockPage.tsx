import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { stock } from '@/data/seed';
import { formatMoney } from '@/lib/format';
import { EmptyState, MetricStrip, Page, PageHeader, Panel } from '@/components/Layout';
import { Bar } from '@/components/Status';
import { toneText } from '@/lib/tones';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = ['All', ...new Set(stock.map(i => i.category))];

/** Below this share of the usual quantity an item is worth reordering. */
const LOW_STOCK = 0.3;

export function StockPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const q = query.trim().toLowerCase();
  const visible = stock.filter(
    i =>
      (category === 'All' || i.category === category) &&
      (!q || [i.code, i.description, i.supplier].some(s => s.toLowerCase().includes(q))),
  );

  const outOfStock = stock.filter(i => i.available === 0).length;
  const low = stock.filter(i => i.available > 0 && i.available / i.quantity < LOW_STOCK).length;
  const value = stock.reduce((s, i) => s + i.available * i.unitCost, 0);

  return (
    <Page>
      <PageHeader
        title="Stock"
        description="Parts and material on the shelves."
        actions={<Button onClick={() => navigate('/delivery-notes/new')}>New delivery note</Button>}
      />

      <MetricStrip
        metrics={[
          { label: 'Items', value: stock.length, hint: `${categories.length - 1} categories` },
          { label: 'Out of stock', value: <span className={outOfStock ? toneText.danger : undefined}>{outOfStock}</span> },
          { label: 'Running low', value: <span className={low ? toneText.warning : undefined}>{low}</span>, hint: 'under 30% of usual stock' },
          { label: 'Value on hand', value: formatMoney(value) },
        ]}
      />

      <Panel className="mt-4">
        <div className="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'h-8 rounded-lg px-3 text-sm transition-colors',
                  category === c ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="relative block md:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stock"
              className="h-9 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <EmptyState>No items match.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Item</th>
                  <th className="px-3 py-2.5 font-medium">Supplier</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 text-right font-medium">Unit cost</th>
                  <th className="w-48 px-5 py-2.5 font-medium">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t">
                {visible.map(item => {
                  const share = item.available / item.quantity;
                  const tone = item.available === 0 ? 'danger' : share < LOW_STOCK ? 'warning' : 'neutral';
                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p>{item.description}</p>
                        <p className="font-mono text-xs text-muted-foreground">{item.code}</p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.supplier}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{item.location}</td>
                      <td className="px-3 py-3 text-right tabular">{formatMoney(item.unitCost)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Bar value={share * 100} tone={tone} />
                          <span className={cn('w-20 shrink-0 text-right text-xs tabular', tone === 'neutral' ? 'text-muted-foreground' : toneText[tone])}>
                            {item.available}/{item.quantity} {item.unit}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </Page>
  );
}
