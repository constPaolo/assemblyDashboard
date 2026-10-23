// Demo data for a fictional workshop that builds woodworking machines.
// Dates are relative to the day the app is opened, so the demo never goes stale.
import { toIsoDate } from '@/lib/metrics';
import type { Client, Company, DeliveryNote, Order, Part, Phase, StockItem, TeamMember } from './types';

const DAY = 24 * 60 * 60 * 1000;

/** ISO date `offset` days from today. */
function day(offset: number): string {
  return toIsoDate(new Date(Date.now() + offset * DAY));
}

/** A timestamp `daysAgo` days back, during working hours. */
function doneAt(daysAgo: number, seed: number): string {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(8 + (seed % 9), (seed * 17) % 60, 0, 0);
  return d.toISOString();
}

/**
 * Part state shorthand: `d3` done three days ago, `w` in progress,
 * `m` waiting on material, `-` not started.
 */
type PartSpec = [code: string, name: string, hours: number | null, state: string];

let partSeq = 0;

function phase(id: string, name: string, dueOffset: number | null, specs: PartSpec[]): Phase {
  const parts: Part[] = specs.map(([code, partName, hours, state]) => {
    partSeq += 1;
    const part: Part = { id: `${id}-${code}`, code, name: partName, hours };
    if (state.startsWith('d')) part.doneAt = doneAt(Number(state.slice(1)), partSeq);
    if (state === 'w') part.inProgress = true;
    if (state === 'm') part.missingMaterial = true;
    return part;
  });
  return { id, name, due: dueOffset === null ? null : day(dueOffset), parts };
}

