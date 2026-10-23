import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { TeamMember } from '@/data/types';
import { useStore } from '@/lib/store';
import { teamStore } from '@/lib/state';
import { Page, PageHeader, Panel } from '@/components/Layout';
import { StatusPill } from '@/components/Status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Draft = Omit<TeamMember, 'id' | 'active'>;

const emptyDraft: Draft = { name: '', email: '', role: 'operator' };

export function TeamPage() {
  const team = useStore(teamStore);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const open = (member?: TeamMember) => {
    setDraft(member ? { name: member.name, email: member.email, role: member.role } : emptyDraft);
    setEditing(member?.id ?? 'new');
  };

  const save = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    teamStore.set(t =>
      editing === 'new'
        ? [...t, { id: `t${Date.now()}`, active: true, ...draft }]
        : t.map(m => (m.id === editing ? { ...m, ...draft } : m)),
    );
    setEditing(null);
  };

  const update = (id: string, patch: Partial<TeamMember>) => teamStore.set(t => t.map(m => (m.id === id ? { ...m, ...patch } : m)));

  return (
    <Page className="max-w-4xl">
      <PageHeader
        title="Team"
        description="Admins manage orders and settings. Operators mark work as done."
        actions={
          <Button onClick={() => open()}>
            <Plus />
            Add person
          </Button>
        }
      />

      {editing && (
        <Panel className="mb-4">
          <form
            className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_9rem_auto] sm:items-end"
            onSubmit={e => {
              e.preventDefault();
              save();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={draft.role}
                onChange={e => setDraft(d => ({ ...d, role: e.target.value as Draft['role'] }))}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <ul className="divide-y">
          {team.map(member => (
            <li key={member.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {member.name
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={member.active ? 'text-sm' : 'text-sm text-muted-foreground'}>{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground capitalize sm:inline">{member.role}</span>
              <button onClick={() => update(member.id, { active: !member.active })} title="Toggle access">
                <StatusPill tone={member.active ? 'success' : 'muted'}>{member.active ? 'Active' : 'Inactive'}</StatusPill>
              </button>
              <Button size="icon" variant="ghost" className="size-8 text-muted-foreground" onClick={() => open(member)} aria-label={`Edit ${member.name}`}>
                <Pencil />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground"
                onClick={() => {
                  if (confirm(`Remove ${member.name} from the team?`)) teamStore.set(t => t.filter(m => m.id !== member.id));
                }}
                aria-label={`Remove ${member.name}`}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </Page>
  );
}
