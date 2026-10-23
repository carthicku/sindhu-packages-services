export type Faq = { q: string; a: string };

/** Answers describe the enquiry process only. Update them to match company policy. */
export const faqs: Faq[] = [
  {
    q: 'How can I request a quotation?',
    a: 'Use the Move Planner on this page. Tell us what you are moving, where from and to, your requirements and a preferred date. The team reviews these details and contacts you to discuss your move and the quotation.',
  },
  {
    q: 'What details are required for a home-moving enquiry?',
    a: 'The approximate size of your home (for example 1 BHK or 3 BHK), your pickup and destination areas, any packing, furniture or appliance requirements, your preferred date and your contact details. A rough idea is enough to start; details can be refined when you speak with the team.',
  },
  {
    q: 'What details are required for an office relocation?',
    a: 'Your company name, a contact person, the approximate number of workstations, the office size if known, whether there are meeting rooms, IT equipment or storage areas, your current and destination locations, and a preferred moving date.',
  },
  {
    q: 'Can I enquire about local and long-distance moves?',
    a: 'Yes. Choose Local Moving or Long-Distance Moving in the Move Planner and enter your pickup and destination. Availability for your specific route is confirmed after the enquiry is reviewed.',
  },
  {
    q: 'What packing assistance is available?',
    a: 'You can ask about packing, unpacking, or both, and mention fragile items or electronics that need attention. The packing options available for your move are confirmed when you discuss your requirements.',
  },
  {
    q: 'How can I confirm that my destination is covered?',
    a: 'Enter your pickup and destination areas in the “Where Are You Moving To?” section or in the Move Planner. Coverage is confirmed for each enquiry rather than assumed.',
  },
  {
    q: 'Can I request a preferred moving date?',
    a: 'Yes. Add a preferred date in the final step of the Move Planner, or mark your date as flexible. The date is confirmed together with the rest of your arrangements.',
  },
  {
    q: 'What happens after I submit my enquiry?',
    a: 'The team reviews your details, contacts you to clarify anything needed, and confirms the services, arrangements and quotation for your move. Nothing is booked until you have agreed the arrangements.',
  },
];
