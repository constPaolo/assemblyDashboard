import type { OrderStatus, PhaseStatus, RiskLevel } from './metrics';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'muted';

export const toneBg: Record<Tone, string> = {
  neutral: 'bg-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  muted: 'bg-muted-foreground/50',
};

export const toneText: Record<Tone, string> = {
  neutral: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted-foreground',
};

export const orderTone: Record<OrderStatus, Tone> = {
  done: 'success',
  late: 'danger',
  behind: 'warning',
  'due-soon': 'warning',
  'on-track': 'neutral',
  'no-deadline': 'muted',
};

export const orderLabel: Record<OrderStatus, string> = {
  done: 'Done',
  late: 'Late',
  behind: 'Behind',
  'due-soon': 'Due soon',
  'on-track': 'On track',
  'no-deadline': 'No deadline',
};

export const phaseTone: Record<PhaseStatus, Tone> = {
  done: 'success',
  late: 'danger',
  active: 'neutral',
  'no-deadline': 'muted',
};

export const riskTone: Record<RiskLevel, Tone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};
