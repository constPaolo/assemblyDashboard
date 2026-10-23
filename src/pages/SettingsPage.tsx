import { useState } from 'react';
import type { Company } from '@/data/types';
import { useStore } from '@/lib/store';
import { companyStore, resetDemo, touchStore } from '@/lib/state';
import { Page, PageHeader, Panel, PanelHeader } from '@/components/Layout';
import { ThemeSwitch } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const fields: { key: keyof Company; label: string; wide?: boolean }[] = [
  { key: 'name', label: 'Company name', wide: true },
  { key: 'address', label: 'Address', wide: true },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal code' },
  { key: 'country', label: 'Country' },
  { key: 'vat', label: 'VAT number' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];

export function SettingsPage() {
  const company = useStore(companyStore);
  const touch = useStore(touchStore);
  const [form, setForm] = useState(company);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(company);

  return (
    <Page className="max-w-3xl">
      <PageHeader title="Settings" />

      <Panel>
        <PanelHeader title="Company" description="Printed on delivery notes and job sheets." />
        <form
          className="grid gap-3 px-5 pb-5 sm:grid-cols-2"
          onSubmit={e => {
            e.preventDefault();
            companyStore.set(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 1600);
          }}
        >
          {fields.map(f => (
            <div key={f.key} className={cn('space-y-1.5', f.wide && 'sm:col-span-2')}>
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input id={f.key} value={form[f.key]} onChange={e => setForm(c => ({ ...c, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2 sm:col-span-2">
            <Button type="submit" disabled={!dirty}>
              Save
            </Button>
            {saved && <span className="text-sm text-muted-foreground">Saved</span>}
          </div>
        </form>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader title="Display" />
        <div className="divide-y border-t">
          <div className="flex items-center justify-between gap-6 px-5 py-4">
            <div>
              <p className="text-sm">Theme</p>
              <p className="text-xs text-muted-foreground">Follows your system unless you pick one.</p>
            </div>
            <div className="w-32">
              <ThemeSwitch />
            </div>
          </div>
          <div className="flex items-center justify-between gap-6 px-5 py-4">
            <div>
              <p className="text-sm">Touch mode</p>
              <p className="text-xs text-muted-foreground">Larger text and targets for a tablet on the shop floor.</p>
            </div>
            <button
              role="switch"
              aria-checked={touch}
              onClick={() => touchStore.set(t => !t)}
              className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', touch ? 'bg-primary' : 'bg-input')}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow transition-transform',
                  touch && 'translate-x-5',
                )}
              />
            </button>
          </div>
        </div>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader title="Demo data" />
        <div className="flex items-center justify-between gap-6 border-t px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Everything is stored in this browser. Resetting brings back the sample workshop.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('Reset all orders, team and settings to the sample data?')) {
                resetDemo();
                setForm(companyStore.get());
              }
            }}
          >
            Reset
          </Button>
        </div>
      </Panel>
    </Page>
  );
}