export const orders: Order[] = [
  {
    id: 'sm-24-031',
    code: 'SM-24-031',
    name: 'Spindle moulder',
    client: 'Northwood Furniture',
    due: day(9),
    phases: [
      phase('sm-design', 'Design', -20, [
        ['DS-001', 'Main frame drawings', 16, 'd18'],
        ['DS-002', 'Control panel wiring diagram', 8, 'd16'],
        ['DS-003', 'CNC machining plan', 6, 'd15'],
      ]),
      phase('sm-elec', 'Electrical', -4, [
        ['EL-001', 'Three-phase inverter 5.5 kW', 3, 'm'],
        ['EL-002', 'Control cabinet assembly', 10, 'w'],
        ['EL-003', 'Safety relay and e-stop circuit', 4, '-'],
      ]),
      phase('sm-wood', 'Wood parts', 21, [
        ['WD-001', 'Infeed table, birch ply', 5, 'd6'],
        ['WD-002', 'Fence assembly', 4, '-'],
      ]),
      phase('sm-metal', 'Metalwork', 14, [
        ['MT-001', 'Spindle housing', 12, 'd4'],
        ['MT-002', 'Guard and hood', 6, 'd2'],
        ['MT-003', 'Base frame welding', 14, 'w'],
      ]),
    ],
  },
  {
    id: 'cr-25-008',
    code: 'CR-25-008',
    name: 'CNC router',
    client: 'Baltic Panels',
    due: day(52),
    phases: [
      phase('cr-design', 'Design', -6, [
        ['DS-010', 'Gantry structure model', 20, 'd12'],
        ['DS-011', 'Vacuum table layout', 6, 'd9'],
      ]),
      phase('cr-elec', 'Electrical', 20, [
        ['EL-010', 'Servo drives, X/Y/Z axes', 8, 'd3'],
        ['EL-011', 'Spindle VFD wiring', 4, 'w'],
        ['EL-012', 'PLC program and HMI', 16, '-'],
        ['EL-013', 'Tool length sensor', 2, '-'],
      ]),
      phase('cr-metal', 'Metalwork', 30, [
        ['MT-010', 'Gantry beam machining', 18, 'd1'],
        ['MT-011', 'Linear rail mounting', 8, 'w'],
        ['MT-012', 'Dust shoe', 3, '-'],
      ]),
    ],
  },
  {
    id: 'bs-25-022',
    code: 'BS-25-022',
    name: 'Band saw',
    client: 'Northwood Furniture',
    due: day(-3),
    phases: [
      phase('bs-design', 'Design', -30, [
        ['DS-020', 'Frame and wheel layout', 10, 'd25'],
      ]),
      phase('bs-metal', 'Metalwork', -6, [
        ['MT-020', 'Wheel balancing', 4, 'd8'],
        ['MT-021', 'Blade guides', 5, 'm'],
        ['MT-022', 'Cabinet panels', 6, '-'],
      ]),
      phase('bs-elec', 'Electrical', null, [
        ['EL-020', 'Motor starter and brake', 3, '-'],
      ]),
    ],
  },
  {
    id: 'ps-25-014',
    code: 'PS-25-014',
    name: 'Panel saw',
    client: 'Colombo Joinery',
    due: day(5),
    phases: [
      phase('ps-design', 'Design', -12, [
        ['DS-030', 'Sliding table drawings', 8, 'd13'],
        ['DS-031', 'Scoring unit detail', 4, 'd11'],
      ]),
      phase('ps-metal', 'Metalwork', 2, [
        ['MT-030', 'Sliding carriage', 12, 'd5'],
        ['MT-031', 'Rip fence', 5, 'd3'],
        ['MT-032', 'Saw arbor', 6, 'd2'],
        ['MT-033', 'Tilting mechanism', 8, 'w'],
      ]),
      phase('ps-elec', 'Electrical', 4, [
        ['EL-030', 'Main motor 7.5 kW', 3, 'd1'],
        ['EL-031', 'Control panel', 6, 'w'],
      ]),
    ],
  },
  {
    id: 'tl-25-019',
    code: 'TL-25-019',
    name: 'CNC lathe',
    client: 'Verdi Engineering',
    due: day(38),
    phases: [
      phase('tl-design', 'Design', -2, [
        ['DS-040', 'Headstock model', 14, 'd10'],
        ['DS-041', 'Tailstock model', 6, 'd7'],
      ]),
      phase('tl-metal', 'Metalwork', 24, [
        ['MT-040', 'Bed casting machining', 20, 'w'],
        ['MT-041', 'Turret mount', 8, '-'],
        ['MT-042', 'Chip conveyor', 6, '-'],
      ]),
      phase('tl-elec', 'Electrical', 32, [
        ['EL-040', 'Spindle drive', 6, '-'],
        ['EL-041', 'Coolant pump circuit', 2, '-'],
      ]),
    ],
  },
  {
    id: 'hp-25-007',
    code: 'HP-25-007',
    name: 'Hydraulic press',
    client: 'Neri & Sons Metalworks',
    due: day(2),
    phases: [
      phase('hp-design', 'Design', -25, [
        ['DS-050', 'Press frame calculations', 12, 'd22'],
      ]),
      phase('hp-hyd', 'Hydraulics', -1, [
        ['HY-050', 'Pump and tank unit', 8, 'd9'],
        ['HY-051', 'Main cylinder', 6, 'd6'],
        ['HY-052', 'Valve block and hoses', 5, 'd4'],
      ]),
      phase('hp-elec', 'Electrical', 3, [
        ['EL-050', 'Two-hand control', 3, 'd2'],
        ['EL-051', 'Light curtain', 2, 'd0'],
        ['EL-052', 'Final test and CE file', 6, 'w'],
      ]),
    ],
  },
  {
    id: 'eb-26-003',
    code: 'EB-26-003',
    name: 'Edge bander',
    client: 'Baltic Panels',
    due: day(84),
    phases: [
      phase('eb-design', 'Design', 12, [
        ['DS-060', 'Glue pot redesign', 10, 'w'],
        ['DS-061', 'Trimming unit', 8, '-'],
      ]),
      phase('eb-metal', 'Metalwork', null, [
        ['MT-060', 'Feed chain', 12, '-'],
        ['MT-061', 'Pressure beam', 6, '-'],
      ]),
    ],
  },
  {
    id: 'pb-25-011',
    code: 'PB-25-011',
    name: 'Paint booth',
    client: 'Colombo Joinery',
    due: day(27),
    phases: [
      phase('pb-design', 'Design', -8, [
        ['DS-070', 'Airflow simulation', 8, 'd9'],
        ['DS-071', 'Filter wall layout', 4, 'd8'],
      ]),
      phase('pb-struct', 'Structure', 10, [
        ['ST-070', 'Wall panels', 16, 'd2'],
        ['ST-071', 'Roof plenum', 10, 'w'],
        ['ST-072', 'Doors and seals', 6, 'm'],
      ]),
      phase('pb-elec', 'Electrical', 20, [
        ['EL-070', 'ATEX fan motor', 4, '-'],
        ['EL-071', 'Lighting', 3, '-'],
      ]),
    ],
  },
  {
    id: 'cv-26-002',
    code: 'CV-26-002',
    name: 'Belt conveyor',
    client: 'Oak & Line Studio',
    due: day(14),
    phases: [
      phase('cv-metal', 'Metalwork', 6, [
        ['MT-080', 'Side frames', 8, 'd5'],
        ['MT-081', 'Drive and idler rollers', 6, 'd3'],
        ['MT-082', 'Belt tensioner', 3, '-'],
      ]),
      phase('cv-elec', 'Electrical', 11, [
        ['EL-080', 'Gear motor and VFD', 4, '-'],
        ['EL-081', 'Photocell stop', 2, '-'],
      ]),
    ],
  },
  {
    id: 'dx-25-033',
    code: 'DX-25-033',
    name: 'Dust extraction system',
    client: 'Northwood Furniture',
    due: day(-1),
    phases: [
      phase('dx-design', 'Design', -40, [
        ['DS-090', 'Duct network sizing', 8, 'd35'],
      ]),
      phase('dx-install', 'Installation', -2, [
        ['IN-090', 'Cyclone separator', 10, 'd12'],
        ['IN-091', 'Ducting and gates', 14, 'd8'],
        ['IN-092', 'Fan commissioning', 4, 'd3'],
      ]),
    ],
  },
  {
    id: 'gr-26-005',
    code: 'GR-26-005',
    name: 'Gang rip saw',
    client: 'Verdi Engineering',
    due: null,
    phases: [
      phase('gr-design', 'Design', null, [
        ['DS-100', 'Arbor and blade spacing', 12, 'd1'],
        ['DS-101', 'Feed track concept', 6, 'w'],
        ['DS-102', 'Laser line guide', null, '-'],
      ]),
    ],
  },
];

