import type { ReactNode } from 'react';
import {
  Bed,
  Cabinet,
  Carton,
  Chair,
  CoffeeTable,
  Desk,
  DiningTable,
  Fridge,
  KitchenCounter,
  MeetingTable,
  Monitor,
  OfficeChair,
  Plant,
  Printer,
  ServerRack,
  Sofa,
  TvUnit,
  Wardrobe,
} from './Props';
import { LABELS } from './palette';

export type ItemKind =
  | 'sofa' | 'coffee' | 'tv' | 'bed' | 'wardrobe' | 'counter' | 'fridge' | 'dining' | 'chair' | 'plant'
  | 'desk' | 'monitor' | 'officeChair' | 'meeting' | 'cabinet' | 'rack' | 'printer' | 'carton';

export type LayoutItem = {
  kind: ItemKind;
  /** Floor position inside a 7 × 5 cutaway, as [x, z]. */
  pos: [number, number];
  y?: number;
  rot?: number;
  /** Bounding size used for the protective-wrap overlay. */
  size: [number, number, number];
  wrap?: boolean;
  label?: string;
};

export function renderItem(item: LayoutItem): ReactNode {
  switch (item.kind) {
    case 'sofa': return <Sofa />;
    case 'coffee': return <CoffeeTable />;
    case 'tv': return <TvUnit />;
    case 'bed': return <Bed />;
    case 'wardrobe': return <Wardrobe />;
    case 'counter': return <KitchenCounter />;
    case 'fridge': return <Fridge />;
    case 'dining': return <DiningTable />;
    case 'chair': return <Chair />;
    case 'plant': return <Plant />;
    case 'desk': return <Desk />;
    case 'monitor': return <Monitor />;
    case 'officeChair': return <OfficeChair />;
    case 'meeting': return <MeetingTable />;
    case 'cabinet': return <Cabinet />;
    case 'rack': return <ServerRack />;
    case 'printer': return <Printer />;
    case 'carton': return <Carton label={item.label} />;
  }
}

const CARTON: [number, number, number] = [0.48, 0.4, 0.48];
const carton = (x: number, z: number, label?: string, rot = 0): LayoutItem => ({ kind: 'carton', pos: [x, z], size: CARTON, label, rot });

export const homeLayout: LayoutItem[] = [
  { kind: 'counter', pos: [-1.85, -2.18], size: [2.4, 0.95, 0.6] },
  { kind: 'fridge', pos: [-3.05, -2.12], size: [0.7, 1.85, 0.66], wrap: true },
  { kind: 'sofa', pos: [-2.0, -0.55], size: [2.0, 1.0, 0.92], wrap: true },
  { kind: 'coffee', pos: [-2.0, 0.65], size: [1.0, 0.4, 0.55] },
  { kind: 'tv', pos: [-3.15, 0.95], rot: Math.PI / 2, size: [1.5, 1.38, 0.42], wrap: true },
  { kind: 'dining', pos: [0.2, -0.9], size: [1.4, 0.8, 0.85] },
  { kind: 'chair', pos: [-0.2, -0.3], rot: Math.PI, size: [0.44, 0.95, 0.44] },
  { kind: 'chair', pos: [0.6, -0.3], rot: Math.PI, size: [0.44, 0.95, 0.44] },
  { kind: 'chair', pos: [-0.2, -1.5], size: [0.44, 0.95, 0.44] },
  { kind: 'chair', pos: [0.6, -1.5], size: [0.44, 0.95, 0.44] },
  { kind: 'bed', pos: [2.55, -1.42], size: [1.66, 1.1, 2.1], wrap: true },
  { kind: 'wardrobe', pos: [3.12, 0.95], rot: -Math.PI / 2, size: [1.2, 2.0, 0.6], wrap: true },
  { kind: 'plant', pos: [0.95, 1.9], size: [0.5, 1.2, 0.5] },
];

export const homeCartons: LayoutItem[] = [
  carton(-0.9, 1.5), carton(-0.35, 1.95, undefined, 0.3), carton(-1.35, 2.0),
  carton(-1.55, -1.45), carton(-2.4, -1.4, undefined, -0.2),
  carton(1.0, 0.35), carton(0.45, 0.85),
  carton(2.0, 0.4), carton(2.55, 0.45, undefined, 0.25), carton(2.25, 1.2),
  carton(1.6, 1.55), carton(-0.9, 0.9),
];

const desks: LayoutItem[] = [];
for (const z of [0.0, 1.5]) {
  for (const x of [-0.4, 1.0, 2.4]) {
    desks.push({ kind: 'desk', pos: [x, z], size: [1.2, 0.8, 0.7] });
    desks.push({ kind: 'monitor', pos: [x, z - 0.15], y: 0.765, size: [0.62, 0.55, 0.2], wrap: true });
    desks.push({ kind: 'officeChair', pos: [x, z + 0.58], rot: Math.PI, size: [0.5, 1.05, 0.5] });
  }
}

export const officeLayout: LayoutItem[] = [
  ...desks,
  { kind: 'meeting', pos: [-2.2, -1.4], size: [2.0, 0.8, 1.0] },
  { kind: 'officeChair', pos: [-2.7, -0.78], rot: Math.PI, size: [0.5, 1.05, 0.5] },
  { kind: 'officeChair', pos: [-1.7, -0.78], rot: Math.PI, size: [0.5, 1.05, 0.5] },
  { kind: 'officeChair', pos: [-2.7, -2.02], size: [0.5, 1.05, 0.5] },
  { kind: 'officeChair', pos: [-1.7, -2.02], size: [0.5, 1.05, 0.5] },
  { kind: 'rack', pos: [3.0, -2.1], size: [0.7, 1.9, 0.7], wrap: true },
  { kind: 'printer', pos: [1.9, -2.1], size: [0.7, 0.95, 0.6], wrap: true },
  { kind: 'cabinet', pos: [-3.1, 0.6], rot: Math.PI / 2, size: [0.6, 1.14, 0.6] },
  { kind: 'cabinet', pos: [-3.1, 1.3], rot: Math.PI / 2, size: [0.6, 1.14, 0.6] },
  { kind: 'plant', pos: [-1.3, 2.0], size: [0.5, 1.2, 0.5] },
];

export const officeCartons: LayoutItem[] = [
  carton(0.1, 0.98, LABELS[0]), carton(1.5, 0.98, LABELS[0], 0.2), carton(2.9, 0.98, LABELS[0]),
  carton(0.1, 2.2, LABELS[1]), carton(1.5, 2.2, LABELS[1]), carton(2.9, 2.2, LABELS[1], -0.2),
  carton(-2.3, -0.1, LABELS[2]), carton(-1.6, 0.05, LABELS[2]),
  carton(2.4, -1.3, LABELS[3]), carton(3.0, -1.2, LABELS[3], 0.3),
  carton(-2.4, 1.8, LABELS[2]), carton(-2.4, 1.0, LABELS[2]),
];

/** Areas visitors can select to highlight in the cutaway. */
export const zones: Record<string, [number, number]> = {
  living: [-2.1, 0.1],
  kitchen: [-2.2, -1.9],
  dining: [0.2, -0.9],
  bedroom: [2.55, -0.9],
  cartons: [0.6, 1.3],
  workstations: [1.0, 0.75],
  meeting: [-2.2, -1.4],
  it: [2.45, -2.0],
  storage: [-2.9, 1.0],
};
