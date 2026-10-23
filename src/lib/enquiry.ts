import { site } from '../config/site';
import { moveTypeLabel, requirementLabels } from '../config/planner';
import type { PlannerValues } from './plannerSchema';

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string };

export const isEnquiryConfigured = () => site.enquiryEndpoint.length > 0;

/** Builds a readable plain-text summary, used for the payload and as a copy-paste fallback. */
export function summarizeEnquiry(v: PlannerValues): string {
  const lines: [string, string][] = [
    ['Move type', moveTypeLabel(v.moveType as never)],
    ['Home size', v.homeSize],
    ['Moving', v.propertyKind],
    ['Company', v.companyName],
    ['Office size', v.officeSize],
    ['Workstations', v.workstations],
    ['Meeting rooms', v.meetingRooms],
    ['IT equipment', v.itEquipment],
    ['Storage / document areas', v.storageAreas],
    ['Packing scope', v.packingScope],
    ['Requirement', v.description],
    ['Pickup', [v.pickup, v.pickupDetails].filter(Boolean).join(' — ')],
    ['Destination', [v.destination, v.destinationDetails].filter(Boolean).join(' — ')],
    ['Requirements', v.requirements.map((r) => requirementLabels[r] ?? r).join(', ')],
    ['Other requirement', v.otherRequirement],
    ['Additional instructions', v.notes],
    ['Preferred date', v.dateFlexible ? 'Flexible' : v.date],
    [v.moveType === 'office' ? 'Contact person' : 'Name', v.name],
    ['Phone', v.phone],
    ['Email', v.email],
  ];
  return lines
    .filter(([, value]) => value && value.trim())
    .map(([k, value]) => `${k}: ${value}`)
    .join('\n');
}

/**
 * Sends the enquiry to the configured endpoint. Without an endpoint it reports
 * "not-configured" — it never pretends an enquiry was delivered.
 */
export async function submitEnquiry(v: PlannerValues): Promise<SubmitResult> {
  if (!isEnquiryConfigured()) return { status: 'not-configured' };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(site.enquiryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        source: 'website-move-planner',
        submittedAt: new Date().toISOString(),
        summary: summarizeEnquiry(v),
        ...v,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return { status: 'error', message: `The server responded with status ${res.status}.` };
    return { status: 'sent' };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      status: 'error',
      message: aborted ? 'The request timed out.' : 'We could not reach the enquiry service.',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
