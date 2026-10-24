/**
 * Company details for Sindhu Packers Services.
 *
 * Contact details and GST numbers are supplied by the company. Anything still
 * empty (social links, service areas, testimonials) stays hidden until official
 * information is added — components only render a detail when it is present.
 */

export type SocialLink = {
  label: 'Facebook' | 'Instagram' | 'LinkedIn' | 'YouTube' | 'X';
  href: string;
};

export type PhoneNumber = { display: string; tel: string };

export type Testimonial = {
  /** Only add testimonials the customer has approved for publication. */
  name: string;
  quote: string;
  /** Optional 1–5 rating, only if collected from a verified source. */
  rating?: number;
  moveType?: string;
  /** Optional image path, only with the customer's permission. */
  image?: string;
};

export const site = {
  name: 'Sindhu Packers Services',
  tagline: 'Pack. Move. Settle.',

  contact: {
    /** Office landlines, shown large in the footer. */
    office: [
      { display: '040 24447879', tel: '+914024447879' },
      { display: '8889', tel: '+914024448889' },
    ] as PhoneNumber[],
    customerCare: [
      { display: '+91 89859 53865', tel: '+918985953865' },
      { display: '86859 72865', tel: '+918685972865' },
    ] as PhoneNumber[],
    /** Digits only with country code, e.g. '919876543210'. */
    whatsapp: null as string | null,
    email: 'contact@sindhuparcelservice.com' as string | null,
    supportEmail: 'sindhuparcel1609@gmail.com' as string | null,
    address: 'Plot No. A-91, A-91/2, Pragathi Nagar, Bachupally Road, Hyderabad – 500090' as string | null,
    hours: null as string | null,
  },

  /** GST registrations, shown in the footer. */
  gst: [
    { state: 'TS', number: '36AENFS5057A1ZZ' },
    { state: 'AP', number: '37AENFS5057A1ZX' },
    { state: 'KA', number: '29AENFS5057A1ZU' },
    { state: 'MH', number: '27AENFS5057A1ZY' },
    { state: 'TN', number: '33AENFS5057A1Z5' },
  ] as { state: string; number: string }[],

  social: [] as SocialLink[],

  /**
   * Verified service areas. When empty, the coverage section asks visitors to
   * enquire instead of showing location chips.
   */
  serviceAreas: [] as string[],

  /** Approved customer testimonials. When empty, "What to Expect" is shown. */
  testimonials: [] as Testimonial[],

  /** Where Move Planner enquiries are POSTed as JSON. See .env.example. */
  enquiryEndpoint: (import.meta.env.VITE_ENQUIRY_ENDPOINT ?? '').trim(),

  /** Copyright year shown in the footer. */
  year: new Date().getFullYear(),
} as const;

/** The number to show when only one phone fits. */
export const primaryPhone: PhoneNumber | null = site.contact.office[0] ?? site.contact.customerCare[0] ?? null;

export const hasContactDetails = Boolean(primaryPhone || site.contact.email);
