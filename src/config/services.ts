import type { MoveType } from './planner';

export type IllustrationKey =
  | 'home'
  | 'office'
  | 'local'
  | 'long-distance'
  | 'packing'
  | 'furniture'
  | 'vehicle'
  | 'custom';

export type ServiceAction =
  | { kind: 'section'; target: string }
  | { kind: 'planner'; moveType: MoveType; requirement?: string };

export type Service = {
  id: string;
  title: string;
  summary: string;
  points: string[];
  cta: string;
  action: ServiceAction;
  illustration: IllustrationKey;
  category: 'residential' | 'commercial' | 'other';
  /**
   * Set to false to hide a service everywhere (cards, footer, planner).
   * Only publish services Sindhu Packages Services actually offers.
   */
  enabled: boolean;
  /** Short availability note shown on the card, where one is needed. */
  note?: string;
};

export const services: Service[] = [
  {
    id: 'home-relocation',
    title: 'Home Relocation',
    summary:
      'Enquire about relocating your furniture, appliances and personal belongings from one home to the next.',
    points: ['Apartments and houses', 'Furniture and appliances', 'Everyday essentials'],
    cta: 'Explore Home Moving',
    action: { kind: 'section', target: 'home-relocation' },
    illustration: 'home',
    category: 'residential',
    enabled: true,
  },
  {
    id: 'office-relocation',
    title: 'Office Relocation',
    summary:
      'Enquire about relocating workplace furniture, equipment, documents and other business essentials.',
    points: ['Workstations and seating', 'IT and office equipment', 'Files and storage'],
    cta: 'Explore Office Moving',
    action: { kind: 'section', target: 'office-relocation' },
    illustration: 'office',
    category: 'commercial',
    enabled: true,
  },
  {
    id: 'local-moving',
    title: 'Local Moving',
    summary:
      'Plan a move within your city or to a nearby area, from first carton to final delivery.',
    points: ['Within the city', 'Nearby areas', 'Homes and offices'],
    cta: 'Plan a Local Move',
    action: { kind: 'planner', moveType: 'local' },
    illustration: 'local',
    category: 'other',
    enabled: true,
  },
  {
    id: 'long-distance',
    title: 'Long-Distance Moving',
    summary:
      'Plan a relocation between cities. Share your pickup and destination to check whether your route can be served.',
    points: ['Between cities', 'Route confirmed on enquiry', 'Homes and offices'],
    cta: 'Plan a Long-Distance Move',
    action: { kind: 'planner', moveType: 'long-distance' },
    illustration: 'long-distance',
    category: 'other',
    enabled: true,
    note: 'Route availability is confirmed for each enquiry.',
  },
  {
    id: 'packing',
    title: 'Packing and Unpacking',
    summary:
      'Ask about help packing your belongings before the move and unpacking once you arrive.',
    points: ['Cartons and protective wrapping', 'Fragile items', 'Unpacking at destination'],
    cta: 'Explore Packing Assistance',
    action: { kind: 'planner', moveType: 'packing' },
    illustration: 'packing',
    category: 'other',
    enabled: true,
    note: 'Packing options are confirmed when you discuss your requirements.',
  },
  {
    id: 'furniture',
    title: 'Furniture and Appliance Moving',
    summary:
      'Tell us about the furniture and large appliances you need prepared and moved, so the right arrangements can be discussed.',
    points: ['Sofas, beds and tables', 'Large appliances', 'Preparation for transport'],
    cta: 'Enquire About Furniture Moving',
    action: { kind: 'planner', moveType: 'home', requirement: 'furniture' },
    illustration: 'furniture',
    category: 'residential',
    enabled: true,
  },
  {
    id: 'vehicle',
    title: 'Vehicle Transportation',
    summary:
      'Enquire about transporting a car or two-wheeler as part of your relocation.',
    points: ['Cars and two-wheelers', 'Requirements confirmed on enquiry'],
    cta: 'Enquire About Vehicle Transport',
    action: { kind: 'planner', moveType: 'other', requirement: 'vehicle' },
    illustration: 'vehicle',
    category: 'other',
    // Hidden until the company confirms this service is offered.
    enabled: false,
    note: 'Availability and requirements must be confirmed before booking.',
  },
  {
    id: 'custom',
    title: 'Customized Moving Requirements',
    summary:
      'Have something that does not fit a standard move? Describe it and discuss the options directly.',
    points: ['Unusual items', 'Partial moves', 'Specific timing needs'],
    cta: 'Discuss Your Move',
    action: { kind: 'planner', moveType: 'other' },
    illustration: 'custom',
    category: 'other',
    enabled: true,
  },
];

export const enabledServices = services.filter((s) => s.enabled);