export const stock: StockItem[] = [
  { id: 's1', code: 'LRG-20-1200', description: 'Linear rail HGR20, 1200 mm', category: 'Mechanical', supplier: 'HIWIN', unitCost: 48.5, unit: 'pc', quantity: 8, available: 5, location: 'A1-01' },
  { id: 's2', code: 'BSC-16-05', description: 'Ball screw Ø16, pitch 5', category: 'Mechanical', supplier: 'HIWIN', unitCost: 72, unit: 'pc', quantity: 6, available: 4, location: 'A1-02' },
  { id: 's3', code: 'MTR-BL-750', description: 'Brushless motor 750 W with encoder', category: 'Electrical', supplier: 'Leadshine', unitCost: 185, unit: 'pc', quantity: 10, available: 7, location: 'B2-01' },
  { id: 's4', code: 'INV-55K-3P', description: 'Three-phase inverter 5.5 kW', category: 'Electrical', supplier: 'ABB', unitCost: 320, unit: 'pc', quantity: 4, available: 0, location: 'B2-03' },
  { id: 's5', code: 'PLC-S71200', description: 'PLC S7-1200, CPU 1214C', category: 'Electrical', supplier: 'Siemens', unitCost: 410, unit: 'pc', quantity: 3, available: 1, location: 'B2-04' },
  { id: 's6', code: 'ALU-8080-6M', description: 'Aluminium profile 80×80, 6 m', category: 'Structural', supplier: 'item', unitCost: 95, unit: 'pc', quantity: 20, available: 14, location: 'C3-01' },
  { id: 's7', code: 'MDF-25-1208', description: 'MDF board 25 mm, 1200×800', category: 'Wood', supplier: 'Baltic Timber', unitCost: 22.5, unit: 'pc', quantity: 15, available: 9, location: 'C4-02' },
  { id: 's8', code: 'CBL-RVK-25', description: 'Power cable RV-K 2.5 mm²', category: 'Electrical', supplier: 'Prysmian', unitCost: 2.8, unit: 'm', quantity: 500, available: 320, location: 'D1-01' },
  { id: 's9', code: 'BLT-M8-40', description: 'Hex bolt M8×40, grade 8.8', category: 'Fasteners', supplier: 'Würth', unitCost: 0.18, unit: 'pc', quantity: 400, available: 90, location: 'D2-01' },
  { id: 's10', code: 'STL-S235-3', description: 'Steel sheet S235, 3 mm, 1000×2000', category: 'Structural', supplier: 'SSAB', unitCost: 64, unit: 'pc', quantity: 12, available: 8, location: 'E1-01' },
  { id: 's11', code: 'SEAL-DR-2M', description: 'Door seal EPDM, 2 m', category: 'Mechanical', supplier: 'Trelleborg', unitCost: 11.4, unit: 'pc', quantity: 10, available: 0, location: 'A2-05' },
];

