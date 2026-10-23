import { z } from 'zod';
import type { MoveType } from '../config/planner';

/**
 * Every field is optional at the object level so the conditional rules in
 * superRefine always run. That lets each planner step validate only its own
 * fields while the rules still depend on the selected move type.
 */
const base = z.object({
  moveType: z.string().default(''),
  homeSize: z.string().default(''),
  propertyKind: z.string().default(''),
  officeSize: z.string().default(''),
  workstations: z.string().default(''),
  meetingRooms: z.string().default(''),
  itEquipment: z.string().default(''),
  storageAreas: z.string().default(''),
  packingScope: z.string().default(''),
  description: z.string().default(''),
  pickup: z.string().default(''),
  destination: z.string().default(''),
  pickupDetails: z.string().default(''),
  destinationDetails: z.string().default(''),
  requirements: z.array(z.string()).default([]),
  otherRequirement: z.string().default(''),
  notes: z.string().default(''),
  date: z.string().default(''),
  dateFlexible: z.boolean().default(false),
  companyName: z.string().default(''),
  name: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  consent: z.boolean().default(false),
});

export type PlannerValues = z.infer<typeof base>;

export const plannerDefaults: PlannerValues = base.parse({});

const PHONE = /^\+?[0-9\s-]{8,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const needsDestination = (t: string) => t !== 'packing' && t !== 'other';

export const plannerSchema = base.superRefine((v, ctx) => {
  const add = (path: keyof PlannerValues, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  const t = v.moveType as MoveType | '';

  // Step 1
  if (!t) add('moveType', 'Choose the type of move you are planning.');

  // Step 2
  if (t === 'home' && !v.homeSize) add('homeSize', 'Select the approximate size of your home.');
  if (t === 'office' && !v.workstations) add('workstations', 'Select an approximate number of workstations.');
  if ((t === 'local' || t === 'long-distance') && !v.propertyKind)
    add('propertyKind', 'Tell us what you are moving.');
  if (t === 'packing' && !v.packingScope) add('packingScope', 'Choose packing, unpacking or both.');
  if (t === 'other' && v.description.trim().length < 10)
    add('description', 'Please describe your requirement in a few words (at least 10 characters).');
  if (v.meetingRooms && !/^\d{1,3}$/.test(v.meetingRooms.trim()))
    add('meetingRooms', 'Enter a number, or leave this blank.');

  // Step 3
  if (v.pickup.trim().length < 2) add('pickup', 'Enter your pickup city or area.');
  if (needsDestination(t) && v.destination.trim().length < 2)
    add('destination', 'Enter your destination city or area.');

  // Step 4
  if (v.requirements.includes('other') && v.otherRequirement.trim().length < 3)
    add('otherRequirement', 'Tell us briefly about the other requirement.');

  // Step 5
  if (!v.dateFlexible) {
    if (!v.date) add('date', 'Choose a preferred date, or mark your date as flexible.');
    else if (v.date < todayISO()) add('date', 'The preferred date cannot be in the past.');
  }
  if (t === 'office' && v.companyName.trim().length < 2)
    add('companyName', 'Enter your company or organization name.');
  if (v.name.trim().length < 2)
    add('name', t === 'office' ? 'Enter the contact person’s name.' : 'Enter your name.');
  if (!PHONE.test(v.phone.trim())) add('phone', 'Enter a valid phone number.');
  if (v.email.trim() && !EMAIL.test(v.email.trim())) add('email', 'Enter a valid email address, or leave it blank.');
  if (!v.consent) add('consent', 'Please confirm you are happy to be contacted about this enquiry.');
});

/** Fields validated when leaving each step (index = step number - 1). */
export const stepFields: (keyof PlannerValues)[][] = [
  ['moveType'],
  ['homeSize', 'workstations', 'propertyKind', 'packingScope', 'description', 'meetingRooms'],
  ['pickup', 'destination'],
  ['otherRequirement'],
  ['date', 'companyName', 'name', 'phone', 'email', 'consent'],
];
