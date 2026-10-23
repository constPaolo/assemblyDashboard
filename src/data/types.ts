export interface Part {
  id: string;
  code: string;
  name: string;
  /** Estimated hours, if someone has estimated it. */
  hours: number | null;
  /** Completion time in the seed data; the live value comes from the store. */
  doneAt?: string;
  inProgress?: boolean;
  /** Waiting on material: can only be completed by forcing it. */
  missingMaterial?: boolean;
}

export interface Phase {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD) or null when the phase has no deadline. */
  due: string | null;
  parts: Part[];
}

export interface Order {
  id: string;
  code: string;
  /** The machine being built. */
  name: string;
  client: string;
  due: string | null;
  phases: Phase[];
}

export interface StockItem {
  id: string;
  code: string;
  description: string;
  category: string;
  supplier: string;
  unitCost: number;
  unit: 'pc' | 'm';
  quantity: number;
  available: number;
  location: string;
}

export interface DeliveryNote {
  id: string;
  number: string;
  date: string;
  recipient: string;
  value: number;
  status: 'sent' | 'draft';
}

export interface Company {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  vat: string;
  email: string;
  phone: string;
}

export interface Client {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  active: boolean;
}
