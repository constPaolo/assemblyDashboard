import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Hand, Monitor, Moon, Package, Settings, Sun, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { companyStore, themeStore, touchStore, type Theme } from '@/lib/state';

const nav: { to: string; label: string; short?: string; icon: typeof ClipboardList }[] = [
  { to: '/', label: 'Production', icon: ClipboardList },
  { to: '/stock', label: 'Stock', icon: Package },
  { to: '/delivery-notes', label: 'Delivery notes', short: 'Deliveries', icon: Truck },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function useActive() {
  const { pathname } = useLocation();
  return (to: string) => (to === '/' ? pathname === '/' || pathname.startsWith('/orders/') : pathname.startsWith(to));
}

export function AppShell({ children }: { children: ReactNode }) {
  const touch = useStore(touchStore);
  return (
    <div className="min-h-screen">
      {/* Sidebar on desktop; bottom bar on phones and in touch mode. */}
      <Sidebar className={cn('no-print', touch ? 'hidden' : 'hidden md:flex')} />
      <div className={cn('print:p-0', touch ? 'pb-24' : 'pb-24 md:pb-0 md:pl-60')}>{children}</div>
      <BottomBar className={cn('no-print', touch ? 'flex' : 'flex md:hidden')} />
    </div>
  );
}

function Sidebar({ className }: { className?: string }) {
  const isActive = useActive();
  const company = useStore(companyStore);
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 w-60 flex-col border-r bg-background', className)}>
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-8">
        <Logo />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Assembly</p>
          <p className="truncate text-xs text-muted-foreground">{company.name}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors',
              isActive(to)
                ? 'bg-accent font-medium text-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t px-4 py-4">
        <ThemeSwitch />
        <button
          onClick={() => touchStore.set(t => !t)}
          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <Hand className="size-4" />
          Touch mode
        </button>
      </div>
    </aside>
  );
}

function BottomBar({ className }: { className?: string }) {
  const isActive = useActive();
  return (
    <nav className={cn('fixed inset-x-0 bottom-0 z-40 h-[4.5rem] items-stretch border-t bg-background/95 backdrop-blur', className)}>
      {nav.map(({ to, label, short, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors',
            isActive(to) ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
          {short ?? label}
        </NavLink>
      ))}
    </nav>
  );
}

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeSwitch() {
  const theme = useStore(themeStore);
  return (
    <div className="flex rounded-lg bg-muted p-0.5" role="radiogroup" aria-label="Theme">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => themeStore.set(value)}
          className={cn(
            'flex h-7 flex-1 items-center justify-center rounded-md transition-colors',
            theme === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex size-8 shrink-0 flex-col justify-center gap-[3px] rounded-[0.6rem] bg-primary px-2', className)}>
      <span className="h-[3px] w-4 rounded-full bg-primary-foreground" />
      <span className="h-[3px] w-[11px] rounded-full bg-primary-foreground" />
      <span className="h-[3px] w-1.5 rounded-full bg-primary-foreground" />
    </span>
  );
}
