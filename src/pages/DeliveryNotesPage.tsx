import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { notesStore } from '@/lib/state';
import { formatDate, formatMoney } from '@/lib/format';
import { daysUntil } from '@/lib/metrics';
import { MetricStrip, Page, PageHeader, Panel } from '@/components/Layout';
import { StatusPill } from '@/components/Status';
import { Button } from '@/components/ui/button';

export function DeliveryNotesPage() {
  const navigate = useNavigate();
  const notes = useStore(notesStore);
  const drafts = notes.filter(n => n.status === 'draft').length;
  const today = new Date();
  const last30 = notes.filter(n => daysUntil(n.date, today) > -30);

  return (
    <Page>
      <PageHeader
        title="Delivery notes"
        description="Documents that travel with every shipment."
        actions={<Button onClick={() => navigate('/delivery-notes/new')}>New delivery note</Button>}
      />

      <MetricStrip
        metrics={[
          { label: 'Notes', value: notes.length },
          { label: 'Drafts', value: drafts, hint: drafts ? 'not sent yet' : undefined },
          { label: 'Shipped, last 30 days', value: last30.filter(n => n.status === 'sent').length },
          { label: 'Value, last 30 days', value: formatMoney(last30.reduce((s, n) => s + n.value, 0)) },
        ]}
      />

      <Panel className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Number</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Recipient</th>
                <th className="px-3 py-2.5 text-right font-medium">Value</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {notes.map(note => (
                <tr key={note.id}>
                  <td className="px-5 py-3 font-mono text-xs">{note.number}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(note.date, { year: true })}</td>
                  <td className="px-3 py-3">{note.recipient}</td>
                  <td className="px-3 py-3 text-right tabular">{formatMoney(note.value)}</td>
                  <td className="px-5 py-3">
                    <StatusPill tone={note.status === 'sent' ? 'success' : 'muted'}>
                      {note.status === 'sent' ? 'Sent' : 'Draft'}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Page>
  );
}
