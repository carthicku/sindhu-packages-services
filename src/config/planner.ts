import { Building2, Home, MapPin, Package, Route, Sparkles, type LucideIcon } from 'lucide-react';

export type MoveType = 'home' | 'office' | 'local' | 'long-distance' | 'packing' | 'other';

export type MoveTypeOption = {
  id: MoveType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Set to false to remove an option the company does not offer. */
  enabled: boolean;
};

export const moveTypes: MoveTypeOption[] = [
  { id: 'home', label: 'Home Relocation', description: 'Apartments, houses and personal belongings', icon: Home, enabled: true },
  { id: 'office', label: 'Office Relocation', description: 'Workstations, equipment and business essentials', icon: Building2, enabled: true },
  { id: 'local', label: 'Local Moving', description: 'Within a city or to a nearby area', icon: MapPin, enabled: true },
  { id: 'long-distance', label: 'Long-Distance Moving', description: 'Between cities — route confirmed on enquiry', icon: Route, enabled: true },
  { id: 'packing', label: 'Packing Assistance', description: 'Packing and/or unpacking only', icon: Package, enabled: true },
  { id: 'other', label: 'Other Requirements', description: 'Something that does not fit the options above', icon: Sparkles, enabled: true },
];

export const enabledMoveTypes = moveTypes.filter((m) => m.enabled);

export const moveTypeLabel = (id: MoveType | '' | undefined) =>
  moveTypes.find((m) => m.id === id)?.label ?? '';

export const homeSizes = [
  { id: 'studio', label: 'Studio / 1 RK' },
  { id: '1bhk', label: '1 BHK' },
  { id: '2bhk', label: '2 BHK' },
  { id: '3bhk', label: '3 BHK' },
  { id: '4bhk', label: '4+ BHK' },
  { id: 'other', label: 'Other' },
] as const;

export const workstationRanges = [
  { id: '1-10', label: '1–10' },
  { id: '11-25', label: '11–25' },
  { id: '26-50', label: '26–50' },
  { id: '51-100', label: '51–100' },
  { id: '100+', label: '100+' },
  { id: 'unsure', label: 'Not sure yet' },
] as const;

export const propertyKinds = [
  { id: 'home', label: 'A home' },
  { id: 'office', label: 'An office' },
  { id: 'other', label: 'Something else' },
] as const;

export const packingScopes = [
  { id: 'packing', label: 'Packing' },
  { id: 'unpacking', label: 'Unpacking' },
  { id: 'both', label: 'Both' },
] as const;

export const yesNoUnsure = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
] as const;

export const requirementLabels: Record<string, string> = {
  packing: 'Packing assistance',
  furniture: 'Furniture moving',
  appliances: 'Appliance moving',
  electronics: 'Electronics',
  fragile: 'Fragile items',
  unpacking: 'Unpacking assistance',
  'office-furniture': 'Office furniture',
  'it-equipment': 'Electronics or office equipment',
  documents: 'Documents and files',
  vehicle: 'Vehicle transportation',
  other: 'Other requirements',
};

/** Which requirement checkboxes appear for each move type. */
export const requirementsByType: Record<MoveType, string[]> = {
  home: ['packing', 'furniture', 'appliances', 'electronics', 'fragile', 'unpacking', 'other'],
  office: ['packing', 'office-furniture', 'it-equipment', 'documents', 'unpacking', 'other'],
  local: ['packing', 'furniture', 'appliances', 'electronics', 'unpacking', 'other'],
  'long-distance': ['packing', 'furniture', 'appliances', 'electronics', 'unpacking', 'other'],
  packing: ['fragile', 'electronics', 'furniture', 'other'],
  other: ['packing', 'furniture', 'vehicle', 'other'],
};
