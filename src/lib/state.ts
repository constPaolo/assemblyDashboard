// App-wide state, persisted in localStorage. The seed in `data/seed.ts` is the
// starting point; these stores hold what changed since.
import { company as seedCompany, deliveryNotes as seedNotes, team as seedTeam } from '@/data/seed';
import type { Company, DeliveryNote, TeamMember } from '@/data/types';
import type { PartRecords } from './metrics';
import { persistent } from './store';

export const partRecords = persistent<PartRecords>('assembly.parts', {});
export const companyStore = persistent<Company>('assembly.company', seedCompany);
export const teamStore = persistent<TeamMember[]>('assembly.team', seedTeam);
export const notesStore = persistent<DeliveryNote[]>('assembly.notes', seedNotes);

export function markDone(partId: string, at: Date) {
  partRecords.set(r => ({ ...r, [partId]: { doneAt: at.toISOString() } }));
}

export function markForced(partId: string) {
  partRecords.set(r => ({ ...r, [partId]: { doneAt: new Date().toISOString(), forced: true } }));
}

export function markOpen(partId: string) {
  partRecords.set(r => ({ ...r, [partId]: { doneAt: null } }));
}

export function resetDemo() {
  [partRecords, companyStore, teamStore, notesStore].forEach(s => s.reset());
}

// ─── Display preferences ──────────────────────────────────────────────────────

export type Theme = 'system' | 'light' | 'dark';

// index.html reads these two keys before first paint to avoid a flash.
export const themeStore = persistent<Theme>('assembly.theme', 'system');
export const touchStore = persistent<boolean>('assembly.touch', false);

const media = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme() {
  const theme = themeStore.get();
  const dark = theme === 'dark' || (theme === 'system' && media.matches);
  document.documentElement.classList.toggle('dark', dark);
}

function applyTouch() {
  if (touchStore.get()) document.documentElement.dataset.touch = '';
  else delete document.documentElement.dataset.touch;
}

themeStore.subscribe(applyTheme);
touchStore.subscribe(applyTouch);
media.addEventListener('change', applyTheme);
applyTheme();
applyTouch();
