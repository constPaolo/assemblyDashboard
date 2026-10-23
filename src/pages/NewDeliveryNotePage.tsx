import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { clients, stock } from '@/data/seed';
import type { Client } from '@/data/types';
import { useStore } from '@/lib/store';
import { companyStore, notesStore } from '@/lib/state';
import { toIsoDate } from '@/lib/metrics';
import { formatMoney } from '@/lib/format';
import { Page, PageHeader, Panel, PanelHeader } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Line {
  itemId: string;
  quantity: number;
}

const emptyRecipient: Client = { name: '', address: '', city: '', postalCode: '', country: '' };

function nextNumber(numbers: string[], year: number): string {
  const last = Math.max(0, ...numbers.map(n => Number(n.split('-').pop()) || 0));
  return `DN-${year}-${String(last + 1).padStart(4, '0')}`;
}

export function NewDeliveryNotePage() {
  const navigate = useNavigate();
  const company = useStore(companyStore);
  const notes = useStore(notesStore);
  const [number] = useState(() => nextNumber(notes.map(n => n.number), new Date().getFullYear()));
  const [date, setDate] = useState(() => toIsoDate(new Date()));
  const [recipient, setRecipient] = useState<Client>(emptyRecipient);
  const [lines, setLines] = useState<Line[]>([]);
  const [notesText, setNotesText] = useState('');
  const [adding, setAdding] = useState('');

  const items = lines.map(l => ({ ...l, item: stock.find(s => s.id === l.itemId)! }));
  const total = items.reduce((s, l) => s + l.item.unitCost * l.quantity, 0);
  const canSave = recipient.name.trim() !== '' && lines.length > 0;

  const save = (status: 'sent' | 'draft') => {
    notesStore.set(prev => [
      { id: `dn-${Date.now()}`, number, date, recipient: recipient.name.trim(), value: Math.round(total * 100) / 100, status },
      ...prev,
    ]);
    if (status === 'sent') window.print();
    navigate('/delivery-notes');
  };

  const setQuantity = (itemId: string, quantity: number) =>
    setLines(ls => ls.map(l => (l.itemId === itemId ? { ...l, quantity: Math.max(1, quantity) } : l)));

  return (
    <Page className="max-w-4xl">
      <PageHeader
        back={{ label: 'Delivery notes', onClick: () => navigate('/delivery-notes') }}
        title="New delivery note"
        description={<span className="font-mono">{number}</span>}
        actions={
          <>
            <Button variant="outline" disabled={!canSave} onClick={() => save('draft')}>
              Save draft
            </Button>
            <Button disabled={!canSave} onClick={() => save('sent')}>
              Save and print
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelHeader title="From" description="Edit in Settings" />
          <address className="px-5 pb-5 text-sm leading-relaxed not-italic text-muted-foreground">
            <span className="text-foreground">{company.name}</span>
            <br />
            {company.address}
            <br />
            {company.postalCode} {company.city}, {company.country}
            <br />
            VAT {company.vat}
          </address>
        </Panel>

        <Panel>
          <PanelHeader title="To" />
          <div className="space-y-3 px-5 pb-5">
            <div className="space-y-1.5">
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={clients.some(c => c.name === recipient.name) ? recipient.name : ''}
                onChange={e => setRecipient(clients.find(c => c.name === e.target.value) ?? emptyRecipient)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Choose a client…</option>
                {clients.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={recipient.address} onChange={e => setRecipient(r => ({ ...r, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={recipient.city} onChange={e => setRecipient(r => ({ ...r, city: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postal">Postal code</Label>
                <Input id="postal" value={recipient.postalCode} onChange={e => setRecipient(r => ({ ...r, postalCode: e.target.value }))} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Items"
          right={
            <div className="flex items-center gap-2">
              <Label htmlFor="ship-date" className="text-xs text-muted-foreground">
                Ship date
              </Label>
              <Input id="ship-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 w-40" />
            </div>
          }
        />
        <ul className="divide-y border-t">
          {items.map(({ itemId, quantity, item }) => (
            <li key={itemId} className="flex items-center gap-4 px-5 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate">{item.description}</p>
                <p className="font-mono text-xs text-muted-foreground">{item.code}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="size-7" onClick={() => setQuantity(itemId, quantity - 1)} aria-label="Less">
                  <Minus />
                </Button>
                <span className="w-14 text-center tabular">
                  {quantity} {item.unit}
                </span>
                <Button size="icon" variant="ghost" className="size-7" onClick={() => setQuantity(itemId, quantity + 1)} aria-label="More">
                  <Plus />
                </Button>
              </div>
              <span className="w-24 text-right tabular">{formatMoney(item.unitCost * quantity)}</span>
              <Button
                size="icon"
                variant="ghost"
                className="no-print size-7 text-muted-foreground"
                onClick={() => setLines(ls => ls.filter(l => l.itemId !== itemId))}
                aria-label="Remove"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
          <li className="no-print flex items-center gap-2 px-5 py-3">
            <select
              value={adding}
              onChange={e => setAdding(e.target.value)}
              className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
              aria-label="Item to add"
            >
              <option value="">Add an item from stock…</option>
              {stock
                .filter(s => !lines.some(l => l.itemId === s.id))
                .map(s => (
                  <option key={s.id} value={s.id} disabled={s.available === 0}>
                    {s.code} · {s.description}
                    {s.available === 0 ? ' (out of stock)' : ''}
                  </option>
                ))}
            </select>
            <Button
              variant="outline"
              disabled={!adding}
              onClick={() => {
                setLines(ls => [...ls, { itemId: adding, quantity: 1 }]);
                setAdding('');
              }}
            >
              Add
            </Button>
          </li>
        </ul>
        <div className="flex justify-between border-t px-5 py-3 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium tabular">{formatMoney(total)}</span>
        </div>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader title="Notes" />
        <div className="px-5 pb-5">
          <Textarea
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            placeholder="Delivery instructions, carrier, packaging…"
            rows={3}
            className="resize-none"
          />
        </div>
      </Panel>
    </Page>
  );
}