export const deliveryNotes: DeliveryNote[] = [
  { id: 'dn-51', number: 'DN-2026-0051', date: day(-2), recipient: 'Northwood Furniture', value: 1240, status: 'sent' },
  { id: 'dn-50', number: 'DN-2026-0050', date: day(-4), recipient: 'Baltic Panels', value: 3870.5, status: 'sent' },
  { id: 'dn-49', number: 'DN-2026-0049', date: day(-7), recipient: 'Colombo Joinery', value: 560, status: 'sent' },
  { id: 'dn-48', number: 'DN-2026-0048', date: day(-12), recipient: 'Northwood Furniture', value: 2100, status: 'sent' },
  { id: 'dn-47', number: 'DN-2026-0047', date: day(-16), recipient: 'Verdi Engineering', value: 980.75, status: 'draft' },
  { id: 'dn-46', number: 'DN-2026-0046', date: day(-24), recipient: 'Baltic Panels', value: 4500, status: 'sent' },
  { id: 'dn-45', number: 'DN-2026-0045', date: day(-31), recipient: 'Colombo Joinery', value: 320, status: 'sent' },
  { id: 'dn-44', number: 'DN-2026-0044', date: day(-37), recipient: 'Oak & Line Studio', value: 1650, status: 'draft' },
];

export const company: Company = {
  name: 'Brightwood Machinery',
  address: '14 Mill Lane',
  city: 'Riga',
  postalCode: 'LV-1050',
  country: 'Latvia',
  vat: 'LV00000000000',
  email: 'office@brightwood.example',
  phone: '+371 2000 0000',
};

export const clients: Client[] = [
  { name: 'Northwood Furniture', address: '3 Forest Road', city: 'Jelgava', postalCode: 'LV-3001', country: 'Latvia' },
  { name: 'Baltic Panels', address: '88 Harbour Street', city: 'Liepāja', postalCode: 'LV-3401', country: 'Latvia' },
  { name: 'Colombo Joinery', address: '12 Via dei Mille', city: 'Como', postalCode: '22100', country: 'Italy' },
  { name: 'Verdi Engineering', address: '7 Industrial Park', city: 'Tartu', postalCode: '50101', country: 'Estonia' },
  { name: 'Neri & Sons Metalworks', address: '45 Foundry Lane', city: 'Kaunas', postalCode: '44001', country: 'Lithuania' },
  { name: 'Oak & Line Studio', address: '21 Elizabetes iela', city: 'Riga', postalCode: 'LV-1010', country: 'Latvia' },
];

export const team: TeamMember[] = [
  { id: 't1', name: 'Anna Ozola', email: 'anna@brightwood.example', role: 'admin', active: true },
  { id: 't2', name: 'Marco Bellini', email: 'marco@brightwood.example', role: 'admin', active: true },
  { id: 't3', name: 'Jānis Kalniņš', email: 'janis@brightwood.example', role: 'operator', active: true },
  { id: 't4', name: 'Eva Lind', email: 'eva@brightwood.example', role: 'operator', active: true },
  { id: 't5', name: 'Tomas Petraitis', email: 'tomas@brightwood.example', role: 'operator', active: false },
];
